<?php
namespace service\MessageService\Email\Driver;

use service\Utility\Logger;
use service\Utility\Command;

class Mail {
    static function send (string $to, string $title, string $body)
    {
        Logger::Log(
            'Sent!, to=' . $to . ', subject=' . $title . ', body: ' . $body,
            Logger::SCOPE_EMAIL
        );

        $from = YAML_EMAIL_NAME . '<' . YAML_EMAIL_FROM . '>';

        // $result = exec("export LANG=en_US.UTF-8 && echo -e '{$body}' | mail -r '{$from}' -s '{$title}' '{$to}' > /dev/null &");

        $result = [];
        Command::run([
            'echo', '-e', Command::wrapArgument($body), '|',
            'mail', '-r', Command::wrapArgument($from),
            '-s', Command::wrapArgument($title), Command::wrapArgument($to),
            '> /dev/null &'
        ], $result);

        $result = implode('', $result);

        Logger::Log(
            'from:' . $from . ' Sent result:' .  json_encode($result),
            Logger::SCOPE_EMAIL
        );

        return true;
    }
}
