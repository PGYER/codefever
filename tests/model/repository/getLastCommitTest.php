<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getLastCommitTest extends TestCase {

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
        $filePath = '';
        $lastSha = TESTING_SOURCE_REPOSITORY_COMMIT_HASH;

        $result = $CI->repositoryModel->getLastCommit($rKey, $uKey, $branch, $filePath, $lastSha);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('sha', $result);
        $this->assertArrayHasKey('commit', $result);
        $this->assertArrayHasKey('detail', $result);
        $this->assertArrayHasKey('email', $result);
        $this->assertArrayHasKey('time', $result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->getLastCommit('', '', '', '', '');

        $this->assertFalse($result);
    }
}