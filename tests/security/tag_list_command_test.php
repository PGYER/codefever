<?php
// Standalone regression test: php tests/security/tag_list_command_test.php
// Push real tags, then exercise the original model and shell runner without a database.
use service\Git\Command as GitCommand;

require dirname(__DIR__, 2) . '/application/libraries/service/Git/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Helper.php';

class CI_Model { public $userModel; }
require dirname(__DIR__, 2) . '/application/models/repository_model.php';

class TagListRepositoryFixture extends Repository_model
{
    public function __construct()
    {
        $this->userModel = new class {
            public function get($key) { return ['u_email' => 'tag-test@example.invalid']; }
        };
    }

    public function get(string $rKey) { return ['r_path' => '/bare.git']; }
}

$fixture = sys_get_temp_dir() . '/codefever-tag-list-' . uniqid();
mkdir($fixture, 0700);
mkdir($fixture . '/git-storage', 0700);
define('APPPATH', $fixture . '/application');
define('YAML_CLI_GIT', 'git');
define('GIT_COMMAND_INIT', 'i');
define('GIT_COMMAND_FORK', 'f');
define('GIT_COMMAND_QUERY', 'q');
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

$checks = 0;
function check($condition, $label) {
    global $checks;
    $checks++;
    if (!$condition) { throw new RuntimeException('FAIL: ' . $label); }
}
function git(array $arguments) {
    global $fixture;
    $process = proc_open(array_merge(['git'], $arguments), [
        0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']
    ], $pipes, $fixture . '/local');
    if (!is_resource($process)) { throw new RuntimeException('Cannot run Git'); }
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0) { throw new RuntimeException($error); }
    return rtrim($output, "\n");
}

mkdir($fixture . '/local', 0700);
git(['init', '-q']);
git(['config', 'user.name', 'Tag Test']);
git(['config', 'user.email', 'tag-test@example.invalid']);
git(['-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-qm', 'tag fixture']);
$sha = git(['rev-parse', 'HEAD']);
$bare = $fixture . '/git-storage/bare.git';
git(['init', '--bare', '-q', $bare]);
$names = [
    'ordinary', 'release/v1.0', 'literal;tag', "literal'tag", '发布版',
    'x;echo>marker;#', 'x$(echo>marker)', 'x`echo>marker`', 'x>marker',
];
foreach ($names as $name) {
    git(['check-ref-format', 'refs/tags/' . $name]);
    git(['tag', $name]);
}
git(['-c', 'tag.gpgsign=false', 'tag', '-a', 'annotated', '-m', 'release notes']);
$names[] = 'annotated';
git(['push', '-q', $bare, '--tags']);

$model = new TagListRepositoryFixture();
$tags = $model->getTags('fixture-repository', 'fixture-user');
clearstatcache();
check(!file_exists($bare . '/marker'), 'listing pushed tags cannot execute shell commands');
check(count($tags) === count($names), 'all pushed tags are listed');
$byName = array_column($tags, NULL, 'name');
foreach ($names as $name) {
    check(isset($byName[$name]), 'literal tag name preserved: ' . $name);
    check(isset($byName[$name]['commit']['sha']) && $byName[$name]['commit']['sha'] === $sha,
        'commit detail resolved: ' . $name);
}
check(trim($byName['annotated']['detail']) === 'release notes', 'annotation preserved');
foreach (['', '--output=marker', '--help', '-p'] as $invalid) {
    check(GitCommand::showTagCommit($invalid) === FALSE, 'reject empty or option-like tag: ' . $invalid);
}
echo "PASSED: $checks checks.\n";
