<?php
/**
 * Crypt_HMAC_Key
 *
 *     作者: 石瑞 (shirui@gmail.com)
 * 创建时间: 2010-07-14 10:03:00
 * 修改记录:
 *
 * $Id: Key.php 21 2010-10-08 06:47:25Z shirui $
 */

class Crypt_RSA_Key implements Countable {

    /**
     * @var string
     */
    protected $_pemString = null;

    /**
     * Bits, key string and type of key
     *
     * @var array
     */
    protected $_details = array();

    /**
     * Key Resource
     *
     * @var resource
     */
    protected $_opensslKeyResource = null;

    /**
     * Retrieves key resource
     *
     * @return resource
     */
    public function getOpensslKeyResource() {

        return $this->_opensslKeyResource;
    }

    /**
     * @return string
     * @throws Crypt_Exception
     */
    public function toString() {

        if (!empty($this->_pemString)) {
            return $this->_pemString;
        } elseif (!empty($this->_certificateString)) {
            return $this->_certificateString;
        }

        throw new Crypt_Exception('No public key string representation is available');
    }

    /**
     * @return string
     */
    public function __toString() {

        return $this->toString();
    }

    public function count() {

        return $this->_details['bits'];
    }

    public function getType() {

        return $this->_details['type'];
    }
}
