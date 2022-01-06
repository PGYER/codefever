<?php

namespace service\Utility;

use service\Event\EventData;
use service\Exception\Exception;

class DataConstructor {

    public static function Event($eventType, EventData $eventData = NULL, $generatedBy) {
        if($eventType && $generatedBy) {
            return [
                'eventType' => $eventType,
                'eventData' => $eventData,
                'generatedBy' => $generatedBy,
            ];
        } else {
            throw new Exception(1002);
        }
    }

    public static function UpdateEventData($affectedKey, $changedField, $oldValue, $newValue, $content = []) {
        if(is_null($affectedKey) || is_null($changedField) || is_null($newValue)) {
            throw new Exception(1002);
        } else {
            return [
                'affected' => $affectedKey,
                'field' => $changedField,
                'old' => $oldValue,
                'new' => $newValue,
                'content' => $content,
            ];
        }
    }

    public static function CreateEventData($affectedKey, $content) {
        if(is_null($affectedKey) && is_null($content)) {
            throw new Exception(1002);
        } else {
            return [
                'affected' => $affectedKey,
                'content' => $content,
            ];
        }
    }

    public static function DeleteEventData($affectedKey, $content = []) {
        if(is_null($affectedKey)) {
            throw new Exception(1002);
        } else {
            return [
                'affected' => $affectedKey,
                'content' => $content,
            ];
        }
    }
}
