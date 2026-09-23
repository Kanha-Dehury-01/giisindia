<?php

declare(strict_types=1);

/**
 * Loads environment variables from a .env file at the project root (or
 * backend/.env as a fallback) and exposes them via env(). No third-party
 * dependency — the format is deliberately simple (KEY=VALUE, # comments,
 * no quoting/escaping rules) so this file has no reason to grow.
 */

function load_env_file(string $path): void
{
    if (!is_readable($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

$projectRoot = dirname(__DIR__, 2);
load_env_file($projectRoot . '/.env');
load_env_file(__DIR__ . '/../.env');

function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

define('APP_ENV', env('APP_ENV', 'production'));
define('APP_URL', env('APP_URL', ''));
define('API_URL', env('API_URL', ''));
define('ALLOWED_ORIGINS', array_filter(array_map('trim', explode(',', env('ALLOWED_ORIGINS', '')))));
define('SESSION_NAME', env('SESSION_NAME', 'giisindia_session'));
define('SESSION_SECRET', env('SESSION_SECRET', ''));
define('UPLOAD_DIR', __DIR__ . '/../api/uploads');
define('UPLOAD_MAX_BYTES', 5 * 1024 * 1024); // 5MB

if (APP_ENV === 'development') {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED);
}
