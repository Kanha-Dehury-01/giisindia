<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-');
}

/** Reads ?page=&per_page= from the query string with sane bounds. */
function pagination_params(int $defaultPerPage = 20, int $maxPerPage = 100): array
{
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $perPage = (int) ($_GET['per_page'] ?? $defaultPerPage);
    $perPage = max(1, min($maxPerPage, $perPage));
    return [$page, $perPage, ($page - 1) * $perPage];
}

function pagination_meta(int $page, int $perPage, int $total): array
{
    return ['page' => $page, 'per_page' => $perPage, 'total' => $total, 'total_pages' => (int) ceil($total / max(1, $perPage))];
}

/** True/1/"1"/"true" -> true; everything else -> false. Used for admin form checkboxes. */
function to_bool(mixed $value): bool
{
    return in_array($value, [true, 1, '1', 'true', 'on'], true);
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Resolves the polymorphic knowledge_relationships graph (see
 * database/schema.sql and docs/ARCHITECTURE.md §E) into hydrated, typed
 * cards. Shared by every content-detail handler that surfaces "related"
 * content (knowledge articles, careers, glossary terms, ...).
 */
function knowledge_relationships_for(string $fromType, int $fromId): array
{
    $stmt = db()->prepare(
        'SELECT to_type, to_id, relationship_label FROM knowledge_relationships
         WHERE from_type = ? AND from_id = ? ORDER BY display_order ASC'
    );
    $stmt->execute([$fromType, $fromId]);
    $links = $stmt->fetchAll();

    $tableByType = [
        'knowledge_content' => ['knowledge_content', 'title', 'slug'],
        'career' => ['careers', 'title', 'slug'],
        'learning_path' => ['learning_paths', 'title', 'slug'],
        'certification' => ['certifications', 'name', 'slug'],
        'course' => ['courses', 'title', 'slug'],
        'glossary_term' => ['glossary_terms', 'term', 'slug'],
    ];

    $out = [];
    foreach ($links as $link) {
        [$table, $titleCol, $slugCol] = $tableByType[$link['to_type']] ?? [null, null, null];
        if (!$table) {
            continue;
        }
        $stmt = db()->prepare("SELECT id, `$titleCol` AS title, `$slugCol` AS slug FROM `$table` WHERE id = ? AND publish_status = 'published'");
        $stmt->execute([$link['to_id']]);
        $row = $stmt->fetch();
        if ($row) {
            $out[] = [
                'type' => $link['to_type'],
                'label' => $link['relationship_label'],
                'id' => $row['id'],
                'title' => $row['title'],
                'slug' => $row['slug'],
            ];
        }
    }
    return $out;
}
