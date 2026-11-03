<?php
// Standalone regression test: php tests/security/revision_command_test.php
// Requires Git; all shell commands and marker files stay in a disposable fixture.
use service\Git\Command as GitCommand;
use service\Utility\Command as ShellCommand;

require dirname(__DIR__, 2) . '/application/libraries/service/Git/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Helper.php';

$fixture = sys_get_temp_dir() . '/codefever-revision-' . uniqid();
mkdir($fixture, 0700);
register_shutdown_function(function () use ($fixture) {
    $entries = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($fixture, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($entries as $entry) {
        if ($entry->isDir() && !$entry->isLink()) { rmdir($entry->getPathname()); }
        else { unlink($entry->getPathname()); }
    }
    rmdir($fixture);
});

$failures = 0;
$checks = 0;
function check($condition, $label) {
    global $failures, $checks;
    $checks++;
    if (!$condition) { $failures++; echo 'FAIL: ' . $label . "\n"; }
}
function git(array $arguments) {
    global $fixture;
    $process = proc_open(array_merge(['git'], $arguments), [
        0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']
    ], $pipes, $fixture);
    if (!is_resource($process)) { throw new RuntimeException('Cannot run Git'); }
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0) { throw new RuntimeException($error); }
    return rtrim($output, "\n");
}
function runCommand($command) {
    global $fixture;
    if ($command === FALSE) { return ''; }
    return ShellCommand::batch([
        'cd ' . escapeshellarg($fixture), 'git ' . $command . ' 2>/dev/null'
    ]);
}

git(['init', '-q']);
git(['config', 'user.name', 'Revision Test']);
git(['config', 'user.email', 'revision-test@example.invalid']);
file_put_contents($fixture . '/file.txt', "first\n");
git(['add', '.']);
git(['-c', 'commit.gpgsign=false', 'commit', '-qm', 'first']);
$first = git(['rev-parse', 'HEAD']);
file_put_contents($fixture . '/file.txt', "second\n");
git(['-c', 'commit.gpgsign=false', 'commit', '-qam', 'second']);
$second = git(['rev-parse', 'HEAD']);
git(['branch', 'feature/revision']);
git(['tag', 'source-tag']);

foreach (['HEAD', 'feature/revision', 'source-tag', $second, substr($second, 0, 7)] as $ref) {
    check(strpos(runCommand(GitCommand::getCommitLog($ref)), $second) !== FALSE, 'commit detail ' . $ref);
    check(strpos(runCommand(GitCommand::getBranchListBySHA($ref)), 'feature/revision') !== FALSE, 'containing branch ' . $ref);
    check(strpos(runCommand(GitCommand::getTagListBySHA($ref)), 'source-tag') !== FALSE, 'containing tag ' . $ref);
}
check(strpos(runCommand(GitCommand::getCommitLog('HEAD^')), $first) !== FALSE, 'relative revision');
check(strpos(runCommand(GitCommand::getDiffCount($first, $second)), 'file.txt') !== FALSE, 'diff count');
check(strpos(runCommand(GitCommand::getDiffDetail($first, $second)), '+second') !== FALSE, 'diff detail');
foreach (['', str_repeat('0', 40)] as $root) {
    check(strpos(runCommand(GitCommand::getDiffCount($root, $first)), 'file.txt') !== FALSE, 'initial commit count');
    check(strpos(runCommand(GitCommand::getDiffDetail($root, $first)), '+first') !== FALSE, 'initial commit detail');
}
// Shell punctuation can be part of a valid Git ref; preserve it literally.
git(['tag', 'literal;tag']);
check(strpos(runCommand(GitCommand::getCommitLog('literal;tag')), $second) !== FALSE, 'literal punctuation in revision');
runCommand(GitCommand::deleteTag('literal;tag'));
check(strpos(git(['tag', '-l']), 'literal;tag') === FALSE, 'delete literal punctuation tag');
git(['tag', 'delete-me']);
runCommand(GitCommand::deleteTag('delete-me'));
check(strpos(git(['tag', '-l']), 'delete-me') === FALSE, 'normal tag deletion');

$commands = [
    'commit detail' => function ($ref) { return GitCommand::getCommitLog($ref); },
    'containing branches' => function ($ref) { return GitCommand::getBranchListBySHA($ref); },
    'containing tags' => function ($ref) { return GitCommand::getTagListBySHA($ref); },
    'diff count original' => function ($ref) { return GitCommand::getDiffCount($ref, 'HEAD'); },
    'diff count modified' => function ($ref) { return GitCommand::getDiffCount('HEAD^', $ref); },
    'diff detail original' => function ($ref) { return GitCommand::getDiffDetail($ref, 'HEAD'); },
    'diff detail modified' => function ($ref) { return GitCommand::getDiffDetail('HEAD^', $ref); },
    'initial count' => function ($ref) { return GitCommand::getDiffCount(str_repeat('0', 40), $ref); },
    'initial detail' => function ($ref) { return GitCommand::getDiffDetail('', $ref); },
    'delete tag' => function ($ref) { return GitCommand::deleteTag($ref); },
];
$payloads = [
    'HEAD;printf injected>marker;echo',
    'HEAD$(printf injected>marker)',
    'HEAD`printf injected>marker`',
    "HEAD\nprintf injected>marker\necho",
    'HEAD && printf injected>marker',
    'HEAD | printf injected>marker',
    "HEAD';printf injected>marker;echo '",
    'HEAD>marker',
];
foreach ($commands as $name => $build) {
    foreach ($payloads as $index => $payload) {
        runCommand($build($payload));
        clearstatcache();
        check(!file_exists($fixture . '/marker'), $name . ' blocks shell payload ' . $index);
        if (file_exists($fixture . '/marker')) { unlink($fixture . '/marker'); }
    }
}
// Reject revisions that Git could treat as options, including file-writing flags.
foreach (['--output=marker', '--help', '-p'] as $option) {
    foreach ($commands as $name => $build) {
        if ($name === 'delete tag') { continue; }
        check($build($option) === FALSE, $name . ' rejects option ' . $option);
    }
}
$tags = git(['show-ref', '--tags']);
foreach (['--delete', '--list', '-l'] as $option) { runCommand(GitCommand::deleteTag($option)); }
check(git(['show-ref', '--tags']) === $tags, 'tag options cannot alter other tags');
check(!file_exists($fixture . '/marker'), 'Git options cannot write a file');
echo ($failures ? 'FAILED' : 'PASSED') . ": $checks checks, $failures failures.\n";
exit($failures ? 1 : 0);
