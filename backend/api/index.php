<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/response.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/validate.php';
require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/crud.php';
require_once __DIR__ . '/middleware/rate_limit.php';

/**
 * Front controller. All /api/* requests are rewritten here (see .htaccess).
 * Routes are matched top-to-bottom against METHOD + path; each entry lazily
 * requires its handler file so an untouched resource costs nothing per
 * request. Handler functions receive ($params) — named capture groups from
 * the matched route — and are expected to call json_success()/json_error()
 * themselves (both exit), so this file never has to shape a response.
 */

// ---- CORS -------------------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, ALLOWED_ORIGINS, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Path resolution ----------------------------------------------------
$path = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path ?? '');
$path = '/' . trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Mutating requests must present a CSRF token that matches the session's,
// EXCEPT the public, unauthenticated enquiry form and login itself (which
// establishes the session the token is bound to).
$csrfExempt = ['/enquiries' => 'POST', '/auth/login' => 'POST'];
if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'], true) && ($csrfExempt[$path] ?? null) !== $method) {
    verify_csrf();
}

/** @var array<int, array{0: string, 1: string, 2: string, 3: string}> $routes [method, pattern, handlerFile, handlerFn] */
$routes = [
    ['GET', '#^/csrf-token$#', 'auth.php', 'auth_csrf_token'],
    ['POST', '#^/auth/login$#', 'auth.php', 'auth_login'],
    ['POST', '#^/auth/logout$#', 'auth.php', 'auth_logout'],
    ['GET', '#^/auth/me$#', 'auth.php', 'auth_me'],

    ['GET', '#^/homepage$#', 'homepage.php', 'homepage_get'],

    ['GET', '#^/course-categories$#', 'courses.php', 'course_categories_list'],
    ['GET', '#^/courses$#', 'courses.php', 'courses_list'],
    ['GET', '#^/courses/(?P<slug>[a-z0-9-]+)$#', 'courses.php', 'courses_detail'],

    ['GET', '#^/knowledge-categories$#', 'knowledge.php', 'knowledge_categories_list'],
    ['GET', '#^/knowledge/search$#', 'knowledge.php', 'knowledge_search'],
    ['GET', '#^/knowledge$#', 'knowledge.php', 'knowledge_list'],
    ['GET', '#^/knowledge/(?P<slug>[a-z0-9-]+)$#', 'knowledge.php', 'knowledge_detail'],

    ['GET', '#^/careers$#', 'careers.php', 'careers_list'],
    ['GET', '#^/careers/(?P<slug>[a-z0-9-]+)$#', 'careers.php', 'careers_detail'],

    ['GET', '#^/learning-paths$#', 'learning_paths.php', 'learning_paths_list'],
    ['GET', '#^/learning-paths/(?P<slug>[a-z0-9-]+)$#', 'learning_paths.php', 'learning_paths_detail'],

    ['GET', '#^/certifications$#', 'certifications.php', 'certifications_list'],
    ['GET', '#^/certifications/(?P<slug>[a-z0-9-]+)$#', 'certifications.php', 'certifications_detail'],

    ['GET', '#^/glossary$#', 'glossary.php', 'glossary_list'],
    ['GET', '#^/glossary/(?P<slug>[a-z0-9-]+)$#', 'glossary.php', 'glossary_detail'],

    ['GET', '#^/testimonials$#', 'public_resources.php', 'testimonials_list'],
    ['GET', '#^/team$#', 'public_resources.php', 'team_list'],
    ['GET', '#^/faqs$#', 'public_resources.php', 'faqs_list'],
    ['GET', '#^/events$#', 'public_resources.php', 'events_list'],
    ['GET', '#^/resources$#', 'public_resources.php', 'resources_list'],
    ['GET', '#^/site-settings$#', 'public_resources.php', 'site_settings_public'],

    ['POST', '#^/enquiries$#', 'enquiries.php', 'enquiries_create'],

    // ---- Admin ----------------------------------------------------------
    ['GET', '#^/admin/courses$#', 'admin_courses.php', 'admin_courses_list'],
    ['POST', '#^/admin/courses$#', 'admin_courses.php', 'admin_courses_create'],
    ['GET', '#^/admin/courses/(?P<id>\d+)$#', 'admin_courses.php', 'admin_courses_get'],
    ['PUT', '#^/admin/courses/(?P<id>\d+)$#', 'admin_courses.php', 'admin_courses_update'],
    ['DELETE', '#^/admin/courses/(?P<id>\d+)$#', 'admin_courses.php', 'admin_courses_delete'],
    ['PUT', '#^/admin/courses/(?P<id>\d+)/children$#', 'admin_courses.php', 'admin_courses_update_children'],
    ['GET', '#^/admin/course-categories$#', 'admin_courses.php', 'admin_course_categories_list'],
    ['POST', '#^/admin/course-categories$#', 'admin_courses.php', 'admin_course_categories_create'],
    ['PUT', '#^/admin/course-categories/(?P<id>\d+)$#', 'admin_courses.php', 'admin_course_categories_update'],
    ['DELETE', '#^/admin/course-categories/(?P<id>\d+)$#', 'admin_courses.php', 'admin_course_categories_delete'],

    ['GET', '#^/admin/knowledge-tags$#', 'admin_knowledge.php', 'admin_knowledge_tags_list'],
    ['GET', '#^/admin/knowledge$#', 'admin_knowledge.php', 'admin_knowledge_list'],
    ['POST', '#^/admin/knowledge$#', 'admin_knowledge.php', 'admin_knowledge_create'],
    ['GET', '#^/admin/knowledge/(?P<id>\d+)$#', 'admin_knowledge.php', 'admin_knowledge_get'],
    ['PUT', '#^/admin/knowledge/(?P<id>\d+)$#', 'admin_knowledge.php', 'admin_knowledge_update'],
    ['DELETE', '#^/admin/knowledge/(?P<id>\d+)$#', 'admin_knowledge.php', 'admin_knowledge_delete'],

    ['GET', '#^/admin/careers$#', 'admin_generic.php', 'admin_careers_list'],
    ['POST', '#^/admin/careers$#', 'admin_generic.php', 'admin_careers_create'],
    ['GET', '#^/admin/careers/(?P<id>\d+)$#', 'admin_generic.php', 'admin_careers_get'],
    ['PUT', '#^/admin/careers/(?P<id>\d+)$#', 'admin_generic.php', 'admin_careers_update'],
    ['DELETE', '#^/admin/careers/(?P<id>\d+)$#', 'admin_generic.php', 'admin_careers_delete'],

    ['GET', '#^/admin/learning-paths$#', 'admin_generic.php', 'admin_learning_paths_list'],
    ['POST', '#^/admin/learning-paths$#', 'admin_generic.php', 'admin_learning_paths_create'],
    ['GET', '#^/admin/learning-paths/(?P<id>\d+)$#', 'admin_generic.php', 'admin_learning_paths_get'],
    ['PUT', '#^/admin/learning-paths/(?P<id>\d+)$#', 'admin_generic.php', 'admin_learning_paths_update'],
    ['DELETE', '#^/admin/learning-paths/(?P<id>\d+)$#', 'admin_generic.php', 'admin_learning_paths_delete'],
    ['PUT', '#^/admin/learning-paths/(?P<id>\d+)/steps$#', 'admin_generic.php', 'admin_learning_path_steps_update'],

    ['GET', '#^/admin/certifications$#', 'admin_generic.php', 'admin_certifications_list'],
    ['POST', '#^/admin/certifications$#', 'admin_generic.php', 'admin_certifications_create'],
    ['GET', '#^/admin/certifications/(?P<id>\d+)$#', 'admin_generic.php', 'admin_certifications_get'],
    ['PUT', '#^/admin/certifications/(?P<id>\d+)$#', 'admin_generic.php', 'admin_certifications_update'],
    ['DELETE', '#^/admin/certifications/(?P<id>\d+)$#', 'admin_generic.php', 'admin_certifications_delete'],

    ['GET', '#^/admin/glossary$#', 'admin_generic.php', 'admin_glossary_list'],
    ['POST', '#^/admin/glossary$#', 'admin_generic.php', 'admin_glossary_create'],
    ['GET', '#^/admin/glossary/(?P<id>\d+)$#', 'admin_generic.php', 'admin_glossary_get'],
    ['PUT', '#^/admin/glossary/(?P<id>\d+)$#', 'admin_generic.php', 'admin_glossary_update'],
    ['DELETE', '#^/admin/glossary/(?P<id>\d+)$#', 'admin_generic.php', 'admin_glossary_delete'],

    ['GET', '#^/admin/testimonials$#', 'admin_generic.php', 'admin_testimonials_list'],
    ['POST', '#^/admin/testimonials$#', 'admin_generic.php', 'admin_testimonials_create'],
    ['PUT', '#^/admin/testimonials/(?P<id>\d+)$#', 'admin_generic.php', 'admin_testimonials_update'],
    ['DELETE', '#^/admin/testimonials/(?P<id>\d+)$#', 'admin_generic.php', 'admin_testimonials_delete'],

    ['GET', '#^/admin/team$#', 'admin_generic.php', 'admin_team_list'],
    ['POST', '#^/admin/team$#', 'admin_generic.php', 'admin_team_create'],
    ['PUT', '#^/admin/team/(?P<id>\d+)$#', 'admin_generic.php', 'admin_team_update'],
    ['DELETE', '#^/admin/team/(?P<id>\d+)$#', 'admin_generic.php', 'admin_team_delete'],

    ['GET', '#^/admin/faqs$#', 'admin_generic.php', 'admin_faqs_list'],
    ['POST', '#^/admin/faqs$#', 'admin_generic.php', 'admin_faqs_create'],
    ['PUT', '#^/admin/faqs/(?P<id>\d+)$#', 'admin_generic.php', 'admin_faqs_update'],
    ['DELETE', '#^/admin/faqs/(?P<id>\d+)$#', 'admin_generic.php', 'admin_faqs_delete'],

    ['GET', '#^/admin/events$#', 'admin_generic.php', 'admin_events_list'],
    ['POST', '#^/admin/events$#', 'admin_generic.php', 'admin_events_create'],
    ['PUT', '#^/admin/events/(?P<id>\d+)$#', 'admin_generic.php', 'admin_events_update'],
    ['DELETE', '#^/admin/events/(?P<id>\d+)$#', 'admin_generic.php', 'admin_events_delete'],

    ['GET', '#^/admin/resources$#', 'admin_generic.php', 'admin_resources_list'],
    ['POST', '#^/admin/resources$#', 'admin_generic.php', 'admin_resources_create'],
    ['PUT', '#^/admin/resources/(?P<id>\d+)$#', 'admin_generic.php', 'admin_resources_update'],
    ['DELETE', '#^/admin/resources/(?P<id>\d+)$#', 'admin_generic.php', 'admin_resources_delete'],

    ['GET', '#^/admin/statistics$#', 'admin_generic.php', 'admin_statistics_list'],
    ['PUT', '#^/admin/statistics/(?P<id>\d+)$#', 'admin_generic.php', 'admin_statistics_update'],

    ['GET', '#^/admin/site-settings$#', 'admin_generic.php', 'admin_site_settings_list'],
    ['PUT', '#^/admin/site-settings$#', 'admin_generic.php', 'admin_site_settings_update'],

    ['GET', '#^/admin/redirects$#', 'admin_generic.php', 'admin_redirects_list'],
    ['POST', '#^/admin/redirects$#', 'admin_generic.php', 'admin_redirects_create'],
    ['PUT', '#^/admin/redirects/(?P<id>\d+)$#', 'admin_generic.php', 'admin_redirects_update'],
    ['DELETE', '#^/admin/redirects/(?P<id>\d+)$#', 'admin_generic.php', 'admin_redirects_delete'],

    ['GET', '#^/admin/seo/(?P<type>[a-z_]+)/(?P<id>\d+)$#', 'admin_generic.php', 'admin_seo_get'],
    ['PUT', '#^/admin/seo/(?P<type>[a-z_]+)/(?P<id>\d+)$#', 'admin_generic.php', 'admin_seo_update'],

    ['GET', '#^/admin/audit-log$#', 'admin_generic.php', 'admin_audit_log_list'],

    ['GET', '#^/admin/enquiries$#', 'enquiries.php', 'admin_enquiries_list'],
    ['PUT', '#^/admin/enquiries/(?P<id>\d+)$#', 'enquiries.php', 'admin_enquiries_update'],

    ['GET', '#^/admin/media$#', 'media.php', 'admin_media_list'],
    ['POST', '#^/admin/media$#', 'media.php', 'admin_media_upload'],
    ['PUT', '#^/admin/media/(?P<id>\d+)$#', 'media.php', 'admin_media_update'],
    ['DELETE', '#^/admin/media/(?P<id>\d+)$#', 'media.php', 'admin_media_delete'],

    ['GET', '#^/admin/users$#', 'users.php', 'admin_users_list'],
    ['POST', '#^/admin/users$#', 'users.php', 'admin_users_create'],
    ['PUT', '#^/admin/users/(?P<id>\d+)$#', 'users.php', 'admin_users_update'],
    ['DELETE', '#^/admin/users/(?P<id>\d+)$#', 'users.php', 'admin_users_delete'],
];

foreach ($routes as [$routeMethod, $pattern, $file, $fn]) {
    if ($routeMethod !== $method) {
        continue;
    }
    if (preg_match($pattern, $path, $matches)) {
        require_once __DIR__ . '/handlers/' . $file;
        $params = array_filter($matches, fn ($k) => is_string($k), ARRAY_FILTER_USE_KEY);
        $fn($params);
        exit;
    }
}

json_error('not_found', 'This endpoint does not exist.', 404);
