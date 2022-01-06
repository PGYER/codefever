<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getCommitDetailTest extends TestCase {

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
        $commitHash = TESTING_SOURCE_REPOSITORY_COMMIT_HASH;

        $result = $CI->repositoryModel->getCommitDetail($rKey, $uKey, $commitHash);

        $this->assertIsArray($result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->getTags('', '');

        $this->assertIsArray($result);
        $this->assertEquals(0, count($result));
    }
}