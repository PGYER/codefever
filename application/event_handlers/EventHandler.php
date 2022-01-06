<?php
namespace service\EventHandler;

use service\Event\Event;

abstract class EventHandler
{
    protected $CI;

    public function __construct(Event $event = NULL) {

        if ($event) {
            $eventTypes = explode(':', $event->eventType);
            if(isset($eventTypes[1])) {
                $instruction = 'on' . ucfirst($eventTypes[1]);
                $this->$instruction($event);
            }
        }

        $this->CI =& get_instance();
    }

    public function __call($name, $args)
    {
        // do nothing
    }
}
