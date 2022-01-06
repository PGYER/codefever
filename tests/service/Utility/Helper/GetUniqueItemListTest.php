<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class GetUniqueItemListTest extends TestCase {
    public function testGetUniqueItemList()
    {
        $expected = [
            [
                'key' => 'value1',
                'otherKey' => 'otherValue'
            ],
            [
                'key' => 'value2',
                'otherKey' => 'otherValue'
            ]
        ];

        $actual = [
            [
                'key' => 'value1',
                'otherKey' => 'otherValue'
            ],
            [
                'key' => 'value1',
                'otherKey' => 'otherValue'
            ],
            [
                'key' => 'value2',
                'otherKey' => 'otherValue'
            ]
        ];

        $actual = Helper::getUniqueItemList($actual, 'key');

        $this->assertEquals($expected, $actual);
    }
}
