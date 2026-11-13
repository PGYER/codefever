<?php
$root = dirname(__DIR__, 2);
$fixture = sys_get_temp_dir() . '/codefever-view-' . uniqid();
mkdir($fixture . '/newpage', 0700, TRUE);
foreach (['header_include.php', 'footer_include.php', 'login_activity.php'] as $file) {
    file_put_contents($fixture . '/newpage/' . $file, '');
}
register_shutdown_function(function () use ($fixture) {
    foreach (glob($fixture . '/newpage/*') as $file) { unlink($file); }
    rmdir($fixture . '/newpage'); rmdir($fixture);
});
define('TPLPATH', $fixture . '/');
define('YAML_ALLOWREGISTER', FALSE);
function lang($name) { return $name; }
function render($view, $value) {
    global $root;
    $email = $mode = $key = $value;
    $countries = [];
    $message = '';
    ob_start();
    include $root . '/application/views/newpage/user/' . $view . '.php';
    return ob_get_clean();
}
$checks = 0;
function check($value, $label) {
    global $checks;
    $checks++;
    if (!$value) { throw new RuntimeException('FAIL: ' . $label); }
}
foreach (['"><script id="canary">alert(1)</script>', 'normal@example.invalid', "';alert(1);//", '</script><script id="canary">alert(1)</script>', "a&b\"'<>中文"] as $value) {
    $html = render('login', $value);
    $doc = new DOMDocument();
    @$doc->loadHTML('<?xml encoding="UTF-8">' . $html);
    $xpath = new DOMXPath($doc);
    check($xpath->query('//*[@id="canary"]')->length === 0, 'login rejects injected elements');
    check($xpath->query('//*[@id="email"]')->item(0)->getAttribute('value') === $value, 'login retains literal email');
    $html = render('reset_password', $value);
    $doc = new DOMDocument();
    @$doc->loadHTML('<?xml encoding="UTF-8">' . $html);
    $xpath = new DOMXPath($doc);
    check($xpath->query('//*[@id="canary"]')->length === 0, 'reset rejects injected elements');
    foreach (['key', 'mode'] as $name) {
        preg_match('/var ' . $name . ' = ("(?:[^"\\\\]|\\\\.)*");/', $html, $match);
        check(isset($match[1]) && json_decode($match[1], TRUE) === $value, 'reset ' . $name . ' remains a literal JSON string');
        check(stripos($match[1] ?? '', '</script') === FALSE, 'reset ' . $name . ' cannot end script element');
    }
    check(strpos($xpath->query('//form')->item(0)->getAttribute('action'), rawurlencode($value)) !== FALSE, 'reset form action encodes mode');
}
echo $checks . " user output encoding checks, 0 failures.\n";
