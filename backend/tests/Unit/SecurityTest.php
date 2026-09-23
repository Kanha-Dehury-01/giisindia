<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

final class SecurityTest extends TestCase
{
    public function testHashPasswordProducesVerifiableBcryptHash(): void
    {
        $hash = hash_password('CorrectHorseBattery9!');

        $this->assertStringStartsWith('$2y$', $hash);
        $this->assertTrue(verify_password('CorrectHorseBattery9!', $hash));
    }

    public function testVerifyPasswordRejectsWrongPassword(): void
    {
        $hash = hash_password('CorrectHorseBattery9!');

        $this->assertFalse(verify_password('WrongPassword', $hash));
    }

    public function testHashPasswordIsSaltedNotDeterministic(): void
    {
        // Two hashes of the same password must differ (real per-hash
        // salt) — otherwise a leaked hash table trivially reveals which
        // users share a password.
        $this->assertNotSame(hash_password('same-password'), hash_password('same-password'));
    }
}
