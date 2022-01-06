<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class createTagTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $rKey = TESTING_REPOSITORY_KEY;
        $uKey = TESTING_USER_KEY;
        $tag = TESTING_NEW_TAG_NAME;
        $description = TESTING_COMMON_DESCRIPTION;
        $commitSHA = TESTING_SOURCE_REPOSITORY_COMMIT_HASH;

        $result = $CI->repositoryModel->createTag($rKey, $uKey, $tag, $description, $commitSHA);

        $this->assertIsBool($result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->createTag('', '', '', '', '');

        $this->assertFalse($result);
    }
}