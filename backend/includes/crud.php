<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/security.php';

/**
 * Generic CRUD engine shared by the ~15 nearly-identical resource handlers
 * (courses, knowledge_content, careers, certifications, learning_paths,
 * glossary_terms, testimonials, team_members, faqs, events, resources,
 * statistics, site_settings). Every handler still owns its own field
 * allowlist, its own permission slugs, and any joins/child-table logic it
 * needs on top of this — this class only centralizes the repetitive,
 * security-sensitive part (prepared statements, pagination, allowlisted
 * writes) so that part is implemented once and correctly.
 *
 * Table and column identifiers below always come from each handler's own
 * hardcoded config, never from request input — only bound *values* come
 * from the client, so this stays injection-safe despite building queries
 * with string interpolation for identifiers.
 */
final class CrudResource
{
    public function __construct(
        private readonly string $table,
        private readonly array $allowedFields,
        private readonly string $primaryKey = 'id',
        private readonly bool $hasPublishStatus = true,
        private readonly ?string $slugField = null,
    ) {
    }

    /** Public-facing paginated list — published rows only, optional equality filters. */
    public function listPublished(array $filters = [], int $page = 1, int $perPage = 20, string $orderBy = 'display_order ASC, id ASC'): array
    {
        return $this->runList(array_merge($filters, $this->hasPublishStatus ? ['publish_status' => 'published'] : []), $page, $perPage, $orderBy);
    }

    /** Admin list — any status, arbitrary equality filters (already validated by the caller). */
    public function adminList(array $filters = [], int $page = 1, int $perPage = 20, string $orderBy = 'id DESC'): array
    {
        return $this->runList($filters, $page, $perPage, $orderBy);
    }

    private function runList(array $filters, int $page, int $perPage, string $orderBy): array
    {
        $where = [];
        $params = [];
        foreach ($filters as $column => $value) {
            if ($value === null) {
                continue;
            }
            $where[] = "`$column` = ?";
            $params[] = $value;
        }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $countStmt = db()->prepare("SELECT COUNT(*) FROM `{$this->table}` $whereSql");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($page - 1) * $perPage;
        $stmt = db()->prepare(
            "SELECT * FROM `{$this->table}` $whereSql ORDER BY $orderBy LIMIT ? OFFSET ?"
        );
        $bindIndex = 1;
        foreach ($params as $param) {
            $stmt->bindValue($bindIndex++, $param);
        }
        $stmt->bindValue($bindIndex++, $perPage, PDO::PARAM_INT);
        $stmt->bindValue($bindIndex++, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'rows' => $stmt->fetchAll(),
            'meta' => pagination_meta($page, $perPage, $total),
        ];
    }

    public function find(int $id): ?array
    {
        $stmt = db()->prepare("SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}` = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findPublishedBySlug(string $slug): ?array
    {
        if (!$this->slugField) {
            throw new LogicException("{$this->table} has no slug field configured.");
        }
        $sql = "SELECT * FROM `{$this->table}` WHERE `{$this->slugField}` = ?";
        if ($this->hasPublishStatus) {
            $sql .= " AND publish_status = 'published'";
        }
        $stmt = db()->prepare($sql);
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function slugExists(string $slug, ?int $excludeId = null): bool
    {
        if (!$this->slugField) {
            return false;
        }
        $sql = "SELECT 1 FROM `{$this->table}` WHERE `{$this->slugField}` = ?";
        $params = [$slug];
        if ($excludeId !== null) {
            $sql .= " AND `{$this->primaryKey}` != ?";
            $params[] = $excludeId;
        }
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        return (bool) $stmt->fetchColumn();
    }

    /** Generates a unique slug from $base, appending -2, -3, ... on collision. */
    public function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug = slugify($base);
        $candidate = $slug;
        $suffix = 2;
        while ($this->slugExists($candidate, $excludeId)) {
            $candidate = "$slug-$suffix";
            $suffix++;
        }
        return $candidate;
    }

    /**
     * PDO with native (non-emulated) prepares can bind a PHP bool as an
     * empty string rather than 0/1, which MySQL's strict mode then
     * rejects for a TINYINT column ("Incorrect integer value: ''"). Every
     * write goes through this so admin forms can send real booleans
     * (checkboxes) without each handler having to know about the quirk.
     */
    private function normalize(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $data[$key] = $value ? 1 : 0;
            }
        }
        return $data;
    }

    /** Inserts a row from $input, restricted to the configured allowlist. Returns the new row. */
    public function create(array $input): array
    {
        $data = $this->normalize(only($input, $this->allowedFields));

        if ($this->slugField && empty($data[$this->slugField]) && !empty($input['title'] ?? $input['name'] ?? null)) {
            $data[$this->slugField] = $this->uniqueSlug((string) ($input['title'] ?? $input['name']));
        }

        if (empty($data)) {
            json_error('no_fields', 'No valid fields were supplied.', 422);
        }

        $columns = array_keys($data);
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $columnList = implode(', ', array_map(fn ($c) => "`$c`", $columns));

        $stmt = db()->prepare("INSERT INTO `{$this->table}` ($columnList) VALUES ($placeholders)");
        $stmt->execute(array_values($data));

        return $this->find((int) db()->lastInsertId());
    }

    /** Updates a row, restricted to the configured allowlist. Returns the updated row or null if not found. */
    public function update(int $id, array $input): ?array
    {
        $data = $this->normalize(only($input, $this->allowedFields));
        if (empty($data)) {
            return $this->find($id);
        }

        $assignments = implode(', ', array_map(fn ($c) => "`$c` = ?", array_keys($data)));
        $stmt = db()->prepare("UPDATE `{$this->table}` SET $assignments WHERE `{$this->primaryKey}` = ?");
        $stmt->execute([...array_values($data), $id]);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $stmt = db()->prepare("DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}` = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    /** Replaces a resource's child rows (e.g. course_skills for a course) inside one transaction. */
    public function replaceChildRows(string $childTable, string $parentColumn, int $parentId, array $rows, array $rowFields): void
    {
        $pdo = db();
        $pdo->beginTransaction();
        try {
            $del = $pdo->prepare("DELETE FROM `$childTable` WHERE `$parentColumn` = ?");
            $del->execute([$parentId]);

            if ($rows) {
                $columns = array_merge([$parentColumn], $rowFields);
                $columnList = implode(', ', array_map(fn ($c) => "`$c`", $columns));
                $placeholders = implode(', ', array_fill(0, count($columns), '?'));
                $insert = $pdo->prepare("INSERT INTO `$childTable` ($columnList) VALUES ($placeholders)");
                foreach ($rows as $order => $row) {
                    $values = [$parentId];
                    foreach ($rowFields as $field) {
                        $values[] = $field === 'display_order' && !isset($row['display_order'])
                            ? $order
                            : ($row[$field] ?? null);
                    }
                    $insert->execute($values);
                }
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public function childRows(string $childTable, string $parentColumn, int $parentId, string $orderBy = 'display_order ASC, id ASC'): array
    {
        $stmt = db()->prepare("SELECT * FROM `$childTable` WHERE `$parentColumn` = ? ORDER BY $orderBy");
        $stmt->execute([$parentId]);
        return $stmt->fetchAll();
    }
}

/** Reads the numeric :id / :slug segment already parsed by the router out of $params, or 404s. */
function require_route_id(array $params, string $key = 'id'): int
{
    if (!isset($params[$key]) || !ctype_digit((string) $params[$key])) {
        json_error('not_found', 'Not found.', 404);
    }
    return (int) $params[$key];
}
