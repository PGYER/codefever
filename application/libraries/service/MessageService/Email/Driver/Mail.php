<?php
namespace service\MessageService\Email\Driver;

use service\Utility\Logger;

class Mail {
    static function send (string $to, string $title, string $body)
    {
        Logger::log(
            'Sent!, to=' . $to . ', subject=' . $title . ', body: ' . $body,
            Logger::SCOPE_EMAIL
        );

        $from = YAML_EMAIL_NAME . '<' . YAML_EMAIL_FROM . '>';
        $result = exec("echo -e '{$body}' | mail -r '{$from}' -s '{$title}' '{$to}'");

        Logger::log(
            'from:' . $from . 'Sent result:' .  json_encode($result),
            Logger::SCOPE_EMAIL
        );

        return true;
    }
}
