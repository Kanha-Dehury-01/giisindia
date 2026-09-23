<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Single PDO connection per request, prepared-statement-only (no raw
 * query building anywhere in this codebase — docs/ARCHITECTURE.md §M).
 */
function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '3306');
    $name = env('DB_NAME', 'giisindia');
    $user = env('DB_USER', 'root');
    $password = env('DB_PASSWORD', '');

    $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        // Never leak connection details (host/user/password) in the response.
        error_log('DB connection failed: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'data' => null, 'error' => ['code' => 'db_unavailable', 'message' => 'Service temporarily unavailable']]);
        exit;
    }

    return $pdo;
}
