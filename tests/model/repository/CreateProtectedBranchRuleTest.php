<?php
namespace Repository;

use PHPUnit\Framework\TestCase;
use service\AccessControl\UserAccessController;

class CreateProtectedBranchRuleTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function testCreateProtectedBranchRule()
    {
        global $CI;

        $excepted = 'ruleTest';
        $actual = $CI->repositoryModel->createProtectedBranchRule(
            TESTING_REPOSITORY_KEY,
            $excepted,
            UserAccessController::ROLE_OWNER,
            UserAccessController::ROLE_OWNER);
        $this->assertTrue($actual);

        return $excepted;
    }

    /**
     * @depends testCreateProtectedBranchRule
     */
    public function testGetProtectedBranchRule($rule)
    {
        global $CI;

        $actual = $CI->repositoryModel->getProtectedBranchRule(TESTING_REPOSITORY_KEY, $rule);
        $this->assertIsArray($actual);
        $this->assertSame($actual['pbr_rule'], $rule);

        return $actual;
    }

    /**
     * @depends testGetProtectedBranchRule
     */
    public function testUpdateProtectedBranchRule($rule)
    {
        global $CI;

        $excepted = 'ruleTestUpate';
        $data = [
            'pbr_rule' => $excepted
        ];

        $actual = $CI->repositoryModel->updateProtectedBranchRule($rule['pbr_key'], $data);
        $this->assertTrue($actual);

        $CI->db->where('pbr_key', $rule['pbr_key']);
        $actual = $CI->db->get('proteced_branch_rules');
        $actual = $actual->row_array();

        $this->assertIsArray($actual);
        $this->assertSame($actual['pbr_rule'], $excepted);

        $CI->db->where('pbr_key', $rule['pbr_key']);
        $CI->db->delete('proteced_branch_rules');
    }
}
