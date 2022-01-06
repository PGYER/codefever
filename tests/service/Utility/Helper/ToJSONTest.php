<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class ToJSONTest extends TestCase {
    public function testToJSON()
    {
        $expected = '{sha:%H,log:%s,body:%b,email:%ae,time:%at}';
        $actual = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $actual = Helper::toJSON($actual, '');
        $this->assertSame($expected, $actual);
    }
}
