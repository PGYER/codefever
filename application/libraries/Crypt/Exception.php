<?php
/**
 *  Crypt_Exception
 *
 *      作者: 石瑞 (shirui@gmail.com)
 *  创建时间: 2010-06-04 15:03:00
 *  修改记录:
 *
 *  $Id: Exception.php 21 2010-10-08 06:47:25Z shirui $
 */

class Crypt_Exception extends Exception {

    public function __construct($message, $code = 0) {
        if (is_a($message, 'Exception')) {
            parent::__construct($message->getMessage(), intval($message->getCode()));
        } else {
            parent::__construct($message, intval($code));
        }
    }

}
