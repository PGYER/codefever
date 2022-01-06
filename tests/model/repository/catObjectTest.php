<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class catObjectTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $result = $CI->repositoryModel->catObject(TESTING_REPOSITORY_KEY, TESTING_USER_KEY, TESTING_SOURCE_REPOSITORY_COMMIT_HASH);
        $this->assertIsArray($result);
        $this->assertTrue(in_array($result[0], ['commit', 'tag', 'blob']));
        $this->assertIsArray($result[1]);
        $this->assertIsNumeric($result[2]);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->catObject('', '', '');

        $this->assertFalse($result);
    }
}