<?php

require_once APPPATH . '/controllers/base.php';

class Doc extends Base
{
    private $docRoot;

    public function __construct()
    {
        $path = $_SERVER['PATH_INFO'];
        if (!preg_match('/\.[a-z0-9]+$/i', $path)) {
            if ($path === '/doc' || $path === '/doc/') {
                header("Location: /doc/cn/");
            } else if (substr($path, -1) !== '/') {
                header("Location: {$path}/");
                exit();
            }
        }

        parent::__construct();
    }

    public function index ()
    {
        // doing nothing
    }

    public function cn()
    {
        $this->_detail('zh-cn');
    }

    public function en()
    {
        $this->_detail('en-us');
    }

    private function _detail(string $docPath)
    {
        $path = $this->uri->uri_string;
        $segments = explode('/', $path);
        $fileName = $segments[count($segments) - 1];
        $this->docRoot = realpath(dirname(APPPATH) . '/doc/' . $docPath);
        if ($this->docRoot === FALSE) {
            show_404();
            return;
        }
        $rootDir = $this->docRoot . DIRECTORY_SEPARATOR;
        $docDir = array_slice($segments, 2);
        $docFile = $this->_resolveDocPath($rootDir . implode('/', $docDir), TRUE);
        if ($docFile === FALSE) {
            show_404();
            return;
        }

        if (preg_match('/^\w{32}\.png$/', $fileName)) {
            $this->_assets($docFile);
            exit;
        }

        if (is_file($docFile) && pathinfo($docFile, PATHINFO_EXTENSION) !== 'md') {
            show_404();
            return;
        }

        $menuFile = $rootDir . 'index.md';
        $menu = $this->_extractMenu($menuFile);
        $menuOptions = $menu;

        foreach ($menu as &$item) {
            $menuFile = $rootDir . $item['path'] . '/index.md';
            if (!file_exists($menuFile)) {
                continue;
            }

            $submenu = $this->_extractMenu($menuFile);
            foreach ($submenu as &$item2) {
                $item2['path'] = $item['path'] . '/' . $item2['path'];
            }

            $item['submenu'] = $submenu;
        }

        if (is_dir($docFile)) {
            $menuOptions = $this->_extractMenu($docFile . '/index.md');
            $pathinfo = $_SERVER['PATH_INFO'];
            while ($menu && count($menuOptions) > 0) {
                if (strpos($menuOptions[0]['path'], '.') > 0) {
                    $pathinfo = rtrim($pathinfo, '/');
                    $pathinfo .= '/' . $menuOptions[0]['path'];
                    $target = $this->_resolveDocPath($docFile . '/' . $menuOptions[0]['path']);
                    if ($target === FALSE || pathinfo($target, PATHINFO_EXTENSION) !== 'md') {
                        show_404();
                        return;
                    }
                    header("Location: $pathinfo");
                    exit;
                } else {
                    $pathinfo = rtrim($pathinfo, '/');
                    $pathinfo .= '/' . $menuOptions[0]['path'];
                    $docFile = $this->_resolveDocPath($docFile . '/' . $menuOptions[0]['path'], TRUE);
                    if ($docFile === FALSE) {
                        show_404();
                        return;
                    }
                    $menuOptions = $this->_extractMenu($docFile . '/index.md');
                }
            }
            show_404();
            return;
        }

        $this->load->view('doc/detail', [
            'segments' => $segments,
            'menu' => $menu,
            'doc' => str_replace('`', '\`', file_get_contents($docFile)),
        ]);
    }

    // Resolve symlinks as well as traversal, and include the separator in the boundary.
    private function _resolveDocPath(string $path, bool $allowDirectory = FALSE)
    {
        if ($this->docRoot === FALSE || $this->docRoot === NULL || strpos($path, "\0") !== FALSE) {
            return FALSE;
        }

        $resolved = realpath($path);
        $prefix = $this->docRoot . DIRECTORY_SEPARATOR;
        if ($resolved === FALSE ||
            ($resolved !== $this->docRoot && strpos($resolved, $prefix) !== 0) ||
            !is_readable($resolved)) {
            return FALSE;
        }

        if (is_file($resolved) || ($allowDirectory && is_dir($resolved))) {
            return $resolved;
        }

        return FALSE;
    }

    private function _extractMenu(string $menuFilePath)
    {
        $menuFilePath = $this->_resolveDocPath($menuFilePath);
        if ($menuFilePath === FALSE || pathinfo($menuFilePath, PATHINFO_EXTENSION) !== 'md') {
            return [];
        }
        $data = file_get_contents($menuFilePath);
        $output = [];
        $lines = explode("\n", $data);
        foreach ($lines as $line) {
            $matches = [];
            if (preg_match('/\[([^\]]+)\]\(([^\)]+)\)/', $line, $matches)) {
                array_push($output, ['name' => $matches[1], 'path' => trim($matches[2])]);
            }
        }

        return $output;
    }

    private function _assets($path)
    {
        $path = $this->_resolveDocPath($path);
        if ($path === FALSE || !preg_match('/^\w{32}\.png$/', basename($path))) {
            show_404();
            return;
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
