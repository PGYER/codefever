<?php

use PHPUnit\Framework\TestCase;
use service\Utility\TOTP;

class TOTPTest extends TestCase {
    protected $phoneNumber = '11122223333';

    public function testGenerate()
    {
        $actual = TOTP::generate($this->phoneNumber);
        $this->assertEquals(6, strlen($actual));

        return $actual;
    }

    /**
     * @depends testGenerate
     */
    public function testCheck($code)
    {
        $actual = TOTP::check($this->phoneNumber, $code);

        $this->assertTrue($actual);
    }
}
