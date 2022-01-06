<?php

namespace service\QueryHandler;

class JoinRepoQueryHandler extends QueryHandler {
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
        'repository_members.u_key' => 'repositoryMembers.uid'
    ];

    public function custom($condition)
    {
        $this->CI->db->select('repositories.*');
        $this->CI->db->join('repository_members', 'repository_members.r_key=repositories.r_key', 'left');
        $this->CI->db->where('r_status !=', COMMON_STATUS_DELETE);
        $this->CI->db->where('rm_status', COMMON_STATUS_NORMAL);
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
