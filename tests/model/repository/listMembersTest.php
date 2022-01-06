<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class listMembersTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $rKey = TESTING_REPOSITORY_KEY;

        $members = $CI->repositoryModel->listMembers($rKey);

        $this->assertIsArray($members);
    }

    public function test_main_empty()
    {
        global $CI;

        $members = $CI->repositoryModel->listMembers('');

        $this->assertFalse($members);
    }
}