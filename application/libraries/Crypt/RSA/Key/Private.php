<?php
/**
 * Crypt_RSA_Key_Private
 *
 *     作者: 石瑞 (shirui@gmail.com)
 * 创建时间: 2010-07-14 10:03:00
 * 修改记录:
 *
 * $Id: Private.php 21 2010-10-08 06:47:25Z shirui $
 */

class Crypt_RSA_Key_Private extends Crypt_RSA_Key {

    protected $_publicKey = null;

    public function __construct($pemString, $passPhrase = null) {

        $this->_pemString = $pemString;
        $this->_parse($passPhrase);
    }

    /**
     * @param string $passPhrase
     * @throws Crypt_Exception
     */
    protected function _parse($passPhrase) {

        $result = openssl_get_privatekey($this->_pemString, $passPhrase);
        if (!$result) {
            throw new Crypt_Exception('Unable to load private key');
        }
        $this->_opensslKeyResource = $result;
        $this->_details = openssl_pkey_get_details($this->_opensslKeyResource);
    }

    public function getPublicKey() {

        if (is_null($this->_publicKey)) {
            $this->_publicKey = new Crypt_RSA_Key_Public($this->_details['key']);
        }
        return $this->_publicKey;
    }

}
