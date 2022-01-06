<?php
namespace Group;

use PHPUnit\Framework\TestCase;
use service\AccessControl\UserAccessController;

class ModifyTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testCreate()
    {
        global $CI;

        $excepted = [
            'displayName' => 'PHPUnitGroupDisplayName',
            'name' => 'PHPUnitGroupName',
            'description' => 'PHPUnitGroupDescription',
            'type' => GROUP_TYPE_NORMAL,
            'uKey' => TESTING_USER_KEY
        ];
        $actual = $CI->groupModel->create($excepted['displayName'], $excepted['name'], $excepted['description'], $excepted['type'], $excepted['uKey']);
        $actual = $this->_group($actual['g_key']);

        $this->assertIsArray($actual);
        $this->assertSame($excepted['displayName'], $actual['g_display_name']);
        $this->assertSame($excepted['name'], $actual['g_name']);
        $this->assertSame($excepted['description'], $actual['g_description']);
        $this->assertSame($excepted['type'], (int) $actual['g_type']);
        $this->assertSame($excepted['uKey'], $actual['u_key']);

        return $actual;
    }

    /**
     * @depends testCreate
     */
    public function testUpdate($group)
    {
        global $CI;

        $excepted = [
            'g_display_name' => 'PHPUnitGroupDisplayNameUpdate',
            'g_name' => 'PHPUnitGroupNameUpdate',
            'g_description' => 'PHPUnitGroupDescriptionUpdate'
        ];
        $CI->groupModel->update($group['g_key'], $excepted);
        $actual = $this->_group($group['g_key']);

        $this->assertIsArray($actual);
        $this->assertSame($excepted['g_display_name'], $actual['g_display_name']);
        $this->assertSame($excepted['g_name'], $actual['g_name']);
        $this->assertSame($excepted['g_description'], $actual['g_description']);

        return $actual;
    }

    /**
     * @depends testUpdate
     */
    public function testAddMember($group)
    {
        global $CI;

        $CI->groupModel->addMember(TESTING_USER_KEY_NO_RELATION, $group['g_key']);

        $excepted = UserAccessController::ROLE_GUEST;
        $actual = $CI->groupModel->getMemberRole($group['g_key'], TESTING_USER_KEY_NO_RELATION);
        $this->assertSame($excepted, $actual);

        return $group;
    }

    /**
     * @depends testAddMember
     */
    public function testSetMemberRole($group)
    {
        global $CI;

        $excepted = UserAccessController::ROLE_MAINTAINER;
        $CI->groupModel->setMemberRole(TESTING_USER_KEY_NO_RELATION, $group['g_key'], $excepted);

        $actual = $CI->groupModel->getMemberRole($group['g_key'], TESTING_USER_KEY_NO_RELATION);
        $this->assertSame($excepted, $actual);

        return $group;
    }

    /**
     * @depends testSetMemberRole
     */
    public function testRemoveMember($group)
    {
        global $CI;

        $CI->groupModel->removeMember(TESTING_USER_KEY_NO_RELATION, $group['g_key']);

        $actual = $this->_groupMember($group['g_key'], TESTING_USER_KEY_NO_RELATION);
        $this->assertSame(COMMON_STATUS_DELETE, (int) $actual['gm_status']);
        $this->assertSame(UserAccessController::ROLE_GUEST, (int) $actual['gm_role']);

        return $group;
    }

    /**
     * @depends testRemoveMember
     */
    public function testRemoveGroup($group)
    {
        global $CI;

        $CI->groupModel->removeGroup($group['g_key']);

        $excepted = COMMON_STATUS_DELETE;
        $actual = $this->_group($group['g_key']);
        $this->assertSame($excepted, (int) $actual['g_status']);

        $this->_removeTestData($group);
    }

    private function _group($gKey)
    {
        global $CI;

        $CI->db->where('g_key', $gKey);
        $group = $CI->db->get('groups');
        $group = $group->row_array();

        return $group;
    }

    private function _groupMember($gKey, $uKey)
    {
        global $CI;

        $CI->db->where('g_key', $gKey);
        $CI->db->where('u_key', $uKey);
        $groupMember = $CI->db->get('group_members');
        $groupMember = $groupMember->row_array();

        return $groupMember;
    }

    private function _removeTestData($group)
    {
        global $CI;

        $CI->db->where('g_key', $group['g_key']);
        $CI->db->delete('groups');

        $CI->db->where('g_key', $group['g_key']);
        $CI->db->where('u_key', TESTING_USER_KEY_NO_RELATION);
        $CI->db->limit(1);
        $CI->db->delete('group_members');
    }
}
