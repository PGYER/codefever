<?php
// Standalone regression test: php tests/security/revision_command_test.php
// Requires Git; all shell commands and marker files stay in a disposable fixture.
use service\Git\Command as GitCommand;
use service\Utility\Command as ShellCommand;

require dirname(__DIR__, 2) . '/application/libraries/service/Git/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Command.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/Helper.php';
require dirname(__DIR__, 2) . '/application/libraries/service/Utility/UUID.php';
class CI_Model {}
require dirname(__DIR__, 2) . '/application/models/repository_model.php';

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


define('APPPATH', $fixture . '/application');
define('YAML_CLI_GIT', 'git');
define('GIT_COMMAND_INIT', 'init');
define('GIT_COMMAND_FORK', 'fork');
define('GIT_COMMAND_QUERY', 'query');
define('GIT_COMMAND_DIFF_REMOTE', 'diff-remote');
define('GIT_COMMAND_LOG_REMOTE', 'log-remote');
mkdir($fixture . '/git-storage', 0700);
function gitFixture($args) {
    global $fixture;
    $p = proc_open(array_merge(['git'], $args), [0 => ['pipe','r'], 1 => ['pipe','w'], 2 => ['pipe','w']], $pipes, $fixture);
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($p) !== 0) { throw new RuntimeException($err); } return trim($out);
}
gitFixture(['init', '-q', 'local']);
gitFixture(['-C','local','config','user.name','Fixture']);
gitFixture(['-C','local','config','user.email','fixture@example.invalid']);
file_put_contents($fixture . '/local/file.txt', "first\n");
gitFixture(['-C','local','add','.']);
gitFixture(['-C','local','-c','commit.gpgsign=false','commit','-qm','first']);
$first = gitFixture(['-C','local','rev-parse','HEAD']);
gitFixture(['clone','--bare','local','git-storage/local.git']);
gitFixture(['--git-dir=git-storage/local.git','remote','remove','origin']);
file_put_contents($fixture . '/local/file.txt', "second\n");
gitFixture(['-C','local','commit','-qam','second']);
gitFixture(['clone','--bare','local','remote.git']);
$second = gitFixture(['-C','local','rev-parse','HEAD']);
class RemoteFixture extends Repository_model {
    public function __construct() { $this->userModel = new class { public function get($key) { return ['u_email'=>'fixture@example.invalid']; } }; }
    public function get(string $key) { return ['r_path'=>'/local.git']; }
    public function getAccessURL(string $rKey, string $uKey) { global $fixture; return $fixture . '/remote.git'; }
}
$model = new RemoteFixture(); $checks = 0;
function check($condition, $label) { global $checks; $checks++; if (!$condition) { throw new RuntimeException('FAIL: ' . $label); } }
// Execute both real model entry points, shell batching and Git; use only inert markers.
foreach (['getDiffWithRemote','getCommitWithRemote'] as $method) {
    foreach (['$(touch${IFS}marker)', '`touch${IFS}marker`', 'HEAD;touch marker;#', 'HEAD|touch marker', "HEAD\ntouch marker", '--output=marker', '-p', 'HEAD...HEAD', ''] as $payload) {
        foreach ([0,1] as $side) {
            $args = ['local', $side === 0 ? $payload : $first, 'remote', $side === 1 ? $payload : $second, 'fixture'];
            $result = $model->$method(...$args);
            check($result === FALSE, $method . ' rejects ' . $payload);
            check(!file_exists($fixture . '/git-storage/local.git/marker'), 'no injected marker');
            check(gitFixture(['--git-dir=git-storage/local.git','remote']) === '', 'rejected input causes no remote mutation');
        }
    }
}
$diff = $model->getDiffWithRemote('local', $second, 'remote', $first, 'fixture');
check(strpos($diff, 'file.txt') !== FALSE, 'authorized cross-repository diff works');
$commits = $model->getCommitWithRemote('local', $second, 'remote', 'HEAD', 'fixture');
check(is_array($commits) && count($commits) === 1, 'authorized cross-repository log works with HEAD');
check(gitFixture(['--git-dir=git-storage/local.git','remote']) === '', 'temporary remotes cleaned');
echo "$checks cross-repository command checks, 0 failures.\n";
