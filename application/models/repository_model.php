<?php

use service\Utility\Helper;
use service\Utility\UUID;
use service\Utility\Workspace;
use service\Utility\Command;
use service\Git\Command as GitCommand;
use service\CacheData\Store;
use service\AccessControl\UserAccessController;
use service\Constant\MergeRequestStatus;

class Repository_model extends CI_Model
{
    const DELIMITER = ' ';
    private $store = NULL;
    function __construct()
    {
        parent::__construct();
        $this->load->model('Group_model', 'groupModel');
        $this->load->model('User_model', 'userModel');
        $this->store = new Store();
    }

    public function normalize(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            if ($item && $item['g_key']) {
                $groupData = $this->groupModel->get($item['g_key']);
                array_push($output, [
                    'id' => $item['r_key'],
                    'icon' => $item['r_avatar'],
                    'displayName' => $item['r_display_name'],
                    'name' => $item['r_name'],
                    'description' => $item['r_description'],
                    'owner' => $item['u_key'],
                    'forkFrom' => $item['r_fork_r_key'],
                    'created' => (int) strtotime($item['r_created']),
                    'updated' => (int) strtotime($item['r_updated']),
                    'group' => $this->groupModel->normalize([$groupData])[0],
                    'forkCount' => (int) $this->countForks($item['r_key']),
                    'mergeRequestCount' => $this->countMergeRequests($item['r_key']),
                    'defaultBranch' => $item['r_default_branch_name'],
                    'status' => (int) $item['r_status'],
                ]);
            }
        }
        return $output;
    }

    public function normalizeMembers(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $userData = $this->userModel->get($item['u_key']);
            $data = $this->userModel->normalize([$userData])[0];
            $data['role'] = $item['rm_role'];
            $data['joined'] = strtotime($item['rm_created']);
            $data['groupMember'] = FALSE;
            $data['creatorFlag'] = FALSE;
            $data['deleteFlag'] = !($item['rm_status'] == COMMON_STATUS_NORMAL);
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeCreator(string $rKey)
    {
        $data = [];

        $repositoryData = $this->get($rKey);
        $userData = $this->userModel->get($repositoryData['u_key']);
        $data = $this->userModel->normalize([$userData])[0];
        $data['role'] = UserAccessController::ROLE_OWNER;
        $data['joined'] = strtotime($repositoryData['r_created']);
        $data['groupMember'] = FALSE;
        $data['creatorFlag'] = TRUE;
        $data['deleteFlag'] = FALSE;

        return $data;
    }

    public function normalizeBranches(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $data['id'] = $item;
            $data['name'] = $item;
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeProtectedBranchRules(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $data['id'] = $item['pbr_key'];
            $data['rule'] = $item['pbr_rule'];
            $data['rolePush'] = (int) $item['pbr_push_min_role_id'];
            $data['roleMerge'] = (int) $item['pbr_merge_min_role_id'];
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeTags(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $data['id'] = $item;
            $data['name'] = $item;
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeActivities(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $data['id'] = $item['a_key'];
            $data['type'] = (int) $item['a_type'];
            $data['creator'] = $item['u_key'];
            $data['group'] = $item['a_relative_g_key'];
            $data['repository'] = $item['a_relative_r_key'];
            $data['content'] = json_decode($item['a_data'], TRUE);
            $data['time'] = strtotime($item['a_created']);

            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeCommits(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $data['sha'] = $item['sha'];
            $data['commit'] = $item['log'];
            $data['detail'] = $item['body'];
            $data['email'] = $item['email'];
            $data['time'] = (int) $item['time'];
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeCommitDetail(array $list)
    {
        $data = [];
        $data['sha'] = $list['sha'];
        $data['commit'] = $list['log'];
        $data['parent'] = $list['parent'];
        $data['email'] = $list['email'];
        $data['time'] = (int) $list['time'];

        return $data;
    }

    public function normalizeMergeRequests(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            $data = [];
            $data['id'] = $item['mr_key'];
            $data['sourceRepository'] = $item['mr_source_r_key'];
            $data['sourceBranch'] = $item['mr_source_branch'];
            $data['targetRepository'] = $item['mr_target_r_key'];
            $data['targetBranch'] = $item['mr_target_branch'];
            $data['number'] = (int) $item['mr_id'];
            $data['title'] = $item['mr_title'];
            $data['status'] = (int) $item['mr_proceed_status'];
            $data['create'] = strtotime($item['mr_created']);
            $data['update'] = strtotime($item['mr_updated']);
            $data['reviewers'] = $this->getMergeRequestReviewers($item['mr_key']);
            $data['commit'] = $this->getLastCommit($item['mr_source_r_key'], $item['u_key'], $item['mr_source_branch'], '', $item['mr_source_merged_hash'] ? $item['mr_source_merged_hash'] : '');
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeMergeRequest(array $item)
    {
        $userInfo = $this->userModel->get($item['u_key']);
        $userInfo = $this->userModel->normalize([$userInfo])[0];
        $sourceRepoInfo = $this->get($item['mr_source_r_key']);
        $sourceRepoInfo = $this->normalize([$sourceRepoInfo])[0];
        $sourceRepoInfo['members'] = $this->getMembers($item['mr_source_r_key']);
        $data = [];
        $data['id'] = $item['mr_key'];
        $data['user'] = $item['u_key'];
        $data['sourceRepository'] = $item['mr_source_r_key'];
        $data['sourceBranch'] = $item['mr_source_branch'];
        $data['sourceObject'] = $item['mr_source_merged_hash'];
        $data['targetRepository'] = $item['mr_target_r_key'];
        $data['targetBranch'] = $item['mr_target_branch'];
        $data['targetObject'] = $item['mr_target_merged_hash'];
        $data['submitter'] = $userInfo;
        $data['sourceRepoInfo'] = $sourceRepoInfo;
        $data['title'] = $item['mr_title'];
        $data['description'] = $item['mr_description'];
        $data['number'] = (int) $item['mr_id'];
        $data['handler'] = $item['mr_merge_u_key'];
        $data['title'] = $item['mr_title'];
        $data['status'] = (int) $item['mr_proceed_status'];
        $data['create'] = strtotime($item['mr_created']);
        $data['update'] = strtotime($item['mr_updated']);
        $data['close'] = strtotime($item['mr_close_time']);
        $data['merge'] = strtotime($item['mr_merge_time']);
        $data['reviewers'] = $this->getMergeRequestReviewers($item['mr_key']);

        return $data;
    }

    public function normalizeReviewers($list)
    {
        $output = [];

        foreach ($list as $item) {
            $data = [];
            $data['id'] = $item['mrr_key'];
            $data['user'] = $item['u_key'];
            $data['isReview'] = $item['mrr_is_review'] == GLOBAL_TRUE;
            array_push($output, $data);
        }

        return $output;
    }

    public function createMergeRequest(
        string $uKey,
        string $sourceRepositoryKey,
        string $sourceBranch,
        string $targetRepositoryKey,
        string $targetBranch,
        string $sourceCommitHash,
        string $title,
        string $description
    ) {
        $this->db->select('mr_id');
        $this->db->where('mr_target_r_key', $targetRepositoryKey);
        $this->db->order_by("mr_id", "desc");
        $query = $this->db->get('merge_requests');
        $lastRequest = $query->row_array();
        $mrKey = UUID::getKey();
        $data = array();
        $data['mr_key'] = $mrKey;
        $data['u_key'] = $uKey;
        $data['mr_source_r_key'] = $sourceRepositoryKey;
        $data['mr_source_branch'] = $sourceBranch;
        $data['mr_target_r_key'] = $targetRepositoryKey;
        $data['mr_target_branch'] = $targetBranch;
        $data['mr_start_hash'] = $sourceCommitHash;
        $data['mr_title'] = $title;
        $data['mr_description'] = $description;
        $data['mr_id'] = $lastRequest['mr_id'] + 1;
        $data['mr_proceed_status'] = MergeRequestStatus::OPEN;
        $data['mr_created'] = date('Y-m-d H:i:s');
        $data['mr_updated'] = date('Y-m-d H:i:s');
        $data['mr_status'] = COMMON_STATUS_NORMAL;
        $res = $this->db->insert('merge_requests', $data);
        if ($res) {
            return ['mrKey' => $mrKey, 'mrId' => $lastRequest['mr_id'] + 1];
        } else {
            return FALSE;
        }
    }

    public function mergeRequestReview(string $mrKey, string $uKey)
    {
        if (!$mrKey || !$uKey) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('u_key', $uKey);
        $this->db->where('mrr_status', COMMON_STATUS_NORMAL);
        $result = $this->db->update('merge_request_reviewers', ['mrr_is_review' => GLOBAL_TRUE]);

        return $result;
    }

    public function assignReviewer(string $mrKey, string $uKey)
    {
        if (!$mrKey || !$uKey) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('mrr_status', COMMON_STATUS_NORMAL);
        $this->db->limit(1);
        $reviewer = $this->db->get('merge_request_reviewers');
        $reviewer = $reviewer->row_array();
        if ($reviewer) {
            if ($reviewer['mrr_is_review'] == GLOBAL_TRUE) {
                return FALSE;
            } else {
                $this->deleteReviewer($reviewer['mr_key'], $reviewer['u_key']);
            }
        }

        $mrrKey = UUID::getKey();
        $data = [
            'mrr_key' => $mrrKey,
            'mr_key' => $mrKey,
            'u_key' => $uKey
        ];

        $this->db->insert('merge_request_reviewers', $data);
        return $mrrKey;
    }

    public function deleteReviewer(string $mrKey, string $uKey)
    {
        if (!$mrKey || !$uKey) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('u_key', $uKey);
        $this->db->where('mrr_is_review', GLOBAL_TRUE);
        $this->db->where('mrr_status', COMMON_STATUS_NORMAL);
        $this->db->limit(1);
        $reviewer = $this->db->get('merge_request_reviewers');
        $reviewer = $reviewer->row_array();
        if ($reviewer) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('u_key', $uKey);
        $result = $this->db->delete('merge_request_reviewers');

        return $result;
    }

    public function getMergeRequestReviewers(string $mrKey)
    {
        if (!$mrKey) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('mrr_status', COMMON_STATUS_NORMAL);
        $result = $this->db->get('merge_request_reviewers');
        $result = $result->result_array();
        $result = $this->normalizeReviewers($result);

        return $result;
    }

    public function getReviewStatus(string $mrKey)
    {
        if (!$mrKey) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('mrr_status', COMMON_STATUS_NORMAL);
        $this->db->where('mrr_is_review', GLOBAL_FALSE);
        $this->db->limit(1);
        $result = $this->db->get('merge_request_reviewers');
        $result = $result->row_array();

        return !$result;
    }

    public function mergeRequestMerge(string $uKey, string $mrKey, string $sourceCommitHash, string $targetCommitHash)
    {
        if (!$uKey || !$mrKey || !$sourceCommitHash || !$targetCommitHash) {
            return FALSE;
        }
        $data = array(
            'mr_source_merged_hash' => $sourceCommitHash,
            'mr_target_merged_hash' => $targetCommitHash,
            'mr_proceed_status' => MergeRequestStatus::MERGED,
            'mr_merge_u_key' => $uKey,
            'mr_merge_time' => date('Y-m-d H:i:s')
        );
        $this->db->where('mr_key', $mrKey);
        $res = $this->db->update('merge_requests', $data);
        return $res;
    }

    public function getMergeRequestByIdAndKey($mId, $rKey)
    {
        $this->db->where('mr_id', $mId);
        $this->db->where('mr_target_r_key', $rKey);
        $query = $this->db->get('merge_requests');
        $res = $query->row_array();
        $res = $this->normalizeMergeRequest($res);
        return $res;
    }

    public function get(string $rKey)
    {
        if ($this->store->exsit($rKey)) {
            return $this->store->get($rKey);
        } else {
            $this->db->where('r_key', $rKey);
            $this->db->where('r_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('repositories');
            $data = $query->row_array();

            if ($data) {
                $this->store->set($rKey, $data);
                return $data;
            }
        }
        return FALSE;
    }

    public function listMembers(string $rKey)
    {
        if (!$rKey) {
            return FALSE;
        } else {
            $this->db->where('r_key', $rKey);
            $query = $this->db->get('repository_members');
            return $query->result_array();
        }
    }

    public function list(string $uKey)
    {
        if (!$uKey) {
            return FALSE;
        } else {
            $this->db->where('u_key', $uKey);
            $this->db->where('r_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('repositories');
            return  $query->result_array();
        }
    }

    public function listInGroup(string $gKey)
    {
        if (!$gKey) {
            return FALSE;
        }

        $this->db->where('g_key', $gKey);
        $this->db->where('r_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('repositories');
        return  $query->result_array();
    }

    public function listJoined(string $uKey)
    {
        if (!$uKey) {
            return FALSE;
        }

        // indirect joined (joined via group)
        $ownedGroup = $this->groupModel->list($uKey);
        $joinedGroup = $this->groupModel->listJoined($uKey);
        $groups = array_merge($ownedGroup, $joinedGroup);

        $repository = [];
        foreach ($groups as $item) {
            $repository = array_merge($repository, $this->listInGroup($item['g_key']));
        }

        // direct joined
        $this->db->select('repositories.*');
        $this->db->join('repository_members', 'repository_members.r_key=repositories.r_key', 'left');
        $this->db->where('repository_members.u_key', $uKey);
        $this->db->where('rm_status', COMMON_STATUS_NORMAL);
        $this->db->where('r_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('repositories');
        $repository = array_merge($repository, $query->result_array());

        // owner
        $repository = array_merge($repository, $this->list($uKey));

        return Helper::getUniqueItemList($repository, 'r_key');
    }

    public function addMember(string $uKey, string $rKey)
    {
        if (!$uKey || !$rKey) {
            return FALSE;
        } else {
            $this->db->where('u_key', $uKey);
            $this->db->where('r_key', $rKey);
            $query = $this->db->get('repository_members');
            $info = $query->row_array();
        }

        if ($info) {
            $this->setMemberRole($uKey, $rKey, UserAccessController::ROLE_GUEST);
        } else {
            $insertData = [
                'rm_key' => UUID::getKey(),
                'u_key' => $uKey,
                'r_key' => $rKey,
                'rm_role' => UserAccessController::ROLE_GUEST,
            ];
            $this->db->insert('repository_members', $insertData);
        }

        return TRUE;
    }

    public function setMemberRole(string $uKey, string $rKey, int $roleID)
    {
        if (!$uKey || !$rKey || !$roleID) {
            return FALSE;
        } else {
            $this->db->where('u_key', $uKey);
            $this->db->where('r_key', $rKey);
            $query = $this->db->get('repository_members');
            $info = $query->row_array();
        }

        if ($info) {
            $this->db->where('u_key', $uKey);
            $this->db->where('r_key', $rKey);
            $this->db->update('repository_members', [
                'rm_role' => $roleID,
                'rm_status' => COMMON_STATUS_NORMAL
            ]);
        } else {
            $insertData = [
                'rm_key' => UUID::getKey(),
                'u_key' => $uKey,
                'r_key' => $rKey,
                'rm_role' => $roleID
            ];
            $this->db->insert('repository_members', $insertData);
        }

        return TRUE;
    }

    public function removeMember(string $uKey, string $rKey)
    {
        if (!$uKey || !$rKey) {
            return FALSE;
        } else {
            $this->db->where('u_key', $uKey);
            $this->db->where('r_key', $rKey);
            $this->db->update('repository_members', [
                'rm_role' => UserAccessController::ROLE_GUEST,
                'rm_status' => COMMON_STATUS_DELETE,
                'rm_deleted' => date('Y-m-d H:i:s')
            ]);
            return TRUE;
        }
    }

    public function removeRepository(string $rKey)
    {
        $this->db->where('r_key', $rKey);
        $this->db->update('repositories', [
            'r_status' => COMMON_STATUS_DELETE,
            'r_deleted' => date('Y-m-d H:i:s')
        ]);
        return TRUE;
    }

    public function countForks(string $rKey)
    {
        if ($rKey) {
            $this->db->where('r_fork_r_key', $rKey);
            $this->db->where('r_status', COMMON_STATUS_NORMAL);
            return $this->db->count_all_results('repositories');
        }
        return 0;
    }

    public function countMergeRequests(string $rKey)
    {
        if ($rKey) {
            $this->db->select('mr_proceed_status as status, count(mr_key) as count');
            $this->db->where('mr_target_r_key', $rKey);
            $this->db->where('mr_status', COMMON_STATUS_NORMAL);
            $this->db->group_by('mr_proceed_status');
            $query = $this->db->get('merge_requests');
            $data = $query->result_array();

            $output = [
                'open' => 0,
                'merged' => 0,
                'closed' => 0,
                'all' => 0
            ];

            foreach ($data as $item) {
                if ($item['status'] == MergeRequestStatus::OPEN) {
                    $output['open'] = (int) $item['count'];
                } else if ($item['status'] == MergeRequestStatus::MERGED) {
                    $output['merged'] = (int) $item['count'];
                } else if ($item['status'] == MergeRequestStatus::CLOSED) {
                    $output['closed'] = (int) $item['count'];
                }
            }

            $output['all'] = $output['open'] + $output['merged'] + $output['closed'];
            return $output;
        }
        return FALSE;
    }

    public function execCommand(string $rKey, string $uKey, string $commandType, string $command = NULL)
    {
        if (!$rKey) {
            return FALSE;
        }

        if ($commandType != GIT_COMMAND_INIT && !$command) {
            return FALSE;
        }

        $userInfo = $this->userModel->get($uKey);

        if (!$userInfo) {
            return FALSE;
        }

        $repositoryInfo = $this->get($rKey);

        if (!$repositoryInfo) {
            return FALSE;
        }

        $storagePath = dirname(APPPATH) . '/git-storage';
        $repositoryPath = $storagePath . $repositoryInfo['r_path'];
        $name = explode('@', $userInfo['u_email'])[0];
        $email = $userInfo['u_email'];

        switch ($commandType) {
            case GIT_COMMAND_INIT:
                $commands = [
                    "mkdir {$repositoryPath}",
                    "cd {$repositoryPath}",
                    "git init --bare",
                    "rm -r hooks",
                    "ln -s ../hooks hooks",
                    "chmod -R 0777 {$repositoryPath}",
                ];
                break;
            case GIT_COMMAND_FORK:
                $commands = [
                    "mkdir {$repositoryPath}",
                    "cd {$repositoryPath}",
                    "git clone --bare {$command} .",
                    "git remote remove origin",
                    "rm -r hooks",
                    "ln -s ../hooks hooks",
                    "chmod -R 0777 {$repositoryPath}",
                ];
                break;
            case GIT_COMMAND_QUERY:
                $commands = [
                    "export GIT_COMMITTER_NAME={$name}",
                    "export GIT_COMMITTER_EMAIL={$email}",
                    "export GIT_AUTHOR_NAME={$name}",
                    "cd {$repositoryPath}",
                    "git {$command}",
                ];
                break;
            case GIT_COMMAND_DIFF_REMOTE:
                $nonce = UUID::getKey();
                list($localCommitHash, $remoteRKey, $remoteAccessURL, $remoteCommitHash) = explode(self::DELIMITER, $command);
                $remoteName = $remoteRKey . $nonce;
                $commands = [
                    "cd {$repositoryPath}",
                    "git remote add {$remoteName} {$remoteAccessURL}",
                    "git fetch -q {$remoteName}",
                    "git diff {$remoteCommitHash}...{$localCommitHash}",
                    "git remote remove {$remoteName}",
                    "git gc -q --prune=now",
                    "rm FETCH_HEAD",
                ];
                break;
            case GIT_COMMAND_LOG_REMOTE:
                $nonce = UUID::getKey();
                list($localCommitHash, $remoteRKey, $remoteAccessURL, $remoteCommitHash, $prettyPattern) = explode(self::DELIMITER, $command);
                $remoteName = $remoteRKey . $nonce;
                $commands = [
                    "cd {$repositoryPath}",
                    "git remote add {$remoteName} {$remoteAccessURL}",
                    "git fetch -q {$remoteName}",
                    "git log --cherry-pick --left-only {$localCommitHash}...{$remoteCommitHash} --pretty=\"{$prettyPattern}\"",
                    "git remote remove {$remoteName}",
                    "git gc -q --prune=now",
                    "rm FETCH_HEAD",
                ];
                break;
        }

        return Command::batch($commands);
    }

    public function getAccessURL(string $rKey, string $uKey)
    {
        $repositoryData = $this->get($rKey);
        $userInfo = $this->userModel->get($uKey);

        if ($repositoryData && $repositoryData['r_path'] && $userInfo) {
            return Helper::addBasicAuth(
                'http://127.0.0.1:27555' . $repositoryData['r_path'],
                $userInfo['u_email'],
                implode('|', [$userInfo['u_key'], $repositoryData['r_key']])
            );
        }

        return FALSE;
    }

    public function getMemberRole(string $rKey, string $uKey)
    {
        if ($rKey && $uKey) {
            // search owner
            $repositoryData = $this->get($rKey);

            if (!$repositoryData) {
                return UserAccessController::ROLE_NO_PERMISSION;
            }

            if ($repositoryData['u_key'] === $uKey) {
                return UserAccessController::ROLE_OWNER;
            }

            // search repository
            $this->db->where('r_key', $rKey);
            $this->db->where('u_key', $uKey);
            $this->db->where('rm_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('repository_members');
            $data = $query->row_array();

            if ((int) $data['rm_role']) {
                return (int) $data['rm_role'];
            }

            // search group
            return $this->groupModel->getMemberRole($repositoryData['g_key'], $uKey);
        }

        return UserAccessController::ROLE_NO_PERMISSION;
    }

    public function searchByName(string $name, string $gKey)
    {
        if ($name && $gKey) {
            $this->db->where('r_name', $name);
            $this->db->where('g_key', $gKey);
            $this->db->where('r_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('repositories');
            $data = $query->row_array();
            return $data;
        }

        return FALSE;
    }

    public function searchByDisplayName(string $displayName, string $gKey)
    {
        if ($displayName && $gKey) {
            $this->db->where('r_display_name', $displayName);
            $this->db->where('g_key', $gKey);
            $this->db->where('r_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('repositories');
            $data = $query->row_array();
            return $data;
        }

        return FALSE;
    }

    public function listActivities(string $rKey, int $category, string $keyword, int $page, int $pagesize)
    {
        switch ($category) {
            case ACTIVITY_CATEGORY_COMMIT:
                $this->db->where_in('a_type', [0x0401, 0x0402, 0x0501, 0x0502]);
                break;
            case ACTIVITY_CATEGORY_MERGE_REQUEST:
                $this->db->where('(a_type > 0x0700 AND a_type < 0x0800)');
                break;
            case ACTIVITY_CATEGORY_MEMBER:
                $this->db->where('(a_type < 0x0600 AND a_type != 0x0401 AND a_type != 0x0402 AND a_type != 0x0501 AND a_type != 0x0502 )');
                break;
            default:
                break;
        }

        if ($keyword) {
            $this->db->like('a_data', $keyword);
        }

        $offset = ($page - 1) * $pagesize;
        $this->db->where('a_relative_r_key', $rKey);
        $this->db->where('a_status', COMMON_STATUS_NORMAL);
        $this->db->limit($pagesize, $offset);
        $this->db->order_by('a_created', 'desc');
        $query = $this->db->get('activities');
        $data = $query->result_array();
        return $data;
    }

    public function listMergeRequestActivities(string $rKey, string $mrKey)
    {
        if (!$rKey || !$mrKey) {
            return FALSE;
        } else {
            $this->db->where('a_relative_r_key', $rKey);
            $this->db->where('a_relative_mr_key', $mrKey);
            $this->db->where('a_status', COMMON_STATUS_NORMAL);
            $this->db->order_by('a_created', 'desc');
            $query = $this->db->get('activities');
            $data = $query->result_array();
            return $data;
        }
    }

    public function listProtectedBranchRules(string $rKey)
    {
        if (!$rKey) {
            return FALSE;
        }

        $this->db->where('r_key', $rKey);
        $this->db->where('pbr_status', COMMON_STATUS_NORMAL);
        $this->db->order_by('pbr_updated', 'DESC');
        $data = $this->db->get('proteced_branch_rules');
        $data = $data->result_array();
        return $data;
    }

    public function getProtectedBranchRule(string $rKey, string $rule)
    {
        if (!$rKey || !$rule) {
            return FALSE;
        }

        $this->db->where('r_key', $rKey);
        $this->db->where('pbr_status', COMMON_STATUS_NORMAL);
        $this->db->where('pbr_rule', $rule);
        $this->db->limit(1);
        $data = $this->db->get('proteced_branch_rules');
        $data = $data->row_array();

        return $data;
    }

    public function createProtectedBranchRule(string $rKey, string $rule, int $rolePush, int $roleMerge)
    {
        if (!$rKey || !$rule || !$rolePush || !$roleMerge) {
            return FALSE;
        }

        $data = [
            'pbr_key' => UUID::getKey(),
            'r_key' => $rKey,
            'pbr_rule' => $rule,
            'pbr_push_min_role_id' => $rolePush,
            'pbr_merge_min_role_id' => $roleMerge
        ];

        $result = $this->db->insert('proteced_branch_rules', $data);
        return $result;
    }

    public function updateProtectedBranchRule(string $pbrKey, array $data)
    {
        if (!$pbrKey || !$data) {
            return FALSE;
        }

        $this->db->where('pbr_key', $pbrKey);
        $result = $this->db->update('proteced_branch_rules', $data);
        return $result;
    }

    public function searchByUKeyAndName(string $uKey, string $name)
    {
        if (!$uKey || !$name) {
            return FALSE;
        }

        $this->db->where('u_key', $uKey);
        $this->db->where('r_name', $name);
        $this->db->where('r_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('repositories');
        $data = $query->row_array();

        if ($data && $data['r_key']) {
            $this->store->set($data['r_key'], $data);
        }

        return $data;
    }

    public function create(string $displayName, string $name, string $description, string $gKey, string $uKey)
    {
        $insertData = [
            'r_key' => UUID::getKey(),
            'u_key' => $uKey,
            'g_key' => $gKey,
            'r_display_name' => $displayName,
            'r_name' => $name,
            'r_path' => '/' . UUID::getKey(),
            'r_description' => $description,
            'r_updated' => date('Y-m-d H:i:s'),
        ];

        $result = $this->db->insert('repositories', $insertData);

        if (!$result) {
            return FALSE;
        }

        $result = $this->execCommand($insertData['r_key'], $uKey, GIT_COMMAND_INIT);

        if (!$result) {
            $this->db->where('r_key', $insertData['r_key']);
            $this->db->delete('repositories');
            return FALSE;
        }

        return $insertData;
    }

    public function fork(string $displayName, string $name, string $description, string $targetGroupKey, string $uKey, string $sourceRepositoryKey)
    {
        $repositoryData = $this->get($sourceRepositoryKey);

        if (!$repositoryData) {
            return FALSE;
        }

        $insertData = [
            'r_key' => UUID::getKey(),
            'u_key' => $uKey,
            'g_key' => $targetGroupKey,
            'r_fork_r_key' => $repositoryData['r_key'],
            'r_display_name' => $displayName,
            'r_name' => $name,
            'r_path' => '/' . UUID::getKey(),
            'r_description' => $description,
            'r_avatar' => $repositoryData['r_avatar']
        ];

        $result = $this->db->insert('repositories', $insertData);

        if (!$result) {
            return FALSE;
        }

        $accessURL = $this->getAccessURL($sourceRepositoryKey, $uKey);

        if (!$accessURL) {
            $this->db->where('r_key', $insertData['r_key']);
            $this->db->delete('repositories');
            return FALSE;
        }

        $result = $this->execCommand($insertData['r_key'], $uKey, GIT_COMMAND_FORK, $accessURL);

        return $insertData;
    }

    public function update(string $rKey, array $updateData)
    {
        if (!$rKey || !$updateData) {
            return FALSE;
        } else {
            $this->db->where('r_key', $rKey);
            $this->db->update('repositories', $updateData);
        }
        return TRUE;
    }

    public function canBeFastForward(
        string $sourceRepositoryKey,
        string $sourceRepositoryCommitHash,
        string $targetRepositoryKey,
        string $targetRepositoryCommitHash,
        string $uKey
    ) {
        $targetHeadCommand = 'log --pretty="%H" -n1 ' . $targetRepositoryCommitHash;
        $targetHead = $this->execCommand($targetRepositoryKey, $uKey, GIT_COMMAND_QUERY, $targetHeadCommand);

        if ($targetHead) {
            $targetHead = trim($targetHead);

            $sourceLogCommand = 'log --pretty="%H" ' . $sourceRepositoryCommitHash;
            $sourceCommit = $this->execCommand($sourceRepositoryKey, $uKey, GIT_COMMAND_QUERY, $sourceLogCommand);
            $sourceCommitArray = explode("\n", $sourceCommit);

            foreach ($sourceCommitArray as $item) {
                if (trim($item) === $targetHead) {
                    return TRUE;
                }
            }
        }

        return FALSE;
    }

    /*
     * array | bool  mergeBranch
     *
     * 用来将 source 分支 合并到 target 分支
     * 由参数 $message 和 $usingSquash 是否传入决定合并方式
     *
     *  $message  $usingSquash  合并模式
     *  NULL      Any           Fast-Forward
     *  String    FALSE         Non-Fast-Forward
     *  String    TRUE          Squash
     *
     *  * 在使用 Fast-Forward 前 应调用 canBeFastForward 来判断当
     *  前合并是否可以使用 Fast-Forward 模式
     */
    public function mergeBranch(
        string $sourceRepositoryKey,
        string $sourceRepositoryBranchName,
        string $targetRepositoryKey,
        string $targetRepositoryBranchName,
        string $uKey,
        string $message = NULL,
        bool $usingSquash = FALSE
    ) {
        // get repository internal url
        $sourceRepositoryURL = $this->getAccessURL($sourceRepositoryKey, $uKey);
        $targetRepositoryURL = $this->getAccessURL($targetRepositoryKey, $uKey);

        // get userInfo
        $userInfo = $this->userModel->get($uKey);
        if (!$userInfo) {
            return FALSE;
        }
        $name =   Command::wrapArgument(explode('@', $userInfo['u_email'])[0]);
        $email = Command::wrapArgument($userInfo['u_email']);

        // create target repository workspace
        $workspace = Workspace::create();

        // clone target repository and checkout target branch
        $status = Command::runWithoutOutput([
            'cd', $workspace, '&&',
            'git', 'clone', '-b', $targetRepositoryBranchName, $targetRepositoryURL, '.'
        ]);

        if (!$status) {
            Workspace::delete($workspace);
            return FALSE;
        }

        // fetch source branch
        $status = Command::runWithoutOutput([
            'cd', $workspace, '&&',
            'git', 'remote', 'add', $sourceRepositoryKey, $sourceRepositoryURL, '&&',
            'git', 'fetch', $sourceRepositoryKey, $sourceRepositoryBranchName
        ]);

        if (!$status) {
            Workspace::delete($workspace);
            return FALSE;
        }

        // proceed merge
        $output = [];
        if ($message) {
            if ($usingSquash) {
                $status = Command::run([
                    'cd', $workspace, '&&',
                    'git', 'merge', '--squash', 'FETCH_HEAD', '&&',
                    'git', 'commit', '-m', Command::wrapArgument($message)
                ], $output, [
                    'GIT_COMMITTER_NAME' => $name,
                    'GIT_COMMITTER_EMAIL' => $email,
                    'GIT_AUTHOR_NAME' => $name,
                    'GIT_AUTHOR_EMAIL' => $email
                ]);
            } else {
                $status = Command::run([
                    'cd', $workspace, '&&',
                    'git', 'merge', '--no-ff', '-m', Command::wrapArgument($message), 'FETCH_HEAD'
                ], $output, [
                    'GIT_COMMITTER_NAME' => $name,
                    'GIT_COMMITTER_EMAIL' => $email,
                    'GIT_AUTHOR_NAME' => $name,
                    'GIT_AUTHOR_EMAIL' => $email
                ]);
            }
        } else {
            $status = Command::run([
                'cd', $workspace, '&&',
                'git', 'merge', 'FETCH_HEAD'
            ], $output);
        }

        if (!$status) {
            Workspace::delete($workspace);
            return $output;
        }

        // push to tareget repository
        $status = Command::runWithoutOutput([
            'cd', $workspace, '&&',
            'git', 'push', 'origin', $targetRepositoryBranchName
        ]);

        if (!$status) {
            Workspace::delete($workspace);
            return FALSE;
        }

        // remove workspace
        Workspace::delete($workspace);

        // return merge result
        return $output;
    }

    // sourceBranchName 可以是 有效的 分支名， tag名， commitHash
    public function createBranch(
        string $branchName,
        string $rKey,
        string $sourceBranchName,
        string $uKey
    ) {
        if (!$uKey || !$uKey || !$branchName || !$sourceBranchName) {
            return FALSE;
        }

        $command = GitCommand::createBranch($branchName, $sourceBranchName);
        if (!$command) {
            return FALSE;
        }

        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        return !!$result;
    }

    public function deleteBranch($rKey, $uKey, $branch)
    {
        if (!$rKey || !$uKey || !$branch) {
            return FALSE;
        }

        $command = GitCommand::deleteBranch($branch);
        if (!$command) {
            return FALSE;
        }

        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        $pattern = '/^Deleted\sbranch.+$/';
        preg_match($pattern, $result, $matchResult);

        if ($matchResult) {
            return TRUE;
        } else {
            return FALSE;
        }
    }

    public function getMergeRequestByKey(string $mrKey)
    {
        if (!$mrKey) {
            return FALSE;
        }

        $this->db->where('mr_key', $mrKey);
        $this->db->where('mr_status', COMMON_STATUS_NORMAL);
        $data = $this->db->get('merge_requests');
        $data = $data->row_array();
        $data = $this->normalizeMergeRequest($data);

        return $data;
    }

    public function isMergeRequestExist(string $sourceRKey, string $sourceBranch, string $targetRKey, string $targetBranch)
    {
        if (!$sourceRKey || !$sourceBranch || !$targetRKey || !$targetBranch) {
            return TRUE;
        }

        $this->db->where('mr_source_r_key', $sourceRKey);
        $this->db->where('mr_source_branch', $sourceBranch);
        $this->db->where('mr_target_r_key', $targetRKey);
        $this->db->where('mr_target_branch', $targetBranch);
        $this->db->where('mr_proceed_status', MergeRequestStatus::OPEN);
        $this->db->where('mr_status', COMMON_STATUS_NORMAL);
        $this->db->limit(1);
        $result = $this->db->get('merge_requests');
        $result = $result->row_array();
        return !!$result;
    }

    public function getMergeRequestVersionList(string $uKey, string $mrKey)
    {
        if (!$uKey || !$mrKey) {
            return false;
        }

        $this->db->where('mr_key', $mrKey);
        $query = $this->db->get('merge_requests');
        $mergeRequest = $query->row_array();
        $initVersionHash = $mergeRequest['mr_start_hash'];
        $sourceRepositoryKey = $mergeRequest['mr_source_r_key'];
        $sourceBranch = $mergeRequest['mr_source_branch'];
        $command = GitCommand::getCommitInfoByHash($initVersionHash);
        if (!$command) {
            return FALSE;
        }
        $delimiter = Helper::getDelimiter() . "\n";
        $initCommit = $this->execCommand($sourceRepositoryKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (strlen($initCommit)) {
            $initCommit = explode($delimiter, rtrim($initCommit, $delimiter));
        } else {
            return [];
        }

        $sourceLastCommit = $this->repositoryModel->getLastCommit($sourceRepositoryKey, $uKey, $sourceBranch, '');
        $sourceLastHash = $sourceLastCommit['sha'];
        $command = GitCommand::getRevisionRange($initVersionHash, $sourceLastHash, $sourceBranch);

        if (!$command) {
            return FALSE;
        }
        $delimiter = Helper::getDelimiter() . "\n";
        $commits = $this->execCommand($sourceRepositoryKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (strlen($commits)) {
            $commits = explode($delimiter, rtrim($commits, $delimiter));
            array_push($commits, $initCommit[0]);
        } else {
            $commits = [];
            $commits[] = $sourceLastCommit;
            return $commits;
        }

        foreach ($commits as &$commit) {
            $commit = $this->_logStringToArray($commit);
        }

        return $commits;
    }

    public function getMergeRequestLastCommitSha(string $uKey, string $mrKey, string $sourceRKey, string $sourceBranch, string $targetRKey, string $targetBranch)
    {
        if ($mrKey) {
            $mergeRequest = $this->getMergeRequestByKey($mrKey);

            if (!$mergeRequest) {
                return FALSE;
            }
            $sourceObject = $mergeRequest['sourceObject'];
            $targetObject = $mergeRequest['targetObject'];
        }

        if (!$sourceObject || !$targetObject) {
            $sourceCommit = $this->getLastCommit($sourceRKey, $uKey, $sourceBranch, '');
            $targetCommit = $this->getLastCommit($targetRKey, $uKey, $targetBranch, '');
            if (!$sourceCommit || !$targetCommit) {
                return FALSE;
            }
            $sourceObject = $sourceCommit['sha'];
            $targetObject = $targetCommit['sha'];
        }

        return [$sourceObject, $targetObject];
    }

    public function getMergeRequests(
        array $conditions,
        string $sort,
        int $page,
        int $pagesize = 20
    ) {
        foreach ($conditions as $key => $condition) {
            if (is_array($condition)) {
                $this->db->where_in($key, $condition);
            } else {
                if ($condition) {
                    if (substr($key, 0, 1) === '~') {
                        $fields = substr($key, 1);
                        $fieldArr = explode('|', $fields);
                        $keywordSearch = '';
                        $condition = $this->db->escape_str($condition);
                        foreach ($fieldArr as $subKey => $field) {
                            if ($subKey == count($fieldArr) - 1) {
                                $keywordSearch .= "`$field` like '%{$condition}%'";
                            } else {
                                $keywordSearch .= "`$field` like '%{$condition}%' OR ";
                            }
                        }
                        $this->db->where('(' . $keywordSearch . ')');
                    } else {
                        $this->db->where($key, $condition);
                    }
                }
            }
        }
        $offset = ($page - 1) * $pagesize;
        $this->db->limit($pagesize, $offset);
        $this->db->order_by('mr_updated', $sort);
        $query = $this->db->get('merge_requests');
        $data = $query->result_array();

        return $data;
    }

    public function mergeRequestClose(string $uKey, string $mrKey, array $mergeRequest = [])
    {
        if (!$uKey || !$mrKey) {
            return FALSE;
        }

        if (!$mergeRequest) {
            $mergeRequest = $this->getMergeRequestByKey($mrKey);
        }

        $sourceCommit = $this->getLastCommit($mergeRequest['sourceRepository'], $uKey, $mergeRequest['sourceBranch'], '');
        $targetCommit = $this->getLastCommit($mergeRequest['targetRepository'], $uKey, $mergeRequest['targetBranch'], '');
        if (!$sourceCommit || !$targetCommit) {
            return FALSE;
        }

        $sourceSha = $sourceCommit['sha'];
        $targetSha = $targetCommit['sha'];

        $this->db->set('mr_merge_u_key', $uKey);
        $this->db->set('mr_source_merged_hash', $sourceSha);
        $this->db->set('mr_target_merged_hash', $targetSha);
        $this->db->set('mr_close_time', date('Y-m-d H:i:s'));
        $this->db->set('mr_proceed_status', MergeRequestStatus::CLOSED);
        $this->db->where('mr_key', $mrKey);

        return $this->db->update('merge_requests');
    }

    public function getFileSize(string $rKey, string $uKey, string $object)
    {
        if (!$rKey || !$uKey || !$object) {
            return FALSE;
        }

        $command = GitCommand::getObjectSize($object);
        if (!$command) {
            return FALSE;
        }

        $fileSize = (int) $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        return $fileSize;
    }

    public function catObject(string $rKey, string $uKey, string $parent)
    {
        if (!$rKey || !$uKey || !$parent) {
            return FALSE;
        }

        $object = $parent;

        $command = GitCommand::getObjectType($parent);
        $objectType = trim($this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command));

        if (!$objectType) {
            return FALSE;
        }

        if (in_array($objectType, ['commit', 'tag'])) {
            $object = $object . '^{tree}';
        }

        if ($objectType === 'blob') {
            $command = GitCommand::getObjectSize($object);
            $size = (int) $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
            if ($size > MAX_DISPLAY_FILE_SIZE) {
                return [$objectType, NULL, $size];
            }
        }

        $command = GitCommand::catObject($object);
        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

        if ($objectType !== 'blob') {
            $result = Helper::parseTable(
                $result,
                '/^(\d+)\s+(commit|tag|tree|blob)\s+([0-9a-f]{40})\t(.*)$/i',
                ['mode', 'type', 'object', 'name']
            );
        } else {
            return [$objectType, $result, $size];
        }

        return [$objectType, $result, -1];
    }

    public function getBlameInfo(string $rKey, string $uKey, string $revision, string $filepath)
    {
        // get repository internal url
        $repositoryURL = $this->getAccessURL($rKey, $uKey);

        if (!$repositoryURL) {
            return FALSE;
        }

        $revision = Command::wrapArgument($revision);
        $filepath = Command::wrapArgument($filepath);

        // create target repository workspace
        $workspace = Workspace::create();

        // clone target repository
        $status = Command::runWithoutOutput([
            'cd', $workspace, '&&',
            'git', 'clone', $repositoryURL, '.'
        ]);

        if (!$status) {
            Workspace::delete($workspace);
            return FALSE;
        }

        $output = [];
        $status = Command::run([
            'cd', $workspace, '&&',
            'git', 'checkout', $revision, '&&',
            'git', 'blame', '-p', $revision, $filepath
        ], $output);

        if (!$status) {
            Workspace::delete($workspace);
            return FALSE;
        }

        Workspace::delete($workspace);

        $output = Helper::parseBlameData($output);

        // return merge result
        return $output;
    }

    public function addLastCommitToObjectList(string $rKey, string $uKey, string $ref, string $path, array $objects)
    {
        foreach ($objects as &$object) {
            $object['commit'] = $this->getLastCommit($rKey, $uKey, $ref, $path ? $path . '/' . $object['name'] : $object['name']);
        }

        return $objects;
    }

    public function getLastCommit(string $rKey, string $uKey, string $branch, string $filePath, string $lastSha = '')
    {
        if (!$rKey || !$uKey || !$branch) {
            return FALSE;
        }

        $command = GitCommand::getLastLog($branch, $filePath, $lastSha);
        if (!$command) {
            return FALSE;
        }

        $branch = Command::wrapArgument($branch);
        $filePath = Command::wrapArgument($filePath);

        $log = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        $log = rtrim($log, Helper::getDelimiter() . "\n");
        $log = $this->_logStringToArray($log);

        return $this->normalizeCommits([$log])[0];
    }

    private function _logStringToArray($log)
    {
        if (!$log) {
            return [];
        }

        $search = array("\r", "\n", "\t", '\\', '"');
        $replace = array('\r', '\n', '\t', '\\\\', '\"');
        $log = str_replace($search, $replace, $log);

        return Helper::parseJSON($log, Helper::getDelimiter());
    }

    public function getCommitCount(string $rKey, string $uKey, string $branch)
    {
        if (!$rKey || !$uKey || !$branch) {
            return FALSE;
        }

        $command = GitCommand::getCommitCount($branch);
        if (!$command) {
            return FALSE;
        }

        $commitCount = (int) $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

        return $commitCount;
    }

    public function getBranchCount(string $rKey, string $uKey)
    {
        if (!$rKey || !$uKey) {
            return FALSE;
        }

        $branchList = $this->getBranchList($rKey, $uKey);
        if (!$branchList) {
            return FALSE;
        }

        $branchCount = count($branchList);

        return $branchCount;
    }

    public function getBranchList(string $rKey, string $uKey)
    {
        if (!$rKey || !$uKey) {
            return [];
        }

        $command = GitCommand::getBranchList();
        if (!$command) {
            return [];
        }

        $branchList = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (!$branchList) {
            return [];
        }

        $matches = [];
        if (preg_match_all('/^\*?\s+(.*)$/m', $branchList, $matches)) {
            return $matches[1];
        }

        return [];
    }

    public function getTagCount(string $rKey, string $uKey)
    {
        if (!$rKey || !$uKey) {
            return FALSE;
        }

        $tagList = $this->getTagList($rKey, $uKey);
        if (!$tagList) {
            return FALSE;
        }

        $tagCount = count($tagList);

        return $tagCount;
    }

    public function getObjectsCount(string $rKey, string $uKey)
    {
        if (!$rKey || !$uKey) {
            return FALSE;
        }

        $command = GitCommand::getCountObjects();
        if (!$command) {
            return FALSE;
        }

        $countObjests = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

        $data = FALSE;
        $matches = [];
        if (preg_match_all('/([\w\-]+)\:\s+(\d+)$/m', $countObjests, $matches)) {
            $data = [];
            foreach ($matches[1] as $index => $item) {
                $data[$item] = (int) $matches[2][$index];
            }
        }

        return $data;
    }

    public function getCommits(string $rKey, string $uKey, string $revision, string $path = '', string $keyword = '', int $page = 1, int $perpage = 1)
    {
        if (!$rKey || !$uKey || !$revision) {
            return FALSE;
        }

        // check branch exsit
        $revisionList = array_merge($this->getBranchList($rKey, $uKey), $this->getTagList($rKey, $uKey));
        if (!in_array($revision, $revisionList) && preg_match('/^[a-z0-9]{8}$/', $revision) == 0) {
            return [];
        }

        $command = GitCommand::getCommitList($revision, $path, $keyword, $page, $perpage);
        if (!$command) {
            return FALSE;
        }

        $delimiter = Helper::getDelimiter() . "\n";
        $commits = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (strlen($commits)) {
            $commits = explode($delimiter, rtrim($commits, $delimiter));
        } else {
            return [];
        }

        foreach ($commits as &$commit) {
            $commit = $this->_logStringToArray($commit);
        }

        return $commits;
    }

    public function getBranches(string $rKey, string $uKey)
    {
        if (!$rKey || !$uKey) {
            return [];
        }

        $branchList = $this->getBranchList($rKey, $uKey);
        if (!$branchList) {
            return [];
        }

        $branchList = $this->normalizeBranches($branchList);
        $this->getBranchListInfo($rKey, $uKey, $branchList);
        $this->isProtected($rKey, $uKey, $branchList);

        return $branchList;
    }

    public function getBranchListInfo(string $rKey, string $uKey, array &$branchList)
    {
        if (!$rKey || !$uKey || !count($branchList)) {
            return FALSE;
        }

        $repository = $this->get($rKey);
        if (!$repository) {
            return FALSE;
        }

        foreach ($branchList as &$branch) {
            $command = GitCommand::getCommitList($branch['name'], '', '', 1, 1);
            $commit = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

            $command = GitCommand::getBranchCompare($repository['r_default_branch_name'] ?: 'master', $branch['name']);
            $commitsCount = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

            $commit = rtrim($commit, Helper::getDelimiter());
            $commit = $this->_logStringToArray($commit);
            $branch['commit'] = $this->normalizeCommits([$commit])[0];
            $branch['isMerge'] = (int) $commitsCount == 0;
        }

        return TRUE;
    }

    public function isProtected(string $rKey, string $uKey, array &$branchList)
    {
        if (!$rKey || !$uKey || !count($branchList)) {
            return FALSE;
        }

        $rules = $this->listProtectedBranchRules($rKey);
        foreach ($branchList as &$branch) {
            $branch['protected'] = FALSE;
            foreach ($rules as $rule) {
                if (preg_match('/^\/\^?([^\^\$\/]|\\/){1,30}\$?\/[igm]*$/', $rule['pbr_rule']) > 0) {
                    if (preg_match($rule['pbr_rule'], $branch['id']) > 0) {
                        $branch['protected'] = TRUE;
                        break;
                    }
                } else {
                    if ($branch['id'] === $rule['pbr_rule']) {
                        $branch['protected'] = TRUE;
                        break;
                    }
                }
            }
        }
    }

    public function isMerged(string $rKey, string $uKey, string $branch)
    {
        if (!$branch || !$rKey || $uKey) {
            return FALSE;
        }

        $repository = $this->get($rKey);
        if (!$repository) {
            return FALSE;
        }

        $command = GitCommand::getBranchCompare($repository['r_default_branch_name'] ?: 'master', $branch);
        if (!$command) {
            return FALSE;
        }

        $commitsCount = (int) $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

        return !$commitsCount;
    }

    public function getCommitDetail(string $rKey, string $uKey, string $commitSHA)
    {
        if (!$rKey || !$uKey || !$commitSHA) {
            return FALSE;
        }

        $command = GitCommand::getCommitLog($commitSHA);
        if (!$command) {
            return FALSE;
        }

        $commitLog = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        $commitLog = rtrim($commitLog, "\n");
        $commitLog = $this->_logStringToArray($commitLog);

        return $commitLog;
    }

    public function getTagList($rKey, $uKey)
    {
        if (!$rKey || !$uKey) {
            return [];
        }

        $command = GitCommand::getTagList();

        if (!$command) {
            return [];
        }

        $tagList = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (!$tagList) {
            return [];
        }

        $matches = [];
        if (preg_match_all('/^(.+)$/m', $tagList, $matches)) {
            return $matches[1];
        }

        return [];
    }

    public function getTags(string $rKey, string $uKey)
    {
        if (!$rKey || !$uKey) {
            return [];
        }

        $tagList = $this->getTagList($rKey, $uKey);
        if (!$tagList) {
            return [];
        }

        $tagList = $this->normalizeTags($tagList);
        foreach ($tagList as &$tag) {
            $this->getTagDetail($rKey, $uKey, $tag);
        }

        return $tagList;
    }

    public function getTagDetail($rKey, $uKey, &$tag)
    {
        if (!$rKey || !$uKey || !$tag['name']) {
            return FALSE;
        }

        $command = GitCommand::showTagCommit($tag['name']);
        if (!$command) {
            return FALSE;
        }

        $detail = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (!$detail) {
            return FALSE;
        }

        $delimiter = Helper::getDelimiter();
        $dl = strlen($delimiter);
        $indexF = strpos($detail, $delimiter);
        $indexL = strrpos($detail, $delimiter);

        if ($indexL > $indexF) {
            $message = substr($detail, 0, $indexF);
            if ($message) {
                $messages = explode("\n", $message);
                $tag['detail'] = implode(' ', array_slice($messages, 3));
            }
            $tag['commit'] = $this->normalizeCommits([$this->_logStringToArray(substr($detail, $indexF + $dl, $indexL - $dl - $indexF))])[0];
        }

        return TRUE;
    }

    public function createTag(string $rKey, string $uKey, string $tag, string $description = NULL, string $commitSHA = NULL)
    {
        if (!$rKey || !$uKey || !$tag) {
            return FALSE;
        }

        $command = GitCommand::createTag($tag, $description, $commitSHA);
        if (!$command) {
            $result = FALSE;
        }

        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        return !!$result;
    }

    public function deleteTag($rKey, $uKey, $tagName)
    {
        if (!$rKey || !$uKey) {
            return FALSE;
        }

        $command = GitCommand::deleteTag($tagName);

        if (!$command) {
            return FALSE;
        }

        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

        $pattern = '/^Deleted\stag.+$/';

        preg_match($pattern, $result, $matchResult);

        if ($matchResult) {
            return TRUE;
        } else {
            return FALSE;
        }
    }

    public function getDiffWithRemote(
        string $localRkey,
        string $localCommitHash,
        string $remoteRkey,
        string $remoteCommitHash,
        string $uKey
    ) {
        if (!$localRkey || !$localCommitHash || !$remoteRkey || !$uKey || !$remoteCommitHash) {
            return FALSE;
        }
        $accessURL = $this->getAccessURL($remoteRkey, $uKey);
        $accessURL = implode(self::DELIMITER, [$accessURL, $remoteCommitHash]);
        $command = implode(self::DELIMITER, [$localCommitHash, $remoteRkey, $accessURL]);

        if (!$command) {
            return FALSE;
        }

        $result = $this->execCommand($localRkey, $uKey, GIT_COMMAND_DIFF_REMOTE, $command);
        return $result;
    }

    public function getCommitWithLocal(
        string $rKey,
        string $sourceCommitHash,
        string $targetCommitHash,
        string $uKey
    ) {
        if (!$rKey || !$targetCommitHash || !$sourceCommitHash || !$uKey) {
            return FALSE;
        }

        $command = GitCommand::getCommitListFromLocal($targetCommitHash, $sourceCommitHash);

        if (!$command) {
            return FALSE;
        }
        $delimiter = Helper::getDelimiter() . "\n";
        $commits = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (strlen($commits)) {
            $commits = explode($delimiter, rtrim($commits, $delimiter));
        } else {
            return [];
        }

        foreach ($commits as &$commit) {
            $commit = $this->_logStringToArray($commit);
        }

        return $commits;
    }

    public function getCommitWithRemote(
        string $localRkey,
        string $localCommitHash,
        string $remoteRkey,
        string $remoteCommitHash,
        string $uKey
    ) {
        if (!$localRkey || !$localCommitHash || !$remoteRkey || !$uKey || !$remoteCommitHash) {
            return FALSE;
        }

        $accessURL = $this->getAccessURL($remoteRkey, $uKey);

        $command = GitCommand::getCommitListFromRemote($localCommitHash, $remoteRkey, $accessURL, $remoteCommitHash);

        if (!$command) {
            return FALSE;
        }

        $delimiter = Helper::getDelimiter() . "\n";
        $commits = $this->execCommand($localRkey, $uKey, GIT_COMMAND_LOG_REMOTE, $command);

        if (strlen($commits)) {
            $commits = explode($delimiter, rtrim($commits, $delimiter));
        } else {
            return [];
        }

        foreach ($commits as &$commit) {
            $commit = $this->_logStringToArray($commit);
        }

        return $commits;
    }

    public function getDiffWithLocalCount(string $rKey, string $uKey, string $parentCommitHash, string $currentCommitHash)
    {
        if (!$parentCommitHash || !$currentCommitHash || !$uKey || !$rKey) {
            return FALSE;
        }
        $command = GitCommand::getDiffCount($parentCommitHash, $currentCommitHash);
        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        $count = count(explode("\n", $result));
        if (preg_match('/^0+$/i', $parentCommitHash)) {
            $count = $count - 2;
        }

        return $count;
    }

    public function getDiffWithLocal(string $rKey, string $uKey, string $parentCommitHash, string $currentCommitHash)
    {
        if (!$parentCommitHash || !$currentCommitHash || !$uKey || !$rKey) {
            return FALSE;
        }
        $command = GitCommand::getDiffDetail($parentCommitHash, $currentCommitHash);
        $result = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        return $result;
    }

    public function getBranchListBySHA1(string $rKey, string $uKey, string $commitHash)
    {
        if (!$rKey || !$uKey || !$commitHash) {
            return FALSE;
        }

        $command = GitCommand::getBranchListBySHA($commitHash);
        if (!$command) {
            return [];
        }
        $branchList = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);

        if (!$branchList) {
            return [];
        }
        $matches = [];
        if (preg_match_all('/^\*?\s+(.*)$/m', $branchList, $matches)) {
            return $matches[1];
        }
        return [];
    }

    public function getTagListBySHA1(string $rKey, string $uKey, string $commitHash)
    {
        if (!$rKey || !$uKey || !$commitHash) {
            return FALSE;
        }
        $command = GitCommand::getTagListBySHA($commitHash);
        if (!$command) {
            return [];
        }
        $tagList = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        if (!$tagList) {
            return [];
        }
        $tagList = explode("\n", $tagList);
        foreach ($tagList as $index => $tag) {
            if (!strlen($tag)) {
                unset($tagList[$index]);
            }
        }
        if ($tagList) {
            return $tagList;
        }
        return [];
    }

    public function getChangedFileList(string $rKey, string $uKey, string $commitHash)
    {
        if (!$rKey || !$uKey || !$commitHash) {
            return FALSE;
        }
        $command = GitCommand::getChangedFileList($commitHash);
        if (!$command) {
            return [];
        }
        $changedFileListString = $this->execCommand($rKey, $uKey, GIT_COMMAND_QUERY, $command);
        $changedFileList = explode("\n", $changedFileListString);
        if (!$changedFileList) {
            return [];
        }
        return $changedFileList;
    }

    public function checkBranchProteced(string $rKey, string $uKey, string $ref, bool $isProtectMerge)
    {
        $roleID = $this->getMemberRole($rKey, $uKey);

        if ($roleID < UserAccessController::ROLE_DEVELOPER) {
            return TRUE;
        }

        $this->db->where('r_key', $rKey);
        $this->db->where('pbr_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('proteced_branch_rules');
        $rules = $query->result_array();

        foreach ($rules as $rule) {
            $matchFlag = FALSE;
            if (preg_match('/^\/(.*)\/[igm]*$/', $rule['pbr_rule'])) {
                if (preg_match($rule['pbr_rule'], $ref)) {
                    $matchFlag = TRUE;
                }
            } else {
                if ($rule['pbr_rule'] === $ref) {
                    $matchFlag = TRUE;
                }
            }

            if ($matchFlag) {
                $minimumRoleRequire = UserAccessController::ROLE_NO_BODY;
                if ($isProtectMerge) {
                    $minimumRoleRequire = (int) $rule['pbr_merge_min_role_id'];
                } else {
                    $minimumRoleRequire = (int) $rule['pbr_push_min_role_id'];
                }

                if ($roleID < $minimumRoleRequire) {
                    return TRUE;
                }
            }
        }

        return FALSE;
    }

    public function getRepositoryList(string $keyword, string $sort, int $page, int $pagesize, bool $count)
    {
        $this->db->from('repositories');

        $keyword && $this->db->like('r_display_name', $keyword);
        $this->db->where('r_status', COMMON_STATUS_NORMAL);

        if ($count) {
            return $this->db->count_all_results();
        }

        $sort && $this->db->order_by($sort, 'DESC');
        $this->db->limit($pagesize, ($page - 1) * $pagesize);
        $query = $this->db->get();
        $repositoryList = $query->result_array();

        return $repositoryList;
    }

    public function getMembers(string $rKey)
    {
        if (!$rKey) {
            return FALSE;
        }

        $repository = $this->get($rKey);

        if (!$repository) {
            return FALSE;
        }

        $groupMembers = $this->groupModel->getMembers($repository['g_key']);

        $repositoryMembers = $this->repositoryModel->listMembers($repository['r_key']);
        $repositoryMembers = $this->repositoryModel->normalizeMembers($repositoryMembers);
        $repositoryCreator = $this->repositoryModel->normalizeCreator($repository['r_key']);

        $members = array_merge($groupMembers, $repositoryMembers, [$repositoryCreator]);
        $members = Helper::getUniqueMemberList($members, 'id');

        return $members;
    }

    public function normalizeWebhooks(array $list)
    {
        $output = [];
        if (!$list) {
            return [];
        }
        foreach ($list as $item) {
            array_push($output, [
                'id' => $item['rw_key'],
                'user' => $item['u_name'],
                'url' => $item['rw_url'],
                'secret' => $item['rw_secret'],
                'events' => $item['rw_events'],
                'active' => $item['rw_active'],
                'updated' => (int) strtotime($item['rw_updated'])
            ]);
        }
        return $output;
    }

    public function getWebhook(string $rwKey) {
        $this->db->where('rw_key', $rwKey);
        $query = $this->db->get('repository_webhooks');

        return $query->row_array();
    }

    public function getWebhooks (string $rKey) {
        $this->db->select('rw.*, u.u_name');
        $this->db->from('repository_webhooks AS rw');
        $this->db->join('users AS u', 'rw.u_key = u.u_key', 'left');
        $this->db->where('rw.r_key', $rKey);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function createWebhook (array $data)
    {
        if (!$data['u_key'] || !$data['r_key'] || !$data['rw_url'] || !$data['rw_events']) {
            return FALSE;
        }

        $data['rw_key'] = UUID::getKey();
        $data['rw_updated'] = date('Y-m-d H:i:s');
        $this->db->insert('repository_webhooks', $data);

        return $data['rw_key'];
    }

    public function updateWebhook(string $rwKey, array $data)
    {
        if (!$rwKey || !$data['rw_url'] || !$data['rw_events']) {
            return FALSE;
        }

        $data['rw_updated'] = date('Y-m-d H:i:s');

        $this->db->where('rw_key', $rwKey);
        $this->db->update('repository_webhooks', $data);

        return $rwKey;
    }

    public function deleteWebhook (string $rwKey)
    {
        if (!$rwKey) {
            return false;
        }

        $this->db->where('rw_key', $rwKey);
        $this->db->delete('repository_webhooks');

        return $rwKey;
    }

    public function deleteWebhookEventsByRwKey (string $rwKey)
    {
        if (!$rwKey) {
            return false;
        }
        $this->db->where('rw_key', $rwKey);
        $this->db->delete('repository_webhook_events');

        return true;
    }

    public function deleteWebhookLogsByRwKey (string $rwKey)
    {
        if (!$rwKey) {
            return false;
        }
        $this->db->where('rw_key', $rwKey);
        $this->db->delete('repository_webhook_logs');

        return true;
    }

    public function addRepositoryWebhookEvent(string $uKey, string $rKey, string $eventType, string $data)
    {
        if (!$uKey || !$rKey || !$eventType || !$data) {
            return FALSE;
        }

        $webhooks = $this->getRepositoryWebhooks($rKey);
        if (!$webhooks) {
            return FALSE;
        }

        foreach ($webhooks as $webhook) {
            $eventTypes = explode(',', $webhook['rw_events']);

            if (!in_array($eventType, $eventTypes)) {
                continue;
            }

            $this->db->insert('repository_webhook_events', [
                'rwe_key' => UUID::getKey(),
                'rwe_user' => $uKey,
                'rw_key' => $webhook['rw_key'],
                'rwe_type' => $eventType,
                'rwe_data' => $data,
            ]);
        }

        return TRUE;
    }

    public function getRepositoryWebhooks(string $rKey)
    {
        if (!$rKey) {
            return FALSE;
        }

        $this->db->where('r_key', $rKey);
        $query = $this->db->get('repository_webhooks');
        $webhooks = $query->result_array();

        return $webhooks;
    }

    public function getRepositoryWebhookEvents()
    {
        $this->db->from('repository_webhook_events AS rwe');
        $this->db->join('repository_webhooks AS rw', 'rwe.rw_key = rw.rw_key', 'LEFT');
        $this->db->where('rw_active', GLOBAL_TRUE);
        $query = $this->db->get();
        $events = $query->result_array();

        return $events;
    }

    public function deleteRepositoryWebhookEvent(string $rweKey)
    {
        if (!$rweKey) {
            return FALSE;
        }

        $this->db->where('rwe_key', $rweKey);
        $this->db->delete('repository_webhook_events');

        return TRUE;
    }

    public function addRepositoryWebhookLog(array $data)
    {
        if (!$data) {
            return FALSE;
        }

        $this->db->insert('repository_webhook_logs', $data);

        return TRUE;
    }

    public function normalizeRepositoryWebhookLogData(array $data)
    {
        return [
            'request' => json_decode($data['rwl_request']),
            'response' => json_decode($data['rwl_response']),
        ];
    }

    public function getRepositoryWebhookLogData(string $rwlId)
    {
        if (!$rwlId) {
            return FALSE;
        }

        $this->db->where('rwl_id', $rwlId);
        $query = $this->db->get('repository_webhook_logs');
        $log = $query->row_array();

        return $log;
    }

    public function normalizeRepositoryWebhookLogs(array $list)
    {
        $final = [];
        foreach ($list as $item) {
            array_push($final, [
                'id' => $item['rwl_id'],
                'webhook' => $item['rw_key'],
                'start' => (float) $item['rwl_start'],
                'end' => (float) $item['rwl_end'],
                'status' => (int) $item['rwl_status'],
                'success' => $item['rwl_status'] == 200,
                'created' => $item['rwl_created'],
            ]);
        }

        return $final;
    }

    public function getRepositoryWebhookLogs(string $rwKey)
    {
        if (!$rwKey) {
            return FALSE;
        }

        $this->db->select('rwl_id, rw_key, rwl_start, rwl_end, rwl_status, rwl_created');
        $this->db->where('rw_key', $rwKey);
        $this->db->order_by('rwl_created', 'DESC');
        $query = $this->db->get('repository_webhook_logs');
        $logs = $query->result_array();

        return $logs;
    }
}
