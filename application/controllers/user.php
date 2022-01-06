<?php

require_once APPPATH . '/controllers/base.php';
require_once APPPATH . '/libraries/Captcha.php';

use service\Utility\UUID;
use service\Utility\Helper;
use service\Utility\TOTP;
use service\MessageService\Email\EmailSender;
use service\Utility\GoogleAuthenticator;

class User extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model', 'userModel');
    }

    public function login()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $email = trim($this->input->post('email'));

            if (!$email) {
                return $this->_ajax_message(1, lang('user_form_email_tel'));
            }

            $password = $this->input->post('password');
            if (!$password && $email) {
                return $this->_ajax_message(2, lang('user_form_password'));
            }

            if(preg_match('/^\S+@\S+\.\S+$/', $email)) {
                $result = $this->userModel->getInfoByEmail($email);
            } else {
                $result = $this->userModel->getInfoByTel($email);
            }

            if (!$result) {
                return $this->_ajax_message(3, lang('user_js_account_not_exist'));
            }

            // check email password to login
            $userInfo = $this->userModel->getInfoByPwd($email, $password);

            if (!$userInfo || !$userInfo['u_key']) {
                return $this->_ajax_message(4, lang('user_js_login_fail'));
            }

            // 2fa
            if ($userInfo['u_2fa']) {
                $key = UUID::getKey();
                $this->session_set($key, $userInfo['u_key'], 600);
                return $this->_ajax_message(100, lang('user_js_login_fail'), ['key' => $key]);
            }

            // login success
            $this->session->set_userdata('userInfo', array('u_key' => $userInfo['u_key']));

            return $this->_ajax_message(0, lang('user_js_login_success'), ['redirect' => '/repositories']);
        } else {
            $data = array();

            $loggedInfo = $this->getLoggedUserInfo();
            if ($loggedInfo) {
                // had Login
                header("Location: /repositories");
                return TRUE;
            }

            $email = trim($this->input->get('email'));

            $data['email'] = $email;

            $this->config->load('countries_item', TRUE);
            $countries = $this->config->item('countries', 'countries_item');
            $data['countries'] = $countries;

            $this->load->view('newpage/user/login', $data);
        }
    }

    public function verify() {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $key = trim($this->input->post('key'));
            $code = trim($this->input->post('code'));

            $uKey = $this->session_get($key);
            if (!$uKey) {
                return $this->_ajax_message(100, lang('user_js_2fa_retrieval_link_expired'), ['redirect' => '/user/login']);
            }

            $userInfo = $this->userModel->get($uKey);
            if (!$userInfo) {
                return $this->_ajax_message(100, lang('user_js_2fa_retrieval_link_expired'), ['redirect' => '/user/login']);
            }

            if ($userInfo['u_2fa']) {
                $otpGenerator = new GoogleAuthenticator();
                if ($otpGenerator->verifyCode($userInfo['u_2fa'], $code, 5)) {
                     // login success
                    $this->session_delete($key);

                    $this->session->set_userdata('userInfo', array('u_key' => $userInfo['u_key']));
                    return $this->_ajax_message(0, lang('user_js_login_success'), ['redirect' => '/repositories']);
                }
            } else {
                return $this->_ajax_message(100, lang('user_js_2fa_retrieval_link_expired'), ['redirect' => '/user/login']);
            }
            return $this->_ajax_message(1, lang('user_js_2fa_verify_fail'));
        } else {
            $data = array();
            $key = trim($this->input->get('key'));

            if (!preg_match('/^[0-9a-f]{32}$/i', $key)) {
                $key = '';
            }

            $data['key'] = $key;

            if ($this->getLoggedUserInfo()) {
                header("Location: /repositories");
                return TRUE;
            }

            $this->load->view('newpage/user/verify', $data);
        }
    }

    public function register()
    {
        if (!YAML_ALLOWREGISTER) {
            header("Location: /user/login");
            return TRUE;
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $insertData = array();

            $email = trim($this->input->post('email'));
            if (!$email) {
                return $this->_ajax_message(1, lang('user_form_email_tel'));
            }

            if(preg_match('/^\S+@\S+\.\S+$/', $email)) {
                $result = $this->userModel->getInfoByEmail($email);
                $insertData['u_email'] = $email;
            } else if (preg_match('/^[0-9]{5,11}$/', $email)) {
                $result = $this->userModel->getInfoByTel($email);
                $insertData['u_tel'] = $email;
            } else {
                return $this->_ajax_message(2, lang('user_form_email_error'));
            }

            if ($result) {
                return $this->_ajax_message(3, lang('user_js_email_had_exist'));
            }

            $password = trim($this->input->post('password'));

            if (!$password) {
                return $this->_ajax_message(4, lang('user_form_password'));
            }

            $insertData['u_key'] = UUID::getKey();
            $insertData['u_password'] = md5(md5($password));
            $insertData['u_name'] = Helper::generateUserName($insertData['u_key']);

            $insertData['u_avatar'] = $this->userModel->createAvatar($email);

            // create
            $uKey = $this->userModel->addUser($insertData);

            if (!$uKey) {
                return $this->_ajax_message(5, lang('user_js_register_failed'));
            }

            // login success
            $this->session->set_userdata('userInfo', array('u_key' => $uKey));

            return $this->_ajax_message(0, lang('user_js_register_success'), ['redirect' => '/repositories']);
        } else {
            $data = array();

            $email = trim($this->input->get('email'));
            $data['email'] = $email;

            if ($this->getLoggedUserInfo()) {
                header("Location: /repositories");
                return TRUE;
            }

            $this->config->load('countries_item', TRUE);
            $countries = $this->config->item('countries', 'countries_item');
            $data['countries'] = $countries;

            $this->load->view('newpage/user/register', $data);
        }
    }

    public function resetPassword()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $mode = trim($this->input->post('mode'));

            if ($mode === 'reset') {
                $key = trim($this->input->post('key'));

                $uKey = $this->session_get($key);

                if (!$uKey) {
                    return $this->_ajax_message(100, lang('user_js_password_retrieval_link_expired'), ['redirect' => '/user/resetPassword']);
                }

                $userInfo = $this->userModel->get($uKey);
                if (!$userInfo) {
                    return $this->_ajax_message(100, lang('user_js_password_retrieval_link_expired'), ['redirect' => '/user/resetPassword']);
                }

                $password = $this->input->post('password');
                if (strlen($password) < 6) {
                    return $this->_ajax_message(7, lang('user_register_password_regex'));
                }

                $data = [
                    'u_password' => md5(md5($password))
                ];

                $result = $this->userModel->updateUser($uKey, $data);

                if ($result) {
                    $this->session_delete($key);

                    return $this->_ajax_message(0, lang('user_js_password_retrieval_success'), ['redirect' => '/user/login?email='.$userInfo['u_email']]);
                }
                return $this->_ajax_message(8, lang('user_js_password_retrieval_failed'));
            } else {
                $email = trim($this->input->post('email'));
                $emailCode = trim($this->input->post('emailCode'));

                if (!$email) {
                    return $this->_ajax_message(1, lang('user_form_email'));
                }

                if (!$emailCode) {
                    return $this->_ajax_message(1, lang('user_form_email_code'));
                }

                // check email unique
                $userInfo = $this->userModel->getInfoByEmail($email);

                if (!$userInfo) {
                    return $this->_ajax_message(4, lang('user_js_account_not_exist'));
                }

                $input = $email;
                $code = $emailCode;

                if (!TOTP::check($input, $code)) {
                    return $this->_ajax_message(8, lang('user_js_code_verfiy_error'));
                }
                $uKey = $userInfo['u_key'];
                $key = UUID::getKey();
                $this->session_set($key, $uKey, 600);

                return $this->_ajax_message(0, lang('user_js_login_success'), ['redirect' => '/user/resetPassword?mode=reset&key=' . $key]);
            }
        } else {
            $data = [];

            $mode = trim($this->input->get('mode'));
            $key = trim($this->input->get('key'));

            if (!preg_match('/^[0-9a-f]{32}$/i', $key)) {
                $key = '';
            }

            $data['key'] = $key;

            $this->config->load('countries_item', TRUE);
            $countries = $this->config->item('countries', 'countries_item');
            $data['countries'] = $countries;
            $data['mode'] = $mode;

            return $this->load->view('/newpage/user/reset_password', $data);
        }
    }

    public function getResetPasswordCode()
    {
        $email = trim($this->input->post('email'));
        
        if(!preg_match('/^\S+@\S+\.\S+$/', $email)) {
            return $this->_ajax_message(3, lang('user_js_email_error'));
        }

        // check email unique
        $userInfo = $this->userModel->getInfoByEmail($email);

        if (!$userInfo) {
            return $this->_ajax_message(4, lang('user_js_email_not_exist'));
        }

        EmailSender::send(
            $email,
            '修改密码',
            TOTP::generate($email)
        );
        return $this->_ajax_message();
    }

    public function logout()
    {
        $this->session->unset_userdata('userInfo');
        header('Location:/user/login');
    }

    protected function session_get(string $key) 
    {
        session_start();
        
        $info = json_decode($_SESSION[$key], true);
        if (!$info) {
            return false;
        }

        if (!$info['expires_in']
            || ($info['expires_in'] + $info['time'] > time())
        ) {
            return $info['value'];
        }

        $this->session_delete($key);

        return false;
    }  

    protected function session_set(string $key, string $value, int $expires) 
    {
        session_start();

        $_SESSION[$key] = json_encode([
            'value' => $value,
            'time' => time(),
            'expires_in' => $expires
        ]);

        return true;
    }

    protected function session_delete(string $key) 
    {
        session_start();

        unset($_SESSION[$key]);

        return true;
    }
}
