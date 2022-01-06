<?php
namespace User;

use PHPUnit\Framework\TestCase;

class NormalizeCommitEmailsTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('User_model', 'userModel');
    }

    public function commitEmailsProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('commit_emails');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider commitEmailsProvider
     */
    public function testNormalizeCommitEmails($commitEmails)
    {
        global $CI;

        $actual = $CI->userModel->normalizeCommitEmails($commitEmails, TRUE);
        $this->assertIsArray($actual);

        foreach ($actual as $commitEmail) {
            $this->assertIsString($commitEmail);
        }

        return $commitEmails;
    }

    /**
     * @dataProvider commitEmailsProvider
     */
    public function testNormalizeCommitEmails_Notcheck($commitEmails)
    {
        global $CI;

        $actual = $CI->userModel->normalizeCommitEmails($commitEmails, FALSE);
        $this->assertIsArray($actual);

        foreach ($actual as $commitEmail) {
            $this->assertSame(32, strlen($commitEmail['id']));
            $this->assertIsString($commitEmail['email']);
            $this->assertIsBool($commitEmail['isCheck']);
        }
    }
}
