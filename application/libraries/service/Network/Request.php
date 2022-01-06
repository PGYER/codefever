<?php

namespace service\Network;

use service\Network\Response;
use service\Utility\UUID;

class Request
{
    static private $request;
    static private $requestTime;
    static private $instance;

    private function __construct()
    {
    }

    static public function parse()
    {
        if (self::$instance) {
            return self::$instance;
        }

        self::$instance = new self();
        self::$requestTime = microtime();

        // get http parameters
        $finalData = [];
        $finalData['token'] = $_SERVER['HTTP_TOKEN'];
        $finalData['uri'] = $_SERVER['REQUEST_URI'];
        $finalData['query'] = $_GET;
        $finalData['method'] = ['GET' => 'GET', 'POST' => 'POST', 'PUT' => 'PUT', 'DELETE' => 'DELETE'][$_SERVER['REQUEST_METHOD']];
        $finalData['accept'] = ['application/json' => 'json', '*/*' => 'binary'][$_SERVER['HTTP_ACCEPT']];
        $finalData['contentType'] = [
            NULL => 'get',
            'application/json' => 'json',
            'multipart/form-data' => 'form',
            'application/x-www-form-urlencoded' => 'form-text'
        ][explode(';', $_SERVER['HTTP_CONTENT_TYPE'])[0]];
        $finalData['contentLength'] = $_SERVER['HTTP_CONTENT_LENGTH'];
        $finalData['timestamp'] = time();
        $finalData['id'] = UUID::getUUID();

        if ($finalData['contentType'] === 'json') {
            $finalData['content'] = file_get_contents('php://input');
            $finalData['parsed'] = json_decode($finalData['content'], true);
        } else if ($finalData['contentType'] === 'form') {
            $finalData['content'] = NULL;
            $finalData['parsed'] = $_POST;
        } else if ($finalData['contentType'] === 'form-text') {
            $finalData['content'] = file_get_contents('php://input');
            $finalData['parsed'] = $_POST;
        } else if ($finalData['contentType'] === 'get') {
            $finalData['content'] = NULL;
            $finalData['parsed'] = [];
        }

        self::$request = $finalData;

        // check request
        if (!$finalData['method']) {
            // unaccept method
            Response::reject(0x0102);
        }

        if (!$finalData['accept'] || !$finalData['contentType']) {
            // missing accept header or content-type header
            Response::reject(0x0103);
        }

        if ($finalData['contentType'] !== 'form' && $finalData['contentLength'] != strlen($finalData['content'])) {
            // content length not match the size of content
            Response::reject(0x0104);
        }

        // apply paging settings
        if (
            !isset($finalData['query']['page']) ||
            !is_int($finalData['query']['page']) ||
            $finalData['query']['page'] < 0
        ) {
            $finalData['query']['page'] = 1;
        }

        if (
            !isset($finalData['query']['pagesize']) ||
            !is_int($finalData['query']['pagesize']) ||
            $finalData['query']['pagesize'] > DEFAULT_PAGE_SIZE_MAX ||
            $finalData['query']['pagesize'] < 0
        ) {
            $finalData['query']['pagesize'] = DEFAULT_PAGE_SIZE;
        }

        return self::$instance;
    }

    static public function setAuthData(array $data)
    {
        self::parse()::$request['authData'] = $data;
        return TRUE;
    }

    static public function getRequestTime()
    {
        return self::$requestTime;
    }

    public function __get($key)
    {
        return self::$request[$key];
    }
}
