<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class CommandTest extends TestCase {
    public function testGetCommitList()
    {
        $expected = 'log master --skip 0 -20 --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}"';
        $actual = Command::getCommitList('master');

        $this->assertSame($expected, $actual);
    }

    public function testGetCommitList_Keyword()
    {
        $expected = 'log master --grep=fix --skip 20 -20 --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}"';
        $actual = Command::getCommitList('master', '', 'fix', 2);

        $this->assertSame($expected, $actual);
    }

    public function testGetCommitList_Path()
    {
        $expected = 'log master --skip 20 -20 --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -- .gitignrore';
        $actual = Command::getCommitList('master', '.gitignrore', '', 2);

        $this->assertSame($expected, $actual);
    }
}
