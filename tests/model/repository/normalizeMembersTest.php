<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class normalizMembersTest extends TestCase {
    protected $CI;
    public function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function membersProvider()
    {
        global $CI;

        $CI->db->where('r_key', TESTING_REPOSITORY_KEY);
        $CI->db->where('rm_status', COMMON_STATUS_NORMAL);
        $query = $CI->db->get('repository_members');
        $data = $query->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider membersProvider
     */
    public function test_main($members)
    {
        global $CI;

        $output = $CI->repositoryModel->normalizeMembers($members);
        $this->assertIsArray($output);

        foreach ($output as $item) {
            $this->assertIsString($item['id']);
            $this->assertIsString($item['icon']);
            $this->assertIsString($item['name']);
            $this->assertIsString($item['email']);
            $this->assertIsString($item['phoneCode']);
            $this->assertIsInt($item['joined']);
            $this->assertIsString($item['role']);
            $this->assertIsBool($item['groupMember']);
            $this->assertIsBool($item['creatorFlag']);
            $this->assertIsBool($item['deleteFlag']);
        }
    }
}