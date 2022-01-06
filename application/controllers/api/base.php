<?php
require_once APPPATH . '/libraries/api_controller.php';
require_once APPPATH . '/libraries/storage.php';

use service\Network\Request;
use service\Network\Response;
use service\AccessControl\APIAuth;

class Base extends API_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->load->library('session');
        $this->load->library('service');

        APIAuth::auth([APIAuth::AUTH_TYPE_WEB_USER]);
    }

    public function _remap($method, $args)
    {
        // get controller name
        $subcate = $this->uri->segment(3);
        $method = strtolower(Request::parse()->method);
        $controllerBaseName = $subcate ? $subcate : 'index';
        $controllerName = $controllerBaseName . '_' . $method;

        // check exsit and excute
        if (method_exists($this, $controllerName)) {
            return call_user_func_array(array($this, $controllerName), $args);
        }

        Response::reject(0x0105);
    }
}
