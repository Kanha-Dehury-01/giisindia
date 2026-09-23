<?php

declare(strict_types=1);

function testimonials_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $resource = new CrudResource('testimonials', []);
    $result = $resource->listPublished([], $page, $perPage, 'display_order ASC, id DESC');
    json_success($result['rows'], $result['meta']);
}

function team_list(array $params): void
{
    [$page, $perPage] = pagination_params(50, 100);
    $filters = [];
    if (!empty($_GET['category'])) {
        $filters['category'] = $_GET['category'];
    }
    $resource = new CrudResource('team_members', []);
    $result = $resource->listPublished($filters, $page, $perPage, 'display_order ASC, id ASC');
    json_success($result['rows'], $result['meta']);
}

function faqs_list(array $params): void
{
    [$page, $perPage] = pagination_params(100, 200);
    $filters = [];
    if (!empty($_GET['category'])) {
        $filters['category'] = $_GET['category'];
    }
    $resource = new CrudResource('faqs', []);
    $result = $resource->listPublished($filters, $page, $perPage, 'display_order ASC, id ASC');
    json_success($result['rows'], $result['meta']);
}

function events_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $filters = [];
    if (!empty($_GET['type'])) {
        $filters['type'] = $_GET['type'];
    }
    $resource = new CrudResource('events', []);
    $result = $resource->listPublished($filters, $page, $perPage, 'start_date ASC');
    json_success($result['rows'], $result['meta']);
}

function resources_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $resource = new CrudResource('resources', []);
    $result = $resource->listPublished([], $page, $perPage, 'id DESC');
    json_success($result['rows'], $result['meta']);
}

/** Only a curated, non-sensitive subset of site_settings is ever public (contact/social info). */
function site_settings_public(array $params): void
{
    $allowedGroups = ['contact', 'social'];
    $placeholders = implode(',', array_fill(0, count($allowedGroups), '?'));
    $stmt = db()->prepare("SELECT `key`, value, type FROM site_settings WHERE `group` IN ($placeholders)");
    $stmt->execute($allowedGroups);
    json_success($stmt->fetchAll());
}
