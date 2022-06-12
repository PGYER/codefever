<?php
namespace service\MessageService\Email;

use service\Exception\Exception;

class EmailTemplate {

    const verifyCode = '【CodeFever Community】您好，本次的邮箱验证码是 %s , 验证码五分钟内有效, 请及时填写。';
    public static function verifyCode (string $code) {
        return sprintf(self::verifyCode, $code);
    }

    const notify = '【CodeFever Community】%s <br/> <a href="%s">%s</a>';
    public static function notify (array $data) {
        return sprintf(self::notify, $data['mailBody'], $data['url'], $data['url']);
    }

}
