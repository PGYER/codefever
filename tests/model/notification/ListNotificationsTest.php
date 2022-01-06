<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class ListNotificationsTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
    }

    public function testListNotifications()
    {
        global $CI;

        $notifications = $CI->notificationModel->listNotifications(TESTING_USER_KEY, NOTIFICATION_CATEGORY_ALL, 1);
        $this->assertIsArray($notifications);

        foreach ($notifications as $notification) {
            $this->assertIsArray($notification);

            $this->assertEquals(32, strlen($notification['nc_key']));
            $this->assertIsString($notification['nc_type']);
            $this->assertEquals(32, strlen($notification['g_key']));
            $this->assertEquals(32, strlen($notification['r_key']));
            $this->assertIsString($notification['nc_data']);
            $this->assertTrue(in_array($notification['nu_is_read'], [NOTIFY_UNREAD, NOTIFY_READ]));
        }
    }

    public function testListNotifications_Unread()
    {
        global $CI;

        $notifications = $CI->notificationModel->listNotifications(TESTING_USER_KEY, NOTIFICATION_CATEGORY_UNREAD, 1);
        $this->assertIsArray($notifications);

        foreach ($notifications as $notification) {
            $this->assertIsArray($notification);
            $this->assertEquals($notification['nu_is_read'], NOTIFY_UNREAD);
        }
    }
}
