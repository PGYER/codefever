<?php

namespace service\QueryHandler;

class OwnRepoQueryHandler extends QueryHandler {
    protected $table_name = 'repositories';
    protected $primary_key = 'r_key';
    protected $field_map = [
        'r_key' => 'rid',
        'u_key' => 'uid',
        'r_display_name' => 'name',
        'r_default_branch_name' => 'defaultBranchName',
        'r_created' => 'created',
        'r_updated' => 'updated',
        'r_status' => 'status',
    ];

    public function custom($condition)
    {
        $this->CI->db->where('r_status !=', COMMON_STATUS_DELETE);
    }

    public function after(array $data)
    {
        if (!$data) {
            return $data;
        }

        $this->CI->load->model('Repository_model', 'repositoryModel');
        foreach ($data as &$repository) {
            $branches = [];
            if (!$repository['defaultBranchName']) {
                $branches = $this->CI->repositoryModel->getBranchList($repository['rid'], $repository['uid']);
            }

            $repository['commit'] = (int) $this->CI->repositoryModel->getCommitCount(
                $repository['rid'],
                $repository['uid'],
                $repository['defaultBranchName'] ? $repository['defaultBranchName'] : ($branches[0] ? $branches[0] : '')
            );
        }

        return $data;
    }
}
