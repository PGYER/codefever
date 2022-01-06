<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class ListProtectedBranchRulesTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function testListProtectedBranchRules()
    {
        global $CI;

        $rules = $CI->repositoryModel->listProtectedBranchRules('36a80ef66ad60301b9d392628a1caae2');
        $this->assertIsArray($rules);
    }

    public function testListProtectedBranchRules_Empty()
    {
        global $CI;

        $rules = $CI->repositoryModel->listProtectedBranchRules('');
        $this->assertFalse($rules);
    }
}
