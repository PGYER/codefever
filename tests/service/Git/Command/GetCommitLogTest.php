<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class GetCommitLogTest extends TestCase {
    public function testGetCommitLog()
    {
        $expected = 'log master -1 --pretty="{log:%s,time:%at,sha:%H,email:%ae,parent:%P}"';
        $actual = Command::getCommitLog('master');

        $this->assertSame($expected, $actual);
    }
}
