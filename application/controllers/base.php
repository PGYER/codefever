<?php

require_once APPPATH . '/libraries/api_controller.php';

class Base extends API_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->library('session');
        $this->load->library('service');
        $this->load->helper('cookie');
        $this->load->vars([
            'userInfo' => $this->getLoggedUserInfo(),
            'currentUrl' => urlencode($this->_get_current_url(TRUE)),
        ]);
        $this->config->load('lang', TRUE);

        $this->_detectLang();
    }

    protected function _detectLang()
    {
        $userLang = $this->session->userdata('lang');
        $userLang = $userLang ? $userLang : 'zh-cn';
        $cnLangArr = $this->config->item('cn_langs', 'lang');
        $actualLang = in_array(strtolower($userLang), $cnLangArr) ? 'zh-cn' : 'english';

        $this->lang->load('base', $actualLang);
        $this->lang->load('home', $actualLang);
        $this->lang->load('service', $actualLang);
        $this->lang->load('user', $actualLang);

        $this->load->helper('language');
    }

    protected function getLoggedUserInfo()
    {
        $uKey = $this->session->userdata('userInfo')['u_key'];
        if (!$uKey) {
            return FALSE;
        }

        $this->load->model('User_model', 'userModel');
        $info = $this->userModel->get($uKey);

        if (!$info) {
            return FALSE;
        }

        return $info;
    }

    protected function getLoggedKey()
    {
        $info = $this->getLoggedUserInfo();

        if (!$info) {
            return FALSE;
        }

        return $info['u_key'];
    }

    protected function _get_current_url(bool $full = TRUE)
    {
        if (!$full) {
            return $_SERVER['REQUEST_URI'];
        }

        $actualHost = $_SERVER['HTTP_HOST'];

        $port = $_SERVER['SERVER_PORT'];
        $actualUrl = [
            isset($_SERVER['HTTPS']) ? 'https' : 'http',
            '://',
            $actualHost,
            ($port == 80 || $port == 443) ? '' : ":$port",
            $_SERVER['REQUEST_URI'],
        ];

        return implode('', $actualUrl);
    }

    protected function _error_message(string $message = '', string $redirectURL = '', string $redirectButtonTitle = '')
    {
        $data = array();
        $data['message'] = $message;
        $data['redirectURL'] = $redirectURL;
        $data['redirectButtonTitle'] = $redirectButtonTitle;
        return $this->load->view('base/error_message', $data);
    }

    protected function _success_message(string $message = '', string $redirectURL = '')
    {
        $data = array();
        $data['message'] = $message;
        $data['redirectURL'] = $redirectURL;
        return $this->load->view('base/success_message', $data);
    }

    protected function _ajax_message(int $code = 0, string $message = '', array $extra = array())
    {
        echo json_encode([
            'code' => $code,
            'message' => $message,
            'extra' => $extra
        ]);
    }
}
