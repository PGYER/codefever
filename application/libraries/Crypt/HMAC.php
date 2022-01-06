<?php
/**
 * Crypt_HMAC
 *
 *     作者: 石瑞 (shirui@gmail.com)
 * 创建时间: 2010-07-14 10:03:00
 * 修改记录:
 *
 * $Id: HMAC.php 21 2010-10-08 06:47:25Z shirui $
 */

class Crypt_HMAC extends Crypt {

    /**
     * 加密时用到的key
     *
     * @var string
     */
    protected static $_key = null;

    /**
     * 算法对应的函数(支持的函数可以用php内置函数hash_algos()获得)
     * + md5
     * + sha1
     * + ...
     *
     * @var string
     */
    protected static $_hashAlgorithm = 'md5';

    /**
     * mhash()函数支持的算法
     *
     * @var array
     */
    protected static $_supportedMhashAlgorithms = array('adler32',' crc32', 'crc32b', 'gost',
            'haval128', 'haval160', 'haval192', 'haval256', 'md4', 'md5', 'ripemd160',
            'sha1', 'sha256', 'tiger', 'tiger128', 'tiger160');

    /**
     * 加密结果的格式
     */
    const STRING = 'string';
    const BINARY = 'binary';

    /**
     * @var array
     */
    protected static $_supportedAlgosMhash = array(
                                                   'adler32',
                                                   'crc32',
                                                   'crc32b',
                                                   'gost',
                                                   'haval128',
                                                   'haval160',
                                                   'haval192',
                                                   'haval256',
                                                   'md4',
                                                   'md5',
                                                   'ripemd160',
                                                   'sha1',
                                                   'sha256',
                                                   'tiger',
                                                   'tiger128',
                                                   'tiger160'
                                                  );


    /**
     * 加密
     *
     * @param string $key
     * @param string $hash
     * @param string $data
     * @param string $output
     * @param boolean $internal
     * @return string
     */
    public static function encode($key, $hash, $data, $output = self::STRING) {

        // set the key
        if (!isset($key) || empty($key)) {
            throw new Crypt_Exception('provided key is null or empty');
        }
        self::$_key = $key;

        // set the hash
        self::_setHashAlgorithm($hash);

        // perform hashing and return
        return self::_hash($data, $output);
    }

    /**
     * 设置hash算法
     *
     * @param string $hash
     * @return
     */
    protected static function _setHashAlgorithm($hash) {

        if (!isset($hash) || empty($hash)) {
            throw new Crypt_Exception('provided hash string is null or empty');
        }

        $hash = strtolower($hash);
        $hashSupported = false;

        if (function_exists('hash_algos') && in_array($hash, hash_algos())) {
            $hashSupported = true;
        }

        if ($hashSupported === false && function_exists('mhash') && in_array($hash, self::$_supportedAlgosMhash)) {
            $hashSupported = true;
        }

        if ($hashSupported === false) {
            throw new Crypt_Exception('hash algorithm provided is not supported on this PHP installation; please enable the hash or mhash extensions');
        }

        self::$_hashAlgorithm = $hash;
    }

    /**
     * 执行HMAC加密
     *
     * @param string $data
     * @param string $output
     * @return string
     */
    protected static function _hash($data, $output = self::STRING) {

        if (function_exists('hash_hmac')) {
            if ($output == self::BINARY) {
                return hash_hmac(self::$_hashAlgorithm, $data, self::$_key, 1);
            }
            return hash_hmac(self::$_hashAlgorithm, $data, self::$_key);
        }

        if (function_exists('mhash')) {
            if ($output == self::BINARY) {
                return mhash(self::_getMhashDefinition(self::$_hashAlgorithm), $data, self::$_key);
            }
            $bin = mhash(self::_getMhashDefinition(self::$_hashAlgorithm), $data, self::$_key);
            return bin2hex($bin);
        }
    }

    /**
     * _getMhashDefinition
     *
     * @param string $hashAlgorithm
     * @return integer
     */
    protected static function _getMhashDefinition($hashAlgorithm) {

        for ($i = 0; $i <= mhash_count(); $i++) {
            $types[mhash_get_hash_name($i)] = $i;
        }
        return $types[strtoupper($hashAlgorithm)];
    }

}
