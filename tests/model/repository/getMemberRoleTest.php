<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getMemberRoleTest extends TestCase {

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

        $role = $CI->repositoryModel->getMemberRole($rKey, $uKey);

        $this->assertIsNumeric($role);
        $this->assertGreaterThanOrEqual(1, $role);
    }

    public function test_main_empty()
    {
        global $CI;

        $role = $CI->repositoryModel->getMemberRole('', '');

        $this->assertSame(0, $role);
    }
}