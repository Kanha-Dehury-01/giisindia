<?php

declare(strict_types=1);

function certifications_resource(): CrudResource
{
    return new CrudResource(
        table: 'certifications',
        allowedFields: [
            'name', 'slug', 'short_description', 'body', 'level', 'domain', 'prerequisites',
            'skills', 'career_relevance', 'related_course_id', 'publish_status',
        ],
        slugField: 'slug',
    );
}

function certifications_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $filters = [];
    foreach (['level', 'domain'] as $field) {
        if (!empty($_GET[$field])) {
            $filters[$field] = $_GET[$field];
        }
    }
    $result = certifications_resource()->listPublished($filters, $page, $perPage, 'name ASC');
    json_success($result['rows'], $result['meta']);
}

function certifications_detail(array $params): void
{
    $cert = certifications_resource()->findPublishedBySlug($params['slug']);
    if (!$cert) {
        json_error('not_found', 'Certification not found.', 404);
    }
    $id = (int) $cert['id'];

    $careers = db()->prepare(
        'SELECT c.id, c.title, c.slug FROM careers c
         JOIN career_certification_links l ON l.career_id = c.id
         WHERE l.certification_id = ? AND c.publish_status = "published"'
    );
    $careers->execute([$id]);
    $cert['related_careers'] = $careers->fetchAll();

    if ($cert['related_course_id']) {
        $course = db()->prepare('SELECT id, title, slug FROM courses WHERE id = ? AND publish_status = "published"');
        $course->execute([$cert['related_course_id']]);
        $cert['related_course'] = $course->fetch() ?: null;
    } else {
        $cert['related_course'] = null;
    }

    json_success($cert);
}
