<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class NormalizeNotificationsTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
    }

    public function notificationsProvider()
    {
        global $CI;

        $CI->db->from('notification_users AS nu');
        $CI->db->join('notification_content AS nc', 'nc.nc_key = nu.nc_key', 'LEFT');
        $CI->db->limit(10);
        $data = $CI->db->get();
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider notificationsProvider
     */
    public function testNormalizeNotifications($notifications)
    {
        global $CI;

        $notifications = $CI->notificationModel->normalizeNotifications($notifications);
        $this->assertIsArray($notifications);

        foreach ($notifications as $notification) {
            $this->assertIsArray($notification);

            $this->assertEquals(32, strlen($notification['id']));
            $this->assertIsString($notification['type']);
            $this->assertEquals(32, strlen($notification['group']));
            $this->assertEquals(32, strlen($notification['repository']));
            $this->assertIsString($notification['data']);
            $this->assertIsInt($notification['created']);
            $this->assertIsBool($notification['isRead']);
        }
    }

    public function testNormalizeNotifications_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->notificationModel->normalizeNotifications($excepted);

        $this->assertEquals($excepted, $actual);
    }
}
