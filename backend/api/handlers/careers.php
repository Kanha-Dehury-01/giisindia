<?php

declare(strict_types=1);

function careers_resource(): CrudResource
{
    return new CrudResource(
        table: 'careers',
        allowedFields: [
            'title', 'slug', 'description', 'beginner_skills', 'intermediate_skills',
            'advanced_skills', 'tools', 'roadmap_summary', 'career_progression', 'publish_status',
        ],
        slugField: 'slug',
    );
}

function careers_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $result = careers_resource()->listPublished([], $page, $perPage, 'title ASC');
    json_success($result['rows'], $result['meta']);
}

function careers_detail(array $params): void
{
    $career = careers_resource()->findPublishedBySlug($params['slug']);
    if (!$career) {
        json_error('not_found', 'Career not found.', 404);
    }
    $id = (int) $career['id'];

    $certs = db()->prepare(
        'SELECT c.id, c.name, c.slug, c.level FROM certifications c
         JOIN career_certification_links l ON l.certification_id = c.id
         WHERE l.career_id = ? AND c.publish_status = "published"'
    );
    $certs->execute([$id]);
    $career['related_certifications'] = $certs->fetchAll();

    $courses = db()->prepare(
        'SELECT co.id, co.title, co.slug FROM courses co
         JOIN course_career_links l ON l.course_id = co.id
         WHERE l.career_id = ? AND co.publish_status = "published"'
    );
    $courses->execute([$id]);
    $career['related_courses'] = $courses->fetchAll();

    $career['related'] = knowledge_relationships_for('career', $id);

    json_success($career);
}
