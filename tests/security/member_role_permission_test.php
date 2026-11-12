<?php
// Standalone: php tests/security/member_role_permission_test.php
// Real role APIs, permission service and model persistence with disposable rows.
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
namespace {
    use service\AccessControl\UserAccessController;
    use service\Network\Request;

    $root = dirname(__DIR__, 2);
    $fixture = sys_get_temp_dir() . '/codefever-roles-' . uniqid();
    foreach (['libraries/Avatars', 'controllers/api', 'libraries/composerlib/vendor', 'libraries/service'] as $path) {
        mkdir($fixture . '/' . $path, 0700, TRUE);
    }
    foreach (['libraries/Avatars/MaterialDesign.Avatars.class.php', 'libraries/storage.php', 'libraries/composerlib/vendor/autoload.php', 'libraries/service/autoLoader.php'] as $path) {
        file_put_contents($fixture . '/' . $path, '<?php');
    }
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
    define('GROUP_TYPE_USER', 2);
    require $root . '/application/libraries/service/AccessControl/AccessController.php';
    require $root . '/application/config/access_controller.php';
    require $root . '/application/libraries/service/Utility/UUID.php';
    require $root . '/application/libraries/Service.php';
    require $root . '/application/controllers/api/repository.php';
    require $root . '/application/controllers/api/group.php';
    class CI_Model { public $db; public $groupModel; }
    require $root . '/application/models/repository_model.php';
    require $root . '/application/models/group_model.php';

    class RoleDatabase {
        public $tables;
        public $writes = [];
        private $filters = [];
        public function __construct($scope, $callerRole, $targetRole) {
            $this->tables = [
                'repositories' => [['r_key' => 'repository', 'g_key' => 'group', 'u_key' => 'creator', 'r_status' => COMMON_STATUS_NORMAL, 'r_display_name' => 'Repository']],
                'groups' => [['g_key' => 'group', 'u_key' => 'creator', 'g_status' => COMMON_STATUS_NORMAL, 'g_type' => 1, 'g_display_name' => 'Group']],
                'repository_members' => [], 'group_members' => []
            ];
            $prefix = $scope === 'repository' ? 'rm' : 'gm';
            $key = $scope === 'repository' ? 'r_key' : 'g_key';
            foreach (['caller' => $callerRole, 'member' => $targetRole] as $user => $role) {
                $this->tables[$scope . '_members'][] = [$key => $scope, 'u_key' => $user, $prefix . '_role' => $role, $prefix . '_status' => COMMON_STATUS_NORMAL];
            }
        }
        public function where($column, $value) { $this->filters[$column] = $value; }
        private function matches($row) {
            foreach ($this->filters as $column => $value) {
                if (!isset($row[$column]) || $row[$column] !== $value) { return FALSE; }
            }
            return TRUE;
        }
        public function get($table) {
            $rows = array_values(array_filter($this->tables[$table], function ($row) { return $this->matches($row); }));
            $this->filters = [];
            return new class($rows) {
                private $rows;
                public function __construct($rows) { $this->rows = $rows; }
                public function row_array() { return $this->rows[0] ?? []; }
                public function result_array() { return $this->rows; }
            };
        }
        public function update($table, $data) {
            $this->writes[] = [$table, $this->filters, $data];
            foreach ($this->tables[$table] as &$row) {
                if ($this->matches($row)) { $row = array_merge($row, $data); }
            }
            $this->filters = [];
            return TRUE;
        }
        public function insert($table, $data) { $this->writes[] = [$table, [], $data]; $this->tables[$table][] = $data; return TRUE; }
    }
    class RoleGroup extends Group_model {
        public function __construct($db) { $this->db = $db; }
        public function get(string $key) { return $key === 'group' ? $this->db->tables['groups'][0] : []; }
    }
    class RoleRepository extends Repository_model {
        public function __construct($db, $group) { $this->db = $db; $this->groupModel = $group; }
        public function get(string $key) { return $key === 'repository' ? $this->db->tables['repositories'][0] : []; }
    }
    class RoleService extends Service {
        public $events = [];
        public function __construct($controller) {
            $this->CI = (object) [
                'repositoryModel' => $controller->repositoryModel, 'groupModel' => $controller->groupModel,
                'load' => new class { public function model(...$args) {} }
            ];
        }
        public function newEvent(string $name, array $data = NULL, string $user = NULL) { $this->events[] = [$name, $data, $user]; }
    }
    function controller($scope, $callerRole, $targetRole = UserAccessController::ROLE_DEVELOPER) {
        $db = new RoleDatabase($scope, $callerRole, $targetRole);
        $controller = (new ReflectionClass($scope === 'repository' ? 'Repository' : 'Group'))->newInstanceWithoutConstructor();
        $controller->groupModel = new RoleGroup($db);
        $controller->repositoryModel = new RoleRepository($db, $controller->groupModel);
        $controller->service = new RoleService($controller);
        $controller->userModel = new class {
            public function get($user) { return ['u_key' => $user, 'u_name' => 'Fixture', 'u_email' => 'fixture@example.invalid']; }
        };
        return $controller;
    }
    function invoke($controller, $method, $data) {
        Request::$request = (object) ['authData' => ['userData' => ['u_key' => 'caller']], 'parsed' => $data];
        try { $controller->$method(); return 0; }
        catch (RuntimeException $error) { return $error->getCode(); }
    }
    $checks = 0;
    $failures = 0;
    function check($condition, $label) {
        global $checks, $failures;
        $checks++;
        if (!$condition) { $failures++; echo 'FAIL: ' . $label . "\n"; }
    }
    foreach (['repository', 'group'] as $scope) {
        $controller = controller($scope, UserAccessController::ROLE_MAINTAINER);
        if ($scope === 'group') { $controller->repositoryModel->db->tables['repositories'] = []; }
        $delete = $scope === 'repository' ? 'deleteRepository_post' : 'deleteGroup_post';
        check(invoke($controller, $delete, [$scope => $scope]) === 0x0106, $scope . ' Maintainer cannot delete initially');
        check(invoke($controller, 'changeMemberRole_post', [$scope => $scope, 'userID' => 'caller', 'roleID' => '5']) === 0x0106, $scope . ' rejects self-promotion with numeric string');
        check($controller->repositoryModel->db->writes === [], $scope . ' rejected promotion does not persist');
        check(invoke($controller, $delete, [$scope => $scope]) === 0x0106, $scope . ' deletion remains forbidden after attempted promotion');
        check($controller->repositoryModel->db->writes === [], $scope . ' rejected chain preserves repository/group');
        foreach ([
            [4, 3, 'member', 5, 0x0106],
            [4, 5, 'member', 1, 0x0106],
            [4, 3, 'member', 4, 200],
            [4, 3, 'caller', 1, 200],
            [5, 3, 'member', 5, 200],
            [5, 5, 'member', 3, 200],
            [3, 2, 'member', 3, 0x0106],
            [5, 3, 'creator', 4, 0x0106],
            [5, 3, 'member', 6, 0x0201],
            [5, 3, 'member', 0, 0x0201],
        ] as $case) {
            list($callerRole, $targetRole, $target, $requestedRole, $expected) = $case;
            $controller = controller($scope, $callerRole, $targetRole);
            $code = invoke($controller, 'changeMemberRole_post', [$scope => $scope, 'userID' => $target, 'roleID' => $requestedRole]);
            $label = $scope . ' ' . json_encode($case);
            check($code === $expected, $label . ' authorization');
            if ($expected === 200) {
                $method = $scope === 'repository' ? 'getRepositoryRole' : 'getGroupRole';
                check($controller->service->$method($scope, $target) === $requestedRole, $label . ' legitimate role persisted');
                check(count($controller->service->events) === 1, $label . ' event recorded');
            } else {
                check($controller->repositoryModel->db->writes === [], $label . ' denied before writes');
                check($controller->service->events === [], $label . ' denied before event');
            }
        }
        $controller = controller($scope, UserAccessController::ROLE_OWNER);
        if ($scope === 'group') { $controller->repositoryModel->db->tables['repositories'] = []; }
        check(invoke($controller, $delete, [$scope => $scope]) === 200, $scope . ' Owner deletion remains available');
    }
    // Group roles inherited by a repository must obey the same grant boundary.
    $controller = controller('group', UserAccessController::ROLE_MAINTAINER);
    $controller->repositoryModel->db->tables['repository_members'][] = ['r_key' => 'repository', 'u_key' => 'caller', 'rm_role' => 0, 'rm_status' => COMMON_STATUS_NORMAL];
    $repositoryController = (new ReflectionClass('Repository'))->newInstanceWithoutConstructor();
    foreach (['repositoryModel', 'groupModel', 'service', 'userModel'] as $property) {
        $repositoryController->$property = $controller->$property;
    }
    check(invoke($repositoryController, 'changeMemberRole_post', ['repository' => 'repository', 'userID' => 'caller', 'roleID' => 5]) === 0x0106, 'inherited group Maintainer cannot become repository Owner');
    check($controller->repositoryModel->db->writes === [], 'inherited role escalation does not create a repository membership');
    echo $checks . ' member role permission checks, ' . $failures . " failures.\n";
    exit($failures ? 1 : 0);
}
