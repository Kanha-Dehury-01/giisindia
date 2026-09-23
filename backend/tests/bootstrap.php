<?php

declare(strict_types=1);

/**
 * PHPUnit bootstrap. Points the app at a dedicated `giisindia_test`
 * database (schema-only, no seed data — each test creates its own
 * fixtures) instead of the dev database from .env, so running the suite
 * never touches or depends on dev/admin data.
 *
 * Only DB_NAME/DB_HOST are overridden here — DB_USER/DB_PASSWORD are left
 * alone so the suite reuses whatever credentials are already in your real
 * .env (the same ones the app itself connects with), rather than this
 * file hardcoding a username/password of its own. putenv() here runs
 * before config.php's env loader, which only sets a key from .env if it
 * isn't already set (see config/config.php) — so DB_NAME/DB_HOST below
 * win, and DB_USER/DB_PASSWORD fall through to .env as normal.
 *
 * That user needs a real MySQL account capable of a TCP connection with a
 * password — a bare `root`@`localhost` typically only allows unix-socket
 * auth (works for the `mysql` CLI, not for PDO over TCP with an empty
 * password) — see README §3.3 for creating a dedicated app DB user.
 */
putenv('APP_ENV=testing');
putenv('DB_NAME=' . (getenv('TEST_DB_NAME') ?: 'giisindia_test'));
putenv('DB_HOST=' . (getenv('TEST_DB_HOST') ?: '127.0.0.1'));

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/validate.php';
require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/crud.php';
