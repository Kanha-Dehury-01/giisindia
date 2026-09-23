<?php

declare(strict_types=1);

require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/helpers.php';

/**
 * File-based fixed-window rate limiter — no Redis/Memcached dependency,
 * so it works unmodified on a shared cPanel host (docs/ARCHITECTURE.md
 * §M requires rate limiting on auth; this also covers the public
 * enquiry form against spam). State lives outside the webroot-served
 * uploads dir and is git-ignored.
 */
function rate_limit(string $bucket, int $maxAttempts, int $windowSeconds): void
{
    $dir = __DIR__ . '/../../storage/ratelimit';
    if (!is_dir($dir)) {
        mkdir($dir, 0700, true);
    }

    $key = hash('sha256', $bucket . '|' . client_ip());
    $file = "$dir/$key.json";

    $now = time();
    $state = ['count' => 0, 'window_start' => $now];

    if (is_readable($file)) {
        $decoded = json_decode((string) file_get_contents($file), true);
        if (is_array($decoded) && ($now - ($decoded['window_start'] ?? 0)) < $windowSeconds) {
            $state = $decoded;
        }
    }

    $state['count']++;

    if ($state['count'] > $maxAttempts) {
        $retryAfter = $windowSeconds - ($now - $state['window_start']);
        header('Retry-After: ' . max(1, $retryAfter));
        json_error('rate_limited', 'Too many attempts. Please try again shortly.', 429);
    }

    file_put_contents($file, json_encode($state), LOCK_EX);
}
