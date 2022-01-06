<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class ListTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testList()
    {
        global $CI;

        $groups = $CI->groupModel->list(TESTING_USER_KEY);

        $this->assertIsArray($groups);
    }
}
