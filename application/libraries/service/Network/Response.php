<?php

namespace service\Network;

use service\Network\Request;
use service\ErrorCode\ErrorCode;
use service\Utility\Logger;

class Response
{
    static private $statusCode = [
        200 => 'OK',
        400 => 'Bad Request',
        403 => 'Forbidden',
        404 => 'Not Found'
    ];

    static private $paging = [];

    static public function setTotal(int $total)
    {
        self::$paging['total'] = $total;
    }

    static public function reject(int $errorCode, string $extraMessage = NULL, array $data = [])
    {
        list($statusCode, $message) = ErrorCode::parse($errorCode);
        if ($extraMessage) {
            self::_response($statusCode, $data, $errorCode, $message . ' >>> Extra: ' . $extraMessage);
        } else {
            self::_response($statusCode, $data, $errorCode, $message);
        }
    }

    static public function output(array $data)
    {
        list($statusCode, $message) = ErrorCode::parse(0x0000);
        self::_response($statusCode, $data, 0x0000, $message);
    }

    static private function _response(int $statusCode = 200, $appendData = [], int $errorCode = 0, string $errorMessage = '')
    {
        // check accept type
        $accept = Request::parse()->accept;
        $accept = $accept ? $accept : 'json';
        header('HTTP/1.1 ' . $statusCode . ' ' . self::$statusCode[$statusCode]);
        header('Cache-Control: no-cache, must-revalidate');
        if ($accept === 'csv') {
            // text output
            header('Content-Type: text/csv');
            $content = '';
            if ($errorCode) {
                // gets error
                $content = 'Error: ' . $errorCode . ' ' . $errorMessage;
            } else {
                // output data
                foreach ($appendData as $value) {
                    $content .= ',,' . $value . PHP_EOL;
                }
            }
        } else if ($accept === 'json') {
            // json output
            header('Content-Type: application/json');
            $jsonData = [];
            $jsonData['request-id'] = Request::parse()->id;
            $jsonData['code'] = $errorCode;
            $jsonData['message'] = $errorMessage;
            $jsonData['data'] = $appendData;

            if (isset(self::$paging['total'])) {
                $jsonData['paging'] = [
                    'page' => Request::parse()->query['page'],
                    'pagesize' => Request::parse()->query['pagesize'],
                    'total' => self::$paging['total']
                ];
            }

            $content = json_encode($jsonData);
        } else {
            // binary output
            header('Content-Type: application/octet-stream');
            $content = $errorCode ? $errorMessage : $appendData;
        }
        header('Content-Length: ' . strlen($content));
        header('Request-ID: ' . Request::parse()->id);
        echo $content;

        Logger::Log(
            Logger::WebRequestLog(Request::parse(), $statusCode, $errorCode, $content),
            Logger::SCOPE_API
        );

        exit(0);
    }
}
