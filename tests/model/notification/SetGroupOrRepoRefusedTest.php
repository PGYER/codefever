<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class SetGroupOrRepoRefusedTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function testSetGroupOrRepoRefused_Repository()
    {
        global $CI;

        $result = $CI->notificationModel->setGroupOrRepoRefused(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertTrue($result);

        $refused = $this->_refused(NOTIFICATION_REFUSE_REPOSITORY);
        foreach ($refused as $item) {
            $this->assertEquals(32, strlen($item['nr_key']));
        }
    }

    /**
     * @depends testSetGroupOrRepoRefused_Repository
     */
    public function testSetGroupOrRepoReceive_Repositoy()
    {
        global $CI;

        $result = $CI->notificationModel->setGroupOrRepoReceive(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertTrue($result);

        $refused = $this->_refused(NOTIFICATION_REFUSE_REPOSITORY);
        $this->assertEquals([], $refused);
    }

    /**
     * @depends testSetGroupOrRepoReceive_Repositoy
     */
    public function testSetGroupOrRepoRefused_Group()
    {
        global $CI;

        $excepted = count($CI->repositoryModel->listInGroup(TESTING_GROUP_KEY));

        $result = $CI->notificationModel->setGroupOrRepoRefused(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $this->assertTrue($result);

        $refused = $this->_refused(NOTIFICATION_REFUSE_GROUP);
        foreach ($refused as $item) {
            $this->assertEquals(32, strlen($item['nr_key']));
        }

        $refused = $this->_refused(NOTIFICATION_REFUSE_REPOSITORY);
        $this->assertEquals($excepted, count($refused));

        foreach ($refused as $item) {
            $this->assertEquals(32, strlen($item['nr_key']));
        }
    }

    /**
     * @depends testSetGroupOrRepoRefused_Group
     */
    public function testSetGroupOrRepoReceive_Group()
    {
        global $CI;

        $result = $CI->notificationModel->setGroupOrRepoReceive(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $this->assertTrue($result);

        $refused = $this->_refused(NOTIFICATION_REFUSE_GROUP);
        $this->assertEquals([], $refused);

        $refused = $this->_refused(NOTIFICATION_REFUSE_REPOSITORY);
        $this->assertEquals([], $refused);
    }

    /**
     * @depends testSetGroupOrRepoReceive_Group
     */
    public function testSetGroupOrRepoReceive()
    {
        global $CI;

        $result = $CI->notificationModel->setGroupOrRepoRefused(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $refused = $this->_refused(NOTIFICATION_REFUSE_GROUP);
        $this->assertEquals(32, strlen($refused[0]['nr_key']));

        $result = $CI->notificationModel->setGroupOrRepoReceive(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $refused = $this->_refused(NOTIFICATION_REFUSE_GROUP);
        $this->assertEquals([], $refused);

        $result = $CI->notificationModel->setGroupOrRepoReceive(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
    }

    private function _refused($type)
    {
        global $CI;

        $CI->db->where('nr_type', $type);
        $CI->db->where('u_key', TESTING_USER_KEY);
        $refused = $CI->db->get('notification_refuse');
        $refused = $refused->result_array();

        return $refused;
    }
}
