<?php
// this function use to generated uuid
namespace service\Utility;

class TOTP {

    const SALT = 'codefever_salt';
    const TOTP_REFRESH_INTERVAL = 30;
    const TOTP_CHECK_WINDOW_MIN = -10;
    const TOTP_CHECK_WINDOW_MAX = 10;
    const PASSWORD_LENGTH = 6;

    static private function hashInput (string $input) {
        $salt = self::SALT;
        if (TOTP_SALT) {
            $salt = TOTP_SALT;
        }

        $input = $input ? $input : self::SALT;

        return hash('sha256', md5($input) . md5($salt), FALSE);
    }

    static private function genTotp (string $hashedInput, int $timestamp) {
        $sequence = floor($timestamp / 30);
        $code = hash_hmac('sha256', $hashedInput . md5($sequence), md5($sequence), TRUE);

        $finalValue = 0;
        $index = 0;

        do {
            $finalValue += ord($code[$index]);
            $finalValue = $finalValue << 2;
            $index++;
        } while (isset($code[$index]));

        return $finalValue;
    }

    static private function trimTotp (int $sourceTotp) {
        $trimedTotp = $sourceTotp % pow(10, self::PASSWORD_LENGTH);
        $format = "%'.0". self::PASSWORD_LENGTH ."u";
        return sprintf($format, abs($trimedTotp));
    }


    static function generate(string $input) {
        return self::trimTotp(self::genTotp(self::hashInput($input), time()));
    }

    static function check(string $input, string $code) {
        $hashedInput = self::hashInput($input);
        $currentTime = time();
        for (
            $windowIndex = self::TOTP_CHECK_WINDOW_MIN;
            $windowIndex <= self::TOTP_CHECK_WINDOW_MAX;
            $windowIndex++
        ) {
            if (
                $code === self::trimTotp(
                    self::genTotp(
                        $hashedInput, 
                        $currentTime + ($windowIndex * self::TOTP_REFRESH_INTERVAL)
                    )
                )
            ) {
                return TRUE;
            }
        }

        return FALSE;
    }
}
