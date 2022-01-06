<?php

use service\Utility\UUID;
use service\Utility\Helper;

class User_sshkey_model extends CI_Model
{
    public function __construct()
    {
        $this->_modifyAuthorizedKeyPid = dirname(APPPATH) . '/misc/modify_authorized_keys.pid';
        $this->_modifyAuthorizedKeyPipe = dirname(APPPATH) . '/misc/modify_authorized_keys.child.pipe';
        parent::__construct();
    }

    public function normalize(array $list)
    {
        $output = [];
        foreach ($list as $item) {
            array_push($output, [
                'id' => $item['sk_key'],
                'creator' => $item['u_key'],
                'name' => $item['sk_name'],
                'hash' => $item['sk_key_hash'],
                'type' => $item['sk_key_type'],
                'created' => strtotime($item['sk_created']),
                'deleteFlag' => !!($item['rm_status'] == COMMON_STATUS_NORMAL)
            ]);
        }
        return $output;
    }

    public function get(string $skKey)
    {
        if ($skKey) {
            $this->db->where('sk_key', $skKey);
            $query = $this->db->get('ssh_keys');
            return $query->row_array();
        }

        return FALSE;
    }

    public function delete(string $skKey)
    {
        if (!$skKey) {
            return FALSE;
        }

        $keyInfo = $this->get($skKey);
        if (!$keyInfo) {
            return FALSE;
        }

        $this->db->where('sk_key', $skKey);
        $this->db->delete('ssh_keys');

        $this->_modifyAuthorizedKey(['key' => $keyInfo['sk_key_data']]);

        return TRUE;
    }

    public function searchAuthKey(string $publicKey)
    {
        if ($publicKey) {
            $keyHash = Helper::getSSHKeyHash($publicKey);
            $this->db->where('sk_key_hash', $keyHash);
            $this->db->where('sk_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('ssh_keys');
            $data = $query->row_array();
            if ($data && count($data) > 0) {
                return $data['u_key'];
            }
        }

        return FALSE;
    }

    public function searchKeyHash(string $keyHash)
    {
        if ($keyHash) {
            $this->db->where('sk_key_hash', $keyHash);
            $this->db->where('sk_status', COMMON_STATUS_NORMAL);
            $query = $this->db->get('ssh_keys');
            $data = $query->row_array();
            if ($data && count($data) > 0) {
                return $data['u_key'];
            }
        }

        return FALSE;
    }

    public function list(string $uKey)
    {
        $this->db->where('u_key', $uKey);
        $query = $this->db->get('ssh_keys');
        return $query->result_array();
    }

    public function add(string $uKey, string $name, string $keyType, string $keyHash, string $key)
    {
        $data = [
            'sk_key' => UUID::getKey(),
            'u_key' => $uKey,
            'sk_name' => $name,
            'sk_key_type' => $keyType,
            'sk_key_hash' => $keyHash,
            'sk_key_data' => $key
        ];

        $this->db->insert('ssh_keys', $data);
        $this->_modifyAuthorizedKey([
            'user' => $uKey,
            'type' => $keyType,
            'key' => $key,
            'name' => $name,
        ]);

        return TRUE;
    }

    private function _modifyAuthorizedKey(array $data)
    {
        if (!$data) {
            return FALSE;
        }

        if (!file_exists($this->_modifyAuthorizedKeyPipe)) {
            umask(0);
            posix_mkfifo($this->_modifyAuthorizedKeyPipe, 0777);
        }

        $pid = (int) file_get_contents($this->_modifyAuthorizedKeyPid);

        posix_kill($pid, SIGUSR1);

        $f = fopen($this->_modifyAuthorizedKeyPipe, 'w');
        fwrite($f, json_encode($data));
        unlink($this->_modifyAuthorizedKeyPipe);
    }
}
