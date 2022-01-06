<?php
namespace Group;

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

        $CI->db->limit(10);
        $data = $CI->db->get('merge_requests');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider mergeRequestsProvider
     */
    public function testNormalizeMergeRequests($mergeRequests)
    {
        global $CI;

        $actual = $CI->repositoryModel->normalizeMergeRequests($mergeRequests);
        $this->assertIsArray($actual);

        foreach ($actual as $mergeRequest) {
            $this->assertIsArray($mergeRequest);

            $this->assertEquals(32, strlen($mergeRequest['id']));
            $this->assertEquals(32, strlen($mergeRequest['sourceRepository']));
            $this->assertEquals(32, strlen($mergeRequest['targetRepository']));
            $this->assertIsString($mergeRequest['targetRepository']);
            $this->assertIsString($mergeRequest['targetBranch']);
            $this->assertIsInt($mergeRequest['number']);
            $this->assertIsString($mergeRequest['title']);
            $this->assertTrue(in_array($mergeRequest['status'], [MergeRequestStatus::OPEN, MergeRequestStatus::MERGED, MergeRequestStatus::CLOSED]));
            $this->assertIsInt($mergeRequest['create']);
            $this->assertIsInt($mergeRequest['update']);
            $this->assertIsArray($mergeRequest['commit']);
        }
    }
}