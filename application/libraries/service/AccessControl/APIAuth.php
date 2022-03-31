<?php

namespace service\AccessControl;

use service\Network\Request;
use service\Network\Response;

class APIAuth
{
    const AUTH_TYPE_WEB_USER = 'web_user';
    const AUTH_TYPE_ADMIN_WEB_USER = 'web_admin_user';
    const AUTH_TYPE_GATEWAY = 'internal_gateway';
    private static $CI;

    static function auth(array $authTypes)
    {
        if (in_array(self::AUTH_TYPE_GATEWAY, $authTypes)) {
            if ((string) Request::parse()->token === YAML_GATEWAY_TOKEN) {
                Request::setAuthData([]);
                return TRUE;
            }
        }

        if (in_array(self::AUTH_TYPE_WEB_USER, $authTypes)) {
            self::$CI = &get_instance();
            $userData = self::$CI->session->userdata;
            $uKey = $userData['userInfo']['u_key'];

            if ($uKey) {
                self::$CI->load->model('User_model', 'userModel');
                $userInfo = self::$CI->userModel->get($uKey);

                if ($userInfo) {
                    Request::setAuthData(['userData' => $userInfo]);
                    return TRUE;
                }
            }
        }

        if (in_array(self::AUTH_TYPE_ADMIN_WEB_USER, $authTypes)) {
            $userInfo = Request::parse()->authData['userData'];
            if ($userInfo['u_admin']) {
                return TRUE;
            }
        }

        Response::reject(0x0101);
    }
}
