<?php

require_once APPPATH . '/libraries/Captcha.php';
require_once APPPATH . '/controllers/base.php';

class Captcha extends Base
{
    public function __construct()
    {
        parent::__construct();
    }

    public function view()
    {
        $text = $this->_generateText();

        session_start();
        $_SESSION['captcha'] = $text;

        $captcha = Image_Captcha::getInstance();
        $captcha->width = 150;
        $captcha->height= 50;
        $captcha->createImage($text);
    }

    protected function _generateText($length = 6)
    {
        $chars = 'abcdefghjkmnopqrstuvwxyzABCDEFGHJKMNOPQRSTUVWXYZ';
        $password = '';

        for ( $i = 0; $i < $length; $i++ )  {
            $password .= $chars[mt_rand(0, strlen($chars) - 1)];
        }

        return $password;
    }

}
