<?php

require_once APPPATH . '/libraries/Avatars/MaterialDesign.Avatars.class.php';
require_once APPPATH . '/controllers/api/base.php';

use service\Network\Request;
use service\Network\Response;
use service\Utility\Helper;
use service\Utility\UUID;
use service\AccessControl\UserAccessController;
use service\Constant\MergeRequestStatus;

class Group extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Group_model', 'groupModel');
        $this->load->model('Repository_model', 'repositoryModel');
    }

    public function list_get ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $ownedGroup = $this->groupModel->list($userInfo['u_key']);
        $joinedGroup = $this->groupModel->listJoined($userInfo['u_key']);
        $groups = array_merge($ownedGroup, $joinedGroup);
        $groups = Helper::getUniqueItemList($groups, 'g_key');
        $list = $this->groupModel->normalize($groups);
        foreach ($list as &$item) {
            $item['role'] = $this->groupModel->getMemberRole($item['id'], $userInfo['u_key']);
            // get members in group
            $groupMembers = $this->groupModel->listMembers($item['id']);
            $groupMembers = $this->groupModel->normalizeMembers($groupMembers);
            $groupCreator = $this->groupModel->normalizeCreator($item['id']);
            $item['members'] = array_merge($groupMembers, [$groupCreator]);
            $item['members'] = Helper::getUniqueItemList($item['members'], 'id');
        }
        Response::output($list);
    }

    public function create_post ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        // check input
        if (!$data['displayName'] || !$data['name'] || !in_array($data['type'], [GROUP_TYPE_NORMAL, GROUP_TYPE_USER])) {
            Response::reject(0x0201);
        }

        // check duplicate
        $result = $this->groupModel->searchByName($data['name']);
        if ($result) {
            Response::reject(0x0403);
        }

        $result = $this->groupModel->searchByDisplayName($data['displayName']);
        if ($result) {
            Response::reject(0x0404);
        }

        // check perserve url
        $result = $this->groupModel->checkPreserve($data['name']);
        if ($result) {
            Response::reject(0x0403);
        }

        // create repository
        $result = $this->groupModel->create(
            $data['displayName'],
            $data['name'],
            $data['description'],
            (int) $data['type'],
            $userInfo['u_key']
        );

        if ($result) {
            $this->service->newEvent('GROUP_CREATE', [
                'gKey' => $result['g_key'],
                'name' => $result['g_display_name']
            ], $userInfo['u_key']);

            $createdData = $this->groupModel->get($result['g_key']);
            $createdData = $this->groupModel->normalize([$createdData])[0];
            Response::output($createdData);
        }

        return Response::reject(0x0405);
    }

    public function config_get ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $gKey = Request::parse()->query['gKey'];
        $uKey = $userInfo['u_key'];

        if (!$uKey || !$gKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestGroupPermission(
            $gKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $config = [];

        $config['group'] = $this->groupModel->get($gKey);
        $config['group'] = $this->groupModel->normalize([$config['group']])[0];

        $groupMembers = $this->groupModel->listMembers($config['group']['id']);
        $groupMembers = $this->groupModel->normalizeMembers($groupMembers);
        $groupCreator = $this->groupModel->normalizeCreator($config['group']['id']);

        $config['members'] = array_merge($groupMembers, [$groupCreator]);
        $config['members'] = Helper::getUniqueItemList($config['members'], 'id');

        $config['count'] = [
            'member' => count($config['members'])
        ];

        Response::output($config);
    }

    public function mergeRequests_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $gKey = $data['group'];
        $status = (int)$data['status'];
        $keyword = $data['keyword'];
        $sort = $data['sort'];
        $page = $data['page'];
        $pagesize = $data['pagesize'];

        if (!$gKey ||
            !in_array($sort, ['desc', 'asc']) ||
            ($status && !in_array($status, [MergeRequestStatus::OPEN, MergeRequestStatus::MERGED, MergeRequestStatus::CLOSED]))) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestGroupPermission(
            $gKey,
            $uKey,
            UserAccessController::UAC_MR_READ)) {
            Response::reject(0x0106);
        }

        $res = $this->groupModel->getMergeRequests($gKey, $status, $keyword, $sort, $page, $pagesize);
        if ($res === FALSE) {
            Response::reject(0x0201);
        }

        $res = $this->repositoryModel->normalizeMergeRequests($res);

        Response::output($res);
    }

    public function activities_get ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $gKey = Request::parse()->query['group'];
        $uKey = $userInfo['u_key'];
        $category = Request::parse()->query['category'];
        $keyword = Request::parse()->query['keyword'];

        $page = Request::parse()->query['page'];
        $pagesize = Request::parse()->query['pagesize'];

        if (!$gKey || ($category && !in_array($category, [ACTIVITY_CATEGORY_COMMIT, ACTIVITY_CATEGORY_MERGE_REQUEST, ACTIVITY_CATEGORY_MEMBER]))) {
            Response::reject(0x0201);
        }

        $activities = $this->groupModel->listActivities($gKey, $category, $keyword, $page, $pagesize);
        $activities = $this->groupModel->normalizeActivities($activities);

        Response::output($activities);
    }

    public function uploadAvatar_post ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $tmpName = $_FILES['avatar']['tmp_name'];
        $uKey = $userInfo['u_key'];

        if (!$data['group'] || !$tmpName) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_INFO
        )) {
            Response::reject(0x0106);
        }

        $key = UUID::getKey();
        $storage = Storage::factory('avatar');
        $path = $storage->getPathByFileName($key);
        $storage->moveUploadFile($tmpName, $path);

        $groupInfo = $this->groupModel->get($data['group']);
        $this->groupModel->update($data['group'], ['g_avatar' => $key]);

        $this->service->newEvent('GROUP_UPDATE_AVATAR', [
            'gKey' => $groupInfo['g_key'],
            'from' => $groupInfo['g_avatar'],
            'to' => $key
        ], $uKey);

        Response::output([]);
    }

    public function update_post ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['group'] || !$data['displayName']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_INFO
        )) {
            Response::reject(0x0106);
        }

        // check display name duplicate
        $groupInfo = $this->groupModel->get($data['group']);
        if ($groupInfo['g_display_name'] !== $data['displayName']) {
            $result = $this->groupModel->searchByDisplayName($data['displayName']);
            if ($result) {
                Response::reject(0x0404);
            }
        }

        $this->groupModel->update($data['group'], [
            'g_display_name' => $data['displayName'],
            'g_description' => $data['description']
        ]);

        if ($groupInfo['g_display_name'] !== $data['displayName']) {
            $this->service->newEvent('GROUP_UPDATE_NAME', [
                'gKey' => $groupInfo['g_key'],
                'from' => $groupInfo['g_display_name'],
                'to' => $data['displayName']
            ], $uKey);
        }

        if ($groupInfo['g_description'] !== $data['description']) {
            $this->service->newEvent('GROUP_UPDATE_DESCRIPTION', [
                'gKey' => $groupInfo['g_key']
            ], $uKey);
        }

        Response::output([]);
    }

    public function addMember_post ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['group'] || !$data['email']) {
            Response::reject(0x0201);
        }

        // check permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_MEMBER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->getInfoByEmail($data['email']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($data['group']);

        // can not add creator
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0408);
        }

        $result = $this->groupModel->addMember($memberInfo['u_key'], $data['group']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('GROUP_ADD_MEMBER', [
            'gKey' => $groupInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email']
        ], $uKey);

        Response::output([]);
    }

    public function changeMemberRole_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['group'] || !$data['userID'] || !in_array($data['roleID'], [
            UserAccessController::ROLE_GUEST,
            UserAccessController::ROLE_REPORTER,
            UserAccessController::ROLE_DEVELOPER,
            UserAccessController::ROLE_MAINTAINER,
            UserAccessController::ROLE_OWNER
        ])) {
            Response::reject(0x0201);
        }

        // check permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_MEMBER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->get($data['userID']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($data['group']);
        // no permision to change creator role
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->groupModel->setMemberRole($data['userID'], $data['group'], $data['roleID']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('GROUP_CHANGE_MEMBER_ROLE', [
            'gKey' => $groupInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email'],
            'to' => (int) $data['roleID']
        ], $uKey);

        Response::output([]);
    }

    public function removeMember_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['group'] || !$data['userID']) {
            Response::reject(0x0201);
        }

        // check permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_MEMBER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->get($data['userID']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($data['group']);
        // no permision to remove creator
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->groupModel->removeMember($data['userID'], $data['group']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('GROUP_REMOVE_MEMBER', [
            'gKey' => $groupInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email']
        ], $uKey);

        Response::output([]);
    }

    public function changeOwner_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['group'] || !$data['userID']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_OWNER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->get($data['userID']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $groupInfo = $this->groupModel->get($data['group']);
        // no permision set creator as a creator
        if ($groupInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        // can not change owner of personal group
        if ((int) $groupInfo['g_type'] === GROUP_TYPE_USER) {
            Response::reject(0x040B);
        }

        // set old owner as member
        $result = $this->groupModel->setMemberRole(
            $groupInfo['u_key'],
            $data['group'],
            UserAccessController::ROLE_OWNER
        );
        if (!$result) {
            Response::reject(0x0405);
        }

        // set new owner as owner
        $this->groupModel->update($data['group'], [
            'u_key' => $data['userID']
        ]);
        // remove new owner repository ownship
        $this->groupModel->removeMember($data['userID'], $data['group']);

        $this->service->newEvent('GROUP_CHANGE_OWNER', [
            'gKey' => $groupInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email']
        ], $uKey);

        Response::output([]);
    }

    public function updateName_post ()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        // check input 
        if (!$data['group'] || !$data['name']) {
            Response::reject(0x0201);
        }

        // check group permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CHANGE_URL
        )) {
            Response::reject(0x0106);
        }

        // check duplicate
        $groupInfo = $this->groupModel->get($data['group']);
        $result = $this->groupModel->searchByName($data['name']);
        if ($result) {
            Response::reject(0x0403);
        }

        // check preserved
        $result = $this->groupModel->checkPreserve($data['name']);
        if ($result) {
            Response::reject(0x0403);
        }

        $this->groupModel->update($data['group'], [
            'g_name' => $data['name']
        ]);

        $this->service->newEvent('GROUP_CHANGE_URL', [
            'gKey' => $groupInfo['g_key'],
            'from' => $groupInfo['g_name'],
            'to' => $data['name']
        ], $userInfo['u_key']);

        Response::output([]);
    }

    public function deleteGroup_post () {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['group']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_REMOVE
        )) {
            Response::reject(0x0106);
        }

        $groupInfo = $this->groupModel->get($data['group']);
        // can not delete user group
        if ((int) $groupInfo['g_type'] === GROUP_TYPE_USER) {
            Response::reject(0x0409);
        }

        // can not remove non-empty group
        $repositoryList = $this->repositoryModel->listInGroup($data['group']);
        if (count($repositoryList)) {
            Response::reject(0x040A);
        }

        $result = $this->groupModel->removeGroup($data['group']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('GROUP_REMOVE', [
            'gKey' => $groupInfo['g_key'],
            'name' => $groupInfo['g_display_name']
        ], $uKey);

        Response::output([]);
    }
}
