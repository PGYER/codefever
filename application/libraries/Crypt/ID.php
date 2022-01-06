<?php
/**
 * Crypt_ID
 *
 * 作者:  石瑞 (shirui@gmail.com)
 * 创建时间: 2015-01-11 16:15:11
 * 修改记录:
 *
 * $Id$
 */

class Crypt_ID extends Crypt {

    private static $_digit = 8;

    private static $_param = 1;

    private static function dec2base($n) {
        $s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        do {
            $mod = fmod($n, 62);
            $r = $s[$mod] . $r;
            $n = ($n - $mod) / 62;
        } while($n > 0);

        return $r;
    }

    private static function base2dec($str) {
        $s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $strLen = strlen($str);
        $n = strpos($s, $str[$strLen - 1]);

        for($i = 0; $i < $strLen - 1; $i++) {
            $n = (pow(62, $strLen - $i - 1) * strpos($s, $str[$i])) + $n;
        }
        return $n;
    }

    public function encrypt($id1) {
        $s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $verifyCode = $s[abs(($id1 * 1978) % 62)];

        $id = sprintf("%0" . self::$_digit . "s%s", 
                      self::dec2base($id1), $verifyCode);

        if (strlen($id) != (self::$_digit * self::$_param) + 1) {
            return '';
        }
        return $id;
    }

    public function decrypt($id) {
        $s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        if (!preg_match("/^[0-9a-zA-Z]{" . ((self::$_digit * self::$_param) + 1) . "}/",$id)) {
            return null;
        }

        $id1 = self::base2dec(substr($id, 0, self::$_digit));

        if ($id[self::$_param * self::$_digit] == $s[abs(($id1 * 1978) % 62)]) {
            return $id1;
        }
        return null;
    }

    public static function isVid($id, $decode=true) {
        $s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        if (!preg_match("/^[0-9a-zA-Z]{" . ((self::$_digit * self::$_param) + 1)  . "}/",$id)) {
            return false;
        }

        if ($decode == false) {
            return true;
        }

        $id1 = self::base2dec(substr($id, 0, self::$_digit));

        if ($id[self::$_param * self::$_digit] == $s[abs(($id1 * 1978) % 62)]) {
            return true;
        }
        return false;
    }

}
