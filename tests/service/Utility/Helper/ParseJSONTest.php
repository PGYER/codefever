<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class ParseJSONTest extends TestCase {
    public function testParseJSON()
    {
        $expected = [
            'sha' => '3e169d94ce173b5b7f84d8c11a29c9739b5e5241',
            'log' => "Merge branch 'master' of http://git.yunhuiju.com/yangchen/frontjs",
            'body' => '',
            'email' => 'chenyang@pgyer.com',
            'time' => '1578989695'
        ];

        $actual = "{sha:3e169d94ce173b5b7f84d8c11a29c9739b5e5241,log:Merge branch 'master' of http://git.yunhuiju.com/yangchen/frontjs,body:,email:chenyang@pgyer.com,time:1578989695}";
        $actual = Helper::parseJSON($actual, '');

        $this->assertSame($expected, $actual);
    }
}
