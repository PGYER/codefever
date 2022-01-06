<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class NormalizeTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function groupsProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('groups');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider groupsProvider
     */
    public function testNormalize($groups)
    {
        global $CI;

        $groups = $CI->groupModel->normalize($groups);
        $this->assertIsArray($groups);

        foreach ($groups as $group) {
            $this->assertIsArray($group);

            $this->assertEquals(32, strlen($group['id']));
            $group['icon'] && $this->assertEquals(32, strlen($group['icon']));
            $this->assertIsString($group['displayName']);
            $this->assertIsString($group['name']);
            $this->assertIsString($group['description']);
            $this->assertEquals(32, strlen($group['owner']));
            $this->assertTrue(in_array($group['type'], [GROUP_TYPE_NORMAL, GROUP_TYPE_USER]));
            $this->assertIsInt($group['created']);
            $this->assertIsInt($group['updated']);
        }
    }

    public function testNormalize_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->groupModel->normalize([]);

        $this->assertSame($excepted, $actual);
    }
}
