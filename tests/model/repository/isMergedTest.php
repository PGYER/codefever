<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class isMergedTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;
        $uKey = TESTING_USER_KEY;
        $rKey = TESTING_REPOSITORY_KEY;
        $branch = TESTING_SOURCE_BRANCH_NAME;
        $result = $CI->repositoryModel->isMerged($rKey, $uKey, $branch);

        $this->assertIsBool($result);
    }
}