<?php
// Standalone regression test: php tests/security/tag_command_test.php
// Requires Git; uses only a disposable repository, without database or service setup.
use service\Git\Command as GitCommand;
use service\Utility\Command as ShellCommand;

require dirname(__DIR__, 2) . '/application/libraries/service/Git/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Command.php';

$fixture = sys_get_temp_dir() . '/codefever-tag-' . uniqid();
mkdir($fixture, 0700);
register_shutdown_function(function () use ($fixture) {
    $entries = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($fixture, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($entries as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            rmdir($entry->getPathname());
        } else {
            unlink($entry->getPathname());
        }
    }
    rmdir($fixture);
});

function check($condition, $label) {
    if (!$condition) { throw new RuntimeException('FAIL: ' . $label); }
    echo 'PASS: ' . $label . "\n";
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
    fclose($pipes[1]);
    fclose($pipes[2]);
    if (proc_close($process) !== 0) { throw new RuntimeException($error); }
    return rtrim($output, "\n");
}

function createTag($tag, $message = NULL, $origin = NULL) {
    global $fixture;
    // Exercise the same shell sink used by Repository_model::execCommand().
    return ShellCommand::batch([
        'cd ' . escapeshellarg($fixture),
        'git ' . GitCommand::createTag($tag, $message, $origin) . ' 2>&1'
    ]);
}

git(['init', '-q']);
git(['config', 'user.name', 'Tag Test']);
git(['config', 'user.email', 'tag-test@example.invalid']);
git(['-c', 'commit.gpgsign=false', 'commit', '-q', '--allow-empty', '-m', 'fixture']);
$sha = git(['rev-parse', 'HEAD']);
git(['branch', 'feature/release']);
git(['tag', 'source-tag']);

foreach ([NULL, '', 'HEAD', 'feature/release', 'source-tag', $sha, substr($sha, 0, 7)] as $index => $origin) {
    $tag = 'lightweight-' . $index;
    createTag($tag, '', $origin);
    check(git(['rev-parse', $tag]) === $sha, 'lightweight tag from source ' . $index);
    check(git(['cat-file', '-t', $tag]) === 'commit', 'lightweight type ' . $index);
    $tag = 'annotated-' . $index;
    createTag($tag, 'release', $origin);
    check(git(['rev-parse', $tag . '^{}']) === $sha, 'annotated tag from source ' . $index);
    check(git(['cat-file', '-t', $tag]) === 'tag', 'annotated type ' . $index);
}

// Marker writes are harmless and confined to the disposable repository.
$messages = [
    'notes; printf injected > marker',
    'release notes with spaces',
    "release's \"quoted\" notes \\ path",
    'notes $(printf injected > marker)',
    'notes `printf injected > marker`',
    "notes\nprintf injected > marker",
    'notes && printf injected > marker',
    'notes | printf injected > marker',
    'notes < input > output (parentheses) * ? [abc]',
    '--help',
];
foreach ($messages as $index => $message) {
    $tag = 'message-' . $index;
    createTag($tag, $message, 'HEAD');
    check(!file_exists($fixture . '/marker'), 'description cannot execute shell commands ' . $index);
    check(git(['for-each-ref', '--format=%(contents)', 'refs/tags/' . $tag]) === $message,
        'annotation preserved literally ' . $index);
}

$origins = [
    'HEAD; printf injected > marker',
    'HEAD$(printf injected > marker)',
    'HEAD`printf injected > marker`',
    "HEAD\nprintf injected > marker",
    'HEAD && printf injected > marker',
    'HEAD | printf injected > marker',
    "HEAD'; printf injected > marker; '",
    '--delete',
    '--list',
];
foreach ($origins as $index => $origin) {
    foreach (['', 'release notes'] as $message) {
        $before = git(['show-ref', '--tags']);
        createTag('invalid-origin-' . $index, $message, $origin);
        check(!file_exists($fixture . '/marker'), 'origin cannot execute shell commands ' . $index);
        check(git(['show-ref', '--tags']) === $before, 'invalid origin cannot change tags ' . $index);
    }
}

foreach (['-d', '--delete', 'bad; printf injected > marker'] as $tag) {
    $before = git(['show-ref', '--tags']);
    createTag($tag, '', 'source-tag');
    check(!file_exists($fixture . '/marker'), 'tag name cannot execute shell commands');
    check(git(['show-ref', '--tags']) === $before, 'tag name cannot inject options');
}
echo "All tag command tests passed.\n";
