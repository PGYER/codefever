<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class normalizeBranchesTest extends TestCase {
    protected $CI;
    public function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;
        $testData = ['branch1', 'branch2'];

        $testData = $CI->repositoryModel->normalizeBranches($testData);

        foreach ($testData as $branch) {
            $this->assertIsString($branch['id']);
            $this->assertIsString($branch['name']);
        }
    }
}