<?php

declare(strict_types=1);

function learning_paths_resource(): CrudResource
{
    return new CrudResource(
        table: 'learning_paths',
        allowedFields: ['title', 'slug', 'description', 'target_audience', 'publish_status'],
        slugField: 'slug',
    );
}

function learning_paths_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $result = learning_paths_resource()->listPublished([], $page, $perPage, 'title ASC');
    json_success($result['rows'], $result['meta']);
}

function learning_paths_detail(array $params): void
{
    $resource = learning_paths_resource();
    $path = $resource->findPublishedBySlug($params['slug']);
    if (!$path) {
        json_error('not_found', 'Learning path not found.', 404);
    }
    $id = (int) $path['id'];

    $stmt = db()->prepare(
        'SELECT s.id, s.step_title, s.step_description, s.step_type, s.display_order,
                c.slug AS related_course_slug, c.title AS related_course_title,
                k.slug AS related_knowledge_slug, k.title AS related_knowledge_title
         FROM learning_path_steps s
         LEFT JOIN courses c ON c.id = s.related_course_id
         LEFT JOIN knowledge_content k ON k.id = s.related_knowledge_content_id
         WHERE s.learning_path_id = ? ORDER BY s.display_order ASC'
    );
    $stmt->execute([$id]);
    $path['steps'] = $stmt->fetchAll();

    json_success($path);
}
