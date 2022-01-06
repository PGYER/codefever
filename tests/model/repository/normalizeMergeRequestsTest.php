<?php
namespace Repository;

use PHPUnit\Framework\TestCase;
use service\Constant\MergeRequestStatus;

class NormalizeMergeRequestsTest extends TestCase {
    protected $CI;
    public function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function mergeRequestsProvider()
    {
        global $CI;

        $CI->db->limit(5);
        $data = $CI->db->get('merge_requests');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider mergeRequestsProvider
     */
    public function test_main($mergeRequests)
    {
        global $CI;

        $output = $CI->repositoryModel->normalizeMergeRequests($mergeRequests);
        $this->assertIsArray($output);

        foreach ($output as $mergeRequest) {
            $this->assertIsArray($mergeRequest);

            $this->assertIsString($mergeRequest['id']);
            $this->assertEquals(32, strlen($mergeRequest['id']));
            $this->assertIsString($mergeRequest['sourceRepository']);
            $this->assertEquals(32, strlen($mergeRequest['sourceRepository']));
            $this->assertIsString($mergeRequest['sourceBranch']);
            $this->assertEquals(32, strlen($mergeRequest['targetRepository']));
            $this->assertIsString($mergeRequest['targetRepository']);
            $this->assertIsString($mergeRequest['targetBranch']);
            $this->assertIsInt($mergeRequest['number']);
            $this->assertIsString($mergeRequest['title']);
            $this->assertIsInt($mergeRequest['status']);
            $this->assertTrue(in_array($mergeRequest['status'], [MergeRequestStatus::OPEN, MergeRequestStatus::MERGED, MergeRequestStatus::CLOSED]));
            $this->assertIsInt($mergeRequest['create']);
            $this->assertIsInt($mergeRequest['update']);
            $this->assertIsArray($mergeRequest['commit']);
        }
    }
}