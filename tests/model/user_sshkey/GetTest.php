<?php
namespace UserSshkey;

use PHPUnit\Framework\TestCase;

class GetTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_sshkey_model', 'userSshkeyModel');
    }

    public function testGet()
    {
        global $CI;

        $sshkey = $CI->userSshkeyModel->get(TESTING_SSHKEY);

        $this->assertIsArray($sshkey);
    }

    public function testGet_Empty()
    {
        global $CI;

        $sshkey = $CI->userSshkeyModel->get('');

        $this->assertFalse($sshkey);
    }
}
