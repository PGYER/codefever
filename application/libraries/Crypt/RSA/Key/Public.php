<?php
/**
 * Crypt_RSA_Key_Public
 *
 *     作者: 石瑞 (shirui@gmail.com)
 * 创建时间: 2010-07-14 10:03:00
 * 修改记录:
 *
 * $Id: Public.php 21 2010-10-08 06:47:25Z shirui $
 */

class Crypt_RSA_Key_Public extends Crypt_RSA_Key {

    protected $_certificateString = null;

    public function __construct($string) {

        $this->_parse($string);
    }

    /**
     * @param string $string
     * @throws Crypt_Exception
     */
    protected function _parse($string) {

        if (preg_match("/^-----BEGIN CERTIFICATE-----/", $string)) {
            $this->_certificateString = $string;
        } else {
            $this->_pemString = $string;
        }

        $result = openssl_get_publickey($string);
        if (!$result) {
            throw new Crypt_Exception('Unable to load public key');
        }

        //openssl_pkey_export($result, $public);
        //$this->_pemString = $public;
        $this->_opensslKeyResource = $result;
        $this->_details = openssl_pkey_get_details($this->_opensslKeyResource);
    }

    public function getCertificate() {

        return $this->_certificateString;
    }

}
