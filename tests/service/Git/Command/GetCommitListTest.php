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
        $expected = 'log master --grep=\'fix\' --skip 20 -20 --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}"';
        $actual = Command::getCommitList('master', '', 'fix', 2);

        $this->assertSame($expected, $actual);
    }

    public function testGetCommitList_Path()
    {
        $expected = 'log master --skip 20 -20 --pretty="{sha:%H,log:%s,body:%b,email:%ae,time:%at}" -- \'.gitignrore\'';
        $actual = Command::getCommitList('master', '.gitignrore', '', 2);

        $this->assertSame($expected, $actual);
    }

    /**
     * @dataProvider shellArguments
     */
    public function testGetCommitList_QuotesKeyword($input, $quoted)
    {
        $expected = str_replace(' --skip ', ' --grep=' . $quoted . ' --skip ', Command::getCommitList('master'));

        $this->assertSame($expected, Command::getCommitList('master', '', $input));
    }

    /**
     * @dataProvider shellArguments
     */
    public function testGetCommitList_QuotesPath($input, $quoted)
    {
        $expected = Command::getCommitList('master') . ' -- ' . $quoted;

        $this->assertSame($expected, Command::getCommitList('master', $input));
    }

    public function shellArguments()
    {
        return [
            'spaces' => ['fix a bug', "'fix a bug'"],
            'unicode' => ['修复 目录/文件', "'修复 目录/文件'"],
            'single quote' => ["it's fixed", "'it'\\''s fixed'"],
            'double quote' => ['a "quote"', "'a \"quote\"'"],
            'command separator' => ['fix; printf injected; #', "'fix; printf injected; #'"],
            'command substitution' => ['$(printf injected)`printf injected`', "'\$(printf injected)`printf injected`'"],
            'operators' => ['fix|cat&true>marker<input', "'fix|cat&true>marker<input'"],
            'backslash' => ['dir\file', "'dir\\file'"],
            'newline' => ["line\nbreak", "'line\nbreak'"],
            'leading option' => ['--all', "'--all'"],
        ];
    }
}
