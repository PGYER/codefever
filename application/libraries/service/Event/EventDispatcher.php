<?php
// this is a abstract of Event data object

namespace service\Event;

use service\Event\EventData;
use service\Event\ServiceEvent;
use service\Utility\DataConstructor;
use service\Utility\Logger;

abstract class EventDispatcher {

    protected $CI = NULL;
    protected $eventHandler = [];

    public function __construct(ServiceEvent $event) {

        $eventTypes = explode(':', $event->type);
        $handlerArray = $this->_getEventHandler($eventTypes);
        $this->CI =& get_instance();

        foreach($handlerArray as $handler) {
            $startTime = microtime();
            $param = explode('@', $handler[0]);

            if(isset($param[0]) && isset($param[1])) {
                $tmpCalledClassName = $param[0];
                $tmpCalledFnName = $param[1];
                $handlerClass = new $tmpCalledClassName();
                $handlerClass->$tmpCalledFnName($event);
            } else if(isset($param[0])) {
                $tmpCalledClassName = $param[0];
                new $tmpCalledClassName($event);
            }

            Logger::Log(
                Logger::EventDispatchLog($event, $startTime, $handler),
                Logger::SCOPE_EVENT
            );
        }

    }

    private function _getEventHandler($eventTypes) {
        $wildcardHandler = [];
        $eventTypeHandlers = [];
        $normalHandlers = [];

        // get wildcard handler
        if(isset($this->eventHandler['*'])) {
            $wildcardHandler = $this->eventHandler['*'];
        }

        // get event type handler
        if(isset($this->eventHandler[$eventTypes[0]]['*'])) {
            $eventTypeHandlers = $this->eventHandler[$eventTypes[0]]['*'];
        }

        // get event normal handler
        if(isset($this->eventHandler[$eventTypes[0]][$eventTypes[1]])) {
            $normalHandlers = $this->eventHandler[$eventTypes[0]][$eventTypes[1]];
        }

        return array_merge($wildcardHandler, $eventTypeHandlers, $normalHandlers);
    }
}
