<?php
namespace UserSshkey;

use PHPUnit\Framework\TestCase;

class ListTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_sshkey_model', 'userSshkeyModel');
    }

    public function testList()
    {
        global $CI;

        $sshkeys = $CI->userSshkeyModel->list(TESTING_USER_KEY);

        $this->assertIsArray($sshkeys);
    }
}
