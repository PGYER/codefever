<?php
namespace UserSshkey;

use PHPUnit\Framework\TestCase;

class NormalizeTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_sshkey_model', 'userSshkeyModel');
    }

    public function sshkeyProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('ssh_keys');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider sshkeyProvider
     */
    public function testNormalize($sshkeys)
    {
        global $CI;

        $sshkeys = $CI->userSshkeyModel->normalize($sshkeys);
        $this->assertIsArray($sshkeys);

        foreach ($sshkeys as $sshkey) {
            $this->assertIsArray($sshkey);

            $this->assertEquals(32, strlen($sshkey['id']));
            $this->assertEquals(32, strlen($sshkey['creator']));
            $this->assertIsString($sshkey['name']);
            $this->assertEquals(32, strlen($sshkey['hash']));
            $this->assertIsString($sshkey['type']);
            $this->assertIsInt($sshkey['created']);
            $this->assertIsBool($sshkey['deleteFlag']);
        }
    }

    public function testNormalize_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->userSshkeyModel->normalize([]);

        $this->assertSame($excepted, $actual);
    }
}
