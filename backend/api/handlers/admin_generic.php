<?php

declare(strict_types=1);

/**
 * Admin CRUD for the resources plain enough not to need their own handler
 * file (careers, learning paths, certifications, glossary, testimonials,
 * team, faqs, events, resources, statistics, site settings, redirects,
 * SEO metadata, audit log). Each resource's shape lives in
 * generic_resource_config(); the six admin_* wrapper functions per
 * resource just bind that config to a permission and an audit-log entity
 * name, so every one of them shares the identical validated,
 * server-side-RBAC-enforced path through CrudResource.
 */
function generic_resource_config(string $key): array
{
    $configs = [
        'careers' => [
            'table' => 'careers',
            'fields' => ['title', 'slug', 'description', 'beginner_skills', 'intermediate_skills', 'advanced_skills', 'tools', 'roadmap_summary', 'career_progression', 'publish_status'],
            'slugField' => 'slug',
            'orderBy' => 'updated_at DESC',
            'permission' => 'knowledge.manage',
        ],
        'learning_paths' => [
            'table' => 'learning_paths',
            'fields' => ['title', 'slug', 'description', 'target_audience', 'publish_status'],
            'slugField' => 'slug',
            'orderBy' => 'updated_at DESC',
            'permission' => 'knowledge.manage',
        ],
        'certifications' => [
            'table' => 'certifications',
            'fields' => ['name', 'slug', 'short_description', 'body', 'level', 'domain', 'prerequisites', 'skills', 'career_relevance', 'related_course_id', 'publish_status'],
            'slugField' => 'slug',
            'orderBy' => 'updated_at DESC',
            'permission' => 'knowledge.manage',
        ],
        'glossary' => [
            'table' => 'glossary_terms',
            'fields' => ['term', 'slug', 'definition', 'display_letter', 'related_knowledge_content_id', 'publish_status'],
            'slugField' => 'slug',
            'orderBy' => 'updated_at DESC',
            'permission' => 'knowledge.manage',
        ],
        'testimonials' => [
            'table' => 'testimonials',
            'fields' => ['quote', 'student_name', 'course_id', 'batch_year', 'designation', 'photo_media_id', 'display_order', 'publish_status'],
            'orderBy' => 'display_order ASC, id DESC',
            'permission' => 'testimonials.manage',
        ],
        'team' => [
            'table' => 'team_members',
            'fields' => ['name', 'designation', 'category', 'photo_media_id', 'biography', 'expertise', 'certifications', 'experience_years', 'social_link', 'display_order', 'publish_status'],
            'orderBy' => 'display_order ASC, id ASC',
            'permission' => 'testimonials.manage',
        ],
        'faqs' => [
            'table' => 'faqs',
            'fields' => ['question', 'answer', 'category', 'display_order', 'publish_status'],
            'orderBy' => 'display_order ASC, id ASC',
            'permission' => 'faqs.manage',
        ],
        'events' => [
            'table' => 'events',
            'fields' => ['title', 'slug', 'type', 'description', 'start_date', 'end_date', 'location', 'is_online', 'registration_link', 'featured_image_id', 'publish_status'],
            'slugField' => 'slug',
            'orderBy' => 'start_date DESC',
            'permission' => 'events.manage',
        ],
        'resources' => [
            'table' => 'resources',
            'fields' => ['title', 'slug', 'type', 'description', 'file_media_id', 'external_link', 'publish_status'],
            'slugField' => 'slug',
            'orderBy' => 'id DESC',
            'permission' => 'events.manage',
        ],
    ];

    if (!isset($configs[$key])) {
        throw new InvalidArgumentException("Unknown generic resource: $key");
    }
    return $configs[$key];
}

function generic_resource(string $key): CrudResource
{
    $cfg = generic_resource_config($key);
    return new CrudResource($cfg['table'], $cfg['fields'], slugField: $cfg['slugField'] ?? null);
}

function generic_list(string $key): void
{
    $cfg = generic_resource_config($key);
    require_permission($cfg['permission']);
    [$page, $perPage] = pagination_params();
    $filters = [];
    if (!empty($_GET['publish_status'])) {
        $filters['publish_status'] = $_GET['publish_status'];
    }
    $result = generic_resource($key)->adminList($filters, $page, $perPage, $cfg['orderBy']);
    json_success($result['rows'], $result['meta']);
}

function generic_create(string $key): array
{
    $cfg = generic_resource_config($key);
    $user = require_permission($cfg['permission']);
    $body = read_json_body();
    $row = generic_resource($key)->create($body);
    write_audit_log((int) $user['id'], "$key.create", $key, $row['id']);
    return $row;
}

function generic_update(string $key, int $id): ?array
{
    $cfg = generic_resource_config($key);
    $user = require_permission($cfg['permission']);
    $body = read_json_body();
    $row = generic_resource($key)->update($id, $body);
    if ($row) {
        write_audit_log((int) $user['id'], "$key.update", $key, $id);
    }
    return $row;
}

function generic_delete(string $key, int $id): bool
{
    $cfg = generic_resource_config($key);
    $user = require_permission($cfg['permission']);
    $ok = generic_resource($key)->delete($id);
    if ($ok) {
        write_audit_log((int) $user['id'], "$key.delete", $key, $id);
    }
    return $ok;
}

// ---- careers --------------------------------------------------------------
function admin_careers_list(array $p): void { generic_list('careers'); }
function admin_careers_get(array $p): void { require_permission('knowledge.manage'); $row = generic_resource('careers')->find(require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Career not found.', 404); }
function admin_careers_create(array $p): void { json_success(generic_create('careers')); }
function admin_careers_update(array $p): void { $row = generic_update('careers', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Career not found.', 404); }
function admin_careers_delete(array $p): void { generic_delete('careers', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Career not found.', 404); }

// ---- learning paths ---------------------------------------------------------
function admin_learning_paths_list(array $p): void { generic_list('learning_paths'); }
function admin_learning_paths_get(array $p): void {
    require_permission('knowledge.manage');
    $id = require_route_id($p);
    $row = generic_resource('learning_paths')->find($id);
    if (!$row) { json_error('not_found', 'Learning path not found.', 404); }
    $steps = db()->prepare('SELECT * FROM learning_path_steps WHERE learning_path_id = ? ORDER BY display_order ASC');
    $steps->execute([$id]);
    $row['steps'] = $steps->fetchAll();
    json_success($row);
}
function admin_learning_paths_create(array $p): void { json_success(generic_create('learning_paths')); }
function admin_learning_paths_update(array $p): void { $row = generic_update('learning_paths', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Learning path not found.', 404); }
function admin_learning_paths_delete(array $p): void { generic_delete('learning_paths', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Learning path not found.', 404); }

function admin_learning_path_steps_update(array $p): void
{
    $user = require_permission('knowledge.manage');
    $id = require_route_id($p);
    if (!generic_resource('learning_paths')->find($id)) {
        json_error('not_found', 'Learning path not found.', 404);
    }
    $body = read_json_body();
    $steps = is_array($body['steps'] ?? null) ? $body['steps'] : [];

    generic_resource('learning_paths')->replaceChildRows(
        'learning_path_steps',
        'learning_path_id',
        $id,
        $steps,
        ['step_title', 'step_description', 'step_type', 'related_course_id', 'related_knowledge_content_id', 'display_order']
    );
    write_audit_log((int) $user['id'], 'learning_paths.update_steps', 'learning_path', $id);

    $stmt = db()->prepare('SELECT * FROM learning_path_steps WHERE learning_path_id = ? ORDER BY display_order ASC');
    $stmt->execute([$id]);
    json_success($stmt->fetchAll());
}

// ---- certifications ---------------------------------------------------------
function admin_certifications_list(array $p): void { generic_list('certifications'); }
function admin_certifications_get(array $p): void { require_permission('knowledge.manage'); $row = generic_resource('certifications')->find(require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Certification not found.', 404); }
function admin_certifications_create(array $p): void { json_success(generic_create('certifications')); }
function admin_certifications_update(array $p): void { $row = generic_update('certifications', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Certification not found.', 404); }
function admin_certifications_delete(array $p): void { generic_delete('certifications', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Certification not found.', 404); }

// ---- glossary -----------------------------------------------------------
function admin_glossary_list(array $p): void { generic_list('glossary'); }
function admin_glossary_get(array $p): void { require_permission('knowledge.manage'); $row = generic_resource('glossary')->find(require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Term not found.', 404); }
function admin_glossary_create(array $p): void {
    $body = read_json_body();
    if (!empty($body['term']) && empty($body['display_letter'])) {
        $body['display_letter'] = mb_strtoupper(mb_substr($body['term'], 0, 1));
    }
    $cfg = generic_resource_config('glossary');
    $user = require_permission($cfg['permission']);
    $row = generic_resource('glossary')->create($body);
    write_audit_log((int) $user['id'], 'glossary.create', 'glossary_term', $row['id']);
    json_success($row);
}
function admin_glossary_update(array $p): void { $row = generic_update('glossary', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Term not found.', 404); }
function admin_glossary_delete(array $p): void { generic_delete('glossary', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Term not found.', 404); }

// ---- testimonials ---------------------------------------------------------
function admin_testimonials_list(array $p): void { generic_list('testimonials'); }
function admin_testimonials_create(array $p): void { json_success(generic_create('testimonials')); }
function admin_testimonials_update(array $p): void { $row = generic_update('testimonials', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Testimonial not found.', 404); }
function admin_testimonials_delete(array $p): void { generic_delete('testimonials', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Testimonial not found.', 404); }

// ---- team -----------------------------------------------------------------
function admin_team_list(array $p): void { generic_list('team'); }
function admin_team_create(array $p): void { json_success(generic_create('team')); }
function admin_team_update(array $p): void { $row = generic_update('team', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Team member not found.', 404); }
function admin_team_delete(array $p): void { generic_delete('team', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Team member not found.', 404); }

// ---- faqs -------------------------------------------------------------------
function admin_faqs_list(array $p): void { generic_list('faqs'); }
function admin_faqs_create(array $p): void { json_success(generic_create('faqs')); }
function admin_faqs_update(array $p): void { $row = generic_update('faqs', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'FAQ not found.', 404); }
function admin_faqs_delete(array $p): void { generic_delete('faqs', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'FAQ not found.', 404); }

// ---- events -----------------------------------------------------------------
function admin_events_list(array $p): void { generic_list('events'); }
function admin_events_create(array $p): void { json_success(generic_create('events')); }
function admin_events_update(array $p): void { $row = generic_update('events', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Event not found.', 404); }
function admin_events_delete(array $p): void { generic_delete('events', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Event not found.', 404); }

// ---- resources --------------------------------------------------------------
function admin_resources_list(array $p): void { generic_list('resources'); }
function admin_resources_create(array $p): void { json_success(generic_create('resources')); }
function admin_resources_update(array $p): void { $row = generic_update('resources', require_route_id($p)); $row ? json_success($row) : json_error('not_found', 'Resource not found.', 404); }
function admin_resources_delete(array $p): void { generic_delete('resources', require_route_id($p)) ? json_success(['deleted' => true]) : json_error('not_found', 'Resource not found.', 404); }

// ---- statistics (fixed rows — update only) -----------------------------------
function admin_statistics_list(array $p): void
{
    require_permission('settings.manage');
    json_success(db()->query('SELECT * FROM statistics ORDER BY display_order ASC')->fetchAll());
}
function admin_statistics_update(array $p): void
{
    $user = require_permission('settings.manage');
    $id = require_route_id($p);
    $resource = new CrudResource('statistics', ['label', 'value', 'suffix', 'icon', 'display_order'], hasPublishStatus: false);
    $row = $resource->update($id, read_json_body());
    if (!$row) {
        json_error('not_found', 'Statistic not found.', 404);
    }
    write_audit_log((int) $user['id'], 'statistics.update', 'statistic', $id);
    json_success($row);
}

// ---- site settings (key/value — bulk update, no delete) -----------------------
function admin_site_settings_list(array $p): void
{
    require_permission('settings.manage');
    json_success(db()->query('SELECT * FROM site_settings ORDER BY `group`, `key`')->fetchAll());
}
function admin_site_settings_update(array $p): void
{
    $user = require_permission('settings.manage');
    $body = read_json_body();
    $settings = is_array($body['settings'] ?? null) ? $body['settings'] : [];

    $stmt = db()->prepare(
        'INSERT INTO site_settings (`key`, value, type, `group`) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), type = VALUES(type), `group` = VALUES(`group`)'
    );
    foreach ($settings as $setting) {
        if (empty($setting['key'])) {
            continue;
        }
        $stmt->execute([$setting['key'], $setting['value'] ?? null, $setting['type'] ?? 'text', $setting['group'] ?? null]);
    }
    write_audit_log((int) $user['id'], 'settings.update', 'site_settings', null, ['keys' => array_column($settings, 'key')]);

    json_success(db()->query('SELECT * FROM site_settings ORDER BY `group`, `key`')->fetchAll());
}

// ---- redirects --------------------------------------------------------------
function admin_redirects_list(array $p): void
{
    require_permission('redirects.manage');
    [$page, $perPage] = pagination_params();
    $resource = new CrudResource('redirects', [], hasPublishStatus: false);
    $result = $resource->adminList([], $page, $perPage, 'created_at DESC');
    json_success($result['rows'], $result['meta']);
}
function admin_redirects_create(array $p): void
{
    $user = require_permission('redirects.manage');
    $body = read_json_body();
    $v = new Validator($body);
    $v->required('from_path', 'From path')->required('to_path', 'To path');
    if ($v->fails()) {
        validation_fail($v->errors());
    }
    $body['created_by'] = $user['id'];
    $resource = new CrudResource('redirects', ['from_path', 'to_path', 'status_code', 'is_active', 'created_by'], hasPublishStatus: false);
    $row = $resource->create($body);
    write_audit_log((int) $user['id'], 'redirect.create', 'redirect', $row['id']);
    json_success($row);
}
function admin_redirects_update(array $p): void
{
    $user = require_permission('redirects.manage');
    $id = require_route_id($p);
    $resource = new CrudResource('redirects', ['from_path', 'to_path', 'status_code', 'is_active'], hasPublishStatus: false);
    $row = $resource->update($id, read_json_body());
    if (!$row) {
        json_error('not_found', 'Redirect not found.', 404);
    }
    write_audit_log((int) $user['id'], 'redirect.update', 'redirect', $id);
    json_success($row);
}
function admin_redirects_delete(array $p): void
{
    $user = require_permission('redirects.manage');
    $id = require_route_id($p);
    $resource = new CrudResource('redirects', [], hasPublishStatus: false);
    if (!$resource->delete($id)) {
        json_error('not_found', 'Redirect not found.', 404);
    }
    write_audit_log((int) $user['id'], 'redirect.delete', 'redirect', $id);
    json_success(['deleted' => true]);
}

// ---- SEO metadata (keyed by entity_type + entity_id, not its own id in the URL) --
const SEO_ENTITY_TYPES = ['course', 'knowledge_content', 'career', 'learning_path', 'certification', 'glossary_term', 'event', 'page'];

function admin_seo_get(array $p): void
{
    $permission = ($_GET['advanced'] ?? '') ? 'seo.edit_advanced' : 'seo.edit_basic';
    require_permission($permission);
    $type = $p['type'];
    $id = require_route_id($p);
    if (!in_array($type, SEO_ENTITY_TYPES, true)) {
        json_error('invalid_entity_type', 'Unknown SEO entity type.', 422);
    }

    $stmt = db()->prepare('SELECT * FROM seo_metadata WHERE entity_type = ? AND entity_id = ?');
    $stmt->execute([$type, $id]);
    $row = $stmt->fetch();
    json_success($row ?: ['entity_type' => $type, 'entity_id' => $id, 'seo_title' => null, 'meta_description' => null, 'canonical_url' => null, 'robots_directive' => 'index,follow', 'og_title' => null, 'og_description' => null, 'og_image_id' => null]);
}

function admin_seo_update(array $p): void
{
    $user = require_permission('seo.edit_basic');
    $type = $p['type'];
    $id = require_route_id($p);
    if (!in_array($type, SEO_ENTITY_TYPES, true)) {
        json_error('invalid_entity_type', 'Unknown SEO entity type.', 422);
    }

    $body = only(read_json_body(), ['seo_title', 'meta_description', 'canonical_url', 'robots_directive', 'og_title', 'og_description', 'og_image_id']);
    if (array_key_exists('robots_directive', $body) && $body['robots_directive'] !== 'index,follow' && $body['robots_directive'] !== null) {
        require_permission('seo.edit_advanced');
    }

    $stmt = db()->prepare(
        'INSERT INTO seo_metadata (entity_type, entity_id, seo_title, meta_description, canonical_url, robots_directive, og_title, og_description, og_image_id)
         VALUES (:entity_type, :entity_id, :seo_title, :meta_description, :canonical_url, :robots_directive, :og_title, :og_description, :og_image_id)
         ON DUPLICATE KEY UPDATE
           seo_title = VALUES(seo_title), meta_description = VALUES(meta_description), canonical_url = VALUES(canonical_url),
           robots_directive = VALUES(robots_directive), og_title = VALUES(og_title), og_description = VALUES(og_description), og_image_id = VALUES(og_image_id)'
    );
    $stmt->execute([
        'entity_type' => $type,
        'entity_id' => $id,
        'seo_title' => $body['seo_title'] ?? null,
        'meta_description' => $body['meta_description'] ?? null,
        'canonical_url' => $body['canonical_url'] ?? null,
        'robots_directive' => $body['robots_directive'] ?? 'index,follow',
        'og_title' => $body['og_title'] ?? null,
        'og_description' => $body['og_description'] ?? null,
        'og_image_id' => $body['og_image_id'] ?? null,
    ]);
    write_audit_log((int) $user['id'], 'seo.update', $type, $id);

    $get = db()->prepare('SELECT * FROM seo_metadata WHERE entity_type = ? AND entity_id = ?');
    $get->execute([$type, $id]);
    json_success($get->fetch());
}

// ---- audit log (read-only) ---------------------------------------------------
function admin_audit_log_list(array $p): void
{
    require_permission('audit_log.view');
    [$page, $perPage] = pagination_params(50, 200);
    $offset = ($page - 1) * $perPage;

    $total = (int) db()->query('SELECT COUNT(*) FROM audit_logs')->fetchColumn();
    $stmt = db()->prepare(
        'SELECT a.id, a.action, a.entity_type, a.entity_id, a.meta_json, a.ip_address, a.created_at, u.name AS user_name
         FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
    );
    $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    json_success($stmt->fetchAll(), pagination_meta($page, $perPage, $total));
}
