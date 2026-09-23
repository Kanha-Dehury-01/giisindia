<?php

declare(strict_types=1);

const ENQUIRY_FIELDS = ['name', 'phone', 'email', 'course_id', 'city', 'preferred_contact_method', 'message', 'source_page'];

/** Public: the site's single conversion action (spec §7 — never "Buy Now", always "Enquire"). */
function enquiries_create(array $params): void
{
    rate_limit('enquiry_submit', 10, 600);

    $body = read_json_body();
    $v = new Validator($body);
    $v->required('name', 'Name')->maxLength('name', 150, 'Name')
        ->required('phone', 'Phone number')->maxLength('phone', 30, 'Phone number')
        ->email('email', 'Email')
        ->in('preferred_contact_method', ['phone', 'email', 'whatsapp'], 'Preferred contact method');
    if ($v->fails()) {
        validation_fail($v->errors());
    }

    $data = only($body, ENQUIRY_FIELDS);
    $data['preferred_contact_method'] = $data['preferred_contact_method'] ?? 'phone';

    $columns = array_keys($data);
    $stmt = db()->prepare(
        'INSERT INTO enquiries (' . implode(', ', $columns) . ') VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')'
    );
    $stmt->execute(array_values($data));

    json_success(['id' => (int) db()->lastInsertId()], null);
}

function admin_enquiries_list(array $params): void
{
    require_permission('enquiries.view');
    [$page, $perPage] = pagination_params();
    $filters = [];
    if (!empty($_GET['status'])) {
        $filters['status'] = $_GET['status'];
    }

    $resource = new CrudResource('enquiries', []);
    $result = $resource->adminList($filters, $page, $perPage, 'created_at DESC');
    json_success($result['rows'], $result['meta']);
}

function admin_enquiries_update(array $params): void
{
    $user = require_permission('enquiries.update_status');
    $id = require_route_id($params);

    $body = read_json_body();
    $v = new Validator($body);
    $v->in('status', ['new', 'contacted', 'follow_up', 'converted', 'closed'], 'Status');
    if ($v->fails()) {
        validation_fail($v->errors());
    }

    $resource = new CrudResource('enquiries', ['status']);
    $updated = $resource->update($id, $body);
    if (!$updated) {
        json_error('not_found', 'Enquiry not found.', 404);
    }
    write_audit_log((int) $user['id'], 'enquiry.update_status', 'enquiry', $id, ['status' => $body['status'] ?? null]);

    json_success($updated);
}
