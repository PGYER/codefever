<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class createBranchTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $branchName = TESTING_NEW_BRANCH_NAME;
        $rKey = TESTING_REPOSITORY_KEY;
        $sourceBranchName = TESTING_SOURCE_BRANCH_NAME;
        $uKey = TESTING_USER_KEY;

        $result = $CI->repositoryModel->createBranch($branchName, $rKey, $sourceBranchName, $uKey);

        $this->assertIsBool($result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->createBranch('', '', '', '');

        $this->assertFalse($result);
    }
}