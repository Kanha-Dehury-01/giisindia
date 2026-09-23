<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use Validator;

final class ValidatorTest extends TestCase
{
    public function testRequiredFailsOnMissingField(): void
    {
        $v = new Validator([]);
        $v->required('title', 'Title');

        $this->assertTrue($v->fails());
        $this->assertSame('Title is required.', $v->errors()['title']);
    }

    public function testRequiredFailsOnEmptyString(): void
    {
        $v = new Validator(['title' => '']);
        $v->required('title', 'Title');

        $this->assertTrue($v->fails());
    }

    public function testRequiredPassesWithValue(): void
    {
        $v = new Validator(['title' => 'CISSP']);
        $v->required('title', 'Title');

        $this->assertFalse($v->fails());
    }

    public function testMaxLengthFailsWhenTooLong(): void
    {
        $v = new Validator(['title' => str_repeat('x', 201)]);
        $v->maxLength('title', 200, 'Title');

        $this->assertTrue($v->fails());
        $this->assertSame('Title must be 200 characters or fewer.', $v->errors()['title']);
    }

    public function testInFailsOnValueOutsideAllowlist(): void
    {
        $v = new Validator(['level' => 'expert']);
        $v->in('level', ['beginner', 'intermediate', 'advanced'], 'Level');

        $this->assertTrue($v->fails());
    }

    public function testInPassesOnAllowedValue(): void
    {
        $v = new Validator(['level' => 'advanced']);
        $v->in('level', ['beginner', 'intermediate', 'advanced'], 'Level');

        $this->assertFalse($v->fails());
    }

    public function testInAllowsNullOrEmptyAsOptional(): void
    {
        // `in` only validates a field that was actually supplied — it is
        // not itself a required-field check (that's `required()`'s job).
        $v = new Validator([]);
        $v->in('level', ['beginner', 'intermediate', 'advanced'], 'Level');

        $this->assertFalse($v->fails());
    }

    public function testEmailFailsOnMalformedAddress(): void
    {
        $v = new Validator(['email' => 'not-an-email']);
        $v->email('email', 'Email');

        $this->assertTrue($v->fails());
    }

    public function testEmailPassesOnValidAddress(): void
    {
        $v = new Validator(['email' => 'admin@giisindia.in']);
        $v->email('email', 'Email');

        $this->assertFalse($v->fails());
    }

    public function testMultipleRulesAccumulateAllErrors(): void
    {
        $v = new Validator([]);
        $v->required('name', 'Name')->required('phone', 'Phone');

        $this->assertTrue($v->fails());
        $this->assertCount(2, $v->errors());
    }

    public function testOnlyStripsFieldsOutsideAllowlist(): void
    {
        $result = only(['title' => 'x', 'password_hash' => 'leak', 'role_id' => 1], ['title', 'role_id']);

        $this->assertSame(['title' => 'x', 'role_id' => 1], $result);
    }
}
