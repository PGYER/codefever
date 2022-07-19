<?php

namespace service\Utility;

use service\Network\Request;
use service\Event\ServiceEvent;

class Logger {

    const SCOPE_API = 'api';
    const SCOPE_EVENT = 'event';
    const SCOPE_SCHEDULE = 'schedule';
    const SCOPE_SYSTEM = 'system';
    const SCOPE_SMS = 'sms';
    const SCOPE_EMAIL = 'email';

    private static function getLogPath ($subDir) {
        $path = APPPATH . '/logs/' . $subDir;

        if (!is_dir($path)) {
            mkdir($path);
        }

        return $path . '/' . date('Ymd') . '.log';
    }

    static function Log(string $log = '', string $scope) {
        $path = self::getLogPath($scope);
        $log = '[' . date('Y-m-d H:i:s u') . '] : ' . $log . PHP_EOL;
        file_put_contents($path, $log, FILE_APPEND);
        return TRUE;
    }

    static function WebRequestLog (Request $request, int $statusCode = 200, int $errorCode = 0, string $response = '') {
        return implode(PHP_EOL, [
            'Log A Request: ',
            'Time Point: From ' . $request::getRequestTime() . ' To ' . microtime(),
            'ID: ' . $request::parse()->id,
            implode(' ', [$request::parse()->method, $request::parse()->uri]),
            implode(' ', [substr($request::parse()->content, 0, 1024), '[First KB Only]']),
            'Response: ' . $statusCode . ' (' . $errorCode . ')',
            implode(' ', [substr($response, 0, 1024), ' [First KB Only]'])
        ]);
    }

    static function EventDispatchLog (ServiceEvent $event, string $startTime, array $handler) {
        return implode(PHP_EOL, [
            'Log Event Dispatch: ',
            'Time Point: From ' . $startTime . ' To ' . microtime(),
            'ID: ' . $event->id,
            'Handler: ' . implode('|', $handler),
            implode(' ', [substr($event->getContent(), 0, 1024), ' [First KB Only]'])
        ]);
    }
}
