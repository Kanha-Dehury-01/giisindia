<?php

declare(strict_types=1);

/** Super-Admin-only user management. Never reachable by Editors — enforced server-side via roles.manage. */

function admin_users_list(array $params): void
{
    require_permission('users.manage');
    [$page, $perPage] = pagination_params();

    $countStmt = db()->query('SELECT COUNT(*) FROM users');
    $total = (int) $countStmt->fetchColumn();
    $offset = ($page - 1) * $perPage;

    $stmt = db()->prepare(
        'SELECT u.id, u.name, u.email, u.username, u.role_id, r.name AS role_name, u.active, u.last_login_at, u.created_at
         FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.id DESC LIMIT ? OFFSET ?'
    );
    $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    json_success($stmt->fetchAll(), pagination_meta($page, $perPage, $total));
}

function admin_users_create(array $params): void
{
    $admin = require_permission('users.manage');
    $body = read_json_body();

    $v = new Validator($body);
    $v->required('name', 'Name')->required('email', 'Email')->email('email', 'Email')
        ->required('username', 'Username')->required('password', 'Password')
        ->required('role_id', 'Role');
    if ($v->fails()) {
        validation_fail($v->errors());
    }
    if (mb_strlen((string) $body['password']) < 10) {
        validation_fail(['password' => 'Password must be at least 10 characters.']);
    }

    $stmt = db()->prepare('INSERT INTO users (name, email, username, password_hash, role_id) VALUES (?, ?, ?, ?, ?)');
    try {
        $stmt->execute([$body['name'], $body['email'], $body['username'], hash_password($body['password']), (int) $body['role_id']]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            json_error('duplicate', 'That email or username is already in use.', 409);
        }
        throw $e;
    }

    $id = (int) db()->lastInsertId();
    write_audit_log((int) $admin['id'], 'user.create', 'user', $id);

    json_success(['id' => $id]);
}

function admin_users_update(array $params): void
{
    $admin = require_permission('users.manage');
    $id = require_route_id($params);
    $body = read_json_body();

    $fields = [];
    $values = [];
    foreach (['name', 'email', 'username', 'role_id', 'active'] as $field) {
        if (array_key_exists($field, $body)) {
            $fields[] = "`$field` = ?";
            $values[] = $field === 'active' ? (to_bool($body[$field]) ? 1 : 0) : $body[$field];
        }
    }
    if (!empty($body['password'])) {
        if (mb_strlen((string) $body['password']) < 10) {
            validation_fail(['password' => 'Password must be at least 10 characters.']);
        }
        $fields[] = '`password_hash` = ?';
        $values[] = hash_password($body['password']);
    }

    if (empty($fields)) {
        json_error('no_fields', 'No valid fields were supplied.', 422);
    }

    $values[] = $id;
    $stmt = db()->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($values);

    write_audit_log((int) $admin['id'], 'user.update', 'user', $id);

    $get = db()->prepare('SELECT id, name, email, username, role_id, active FROM users WHERE id = ?');
    $get->execute([$id]);
    json_success($get->fetch());
}

function admin_users_delete(array $params): void
{
    $admin = require_permission('users.manage');
    $id = require_route_id($params);

    if ($id === (int) $admin['id']) {
        json_error('cannot_delete_self', 'You cannot delete your own account.', 400);
    }

    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    write_audit_log((int) $admin['id'], 'user.delete', 'user', $id);

    json_success(['deleted' => true]);
}
