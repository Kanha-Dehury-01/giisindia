<?php

declare(strict_types=1);

function auth_csrf_token(array $params): void
{
    json_success(['csrf_token' => csrf_token()]);
}

function auth_login(array $params): void
{
    rate_limit('auth_login', 8, 300);

    $body = read_json_body();
    $v = new Validator($body);
    $v->required('username', 'Username')->required('password', 'Password');
    if ($v->fails()) {
        validation_fail($v->errors());
    }

    $stmt = db()->prepare(
        'SELECT id, name, email, username, password_hash, role_id, active FROM users WHERE username = ? OR email = ?'
    );
    $stmt->execute([$body['username'], $body['username']]);
    $user = $stmt->fetch();

    if (!$user || !$user['active'] || !verify_password($body['password'], $user['password_hash'])) {
        json_error('invalid_credentials', 'Incorrect username or password.', 401);
    }

    start_secure_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];

    db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
    write_audit_log((int) $user['id'], 'auth.login');

    json_success(['user' => current_user(), 'csrf_token' => csrf_token()]);
}

function auth_logout(array $params): void
{
    $user = current_user();
    start_secure_session();
    if ($user) {
        write_audit_log((int) $user['id'], 'auth.logout');
    }
    $_SESSION = [];
    session_destroy();
    json_success(['loggedOut' => true]);
}

function auth_me(array $params): void
{
    $user = current_user();
    if (!$user) {
        json_success(['user' => null]);
        return;
    }
    json_success(['user' => $user, 'csrf_token' => csrf_token()]);
}
