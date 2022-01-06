<?php
/**
 * Crypt
 *
 * 可直接用于url
 *
 *      作者: 周国强(zhouguoqiang@gmail.com)
 *  创建时间: 2008-03-27
 *  修改记录:
 *       url: http://www.phpdiary.org/articles/simple-php-encrypt-public static function/
 *
 * $Id: URL.php 21 2010-10-08 06:47:25Z shirui $
 */

class Crypt_URL extends Crypt {

    /**
     * encrypt
     * 加密
     * 
     * @param  string $string 要加密的字符串
     * @param  string $key 干扰码
     * @return string
     */
    public function encrypt($string, $key) {
        $result = '';
        for($i=0; $i<strlen ($string); $i++) {
            $char = substr($string, $i, 1);
            $keychar = substr($key, ($i % strlen($key))-1, 1);
            $char = chr(ord($char)+ord($keychar));
            $result.=$char;
        }
        return $this->base64urlEncode($result);
    }

    /**
     * decrypt
     * 解密
     * 
     * @param  string $string 要加密的字符串
     * @param  string $key 干扰码
     * @return string
     */
    public function decrypt($string, $key) {
        $result = '';
        $string = $this->base64urlDecode($string);
        for($i=0; $i<strlen($string); $i++) {
            $char = substr($string, $i, 1);
            $keychar = substr($key, ($i % strlen($key))-1, 1);
            $char = chr(ord($char)-ord($keychar));
            $result.=$char;
        }
        return $result;
    }

    /**
     * base64urlEncode
     *
     * @param  string $plainText
     * @return string
     */
    public function base64urlEncode($plainText) {
        $base64 = base64_encode($plainText);
        $base64url = strtr($base64, '+/', '-_');
        return ($base64url);
    }

    /**
     * base64urlDecode
     *
     * @param  string $plainText
     * @return string
     */
    public function base64urlDecode($plainText) {
        $base64 = strtr($plainText, '-_', '+/');
        return base64_decode($base64);
    }

}
