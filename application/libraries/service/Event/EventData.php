<?php
namespace service\Event;

class EventData {

    protected $_dataStream = NULL;

    public function __construct($data) {
        $this->_dataStream = $data;
    }

    public function __get ($varibleName) {
        if (isset($this->_dataStream[$varibleName])) {
            return $this->_dataStream[$varibleName];
        } else {
            throw new \service\Exception\Exception(1000);
        }
    }

    public function getData() {
        return json_encode($this->_dataStream);
    }

    public function __toString() {
        return $this->getData();
    }
}
