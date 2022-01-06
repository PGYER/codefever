<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class ListMembersTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testListMembers()
    {
        global $CI;

        $data = $CI->groupModel->listMembers(TESTING_GROUP_KEY);

        $this->assertIsArray($data);
    }
}
