<?php
namespace User;

use PHPUnit\Framework\TestCase;

class GetTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_model', 'userModel');
    }

    public function testGet()
    {
        global $CI;

        $user = $CI->userModel->get(TESTING_USER_KEY);
        $this->assertIsArray($user);

        // test store data
        $user = $CI->userModel->get(TESTING_USER_KEY);
        $this->assertIsArray($user);
    }

    public function testGet_Empty()
    {
        global $CI;

        $user = $CI->userModel->get('');

        $this->assertFalse($user);
    }
}
