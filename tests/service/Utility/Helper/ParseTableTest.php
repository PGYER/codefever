<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class ParseTableTest extends TestCase {
    public function testParseTable()
    {
        $expected = [
            [
                'mode' => '100755',
                'type' => 'blob',
                'object' => 'dd0460d1df82284c82c40963cccc900f0dc01b57',
                'name' => '.gitignore'
            ],
            [
                'mode' => '040000',
                'type' => 'tree',
                'object' => 'dc6de3d3298e9e899ada4f703ad6b80edbfb4f40',
                'name' => 'application'
            ],
            [
                'mode' => '040000',
                'type' => 'tree',
                'object' => 'c8cb25aa97c9d19f73d4bad6c0a116bd074fd776',
                'name' => 'misc'
            ],
            [
                'mode' => '100755',
                'type' => 'blob',
                'object' => '63181958e5847f29d2fe662f4af5507ebec0f6fe',
                'name' => 'package.json'
            ]
        ];

        $actual = <<<EOT
100755 blob dd0460d1df82284c82c40963cccc900f0dc01b57\t.gitignore
040000 tree dc6de3d3298e9e899ada4f703ad6b80edbfb4f40\tapplication
040000 tree c8cb25aa97c9d19f73d4bad6c0a116bd074fd776\tmisc
100755 blob 63181958e5847f29d2fe662f4af5507ebec0f6fe\tpackage.json
EOT;

        $actual = Helper::parseTable(
            $actual,
            '/^(\d+)\s+(commit|tag|tree|blob)\s+([0-9a-f]{40})\t(.*)$/i',
            ['mode', 'type', 'object', 'name']
        );

        $this->assertSame($expected, $actual);
    }
}
