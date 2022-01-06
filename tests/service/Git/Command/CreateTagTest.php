<?php
namespace Git;

use PHPUnit\Framework\TestCase;
use service\Git\Command;

class CreateTagTest extends TestCase {
    public function testCreateTag()
    {
        $expected = 'tag v0.0.1';
        $actual = Command::createTag('v0.0.1');

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_Message()
    {
        $expected = 'tag -a v0.0.1 -m test';
        $actual = Command::createTag('v0.0.1', 'test');

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_Sha()
    {
        $expected = 'tag v0.0.1 ' . TESTING_COMMIT_HASH;
        $actual = Command::createTag('v0.0.1', '', TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }

    public function testCreateTag_Message_Sha()
    {
        $expected = 'tag -a v0.0.1 -m test ' . TESTING_COMMIT_HASH;
        $actual = Command::createTag('v0.0.1', 'test', TESTING_COMMIT_HASH);

        $this->assertSame($expected, $actual);
    }
}
