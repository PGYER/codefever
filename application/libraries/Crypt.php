<?php
/**
 * Crypt
 *
 *      作者: 周国强(zhouguoqiang@comsenz.com)
 *  创建时间: 2008-03-27
 *  修改记录: 
 *
 *    <code>
 *        $crypt =& Crypt::factory('URL');
 *        $decode = $crypt->encrypt('shirui', $key);
 *    </code>
 *
 * $Id: Crypt.php 21 2010-10-08 06:47:25Z shirui $
 *
 */

class Crypt {

    public static function &factory($driver, $params = array()) {
        $class = 'Crypt_' . $driver;
        if (class_exists($class)) {
            $obj = new $class($params);
            return $obj;
        } else {
            throw new Crypt_Exception('Unable to find class for driver ' . $driver);
        }
    }

    /**
     * encrypt
     * 加密
     * 
     * @param  string $string 要加密的字符串
     * @return string
     */
    public function encrypt($string) {
        throw new Crypt_Exception('method not defined');
    }

    /**
     * decrypt
     * 解密
     * 
     * @param  string $string 要加密的字符串
     * @return string
     */
    public function decrypt($string, $key) {
        throw new Crypt_Exception('method not defined');
    }

}
