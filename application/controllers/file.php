<?php

require_once APPPATH . '/libraries/storage.php';
require_once APPPATH . '/controllers/base.php';

class File extends Base
{
    public function __construct()
    {
        parent::__construct();
    }

    public function fetch()
    {
        $storageName = trim($this->uri->segment(3));
        if (!$storageName) {
            exit('No storage');
        }

        $fileKey = trim($this->uri->segment(4));
        if (!$fileKey) {
            exit('Not Found');
        }

        $allowedStorage = ['avatar'];

        if (!in_array($storageName, $allowedStorage)) {
            exit('Not Allowed');
        }

        $storage = Storage::factory($storageName);
        $path = $storage->getPathByFileName($fileKey);
        $path = $storage->getAbsolutePath($path);

        if (!file_exists($path)) {
            exit('Not Found');
        }

        $finfo = finfo_open(FILEINFO_MIME); // 返回 mime 类型
        $mimeType = finfo_file($finfo, $path);
        $contentType = explode(';', $mimeType)[0];
        finfo_close($finfo);

        header('Content-type: ' . $contentType);
        $file = fopen($path, 'r');
        echo fread($file, filesize($path));
        fclose($file);
    }
}
