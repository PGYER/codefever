<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class GetLastLogTest extends TestCase {
    public function testGetLastLog()
    {
        $expected = 'log -1 --left-only master --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -- ';
        $actual = Command::getLastLog('master', '');

        $this->assertSame($expected, $actual);
    }

    public function testGetLastLog_File()
    {
        $expected = 'log -1 --left-only master --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -- application';
        $actual = Command::getLastLog('master', 'application');

        $this->assertSame($expected, $actual);
    }

    public function testGetLastLog_Sha()
    {
        $expected = 'log -1 --left-only ' . TESTING_COMMIT_HASH . ' --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -- ';
        $actual = Command::getLastLog('master', '', TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }

    public function testGetLastLog_File_Sha()
    {
        $expected = 'log -1 --left-only ' . TESTING_COMMIT_HASH . ' --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -- application';
        $actual = Command::getLastLog('master', 'application', TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }
}
