<?php

declare(strict_types=1);

require_once __DIR__ . '/knowledge.php';

function admin_knowledge_list(array $params): void
{
    require_permission('knowledge.manage');
    [$page, $perPage] = pagination_params();
    $filters = [];
    foreach (['content_type', 'difficulty', 'publish_status'] as $field) {
        if (!empty($_GET[$field])) {
            $filters[$field] = $_GET[$field];
        }
    }
    $result = knowledge_resource()->adminList($filters, $page, $perPage, 'updated_at DESC');
    json_success($result['rows'], $result['meta']);
}

function admin_knowledge_get(array $params): void
{
    require_permission('knowledge.manage');
    $id = require_route_id($params);
    $resource = knowledge_resource();
    $entry = $resource->find($id);
    if (!$entry) {
        json_error('not_found', 'Content not found.', 404);
    }
    $tags = db()->prepare(
        'SELECT t.id, t.name, t.slug FROM knowledge_tags t
         JOIN knowledge_content_tags ct ON ct.tag_id = t.id WHERE ct.knowledge_content_id = ?'
    );
    $tags->execute([$id]);
    $entry['tags'] = $tags->fetchAll();
    json_success($entry);
}

function admin_knowledge_create(array $params): void
{
    $user = require_permission('knowledge.manage');
    $body = read_json_body();

    $v = new Validator($body);
    $v->required('title', 'Title')->maxLength('title', 250, 'Title')
        ->required('content_type', 'Content type')
        ->in('content_type', ['fundamental', 'domain', 'technology', 'guide', 'resource'], 'Content type')
        ->in('difficulty', ['beginner', 'intermediate', 'advanced'], 'Difficulty')
        ->in('publish_status', ['draft', 'published'], 'Status');
    if ($v->fails()) {
        validation_fail($v->errors());
    }
    if (isset($body['publish_status']) && $body['publish_status'] === 'published') {
        require_permission('knowledge.manage');
    }

    $entry = knowledge_resource()->create($body);
    knowledge_sync_tags((int) $entry['id'], $body['tag_ids'] ?? null);

    write_audit_log((int) $user['id'], 'knowledge.create', 'knowledge_content', $entry['id']);
    json_success($entry);
}

function admin_knowledge_update(array $params): void
{
    $user = require_permission('knowledge.manage');
    $id = require_route_id($params);
    $body = read_json_body();

    $updated = knowledge_resource()->update($id, $body);
    if (!$updated) {
        json_error('not_found', 'Content not found.', 404);
    }
    if (array_key_exists('tag_ids', $body)) {
        knowledge_sync_tags($id, $body['tag_ids']);
    }

    write_audit_log((int) $user['id'], 'knowledge.update', 'knowledge_content', $id);
    json_success($updated);
}

function admin_knowledge_delete(array $params): void
{
    $user = require_permission('knowledge.delete');
    $id = require_route_id($params);

    if (!knowledge_resource()->delete($id)) {
        json_error('not_found', 'Content not found.', 404);
    }
    write_audit_log((int) $user['id'], 'knowledge.delete', 'knowledge_content', $id);

    json_success(['deleted' => true]);
}

function knowledge_sync_tags(int $knowledgeId, ?array $tagIds): void
{
    if ($tagIds === null) {
        return;
    }
    $pdo = db();
    $pdo->prepare('DELETE FROM knowledge_content_tags WHERE knowledge_content_id = ?')->execute([$knowledgeId]);
    if (!$tagIds) {
        return;
    }
    $stmt = $pdo->prepare('INSERT IGNORE INTO knowledge_content_tags (knowledge_content_id, tag_id) VALUES (?, ?)');
    foreach ($tagIds as $tagId) {
        $stmt->execute([$knowledgeId, (int) $tagId]);
    }
}
