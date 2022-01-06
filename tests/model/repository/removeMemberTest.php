<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class removeMemberTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $uKey = TESTING_USER_KEY;
        $rKey = TESTING_REPOSITORY_KEY;

        $result = $CI->repositoryModel->removeMember($uKey, $rKey);

        $this->assertTrue($result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->removeMember('', '');

        $this->assertFalse($result);
    }
}