<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/response.php';

/**
 * Session, CSRF, RBAC, and password hashing. RBAC is enforced ONLY here,
 * server-side, on every admin handler — the React admin UI hiding a
 * button is a UX convenience, never the security boundary
 * (docs/ARCHITECTURE.md §F/§M).
 */

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // Reject any session ID the client supplies that the server never
    // generated (session fixation defense), and never accept a session ID
    // from the URL/query string — cookie only.
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');

    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => (($_SERVER['HTTPS'] ?? '') !== '') || APP_ENV !== 'development',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function current_user(): ?array
{
    start_secure_session();
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $stmt = db()->prepare(
        'SELECT u.id, u.name, u.email, u.username, u.role_id, r.name AS role_name, r.slug AS role_slug
         FROM users u JOIN roles r ON r.id = u.role_id
         WHERE u.id = ? AND u.active = 1'
    );
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        session_destroy();
        return null;
    }

    $permStmt = db()->prepare(
        'SELECT p.slug FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id WHERE rp.role_id = ?'
    );
    $permStmt->execute([$user['role_id']]);
    $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN);

    $cached = $user;
    return $user;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        json_error('unauthenticated', 'Sign in to continue.', 401);
    }
    return $user;
}

function require_permission(string $permissionSlug): array
{
    $user = require_auth();
    if (!in_array($permissionSlug, $user['permissions'], true)) {
        json_error('forbidden', 'You do not have permission to perform this action.', 403);
    }
    return $user;
}

function csrf_token(): string
{
    start_secure_session();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    // Also mirrored to a readable cookie so the SPA can attach it as a
    // header without an extra round trip (double-submit cookie pattern).
    setcookie('csrf_token', $_SESSION['csrf_token'], [
        'path' => '/',
        'secure' => APP_ENV !== 'development',
        'httponly' => false,
        'samesite' => 'Lax',
    ]);
    return $_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    start_secure_session();
    $sessionToken = $_SESSION['csrf_token'] ?? null;
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

    if (!$sessionToken || !$headerToken || !hash_equals($sessionToken, $headerToken)) {
        json_error('csrf_mismatch', 'Your session has expired. Please refresh and try again.', 403);
    }
}

function hash_password(string $plain): string
{
    return password_hash($plain, PASSWORD_BCRYPT);
}

function verify_password(string $plain, string $hash): bool
{
    return password_verify($plain, $hash);
}

function write_audit_log(?int $userId, string $action, ?string $entityType = null, ?int $entityId = null, ?array $meta = null): void
{
    $stmt = db()->prepare(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, meta_json, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $action, $entityType, $entityId, $meta ? json_encode($meta) : null, client_ip()]);
}
