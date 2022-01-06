<?php
namespace Group;

use PHPUnit\Framework\TestCase;
use service\AccessControl\UserAccessController;

class NormalizeMembersTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
        $CI->load->model('User_model', 'userModel');
    }

    public function membersProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('group_members');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider membersProvider
     */
    public function testNormalizeMembers($members)
    {
        global $CI;

        $members = $CI->groupModel->normalizeMembers($members);
        $this->assertIsArray($members);

        foreach ($members as $member) {
            $this->assertIsArray($member);

            $this->assertTrue(in_array((int) $member['role'], [
                UserAccessController::ROLE_GUEST,
                UserAccessController::ROLE_REPORTER,
                UserAccessController::ROLE_DEVELOPER,
                UserAccessController::ROLE_MAINTAINER,
                UserAccessController::ROLE_OWNER
            ]));
            $this->assertIsInt($member['joined']);
            $this->assertTrue($member['groupMember']);
            $this->assertFalse($member['creatorFlag']);
            $this->assertIsBool($member['deleteFlag']);
        }
    }

    public function testNormalizeMembers_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->groupModel->normalizeMembers([]);

        $this->assertSame($excepted, $actual);
    }
}
