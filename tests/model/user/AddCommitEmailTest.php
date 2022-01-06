<?php
namespace User;

use PHPUnit\Framework\TestCase;

class AddCommitEmailTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_model', 'userModel');
    }

    public function testAddCommitEmail()
    {
        global $CI;

        $excepted = 'AddCommitEmail@test.com';
        $actual = $CI->userModel->addCommitEmail(TESTING_USER_KEY, $excepted);
        $this->assertTrue($actual);

        $actual = $this->_getCommitEmail(TESTING_USER_KEY, $excepted);
        $this->assertSame($excepted, $actual['ce_email']);

        return $actual;
    }

    /**
     * @depends testAddCommitEmail
     */
    public function testUpdateCommitEmail($commitEmail)
    {
        global $CI;

        $excepted = 'UpdateCommitEmail@test.com';
        $data = [
            'ce_email' => $excepted
        ];
        $actual = $CI->userModel->updateCommitEmail($commitEmail['ce_key'], $data);
        $this->assertTrue($actual);

        $actual = $this->_getCommitEmail($commitEmail['u_key'], $excepted);
        $this->assertSame($commitEmail['ce_key'], $actual['ce_key']);

        $this->_deleteCommitEmail($commitEmail['ce_key']);
    }

    private function _getCommitEmail($uKey, $email)
    {
        global $CI;

        $CI->db->where('u_key', $uKey);
        $CI->db->where('ce_email', $email);
        $CI->db->limit(1);
        $commitEmail = $CI->db->get('commit_emails');
        $commitEmail = $commitEmail->row_array();

        return $commitEmail;
    }

    private function _deleteCommitEmail($ceKey)
    {
        global $CI;

        $CI->db->where('ce_key', $ceKey);
        $CI->db->delete('commit_emails');
    }
}
