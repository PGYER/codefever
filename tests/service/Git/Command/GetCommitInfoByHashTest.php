<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class GetCommitInfoByHashTest extends TestCase {
    public function testGetCommitInfoByHash()
    {
        $expected = 'log --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -1 ' . TESTING_COMMIT_HASH;
        $actual = Command::getCommitInfoByHash(TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }

    public function testGetCommitInfoByHash_Empty()
    {
        $actual = Command::getCommitInfoByHash('');
        $this->assertFalse($actual);
    }
}
