<?php

use PHPUnit\Framework\TestCase;
use service\Utility\UUID;

class GetKeyTest extends TestCase {
    public function testGetKey()
    {
        $excepted = '/^[0-9a-f]{32}$/i';
        $actual = UUID::getKey();

        $this->assertEquals(1, preg_match($excepted, $actual));
    }
}
