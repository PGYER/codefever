<?php
namespace UserSshkey;

use PHPUnit\Framework\TestCase;

class SearchAuthKeyTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_sshkey_model', 'userSshkeyModel');
    }

    public function testSearchAuthKey()
    {
        global $CI;

        $uKey = $CI->userSshkeyModel->searchAuthKey(TESTING_PUBLIC_KEY);

        $this->assertEquals(32, strlen($uKey));
    }

    public function testSearchAuthKey_Empty()
    {
        global $CI;

        $uKey = $CI->userSshkeyModel->searchAuthKey('');

        $this->assertFalse($uKey);
    }
}
