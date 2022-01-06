<?php

require_once APPPATH . '/controllers/base.php';

class Lang extends Base
{
    public function __construct()
    {
        parent::__construct();
        session_start();
    }

    public function select()
    {
        $lang = $this->input->get('l');
        if (!$lang) {
            return $this->_error_message('参数错误');
        }

        if ($lang == 'cn') {
            $this->session->set_userdata('lang', LANG_CN);
        }
        else {
            $this->session->set_userdata('lang', LANG_EN);
        }

        return header('Location: /');
    }
}
