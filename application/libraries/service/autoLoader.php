<?php
// This file container service library auto load function
spl_autoload_register(function ($className) {
    $file = NULL;
    if(preg_match( '/^service\\\\Event\\\\GeneralEventDispatcher$/', $className)) {
        // load general event dispatcher
        $file = APPPATH . 'config/event_dispatchers.php';
    } else if (preg_match( '/^service\\\\AccessControl\\\\GeneralQuotaController$/', $className)) {
        // load general event dispatcher
        $file = APPPATH . 'config/quota_controller.php';
    } else if (preg_match( '/^service\\\\AccessControl\\\\UserAccessController$/', $className)) {
        // load general user access controler setting
        $file = APPPATH . 'config/access_controller.php';
    } else if (preg_match( '/^service\\\\EventHandler\\\\(\w+)$/', $className, $matches)) {
        // load event handler
        $file = APPPATH . 'event_handlers/'.$matches[1].'.php';
    } else if(preg_match( '/^service/', $className)) {
        // load library file
        $file = APPPATH . 'libraries/' . str_replace('\\', '/', $className);
        $file .= '.php';
    }

    if($file) {
        if (file_exists($file)) {
            include $file;
        } else {
            throw new service\Exception\Exception(1001);
        }
    } else {
        // not in scope, ignore.
    }

});
