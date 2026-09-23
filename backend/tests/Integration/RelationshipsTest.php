<?php

declare(strict_types=1);

namespace Tests\Integration;

use PDO;
use PHPUnit\Framework\TestCase;

/**
 * knowledge_relationships_for() (includes/helpers.php) resolves the
 * polymorphic linking graph every content-detail handler uses to show
 * "related" cards (docs/ARCHITECTURE.md §E) — worth a dedicated test since
 * a mistake here would silently mean broken/missing related-content links
 * across the entire Knowledge Center, not just one page.
 */
final class RelationshipsTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        $this->pdo = db();
        $this->pdo->exec('DELETE FROM knowledge_relationships');
        $this->pdo->exec('DELETE FROM careers');
        $this->pdo->exec('DELETE FROM knowledge_content');
    }

    protected function tearDown(): void
    {
        $this->pdo->exec('DELETE FROM knowledge_relationships');
        $this->pdo->exec('DELETE FROM careers');
        $this->pdo->exec('DELETE FROM knowledge_content');
    }

    public function testResolvesLinkToAPublishedTarget(): void
    {
        $this->pdo->exec("INSERT INTO careers (title, slug, publish_status) VALUES ('SOC Analyst', 'soc-analyst', 'published')");
        $careerId = (int) $this->pdo->lastInsertId();

        $this->pdo->exec(
            "INSERT INTO knowledge_content (title, slug, content_type, difficulty, publish_status) " .
            "VALUES ('SIEM Explained', 'siem-explained', 'guide', 'beginner', 'published')"
        );
        $articleId = (int) $this->pdo->lastInsertId();

        $stmt = $this->pdo->prepare(
            'INSERT INTO knowledge_relationships (from_type, from_id, to_type, to_id, relationship_label) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute(['knowledge_content', $articleId, 'career', $careerId, 'Related career']);

        $related = knowledge_relationships_for('knowledge_content', $articleId);

        $this->assertCount(1, $related);
        $this->assertSame('career', $related[0]['type']);
        $this->assertSame('soc-analyst', $related[0]['slug']);
        $this->assertSame('Related career', $related[0]['label']);
    }

    public function testExcludesUnpublishedTargets(): void
    {
        $this->pdo->exec("INSERT INTO careers (title, slug, publish_status) VALUES ('Draft Career', 'draft-career', 'draft')");
        $careerId = (int) $this->pdo->lastInsertId();
        $this->pdo->exec(
            "INSERT INTO knowledge_content (title, slug, content_type, difficulty, publish_status) " .
            "VALUES ('Some Guide', 'some-guide', 'guide', 'beginner', 'published')"
        );
        $articleId = (int) $this->pdo->lastInsertId();

        $stmt = $this->pdo->prepare(
            'INSERT INTO knowledge_relationships (from_type, from_id, to_type, to_id) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute(['knowledge_content', $articleId, 'career', $careerId]);

        // The linked career is a draft — it must not appear as a public
        // "related" card even though the relationship row exists.
        $this->assertSame([], knowledge_relationships_for('knowledge_content', $articleId));
    }

    public function testReturnsEmptyArrayWhenNoRelationshipsExist(): void
    {
        $this->assertSame([], knowledge_relationships_for('knowledge_content', 999999));
    }
}
