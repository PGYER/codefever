<?php
// Real API and model methods with synthetic rows. No live server or database required.
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

namespace {
    use service\AccessControl\UserAccessController as Access;
    use service\Constant\MergeRequestStatus;
    use service\Network\Request;
    use service\Network\Response;
    use service\Utility\TOTP;

    $root = dirname(__DIR__, 2);
    $fixture = sys_get_temp_dir() . '/codefever-scope-' . uniqid();
    foreach (['libraries/Avatars', 'controllers/api'] as $dir) { mkdir($fixture . '/' . $dir, 0700, TRUE); }
    file_put_contents($fixture . '/libraries/Avatars/MaterialDesign.Avatars.class.php', '<?php');
    file_put_contents($fixture . '/libraries/storage.php', '<?php');
    file_put_contents($fixture . '/controllers/api/base.php', '<?php class Base { public $service; public $repositoryModel; public $groupModel; public $userModel; }');
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
    define('COMMON_STATUS_NORMAL', 1);
    define('COMMON_STATUS_DELETE', 2);
    define('GLOBAL_TRUE', 1);
    define('TOTP_SALT', 'fixture');
    require $root . '/application/libraries/service/AccessControl/AccessController.php';
    require $root . '/application/config/access_controller.php';
    require $root . '/application/libraries/service/Utility/TOTP.php';
    require $root . '/application/libraries/service/Git/Command.php';
    require $root . '/application/libraries/service/Constant/MergeRequestStatus.php';
    require $root . '/application/controllers/api/repository.php';
    require $root . '/application/controllers/api/user.php';
    class CI_Model { public $db; }
    require $root . '/application/models/repository_model.php';
    require $root . '/application/models/user_model.php';

    class ScopeDatabase {
        public $tables = [];
        private $filters = [];
        private $affected = 0;

        public function where($column, $value = NULL) {
            $this->filters = array_merge($this->filters, is_array($column) ? $column : [$column => $value]);
        }

        public function limit($count) {}

        private function matches($row) {
            return array_intersect_key($row, $this->filters) == $this->filters;
        }

        public function get($table) {
            $rows = array_values(array_filter($this->tables[$table], [$this, 'matches']));
            $this->filters = [];
            return new class($rows) {
                private $rows;
                public function __construct($rows) { $this->rows = $rows; }
                public function row_array() { return $this->rows[0] ?? []; }
            };
        }

        public function update($table, $data) {
            $this->affected = 0;
            foreach ($this->tables[$table] as &$row) {
                if ($this->matches($row)) {
                    $updated = array_replace($row, $data);
                    if ($updated !== $row) { $this->affected++; }
                    $row = $updated;
                }
            }
            $this->filters = [];
            return TRUE;
        }

        public function affected_rows() { return $this->affected; }
    }

    class ScopeRepository extends Repository_model {
        public $lookups = [];
        public $mergeRequests = 0;
        public $storedBranch = 'feature/topic';

        public function isMergeRequestExist(string $source, string $sourceBranch, string $target, string $targetBranch) {
            $this->mergeRequests++;
            return TRUE;
        }

        public function getMergeRequestByKey(string $id) {
            return [
                'sourceRepository' => 'upstream',
                'sourceBranch' => $this->storedBranch,
                'targetRepository' => 'own',
                'targetBranch' => 'main',
                'status' => MergeRequestStatus::OPEN,
            ];
        }

        public function __construct($db) { $this->db = $db; }
        public function get(string $id) {
            $this->lookups[] = $id;
            return $this->db->tables['repositories'][$id] ?? [];
        }
    }

    function invoke($controller, $method, $data) {
        Request::$request = (object) [
            'authData' => ['userData' => ['u_key' => 'caller']],
            'parsed' => $data,
            'query' => $data,
        ];
        Response::$data = NULL;
        try { $controller->$method(); return 0; }
        catch (RuntimeException $error) { return $error->getCode(); }
    }

    function check($condition, $name) {
        if (!$condition) { throw new RuntimeException('FAIL: ' . $name); }
    }

    $db = new ScopeDatabase();
    $db->tables = [
        'repositories' => [
            'own' => ['g_key' => 'sample', 'r_display_name' => 'Own fork', 'r_fork_r_key' => 'upstream'],
            'upstream' => ['g_key' => 'sample', 'r_display_name' => 'Upstream', 'r_fork_r_key' => ''],
        ],
        'proteced_branch_rules' => [
            ['r_key' => 'own', 'pbr_key' => 'own-rule', 'pbr_rule' => 'main', 'pbr_status' => 1, 'pbr_push_min_role_id' => 5, 'pbr_merge_min_role_id' => 5],
            ['r_key' => 'upstream', 'pbr_key' => 'foreign-rule', 'pbr_rule' => 'release', 'pbr_status' => 1],
        ],
        'commit_emails' => [
            ['u_key' => 'caller', 'ce_key' => 'own-email', 'ce_email' => 'commit@example.invalid', 'ce_status' => 1, 'ce_is_check' => 0],
            ['u_key' => 'another', 'ce_key' => 'foreign-email', 'ce_email' => 'other@example.invalid', 'ce_status' => 1, 'ce_is_check' => 0],
        ],
    ];
    $repository = (new ReflectionClass('Repository'))->newInstanceWithoutConstructor();
    $repository->repositoryModel = new ScopeRepository($db);
    $repository->groupModel = new class {
        public function get($id) { return ['g_display_name' => 'Fixture group']; }
    };
    $repository->service = new class {
        public $canReadUpstream = FALSE;
        public $events = [];
        public function requestRepositoryPermission($repository, $user, $permission) {
            return $repository === 'own' || ($this->canReadUpstream && $repository === 'upstream' && $permission === Access::UAC_REPO_READ);
        }
        public function newEvent($type, $data, $user) { $this->events[] = $type; }
    };
    $user = (new ReflectionClass('User'))->newInstanceWithoutConstructor();
    $user->userModel = (new ReflectionClass('User_model'))->newInstanceWithoutConstructor();
    $user->userModel->db = $db;

    check(invoke($repository, 'targetRepository_get', ['repository' => 'upstream']) === 0x0106, 'unreadable repository denied');
    check($repository->repositoryModel->lookups === [] && Response::$data === NULL, 'unreadable metadata never read or returned');
    check(invoke($repository, 'targetRepository_get', ['repository' => 'own']) === 200, 'readable fork returned');
    check(array_column(Response::$data, 'rKey') === ['own'], 'unreadable upstream omitted');
    check($repository->repositoryModel->lookups === ['own'], 'unreadable upstream metadata not read');
    $repository->service->canReadUpstream = TRUE;
    check(invoke($repository, 'targetRepository_get', ['repository' => 'own']) === 200, 'readable upstream returned');
    check(array_column(Response::$data, 'rKey') === ['own', 'upstream'], 'both accessible repositories returned');

    $merge = [
        'sourceRepository' => 'upstream', 'targetRepository' => 'own',
        'sourceBranch' => '-option-like', 'targetBranch' => 'main',
        'title' => 'Fixture', 'description' => '', 'reviewers' => '',
    ];
    check(invoke($repository, 'createMergeRequest_post', $merge) === 0x0201, 'malformed source ref rejected before merge request storage');
    $merge['sourceBranch'] = 'feature/topic';
    $merge['targetBranch'] = 'topic:destination';
    check(invoke($repository, 'createMergeRequest_post', $merge) === 0x0201, 'target must be a branch rather than a refspec');
    $merge['targetBranch'] = 'main';
    $repository->service->canReadUpstream = FALSE;
    check(invoke($repository, 'createMergeRequest_post', $merge) === 0x0106, 'merge request must have source read access');
    check($repository->repositoryModel->mergeRequests === 0, 'invalid or unauthorized input stops before database access');
    $repository->service->canReadUpstream = TRUE;
    check(invoke($repository, 'createMergeRequest_post', $merge) === 0x0406, 'valid input reaches the existing duplicate check');
    check($repository->repositoryModel->mergeRequests === 1, 'valid branch names are accepted');
    $repository->repositoryModel->storedBranch = '-option-like';
    $storedMerge = ['mergeRequest' => 'sample', 'message' => '', 'usingSquash' => 'false'];
    check(invoke($repository, 'checkMergeType_post', $storedMerge) === 0x0201, 'malformed previously stored branch rejected before ancestry check');
    check(invoke($repository, 'mergeBranch_post', $storedMerge) === 0x0201, 'malformed previously stored branch rejected before merge');

    $rules = $db->tables['proteced_branch_rules'];
    $request = ['repository' => 'own', 'id' => 'foreign-rule', 'rule' => 'topic/*', 'rolePush' => 4, 'roleMerge' => 5];
    check(invoke($repository, 'updateProtectedBranchRule_post', $request) === 0x0405, 'foreign rule edit refused');
    check(invoke($repository, 'deleteProtectedBranchRule_post', $request) === 0x0405, 'foreign rule delete refused');
    check($db->tables['proteced_branch_rules'] === $rules && $repository->service->events === [], 'foreign rules and events untouched');
    $request['id'] = 'own-rule';
    check(invoke($repository, 'updateProtectedBranchRule_post', $request) === 200, 'owned rule can be edited');
    check(invoke($repository, 'updateProtectedBranchRule_post', $request) === 200, 'unchanged rule can be saved');
    check($db->tables['proteced_branch_rules'][0]['pbr_rule'] === 'topic/*', 'own rule changed');
    check(invoke($repository, 'deleteProtectedBranchRule_post', $request) === 200, 'owned rule can be deleted');
    check(invoke($repository, 'updateProtectedBranchRule_post', $request) === 0x0405, 'inactive rule cannot be edited');

    $emails = $db->tables['commit_emails'];
    $address = $emails[0]['ce_email'];
    $validCode = TOTP::generate($address);
    check(invoke($user, 'deleteCommitEmail_post', ['id' => 'foreign-email']) === 0x0405, 'foreign email deletion denied');
    $verification = ['id' => 'foreign-email', 'email' => $address, 'code' => $validCode];
    check(invoke($user, 'validationCommitEmailCode_post', $verification) === 0x040C, 'foreign email verification denied');
    $wrongInbox = 'another-inbox@example.invalid';
    check(invoke($user, 'validationCommitEmailCode_post', ['id' => 'own-email', 'email' => $wrongInbox, 'code' => TOTP::generate($wrongInbox)]) === 0x040C, 'valid code for a different address cannot verify the record');
    check($db->tables['commit_emails'] === $emails, 'denied requests leave all email records unchanged');
    $verification['id'] = 'own-email';
    check(invoke($user, 'validationCommitEmailCode_post', $verification) === 200, 'own email can be verified');
    check(invoke($user, 'validationCommitEmailCode_post', $verification) === 200, 'own email verification is idempotent');
    check($db->tables['commit_emails'][0]['ce_is_check'] === 1, 'verification updated own email');
    check(invoke($user, 'deleteCommitEmail_post', ['id' => 'own-email']) === 200, 'own email can be deleted');
    check(invoke($user, 'validationCommitEmailCode_post', $verification) === 0x040C, 'deleted email cannot be verified');
    check($db->tables['commit_emails'][1] === $emails[1], 'foreign email unchanged');

    echo "Repository and commit email scope checks passed.\n";
}
