<?php
// Standalone regression test: php tests/security/repository_read_permission_test.php
// Executes the real endpoint methods with isolated request/service/model doubles.
namespace service\Network {
    class Request {
        public static $request;
        public static function parse() { return self::$request; }
    }
    class Response {
        public static function reject($code) { throw new \RuntimeException('Rejected', $code); }
        public static function output($data) { throw new \RuntimeException('Output', 200); }
    }
}
namespace service\AccessControl {
    class UserAccessController { const UAC_REPO_READ = 'repository-read'; }
}
namespace {
    $fixture = sys_get_temp_dir() . '/codefever-permission-' . uniqid();
    foreach (['libraries/Avatars', 'controllers/api'] as $dir) { mkdir($fixture . '/' . $dir, 0700, TRUE); }
    file_put_contents($fixture . '/libraries/Avatars/MaterialDesign.Avatars.class.php', '<?php');
    file_put_contents($fixture . '/libraries/storage.php', '<?php');
    file_put_contents($fixture . '/controllers/api/base.php', '<?php class Base { public $service; public $repositoryModel; }');
    register_shutdown_function(function () use ($fixture) {
        $entries = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($fixture, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($entries as $entry) {
            if ($entry->isDir()) { rmdir($entry->getPathname()); }
            else { unlink($entry->getPathname()); }
        }
        rmdir($fixture);
    });
    define('APPPATH', $fixture);
    require dirname(__DIR__, 2) . '/application/controllers/api/repository.php';

    $failures = 0;
    $checks = 0;
    function check($condition, $label) {
        global $failures, $checks;
        $checks++;
        if (!$condition) { $failures++; echo 'FAIL: ' . $label . "\n"; }
    }
    foreach (['commitDetail_get', 'refListContainSHA_get', 'lastCommitLog_get'] as $endpoint) {
        foreach ([FALSE, TRUE] as $allowed) {
            $controller = (new ReflectionClass('Repository'))->newInstanceWithoutConstructor();
            $controller->service = new class($allowed) {
                public $calls = [];
                private $allowed;
                public function __construct($allowed) { $this->allowed = $allowed; }
                public function requestRepositoryPermission($repository, $user, $permission) {
                    $this->calls[] = [$repository, $user, $permission];
                    return $this->allowed;
                }
            };
            $controller->repositoryModel = new class {
                public $calls = [];
                public function getCommitDetail($repository, $user, $hash) {
                    $this->calls[] = ['commit', $repository, $user, $hash];
                    return ['parent' => 'first second'];
                }
                public function normalizeCommitDetail($commit) { return $commit; }
                public function getLastCommit($repository, $user, $ref, $path) {
                    $this->calls[] = ['last', $repository, $user, $ref, $path];
                    return ['sha' => 'commit'];
                }
                public function getBranchListBySHA1($repository, $user, $hash) {
                    $this->calls[] = ['branch', $repository, $user, $hash]; return ['main'];
                }
                public function getTagListBySHA1($repository, $user, $hash) {
                    $this->calls[] = ['tag', $repository, $user, $hash]; return ['release'];
                }
            };
            \service\Network\Request::$request = (object) [
                'authData' => ['userData' => ['u_key' => 'request-user']],
                'query' => ['repository' => 'requested-repository', 'commitSHA' => 'HEAD', 'hash' => 'HEAD',
                    'ref' => 'HEAD', 'path' => '']
            ];
            $code = NULL;
            try { $controller->$endpoint(); }
            catch (RuntimeException $error) { $code = $error->getCode(); }
            check($controller->service->calls === [['requested-repository', 'request-user',
                \service\AccessControl\UserAccessController::UAC_REPO_READ]], $endpoint . ' checks requested repository and user');
            check($code === ($allowed ? 200 : 0x0106), $endpoint . ' returns expected access result');
            check($allowed ? count($controller->repositoryModel->calls) > 0 : $controller->repositoryModel->calls === [],
                $endpoint . ' blocks model access before authorization');
        }
    }
    echo ($failures ? 'FAILED' : 'PASSED') . ": $checks checks, $failures failures.\n";
    exit($failures ? 1 : 0);
}
