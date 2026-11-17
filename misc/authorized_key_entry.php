<?php

use service\Utility\Helper;

require_once dirname(__DIR__) . '/application/libraries/service/Utility/Helper.php';

function addAuthorizedKey(array $data)
{
    if (!Helper::isAuthorizedKeyEntry($data)) {
        return FALSE;
    }

    global $config;

    $sshGateway = dirname(BASE_PATH) . '/ssh-gateway/shell/main';
    $authorized = [
        "command=\"PATH=\$PATH:" . dirname($config['cli']['git']) . " && {$sshGateway} \$SSH_ORIGINAL_COMMAND {$data['user']}\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty",
        $data['type'],
        $data['key'],
    ];

    return file_put_contents(AUTHORIZE_KEYS_FILE, implode(' ', $authorized) . "\n", FILE_APPEND | LOCK_EX) !== FALSE;
}
