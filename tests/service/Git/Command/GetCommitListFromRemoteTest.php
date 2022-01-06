<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class GetCommitListFromRemoteTest extends TestCase {
    public function testGetCommitListFromRemote()
    {
        $expected = TESTING_COMMIT_HASH . ' 8a55f5e6e34222b314458aa6dfd560a048946b32 git@git.pgyer.com/test.git 8a55f5e6e34222b314458aa6dfd560a048946b33 {sha:%H,log:%s,body:%b,email:%ae,time:%at}';
        $actual = Command::getCommitListFromRemote(
            TESTING_COMMIT_HASH,
            '8a55f5e6e34222b314458aa6dfd560a048946b32',
            'git@git.pgyer.com/test.git',
            '8a55f5e6e34222b314458aa6dfd560a048946b33');

        $this->assertSame($expected, $actual);
    }
}
