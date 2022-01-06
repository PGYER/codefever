<?php

use service\CacheData\Store;
use service\Utility\UUID;
use service\Utility\Helper;
use service\AccessControl\UserAccessController;

class Group_model extends CI_Model
{
    private $store = NULL;

    function __construct()
    {
        parent::__construct();
        $this->store = new Store();
    }

    public function normalize(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            array_push($output, [
                'id' => $item['g_key'],
                'icon' => $item['g_avatar'],
                'displayName' => $item['g_display_name'],
                'name' => $item['g_name'],
                'description' => $item['g_description'],
                'owner' => $item['u_key'],
                'type' => (int) $item['g_type'],
                'created' => (int) strtotime($item['g_created']),
                'updated' => (int) strtotime($item['g_updated']),
                'status' => (int) $item['g_status'],
            ]);
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
            $data['role'] = $item['gm_role'];
            $data['joined'] = strtotime($item['gm_created']);
            $data['groupMember'] = TRUE;
            $data['creatorFlag'] = FALSE;
            $data['deleteFlag'] = !($item['gm_status'] == COMMON_STATUS_NORMAL);
            array_push($output, $data);
        }

        return $output;
    }

    public function normalizeCreator(string $gKey)
    {
        $data = [];

        $groupData = $this->get($gKey);
        $userData = $this->userModel->get($groupData['u_key']);
        $data = $this->userModel->normalize([$userData])[0];
        $data['role'] = UserAccessController::ROLE_OWNER;
        $data['joined'] = strtotime($groupData['g_created']);
        $data['groupMember'] = TRUE;
        $data['creatorFlag'] = TRUE;
        $data['deleteFlag'] = FALSE;

        return $data;
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

    public function get(string $gKey)
    {
        if ($this->store->exsit($gKey)) {
            return $this->store->get($gKey);
        } else {
            $this->db->where('g_key', $gKey);
            $this->db->where('g_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('groups');
            $data = $query->row_array();

            if ($data) {
                $this->store->set($gKey, $data);
                return $data;
            }
        }

        return FALSE;
    }

    public function listMembers(string $gKey)
    {
        $this->db->where('g_key', $gKey);
        $query = $this->db->get('group_members');
        return $query->result_array();
    }

    public function list(string $uKey)
    {
        $this->db->where('u_key', $uKey);
        $this->db->where('g_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('groups');
        return $query->result_array();
    }

    public function listJoined(string $uKey)
    {
        $this->db->select('groups.*');
        $this->db->join('group_members', 'group_members.g_key=groups.g_key', 'left');
        $this->db->where('group_members.u_key', $uKey);
        $this->db->where('gm_status', COMMON_STATUS_NORMAL);
        $this->db->where('g_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('groups');
        return $query->result_array();
    }

    public function getMemberRole(string $gKey, string $uKey)
    {
        if ($gKey && $uKey) {
            // search owner
            $groupData = $this->get($gKey);

            if ($groupData['u_key'] === $uKey) {
                return UserAccessController::ROLE_OWNER;
            }

            $this->db->where('g_key', $gKey);
            $this->db->where('u_key', $uKey);
            $this->db->where('gm_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('group_members');
            $data = $query->row_array();
            return (int) $data['gm_role'];
        }

        return UserAccessController::ROLE_NO_PERMISSION;
    }

    public function create(string $displayName, string $name, string $description, int $type, string $uKey)
    {
        // create target group info
        $insertData = [
            'g_key' => UUID::getKey(),
            'u_key' => $uKey,
            'g_display_name' => $displayName,
            'g_name' => $name,
            'g_type' => $type,
            'g_description' => $description
        ];

        $result = $this->db->insert('groups', $insertData);

        if (!$result) {
            return FALSE;
        }

        return $insertData;
    }

    public function searchByName(string $name)
    {
        $name = trim($name, " \t\n\r\0\x0B'\"\/");
        $this->db->where('g_name', $name);
        $this->db->where('g_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('groups');
        $data = $query->row_array();
        return $data;
    }

    public function searchByDisplayName(string $displayName)
    {
        $this->db->where('g_display_name', $displayName);
        $this->db->where('g_status', COMMON_STATUS_NORMAL);
        $query = $this->db->get('groups');
        $data = $query->row_array();
        return $data;
    }

    public function getMergeRequests(string $gKey, int $status, string $keyword, string $sort, int $page, int $pagesize = 20)
    {
        if (!$gKey) {
            return FALSE;
        }

        $this->db->select('merge_requests.*');
        $this->db->join('repositories', 'merge_requests.mr_target_r_key = repositories.r_key', 'LEFT');

        if ($status) {
            $this->db->where('mr_proceed_status', $status);
        }

        if ($keyword) {
            $keyword = $this->db->escape_like_str($keyword);
            $this->db->where("(`mr_title` like '%{$keyword}%' OR `mr_description` like '%{$keyword}%')");
        }

        $this->db->where('repositories.g_key', $gKey);
        $this->db->where('repositories.r_status', COMMON_STATUS_NORMAL);
        $this->db->where('mr_status', COMMON_STATUS_NORMAL);
        $this->db->limit($pagesize, ($page - 1) * $pagesize);
        $this->db->order_by('mr_created', $sort);
        $query = $this->db->get('merge_requests');
        $data = $query->result_array();

        return $data;
    }

    public function listActivities(string $gKey, int $category, string $keyword, int $page, int $pagesize)
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
        $this->db->where('a_relative_g_key', $gKey);
        $this->db->where('a_status', COMMON_STATUS_NORMAL);
        $this->db->limit($pagesize, $offset);
        $this->db->order_by('a_created', 'desc');
        $query = $this->db->get('activities');
        $data = $query->result_array();
        return $data;
    }

    public function update(string $gKey, array $updateData)
    {
        $this->db->where('g_key', $gKey);
        $this->db->update('groups', $updateData);
        return TRUE;
    }

    public function addMember(string $uKey, string $gKey)
    {
        $this->db->where('u_key', $uKey);
        $this->db->where('g_key', $gKey);
        $query = $this->db->get('group_members');
        $info = $query->row_array();

        if ($info) {
            $this->setMemberRole($uKey, $gKey, UserAccessController::ROLE_GUEST);
        } else {
            $insertData = [
                'gm_key' => UUID::getKey(),
                'u_key' => $uKey,
                'g_key' => $gKey,
                'gm_role' => UserAccessController::ROLE_GUEST,
            ];
            $this->db->insert('group_members', $insertData);
        }

        return TRUE;
    }

    public function setMemberRole(string $uKey, string $gKey, int $roleID)
    {
        $this->db->where('u_key', $uKey);
        $this->db->where('g_key', $gKey);
        $query = $this->db->get('group_members');
        $info = $query->row_array();

        if ($info) {
            $this->db->where('u_key', $uKey);
            $this->db->where('g_key', $gKey);
            $this->db->update('group_members', [
                'gm_role' => $roleID,
                'gm_status' => COMMON_STATUS_NORMAL
            ]);
        } else {
            $insertData = [
                'gm_key' => UUID::getKey(),
                'u_key' => $uKey,
                'g_key' => $gKey,
                'gm_role' => $roleID
            ];
            $this->db->insert('group_members', $insertData);
        }

        return TRUE;
    }

    public function removeMember(string $uKey, string $gKey)
    {
        $this->db->where('u_key', $uKey);
        $this->db->where('g_key', $gKey);
        $this->db->update('group_members', [
            'gm_role' => UserAccessController::ROLE_GUEST,
            'gm_status' => COMMON_STATUS_DELETE,
            'gm_deleted' => date('Y-m-d H:i:s')
        ]);
        return TRUE;
    }

    public function removeGroup(string $gKey)
    {
        $this->db->where('g_key', $gKey);
        $this->db->update('groups', [
            'g_status' => COMMON_STATUS_DELETE,
            'g_deleted' => date('Y-m-d H:i:s')
        ]);
        return TRUE;
    }

    public function checkPreserve(string $input)
    {
        foreach (PRESERVE_URI as $pattern) {
            if (preg_match($pattern, $input)) {
                return TRUE;
            }
        }
        return FALSE;
    }

    public function getGroupList(string $keyword, string $sort, int $page, int $pagesize, bool $count)
    {
        $this->db->from('groups');

        $keyword && $this->db->like('g_display_name', $keyword);

        if ($count) {
            return $this->db->count_all_results();
        }

        $sort && $this->db->order_by($sort, 'DESC');
        $this->db->limit($pagesize, ($page - 1) * $pagesize);
        $query = $this->db->get();
        $groupList = $query->result_array();

        return $groupList;
    }

    public function getMembers(string $gKey)
    {
        if (!$gKey) {
            return FALSE;
        }

        $groupMembers = $this->listMembers($gKey);
        $groupMembers = $this->normalizeMembers($groupMembers);
        $groupCreator = $this->normalizeCreator($gKey);

        $members = array_merge($groupMembers, [$groupCreator]);
        $members = Helper::getUniqueMemberList($members, 'id');

        return $members;
    }
}
