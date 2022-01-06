<?php

require_once APPPATH . '/libraries/Avatars/MaterialDesign.Avatars.class.php';

use service\CacheData\Store;
use service\Utility\UUID;

class User_model extends CI_Model
{
    private $store = NULL;

    function __construct()
    {
        parent::__construct();
        $this->store = new Store();
    }

    public function normalize(array $list, bool $extra = FALSE)
    {
        $result = [];

        foreach ($list as $item) {
            array_push($result, [
                'id' => $item['u_key'],
                'icon' => $item['u_avatar'],
                'name' => $item['u_name'],
                'email' => $item['u_email'],
                'phoneCode' => $item['u_calling_code'],
                'phoneNumber' => $item['u_tel'],
                'team' => $item['u_team'],
                'role' => $item['u_role'],
                'notification' => (int) $item['u_notification_status'],
                'mfaEnabled' => $item['u_2fa'] ? TRUE : FALSE,
                'admin' => $item['u_admin'] ? TRUE : FALSE,
                'emails' => $this->getCommitEmails($item, !$extra),
                'unReadNotification' => $extra ? $this->notificationModel->unReadNotificationCount($item['u_key']) : 0,
                'status' => $item['u_status'] == COMMON_STATUS_NORMAL,
                'host' => YAML_HOST,
            ]);
        }
        return $result;
    }

    public function get(string $uKey)
    {
        if ($this->store->exsit($uKey)) {
            return $this->store->get($uKey);
        }

        $this->db->where('u_key', $uKey);
        $query = $this->db->get('users');
        $info = $query->row_array();

        if (!$info) {
            return FALSE;
        }

        $this->store->set($uKey, $info);
        return $info;
    }

    public function checkPassword (string $uKey, string $rawPassword) {
        $userInfo = $this->get($uKey);

        if ($userInfo && $userInfo['u_password'] === md5(md5($rawPassword))) {
            return TRUE;
        }

        return FALSE;
    }

    public function setPassword (string $uKey, string $rawPassword)
    {
        $userInfo = $this->get($uKey);

        if ($userInfo && $userInfo['u_key']) {
            $this->updateUser($uKey, [
                'u_password' => md5(md5($rawPassword))
            ]);

            return TRUE;
        }

        return FALSE;
    }

    public function setMFASecret (string $uKey, string $mfaSecret) {
        $userInfo = $this->get($uKey);

        if ($userInfo && $userInfo['u_key']) {
            $this->updateUser($uKey, [
                'u_2fa' => $mfaSecret
            ]);

            return TRUE;
        }

        return FALSE;
    }

    public function getInfoByEmail(string $email)
    {
        if (!$email) {
            return FALSE;
        }

        $this->db->where('u_email', $email);
        $this->db->limit(1);
        $query = $this->db->get('users');
        $info = $query->row_array();

        return $info;
    }

    public function getInfoByTel(string $tel, string $callingCode = NULL)
    {
        if (!$tel) {
            return FALSE;
        }

        $this->db->where('u_tel', $tel);
        $this->db->where('u_status !=', COMMON_STATUS_DELETE);
        $callingCode && $this->db->where('u_calling_code', $callingCode);
        $query = $this->db->get('users');
        $info = $query->row_array();

        return $info;
    }

    public function getInfoByPwd(string $field, string $password)
    {
        if (!$field || !$password) {
            return FALSE;
        }

        if (preg_match("/^[0-9a-f]{32}$/", $field)) {
            $this->db->where('u_key', $field);
        } else if (strpos($field, '@')) {
            $this->db->where('u_email', $field);
        } else {
            $this->db->where('u_tel', $field);
        }

        $this->db->where('u_password', md5(md5($password)));
        $this->db->where('u_status !=', COMMON_STATUS_DELETE);
        $query = $this->db->get('users');
        $info = $query->row_array();

        return $info;
    }

    public function getCommitEmails(array $userInfo, bool $isCheck = TRUE)
    {
        if (!$userInfo) {
            return FALSE;
        }

        $this->db->where('u_key', $userInfo['u_key']);
        $this->db->where('ce_status', COMMON_STATUS_NORMAL);
        $isCheck && $this->db->where('ce_is_check', GLOBAL_TRUE);
        $this->db->order_by('ce_created', 'DESC');
        $query = $this->db->get('commit_emails');
        $data = $query->result_array();

        array_unshift($data, [
            'ce_key' => '',
            'ce_email' => $userInfo['u_email'],
            'ce_is_check' => GLOBAL_TRUE
        ]);

        return $this->normalizeCommitEmails($data, $isCheck);
    }

    public function normalizeCommitEmails(array $list, bool $isCheck)
    {
        $result = [];

        foreach ($list as $item) {
            array_push($result, $isCheck ? $item['ce_email'] : [
                'id' => $item['ce_key'],
                'email' => $item['ce_email'],
                'isCheck' => ((int) $item['ce_is_check']) == GLOBAL_TRUE
            ]);
        }

        return $result;
    }

    public function isCommitEmailExists(string $uKey, string $email)
    {
        if (!$uKey || !$email) {
            return FALSE;
        }

        $this->db->where('u_key', $uKey);
        $this->db->where('ce_email', $email);
        $this->db->where('ce_status', COMMON_STATUS_NORMAL);
        $this->db->limit(1);
        $query = $this->db->get('commit_emails');
        $info = $query->row_array();

        return !!$info;
    }

    public function addCommitEmail(string $uKey, string $email)
    {
        if (!$uKey || !$email) {
            return FALSE;
        }

        $result = $this->db->insert('commit_emails', [
            'ce_key' => UUID::getKey(),
            'u_key' => $uKey,
            'ce_email' => $email
        ]);

        return $result;
    }

    public function updateCommitEmail(string $ceKey, array $data)
    {
        if (!$ceKey || !$data) {
            return FALSE;
        }

        $this->db->where('ce_key', $ceKey);
        $result = $this->db->update('commit_emails', $data);

        return $result;
    }

    public function createAvatar($char)
    {
        if (!$char) {
            return '';
        }

        $fileKey = UUID::getKey();
        $storage = Storage::factory('avatar');
        $path = $storage->getPathByFileName($fileKey);
        $path = dirname($path);
        $fileName = $fileKey;
        $dirFullPath = $storage->getAbsolutePath($path);
        $storage->createDirIfNotExists($dirFullPath);
        $fileFullPath = $dirFullPath . '/' . $fileName;
        $avatar = new MDAvtars($char, 512);
        $avatar->Save($fileFullPath, 256);
        $avatar->Free();

        return $fileKey;
    }

    public function addUser($data)
    {
        if (!$data) {
            return false;
        }

        $dateTime = date('Y-m-d H:i:s');

        $data['u_register_ip'] = $this->input->ip_address();
        $data['u_created'] = $dateTime;
        $data['u_updated'] = $dateTime;
        $result = $this->db->insert('users', $data);
        if (!$result) {
            return false;
        }

        return $data['u_key'];
    }

    public function updateUser(string $uKey, array $data)
    {
        if (!$uKey || !$data) {
            return FALSE;
        }

        $data['u_updated'] = date('Y-m-d H:i:s');
        $this->db->where('u_key', $uKey);
        $result = $this->db->update('users', $data);

        return $result;
    }

    public function normalizeUserList(array $list)
    {
        $final = [];
        $this->load->model('Repository_model', 'repositoryModel');

        foreach ($list as $item) {
            $project = $this->repositoryModel->listJoined($item['u_key']);
            $projectCount = $project ? count($project) : 0;

            array_push($final, [
                'id' => $item['u_key'],
                'email' => $item['u_email'],
                'name' => $item['u_name'],
                'avatar' => $item['u_avatar'],
                'mfaEnabled' => !!$item['u_2fa'],
                'created' => $item['u_created'],
                'status' => $item['u_status'] == COMMON_STATUS_NORMAL,
                'admin' => !!$item['u_admin'],
                'projects' => $projectCount,
            ]);
        }

        return $final;
    }

    public function getUserList(int $category, string $keyword, string $sort, int $page, int $pagesize, bool $count)
    {
        $this->db->from('users');
        $category == ADMIN_USER_CATEGORY_MFAENABLED && $this->db->where('u_2fa !=', '');
        $category == ADMIN_USER_CATEGORY_MFADISABLED && $this->db->where('u_2fa IS NULL');
        $category == ADMIN_USER_CATEGORY_STATUSDELETE && $this->db->where('u_status', COMMON_STATUS_DELETE);

        if ($keyword) {
            $keyword = $this->db->escape_like_str($keyword);
            $this->db->where("(u_name like '%{$keyword}%' OR u_email like '%{$keyword}%')");
        }

        if ($count) {
            return $this->db->count_all_results();
        }

        $sort && $this->db->order_by($sort, 'DESC');
        $this->db->limit($pagesize, ($page - 1) * $pagesize);
        $query = $this->db->get();
        $userList = $query->result_array();

        return $userList;
    }
}
