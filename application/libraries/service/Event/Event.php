<?php
// this is a abstract of Event data object

namespace service\Event;

use service\Event\EventData;
use service\Utility\UUID;
use service\Exception\Exception;


abstract class Event {

    protected $_eventStream = NULL;
    protected $_dispatcher = 'service\Event\GeneralEventDispatcher';

    public function __construct(string $eventType, EventData $eventData, string $generatedBy = NULL) {

        $event = [];
        $event['id'] = UUID::getUUID($eventData);
        $event['type'] = $eventType;
        $event['data'] = $eventData;
        $event['generatedBy'] = $generatedBy;
        $event['timestamp'] = time();
        $event['language'] = $_SERVER['HTTP_FRONT_END_LANG'] ? ['zh-cn' => LANG_CN, 'en-us' => LANG_EN][$_SERVER['HTTP_FRONT_END_LANG']] : LANG_CN;
        $this->_eventStream = $event;

        if($eventType != '') {
            // do not dispatch empty Event
            $this->dispatch();
        }
    }

    public function __get ($varibleName) {
        switch($varibleName) {
            case 'id': {
                return $this->_eventStream['id'];
                break;
            }
            case 'type': {
                return $this->_eventStream['type'];
                break;
            }
            case 'data': {
                return $this->_eventStream['data'];
                break;
            }
            case 'user': {
                return $this->_eventStream['generatedBy'];
                break;
            }
            case 'timestamp': {
                return $this->_eventStream['timestamp'];
                break;
            }
            case 'language': {
                return $this->_eventStream['language'];
                break;
            }
            default : {
                throw new Exception(1000);
            }
        }
    }

    public function getContent() {
        $output = $this->_eventStream;
        $output['data'] = json_decode((string) $this->_eventStream['data'], true);
        return json_encode($output);
    }

    public function dispatch() {
        new $this->_dispatcher($this);
        return $this;
    }

    public function setDispatcher($dispatcherName) {
        $this->_dispatcher = $dispatcherName;
    }

    public function __toString() {
        return $this->getContent();
    }
}
