<?php

require_once APPPATH . '/libraries/storage.php';
require_once APPPATH . '/controllers/api/base.php';

use service\Network\Request;
use service\Network\Response;
use service\Utility\Helper;
use service\Utility\UUID;
use service\Utility\TOTP;
use service\MessageService\Email\EmailSender;

use service\Utility\GoogleAuthenticator;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelLow;
use Endroid\QrCode\RoundBlockSizeMode\RoundBlockSizeModeMargin;

class User extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model', 'userModel');
        $this->load->model('User_sshkey_model', 'userSshkeyModel');
        $this->load->model('Notification_model', 'notificationModel');
    }

    public function info_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $userInfo = $this->userModel->normalize([$userInfo], TRUE);

        Response::output($userInfo[0]);
    }

    public function listKey_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $keys = $this->userSshkeyModel->list($userInfo['u_key']);
        $normalizedKeyList = $this->userSshkeyModel->normalize($keys);

        Response::output($normalizedKeyList);
    }

    public function addSSHKey_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        if (!$data['name'] || !$data['key']) {
            Response::reject(0x0201);
        }

        $keyType = Helper::getSSHKeyType($data['key']);
        $keyHash = Helper::getSSHKeyHash($data['key']);

        // check duplicate
        if ($this->userSshkeyModel->searchKeyHash($keyHash)) {
            Response::reject(0x040D);
        }

        // insert
        $result = $this->userSshkeyModel->add($userInfo['u_key'], $data['name'], $keyType, $keyHash, $data['key']);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function removeSSHKey_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        if (!$data['id']) {
            Response::reject(0x0201);
        }

        $sshKeyData = $this->userSshkeyModel->get($data['id']);
        if (!$sshKeyData || $sshKeyData['u_key'] !== $userInfo['u_key']) {
            Response::reject(0x0106);
        }

        // delete
        $result = $this->userSshkeyModel->delete($data['id']);
        if (!$result) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function getCountriesCode_post()
    {
        $data = array();
        $this->config->load('countries_item', TRUE);
        $countries = $this->config->item('countries', 'countries_item');
        $data['countries'] = $countries;

        return Response::output($data);
    }

    public function updateBasicInfo_post () {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        $name = $data['name'];
        $email = $data['email'];
        $team = $data['team'];
        $role = $data['role'];

        if (!$name || !$email) {
            Response::reject(0x0201);
        }

        $updateData = [];
        $updateData['u_name'] = $name;
        $updateData['u_email'] = $email;
        $updateData['u_team'] = $team;
        $updateData['u_role'] = $role;
        $updateData['u_updated'] = date("Y-m-d H:i:s");
        $this->db->where('u_key', $uKey);
        $this->db->update('users', $updateData);
        Response::output([]);
    }

    public function update_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];
        $field = $data['field'];
        $value = $data['data'];

        if (!$field || !$value) {
            Response::reject(0x0201);
        }

        $data = array();

        switch ($field) {
            case "name":
                if (!$value || mb_strlen($value) > 15) {
                    Response::reject(0x0201);
                }
                $data['u_name'] = $value;
                break;
            case "job":
                $data['u_job'] = $value;
                break;
            case "company":
                $data['u_company'] = $value;
                break;
            case "tel":
                $data['u_tel'] = $value;
                break;
            case "location":
                $data['u_location'] = $value;
                break;
        }

        // 是否发生改变
        if ($userInfo['u_' . $field] == $data['u_' . $field]) {
            Response::reject(0x0405);
        }

        if ($data) {
            $data['u_updated'] = date("Y-m-d H:i:s");
            $this->db->where('u_key', $uKey);
            $this->db->update('users', $data);
        }

        Response::output([]);
    }

    public function uploadAvatar_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $tmpName = $_FILES['avatar']['tmp_name'];
        $uKey = $userInfo['u_key'];

        if (!$tmpName) {
            Response::reject(0x0201);
        }

        $key = UUID::getKey();
        $storage = Storage::factory('avatar');
        $path = $storage->getPathByFileName($key);
        $storage->moveUploadFile($tmpName, $path);

        $data = array('u_avatar' => $key);
        $this->db->where('u_key', $uKey);
        $this->db->update('users', $data);

        Response::output([]);
    }

    public function updatePassword_post() {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        $oldPassword = $data['current'];
        $newPassword = $data['new'];

        if ($oldPassword && $newPassword) {
            if ($this->userModel->checkPassword($uKey, $oldPassword)) {
                $this->userModel->setPassword($uKey, $newPassword);
                Response::output([]);
            }
            Response::reject(0x0410);
        }
        Response::reject(0x0201);
    }

    public function getEmailCode_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $email = $data['email'];
        $password = $data['password'];

        if (!$email || !$password) {
            Response::reject(0x0201);
        }

        if ($userInfo['u_email'] == $email) {
            Response::reject(0x040D);
        }

        $result = $this->userModel->getInfoByEmail($email);
        if ($result) {
            Response::reject(0x0406);
        }

        $passwordCheckResult = $this->userModel->getInfoByPwd($userInfo['u_email'], $password);
        if (!$passwordCheckResult) {
            Response::reject(0x040C);
        }

        $code = TOTP::generate($email);

        EmailSender::send(
            $email,
            '验证新邮箱',
            $code
        );

        Response::output([]);
    }

    public function changeEmail_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $email = trim($data['email']);
        $code = trim($data['code']);
        $password = $data['password'];
        $uKey = $userInfo['u_key'];
        if (!$email || !$code || !$password) {
            Response::reject(0x0201);
        }
        if (!preg_match("/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/", $email)) {
            Response::reject(0x0201);
        }

        if (!TOTP::check($email, $code)) {
            Response::reject(0x040C);
        }

        $updateData = [
            'u_email' => $email
        ];
        $this->userModel->updateUser($uKey, $updateData);
        Response::output([]);
    }

    public function addCommitEmail_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];
        $email = $data['email'];

        if (!$email) {
            Response::reject(0x0201);
        }

        if (!preg_match('/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/', $email)) {
            Response::reject(0x0201);
        }

        if ($email == $userInfo['u_email'] || $this->userModel->isCommitEmailExists($uKey, $email)) {
            Response::reject(0x0201);
        }

        if (!$this->userModel->addCommitEmail($uKey, $email)) {
            Response::reject(0x0405);
        }

        $code = TOTP::generate($email);

        EmailSender::send(
            $email,
            '添加关联邮箱',
            $code
        );

        Response::output([]);
    }

    public function resentCommitEmailCode_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];
        $email = $data['email'];

        if (!$email) {
            Response::reject(0x0201);
        }

        if (!preg_match('/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/', $email)) {
            Response::reject(0x0201);
        }

        $code = TOTP::generate($email);

        EmailSender::send(
            $email,
            '添加关联邮箱',
            $code
        );

        Response::output([]);
    }

    public function deleteCommitEmail_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $ceKey = $data['id'];

        if (!$ceKey) {
            Response::reject(0x0201);
        }

        $data = [
            'ce_status' => COMMON_STATUS_DELETE,
            'ce_deleted' => date('Y-m-d H:i:s')
        ];

        if (!$this->userModel->updateCommitEmail($ceKey, $data)) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function validationCommitEmailCode_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $ceKey = $data['id'];
        $email = $data['email'];
        $code = $data['code'];

        if (!$ceKey || !$email || !$code) {
            Response::reject(0x0201);
        }

        if (!TOTP::check($email, $code)) {
            Response::reject(0x040C);
        }

        $data = [
            'ce_is_check' => GLOBAL_TRUE
        ];

        if (!$this->userModel->updateCommitEmail($ceKey, $data)) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function getMFAData_get()
    {
        $email = Request::parse()->authData['userData']['u_email'];
        $otpGenerator = new GoogleAuthenticator();
        $secret = $otpGenerator->createSecret();
        $authURL = 'otpauth://totp/Codefever-Community:' . $email . '?secret=' . $secret;

        $qrCode = QrCode::create($authURL)
            ->setEncoding(new Encoding('UTF-8'))
            ->setErrorCorrectionLevel(new ErrorCorrectionLevelLow())
            ->setSize(300)
            ->setMargin(10)
            ->setRoundBlockSizeMode(new RoundBlockSizeModeMargin())
            ->setForegroundColor(new Color(0, 0, 0))
            ->setBackgroundColor(new Color(255, 255, 255));

        $writer = new SvgWriter();
        $result = $writer->write($qrCode);

        Response::output([
            'image' => 'data:image/svg+xml;charset=utf-8;base64,' . base64_encode($result->getString()),
            'secret'=> $secret
        ]);
    }

    public function updateMFAData_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;

        $secret = $data['secret'];
        $code1 = $data['code1'];
        $code2 = $data['code2'];

        if ($secret && $code1 && $code2) {
            $otpGenerator = new GoogleAuthenticator();
            if ($otpGenerator->verifyCode($secret, $code1, 5)) {
                if ($otpGenerator->verifyCode($secret, $code2, 5)) {
                    $this->userModel->setMFASecret($uKey, $secret);
                    Response::output([]);
                }
                Response::reject(0x0412);
            }
            Response::reject(0x0411);
        }

        Response::reject(0x0201);
    }

    public function revokeMFAData_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $this->userModel->setMFASecret($uKey, '');
        Response::output([]);
    }

    public function notifications_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->query;
        $category = $requestData['category'];
        $page = $requestData['page'] ?: 1;

        if (!in_array($category,[
            NOTIFICATION_CATEGORY_ALL,
            NOTIFICATION_CATEGORY_UNREAD,
            NOTIFICATION_CATEGORY_SYSTEM,
            NOTIFICATION_CATEGORY_MENTION_ME
        ])) {
            Response::reject(0x0201);
        }

        $notifications = $this->notificationModel->listNotifications($uKey, $category, $page);
        $notifications = $this->notificationModel->normalizeNotifications($notifications);

        Response::output($notifications);
    }

    public function setNotificationRead_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $all = !!$requestData['all'];
        $nuKey = $requestData['id'];
        if (($all && $nuKey) || (!$all && !$nuKey)) {
            Response::reject(0x0201);
        }

        if (!$this->notificationModel->setRead($uKey, $all, $nuKey)) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function deleteNotification_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $all = !!$requestData['all'];
        $nuKey = $requestData['id'];
        if (($all && $nuKey) || (!$all && !$nuKey)) {
            Response::reject(0x0201);
        }

        if (!$this->notificationModel->deleteReaded($uKey, $all, $nuKey)) {
            Response::reject(0x0405);
        }

        Response::output([]);
    }

    public function userNotificationSetting_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $uKey = $userInfo['u_key'];
        $requestData = Request::parse()->parsed;
        $offset = $requestData['offset'];

        if (!in_array($offset, [
            NOTIFICATION_STATUS_MR,
            NOTIFICATION_STATUS_EMAIL
        ])) {
            Response::reject(0x0201);
        }

        $data = [
            'u_updated' => date('Y-m-d H:i:s'),
            'u_notification_status' => $userInfo['u_notification_status'] ^ (1 << ($offset - 1))
        ];

        $this->db->where('u_key', $uKey);
        $this->db->update('users', $data);

        Response::output([]);
    }

    public function notificationRefused_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];

        $notificationRefused = $this->notificationModel->listNotificationRefused($uKey);
        $notificationRefused = $this->notificationModel->normalizeNotificationsRefused($notificationRefused);

        Response::output($notificationRefused);
    }

    public function setGroupOrRepoNotification_post()
    {
        $this->load->model('Repository_model', 'repositoryModel');

        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $type = (int) $requestData['type'];
        $target = $requestData['target'];
        $open = !!$requestData['open'];

        if (!in_array($type, [
            NOTIFICATION_REFUSE_GROUP,
            NOTIFICATION_REFUSE_REPOSITORY
        ]) || !$target) {
            Response::reject(0x0201);
        }

        if ($open) {
            if (!$this->notificationModel->setGroupOrRepoReceive($uKey, $type, $target)) {
                Response::reject(0x0405);
            }
        } else {
            if (!$this->notificationModel->setGroupOrRepoRefused($uKey, $type, $target)) {
                Response::reject(0x0405);
            }
        }

        Response::output([]);
    }
}
