<?php
// Standalone regression test: php tests/security/doc_path_test.php
// Uses only disposable fixtures; no database, session, or deployment secrets.
$repository = dirname(__DIR__, 2);
$fixture = sys_get_temp_dir() . '/codefever-doc-' . uniqid();
foreach (['application/controllers', 'doc/zh-cn/start', 'doc/en-us/start', 'doc/zh-cn-other', 'doc/zh-cn/empty'] as $dir) {
    mkdir($fixture . '/' . $dir, 0700, TRUE);
}
register_shutdown_function(function () use ($fixture) {
    $entries = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($fixture, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($entries as $entry) {
        if ($entry->isDir() && !$entry->isLink()) {
            rmdir($entry->getPathname());
        } else {
            unlink($entry->getPathname());
        }
    }
    rmdir($fixture);
});
file_put_contents($fixture . '/application/controllers/base.php', '<?php class Base { public $uri; public $load; }');
foreach (['zh-cn', 'en-us'] as $language) {
    file_put_contents($fixture . '/doc/' . $language . '/index.md', '[Start](start)');
    file_put_contents($fixture . '/doc/' . $language . '/start/index.md', '[Welcome](welcome.md)');
    file_put_contents($fixture . '/doc/' . $language . '/start/welcome.md', 'PUBLIC-' . $language);
}
file_put_contents($fixture . '/canary.yaml', 'PRIVATE-CANARY');
file_put_contents($fixture . '/canary.md', 'PRIVATE-MARKDOWN');
file_put_contents($fixture . '/doc/zh-cn-other/canary.md', 'PRIVATE-PREFIX');
file_put_contents($fixture . '/doc/zh-cn/local.yaml', 'PRIVATE-IN-DOCS');
$image = str_repeat('a', 32) . '.png';
file_put_contents($fixture . '/doc/zh-cn/start/' . $image, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII='));
file_put_contents($fixture . '/' . $image, 'PRIVATE-IMAGE');
symlink($fixture . '/canary.md', $fixture . '/doc/zh-cn/linked.md');
symlink($fixture . '/canary.md', $fixture . '/doc/zh-cn/start/index-external.md');
symlink($fixture . '/' . $image, $fixture . '/doc/zh-cn/' . $image);
symlink($fixture, $fixture . '/doc/zh-cn/outside');

define('APPPATH', $fixture . '/application');
define('BASEPATH', $repository . '/system/');
require $repository . '/application/controllers/doc.php';
require $repository . '/system/core/URI.php';
function show_404() { throw new RuntimeException('Not found', 404); }
function check($condition, $label) {
    if (!$condition) { throw new RuntimeException('FAIL: ' . $label); }
    echo 'PASS: ' . $label . "\n";
}
function controller($path) {
    $doc = (new ReflectionClass('Doc'))->newInstanceWithoutConstructor();
    $uri = (new ReflectionClass('CI_URI'))->newInstanceWithoutConstructor();
    $_SERVER['REQUEST_URI'] = '/' . ltrim($path, '/');
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    $_SERVER['PATH_INFO'] = $_SERVER['REQUEST_URI'];
    $detect = new ReflectionMethod('CI_URI', '_detect_uri');
    $detect->setAccessible(TRUE);
    $doc->uri = (object) ['uri_string' => $detect->invoke($uri)];
    $doc->load = new class {
        public $data;
        public function view($name, $data) { $this->data = $data; }
    };
    return $doc;
}
function denied($path) {
    try {
        $doc = controller($path);
        $doc->cn();
    } catch (RuntimeException $error) {
        if ($error->getCode() === 404) { check(TRUE, '404 ' . $path); return; }
        throw $error;
    }
    check(FALSE, '404 ' . $path);
}

// Optional single request for HTTP harnesses, including branches that exit().
if (isset($_GET['route'])) {
    try {
        $route = $_GET['route'];
        $language = strpos($route, '/doc/en/') === 0 ? 'en' : 'cn';
        $doc = controller($route);
        $doc->$language();
        echo $doc->load->data['doc'];
    } catch (RuntimeException $error) {
        if ($error->getCode() !== 404) { throw $error; }
        http_response_code(404);
        echo 'Not found';
    }
    return;
}

foreach (['cn' => 'zh-cn', 'en' => 'en-us'] as $route => $language) {
    $doc = controller('/doc/' . $route . '/start/welcome.md');
    $doc->$route();
    check($doc->load->data['doc'] === 'PUBLIC-' . $language, 'normal ' . $language);
}
foreach ([
    '/doc/cn/....//....//canary.yaml',
    '/doc/cn/....//....//canary.md',
    '/doc/cn/....//....//....//....//canary.yaml',
    '/doc/cn/....//zh-cn-other/canary.md',
    '/doc/cn/linked.md',
    '/doc/cn/outside/canary.md',
    '/doc/cn/local.yaml',
    '/doc/cn/missing.md',
    '/doc/cn/' . $image,
    '/doc/cn/....//....//' . $image,
    '/doc/cn/..%2f..%2fcanary.yaml',
    '/doc/cn/empty/',
] as $path) { denied($path); }

$doc = controller('/doc/cn/start/welcome.md');
$doc->cn();
$resolve = new ReflectionMethod('Doc', '_resolveDocPath');
$resolve->setAccessible(TRUE);
check($resolve->invoke($doc, $fixture . '/doc/zh-cn/start/' . $image) !== FALSE, 'normal image resolves');
check($resolve->invoke($doc, $fixture . '/doc/zh-cn', TRUE) !== FALSE, 'root directory resolves');
check($resolve->invoke($doc, $fixture . '/doc/zh-cn') === FALSE, 'directory cannot be read as a file');
check($resolve->invoke($doc, $fixture . "/doc/zh-cn/start/welcome.md\0") === FALSE, 'NUL rejected');
$menu = new ReflectionMethod('Doc', '_extractMenu');
$menu->setAccessible(TRUE);
check($menu->invoke($doc, $fixture . '/canary.md') === [], 'external menu rejected');
check($menu->invoke($doc, $fixture . '/doc/zh-cn/start/index-external.md') === [], 'external menu symlink rejected');
check(count($menu->invoke($doc, $fixture . '/doc/zh-cn/index.md')) === 1, 'normal menu loads');
echo "All documentation path tests passed.\n";
