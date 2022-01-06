<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class listActivitiesTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $rKey = TESTING_REPOSITORY_KEY;
        $category = 0;
        $page = TESTING_COMMON_PAGE;
        $pageSize = TESTING_COMMON_PERPAGE;

        $data = $CI->repositoryModel->listActivities($rKey, $category, '', $page, $pageSize);
        $this->assertIsArray($data);
        $activity = $data[0];
        if (count($data)) {
            $this->assertEquals(32, strlen($activity['a_key']));
            $this->assertEquals(32, strlen($activity['u_key']));
            $this->assertLessThanOrEqual(1795, $activity['a_type']);
            $this->assertGreaterThanOrEqual(513, $activity['a_type']);
            $this->assertEquals(32, strlen($activity['a_relative_g_key']));
            $this->assertEquals(32, strlen($activity['a_relative_r_key']));
            $this->assertIsString($activity['a_data']);
            $this->assertIsString($activity['a_created']);
            $this->assertIsString($activity['a_updated']);
            $this->assertSame('1', $activity['a_status']);
        }
    }
}