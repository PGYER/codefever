<?php

require_once APPPATH . '/controllers/base.php';

class Home extends Base
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        if (REQUEST_PROTOCOL != 'https' && ENVIRONMENT == 'production') {
            return header('Location: ' . YAML_HOST);
        }

        if ($this->getLoggedKey()) {
            return header('Location: /repositories');
        }

        return header('Location: /user/login');
    }
}
