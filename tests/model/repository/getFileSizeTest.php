<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getFileSizeTest extends TestCase {

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

        $size = $CI->repositoryModel->getFileSize($rKey, $uKey, $commitHash);

        $this->assertIsNumeric($size);
        $this->assertGreaterThanOrEqual(0, $size);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->getFileSize('', '', '');

        $this->assertFalse($result);
    }
}