<?php

declare(strict_types=1);

/**
 * Dynamic XML sitemap — a standalone script (not routed through
 * index.php's front controller), because production's public/.htaccess
 * rewrites the site-root `/sitemap.xml` request straight to this physical
 * file (see frontend/public/.htaccess). Lists every published, publicly
 * reachable slug across all content types plus the fixed static routes.
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/xml; charset=utf-8');

$baseUrl = rtrim(APP_URL ?: 'https://giisindia.in', '/');

/** @var array<int, array{loc: string, lastmod: ?string, changefreq: string, priority: string}> $entries */
$entries = [];

function add_entry(array &$entries, string $path, ?string $lastmod, string $changefreq, string $priority): void
{
    $entries[] = ['loc' => $path, 'lastmod' => $lastmod, 'changefreq' => $changefreq, 'priority' => $priority];
}

// ---- Static routes -------------------------------------------------------
$staticRoutes = [
    ['/', 'daily', '1.0'],
    ['/about', 'monthly', '0.6'],
    ['/why-giis', 'monthly', '0.6'],
    ['/courses', 'daily', '0.9'],
    ['/certifications', 'weekly', '0.7'],
    ['/careers', 'weekly', '0.6'],
    ['/careers/placement', 'monthly', '0.5'],
    ['/knowledge-center', 'daily', '0.8'],
    ['/knowledge-center/learning-paths', 'weekly', '0.6'],
    ['/knowledge-center/glossary', 'weekly', '0.6'],
    ['/faq', 'monthly', '0.5'],
    ['/contact', 'yearly', '0.4'],
    ['/enquire', 'monthly', '0.6'],
    ['/privacy-policy', 'yearly', '0.2'],
    ['/terms-and-conditions', 'yearly', '0.2'],
    ['/cookie-policy', 'yearly', '0.2'],
    ['/disclaimer', 'yearly', '0.2'],
    ['/refund-cancellation-policy', 'yearly', '0.2'],
];
foreach ($staticRoutes as [$path, $freq, $priority]) {
    add_entry($entries, $path, null, $freq, $priority);
}

try {
    $pdo = db();

    $courses = $pdo->query("SELECT slug, updated_at FROM courses WHERE publish_status = 'published'")->fetchAll();
    foreach ($courses as $row) {
        add_entry($entries, "/courses/{$row['slug']}", $row['updated_at'], 'weekly', '0.8');
    }

    $certifications = $pdo->query("SELECT slug, updated_at FROM certifications WHERE publish_status = 'published'")->fetchAll();
    foreach ($certifications as $row) {
        add_entry($entries, "/certifications/{$row['slug']}", $row['updated_at'], 'monthly', '0.6');
    }

    $careers = $pdo->query("SELECT slug, updated_at FROM careers WHERE publish_status = 'published'")->fetchAll();
    foreach ($careers as $row) {
        add_entry($entries, "/knowledge-center/careers/{$row['slug']}", $row['updated_at'], 'monthly', '0.6');
    }

    $learningPaths = $pdo->query("SELECT slug, updated_at FROM learning_paths WHERE publish_status = 'published'")->fetchAll();
    foreach ($learningPaths as $row) {
        add_entry($entries, "/knowledge-center/learning-paths/{$row['slug']}", $row['updated_at'], 'monthly', '0.6');
    }

    $glossaryTerms = $pdo->query("SELECT slug, updated_at FROM glossary_terms WHERE publish_status = 'published'")->fetchAll();
    foreach ($glossaryTerms as $row) {
        add_entry($entries, "/knowledge-center/glossary/{$row['slug']}", $row['updated_at'], 'monthly', '0.4');
    }

    $knowledgeTypeSlugs = [
        'fundamental' => 'fundamentals',
        'domain' => 'domains',
        'technology' => 'technologies',
        'guide' => 'guides',
        'resource' => 'resources',
    ];
    $knowledgeContent = $pdo->query("SELECT slug, content_type, updated_at FROM knowledge_content WHERE publish_status = 'published'")->fetchAll();
    foreach ($knowledgeContent as $row) {
        $segment = $knowledgeTypeSlugs[$row['content_type']] ?? 'guides';
        add_entry($entries, "/knowledge-center/{$segment}/{$row['slug']}", $row['updated_at'], 'monthly', '0.6');
    }

    $events = $pdo->query("SELECT slug, updated_at FROM events WHERE publish_status = 'published'")->fetchAll();
    foreach ($events as $row) {
        add_entry($entries, "/events/{$row['slug']}", $row['updated_at'], 'weekly', '0.5');
    }
} catch (Throwable $e) {
    // A DB outage should degrade to the static-route sitemap, not a 500 —
    // crawlers still get a valid (if smaller) sitemap rather than nothing.
    error_log('Sitemap DB query failed: ' . $e->getMessage());
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($entries as $entry) {
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($baseUrl . $entry['loc'], ENT_XML1) . "</loc>\n";
    if ($entry['lastmod']) {
        echo '    <lastmod>' . date('Y-m-d', strtotime($entry['lastmod'])) . "</lastmod>\n";
    }
    echo '    <changefreq>' . $entry['changefreq'] . "</changefreq>\n";
    echo '    <priority>' . $entry['priority'] . "</priority>\n";
    echo "  </url>\n";
}
echo '</urlset>' . "\n";
