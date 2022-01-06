<?php

namespace service\MessageService\Email;

class EmailSender
{
    const DRIVER_MAIL = 'service\MessageService\Email\Driver\Mail';

    static public function send(
        string $email,
        string $title,
        string $body,
        string $driver = self::DRIVER_MAIL
    ) {
        if (preg_match('/\d{6}/', $body)) {
            $body = EmailTemplate::compose($body);
        }
        $result = $driver::send($email, $title, $body);

        return $result;
    }
}
