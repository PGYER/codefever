<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class searchByNameTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $name = TESTING_COMMON_NAME;
        $gKey = TESTING_GROUP_KEY;

        $data = $CI->repositoryModel->searchByName($name, $gKey);

        $this->assertIsArray($data);
        if (count($data)) {
            $this->assertEquals(32, strlen($data['r_key']));
            $this->assertEquals(32, strlen($data['rs_key']));
            $this->assertEquals(32, strlen($data['u_key']));
            $this->assertEquals(32, strlen($data['g_key']));
            $this->assertIsString($data['r_display_name']);
            $this->assertIsString($data['r_name']);
            $this->assertIsString($data['r_path']);
            $this->assertIsString($data['r_created']);
            $this->assertIsString($data['r_updated']);
            $this->assertSame('1', $data['r_status']);
        }
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->searchByName('', '');

        $this->assertFalse($result);
    }
}