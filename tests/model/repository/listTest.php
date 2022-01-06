<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class listTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $uKey = TESTING_USER_KEY;

        $list = $CI->repositoryModel->list($uKey);

        $this->assertIsArray($list);
    }

    public function test_main_empty()
    {
        global $CI;

        $list = $CI->repositoryModel->list('');

        $this->assertFalse($list);
    }
}