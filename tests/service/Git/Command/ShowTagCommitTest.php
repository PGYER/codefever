<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class ShowTagCommitTest extends TestCase {
    public function testShowTagCommit()
    {
        $expected = 'show tag1 --pretty="{log:%s,time:%at,sha:%H,email:%ae}"';
        $actual = Command::showTagCommit('tag1');

        $this->assertSame($expected, $actual);
    }

    public function testShowTagCommit_Empty()
    {
        $actual = Command::showTagCommit('');

        $this->assertFalse($actual);
    }
}
