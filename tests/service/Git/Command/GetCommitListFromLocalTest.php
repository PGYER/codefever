<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class GetCommitListFromLocalTest extends TestCase {
    public function testGetCommitListFromLocal()
    {
        $expected = 'log --cherry-pick --right-only ' . TESTING_COMMIT_HASH . '...8a55f5e6e34222b314458aa6dfd560a048946b32 --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}"';
        $actual = Command::getCommitListFromLocal(TESTING_COMMIT_HASH, '8a55f5e6e34222b314458aa6dfd560a048946b32');

        $this->assertSame($expected, $actual);
    }
}
