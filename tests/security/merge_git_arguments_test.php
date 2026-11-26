<?php
// Requires Git. Both repositories and all Git workspaces are local fixtures.
use service\Git\Command as GitCommand;

$root = dirname(__DIR__, 2);
foreach (['Command', 'Helper', 'UUID', 'Workspace'] as $name) {
    require $root . '/application/libraries/service/Utility/' . $name . '.php';
}
require $root . '/application/libraries/service/Git/Command.php';
class CI_Model { public $userModel; }
require $root . '/application/models/repository_model.php';

$fixture = sys_get_temp_dir() . '/codefever-merge-' . uniqid();
mkdir($fixture, 0700);
define('YAML_CLI_GIT', 'git');
define('WORKSPACE_DIR', $fixture . '/workspaces');
define('GIT_COMMAND_QUERY', 'query');
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

function check($condition, string $label)
{
    if (!$condition) { throw new RuntimeException('FAIL: ' . $label); }
}

function git(array $arguments)
{
    global $fixture;
    $process = proc_open(array_merge(['git'], $arguments), [1 => ['pipe', 'w']], $pipes, $fixture);
    $output = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    check(proc_close($process) === 0, 'Git fixture setup ' . $arguments[0]);
    return trim($output);
}

class MergeFixture extends Repository_model
{
    public $lookups = 0;
    private $fixture;

    public function __construct(string $fixture)
    {
        $this->fixture = $fixture;
        $this->userModel = new class {
            public function get($id) { return ['u_email' => 'fixture@example.invalid']; }
        };
    }

    public function getAccessURL(string $repository, string $user)
    {
        $this->lookups++;
        return $this->fixture . '/' . $repository . '.git';
    }

    public function execCommand(string $repository, string $user, string $type, string $command = NULL)
    {
        $this->lookups++;
        return service\Utility\Command::batch([
            'git --git-dir=' . escapeshellarg($this->fixture . '/' . $repository . '.git') . ' ' . $command
        ]);
    }
}

$model = new MergeFixture($fixture);
foreach (['', '-option-like', 'two words', 'topic:other', 'topic/*', 'topic//branch', 'topic/.hidden', "branch\0", 'HEAD'] as $name) {
    check(!GitCommand::isBranchName($name), 'reject invalid branch name');
    check($model->mergeBranch('source', $name, 'target', 'main', 'fixture') === FALSE, 'reject source name before Git');
    check($model->mergeBranch('source', 'topic', 'target', $name, 'fixture') === FALSE, 'reject target name before Git');
}
check($model->canBeFastForward('source', 'HEAD', 'target', str_repeat('a', 40), 'fixture') === FALSE, 'ancestry check requires a commit ID');
check($model->canBeFastForward('source', str_repeat('a', 40), 'target', '', 'fixture') === FALSE, 'ancestry check rejects missing target ID');
check($model->lookups === 0, 'invalid input never resolves repositories or runs Git');

git(['init', '-q', 'local']);
git(['-C', 'local', 'checkout', '-qb', 'main']);
git(['-C', 'local', 'config', 'user.email', 'fixture@example.invalid']);
git(['-C', 'local', 'config', 'user.name', 'Fixture']);
git(['-C', 'local', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-qm', 'base']);
$baseHash = git(['-C', 'local', 'rev-parse', 'HEAD']);
$branch = 'feature/quoted;name';
git(['-C', 'local', 'checkout', '-qb', $branch]);
file_put_contents($fixture . '/local/feature.txt', "feature\n");
git(['-C', 'local', 'add', 'feature.txt']);
git(['-C', 'local', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'feature']);
$featureHash = git(['-C', 'local', 'rev-parse', 'HEAD']);
git(['clone', '-q', '--bare', 'local', 'source.git']);
check(GitCommand::isBranchName($branch), 'valid nested branch with shell punctuation is accepted');

foreach ([[NULL, FALSE], ['Merge feature', FALSE], ['Squash feature', TRUE]] as $mode) {
    $target = 'target-' . ($mode[0] === NULL ? 'ff' : ($mode[1] ? 'squash' : 'merge'));
    git(['clone', '-q', '--bare', '--single-branch', '-b', 'main', 'local', $target . '.git']);
    check($model->canBeFastForward('source', $featureHash, $target, $baseHash, 'fixture'), 'valid commit IDs preserve ancestry checks');
    check(is_array($model->mergeBranch('source', $branch, $target, 'main', 'fixture', $mode[0], $mode[1])), 'normal merge returns Git output');
    check(git(['--git-dir=' . $target . '.git', 'show', 'refs/heads/main:feature.txt']) === 'feature', 'merge pushes the intended branch');
    check(glob(WORKSPACE_DIR . '/*') === [], 'merge workspace is cleaned up');
}
echo "Merge Git argument checks passed.\n";
