<?php
namespace User;

use PHPUnit\Framework\TestCase;

class GetByEmailTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_model', 'userModel');
    }

    public function testGetByEmail()
    {
        global $CI;

        $user = $CI->userModel->getInfoByEmail(TESTING_USER_EMAIL);

        $this->assertIsArray($user);
    }

    public function testGetByEmail_Empty()
    {
        global $CI;

        $user = $CI->userModel->getInfoByEmail('');

        $this->assertFalse($user);
    }
}
