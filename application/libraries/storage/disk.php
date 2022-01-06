<?php

require_once APPPATH . '/libraries/storage.php';

class Storage_Disk extends Storage {

    protected $_storagePath;

    public function __construct($name)
    {
        parent::__construct($name);
        $this->_storagePath = APPPATH . '../file-storage/' . $name;
    }

    public function writeFile($content, $path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        $this->createDirIfNotExists(dirname($absolutePath));
        $size = file_put_contents($absolutePath, $content);
    }

    public function removeFile($path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        $this->createDirIfNotExists(dirname($absolutePath));
        unlink($absolutePath);
    }

    public function readFile($path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        if (!file_exists($absolutePath)) {
            return false;
        }

        return file_get_contents($absolutePath);
    }

    public function moveUploadFile($tmpName, $path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        $this->createDirIfNotExists(dirname($absolutePath));
        move_uploaded_file($tmpName, $absolutePath);
    }

    public function copyFile($tmpName, $path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        $this->createDirIfNotExists(dirname($absolutePath));
        return copy($tmpName, $absolutePath);
    }

    public function getPathByFileName($fileName)
    {
        $dir1 = substr($fileName, 0, 1);
        $dir2 = substr($fileName, 1, 1);
        $dir3 = substr($fileName, 2, 1);
        $dir4 = substr($fileName, 3, 1);
        $dir5 = substr($fileName, 4, 1);
        $path = "$dir1/$dir2/$dir3/$dir4/$dir5/$fileName";

        return $path;
    }

    public function saveByFileName($fileName, $content)
    {
        $path = $this->getPathByFileName($fileName);
        $this->writeFile($content, $path);
    }

    public function getByFileName($fileName)
    {
        $path = $this->getPathByFileName($fileName);
        return $this->readFile($path);
    }

    public function createDirIfNotExists($path)
    {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
    }

    public function getAbsolutePath($path)
    {
        return $this->_storagePath . '/' . ltrim($path, '/');
    }

    public function fileExists($path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        return file_exists($absolutePath);
    }

    public function getFileSize($path)
    {
        $absolutePath = $this->getAbsolutePath($path);
        return filesize($absolutePath);
    }

}
