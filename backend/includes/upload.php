<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/response.php';

/**
 * Secure upload handling (docs/ARCHITECTURE.md §M): MIME sniffed from the
 * actual file content (never the client-declared type or extension),
 * extension allowlist, size cap, regenerated filename (never trust the
 * client's filename), and the uploads directory denies PHP execution via
 * its own .htaccess.
 */

const ALLOWED_MIME_TO_EXT = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/avif' => 'avif',
    'image/svg+xml' => 'svg',
];

function handle_media_upload(array $file): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_error('upload_failed', 'File upload failed.', 400);
    }

    if ($file['size'] > UPLOAD_MAX_BYTES) {
        json_error('file_too_large', 'File exceeds the 5MB limit.', 400);
    }

    // Sniff the real MIME type from file content — finfo, not the
    // client-supplied Content-Type or filename extension.
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!isset(ALLOWED_MIME_TO_EXT[$mimeType])) {
        json_error('unsupported_file_type', 'Only JPEG, PNG, WebP, AVIF, and SVG images are supported.', 400);
    }

    // SVGs can carry <script>/onload payloads, embedded HTML, or external
    // references — reject anything beyond plain vector markup before it
    // ever touches disk.
    if ($mimeType === 'image/svg+xml') {
        $contents = file_get_contents($file['tmp_name']);
        $unsafePattern = '/<script|on\w+\s*=|javascript:|data:text\/html|<iframe|<embed|<object|<foreignObject/i';
        if ($contents === false || preg_match($unsafePattern, $contents)) {
            json_error('unsafe_svg', 'This SVG file cannot be accepted.', 400);
        }
    }

    $ext = ALLOWED_MIME_TO_EXT[$mimeType];
    $safeFilename = bin2hex(random_bytes(16)) . '.' . $ext;
    $destination = UPLOAD_DIR . '/' . $safeFilename;

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        json_error('upload_write_failed', 'Could not save the uploaded file.', 500);
    }

    $dimensions = @getimagesize($destination);

    return [
        'filename' => $safeFilename,
        'original_filename' => basename($file['name']),
        'mime_type' => $mimeType,
        'file_size' => $file['size'],
        'width' => $dimensions[0] ?? null,
        'height' => $dimensions[1] ?? null,
    ];
}
