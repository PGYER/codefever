<?php

require_once APPPATH . '/controllers/base.php';

class Doc extends Base
{
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
        $rootDir = implode('/', [dirname(APPPATH), 'doc', $docPath]) . '/';
        $docDir = array_slice($segments, 2);
        $docFile = $rootDir . implode('/', $docDir);

        if (preg_match('/^\w{32}\.png$/', $fileName)) {
            $this->_assets($docFile);
            exit;
        }

        if (!file_exists($docFile)) {
            header("Location: /doc/{$segments[1]}/");
            exit;
        }

        if (strpos($fileName, '.md')) {
            $docDir = array_slice($segments, 2, -1);
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

        if (!preg_match('/\.[a-z0-9]+/i', $docFile)) {
            $pathinfo = $_SERVER['PATH_INFO'];
            while ($menu && count($menuOptions) > 0) {
                if (strpos($menuOptions[0]['path'], '.') > 0) {
                    $pathinfo = rtrim($pathinfo, '/');
                    $pathinfo .= '/' . $menuOptions[0]['path'];
                    header("Location: $pathinfo");
                    break;
                } else {
                    $pathinfo = rtrim($pathinfo, '/');
                    $pathinfo .= '/' . $menuOptions[0]['path'];
                    $docFile .= '/' . $menuOptions[0]['path'];
                    $menuOptions = $this->_extractMenu($docFile . '/index.md');
                }
            }
        }

        $this->load->view('doc/detail', [
            'segments' => $segments,
            'menu' => $menu,
            'doc' => str_replace('`', '\`', file_get_contents($docFile)),
        ]);
    }

    private function _extractMenu(string $menuFilePath)
    {
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
        if (!file_exists($path)) {
            exit;
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
