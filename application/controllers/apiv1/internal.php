<?php
require_once APPPATH . '/controllers/apiv1/base.php';

use service\AccessControl\APIAuth;
use service\AccessControl\UserAccessController;
use service\Network\Request;
use service\Network\Response;
use service\Utility\Helper;

class Internal extends Base
{
    private $_storagePath;

    public function __construct()
    {
        parent::__construct();
        $this->_storagePath = dirname(APPPATH) . '/git-storage';
        APIAuth::auth([APIAuth::AUTH_TYPE_GATEWAY]);
    }

    public function searchPublicKey_get() {
        $data = Request::parse()->parsed;
        if ($data && $data['fingerprint'] && $data['publicKey']) {
            $this->load->model('User_sshkey_model', 'userSshkeyModel');
            $uKey = $this->userSshkeyModel->searchAuthKey($data['publicKey']);
            if ($uKey && Helper::getSSHKeyType($data['publicKey'])) {
                Response::output([[
                    'userID' => $uKey,
                    'keyType' => Helper::getSSHKeyType($data['publicKey']),
                    'publicKey' => $data['publicKey']
                ]]);
            } else {
                Response::reject(0x0101);
            }
        }
        Response::reject(0x0201);
    }

    public function authSSH_get() {
        $data = Request::parse()->parsed;

        $parsedRepo = [];
        preg_match("/([\w\d\_]+)\/([\w\d\_]+)\.git/", $data['repo'], $parsedRepo);

        if ($data && $data['userID'] && $data['repo'] && $data['action'] && $parsedRepo[0] && $parsedRepo[1]) {

            // search group
            $this->load->model('Group_model', 'groupModel');
            $groupData = $this->groupModel->searchByName($parsedRepo[1]);

            if ($groupData && $groupData['g_key']) {

                // search repository
                $this->load->model('Repository_model', 'repositoryModel');
                $repositoryData = $this->repositoryModel->searchByName($parsedRepo[2], $groupData['g_key']);

                if ($repositoryData && $repositoryData['r_key']) {

                    // search member role in repository and group
                    $roleID = $this->service->getRepositoryRole($repositoryData['r_key'], $data['userID']);

                    if ($roleID) {
                        if (UserAccessController::checkRepositoryAction($roleID, $data['action'])) {
                            Response::output([
                                'uid' => implode('|', [$data['userID'], $repositoryData['r_key']]),
                                'path' => $this->_storagePath . $repositoryData['r_path'],
                            ]);
                        }
                    }
                    // member not found
                    Response::reject(0x0106);
                }
            }
            // group or repository not found
            Response::reject(0x0302);
        }
        Response::reject(0x0201);
    }

    public function authHTTP_get() {
        $data = Request::parse()->parsed;

        $parsedRepo = [];
        preg_match("/([\w\d\_]+)\/([\w\d\_]+)\.git/", $data['repo'], $parsedRepo);

        if ($data && $data['user'] && $data['pass'] && $data['repo'] && $parsedRepo[1] && $parsedRepo[2]) {
            // check email and password
            $this->load->model('user_model', 'userModel');
            $result = $this->userModel->getInfoByEmail($data['user']);
            if ($result && md5(md5($data['pass'])) == $result['u_password']) {
                $data['userID'] = $result['u_key'];

                // check group and repository
                // search group
                $this->load->model('Group_model', 'groupModel');
                $groupData = $this->groupModel->searchByName($parsedRepo[1]);

                if ($groupData && $groupData['g_key']) {

                    // search repository
                    $this->load->model('Repository_model', 'repositoryModel');
                    $repositoryData = $this->repositoryModel->searchByName($parsedRepo[2], $groupData['g_key']);

                    if ($repositoryData && $repositoryData['r_key']) {

                        // search member role in repository and group
                        $roleID = $this->service->getRepositoryRole($repositoryData['r_key'], $data['userID']);

                        if ($roleID) {
                            // auth action
                            if (UserAccessController::checkRepositoryAction($roleID, $data['action'])) {

                                $parsedEmail = explode('@', $result['u_email']);
                                if (!($parsedEmail && $parsedEmail[0] && $parsedEmail[1])) {
                                    $parsedEmail = [$data['userID'], 'pgyer_user'];
                                }

                                Response::output([
                                    'storage' => "http://127.0.0.1:27555",
                                    'uid' => implode('|', [$data['userID'], $repositoryData['r_key']]),
                                    'user' => $parsedEmail[0],
                                    'addr' => $parsedEmail[1],
                                    'path' => $this->_storagePath . $repositoryData['r_path']
                                ]);
                            }
                        }
                        // member not found
                        Response::reject(0x0106);
                    }
                }
                // group or repository not found
                Response::reject(0x0302);
            }
            // user not found
            Response::reject(0x0101);
        }
        Response::reject(0x0201);
    }

    public function hooks_post () {
        $data = Request::parse()->parsed;
        if (count($data['args']) > 0 && $data['uid']) {
            $uKey = explode('|', $data['uid'])[0];
            $rKey = explode('|', $data['uid'])[1];
            $hookName = array_pop(explode('/', $data['args'][0]));

            if ($uKey && $rKey && $hookName) {
                if ($hookName === 'post-receive') {
                    $pushData = explode("\n", $data['stdin']);
                    foreach ($pushData as $push) {
                        $pushInfo = explode(' ', $push);
                        if (count($pushInfo) === 3) {
                            $this->service->newEvent('HOOK_POST_RECEIVE', [
                                'rKey' => $rKey,
                                'name' => $pushInfo[2],
                                'from' => $pushInfo[0],
                                'to' => $pushInfo[1]
                            ], $uKey);
                        }
                    }
                } else if ($hookName === 'pre-receive') {
                    $pushData = explode("\n", $data['stdin']);
                    foreach ($pushData as $push) {
                        $pushInfo = explode(' ', $push);
                        if (count($pushInfo) === 3) {
                            $head = str_replace('refs/heads/', '', $pushInfo[2]);
                            if (strlen($head) > 0) {
                                $this->load->model('Repository_model', 'repositoryModel');
                                if ($this->repositoryModel->checkBranchProteced($rKey, $uKey, $head, FALSE)) {
                                    Response::reject(0x040F, NULL, ['remote' => "\n[CodeFever Community]: You are not allowed to push code to protected branch <$head> !"]);
                                }
                            }
                        }
                    }
                }

                Response::output(['remote' => '']);
            }
        }

        Response::reject(0x0201, NULL, ['remote' => '']);
    }
}
