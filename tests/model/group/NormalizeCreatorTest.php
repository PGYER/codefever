<?php
namespace Group;

use PHPUnit\Framework\TestCase;
use service\AccessControl\UserAccessController;

class NormalizeCreatorTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
        $CI->load->model('User_model', 'userModel');
    }

    public function testNormalizeCreator()
    {
        global $CI;

        $creator = $CI->groupModel->normalizeCreator(TESTING_GROUP_KEY);
        $this->assertIsArray($creator);

        $this->assertSame($creator['role'], UserAccessController::ROLE_OWNER);
        $this->assertIsInt($creator['joined']);
        $this->assertTrue($creator['groupMember']);
        $this->assertTrue($creator['creatorFlag']);
        $this->assertFalse($creator['deleteFlag']);
    }
}
