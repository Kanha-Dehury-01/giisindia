<?php

declare(strict_types=1);

function knowledge_resource(): CrudResource
{
    return new CrudResource(
        table: 'knowledge_content',
        allowedFields: [
            'title', 'slug', 'content_type', 'category_id', 'short_description', 'body',
            'featured_image_id', 'author_id', 'reviewer_id', 'difficulty', 'publish_date',
            'last_updated', 'publish_status',
        ],
        slugField: 'slug',
    );
}

function knowledge_categories_list(array $params): void
{
    $rows = db()->query('SELECT id, name, slug, description, display_order FROM knowledge_categories ORDER BY display_order ASC')->fetchAll();
    json_success($rows);
}

function knowledge_list(array $params): void
{
    [$page, $perPage] = pagination_params();
    $filters = [];
    if (!empty($_GET['type'])) {
        $filters['content_type'] = $_GET['type'];
    }
    if (!empty($_GET['difficulty'])) {
        $filters['difficulty'] = $_GET['difficulty'];
    }
    if (!empty($_GET['category'])) {
        $cat = db()->prepare('SELECT id FROM knowledge_categories WHERE slug = ?');
        $cat->execute([$_GET['category']]);
        $filters['category_id'] = $cat->fetchColumn() ?: 0;
    }

    $result = knowledge_resource()->listPublished($filters, $page, $perPage, 'publish_date DESC, id DESC');
    json_success($result['rows'], $result['meta']);
}

function knowledge_detail(array $params): void
{
    $resource = knowledge_resource();
    $entry = $resource->findPublishedBySlug($params['slug']);
    if (!$entry) {
        json_error('not_found', 'Content not found.', 404);
    }
    $id = (int) $entry['id'];

    $tags = db()->prepare(
        'SELECT t.id, t.name, t.slug FROM knowledge_tags t
         JOIN knowledge_content_tags ct ON ct.tag_id = t.id WHERE ct.knowledge_content_id = ?'
    );
    $tags->execute([$id]);
    $entry['tags'] = $tags->fetchAll();

    $entry['related'] = knowledge_relationships_for('knowledge_content', $id);

    json_success($entry);
}

/**
 * Cross-content search. Ranking mirrors the frontend prototype this
 * replaces (frontend/src/utils/knowledgeSearch.js): exact title match >
 * keyword/tag match > category match > body/content match, with a
 * word-tokenized fallback so multi-word queries still surface entries
 * that only substring-match on one word.
 */
function knowledge_search(array $params): void
{
    $query = trim((string) ($_GET['q'] ?? ''));
    $type = strtolower((string) ($_GET['type'] ?? 'all'));
    [$page, $perPage] = pagination_params(20, 50);

    if ($query === '') {
        json_success([], pagination_meta($page, $perPage, 0));
    }

    $sources = [
        'guide' => ['table' => 'knowledge_content', 'title' => 'title', 'body' => ['short_description', 'body'], 'slug' => 'slug', 'extraWhere' => "content_type = 'guide'"],
        'concept' => ['table' => 'knowledge_content', 'title' => 'title', 'body' => ['short_description', 'body'], 'slug' => 'slug', 'extraWhere' => "content_type IN ('fundamental','domain','technology')"],
        'resource' => ['table' => 'knowledge_content', 'title' => 'title', 'body' => ['short_description', 'body'], 'slug' => 'slug', 'extraWhere' => "content_type = 'resource'"],
        'career' => ['table' => 'careers', 'title' => 'title', 'body' => ['description'], 'slug' => 'slug', 'extraWhere' => '1=1'],
        'course' => ['table' => 'courses', 'title' => 'title', 'body' => ['short_description', 'long_description'], 'slug' => 'slug', 'extraWhere' => '1=1'],
        'certification' => ['table' => 'certifications', 'title' => 'name', 'body' => ['short_description', 'body'], 'slug' => 'slug', 'extraWhere' => '1=1'],
        'learning_path' => ['table' => 'learning_paths', 'title' => 'title', 'body' => ['description'], 'slug' => 'slug', 'extraWhere' => '1=1'],
        'glossary' => ['table' => 'glossary_terms', 'title' => 'term', 'body' => ['definition'], 'slug' => 'slug', 'extraWhere' => '1=1'],
    ];

    $typeFilterMap = [
        'all' => array_keys($sources),
        'guides' => ['guide'],
        'concepts' => ['concept'],
        'careers' => ['career'],
        'courses' => ['course'],
        'certifications' => ['certification'],
        'learning_paths' => ['learning_path'],
        'glossary' => ['glossary'],
    ];
    $activeSources = $typeFilterMap[$type] ?? $typeFilterMap['all'];

    $queryWords = array_values(array_filter(
        preg_split('/\s+/', mb_strtolower($query)) ?: [],
        fn ($w) => mb_strlen($w) >= 3
    ));

    $results = [];
    foreach ($activeSources as $sourceKey) {
        $src = $sources[$sourceKey];
        $bodyCols = implode(', ', $src['body']);
        $sql = "SELECT id, `{$src['title']}` AS title, `{$src['slug']}` AS slug, $bodyCols
                FROM `{$src['table']}` WHERE publish_status = 'published' AND ({$src['extraWhere']})";
        $rows = db()->query($sql)->fetchAll();

        foreach ($rows as $row) {
            $titleLower = mb_strtolower((string) $row['title']);
            $bodyText = mb_strtolower(implode(' ', array_map(fn ($c) => (string) ($row[$c] ?? ''), $src['body'])));
            $needle = mb_strtolower($query);

            $score = 0;
            if ($titleLower === $needle) {
                $score += 1000;
            } elseif (str_contains($titleLower, $needle)) {
                $score += 400;
            }
            if (str_contains($bodyText, $needle)) {
                $score += 25;
            }
            foreach ($queryWords as $word) {
                if (str_contains($titleLower, $word)) {
                    $score += 60;
                } elseif (str_contains($bodyText, $word)) {
                    $score += 15;
                }
            }

            if ($score > 0) {
                $excerptSource = $row[$src['body'][0]] ?? '';
                $results[] = [
                    'type' => $sourceKey,
                    'id' => (int) $row['id'],
                    'title' => $row['title'],
                    'slug' => $row['slug'],
                    'excerpt' => mb_substr((string) $excerptSource, 0, 200),
                    'score' => $score,
                ];
            }
        }
    }

    usort($results, fn ($a, $b) => $b['score'] <=> $a['score']);

    $total = count($results);
    $offset = ($page - 1) * $perPage;
    $paged = array_slice($results, $offset, $perPage);

    json_success($paged, pagination_meta($page, $perPage, $total));
}
