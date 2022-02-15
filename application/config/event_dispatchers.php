<?php

namespace service\Event;

use service\Event\EventDispatcher;

class GeneralEventDispatcher extends EventDispatcher {

    protected $eventHandler = [
        '*' => [
            ['service\EventHandler\TestHandler@capture'],
            ['service\EventHandler\ActivityHandler@capture'],
            ['service\EventHandler\UserNotificationHandler@capture'],
            ['service\EventHandler\WebhookHandler@capture'],
        ]
    ];
}
