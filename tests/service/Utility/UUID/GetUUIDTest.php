<?php

use PHPUnit\Framework\TestCase;
use service\Utility\UUID;

class GetUUIDTest extends TestCase {
    public function testGetUUID()
    {
        $excepted = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i';
        $actual = UUID::getUUID();

        $this->assertEquals(1, preg_match($excepted, $actual));
    }
}
