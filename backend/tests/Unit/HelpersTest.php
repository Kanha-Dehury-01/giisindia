<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

final class HelpersTest extends TestCase
{
    public function testSlugifyLowercasesAndHyphenates(): void
    {
        $this->assertSame('certified-ethical-hacker', slugify('Certified Ethical Hacker'));
    }

    public function testSlugifyCollapsesNonAlphanumericRuns(): void
    {
        $this->assertSame('cissp-la', slugify('CISSP (LA)'));
    }

    public function testSlugifyTrimsLeadingAndTrailingHyphens(): void
    {
        $this->assertSame('a-b', slugify('  -A- -B- '));
    }

    public function testToBoolAcceptsTruthyForms(): void
    {
        foreach ([true, 1, '1', 'true', 'on'] as $value) {
            $this->assertTrue(to_bool($value), var_export($value, true) . ' should be truthy');
        }
    }

    public function testToBoolRejectsEverythingElse(): void
    {
        foreach ([false, 0, '0', 'false', null, '', 'yes'] as $value) {
            $this->assertFalse(to_bool($value), var_export($value, true) . ' should be falsy');
        }
    }

    public function testPaginationMetaComputesTotalPages(): void
    {
        $meta = pagination_meta(2, 20, 45);
        $this->assertSame(['page' => 2, 'per_page' => 20, 'total' => 45, 'total_pages' => 3], $meta);
    }

    public function testPaginationMetaHandlesZeroResults(): void
    {
        $meta = pagination_meta(1, 20, 0);
        $this->assertSame(0, $meta['total_pages']);
    }
}
