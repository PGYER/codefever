<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getAccessURLTest extends TestCase {

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

        $url = $CI->repositoryModel->getAccessURL($rKey, $uKey);

        $this->assertIsString($url);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->getAccessURL('', '');

        $this->assertFalse($result);
    }
}