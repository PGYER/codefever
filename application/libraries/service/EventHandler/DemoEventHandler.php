<?php

namespace service\EventHandler;

use service\Event\Event;

class DemoEventHandler extends EventHandler {

    public function onCreated (Event $event) {
        // demo code
        // $query = $this->CI->db->get('users');
        // var_dump($query->row_array());
        // var_dump($event);
        // echo $event;
    }

}
