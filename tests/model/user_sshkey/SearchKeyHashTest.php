<?php
namespace UserSshkey;

use PHPUnit\Framework\TestCase;

class SearchKeyHashTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_sshkey_model', 'userSshkeyModel');
    }

    public function testSearchKeyHash()
    {
        global $CI;

        $uKey = $CI->userSshkeyModel->searchKeyHash(TESTING_KEY_HASH);

        $this->assertEquals(32, strlen($uKey));
    }

    public function testSearchKeyHash_Empty()
    {
        global $CI;

        $uKey = $CI->userSshkeyModel->searchKeyHash('');

        $this->assertFalse($uKey);
    }
}
