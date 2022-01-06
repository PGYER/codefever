<?php

require_once APPPATH . '/libraries/storage/disk.php';

class Storage {

    public $name;

    public static function factory($name)
    {
        $ci =& get_instance();
        $ci->load->config('storage');
        $type = $ci->config->item('storage_type');

        $type = strtolower($type);

        return new Storage_Disk($name);
    }

    public function __construct($name)
    {
        $this->name = $name;
    }

    function writeFile($content, $path)
    {
    }

    function removeFile($path)
    {
    }

}
