<?php

declare(strict_types=1);

function courses_resource(): CrudResource
{
    return new CrudResource(
        table: 'courses',
        allowedFields: [
            'title', 'slug', 'short_description', 'long_description', 'category_id', 'level',
            'duration_text', 'mode', 'certification_name', 'eligibility', 'is_featured',
            'is_best_seller', 'is_new', 'is_duplicate_suspect', 'display_order',
            'featured_image_id', 'publish_status', 'published_at',
        ],
        slugField: 'slug',
    );
}

function course_categories_list(array $params): void
{
    $rows = db()->query('SELECT id, name, slug, description, display_order FROM course_categories ORDER BY display_order ASC')->fetchAll();
    json_success($rows);
}

function courses_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $filters = [];
    if (!empty($_GET['category'])) {
        $cat = db()->prepare('SELECT id FROM course_categories WHERE slug = ?');
        $cat->execute([$_GET['category']]);
        $filters['category_id'] = $cat->fetchColumn() ?: 0;
    }
    foreach (['level', 'mode'] as $field) {
        if (!empty($_GET[$field])) {
            $filters[$field] = $_GET[$field];
        }
    }
    foreach (['is_featured', 'is_best_seller', 'is_new'] as $flag) {
        if (isset($_GET[$flag])) {
            $filters[$flag] = to_bool($_GET[$flag]) ? 1 : 0;
        }
    }

    $result = courses_resource()->listPublished($filters, $page, $perPage, 'display_order ASC, id ASC');

    if (!empty($_GET['search'])) {
        $needle = mb_strtolower((string) $_GET['search']);
        $result['rows'] = array_values(array_filter(
            $result['rows'],
            fn ($row) => str_contains(mb_strtolower($row['title']), $needle)
                || str_contains(mb_strtolower((string) $row['short_description']), $needle)
        ));
    }

    json_success($result['rows'], $result['meta']);
}

function courses_detail(array $params): void
{
    $resource = courses_resource();
    $course = $resource->findPublishedBySlug($params['slug']);
    if (!$course) {
        json_error('not_found', 'Course not found.', 404);
    }

    $id = (int) $course['id'];
    $course['curriculum'] = $resource->childRows('course_curriculum', 'course_id', $id);
    $course['skills'] = $resource->childRows('course_skills', 'course_id', $id);
    $course['tools'] = $resource->childRows('course_tools', 'course_id', $id);
    $course['learning_outcomes'] = $resource->childRows('course_learning_outcomes', 'course_id', $id);
    $course['faqs'] = $resource->childRows('course_faqs', 'course_id', $id);

    $careers = db()->prepare(
        'SELECT c.id, c.title, c.slug FROM careers c
         JOIN course_career_links l ON l.career_id = c.id
         WHERE l.course_id = ? AND c.publish_status = "published"'
    );
    $careers->execute([$id]);
    $course['related_careers'] = $careers->fetchAll();

    $knowledge = db()->prepare(
        'SELECT k.id, k.title, k.slug, k.content_type FROM knowledge_content k
         JOIN course_knowledge_links l ON l.knowledge_content_id = k.id
         WHERE l.course_id = ? AND k.publish_status = "published"'
    );
    $knowledge->execute([$id]);
    $course['related_knowledge'] = $knowledge->fetchAll();

    json_success($course);
}
