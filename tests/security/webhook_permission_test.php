<?php
// Standalone: php tests/security/webhook_permission_test.php
// Real controller/model methods with synthetic rows and repository permissions.
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
    use service\AccessControl\UserAccessController;
    use service\Network\Request;
    use service\Network\Response;

    $root = dirname(__DIR__, 2);
    $fixture = sys_get_temp_dir() . '/codefever-webhook-' . uniqid();
    mkdir($fixture . '/libraries/Avatars', 0700, TRUE);
    mkdir($fixture . '/controllers/api', 0700, TRUE);
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
    require $root . '/application/libraries/service/AccessControl/AccessController.php';
    require $root . '/application/config/access_controller.php';
    require $root . '/application/libraries/service/Utility/UUID.php';
    require $root . '/application/libraries/service/Network/WebhookTarget.php';
    require $root . '/application/controllers/api/repository.php';
    class CI_Model { public $db; }
    require $root . '/application/models/repository_model.php';

    class WebhookDatabase {
        public $tables;
        public $writes = [];
        private $filters = [];
        private $affected = 0;
        public function __construct() {
            $this->tables = ['repository_webhooks' => [], 'repository_webhook_logs' => [], 'repository_webhook_events' => []];
            foreach (['own', 'victim'] as $repository) {
                $this->tables['repository_webhooks'][] = [
                    'rw_key' => $repository . '-webhook', 'r_key' => $repository,
                    'u_key' => 'creator', 'u_name' => 'Fixture',
                    'rw_url' => 'https://example.invalid/' . $repository,
                    'rw_secret' => $repository . '-secret', 'rw_events' => 'push',
                    'rw_active' => 1, 'rw_updated' => '2026-01-01 00:00:00'
                ];
                $this->tables['repository_webhook_logs'][] = [
                    'rwl_id' => $repository . '-log', 'rw_key' => $repository . '-webhook',
                    'rwl_request' => json_encode(['marker' => $repository . '-request']),
                    'rwl_response' => json_encode(['marker' => $repository . '-response']),
                    'rwl_start' => 1, 'rwl_end' => 2, 'rwl_status' => 200,
                    'rwl_created' => '2026-01-01 00:00:00'
                ];
                $this->tables['repository_webhook_events'][] = ['rw_key' => $repository . '-webhook'];
            }
        }
        public function where($column, $value) { $this->filters[$column] = $value; }
        public function select($columns) {}
        public function order_by($column, $direction) {}
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
            $this->writes[] = ['update', $table, $this->filters];
            foreach ($this->tables[$table] as &$row) {
                if ($this->matches($row)) { $row = array_merge($row, $data); }
            }
            $this->filters = [];
            return TRUE;
        }
        public function delete($table) {
            $this->writes[] = ['delete', $table, $this->filters];
            $before = count($this->tables[$table]);
            $this->tables[$table] = array_values(array_filter($this->tables[$table], function ($row) { return !$this->matches($row); }));
            $this->affected = $before - count($this->tables[$table]);
            $this->filters = [];
            return TRUE;
        }
        public function insert($table, $data) { $this->tables[$table][] = $data; return TRUE; }
        public function affected_rows() { return $this->affected; }
    }
    class WebhookRepository extends Repository_model {
        public function __construct() { $this->db = new WebhookDatabase(); }
        public function get(string $key) { return ['g_key' => 'fixture-group']; }
        public function getWebhooks(string $key) {
            return array_values(array_filter($this->db->tables['repository_webhooks'], function ($row) use ($key) { return $row['r_key'] === $key; }));
        }
    }
    function endpoint($name, $data, $readable = ['own'], $role = UserAccessController::ROLE_MAINTAINER) {
        $controller = (new ReflectionClass('Repository'))->newInstanceWithoutConstructor();
        $controller->repositoryModel = new WebhookRepository();
        $controller->service = new class($readable, $role) {
            public $calls = [];
            public $events = [];
            private $readable;
            private $role;
            public function __construct($readable, $role) { $this->readable = $readable; $this->role = $role; }
            public function requestRepositoryPermission($repository, $user, $permission) {
                $this->calls[] = [$repository, $user, $permission];
                return in_array($repository, $this->readable, TRUE) && UserAccessController::checkPermission($permission, $this->role);
            }
            public function newEvent(...$event) { $this->events[] = $event; }
        };
        Request::$request = (object) ['authData' => ['userData' => ['u_key' => 'caller']], 'parsed' => $data];
        Response::$data = NULL;
        try { $controller->$name(); $code = 0; }
        catch (RuntimeException $error) { $code = $error->getCode(); }
        return [$controller, $code, Response::$data];
    }
    $checks = 0;
    $failures = 0;
    function check($condition, $label) {
        global $checks, $failures;
        $checks++;
        if (!$condition) { $failures++; echo 'FAIL: ' . $label . "\n"; }
    }
    $routes = [
        'getWebhook_post' => ['repository' => 'own', 'rwKey' => 'victim-webhook'],
        'editWebhook_post' => ['repository' => 'own', 'rwKey' => 'victim-webhook', 'url' => 'https://example.invalid/changed', 'secret' => 'changed', 'events' => 'push', 'active' => 1],
        'deleteWebhook_post' => ['repository' => 'own', 'rwKey' => 'victim-webhook'],
        'getRepositoryWebhookLogs_post' => ['repository' => 'own', 'webhook' => 'victim-webhook'],
        'getRepositoryWebhookLogData_post' => ['repository' => 'own', 'id' => 'victim-log'],
    ];
    foreach ($routes as $route => $data) {
        foreach ([['own'], []] as $readable) {
            list($controller, $code, $output) = endpoint($route, $data, $readable);
            check($code === 0x0106 && $output === NULL, $route . ' rejects foreign object or revoked membership');
            check($controller->repositoryModel->db->writes === [], $route . ' rejects before writes and cleanup');
            check($controller->service->events === [], $route . ' does not record an unauthorized event');
        }
        $ownData = array_map(function ($value) { return str_replace('victim-', 'own-', $value); }, $data);
        list($controller, $code, $output) = endpoint($route, $ownData);
        check($code === 200, $route . ' allows authorized own object');
        check(strpos(json_encode($output), 'victim-') === FALSE, $route . ' output excludes victim content');
        if ($route === 'getWebhook_post') { check($output['secret'] === 'own-secret', 'authorized webhook secret retained'); }
        if ($route === 'editWebhook_post') {
            check($controller->repositoryModel->db->tables['repository_webhooks'][0]['rw_url'] === $ownData['url'], 'authorized edit persisted');
            check($controller->repositoryModel->db->writes[0][2] === ['rw_key' => 'own-webhook', 'r_key' => 'own'], 'update query scopes both keys');
        }
        if ($route === 'deleteWebhook_post') {
            check(count($controller->repositoryModel->db->tables['repository_webhooks']) === 1, 'authorized delete persisted');
            check(count($controller->repositoryModel->db->tables['repository_webhook_logs']) === 1, 'authorized delete cleans own logs');
            check(count($controller->repositoryModel->db->tables['repository_webhook_events']) === 1, 'authorized delete cleans own events');
            check($controller->repositoryModel->db->writes[0][2] === ['rw_key' => 'own-webhook', 'r_key' => 'own'], 'delete query scopes both keys');
        }
        if ($route === 'getRepositoryWebhookLogs_post') { check($output[0]['id'] === 'own-log', 'authorized log metadata retained'); }
        if ($route === 'getRepositoryWebhookLogData_post') { check($output['request']->marker === 'own-request', 'authorized log body retained'); }
        if (strpos($route, 'getRepositoryWebhookLog') === 0) {
            check($controller->service->calls === [['own', 'caller', UserAccessController::UAC_REPO_WEBHOOK_EDIT]], $route . ' authorizes stored repository');
        }
        $missing = array_map(function ($value) { return str_replace('victim-', 'missing-', $value); }, $data);
        list($controller, $code, $output) = endpoint($route, $missing);
        check($code === 0x0106 && $output === NULL, $route . ' handles missing object');
    }
    foreach (['editWebhook_post', 'deleteWebhook_post'] as $route) {
        $data = array_map(function ($value) { return str_replace('victim-', 'own-', $value); }, $routes[$route]);
        list($controller, $code) = endpoint($route, $data, ['own'], UserAccessController::ROLE_GUEST);
        check($code === 0x0106 && $controller->repositoryModel->db->writes === [], $route . ' read access cannot mutate');
    }
    foreach (['http://127.0.0.1/', 'http://169.254.169.254/', 'http://[::1]/', 'file:///tmp/canary', 'https://user:pass@example.invalid/'] as $url) {
        $data = $routes['editWebhook_post'];
        $data['rwKey'] = 'own-webhook';
        $data['url'] = $url;
        list($controller, $code) = endpoint('editWebhook_post', $data);
        check($code === 0x0201 && $controller->repositoryModel->db->writes === [], 'unsafe webhook URL rejected before save: ' . $url);
    }
    $model = new WebhookRepository();
    foreach ([UserAccessController::ROLE_GUEST, UserAccessController::ROLE_REPORTER, UserAccessController::ROLE_DEVELOPER, UserAccessController::ROLE_MAINTAINER, UserAccessController::ROLE_OWNER] as $role) {
        list($controller, $code, $output) = endpoint('webhooks_post', ['repository' => 'own'], ['own'], $role);
        check($code === ($role >= UserAccessController::ROLE_MAINTAINER ? 200 : 0x0106), 'webhook list role boundary ' . $role);
        if ($code === 200) { check($output[0]['secret'] === 'own-secret', 'webhook editor retains existing configuration'); }
        else { check($output === NULL, 'denied webhook list leaks no secret'); }
    }
    check($model->normalizeWebhooks($model->db->tables['repository_webhooks'])[0]['secret'] === '', 'normalization redacts secrets by default');
    foreach (['getWebhook_post', 'getRepositoryWebhookLogs_post', 'getRepositoryWebhookLogData_post'] as $route) {
        $data = array_map(function ($value) { return str_replace('victim-', 'own-', $value); }, $routes[$route]);
        foreach ([UserAccessController::ROLE_GUEST, UserAccessController::ROLE_REPORTER, UserAccessController::ROLE_DEVELOPER] as $role) {
            list($controller, $code, $output) = endpoint($route, $data, ['own'], $role);
            check($code === 0x0106 && $output === NULL, $route . ' denies webhook configuration and logs to role ' . $role);
        }
    }
    $before = $model->db->tables;
    check(!$model->getWebhook('victim-webhook', 'own'), 'scoped model lookup hides foreign object');
    $model->updateWebhook('victim-webhook', ['rw_url' => 'https://example.invalid/changed', 'rw_events' => 'push'], 'own');
    check($model->db->tables === $before, 'model update cannot change a foreign object');
    check($model->deleteWebhook('victim-webhook', 'own') === FALSE, 'model delete detects unmatched repository');
    check($model->db->tables === $before, 'model delete preserves foreign rows');
    foreach (['getRepositoryWebhookLogs_post', 'getRepositoryWebhookLogData_post'] as $route) {
        $data = $routes[$route];
        list($controller, $code, $output) = endpoint($route, $data, ['victim']);
        check($code === 200 && $controller->service->calls[0][0] === 'victim', $route . ' uses stored repository despite supplied repository');
    }
    echo $checks . ' webhook permission checks, ' . $failures . " failures.\n";
    exit($failures ? 1 : 0);
}
