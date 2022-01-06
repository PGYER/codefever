<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class ListJoinedTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testListJoined()
    {
        global $CI;

        $groups = $CI->groupModel->listJoined(TESTING_USER_KEY);

        $this->assertIsArray($groups);
    }
}
