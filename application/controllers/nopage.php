<?php

require_once APPPATH . '/controllers/base.php';

class Nopage extends Base
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        header("HTTP/1.1 404 Not Found");
        $this->load->view('nopage/index');
    }
}
