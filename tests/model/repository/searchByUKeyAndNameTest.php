<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class searchByUKeyAndNameTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $uKey = TESTING_USER_KEY;
        $name = TESTING_COMMON_NAME;

        $data = $CI->repositoryModel->searchByUKeyAndName($uKey, $name);

        $this->assertIsArray($data);

        if (count($data)) {
            $this->assertSame(32, strlen($data['r_key']));
            $this->assertSame(32, strlen($data['rs_key']));
            $this->assertSame(32, strlen($data['u_key']));
            $this->assertSame(32, strlen($data['g_key']));
            $this->assertSame($name, $data['r_name']);
            $this->assertSame($uKey, $data['u_key']);
            $this->assertSame('1', $data['r_status']);
        }
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->searchByUKeyAndName('', '');

        $this->assertFalse($result);
    }
}