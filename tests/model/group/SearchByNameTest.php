<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class SearchByNameTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testSearchByName()
    {
        global $CI;

        $group = $CI->groupModel->searchByName(TESTING_GROUP_NAME);

        $this->assertIsArray($group);
    }
}
