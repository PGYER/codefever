<?php

use service\Utility\Helper;

$fixture = tempnam(sys_get_temp_dir(), 'codefever-authorized-');
register_shutdown_function(function () use ($fixture) { unlink($fixture); });
define('BASE_PATH', '/codefever/misc');
define('AUTHORIZE_KEYS_FILE', $fixture);
$config = ['cli' => ['git' => '/usr/bin/git']];
require dirname(__DIR__, 2) . '/misc/authorized_key_entry.php';

function check($condition, $label)
{
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $label);
    }
}

$key = 'AAAAC3NzaC1lZDI1NTE5AAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
$entry = ['user' => 'fixture_user', 'type' => 'ssh-ed25519', 'key' => $key];
$label = "Laptop\ncommand=\"fixture\" ssh-ed25519 " . $key;
check(!Helper::isSSHKeyLabel($label), 'reject newline in a key label');
foreach (["\r", "\n", "\0", "\t"] as $control) {
    check(!Helper::isSSHKeyLabel('Laptop' . $control), 'reject control characters in labels');
}
check(Helper::isSSHKeyLabel('开发 laptop'), 'accept ordinary Unicode labels');
check(addAuthorizedKey($entry + ['name' => $label]), 'legacy message label is ignored');
$lines = file($fixture, FILE_IGNORE_NEW_LINES);
check(count($lines) === 1, 'one entry even when legacy message includes a newline');
check(strpos($lines[0], '$SSH_ORIGINAL_COMMAND fixture_user",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 ' . $key) !== FALSE, 'forced command and restrictions retained');
foreach (['user', 'type', 'key'] as $field) {
    foreach (["\n", "\r", "\0", ' '] as $separator) {
        $invalid = $entry;
        $invalid[$field] .= $separator . $key;
        check(!addAuthorizedKey($invalid), 'worker rejects injection into ' . $field);
    }
}
check(file($fixture, FILE_IGNORE_NEW_LINES) === $lines, 'invalid requests never change authorized_keys');
echo "SSH authorized key checks passed.\n";
