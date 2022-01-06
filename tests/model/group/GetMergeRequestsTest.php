<?php
namespace Group;

use PHPUnit\Framework\TestCase;
use service\Constant\MergeRequestStatus;

class GetMergeRequestsTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testGetMergeRequests()
    {
        global $CI;

        $mergeRequests = $CI->groupModel->getMergeRequests(TESTING_GROUP_KEY, 0, '', 'DESC', 1, 10);

        $this->assertIsArray($mergeRequests);
    }

    public function testGetMergeRequests_OPEN()
    {
        global $CI;

        $mergeRequests = $CI->groupModel->getMergeRequests(TESTING_GROUP_KEY, MergeRequestStatus::OPEN, '', 'DESC', 1, 10);

        $this->assertIsArray($mergeRequests);
        $mergeRequests[0] && $this->assertSame(MergeRequestStatus::OPEN, (int) $mergeRequests[0]['mr_proceed_status']);
    }
}
