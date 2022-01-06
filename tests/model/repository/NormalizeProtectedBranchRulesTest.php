<?php
namespace Repository;

use PHPUnit\Framework\TestCase;
use service\AccessControl\UserAccessController;

class NormalizeProtectedBranchRulesTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function rulesProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('proteced_branch_rules');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider rulesProvider
     */
    public function testNormalize($rules)
    {
        global $CI;

        $rules = $CI->repositoryModel->normalizeProtectedBranchRules($rules);
        $this->assertIsArray($rules);

        foreach ($rules as $rule) {
            $this->assertIsArray($rule);
            $this->assertIsString($rule['rule']);
            $this->assertTrue(in_array($rule['rolePush'], [
                UserAccessController::ROLE_NO_BODY,
                UserAccessController::ROLE_OWNER,
                UserAccessController::ROLE_MAINTAINER,
                UserAccessController::ROLE_DEVELOPER
            ]));
            $this->assertTrue(in_array($rule['roleMerge'], [
                UserAccessController::ROLE_NO_BODY,
                UserAccessController::ROLE_OWNER,
                UserAccessController::ROLE_MAINTAINER
            ]));
        }
    }

    public function testNormalize_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->repositoryModel->normalizeProtectedBranchRules([]);

        $this->assertSame($excepted, $actual);
    }
}
