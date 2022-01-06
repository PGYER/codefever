<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class ListActivitiesTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testListActivities()
    {
        global $CI;

        $activities = $CI->groupModel->listActivities(TESTING_GROUP_KEY, 0, '', 1, 10);

        $this->assertIsArray($activities);
    }

    public function testListActivities_ACTIVITY_CATEGORY_MERGE_REQUEST()
    {
        global $CI;

        $activities = $CI->groupModel->listActivities(TESTING_GROUP_KEY, ACTIVITY_CATEGORY_MERGE_REQUEST, '', 1, 10);

        $this->assertIsArray($activities);

        $activities[0] &&
        ($this->assertGreaterThan(0x0700, (int) $activities[0]['a_type']) ||
        $this->assertLessThan(0x0800, (int) $activities[0]['a_type']));
    }
}
