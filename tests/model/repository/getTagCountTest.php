<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getTagCountTest extends TestCase {

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

        $result = $CI->repositoryModel->getTagCount($rKey, $uKey);
        $this->assertGreaterThanOrEqual(0, $result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->getTagCount('', '');

        $this->assertFalse($result);
    }
}