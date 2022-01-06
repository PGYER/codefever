<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class GetProtectedBranchRuleTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function testGetProtectedBranchRule_Empty()
    {
        global $CI;

        $rule = $CI->repositoryModel->listProtectedBranchRules('', '');
        $this->assertFalse($rule);
    }
}
