<?php
// Standalone: php tests/security/repository_comparison_permission_test.php
// Real endpoint/model methods; no database, credentials, or live repositories.
namespace service\Network {
    class Request {
        public static $request;
        public static function parse() { return self::$request; }
    }
    class Response {
        public static $data;
        public static function reject($code) { throw new \RuntimeException('Rejected', $code); }
        public static function output($data) {
            self::$data = $data;
            throw new \RuntimeException('Output', 200);
        }
    }
}
namespace service\AccessControl {
    class UserAccessController { const UAC_REPO_READ = 'repository-read'; }
}
namespace {
    $root = dirname(__DIR__, 2);
    $fixture = sys_get_temp_dir() . '/codefever-comparison-' . uniqid();
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
    define('MAX_DISPLAY_DIFF_FILE', 100);
    define('MAX_DISPLAY_DIFF_LINE', 500);
    define('MAX_DISPLAY_DIFF_LENGTH', 0x2000);
    define('COMMON_STATUS_NORMAL', 1);
    require $root . '/application/controllers/api/repository.php';
    require $root . '/application/libraries/service/Utility/Helper.php';
    require $root . '/application/libraries/service/Constant/MergeRequestStatus.php';
    class CI_Model {}
    require $root . '/application/models/repository_model.php';

    $failures = 0;
    $checks = 0;
    function check($condition, $label) {
        global $failures, $checks;
        $checks++;
        if (!$condition) { $failures++; echo 'FAIL: ' . $label . "\n"; }
    }
    function invokeEndpoint($endpoint, array $query, array $readable) {
        $controller = (new ReflectionClass('Repository'))->newInstanceWithoutConstructor();
        $controller->service = new class($readable) {
            public $calls = [];
            private $readable;
            public function __construct($readable) { $this->readable = $readable; }
            public function requestRepositoryPermission($repository, $user, $permission) {
                $this->calls[] = [$repository, $user, $permission];
                return in_array($repository, $this->readable, TRUE);
            }
        };
        $controller->repositoryModel = new class {
            public $calls = [];
            public function getMergeRequestLastCommitSha(...$args) {
                $this->calls[] = ['resolve', $args]; return ['source-sha', 'target-sha'];
            }
            public function getDiffWithLocalCount(...$args) { $this->calls[] = ['count', $args]; return 0; }
            private function fixtureDiff() {
                return "diff --git a/canary.txt b/canary.txt\nnew file mode 100644\n" .
                    "index 0000000..1111111\n--- /dev/null\n+++ b/canary.txt\n@@ -0,0 +1 @@\n+PRIVATE-FIXTURE-MARKER\n";
            }
            public function getDiffWithLocal(...$args) { $this->calls[] = ['local-diff', $args]; return $this->fixtureDiff(); }
            public function getDiffWithRemote(...$args) { $this->calls[] = ['remote-diff', $args]; return $this->fixtureDiff(); }
            public function getCommitWithLocal(...$args) { $this->calls[] = ['local-commits', $args]; return []; }
            public function getCommitWithRemote(...$args) { $this->calls[] = ['remote-commits', $args]; return []; }
            public function normalizeCommits($commits) { return $commits; }
        };
        \service\Network\Request::$request = (object) [
            'authData' => ['userData' => ['u_key' => 'reader']], 'query' => $query
        ];
        \service\Network\Response::$data = NULL;
        $code = NULL;
        try { $controller->$endpoint(); }
        catch (RuntimeException $error) { $code = $error->getCode(); }
        return [$controller, $code];
    }

    // A nonempty mergeRequest must never bypass source or target read access.
    foreach (['', 'forged-mr', 'existing-mr'] as $mr) {
        foreach (['', 'source', 'target'] as $target) {
            foreach ([FALSE, TRUE] as $versionCompare) {
                $query = ['repository' => 'source', 'original' => '', 'modified' => 'main',
                    'mergeRequest' => $mr, 'targetRepository' => $target, 'versionCompare' => $versionCompare];
                foreach ([[], ['source'], ['target'], ['source', 'target']] as $readable) {
                    $allowed = in_array('source', $readable, TRUE) &&
                        (!$target || in_array($target, $readable, TRUE));
                    list($controller, $code) = invokeEndpoint('fileChanges_get', $query, $readable);
                    $label = 'fileChanges ' . json_encode([$mr, $target, $versionCompare, $readable]);
                    check($code === ($allowed ? 200 : 0x0106), $label . ' access result');
                    check($allowed ? strpos(json_encode(\service\Network\Response::$data), 'PRIVATE-FIXTURE-MARKER') !== FALSE :
                        \service\Network\Response::$data === NULL, $label . ' content only returned to authorized readers');
                    if (!$allowed) {
                        check($controller->repositoryModel->calls === [], $label . ' denied before model access');
                    } else {
                        $expected = [['source', 'reader', \service\AccessControl\UserAccessController::UAC_REPO_READ]];
                        if ($target && $target !== 'source') {
                            $expected[] = ['target', 'reader', \service\AccessControl\UserAccessController::UAC_REPO_READ];
                        }
                        check($controller->service->calls === $expected, $label . ' checks both repositories');
                        $methods = array_column($controller->repositoryModel->calls, 0);
                        check(in_array($target === 'target' ? 'remote-diff' : 'local-diff', $methods, TRUE),
                            $label . ' preserves normal diff path');
                    }
                }
            }
        }
    }
    foreach (['', 'existing-mr'] as $mr) {
        foreach (['source', 'target'] as $target) {
            $query = ['sourceRepository' => 'source', 'sourceBranch' => 'feature',
                'targetRepository' => $target, 'targetBranch' => 'main', 'mergeRequest' => $mr];
            foreach ([[], ['source'], ['target'], ['source', 'target']] as $readable) {
                $allowed = in_array('source', $readable, TRUE) && in_array($target, $readable, TRUE);
                list($controller, $code) = invokeEndpoint('mergeRequestCommits_get', $query, $readable);
                $label = 'mergeRequestCommits ' . json_encode([$mr, $target, $readable]);
                check($code === ($allowed ? 200 : 0x0106), $label . ' access result');
                if (!$allowed) {
                    check($controller->repositoryModel->calls === [], $label . ' denied before model access');
                } else {
                    $methods = array_column($controller->repositoryModel->calls, 0);
                    check(in_array($target === 'source' ? 'local-commits' : 'remote-commits', $methods, TRUE),
                        $label . ' preserves normal commit path');
                }
            }
        }
    }

    // An existing MR key cannot supply objects from different repository identities.
    $model = new class extends Repository_model {
        public $record;
        public $reads = [];
        public function __construct() {}
        public function getMergeRequestByKey(string $key) { return $this->record; }
        public function getLastCommit(string $repository, string $user, string $branch, string $path, string $lastSha = '') {
            $this->reads[] = $repository;
            return ['sha' => $repository . '-head'];
        }
    };
    foreach ([['source', 'target'], ['source', 'source']] as $pair) {
        foreach ([['source', 'target'], ['victim', 'target'], ['source', 'victim'], ['victim', 'victim']] as $recordPair) {
            foreach ([FALSE, TRUE] as $merged) {
                $model->record = ['sourceRepository' => $recordPair[0], 'targetRepository' => $recordPair[1],
                    'sourceObject' => $merged ? 'stored-source' : '', 'targetObject' => $merged ? 'stored-target' : ''];
                $model->reads = [];
                $result = $model->getMergeRequestLastCommitSha('reader', 'existing-mr', $pair[0], 'feature', $pair[1], 'main');
                $match = $pair === $recordPair;
                check($match ? is_array($result) : $result === FALSE, 'MR repository binding ' . json_encode([$pair, $recordPair, $merged]));
                if (!$match) { check($model->reads === [], 'mismatched MR cannot read branch heads'); }
            }
        }
    }
    $model->record = FALSE;
    check($model->getMergeRequestLastCommitSha('reader', 'missing', 'source', 'feature', 'target', 'main') === FALSE,
        'unknown MR rejected');
    $model->reads = [];
    check($model->getMergeRequestLastCommitSha('reader', '', 'source', 'feature', 'target', 'main') === ['source-head', 'target-head'],
        'comparison preview without an MR is preserved');

    // This listing already scopes results to the caller's joined repositories.
    foreach ([[], [['id' => 'joined-repo']], [['id' => 'joined-repo'], ['id' => 'guest-repo']]] as $joined) {
        $controller = (new ReflectionClass('Repository'))->newInstanceWithoutConstructor();
        $controller->repositoryModel = new class($joined) {
            private $joined;
            public $conditions;
            public function __construct($joined) { $this->joined = $joined; }
            public function listJoined($user) { return $this->joined; }
            public function normalize($list) { return $list; }
            public function getMemberRole($repository, $user) { return $repository === 'joined-repo' ? 2 : 1; }
            public function getMergeRequests($conditions, $sort, $page, $size) {
                $this->conditions = $conditions; return [];
            }
            public function normalizeMergeRequests($list) { return $list; }
        };
        \service\Network\Request::$request = (object) [
            'authData' => ['userData' => ['u_key' => 'reader']],
            'query' => ['repository' => 'victim', 'status' => 0, 'keyword' => '', 'sort' => 'desc', 'page' => 1, 'pagesize' => 20]
        ];
        try { $controller->relatedMergeRequests_get(); }
        catch (RuntimeException $error) { check($error->getCode() === 200, 'related MR listing completes'); }
        $expected = count($joined) ? ['joined-repo'] : [];
        check(\service\Network\Response::$data['relatedRepository'] === $expected,
            'related MR listing cannot use caller-supplied victim repository');
        if ($expected) {
            check($controller->repositoryModel->conditions['mr_target_r_key'] === $expected,
                'related MR model query remains limited to joined repositories');
        }
    }

    echo ($failures ? 'FAILED' : 'PASSED') . ": $checks checks, $failures failures.\n";
    exit($failures ? 1 : 0);
}
