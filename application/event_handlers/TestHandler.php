<?php

namespace service\EventHandler;

use service\Event\Event;

class TestHandler extends EventHandler
{

    protected $ListenedEventList = [];

    function capture(Event $event)
    {
        // filter event type
        $eventType = $event->type;
        if(in_array($eventType, $this->ListenedEventList)) {
            $this->_processEvnet($event);
        } else {
            return true;
        }
    }

    private function _processEvnet(Event $event)
    {
        // get event type
        $eventType = $event->type;
    }
}
