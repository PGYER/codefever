<?php
namespace service\CacheData;

class Store {

    private $_data = [];

    public function __construct()
    {
        // do nothing
    }

    public function get (string $key)
    {
        if (array_key_exists($key, $this->_data)) {
            return $this->_data[$key];
        } else {
            return FALSE;
        }
    }

    public function set (string $key, $data)
    {
        $this->_data[$key] = $data;
        return $data;
    }

    public function delete (string $key)
    {
        unset($this->_data[$key]);
        return TRUE;
    }

    public function exsit (string $key)
    {
        return array_key_exists($key, $this->_data);
    }

    public function list ()
    {
        return $this->_data;
    }

    public function empty ()
    {
        $this->_data = [];
        return TRUE;
    }

    public function __toString ()
    {
        return json_encode($this->_data);
    }
}