<?php

declare(strict_types=1);

/**
 * Every endpoint responds through these — the envelope shape is fixed
 * (docs/ARCHITECTURE.md §D) so the frontend's api/client.js never has to
 * special-case one handler's response format against another's.
 */

function json_success(mixed $data, ?array $meta = null): void
{
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => $data, 'error' => null, 'meta' => $meta], JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $code, string $message, int $statusCode = 400): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'data' => null, 'error' => ['code' => $code, 'message' => $message], 'meta' => null], JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_error('invalid_json', 'Request body must be valid JSON.', 400);
    }
    return $decoded;
}
