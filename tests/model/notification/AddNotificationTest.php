<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class AddNotificationTest extends TestCase {
    private $type = 'mergeRequest:create';
    private $data = '{"data":"data"}';

    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
    }

    public function testAddNotification()
    {
        global $CI;

        $result = $CI->notificationModel->addNotification(TESTING_USER_KEY, $this->type, $this->data, NOTIFY_FOR_USER, TESTING_GROUP_KEY, TESTING_REPOSITORY_KEY);
        $this->assertTrue($result);

        $notification = $this->_notification();
        $this->assertEquals($notification['nu_is_read'], NOTIFY_UNREAD);
        $this->assertEquals($notification['nu_status'], COMMON_STATUS_NORMAL);

        return $notification;
    }

    /**
     * @depends testAddNotification
     */
    public function testSetRead($notification)
    {
        global $CI;

        $result = $CI->notificationModel->setRead(TESTING_USER_KEY, FALSE, $notification['nu_key']);
        $this->assertTrue($result);

        $notification = $this->_notification();
        $this->assertEquals($notification['nu_is_read'], NOTIFY_READ);
        $this->assertEquals($notification['nu_status'], COMMON_STATUS_NORMAL);

        return $notification;
    }

    /**
     * @depends testSetRead
     */
    public function testDeleteReaded($notification)
    {
        global $CI;

        $result = $CI->notificationModel->deleteReaded(TESTING_USER_KEY, FALSE, $notification['nu_key']);
        $this->assertTrue($result);

        $notification = $this->_notification();
        $this->assertEquals($notification['nu_is_read'], NOTIFY_READ);
        $this->assertEquals($notification['nu_status'], COMMON_STATUS_DELETE);

        $this->_deleteNotification($notification);
    }

    private function _notification()
    {
        global $CI;

        $CI->db->from('notification_users AS nu');
        $CI->db->join('notification_content AS nc', 'nu.nc_key = nc.nc_key', 'LEFT');
        $CI->db->where('nc_data', $this->data);
        $CI->db->limit(1);
        $notification = $CI->db->get();
        $notification = $notification->row_array();

        return $notification;
    }

    private function _deleteNotification($notification)
    {
        global $CI;

        $CI->db->where('nu_key', $notification['nu_key']);
        $CI->db->delete('notification_users');

        $CI->db->where('nc_key', $notification['nc_key']);
        $CI->db->delete('notification_content');
    }
}
