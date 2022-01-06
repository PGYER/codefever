<?php

namespace service\Exception;

class Exception extends \Exception {

    public function __construct ($code) {
        $message = $this->_getMessage($code);
        parent::__construct($message, $code);
    }

    private function _getMessage($code) {
        return $this->_errorCode()[$code];
    }

    /*
    0 unknwon Error
    1xxx not found Error
    2xxx evnet data error
    */
    private function _errorCode () {
        return [
            0 => 'Unknown error.',
            1000 => 'Unknown attribute.',
            1001 => 'Unknown class.',
            1002 => 'NULL is not allowed.',
            1003 => 'Missing parameter.',
            2001 => 'Can Not Find Event Type.',
            2002 => 'Can Not Find Event Data Description.',
            2003 => 'Event Data Not Fit As Its Description.',
            2004 => 'Event Data Description Not Well Formated.',
        ];
    }
}
