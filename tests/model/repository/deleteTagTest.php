<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class deleteTagTest extends TestCase {

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
        $result = $CI->repositoryModel->deleteTag($rKey, $uKey, $tag);

        $this->assertIsBool($result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->deleteBranch('', '', '');

        $this->assertFalse($result);
    }
}