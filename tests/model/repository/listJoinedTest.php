<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class listJoinedTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $uKey = TESTING_USER_KEY;

        $data = $CI->repositoryModel->listJoined($uKey);

        $this->assertIsArray($data);
        foreach ($data as $repo) {
            $this->assertSame(32, strlen($repo['r_key']));
            $this->assertSame(32, strlen($repo['u_key']));
            $this->assertSame(32, strlen($repo['g_key']));
            $this->assertIsString('r_display_name');
            $this->assertIsString('r_name');
            $this->assertIsString('r_path');
            $this->assertIsString('r_status');
        }
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->listInGroup('');

        $this->assertFalse($result);
    }
}