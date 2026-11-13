<?php
namespace service\Network {
    // Deterministic DNS fixtures also exercise the dispatcher's real resolver path.
    function dns_get_record($host, $type) { return $GLOBALS['dnsRecords']; }
}
namespace GuzzleHttp\Handler { class CurlHandler {} }
namespace GuzzleHttp {
    class HandlerStack { public static function create($handler) { return $handler; } }
    class Client {
        public static $requests = [];
        public static $options;
        public function __construct($options = []) { self::$options = $options; }
        public function request($method, $url, $options) {
            self::$requests[] = [$method, $url, $options];
            return new class {
                public function getStatusCode() { return 302; }
                public function getHeaders() { return ['Location' => ['http://127.0.0.1/private']]; }
                public function getBody() { return 'public-response'; }
            };
        }
    }
}
namespace {
    use service\Network\WebhookTarget;
    $root = dirname(__DIR__, 2);
    require $root . '/application/libraries/service/Network/WebhookTarget.php';
    require $root . '/application/libraries/service/Utility/UUID.php';
    class CI_Controller {}
    require $root . '/application/controllers/backend/repository_webhook.php';
    define('YAML_HOST', 'https://codefever.example.invalid');
    $checks = 0;
    function check($value, $label) {
        global $checks;
        $checks++;
        if (!$value) { throw new RuntimeException('FAIL: ' . $label); }
    }
    function denied($url, $addresses = ['8.8.8.8']) {
        try { WebhookTarget::requestOptions($url, function () use ($addresses) { return $addresses; }); }
        catch (InvalidArgumentException $e) { check(TRUE, 'denied ' . $url . ' ' . json_encode($addresses)); return; }
        check(FALSE, 'must deny ' . $url . ' ' . json_encode($addresses));
    }
    foreach (['127.0.0.1', '127.255.255.255', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '0.0.0.0', '100.64.0.1', '192.0.0.1', '192.0.2.1', '198.18.0.1', '198.51.100.1', '203.0.113.1', '224.0.0.1', '255.255.255.255', '::', '::1', '::ffff:127.0.0.1', '::ffff:8.8.8.8', 'fd00::1', 'fe80::1', 'ff02::1', '64:ff9b::7f00:1', '2002:7f00:1::', '2001::1', '2001:db8::1', '3fff::1'] as $address) {
        denied('http://' . (strpos($address, ':') === FALSE ? $address : '[' . $address . ']') . '/');
        denied('https://hooks.example.invalid/event', [$address]);
        denied('https://hooks.example.invalid/event', ['8.8.8.8', $address]);
    }
    foreach (['file:///etc/passwd', 'gopher://example.com/', 'ftp://example.com/', 'http://localhost/', 'http://service.internal/', 'http://service.local/', 'http://2130706433/', 'http://0177.0.0.1/', 'http://0x7f000001/', 'http://127.1/', 'https://user:pass@example.com/', 'https://example.com/#x', "https://example.com/\r\nX: y", 'http://example.com\\@127.0.0.1/'] as $url) { denied($url); }
    denied('https://hooks.example.invalid/', []);
    foreach (['8.8.8.8', '2606:4700:4700::1111'] as $address) {
        $options = WebhookTarget::requestOptions('https://hooks.example.invalid:8443/event', function () use ($address) { return [$address]; });
        $pinned = strpos($address, ':') === FALSE ? $address : '[' . $address . ']';
        check($options['curl'][CURLOPT_RESOLVE] === ['hooks.example.invalid:8443:' . $pinned], 'checked address pinned');
        check($options['allow_redirects'] === FALSE && $options['proxy'] === '' && $options['curl'][CURLOPT_PROXY] === '', 'redirect/proxy bypass disabled');
        check($options['curl'][CURLOPT_FRESH_CONNECT] && $options['curl'][CURLOPT_FORBID_REUSE], 'unchecked pooled connections disabled');
    }
    $GLOBALS['dnsRecords'] = [['ip' => '8.8.8.8']];
    $first = WebhookTarget::requestOptions('https://hooks.example.invalid/');
    $GLOBALS['dnsRecords'] = [['ip' => '127.0.0.1']];
    try { WebhookTarget::requestOptions('https://hooks.example.invalid/'); check(FALSE, 'DNS rebinding must fail'); }
    catch (InvalidArgumentException $e) { check(TRUE, 'DNS rechecked for each delivery'); }
    check($first['curl'][CURLOPT_RESOLVE] === ['hooks.example.invalid:443:8.8.8.8'], 'original connection remains pinned after DNS change');

    foreach ([['ip' => '127.0.0.1'], ['ip' => '8.8.8.8']] as $record) {
        $GLOBALS['dnsRecords'] = [$record];
        \GuzzleHttp\Client::$requests = [];
        $controller = (new ReflectionClass('Repository_webhook'))->newInstanceWithoutConstructor();
        $controller->repositoryModel = new class {
            public $logs = [];
            public function getRepositoryWebhookEvents() { return [['r_key' => 'repo', 'rwe_user' => 'user', 'rw_key' => 'hook', 'rwe_key' => 'event', 'rwe_type' => 'push', 'rwe_data' => '{}', 'rw_url' => 'https://hooks.example.invalid/', 'rw_secret' => 'fixture']]; }
            public function get($key) { return ['r_key' => $key, 'g_key' => 'group', 'r_name' => 'repo']; }
            public function addRepositoryWebhookLog($data) { $this->logs[] = $data; }
        };
        $controller->groupModel = new class { public function get($key) { return ['g_name' => 'group']; } };
        $controller->userModel = new class { public function get($key) { return ['u_key' => $key, 'u_name' => 'Fixture']; } };
        $controller->run();
        $requests = \GuzzleHttp\Client::$requests;
        if ($record['ip'] === '127.0.0.1') {
            check($requests === [], 'dispatcher rejects private DNS before network request');
            check($controller->repositoryModel->logs[0]['rwl_status'] === 400, 'blocked delivery records failure');
        } else {
            check((\GuzzleHttp\Client::$options['handler'] ?? NULL) instanceof \GuzzleHttp\Handler\CurlHandler, 'dispatcher requires cURL handler');
            check(count($requests) === 1 && $requests[0][2]['allow_redirects'] === FALSE, 'dispatcher does not follow public redirect to loopback');
            check($requests[0][2]['curl'][CURLOPT_RESOLVE] === ['hooks.example.invalid:443:8.8.8.8'], 'dispatcher passes address pinning to cURL handler');
            check($requests[0][2]['body'] && isset($requests[0][2]['headers']['X-CodeFever-Signature']), 'legitimate payload and signature retained');
        }
    }
    echo $checks . " webhook target checks, 0 failures.\n";
}
