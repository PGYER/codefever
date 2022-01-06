<?php

use service\Utility\UUID;

class Notification_model extends CI_Model {
    public function __construct()
    {
        parent::__construct();
    }

    public function normalizeNotifications(array $list)
    {
        $result = [];
        foreach ($list as $item) {
            array_push($result, [
                'id' => $item['nu_key'] ?: '',
                'type' => $item['nc_type'],
                'group' => $item['g_key'],
                'repository' => $item['r_key'],
                'data' => $item['nc_data'],
                'created' => strtotime($item['nc_created']),
                'isRead' => $item['nu_is_read'] ? ($item['nu_is_read'] == NOTIFY_READ) : true
            ]);
        }

        return $result;
    }

    public function normalizeNotificationsRefused(array $list)
    {
        $result = [];
        foreach ($list as $item) {
            array_push($result, [
                'id' => $item['nr_key'],
                'type' => $item['nr_type'],
                'target' => $item['nr_type'] == NOTIFICATION_REFUSE_GROUP ? $item['g_key'] : $item['r_key']
            ]);
        }

        return $result;
    }

    public function listNotifications(string $uKey, int $category = NOTIFICATION_CATEGORY_ALL, int $page = 1, int $pagesize = 20)
    {
        if (!$uKey) {
            return FALSE;
        }

        // 分类对应的通知类型
        $notificationType = [
            NOTIFICATION_CATEGORY_ALL => NOTIFY_FOR_USER,
            NOTIFICATION_CATEGORY_UNREAD => NOTIFY_FOR_USER,
            NOTIFICATION_CATEGORY_SYSTEM => NOTIFY_FOR_PUBLIC,
            NOTIFICATION_CATEGORY_MENTION_ME => NOTIFY_FOR_DM
        ];

        if ($category === NOTIFICATION_CATEGORY_SYSTEM) {
            $this->db->from('notification_content AS nc');
            $this->db->where('nc_scope', $notificationType[$category]);
        } else {
            $this->db->from('notification_users AS nu');
            $this->db->join('notification_content AS nc', 'nu.nc_key = nc.nc_key', 'LEFT');
            $this->db->where('u_key', $uKey);
            $this->db->where('nc_scope', $notificationType[$category]);
            $this->db->where('nu_status', COMMON_STATUS_NORMAL);

            if ($category === NOTIFICATION_CATEGORY_UNREAD) {
                $this->db->where('nu_is_read', NOTIFY_UNREAD);
            }
        }

        $this->db->limit($pagesize, ($page - 1) * $pagesize);
        $this->db->order_by('nc_created', 'DESC');
        $notifications = $this->db->get();
        $notifications = $notifications->result_array();

        return $notifications;
    }

    public function unReadNotificationCount(string $uKey)
    {
        $this->db->where('u_key', $uKey);
        $this->db->where('nu_is_read', NOTIFY_UNREAD);
        $this->db->where('nu_status', COMMON_STATUS_NORMAL);
        return $this->db->count_all_results('notification_users');
    }

    public function addNotification(string $uKey, string $type, string $content, int $scope, string $gKey = '', string $rKey = '')
    {
        if (!$uKey || !$type || !$content || !$scope) {
            return FALSE;
        }

        $ncKey = UUID::getKey();
        $data = [
            'nc_key' => $ncKey,
            'nc_type' => $type,
            'g_key' => $gKey,
            'r_key' => $rKey,
            'nc_data' => $content,
            'nc_scope' => $scope,
            'nc_created' => date('Y-m-d H:i:s'),
            'nc_status' => COMMON_STATUS_NORMAL
        ];

        $this->db->insert('notification_content', $data);

        $nuKey = UUID::getKey();
        $data = [
            'nu_key' => $nuKey,
            'u_key' => $uKey,
            'nc_key' => $ncKey,
            'nu_is_read' => NOTIFY_UNREAD,
            'nu_created' => date('Y-m-d H:i:s'),
            'nu_status' => COMMON_STATUS_NORMAL
        ];
        $result = $this->db->insert('notification_users', $data);

        return $result;
    }

    public function setRead(string $uKey, bool $all = TRUE, string $nuKey = '')
    {
        if (!$uKey) {
            return FALSE;
        }

        $data = [
            'nu_is_read' => NOTIFY_READ,
            'nu_updated' => date('Y-m-d H:i:s'),
        ];

        $this->db->where('u_key', $uKey);
        if (!$all) {
            $this->db->where('nu_key', $nuKey);
        }

        $result = $this->db->update('notification_users', $data);

        return $result;
    }

    public function deleteReaded(string $uKey, bool $all = TRUE, string $nuKey = '')
    {
        if (!$uKey) {
            return FALSE;
        }

        $data = [
            'nu_deleted' => date('Y-m-d H:i:s'),
            'nu_status' => COMMON_STATUS_DELETE
        ];

        $this->db->where('u_key', $uKey);
        if (!$all) {
            $this->db->where('nu_key', $nuKey);
        } else {
            $this->db->where('nu_is_read', NOTIFY_READ);
        }

        $result = $this->db->update('notification_users', $data);

        return $result;
    }

    public function listNotificationRefused(string $uKey)
    {
        if (!$uKey) {
            return FALSE;
        }

        $this->db->where('u_key', $uKey);
        $this->db->where('nr_status', COMMON_STATUS_NORMAL);
        $result = $this->db->get('notification_refuse');
        $result = $result->result_array();

        return $result;
    }

    public function setGroupOrRepoRefused(string $uKey, int $type, string $target)
    {
        if (!$uKey || !$type || !$target) {
            return FALSE;
        }

        $result = $this->_addNotificationRefused($uKey, $type, $target);

        if ($type == NOTIFICATION_REFUSE_GROUP) {
            $refusedRepositories = [];
            $refused = $this->listNotificationRefused($uKey);
            foreach ($refused as $item) {
                if ($item['r_key']) {
                    $refusedRepositories[$item['r_key']] = true;
                }
            }

            $repositories = $this->repositoryModel->listInGroup($target);
            foreach ($repositories as $repository) {
                if (!isset($refusedRepositories[$repository['r_key']])) {
                    $this->_addNotificationRefused($uKey, NOTIFICATION_REFUSE_REPOSITORY, $repository['r_key']);
                }
            }
        }

        return $result;
    }

    private function _addNotificationRefused(string $uKey, int $type, string $target)
    {
        if (!$uKey || !$type || !$target) {
            return FALSE;
        }

        $data = [
            'nr_key' => UUID::getKey(),
            'nr_type' => $type,
            'u_key' => $uKey
        ];
        $data[$type == NOTIFICATION_REFUSE_GROUP ? 'g_key' : 'r_key'] = $target;
        $result = $this->db->insert('notification_refuse', $data);

        return $result;
    }

    public function setGroupOrRepoReceive(string $uKey, int $type, string $target)
    {
        if (!$uKey || !$type || !$target) {
            return FALSE;
        }

        $result = $this->_deleteNotificationRefused($uKey, $type, $target);
        if ($type == NOTIFICATION_REFUSE_GROUP) {
            $repositories = $this->repositoryModel->listInGroup($target);
            foreach ($repositories as $repository) {
                $this->_deleteNotificationRefused($uKey, NOTIFICATION_REFUSE_REPOSITORY, $repository['r_key']);
            }
        } else {
            $repository = $this->repositoryModel->get($target);
            $result = $this->_deleteNotificationRefused($uKey, NOTIFICATION_REFUSE_GROUP, $repository['g_key']);
        }

        return $result;
    }

    private function _deleteNotificationRefused(string $uKey, int $type, string $target)
    {
        if (!$uKey || !$type || !$target) {
            return FALSE;
        }

        $this->db->where('u_key', $uKey);
        $this->db->where('nr_type', $type);
        $this->db->where($type == NOTIFICATION_REFUSE_GROUP ? 'g_key' : 'r_key', $target);

        $result = $this->db->delete('notification_refuse');

        return $result;
    }

    public function isNotificationRefusedExists(string $uKey, int $type, string $target)
    {
        if (!$uKey || !$type || !$target) {
            return FALSE;
        }

        $this->db->where('u_key', $uKey);
        $this->db->where('nr_type', $type);
        $this->db->where($type == NOTIFICATION_REFUSE_GROUP ? 'g_key' : 'r_key', $target);
        $this->db->where('nr_status', COMMON_STATUS_NORMAL);
        $this->db->limit(1);
        $result = $this->db->get('notification_refuse');
        $result = $result->result_array();

        return !!$result;
    }
}
