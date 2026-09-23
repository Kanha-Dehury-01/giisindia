<?php

declare(strict_types=1);

require_once __DIR__ . '/courses.php';

/** Publishing (not just editing) is a separate permission — Editors can draft but the seed grants them courses.publish too; Super Admin always can. */
function guard_publish_status(array $body, string $publishPermission): void
{
    if (isset($body['publish_status']) && $body['publish_status'] === 'published') {
        require_permission($publishPermission);
    }
}

function admin_courses_list(array $params): void
{
    require_permission('courses.manage');
    [$page, $perPage] = pagination_params();
    $filters = [];
    foreach (['category_id', 'level', 'publish_status'] as $field) {
        if (!empty($_GET[$field])) {
            $filters[$field] = $_GET[$field];
        }
    }
    $result = courses_resource()->adminList($filters, $page, $perPage, 'updated_at DESC');
    json_success($result['rows'], $result['meta']);
}

function admin_courses_get(array $params): void
{
    require_permission('courses.manage');
    $id = require_route_id($params);
    $resource = courses_resource();
    $course = $resource->find($id);
    if (!$course) {
        json_error('not_found', 'Course not found.', 404);
    }
    $course['curriculum'] = $resource->childRows('course_curriculum', 'course_id', $id);
    $course['skills'] = $resource->childRows('course_skills', 'course_id', $id);
    $course['tools'] = $resource->childRows('course_tools', 'course_id', $id);
    $course['learning_outcomes'] = $resource->childRows('course_learning_outcomes', 'course_id', $id);
    $course['faqs'] = $resource->childRows('course_faqs', 'course_id', $id);
    json_success($course);
}

function admin_courses_create(array $params): void
{
    $user = require_permission('courses.manage');
    $body = read_json_body();

    $v = new Validator($body);
    $v->required('title', 'Title')->maxLength('title', 200, 'Title')
        ->in('level', ['beginner', 'intermediate', 'advanced'], 'Level')
        ->in('mode', ['classroom', 'hybrid'], 'Mode')
        ->in('publish_status', ['draft', 'published'], 'Status');
    if ($v->fails()) {
        validation_fail($v->errors());
    }
    guard_publish_status($body, 'courses.publish');

    $course = courses_resource()->create($body);
    write_audit_log((int) $user['id'], 'course.create', 'course', $course['id']);

    json_success($course);
}

function admin_courses_update(array $params): void
{
    $user = require_permission('courses.manage');
    $id = require_route_id($params);
    $body = read_json_body();
    guard_publish_status($body, 'courses.publish');

    $updated = courses_resource()->update($id, $body);
    if (!$updated) {
        json_error('not_found', 'Course not found.', 404);
    }
    write_audit_log((int) $user['id'], 'course.update', 'course', $id);

    json_success($updated);
}

function admin_courses_delete(array $params): void
{
    $user = require_permission('courses.delete');
    $id = require_route_id($params);

    if (!courses_resource()->delete($id)) {
        json_error('not_found', 'Course not found.', 404);
    }
    write_audit_log((int) $user['id'], 'course.delete', 'course', $id);

    json_success(['deleted' => true]);
}

/** Replaces a course's curriculum/skills/tools/outcomes/faqs child rows in one call. */
function admin_courses_update_children(array $params): void
{
    $user = require_permission('courses.manage');
    $id = require_route_id($params);
    $resource = courses_resource();
    if (!$resource->find($id)) {
        json_error('not_found', 'Course not found.', 404);
    }

    $body = read_json_body();
    $childMap = [
        'curriculum' => ['course_curriculum', ['module_title', 'module_description', 'display_order']],
        'skills' => ['course_skills', ['skill_name', 'display_order']],
        'tools' => ['course_tools', ['tool_name', 'display_order']],
        'learning_outcomes' => ['course_learning_outcomes', ['outcome', 'display_order']],
        'faqs' => ['course_faqs', ['question', 'answer', 'display_order']],
    ];

    foreach ($childMap as $key => [$table, $fields]) {
        if (isset($body[$key]) && is_array($body[$key])) {
            $resource->replaceChildRows($table, 'course_id', $id, $body[$key], $fields);
        }
    }

    write_audit_log((int) $user['id'], 'course.update_children', 'course', $id);

    $course = $resource->find($id);
    $course['curriculum'] = $resource->childRows('course_curriculum', 'course_id', $id);
    $course['skills'] = $resource->childRows('course_skills', 'course_id', $id);
    $course['tools'] = $resource->childRows('course_tools', 'course_id', $id);
    $course['learning_outcomes'] = $resource->childRows('course_learning_outcomes', 'course_id', $id);
    $course['faqs'] = $resource->childRows('course_faqs', 'course_id', $id);
    json_success($course);
}

function admin_course_categories_list(array $params): void
{
    require_permission('courses.manage');
    json_success(db()->query('SELECT * FROM course_categories ORDER BY display_order ASC')->fetchAll());
}

function admin_course_categories_create(array $params): void
{
    $user = require_permission('courses.manage');
    $body = read_json_body();
    $v = new Validator($body);
    $v->required('name', 'Name');
    if ($v->fails()) {
        validation_fail($v->errors());
    }

    $resource = new CrudResource('course_categories', ['name', 'slug', 'description', 'display_order'], hasPublishStatus: false, slugField: 'slug');
    $category = $resource->create($body);
    write_audit_log((int) $user['id'], 'course_category.create', 'course_category', $category['id']);

    json_success($category);
}

function admin_course_categories_update(array $params): void
{
    $user = require_permission('courses.manage');
    $id = require_route_id($params);
    $body = read_json_body();

    $resource = new CrudResource('course_categories', ['name', 'slug', 'description', 'display_order'], hasPublishStatus: false, slugField: 'slug');
    $updated = $resource->update($id, $body);
    if (!$updated) {
        json_error('not_found', 'Category not found.', 404);
    }
    write_audit_log((int) $user['id'], 'course_category.update', 'course_category', $id);

    json_success($updated);
}

function admin_course_categories_delete(array $params): void
{
    $user = require_permission('courses.delete');
    $id = require_route_id($params);

    $resource = new CrudResource('course_categories', [], hasPublishStatus: false);
    if (!$resource->delete($id)) {
        json_error('not_found', 'Category not found.', 404);
    }
    write_audit_log((int) $user['id'], 'course_category.delete', 'course_category', $id);

    json_success(['deleted' => true]);
}
