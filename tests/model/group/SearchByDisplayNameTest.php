<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class SearchByDisplayNameTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testSearchByDisplayName()
    {
        global $CI;

        $group = $CI->groupModel->searchByDisplayName(TESTING_GROUP_DISPLAY_NAME);

        $this->assertIsArray($group);
    }
}
