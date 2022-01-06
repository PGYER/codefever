<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class countMergeRequestsTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $result = $CI->repositoryModel->countMergeRequests(TESTING_REPOSITORY_KEY);

        $this->assertIsArray($result);

        $this->assertGreaterThanOrEqual(0, $result['open']);
        $this->assertGreaterThanOrEqual(0, $result['merged']);
        $this->assertGreaterThanOrEqual(0, $result['closed']);
        $this->assertGreaterThanOrEqual(0, $result['all']);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->countMergeRequests('');

        $this->assertFalse($result);
    }
}