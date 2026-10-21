<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class CreateTagTest extends TestCase {
    public function testCreateTag()
    {
        $expected = "tag -- 'v0.0.1'";
        $actual = Command::createTag('v0.0.1');

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_Message()
    {
        $expected = "tag -a -m 'test' -- 'v0.0.1'";
        $actual = Command::createTag('v0.0.1', 'test');

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_Sha()
    {
        $expected = "tag -- 'v0.0.1' '" . TESTING_COMMIT_HASH . "'";
        $actual = Command::createTag('v0.0.1', '', TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_Message_Sha()
    {
        $expected = "tag -a -m 'test' -- 'v0.0.1' '" . TESTING_COMMIT_HASH . "'";
        $actual = Command::createTag('v0.0.1', 'test', TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_QuotesShellInput()
    {
        $actual = Command::createTag('v1', "release's $(echo message)", 'HEAD;echo origin');

        $this->assertSame("tag -a -m 'release'\\''s $(echo message)' -- 'v1' 'HEAD;echo origin'", $actual);
    }

    public function testCreateTag_SeparatesOptions()
    {
        $this->assertSame("tag -- '-d' '--list'", Command::createTag('-d', '', '--list'));
    }
}
