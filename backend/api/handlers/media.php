<?php

declare(strict_types=1);

require_once __DIR__ . '/../../includes/upload.php';

function admin_media_list(array $params): void
{
    require_permission('media.upload');
    [$page, $perPage] = pagination_params(40, 100);
    $filters = [];
    if (!empty($_GET['category'])) {
        $filters['category'] = $_GET['category'];
    }

    $resource = new CrudResource('media', [], hasPublishStatus: false);
    $result = $resource->adminList($filters, $page, $perPage, 'created_at DESC');
    json_success($result['rows'], $result['meta']);
}

function admin_media_upload(array $params): void
{
    $user = require_permission('media.upload');

    if (empty($_FILES['file'])) {
        json_error('no_file', 'No file was uploaded.', 400);
    }

    $meta = handle_media_upload($_FILES['file']);

    $stmt = db()->prepare(
        'INSERT INTO media (filename, original_filename, path, mime_type, file_size, width, height, alt_text, caption, category, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $meta['filename'],
        $meta['original_filename'],
        '/api/uploads/' . $meta['filename'],
        $meta['mime_type'],
        $meta['file_size'],
        $meta['width'],
        $meta['height'],
        $_POST['alt_text'] ?? null,
        $_POST['caption'] ?? null,
        $_POST['category'] ?? null,
        $user['id'],
    ]);

    $id = (int) db()->lastInsertId();
    write_audit_log((int) $user['id'], 'media.upload', 'media', $id);

    $resource = new CrudResource('media', [], hasPublishStatus: false);
    json_success($resource->find($id));
}

function admin_media_update(array $params): void
{
    $user = require_permission('media.upload');
    $id = require_route_id($params);

    $body = read_json_body();
    $resource = new CrudResource('media', ['alt_text', 'caption', 'category'], hasPublishStatus: false);
    $updated = $resource->update($id, $body);
    if (!$updated) {
        json_error('not_found', 'Media not found.', 404);
    }
    write_audit_log((int) $user['id'], 'media.update', 'media', $id);

    json_success($updated);
}

function admin_media_delete(array $params): void
{
    $user = require_permission('media.upload');
    $id = require_route_id($params);

    $resource = new CrudResource('media', [], hasPublishStatus: false);
    $row = $resource->find($id);
    if (!$row) {
        json_error('not_found', 'Media not found.', 404);
    }

    $filePath = UPLOAD_DIR . '/' . $row['filename'];
    if (is_file($filePath)) {
        unlink($filePath);
    }

    $resource->delete($id);
    write_audit_log((int) $user['id'], 'media.delete', 'media', $id);

    json_success(['deleted' => true]);
}
