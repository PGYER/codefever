<?php
namespace Group;

use PHPUnit\Framework\TestCase;
use service\AccessControl\UserAccessController;

class GetMemberRoleTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testGetMemberRole()
    {
        global $CI;

        $excepted = [
            UserAccessController::ROLE_GUEST,
            UserAccessController::ROLE_REPORTER,
            UserAccessController::ROLE_DEVELOPER,
            UserAccessController::ROLE_MAINTAINER,
            UserAccessController::ROLE_OWNER
        ];
        $actual = $CI->groupModel->getMemberRole(TESTING_GROUP_KEY, TESTING_USER_KEY);

        $this->assertTrue(in_array($actual, $excepted));
    }

    public function testGetMemberRole_Owner()
    {
        global $CI;

        $excepted = UserAccessController::ROLE_OWNER;
        $actual = $CI->groupModel->getMemberRole(TESTING_GROUP_KEY, TESTING_USER_KEY);

        $this->assertSame($excepted, $actual);
    }

    public function testGetMemberRole_Empty()
    {
        global $CI;

        $excepted = UserAccessController::ROLE_NO_PERMISSION;
        $actual = $CI->groupModel->getMemberRole(TESTING_GROUP_KEY, '');

        $this->assertSame($excepted, $actual);
    }
}
