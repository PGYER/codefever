<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class CheckPreserveTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function testCheckPreserve()
    {
        global $CI;

        $result = $CI->groupModel->checkPreserve('group');

        $this->assertTrue($result);
    }

    public function testCheckPreserve_False()
    {
        global $CI;

        $result = $CI->groupModel->checkPreserve('pgyer');

        $this->assertFalse($result);
    }
}
