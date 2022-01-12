<?php
define('BASE_PATH', dirname(__FILE__));

$config = yaml_parse_file(dirname(BASE_PATH) . '/env.yaml');
if ($config['users'] && $config['users']['www'] && $config['users']['git']) {
    define('GIT_USER', $config['users']['git']);
    define('WWW_USER', $config['users']['www']);
} else {
    exit(1);
}

define('AUTHORIZE_KEYS_FILE_DIR', '/home/' . GIT_USER . '/.ssh');
define('AUTHORIZE_KEYS_FILE', AUTHORIZE_KEYS_FILE_DIR . '/authorized_keys');
define('MASTER_PIPE_NAME', BASE_PATH . '/modify_authorized_keys.master.pipe');
define('CHILD_PIPE_NAME', BASE_PATH . '/modify_authorized_keys.child.pipe');
define('PID_FILE', BASE_PATH . '/modify_authorized_keys.pid');

if (!file_exists(AUTHORIZE_KEYS_FILE)) {
    mkdir(AUTHORIZE_KEYS_FILE_DIR);
    touch(AUTHORIZE_KEYS_FILE);

    chown(AUTHORIZE_KEYS_FILE_DIR, GIT_USER);
    chgrp(AUTHORIZE_KEYS_FILE_DIR, GIT_USER);
    chown(AUTHORIZE_KEYS_FILE, GIT_USER);
    chgrp(AUTHORIZE_KEYS_FILE, GIT_USER);
}

createDaemon();

function createDaemon()
{
    $pid = pcntl_fork();

    if (!$pid) {
        childProcess();
        exit(0);
    }

    parentProcess();
    exit(0);
}

function parentProcess()
{
    while (true) {
        if (!file_exists(MASTER_PIPE_NAME)) {
            umask(000);
            posix_mkfifo(MASTER_PIPE_NAME, 0777);
        }

        fopen(MASTER_PIPE_NAME, 'r');
        unlink(MASTER_PIPE_NAME);

        createProcess();
    }
}

function childProcess()
{
    $info = posix_getpwnam(WWW_USER);
    posix_setgid($info['gid']);
    posix_setuid($info['uid']);

    file_put_contents(PID_FILE, posix_getpid());

    while (true) {
        $sigNo = pcntl_sigwaitinfo([SIGKILL, SIGUSR1]);

        switch ($sigNo) {
            case SIGKILL:
                exit(0);
            case SIGUSR1:
                $f = fopen(MASTER_PIPE_NAME, 'w');
                fwrite($f, json_encode('SIGUSR1'));
                break;
        }
    }

    exit(0);
}

function createProcess()
{
    $pid = pcntl_fork();

    if ($pid) {
        return FALSE;
    }

    if (!file_exists(CHILD_PIPE_NAME)) {
        return FALSE;
    }

    $f = fopen(CHILD_PIPE_NAME, 'r');
    $data = json_decode(fread($f, 5120), TRUE);

    if (isset($data['user'])) {
        addAuthorizedKey($data);
    } else if (isset($data['key'])) {
        removeAuthorizedKey($data['key']);
    }

    exit(0);
}

function addAuthorizedKey(array $data)
{
    if (!$data) {
        return FALSE;
    }

    $sshGateway = dirname(BASE_PATH) . '/ssh-gateway/shell/main';
    $authorized = [
        "command=\"PATH=\$PATH:/usr/local/git/bin && {$sshGateway} \$SSH_ORIGINAL_COMMAND {$data['user']}\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty",
        $data['type'],
        $data['key'],
        $data['name'],
    ];

    file_put_contents(AUTHORIZE_KEYS_FILE, implode(' ', $authorized) . "\n", FILE_APPEND);
}

function removeAuthorizedKey(string $key)
{
    if (!$key) {
        return FALSE;
    }

    $keys = explode("\n", file_get_contents(AUTHORIZE_KEYS_FILE));

    $final = [];
    foreach ($keys as $item) {
        if (strpos($item, $key) === FALSE) {
            array_push($final, $item);
        }
    }

    file_put_contents(AUTHORIZE_KEYS_FILE, implode("\n", $final));
}
