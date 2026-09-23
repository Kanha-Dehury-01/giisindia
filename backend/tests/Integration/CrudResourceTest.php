<?php

declare(strict_types=1);

namespace Tests\Integration;

use CrudResource;
use PDO;
use PHPUnit\Framework\TestCase;

/**
 * Exercises CrudResource against the real `giisindia_test` database (see
 * tests/bootstrap.php) — this is what every admin_*.php handler is built
 * on, so correctness here covers the create/update/delete/list path for
 * all ~15 resources at once, not just one.
 */
final class CrudResourceTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        $this->pdo = db();
        // course_categories has no dependents in a fresh test DB, so it's
        // safe to fully reset between tests without FK cleanup elsewhere.
        $this->pdo->exec('DELETE FROM course_categories');
    }

    private function resource(): CrudResource
    {
        return new CrudResource(
            table: 'course_categories',
            allowedFields: ['name', 'slug', 'description', 'display_order'],
            hasPublishStatus: false,
            slugField: 'slug',
        );
    }

    public function testCreateAutoGeneratesSlugFromName(): void
    {
        $row = $this->resource()->create(['name' => 'GIIS Signature Programs']);

        $this->assertSame('giis-signature-programs', $row['slug']);
        $this->assertSame('GIIS Signature Programs', $row['name']);
    }

    public function testCreateRespectsExplicitSlug(): void
    {
        $row = $this->resource()->create(['name' => 'Professional Training', 'slug' => 'pro-training']);

        $this->assertSame('pro-training', $row['slug']);
    }

    public function testUniqueSlugAppendsSuffixOnCollision(): void
    {
        $resource = $this->resource();
        $first = $resource->create(['name' => 'Cloud Security']);
        $second = $resource->create(['name' => 'Cloud Security']);

        $this->assertSame('cloud-security', $first['slug']);
        $this->assertSame('cloud-security-2', $second['slug']);
    }

    public function testCreateRejectsFieldsOutsideAllowlist(): void
    {
        // `id` is not in the allowlist — a caller can't smuggle a
        // caller-controlled primary key or any other unlisted column
        // through create(), even if it's present in the input array.
        $resource = $this->resource();
        $row = $resource->create(['name' => 'GRC', 'id' => 99999]);

        $this->assertNotSame(99999, $row['id']);
    }

    public function testUpdateChangesOnlyProvidedFields(): void
    {
        $resource = $this->resource();
        $created = $resource->create(['name' => 'Original Name', 'description' => 'Original description']);

        $updated = $resource->update((int) $created['id'], ['name' => 'Updated Name']);

        $this->assertSame('Updated Name', $updated['name']);
        $this->assertSame('Original description', $updated['description']);
    }

    public function testUpdateReturnsNullForMissingRowViaFind(): void
    {
        $resource = $this->resource();
        $this->assertNull($resource->find(999999));
    }

    public function testDeleteRemovesRowAndReturnsTrue(): void
    {
        $resource = $this->resource();
        $created = $resource->create(['name' => 'To Delete']);

        $this->assertTrue($resource->delete((int) $created['id']));
        $this->assertNull($resource->find((int) $created['id']));
    }

    public function testDeleteReturnsFalseForMissingRow(): void
    {
        $this->assertFalse($this->resource()->delete(999999));
    }

    public function testAdminListPaginatesAndOrders(): void
    {
        $resource = $this->resource();
        foreach (['Charlie', 'Alpha', 'Bravo'] as $i => $name) {
            $resource->create(['name' => $name, 'display_order' => $i]);
        }

        $result = $resource->adminList([], 1, 2, 'display_order ASC, id ASC');

        $this->assertCount(2, $result['rows']);
        $this->assertSame(3, $result['meta']['total']);
        $this->assertSame(2, $result['meta']['total_pages']);
        $this->assertSame('Charlie', $result['rows'][0]['name']);
    }

    public function testReplaceChildRowsIsTransactionalAndOverwrites(): void
    {
        // course_faqs is a real child table of `courses` — exercise the
        // same mechanism admin_courses.php uses for curriculum/skills/etc.
        $this->pdo->exec('DELETE FROM course_faqs');
        $this->pdo->exec('DELETE FROM courses');
        $courseResource = new CrudResource('courses', ['title', 'slug'], slugField: 'slug');
        $course = $courseResource->create(['title' => 'Test Course']);
        $courseId = (int) $course['id'];

        $courseResource->replaceChildRows(
            'course_faqs',
            'course_id',
            $courseId,
            [['question' => 'Q1', 'answer' => 'A1'], ['question' => 'Q2', 'answer' => 'A2']],
            ['question', 'answer', 'display_order']
        );
        $faqs = $courseResource->childRows('course_faqs', 'course_id', $courseId);
        $this->assertCount(2, $faqs);
        $this->assertSame('Q1', $faqs[0]['question']);

        // Replacing again must fully overwrite, not append.
        $courseResource->replaceChildRows(
            'course_faqs',
            'course_id',
            $courseId,
            [['question' => 'Only one now', 'answer' => 'A']],
            ['question', 'answer', 'display_order']
        );
        $faqsAfter = $courseResource->childRows('course_faqs', 'course_id', $courseId);
        $this->assertCount(1, $faqsAfter);
        $this->assertSame('Only one now', $faqsAfter[0]['question']);

        $this->pdo->exec('DELETE FROM course_faqs');
        $this->pdo->exec('DELETE FROM courses');
    }
}
