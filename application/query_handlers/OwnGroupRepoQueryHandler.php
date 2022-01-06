<?php

namespace service\QueryHandler;

class OwnGroupRepoQueryHandler extends QueryHandler {
    protected $table_name = 'groups';
    protected $primary_key = 'g_key';
    protected $field_map = [
        'g_key' => 'gid',
        'u_key' => 'uid',
        'g_created' => 'create',
        'g_status' => 'status',
    ];

    public function custom($condition)
    {
        $this->CI->db->where('g_status !=', COMMON_STATUS_DELETE);
    }

    public function after(array $data)
    {
        if (!$data) {
            return $data;
        }

        $this->CI->load->model('Repository_model', 'repositoryModel');

        $repositories = [];
        foreach ($data as $item) {
            $repositories = array_merge($repositories, $this->CI->repositoryModel->listInGroup($item['gid']));
        }

        $final = [];
        foreach ($repositories as &$repository) {
            $repo = [
                'rid' => $repository['r_key'],
                'uid' => $repository['u_key'],
                'name' => $repository['r_display_name'],
                'created' => $repository['r_created'],
                'updated' => $repository['r_updated'],
                'defaultBranchName' => $repository['r_default_branch_name'],
            ];

            $branches = [];
            if (!$repo['defaultBranchName']) {
                $branches = $this->CI->repositoryModel->getBranchList($repo['rid'], $repo['uid']);
            }
            $repo['commit'] = (int) $this->CI->repositoryModel->getCommitCount(
                $repo['rid'],
                $repo['uid'],
                $repo['defaultBranchName'] ? $repo['defaultBranchName'] : ($branches[0] ? $branches[0] : '')
            );

            array_push($final, $repo);
        }

        return $final;
    }
}
