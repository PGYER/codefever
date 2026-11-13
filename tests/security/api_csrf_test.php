<?php
namespace service\Network {
    class Request {
        public static $data;
        public static function parse() { return (object) ['token' => 'gateway-token']; }
        public static function setAuthData($data) { self::$data = $data; }
    }
    class Response {
        public static function reject($code) { throw new \RuntimeException('Rejected', $code); }
    }
}
namespace {
    use service\AccessControl\APIAuth;
    use service\Network\Request;
    require dirname(__DIR__, 2) . '/application/libraries/service/AccessControl/APIAuth.php';
    define('YAML_GATEWAY_TOKEN', 'gateway-token');
    $ci = (object) [
        'session' => (object) ['userdata' => ['userInfo' => ['u_key' => 'victim']]],
        'load' => new class { public function model(...$args) {} },
        'userModel' => new class {
            public $calls = 0;
            public function get($key) { $this->calls++; return ['u_key' => $key, 'u_admin' => 1]; }
        }
    ];
    function &get_instance() { global $ci; return $ci; }
    $checks = 0;
    function check($value, $label) {
        global $checks;
        $checks++;
        if (!$value) { throw new RuntimeException('FAIL: ' . $label); }
    }
    foreach (['POST', 'PUT', 'PATCH', 'DELETE'] as $method) {
        foreach (['application/x-www-form-urlencoded', 'multipart/form-data', 'application/json'] as $contentType) {
            foreach (['', 'wrong', 'codefever-app'] as $header) {
                $_SERVER = ['REQUEST_METHOD' => $method, 'CONTENT_TYPE' => $contentType];
                if ($header !== '') { $_SERVER['HTTP_CODEFEVER_END_ENV'] = $header; }
                $before = $ci->userModel->calls;
                Request::$data = NULL;
                try { APIAuth::auth([APIAuth::AUTH_TYPE_WEB_USER]); $code = 200; }
                catch (RuntimeException $e) { $code = $e->getCode(); }
                check($code === ($header === 'codefever-app' ? 200 : 0x0106), $method . ' ' . $contentType . ' header ' . $header);
                if ($code !== 200) {
                    check($ci->userModel->calls === $before && Request::$data === NULL, 'forged request rejected before account lookup/authentication');
                }
            }
        }
    }
    foreach (['GET', 'HEAD', 'OPTIONS'] as $method) {
        $_SERVER = ['REQUEST_METHOD' => $method];
        check(APIAuth::auth([APIAuth::AUTH_TYPE_WEB_USER]), 'safe method ' . $method);
    }
    $_SERVER = ['REQUEST_METHOD' => 'POST'];
    check(APIAuth::auth([APIAuth::AUTH_TYPE_GATEWAY]), 'gateway token authentication remains independent of browser header');
    echo $checks . " API CSRF checks, 0 failures.\n";
}
