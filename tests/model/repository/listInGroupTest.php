<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class listGroupTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $gKey = TESTING_GROUP_KEY;

        $listInGroup = $CI->repositoryModel->listInGroup($gKey);

        $this->assertIsArray($listInGroup);
    }

    public function test_main_empty()
    {
        global $CI;

        $listInGroup = $CI->repositoryModel->listInGroup('');

        $this->assertFalse($listInGroup);
    }
}