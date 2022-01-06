<?php
namespace User;

use PHPUnit\Framework\TestCase;

class NormalizeTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_model', 'userModel');
    }

    public function usersProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('users');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider usersProvider
     */
    public function testNormalize($users)
    {
        global $CI;

        $users = $CI->userModel->normalize($users);
        $this->assertIsArray($users);

        foreach ($users as $user) {
            $this->assertIsArray($user);

            $this->assertEquals(32, strlen($user['id']));
            $user['icon'] && $this->assertEquals(32, strlen($user['icon']));
            $this->assertIsString($user['name']);
            $this->assertIsString($user['email']);
            $this->assertIsString($user['phoneCode']);
            $user['phoneNumber'] && $this->assertIsString($user['phoneNumber']);
            $user['company'] && $this->assertIsString($user['company']);
            $user['job'] && $this->assertIsString($user['job']);
            $user['qq'] && $this->assertIsString($user['qq']);
        }
    }

    public function testNormalize_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->userModel->normalize([]);

        $this->assertSame($excepted, $actual);
    }
}
