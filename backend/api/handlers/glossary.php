<?php

declare(strict_types=1);

function glossary_resource(): CrudResource
{
    return new CrudResource(
        table: 'glossary_terms',
        allowedFields: ['term', 'slug', 'definition', 'display_letter', 'related_knowledge_content_id', 'publish_status'],
        slugField: 'slug',
    );
}

function glossary_list(array $params): void
{
    [$page, $perPage] = pagination_params(50, 200);
    $filters = [];
    if (!empty($_GET['letter'])) {
        $filters['display_letter'] = strtoupper((string) $_GET['letter']);
    }
    $result = glossary_resource()->listPublished($filters, $page, $perPage, 'term ASC');
    json_success($result['rows'], $result['meta']);
}

function glossary_detail(array $params): void
{
    $term = glossary_resource()->findPublishedBySlug($params['slug']);
    if (!$term) {
        json_error('not_found', 'Term not found.', 404);
    }

    if ($term['related_knowledge_content_id']) {
        $stmt = db()->prepare('SELECT id, title, slug FROM knowledge_content WHERE id = ? AND publish_status = "published"');
        $stmt->execute([$term['related_knowledge_content_id']]);
        $term['related_knowledge'] = $stmt->fetch() ?: null;
    } else {
        $term['related_knowledge'] = null;
    }

    $term['related'] = knowledge_relationships_for('glossary_term', (int) $term['id']);

    json_success($term);
}
