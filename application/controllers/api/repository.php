<?php
require_once APPPATH . '/libraries/Avatars/MaterialDesign.Avatars.class.php';
require_once APPPATH . '/libraries/storage.php';
require_once APPPATH . '/controllers/api/base.php';

use service\Network\Request;
use service\Network\Response;
use service\Utility\Helper;
use service\AccessControl\UserAccessController;
use service\Utility\UUID;
use service\Constant\MergeRequestStatus;

class Repository extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Repository_model', 'repositoryModel');
        $this->load->model('Group_model', 'groupModel');
    }

    public function create_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        // check input
        if (!$data['displayName'] || !$data['group'] || !$data['name']) {
            Response::reject(0x0201);
        }

        // check group permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CREATE_REPO
        )) {
            Response::reject(0x0106);
        }

        // check duplicate
        $result = $this->repositoryModel->searchByName($data['name'], $data['group']);
        if ($result) {
            Response::reject(0x0401);
        }

        $result = $this->repositoryModel->searchByDisplayName($data['displayName'], $data['group']);
        if ($result) {
            Response::reject(0x0402);
        }

        // create repository
        $result = $this->repositoryModel->create(
            $data['displayName'],
            $data['name'],
            $data['description'],
            $data['group'],
            $userInfo['u_key']
        );

        if ($result) {
            $groupInfo = $this->groupModel->get($result['g_key']);

            $this->service->newEvent('REPO_CREATE', [
                'rKey' => $result['r_key'],
                'gKey' => $result['g_key'],
                'name' => $groupInfo['g_display_name'] . '/' . $result['r_display_name']
            ], $userInfo['u_key']);

            $createdData = $this->repositoryModel->get($result['r_key']);
            $createdData = $this->repositoryModel->normalize([$createdData])[0];
            Response::output($createdData);
        }

        return Response::reject(0x0405);
    }

    public function fork_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        // check input
        if (!$data['displayName'] || !$data['group'] || !$data['name'] || !$data['forkID']) {
            Response::reject(0x0201);
        }

        // check source reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['forkID'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        // check group permission
        if (!$this->service->requestGroupPermission(
            $data['group'],
            $userInfo['u_key'],
            UserAccessController::UAC_GROUP_CREATE_REPO
        )) {
            Response::reject(0x0106);
        }

        // check duplicate
        $result = $this->repositoryModel->searchByName($data['name'], $data['group']);
        if ($result) {
            Response::reject(0x0401);
        }

        $result = $this->repositoryModel->searchByDisplayName($data['displayName'], $data['group']);
        if ($result) {
            Response::reject(0x0402);
        }

        // create repository
        $result = $this->repositoryModel->fork(
            $data['displayName'],
            $data['name'],
            $data['description'],
            $data['group'],
            $userInfo['u_key'],
            $data['forkID']
        );

        if ($result) {
            $sourceRepoInfo = $this->repositoryModel->get($result['r_fork_r_key']);
            $sourceGroupInfo = $this->groupModel->get($sourceRepoInfo['g_key']);

            $targetGroupInfo = $this->groupModel->get($result['g_key']);

            $this->service->newEvent('REPO_FORK', [
                'rKey' => $result['r_key'],
                'gKey' => $result['g_key'],
                'forkFrom' => $result['r_fork_r_key'],
                'name' => $targetGroupInfo['g_display_name'] . '/' . $result['r_display_name'],
                'sourceName' => $sourceGroupInfo['g_display_name'] . '/' . $sourceRepoInfo['r_display_name']
            ], $userInfo['u_key']);

            $createdData = $this->repositoryModel->get($result['r_key']);
            $createdData = $this->repositoryModel->normalize([$createdData])[0];
            Response::output($createdData);
        }

        return Response::reject(0x0405);
    }

    public function list_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $list = $this->repositoryModel->listJoined($userInfo['u_key']);
        $list = $this->repositoryModel->normalize($list);

        foreach ($list as &$item) {
            $item['role'] = $this->repositoryModel->getMemberRole($item['id'], $userInfo['u_key']);
            $item['members'] = $this->repositoryModel->getMembers($item['id']);
        }

        Response::output($list);
    }

    public function config_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $rKey = Request::parse()->query['rKey'];
        $uKey = $userInfo['u_key'];

        if (!$uKey || !$rKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $config = [];
        $config['repository'] = $this->repositoryModel->get($rKey);
        $config['repository'] = $this->repositoryModel->normalize([$config['repository']])[0];

        $config['group'] = $this->groupModel->get($config['repository']['group']['id']);
        $config['group'] = $this->groupModel->normalize([$config['group']])[0];

        $config['members'] = $this->repositoryModel->getMembers($rKey);

        $config['branches'] = $this->repositoryModel->getBranchList($rKey, $uKey);
        $config['branches'] = $this->repositoryModel->normalizeBranches($config['branches']);

        $config['tags'] = $this->repositoryModel->getTagList($rKey, $uKey);
        $config['tags'] = $this->repositoryModel->normalizeTags($config['tags']);

        $countObjects = $this->repositoryModel->getObjectsCount($rKey, $uKey);

        $config['count'] = [
            'commit' => (int) $this->repositoryModel->getCommitCount($rKey, $uKey, $config['repository']['defaultBranch'] ?: ($config['branches'] ? $config['branches'][0]['name'] : '')),
            'branch' => count($config['branches']),
            'tag' => count($config['tags']),
            'file' => ((int) $countObjects['size'] + (int) $countObjects['size-pack'] + (int) $countObjects['size-garbage']) * 1024,
            'mergeRequest' => $this->repositoryModel->countMergeRequests($rKey),
        ];

        Response::output($config);
    }

    public function activities_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $rKey = Request::parse()->query['repository'];
        $category = Request::parse()->query['category'];
        $keyword = Request::parse()->query['keyword'];
        $uKey = $userInfo['u_key'];

        $page = Request::parse()->query['page'];
        $pagesize = Request::parse()->query['pagesize'];

        $mrKey = Request::parse()->query['mergeRequest'];

        if (!$rKey || ($category && !in_array($category, [ACTIVITY_CATEGORY_COMMIT, ACTIVITY_CATEGORY_MERGE_REQUEST, ACTIVITY_CATEGORY_MEMBER]))) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        if ($mrKey) {
            $activities = $this->repositoryModel->listMergeRequestActivities($rKey, $mrKey);
        } else {
            $activities = $this->repositoryModel->listActivities($rKey, $category, $keyword, $page, $pagesize);
        }
        $activities = $this->repositoryModel->normalizeActivities($activities);

        Response::output($activities);
    }

    public function uploadAvatar_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $tmpName = $_FILES['avatar']['tmp_name'];
        $uKey = $userInfo['u_key'];

        if (!$data['repository'] || !$tmpName) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_INFO
        )) {
            Response::reject(0x0106);
        }

        $key = UUID::getKey();
        $storage = Storage::factory('avatar');
        $path = $storage->getPathByFileName($key);
        $storage->moveUploadFile($tmpName, $path);

        $this->repositoryModel->update($data['repository'], ['r_avatar' => $key]);
        $repositoryInfo = $this->repositoryModel->get($data['repository']);

        $this->service->newEvent('REPO_UPDATE_AVATAR', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
            'from' => $repositoryInfo['r_avatar'],
            'to' => $key
        ], $uKey);

        Response::output([]);
    }

    public function update_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['repository'] || !$data['displayName']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_INFO
        )) {
            Response::reject(0x0106);
        }

        // check display name duplicate
        $repositoryInfo = $this->repositoryModel->get($data['repository']);
        if ($repositoryInfo['r_display_name'] !== $data['displayName']) {
            $result = $this->repositoryModel->searchByDisplayName($data['displayName'], $repositoryInfo['g_key']);
            if ($result) {
                Response::reject(0x0402);
            }
        }

        $this->repositoryModel->update($data['repository'], [
            'r_display_name' => $data['displayName'],
            'r_description' => $data['description']
        ]);

        if ($repositoryInfo['r_display_name'] !== $data['displayName']) {
            $this->service->newEvent('REPO_UPDATE_NAME', [
                'rKey' => $repositoryInfo['r_key'],
                'gKey' => $repositoryInfo['g_key'],
                'from' => $repositoryInfo['r_display_name'],
                'to' => $data['displayName']
            ], $uKey);
        }

        if ($repositoryInfo['r_description'] !== $data['description']) {
            $this->service->newEvent('REPO_UPDATE_DESCRIPTION', [
                'rKey' => $repositoryInfo['r_key'],
                'gKey' => $repositoryInfo['g_key']
            ], $uKey);
        }

        Response::output([]);
    }

    public function updateName_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;

        // check input 
        if (!$data['repository'] || !$data['name']) {
            Response::reject(0x0201);
        }

        // check group permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_URL
        )) {
            Response::reject(0x0106);
        }

        // check duplicate
        $repositoryInfo = $this->repositoryModel->get($data['repository']);
        $result = $this->repositoryModel->searchByName($data['name'], $repositoryInfo['g_key']);
        if ($result) {
            Response::reject(0x0401);
        }

        $this->repositoryModel->update($data['repository'], [
            'r_name' => $data['name']
        ]);

        $groupInfo = $this->groupModel->get($repositoryInfo['g_key']);

        $this->service->newEvent('REPO_CHANGE_URL', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
            'from' => $groupInfo['g_name'] . '/' . $repositoryInfo['r_name'],
            'to' => $groupInfo['g_name'] . '/' . $data['name']
        ], $userInfo['u_key']);

        Response::output([]);
    }

    public function addMember_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['repository'] || !$data['email']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_MEMBER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->getInfoByEmail($data['email']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        // check user already in repository
        $repositoryInfo = $this->repositoryModel->get($data['repository']);

        // can not add creator
        if ($repositoryInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0408);
        }

        $result = $this->repositoryModel->addMember($memberInfo['u_key'], $data['repository']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('REPO_ADD_MEMBER', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
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

        if (!$data['repository'] || !$data['userID'] || !in_array($data['roleID'], [
            UserAccessController::ROLE_GUEST,
            UserAccessController::ROLE_REPORTER,
            UserAccessController::ROLE_DEVELOPER,
            UserAccessController::ROLE_MAINTAINER,
            UserAccessController::ROLE_OWNER
        ])) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_MEMBER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->get($data['userID']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $repositoryInfo = $this->repositoryModel->get($data['repository']);
        // no permision to change creator role
        if ($repositoryInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->setMemberRole($data['userID'], $data['repository'], $data['roleID']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('REPO_CHANGE_MEMBER_ROLE', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email'],
            'to' => (int) $data['roleID']
        ], $uKey);

        Response::output([]);
    }

    public function changeOwner_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['repository'] || !$data['userID']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_OWNER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->get($data['userID']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $repositoryInfo = $this->repositoryModel->get($data['repository']);
        // no permision to change creator role
        if ($repositoryInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        // set old owner as repository menber
        $result = $this->repositoryModel->setMemberRole(
            $repositoryInfo['u_key'],
            $data['repository'],
            UserAccessController::ROLE_OWNER
        );
        if (!$result) {
            Response::reject(0x0405);
        }

        // set new owner as owner
        $this->repositoryModel->update($data['repository'], [
            'u_key' => $data['userID']
        ]);
        // remove new owner repository ownship
        $this->repositoryModel->removeMember($data['userID'], $data['repository']);

        $this->service->newEvent('REPO_CHANGE_OWNER', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email']
        ], $uKey);

        Response::output([]);
    }

    public function removeMember_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['repository'] || !$data['userID']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_CHANGE_MEMBER
        )) {
            Response::reject(0x0106);
        }

        // check user data
        $memberInfo = $this->userModel->get($data['userID']);
        if (!$memberInfo) {
            Response::reject(0x0407);
        }

        $repositoryInfo = $this->repositoryModel->get($data['repository']);
        // no permision to remove creator
        if ($repositoryInfo['u_key'] === $memberInfo['u_key']) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->removeMember($data['userID'], $data['repository']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('REPO_REMOVE_MEMBER', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
            'uid' => $memberInfo['u_key'],
            'name' => $memberInfo['u_name'],
            'email' => $memberInfo['u_email']
        ], $uKey);

        Response::output([]);
    }

    public function deleteRepository_post()
    {
        $userInfo = Request::parse()->authData['userData'];
        $data = Request::parse()->parsed;
        $uKey = $userInfo['u_key'];

        if (!$data['repository']) {
            Response::reject(0x0201);
        }

        // check reposiroty permission
        if (!$this->service->requestRepositoryPermission(
            $data['repository'],
            $userInfo['u_key'],
            UserAccessController::UAC_REPO_REMOVE
        )) {
            Response::reject(0x0106);
        }

        $repositoryInfo = $this->repositoryModel->get($data['repository']);
        $groupInfo = $this->groupModel->get($repositoryInfo['g_key']);

        $result = $this->repositoryModel->removeRepository($data['repository']);
        if (!$result) {
            Response::reject(0x0405);
        }

        $this->service->newEvent('REPO_REMOVE', [
            'rKey' => $repositoryInfo['r_key'],
            'gKey' => $repositoryInfo['g_key'],
            'name' => $groupInfo['g_display_name'] . '/' . $repositoryInfo['r_display_name']
        ], $uKey);

        Response::output([]);
    }

    public function defaultBranch_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $rKey = $requestData['repository'];
        $old = $requestData['old'] ?: '';
        $branch = $requestData['branch'];

        if (!$branch || $old === $branch) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_DEFAULT_BRANCH_CHANGE
        )) {
            Response::reject(0x0106);
        }

        if (!$this->repositoryModel->update($rKey, ['r_default_branch_name' => $branch])) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('DEFAULT_BRANCH_CHANGE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'from' => $old,
            'to' => $branch
        ], $uKey);

        Response::output([]);
    }

    public function protectedBranchRules_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->query;
        $rKey = $requestData['repository'];

        if (!$rKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $rules = $this->repositoryModel->listProtectedBranchRules($rKey);
        if ($rules === FALSE) {
            Response::reject(0x0201);
        }

        $rules = $this->repositoryModel->normalizeProtectedBranchRules($rules);
        Response::output($rules);
    }

    public function createProtectedBranchRule_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $rKey = $requestData['repository'];
        $rule = $requestData['rule'];
        $rolePush = (int) $requestData['rolePush'];
        $roleMerge = (int) $requestData['roleMerge'];

        if (!$rKey || !$rule || !$rolePush || !$roleMerge) {
            Response::reject(0x0201);
        }

        if (!in_array($rolePush, [
            UserAccessController::ROLE_NO_BODY,
            UserAccessController::ROLE_OWNER,
            UserAccessController::ROLE_MAINTAINER,
            UserAccessController::ROLE_DEVELOPER
        ]) || !in_array($roleMerge, [
            UserAccessController::ROLE_NO_BODY,
            UserAccessController::ROLE_OWNER,
            UserAccessController::ROLE_MAINTAINER
        ])) {
            Response::reject(0x0201);
        }

        if ($this->repositoryModel->getProtectedBranchRule($rKey, $rule)) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_PROTECTED_BRANCH_RULE_CREATE
        )) {
            Response::reject(0x0106);
        }

        if (!$this->repositoryModel->createProtectedBranchRule($rKey, $rule, $rolePush, $roleMerge)) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('PROTECTED_BRANCH_RULE_CREATE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $rule
        ], $uKey);

        Response::output([]);
    }

    public function updateProtectedBranchRule_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $rKey = $requestData['repository'];
        $pbrKey = $requestData['id'];
        $rule = $requestData['rule'];
        $rolePush = (int) $requestData['rolePush'];
        $roleMerge = (int) $requestData['roleMerge'];

        if (!$rKey || !$pbrKey || !$rule || !$rolePush || !$roleMerge) {
            Response::reject(0x0201);
        }

        if (!in_array($rolePush, [
            UserAccessController::ROLE_NO_BODY,
            UserAccessController::ROLE_OWNER,
            UserAccessController::ROLE_MAINTAINER,
            UserAccessController::ROLE_DEVELOPER
        ]) || !in_array($roleMerge, [
            UserAccessController::ROLE_NO_BODY,
            UserAccessController::ROLE_OWNER,
            UserAccessController::ROLE_MAINTAINER
        ])) {
            Response::reject(0x0201);
        }

        $sameRule = $this->repositoryModel->getProtectedBranchRule($rKey, $rule);
        if ($sameRule && $sameRule['pbr_key'] !== $pbrKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_PROTECTED_BRANCH_RULE_CREATE
        )) {
            Response::reject(0x0106);
        }

        $updateData = [
            'pbr_rule' => $rule,
            'pbr_push_min_role_id' => $rolePush,
            'pbr_merge_min_role_id' => $roleMerge,
        ];

        if (!$this->repositoryModel->updateProtectedBranchRule($pbrKey, $updateData)) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('PROTECTED_BRANCH_RULE_CHANGE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $rule
        ], $uKey);

        Response::output([]);
    }

    public function deleteProtectedBranchRule_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $requestData = Request::parse()->parsed;
        $rKey = $requestData['repository'];
        $pbrKey = $requestData['id'];
        $rule = $requestData['rule'];

        if (!$rKey || !$rule || !$pbrKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_PROTECTED_BRANCH_RULE_REOMVE
        )) {
            Response::reject(0x0106);
        }

        $updateData = [
            'pbr_status' => COMMON_STATUS_DELETE,
            'pbr_deleted' => date('Y-m-d H:i:S')
        ];

        if (!$this->repositoryModel->updateProtectedBranchRule($pbrKey, $updateData)) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('PROTECTED_BRANCH_RULE_REMOVE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $rule
        ], $uKey);

        Response::output([]);
    }

    public function commitList_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $requestData = Request::parse()->query;
        $uKey = $userInfo['u_key'];
        $rKey = $requestData['repository'];
        $path = trim($requestData['path'], '/') ?: '';

        if (!$rKey || !$uKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $page = $requestData['page'];
        $pagesize = $requestData['pagesize'];
        $keyword = $requestData['keyword'];
        $revision = $requestData['revision'];

        $commitList = $this->repositoryModel->getCommits($rKey, $uKey, $revision, $path, $keyword, $page, $pagesize);
        $commitList = $this->repositoryModel->normalizeCommits($commitList);
        Response::output($commitList);
    }

    public function commitDetail_get()
    {
        $userInfo = Request::parse()->authData['userData'];
        $requestData = Request::parse()->query;
        if (!$requestData['repository']) {
            return Response::reject(0x0200);
        }
        $uKey = $userInfo['u_key'];
        $rKey = $requestData['repository'];
        $commitSHA = $requestData['commitSHA'];
        $result = $this->repositoryModel->getCommitDetail($rKey, $uKey, $commitSHA);
        $result = $this->repositoryModel->normalizeCommitDetail($result);
        Response::output($result);
    }

    public function fileChanges_get()
    {
        $requestData = Request::parse()->query;
        $userInfo = Request::parse()->authData['userData'];
        $uKey = $userInfo['u_key'];
        $rKey = $requestData['repository'];
        $original = $requestData['original'];
        $modified = $requestData['modified'];

        $versionCompare = $requestData['versionCompare'];

        $mrKey = $requestData['mergeRequest'];
        $targetRKey = $requestData['targetRepository'];

        $original = $original ? $original : '0000000000000000000000000000000000000000';

        if (!$uKey || !$rKey || !$modified) {
            Response::reject(0x0201);
        }

        if (!$mrKey) {
            if (!$this->service->requestRepositoryPermission(
                $rKey,
                $uKey,
                UserAccessController::UAC_REPO_READ
            )) {
                Response::reject(0x0106);
            }
        }

        if ($targetRKey) {
            if ($versionCompare) {
                $remoteObjects = [$original, $modified];
            } else {
                $remoteObjects = $this->repositoryModel->getMergeRequestLastCommitSha($uKey, $mrKey, $rKey, $original, $targetRKey, $modified);
                if (!$remoteObjects) {
                    Response::reject(0x0201);
                }
            }

            if ($targetRKey === $rKey) {
                $result = $this->repositoryModel->getDiffWithLocal($rKey, $uKey, $remoteObjects[1], $remoteObjects[0]);
            } else {
                $result = $this->repositoryModel->getDiffWithRemote($rKey, $remoteObjects[0], $targetRKey, $remoteObjects[1], $uKey);
            }
        } else {
            $targetRKey = $rKey;
            if (($count = $this->repositoryModel->getDiffWithLocalCount($rKey, $uKey, $original, $modified)) > MAX_DISPLAY_DIFF_FILE) {
                Response::output([
                    'large' => true,
                    'count' => $count,
                    'detail' => ''
                ]);
            }

            $result = $this->repositoryModel->getDiffWithLocal($rKey, $uKey, $original, $modified);
        }

        $parsedData = Helper::parseDiffString($result);
        foreach ($parsedData as &$item) {
            if ($item['type'] == 'binary') {
                if ($item['original']['name']) {
                    $result = $this->repositoryModel->catObject($targetRKey, $uKey, $item['original']['sha']);
                    $item['original']['type'] =  $result[0];
                    if (is_string($result[1])) {
                        $item['original']['object'] = Helper::parseObjectToFile($result[1]);
                    } else {
                        $item['original']['object'] = ['oversize' => TRUE, 'size' => $result[2]];
                    }
                }
                if ($item['modified']['name']) {
                    $result = $this->repositoryModel->catObject($targetRKey, $uKey, $item['modified']['sha']);
                    $item['modified']['type'] =  $result[0];
                    if (is_string($result[1])) {
                        $item['modified']['object'] = Helper::parseObjectToFile($result[1]);
                    } else {
                        $item['modified']['object'] = ['oversize' => TRUE, 'size' => $result[2]];
                    }
                }
            }
        }

        Response::output([
            'count' => count($parsedData),
            'detail' => $parsedData
        ]);
    }

    // 获取含有指定hash值的分支及tag列表
    public function refListContainSHA_get()
    {
        $requestData = Request::parse()->query;
        $userInfo = Request::parse()->authData['userData'];
        $uKey = $userInfo['u_key'];
        $rKey = $requestData['repository'];
        $commitHash = $requestData['hash'];

        if (!$uKey || !$rKey || !$commitHash) {
            Response::reject(0x0201);
        }
        $commitLog = $this->repositoryModel->getCommitDetail($rKey, $uKey, $commitHash);
        $parent = $commitLog['parent'];
        if (strlen($parent)) {
            $parentArray = explode(" ", $parent);
        }
        // 如果有两个父节点，需要合并tag和branch
        if ($parentArray && count($parentArray) > 1) {
            $parent0Branches = $this->repositoryModel->getBranchListBySHA1($rKey, $uKey, $parentArray[0]);
            $parent1Branches = $this->repositoryModel->getBranchListBySHA1($rKey, $uKey, $parentArray[1]);
            $parent0Tags = $this->repositoryModel->getTagListBySHA1($rKey, $uKey, $parentArray[0]);
            $parent1Tags = $this->repositoryModel->getTagListBySHA1($rKey, $uKey, $parentArray[1]);
            $branches = array_intersect($parent0Branches, $parent1Branches);
            $tags = array_intersect($parent0Tags, $parent1Tags);
            $tags = array_merge($tags);
            $result['branch'] = $branches;
            $result['tag'] = $tags;
        } else {
            $result['branch'] = $this->repositoryModel->getBranchListBySHA1($rKey, $uKey, $commitHash);
            $result['tag'] = $this->repositoryModel->getTagListBySHA1($rKey, $uKey, $commitHash);
        }
        Response::output($result);
    }

    public function fileContent_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;

        $repository = $data['repository'];
        $sha = $data['sha'];
        $path = trim($data['path'], '/');

        $from = (int) $data['from'];
        $to = (int) $data['to'];

        if (!$repository || !$sha || !$path) {
            return Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $repository,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->geFilesByBranchOrSHA1Hash($repository, $uKey, $sha, FALSE, TRUE);

        if (!$result) {
            Response::reject(0x040E);
        }

        if ($from || $to) {
            if ($from > 0 && $to > 0 && $to > $from) {
                return Response::output([
                    'raw' =>
                    implode(
                        "\n",
                        array_slice(
                            explode("\n", $result),
                            $from - 1,
                            $to - $from
                        )
                    )
                ]);
            } else {
                return Response::reject(0x0201);
            }
        }

        return Response::output(['raw' => $result]);
    }

    public function object_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $rKey = $data['repository'];
        $parent = $data['parent'];
        $path = trim($data['path'], '/');
        $rev = $data['revision'];

        if (!$rKey || !$parent) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->catObject($rKey, $uKey, $parent);

        if ($result[0] === 'blob') {
            if (is_string($result[1])) {
                $result[1] = Helper::parseObjectToFile($result[1]);
            } else {
                $result[1] = ['oversize' => TRUE, 'size' => $result[2]];
            }
        }

        $output = [];
        $output['type'] =  $result[0];
        $output['object'] = $result[1];

        if ($rev) {
            $output['commit'] = $this->repositoryModel->getLastCommit($rKey, $uKey, $rev, $path);
            $output['path'] = $path;
            if ($output['type'] !== 'blob') {
                $output['object'] = $this->repositoryModel->addLastCommitToObjectList($rKey, $uKey, $rev, $path, $result[1]);
            }
        }

        Response::output($output);
    }

    public function pathStack_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $rKey = $data['repository'];
        $revision = $data['revision'];
        $path = $data['path'];

        if (!$rKey || !$revision || !$path) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $path = trim($path, '/');

        $pathStack = explode('/', $path);

        $output = [];

        $result = $this->repositoryModel->catObject($rKey, $uKey, $revision);
        foreach ($pathStack as $pathIndex => $pathName) {
            if ($result[0] !== 'blob') {
                $matchedObject = array_values(array_filter($result[1], function ($v, $k) use ($pathName) {
                    return $v['name'] === $pathName;
                }, ARRAY_FILTER_USE_BOTH));

                if ($matchedObject[0]) {
                    $output[$pathIndex] = $matchedObject[0];

                    if ($matchedObject[0]['type'] !== 'blob') {
                        $result = $this->repositoryModel->catObject($rKey, $uKey, $matchedObject[0]['object']);
                    } else if ($pathIndex < count($pathStack) - 1) {
                        Response::output([]);
                    }
                } else {
                    Response::output([]);
                }
            }
        }

        Response::output($output);
    }

    public function mergeRequests_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $rKey = $data['repository'];
        $status = (int)$data['status'];
        $keyword = $data['keyword'];
        $sort = $data['sort'];
        $page = $data['page'];
        $pagesize = $data['pagesize'];

        if (
            !$rKey ||
            !in_array($sort, ['desc', 'asc']) ||
            ($status && !in_array($status, [MergeRequestStatus::OPEN, MergeRequestStatus::MERGED, MergeRequestStatus::CLOSED]))
        ) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_MR_READ
        )) {
            Response::reject(0x0106);
        }

        $conditions = [
            'mr_target_r_key' => $rKey,
            'mr_proceed_status' => $status,
            'mr_status' => COMMON_STATUS_NORMAL,
            '~mr_title|mr_description' => $keyword
        ];

        $res = $this->repositoryModel->getMergeRequests($conditions, $sort, $page, $pagesize);
        if ($res === FALSE) {
            Response::reject(0x0201);
        }

        $res = $this->repositoryModel->normalizeMergeRequests($res);

        Response::output($res);
    }

    public function relatedMergeRequests_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $status = (int)$data['status'];
        $keyword = $data['keyword'];
        $sort = $data['sort'];
        $page = $data['page'];
        $pagesize = $data['pagesize'];

        if (
            !in_array($sort, ['desc', 'asc']) ||
            ($status && !in_array($status, [MergeRequestStatus::OPEN, MergeRequestStatus::MERGED, MergeRequestStatus::CLOSED]))
        ) {
            Response::reject(0x0201);
        }

        $list = $this->repositoryModel->listJoined($uKey);
        $list = $this->repositoryModel->normalize($list);
        foreach (array_keys($list) as $itemKey) {
            $list[$itemKey]['role'] = $this->repositoryModel->getMemberRole($list[$itemKey]['id'], $uKey);
        }

        $filterRepositoryArr = [];
        $statusCode = [
            0 => 'all',
            1 => 'open',
            2 => 'merged',
            3 => 'closed'
        ];
        foreach ($list as $index => $item) {
            if ($item['role'] > 1) {
                $filterRepositoryArr[] = $item['id'];
            }
        }

        $conditions = [
            'mr_target_r_key' => $filterRepositoryArr,
            'mr_proceed_status' => $status,
            'mr_status' => COMMON_STATUS_NORMAL,
            '~mr_title|mr_description' => $keyword
        ];

        if (count($filterRepositoryArr)) {
            $result = $this->repositoryModel->getMergeRequests($conditions, $sort, $page, $pagesize);
        } else {
            Response::output([
                'relatedRepository' => [],
                'mergeRequests' => []
            ]);
        }

        if ($result === FALSE) {
            Response::reject(0x0201);
        }

        $result = $this->repositoryModel->normalizeMergeRequests($result);
        $output = [];
        $output['relatedRepository'] = $filterRepositoryArr;
        $output['mergeRequests'] = $result;
        Response::output($output);
    }

    public function mergeRequestCommits_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $mrKey = $data['mergeRequest'];
        $sourceRKey = $data['sourceRepository'];
        $sourceBranch = $data['sourceBranch'];
        $targetRKey = $data['targetRepository'];
        $targetBranch = $data['targetBranch'];

        if (!$sourceRKey || !$sourceBranch || !$targetRKey || !$targetBranch) {
            Response::reject(0x0201);
        }

        $remoteObjects = $this->repositoryModel->getMergeRequestLastCommitSha($uKey, $mrKey, $sourceRKey, $sourceBranch, $targetRKey, $targetBranch);
        if (!$remoteObjects) {
            Response::reject(0x0201);
        }
        if ($targetRKey === $sourceRKey) {
            $result = $this->repositoryModel->getCommitWithLocal($sourceRKey, $remoteObjects[0], $remoteObjects[1], $uKey);
        } else {
            $result = $this->repositoryModel->getCommitWithRemote($sourceRKey, $remoteObjects[0], $targetRKey, $remoteObjects[1], $uKey);
        }
        $result = $this->repositoryModel->normalizeCommits($result);

        Response::output($result);
    }

    public function mergeRequestClose_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $mrKey = $data['mergeRequest'];

        if (!$mrKey) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);
        if (!$mergeRequest || $mergeRequest['status'] != MergeRequestStatus::OPEN) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $mergeRequest['targetRepository'],
            $uKey,
            UserAccessController::UAC_MR_CLOSE
        )) {
            Response::reject(0x0106);
        }

        if (!$this->repositoryModel->mergeRequestClose($uKey, $mrKey, $mergeRequest)) {
            Response::reject(0x0201);
        }

        $repository = $this->repositoryModel->get($mergeRequest['targetRepository']);
        $sourceRepository = $this->repositoryModel->get($mergeRequest['sourceRepository']);
        $this->service->newEvent('MERGE_REQUEST_CLOSE', [
            'gKey' => $repository['g_key'],
            'rKey' => $mergeRequest['targetRepository'],
            'mrKey' => $mergeRequest['id'],
            'id' => $mergeRequest['number'],
            'sourceGKey' => $sourceRepository['g_key'],
            'sourceRKey' => $mergeRequest['sourceRepository'],
            'sourceBranch' => $mergeRequest['sourceBranch'],
            'targetBranch' => $mergeRequest['targetBranch']
        ], $uKey);

        Response::output([]);
    }

    public function lastCommitLog_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $rKey = $data['repository'];
        $ref = $data['ref'];
        $path = trim($data['path'], '/');
        $log = $this->repositoryModel->getLastCommit($rKey, $uKey, $ref, $path);
        Response::output($log);
    }

    public function branchList_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $rKey = Request::parse()->query['repository'];

        if (!$rKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_READ
        )) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->getBranches($rKey, $uKey);

        Response::output($result);
    }

    public function createBranch_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $name = trim($data['name']);
        $origin = trim($data['origin']);

        if (!$rKey || !$name || !$origin) {
            Response::reject(0x0201);
        }

        if (!preg_match('/^\w[\w\/\.\-]{0,29}$/', $name)) {
            Response::reject(0x0202);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_REPO_BRANCH_CREATE
        )) {
            Response::reject(0x0106);
        }

        $result = $this->groupModel->checkPreserve($name);
        if ($result) {
            Response::reject(0x0403);
        }

        $branchList = $this->repositoryModel->getBranchList($rKey, $uKey);
        $tagList = $this->repositoryModel->getTagList($rKey, $uKey);
        if (in_array($name, $branchList) || in_array($name, $tagList)) {
            Response::reject(0x0406);
        }

        $result = $this->repositoryModel->createBranch($name, $rKey, $origin, $uKey);
        if ($result) {
            Response::reject(0x040C);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('BRANCH_CREATE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $name
        ], $uKey);

        Response::output([]);
    }

    public function mergeRequestVersionList_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $mrKey = trim($data['mergeRequest']);

        if (!$mrKey) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);

        if (!$this->service->requestRepositoryPermission(
            $mergeRequest['targetRepository'],
            $uKey,
            UserAccessController::UAC_MR_READ
        )) {
            Response::reject(0x0106);
        }

        $versionList = $this->repositoryModel->getMergeRequestVersionList($uKey, $mrKey);
        $baseVersion = $this->repositoryModel->getLastCommit($mergeRequest['targetRepository'], $uKey, $mergeRequest['targetBranch'], '');

        $baseVersionList = $versionList;
        $baseVersionList[0] = $baseVersion;
        Response::output([
            'mergeVersionList' => $versionList,
            'baseVersion' => $baseVersion['sha'],
            'baseVersionList' => $baseVersionList
        ]);
    }

    public function createMergeRequest_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $sourceRepositoryKey = trim($data['sourceRepository']);
        $targetRepositoryKey = trim($data['targetRepository']);
        $sourceBranch = trim($data['sourceBranch']);
        $targetBranch = trim($data['targetBranch']);
        $title = trim($data['title']);
        $description = trim($data['description']);
        $reviewers = trim($data['reviewers']);

        if (
            !$sourceRepositoryKey || !$targetRepositoryKey ||
            !$sourceBranch || !$targetBranch
        ) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $targetRepositoryKey,
            $uKey,
            UserAccessController::UAC_MR_PUSH
        )) {
            Response::reject(0x0106);
        }

        if ($this->repositoryModel->isMergeRequestExist($sourceRepositoryKey, $sourceBranch, $targetRepositoryKey, $targetBranch)) {
            Response::reject(0x0406);
        }

        if ($this->repositoryModel->checkBranchProteced($targetRepositoryKey, $uKey, $targetBranch, TRUE)) {
            Response::reject(0x040F);
        }

        $remoteObjects = $this->repositoryModel->getMergeRequestLastCommitSha($uKey, '', $sourceRepositoryKey, $sourceBranch, $targetRepositoryKey, $targetBranch);
        if ($sourceRepositoryKey === $targetRepositoryKey) {
            if (!$this->repositoryModel->getCommitWithLocal($sourceRepositoryKey, $remoteObjects[0], $remoteObjects[1], $uKey)) {
                Response::reject(0x040C);
            }
        } else {
            if (!$this->repositoryModel->getCommitWithRemote($sourceRepositoryKey, $remoteObjects[0], $targetRepositoryKey, $remoteObjects[1], $uKey)) {
                Response::reject(0x040C);
            }
        }

        $sourceCommitHash = $this->repositoryModel->getLastCommit($sourceRepositoryKey, $uKey, $sourceBranch, '')['sha'];

        $res = $this->repositoryModel->createMergeRequest(
            $uKey,
            $sourceRepositoryKey,
            $sourceBranch,
            $targetRepositoryKey,
            $targetBranch,
            $sourceCommitHash,
            $title,
            $description
        );

        if (!is_array($res)) {
            Response::reject(0x040C);
        }

        $repository = $this->repositoryModel->get($targetRepositoryKey);
        $sourceRepository = $this->repositoryModel->get($sourceRepositoryKey);
        $this->service->newEvent('MERGE_REQUEST_CREATE', [
            'gKey' => $repository['g_key'],
            'rKey' => $targetRepositoryKey,
            'mrKey' => $res['mrKey'],
            'id' => $res['mrId'],
            'sourceGKey' => $sourceRepository['g_key'],
            'sourceRKey' => $sourceRepositoryKey,
            'sourceBranch' => $sourceBranch,
            'targetBranch' => $targetBranch,
            'reviewers' => $reviewers
        ], $uKey);

        if ($reviewers) {
            $reviewers = explode(',', $reviewers);
            $repository = $this->repositoryModel->get($targetRepositoryKey);

            foreach ($reviewers as $reviewer) {
                $mrrKey = $this->repositoryModel->assignReviewer($res['mrKey'], $reviewer);

                if ($mrrKey) {
                    $this->service->newEvent('MERGE_REQUEST_REVIEWER_CREATE', [
                        'gKey' => $repository['g_key'],
                        'rKey' => $targetRepositoryKey,
                        'reviewer' => $reviewer,
                        'mrKey' => $res['mrKey'],
                        'mrrKey' => $mrrKey,
                        'id' => $res['mrId']
                    ], $uKey);
                }
            }
        }

        Response::output(['id' => $res['mrId']]);
    }

    public function mergeRequestReview_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $mrKey = trim($data['id']);

        if (!$mrKey) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);
        if (!$this->service->requestRepositoryPermission(
            $mergeRequest['targetRepository'],
            $uKey,
            UserAccessController::UAC_MR_PUSH
        )) {
            Response::reject(0x0106);
        }

        if (!$this->repositoryModel->mergeRequestReview($mrKey, $uKey)) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($mergeRequest['targetRepository']);
        $this->service->newEvent('MERGE_REQUEST_REVIEWER_REVIEW', [
            'gKey' => $repository['g_key'],
            'rKey' => $mergeRequest['targetRepository'],
            'reviewer' => $uKey,
            'mrKey' => $mrKey,
            'id' => $mergeRequest['number']
        ], $uKey);

        Response::output([]);
    }

    public function assignReviewer_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $mrKey = trim($data['id']);
        $reviewer = trim($data['reviewer']);

        if (!$mrKey || !$reviewer) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);
        if (!$this->service->requestRepositoryPermission(
            $mergeRequest['targetRepository'],
            $uKey,
            UserAccessController::UAC_MR_MERGE
        )) {
            Response::reject(0x0106);
        }

        $mrrKey = $this->repositoryModel->assignReviewer($mrKey, $reviewer);
        if (!$mrrKey) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($mergeRequest['targetRepository']);
        $this->service->newEvent('MERGE_REQUEST_REVIEWER_CREATE', [
            'gKey' => $repository['g_key'],
            'rKey' => $mergeRequest['targetRepository'],
            'reviewer' => $reviewer,
            'mrKey' => $mrKey,
            'mrrKey' => $mrrKey,
            'id' => $mergeRequest['number']
        ], $uKey);

        Response::output([]);
    }

    public function deleteReviewer_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $mrKey = trim($data['id']);
        $reviewer = trim($data['reviewer']);

        if (!$mrKey) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);
        if (!$this->service->requestRepositoryPermission(
            $mergeRequest['targetRepository'],
            $uKey,
            UserAccessController::UAC_MR_MERGE
        )) {
            Response::reject(0x0106);
        }

        if (!$this->repositoryModel->deleteReviewer($mrKey, $reviewer)) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($mergeRequest['targetRepository']);
        $this->service->newEvent('MERGE_REQUEST_REVIEWER_DELETE', [
            'gKey' => $repository['g_key'],
            'rKey' => $mergeRequest['targetRepository'],
            'reviewer' => $reviewer,
            'mrKey' => $mrKey,
            'id' => $mergeRequest['number']
        ], $uKey);

        Response::output([]);
    }

    public function checkMergeType_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $mrKey = trim($data['mergeRequest']);
        if (!$mrKey) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);

        if (!$mergeRequest || $mergeRequest['status'] != MergeRequestStatus::OPEN) {
            Response::reject(0x0201);
        }

        $sourceRepositoryKey = $mergeRequest['sourceRepository'];
        $sourceBranch = $mergeRequest['sourceBranch'];
        $targetRepositoryKey = $mergeRequest['targetRepository'];
        $targetBranch = $mergeRequest['targetBranch'];

        if (!$this->service->requestRepositoryPermission(
            $targetRepositoryKey,
            $uKey,
            UserAccessController::UAC_MR_MERGE
        )) {
            Response::reject(0x0106);
        }
        $sourceCommitHash = $this->repositoryModel->getLastCommit($sourceRepositoryKey, $uKey, $sourceBranch, '')['sha'];
        $targetCommitHash = $this->repositoryModel->getLastCommit($targetRepositoryKey, $uKey, $targetBranch, '')['sha'];
        $canBeFastForward = $this->repositoryModel->canBeFastForward($sourceRepositoryKey, $sourceCommitHash, $targetRepositoryKey, $targetCommitHash, $uKey);

        Response::output([
            'canBeFastForward' => $canBeFastForward
        ]);
    }

    public function mergeBranch_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $mrKey = trim($data['mergeRequest']);
        $message = trim($data['message']);
        if (trim($data['usingSquash']) === 'false') {
            $usingSquash = false;
        } else {
            $usingSquash = true;
        }

        if (strlen($message) === 0) {
            $message = NULL;
        }

        if (!$mrKey) {
            Response::reject(0x0201);
        }

        $mergeRequest = $this->repositoryModel->getMergeRequestByKey($mrKey);

        if (!$mergeRequest || $mergeRequest['status'] != MergeRequestStatus::OPEN) {
            Response::reject(0x0201);
        }

        $sourceRepositoryKey = $mergeRequest['sourceRepository'];
        $sourceBranch = $mergeRequest['sourceBranch'];
        $targetRepositoryKey = $mergeRequest['targetRepository'];
        $targetBranch = $mergeRequest['targetBranch'];

        if (!$this->service->requestRepositoryPermission(
            $targetRepositoryKey,
            $uKey,
            UserAccessController::UAC_MR_MERGE
        )) {
            Response::reject(0x0106);
        }

        if ($this->repositoryModel->checkBranchProteced($targetRepositoryKey, $uKey, $targetBranch, TRUE)) {
            Response::reject(0x040F);
        }

        if (!$this->repositoryModel->getReviewStatus($mrKey)) {
            Response::reject(0x0405);
        }

        $sourceCommitHash = $this->repositoryModel->getLastCommit($sourceRepositoryKey, $uKey, $sourceBranch, '')['sha'];
        $targetCommitHash = $this->repositoryModel->getLastCommit($targetRepositoryKey, $uKey, $targetBranch, '')['sha'];
        $message = $message ? $message : NULL;
        $res = $this->repositoryModel->mergeBranch($sourceRepositoryKey, $sourceBranch, $targetRepositoryKey, $targetBranch, $uKey, $message, $usingSquash);
        $conflictPattern = '/\bconflicts\b/';
        if ($res) {
            if (preg_match($conflictPattern, $res[count($res) - 1])) {
                Response::output(['conflict' => true]);
            } else {
                $this->repositoryModel->mergeRequestMerge($uKey, $mrKey, $sourceCommitHash, $targetCommitHash);
                $repository = $this->repositoryModel->get($targetRepositoryKey);
                $sourceRepository = $this->repositoryModel->get($sourceRepositoryKey);
                $this->service->newEvent('MERGE_REQUEST_MERGE', [
                    'gKey' => $repository['g_key'],
                    'rKey' => $targetRepositoryKey,
                    'mrKey' => $mergeRequest['id'],
                    'id' => $mergeRequest['number'],
                    'sourceGKey' => $sourceRepository['g_key'],
                    'sourceRKey' => $mergeRequest['sourceRepository'],
                    'sourceBranch' => $sourceBranch,
                    'targetBranch' => $targetBranch
                ], $uKey);
                Response::output([]);
            }
        }
    }

    public function blameInfo_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $rKey = $data['repository'];
        $revision = $data['revision'];
        $filepath = $data['path'];

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_MR_READ
        )) {
            Response::reject(0x0106);
        }

        $blameData = $this->repositoryModel->getBlameInfo($rKey, $uKey, $revision, $filepath);

        Response::output([
            'blame' => $blameData[0],
            'lines' => $blameData[1]
        ]);
    }

    public function mergeRequestDetail_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->query;
        $rKey = $data['repository'];
        $mId = $data['mid'];

        if (!$rKey || !$mId) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission(
            $rKey,
            $uKey,
            UserAccessController::UAC_MR_READ
        )) {
            Response::reject(0x0106);
        }

        $res = $this->repositoryModel->getMergeRequestByIdAndKey($mId, $rKey);

        $userInfo = $this->userModel->get($res['user']);

        if ($userInfo) {
            $res['email'] = $userInfo['u_email'];
        }

        if (count($res)) {
            Response::output($res);
        }
    }

    public function deleteBranch_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $branch = trim($data['branch']);

        if (!$rKey || !$branch) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_BRANCH_REMOVE)) {
            Response::reject(0x0106);
        }

        $repository = $this->repositoryModel->get($rKey);
        if ($branch == $repository['r_default_branch_name']) {
            Response::reject(0x0405);
        }

        $result = $this->repositoryModel->deleteBranch($rKey, $uKey, $branch);
        if (!$result) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);

        $this->service->newEvent('BRANCH_REMOVE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $branch
        ], $uKey);

        Response::output([]);
    }

    public function tagList_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $rKey = Request::parse()->query['repository'];

        if (!$rKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_READ)) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->getTags($rKey, $uKey);

        Response::output($result);
    }

    public function createTag_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $name = trim($data['name']);
        $commitSHA = trim($data['origin']);
        $description = trim($data['description']);

        if (!$rKey || !$name) {
            Response::reject(0x0201);
        }

        if (!preg_match('/^\w+(\.\w+)*$/', $name)) {
            Response::reject(0x0202);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_TAG_CREATE)) {
            Response::reject(0x0106);
        }

        $result = $this->groupModel->checkPreserve($name);
        if ($result) {
            Response::reject(0x0403);
        }

        $branchList = $this->repositoryModel->getBranchList($rKey, $uKey);
        $tagList = $this->repositoryModel->getTagList($rKey, $uKey);
        if (in_array($name, $branchList) || in_array($name, $tagList)) {
            Response::reject(0x0406);
        }

        $result = $this->repositoryModel->createTag($rKey, $uKey, $name, $description, $commitSHA);
        if ($result) {
            Response::reject(0x040C);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('TAG_CREATE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $name
        ], $uKey);

        Response::output([]);
    }

    public function deleteTag_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $tag = trim($data['tag']);

        if (!$rKey || !$tag) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_TAG_REMOVE)) {
            Response::reject(0x0106);
        }

        $result = $this->repositoryModel->deleteTag($rKey, $uKey, $tag);
        if (!$result) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);

        $this->service->newEvent('TAG_REMOVE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'name' => $tag
        ], $uKey);

        Response::output([]);
    }

    public function targetRepository_get()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $rKey = Request::parse()->query['repository'];

        if (!$rKey) {
            Response::reject(0x0201);
        }

        $result = [];
        $targetRepository = [];
        $repository = $this->repositoryModel->get($rKey);
        $group = $this->groupModel->get($repository['g_key']);
        $targetRepository['rKey'] = $rKey;
        $targetRepository['name'] = $group['g_display_name'] . '/' . $repository['r_display_name'];
        $targetRepository['forkFlag'] = false;
        array_push($result, $targetRepository);

        $targetRepository = [];
        if ($repository['r_fork_r_key']) {
            $forkRepoKey = $repository['r_fork_r_key'];
            $forkRepository = $this->repositoryModel->get($forkRepoKey);
            if (!$forkRepository) {
                Response::output($result);
            } else {
                $group = $this->groupModel->get($forkRepository['g_key']);
                $targetRepository['rKey'] = $forkRepoKey;
                $targetRepository['name'] = $group['g_display_name'] . '/' . $forkRepository['r_display_name'];
                $targetRepository['forkFlag'] = true;
                array_push($result, $targetRepository);
            }
        }

        Response::output($result);
    }

    public function getWebhook_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $rwKey = $data['rwKey'];

        if (!$rKey || !$rwKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_READ)) {
            Response::reject(0x0106);
        }

        $webhook = $this->repositoryModel->getWebhook($rwKey);
        $webhook = $this->repositoryModel->normalizeWebhooks($webhook ? [$webhook] : []);
        Response::output($webhook ? $webhook[0] : []);
    }

    public function webhooks_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $rKey = Request::parse()->parsed['repository'];

        if (!$rKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_READ)) {
            Response::reject(0x0106);
        }

        $webhooks = $this->repositoryModel->getWebhooks($rKey);
        $webhooks = $this->repositoryModel->normalizeWebhooks($webhooks);

        Response::output($webhooks);
    }

    public function editWebhook_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $rwKey = $data['rwKey'];
        $url = $data['url'];
        $secret = $data['secret'];
        $events = $data['events'];
        $active = (int) $data['active'];

        if (!$url || !$events || !in_array($active, [1, 2])) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_WEBHOOK_EDIT)) {
            Response::reject(0x0106);
        }

        $dbData = array(
            'rw_url' => $url,
            'rw_secret' => $secret,
            'rw_events' => $events,
            'rw_active' => $active
        );

        if ($rwKey) {
            $result = $this->repositoryModel->updateWebhook($rwKey, $dbData);
            $eventType = 'WEBHOOK_UPDATE';
        } else {
            $dbData['u_key'] = $uKey;
            $dbData['r_key'] = $rKey;
            $result = $this->repositoryModel->createWebhook($dbData);
            $eventType = 'WEBHOOK_CREATE';
        }

        if (!$result) {
            Response::reject(0x0405);
        }

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent($eventType, [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'rwKey' => $result
        ], $uKey);

        Response::output([]);
    }

    public function deleteWebhook_post()
    {
        $uKey = Request::parse()->authData['userData']['u_key'];
        $data = Request::parse()->parsed;
        $rKey = $data['repository'];
        $rwKey = $data['rwKey'];

        if (!$rKey || !$rwKey) {
            Response::reject(0x0201);
        }

        if (!$this->service->requestRepositoryPermission($rKey, $uKey, UserAccessController::UAC_REPO_WEBHOOK_REMOVE)) {
            Response::reject(0x0106);
        }

        if (!$this->repositoryModel->deleteWebhook($rwKey)) {
            Response::reject(0x0405);
        }

        // DELETE EVENTS AND LOGS
        $this->repositoryModel->deleteWebhookEventsByRwKey($rwKey);
        $this->repositoryModel->deleteWebhookLogsByRwKey($rwKey);

        $repository = $this->repositoryModel->get($rKey);
        $this->service->newEvent('WEBHOOK_DELETE', [
            'gKey' => $repository['g_key'],
            'rKey' => $rKey,
            'rwKey' => $rwKey,
        ], $uKey);

        Response::output([]);
    }

    public function getRepositoryWebhookLogs_post()
    {
        $data = Request::parse()->parsed;
        $rwKey = $data['webhook'];

        if (!$rwKey) {
            Response::reject(0x0201);
        }

        $logs = $this->repositoryModel->getRepositoryWebhookLogs($rwKey);
        $logs = $this->repositoryModel->normalizeRepositoryWebhookLogs($logs);

        Response::output($logs);
    }

    public function getRepositoryWebhookLogData_post()
    {
        $data = Request::parse()->parsed;
        $id = $data['id'];

        if (!$id) {
            Response::reject(0x0201);
        }

        $log = $this->repositoryModel->getRepositoryWebhookLogData($id);
        $log = $this->repositoryModel->normalizeRepositoryWebhookLogData($log);

        Response::output($log);
    }
}
