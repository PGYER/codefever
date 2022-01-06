<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class countForksTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $result = $CI->repositoryModel->countForks(TESTING_REPOSITORY_KEY);

        $this->assertGreaterThanOrEqual(0, $result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->countForks('');

        $this->assertEquals(0, $result);
    }
}