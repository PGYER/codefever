<?php

require_once APPPATH . '/controllers/api/base.php';

use service\Network\Request;
use service\Network\Response;
use service\Utility\Command;
use service\Utility\UUID;
use service\AccessControl\APIAuth;
use service\AccessControl\UserAccessController;

class Admin extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model', 'userModel');
        $this->load->model('Group_model', 'groupModel');
        $this->load->model('Repository_model', 'repositoryModel');

        APIAuth::auth([APIAuth::AUTH_TYPE_ADMIN_WEB_USER]);
    }

    public function userList_post()
    {
        $data = Request::parse()->parsed;
        $category = (int) $data['category'];
        $keyword = trim($data['keyword']);
        $sort = trim($data['sort']);
        $page = (int) $data['page'];
        $pagesize = (int) $data['pagesize'];

        $page = $page ? $page : 1;
        $pagesize = $pagesize ? $pagesize : 20;
        $sort = in_array($sort, ['name', 'email', 'created']) ? 'u_' . $sort : '';

        $count = $this->userModel->getUserList($category, $keyword, $sort, $page, $pagesize, TRUE);
        $userList = $this->userModel->getUserList($category, $keyword, $sort, $page, $pagesize, FALSE);
        $userList = $this->userModel->normalizeUserList($userList);

        Response::output([
            'count' => $count,
            'list' => $userList,
        ]);
    }

    public function updateUserStatus_post()
    {
        $data = Request::parse()->parsed;
        $uKey = trim($data['user']);
        $status = (int) $data['status'];

        if (!$uKey || !$status) {
            Response::reject(0x0201);
        }

        $result = $this->userModel->updateUser($uKey, ['u_status' => $status === COMMON_STATUS_NORMAL ? COMMON_STATUS_NORMAL : COMMON_STATUS_DELETE]);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function closeUserMFA_post()
    {
        $data = Request::parse()->parsed;
        $uKey = trim($data['user']);

        if (!$uKey) {
            Response::reject(0x0201);
        }

        $result = $this->userModel->updateUser($uKey, ['u_2fa' => NULL]);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function resetPassword_post()
    {
        $data = Request::parse()->parsed;
        $uKey = trim($data['user']);
        $password = trim($data['password']);

        if (!$uKey || !$password) {
            Response::reject(0x0201);
        }

        $result = $this->userModel->updateUser($uKey, ['u_password' => md5(md5($password))]);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function checkPassword_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $password = trim($data['password']);

        if (md5(md5($password)) != $userInfo['u_password']) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function setAdministrator_post()
    {
        $data = Request::parse()->parsed;
        $uKey = trim($data['user']);
        $admin = trim($data['admin']);

        if (!$uKey) {
            Response::reject(0x0201);
        }

        $result = $this->userModel->updateUser($uKey, ['u_admin' => $admin ? GLOBAL_TRUE : 0]);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function addUser_post()
    {
        $data = Request::parse()->parsed;
        $name = trim($data['name']);
        $email = trim($data['email']);

        if (!$name || !preg_match("/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/", $email)) {
            Response::reject(0x0201);
        }

        $user = $this->userModel->getInfoByEmail($email);
        if ($user) {
            Response::reject(0x0406);
        }

        $password = UUID::getKey();
        $result = $this->userModel->addUser([
            'u_key' => UUID::getKey(),
            'u_password' => md5(md5($password)),
            'u_name' => $name,
            'u_email' => $email,
            'u_avatar' => $this->userModel->createAvatar($email),
        ]);

        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output(['password' => $password]);
    }

    public function groupList_post()
    {
        $data = Request::parse()->parsed;
        $keyword = trim($data['keyword']);
        $sort = trim($data['sort']);
        $page = (int) $data['page'];
        $pagesize = (int) $data['pagesize'];

        $page = $page ? $page : 1;
        $pagesize = $pagesize ? $pagesize : 20;
        $sort = in_array($sort, ['name', 'created']) ? 'g_' . $sort : '';

        $count = $this->groupModel->getGroupList($keyword, $sort, $page, $pagesize, TRUE);
        $groupList = $this->groupModel->getGroupList($keyword, $sort, $page, $pagesize, FALSE);
        $groupList = $this->groupModel->normalize($groupList);

        Response::output([
            'count' => $count,
            'list' => $groupList,
        ]);
    }

    public function groupMembers_post()
    {
        $data = Request::parse()->parsed;
        $gKey = trim($data['group']);

        $members = $this->groupModel->getMembers($gKey);
        Response::output($members);
    }

    public function groupAddMember_post ()
    {
        $data = Request::parse()->parsed;
        $group = trim($data['group']);
        $email = trim($data['email']);

        if (!$group || !$email) {
            Response::reject(0x0201);
        }

        $memberInfo = $this->userModel->getInfoByEmail($email);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($group);
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0408);
        }

        $result = $this->groupModel->addMember($memberInfo['u_key'], $group);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function groupRemoveMember_post()
    {
        $data = Request::parse()->parsed;
        $group = trim($data['group']);
        $user = trim($data['user']);

        if (!$group || !$user) {
            Response::reject(0x0201);
        }

        $memberInfo = $this->userModel->get($user);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($group);
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->groupModel->removeMember($user, $group);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function setGroupOwner_post()
    {
        $data = Request::parse()->parsed;
        $group = trim($data['group']);
        $user = trim($data['user']);

        $memberInfo = $this->userModel->get($user);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($group);
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->groupModel->setMemberRole($user, $group, UserAccessController::ROLE_OWNER);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function repositoryList_post()
    {
        $data = Request::parse()->parsed;
        $keyword = trim($data['keyword']);
        $sort = trim($data['sort']);
        $page = (int) $data['page'];
        $pagesize = (int) $data['pagesize'];

        $page = $page ? $page : 1;
        $pagesize = $pagesize ? $pagesize : 20;
        $sort = in_array($sort, ['name', 'created']) ? 'r_' . $sort : '';

        $count = $this->repositoryModel->getRepositoryList($keyword, $sort, $page, $pagesize, TRUE);
        $repositoryList = $this->repositoryModel->getRepositoryList($keyword, $sort, $page, $pagesize, FALSE);
        $repositoryList = $this->repositoryModel->normalize($repositoryList);

        Response::output([
            'count' => $count,
            'list' => $repositoryList,
        ]);
    }

    public function repositoryMembers_post()
    {
        $data = Request::parse()->parsed;
        $rKey = trim($data['repository']);

        $members = $this->repositoryModel->getMembers($rKey);
        Response::output($members);
    }

    public function repositoryAddMember_post()
    {
        $data = Request::parse()->parsed;
        $repository = trim($data['repository']);
        $email = trim($data['email']);

        if (!$repository || !$email) {
            Response::reject(0x0201);
        }

        $memberInfo = $this->userModel->getInfoByEmail($email);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $repositoryInfo = $this->repositoryModel->get($repository);
        if ($repositoryInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0408);
        }

        $result = $this->repositoryModel->addMember($memberInfo['u_key'], $repository);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function repositoryRemoveMember_post()
    {
        $data = Request::parse()->parsed;
        $repository = trim($data['repository']);
        $user = trim($data['user']);

        if (!$repository || !$user) {
            Response::reject(0x0201);
        }

        $memberInfo = $this->userModel->get($user);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $repositoryInfo = $this->repositoryModel->get($repository);
        if ($repositoryInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->removeMember($user, $repository);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function systemStatus_get()
    {
        // get user and repository usage
        $usage = [];
        $this->db->where('u_status', COMMON_STATUS_NORMAL);
        $this->db->from('users');
        $usage['user'] = $this->db->count_all_results();

        $this->db->where('r_status', COMMON_STATUS_NORMAL);
        $this->db->from('repositories');
        $usage['repository'] = $this->db->count_all_results();

        $this->db->where('g_status', COMMON_STATUS_NORMAL);
        $this->db->from('groups');
        $usage['group'] = $this->db->count_all_results();
        // get vm usage
        $vm = [];

        $output = [];
        if (Command::run(['vmstat'], $output)) {
            foreach ($output as $line) {
                $matches = [];
                if (preg_match_all('/(\d+)/', $line, $matches)) {
                    $vm['cpu'] = 100 - $matches[0][14];
                    break;
                }
                continue;
            }
        }

        $output = [];
        if (Command::run(['free -m'], $output)) {
            foreach ($output as $line) {
                $matches = [];
                if (strpos($line, 'Mem:') === 0 && preg_match_all('/\s+(\d+)/', $line, $matches)) {
                    $vm['memory'] = 100 - ceil($matches[1][5] / $matches[1][0] * 100);
                    break;
                }
                continue;
            }
        }

        $output = [];
        if (Command::run(['df'], $output)) {
            foreach ($output as $line) {
                $matches = [];
                $vm['disk'] = [];
                if (strpos($line, '/dev') === 0 && preg_match_all('/\s+(\d+)/', $line, $matches)) {
                    $diskname = strtok($line, ' ');
                    array_push($vm['disk'], [
                        'name' => $diskname,
                        'usage' => (int) $matches[1][3]
                    ]);
                    break;
                }
                continue;
            }
        }

        // get service status
        $service = [
            'nginx' => FALSE,
            'php' => FALSE,
            'codefever' => FALSE,
            'crond' => FALSE,
            'sendmail' => FALSE
        ];

        $output = [];
        if (Command::run(['ps uax | grep "nginx: master process" | grep -v "grep" | wc -l'], $output)) {
            if ($output[0] > 0) {
                $service['nginx'] = TRUE;
            }
        }

        $output = [];
        if (Command::run(['ps uax | grep "php-fpm: master process" | grep -v "grep" | wc -l'], $output)) {
            if ($output[0] > 0) {
                $service['php'] = TRUE;
            }
        }

        $output = [];
        if (Command::run(['ps uax | grep "modify_authorized_keys_shell_running" | grep -v "grep" | wc -l'], $output)) {
            if ($output[0] > 1) {
                $service['codefever'] = TRUE;
            }
        }

        $output = [];
        if (Command::run(['ps uax | grep "crond" | grep -v "grep" | wc -l'], $output)) {
            if ($output[0] > 0) {
                $service['crond'] = TRUE;
            }
        }

        $output = [];
        if (Command::run(['ps uax | grep "sendmail" | grep -v "grep" | wc -l'], $output)) {
            if ($output[0] > 0) {
                $service['sendmail'] = TRUE;
            }
        }

        Response::output([
            'usage' => $usage,
            'vm' => $vm,
            'service' => $service
        ]);
    }

    public function config_get()
    {
        $config = yaml_parse_file(dirname(APPPATH) . '/config.yaml');
        Response::output($config);
    }

    public function config_post()
    {
        $config = yaml_parse_file(dirname(APPPATH) . '/config.yaml');
        $data = Request::parse()->parsed;
        $input = json_decode($data['data'], TRUE);
        $final = array_merge($config, $input);
        yaml_emit_file(dirname(APPPATH) . '/config.yaml', $final);
        Response::output($final);
    }
}
