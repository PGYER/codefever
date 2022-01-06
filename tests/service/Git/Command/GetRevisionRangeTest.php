<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class GetRevisionRangeTest extends TestCase {
    public function testGetRevisionRange()
    {
        $expected = 'log ' . TESTING_COMMIT_HASH . '..8a55f5e6e34222b314458aa6dfd560a048946b32 master --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}"';
        $actual = Command::getRevisionRange(TESTING_COMMIT_HASH, '8a55f5e6e34222b314458aa6dfd560a048946b32', 'master');

        $this->assertSame($expected, $actual);
    }
}
