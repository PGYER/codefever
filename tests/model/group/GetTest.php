<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class GetTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testGet()
    {
        global $CI;

        $group = $CI->groupModel->get(TESTING_GROUP_KEY);
        $this->assertIsArray($group);

        // test store data
        $group = $CI->groupModel->get(TESTING_GROUP_KEY);
        $this->assertIsArray($group);
    }

    public function testGet_Empty()
    {
        global $CI;

        $group = $CI->groupModel->get('');

        $this->assertFalse($group);
    }
}
