<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $repository = $CI->repositoryModel->get(TESTING_REPOSITORY_KEY);

        $this->assertIsArray($repository);
    }

    public function test_main_empty()
    {
        global $CI;

        $repository = $CI->repositoryModel->get('');

        $this->assertFalse($repository);
    }
}