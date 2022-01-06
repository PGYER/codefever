<?php
namespace service\MessageService\Email;

use service\Exception\Exception;

class EmailTemplate {

    const emailCodeTemplate = '【CodeFever Community】您好，本次的邮箱验证码是 %s , 验证码五分钟内有效, 请及时填写。';

    public static function compose (string $code) {
        if (!self::emailCodeTemplate) {
            throw new Exception(1000);
        }

        return sprintf(self::emailCodeTemplate, $code);
    }
}
