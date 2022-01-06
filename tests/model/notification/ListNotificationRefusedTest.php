<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class ListNotificationRefusedTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
    }

    public function testListNotificationRefused()
    {
        global $CI;

        $refuseList = $CI->notificationModel->listNotificationRefused(TESTING_USER_KEY);
        $this->assertIsArray($refuseList);

        foreach ($refuseList as $refuse) {
            $this->assertIsArray($refuse);

            $this->assertEquals(32, strlen($refuse['nr_key']));
            $this->assertTrue(in_array($refuse['nc_type'], [NOTIFICATION_REFUSE_GROUP, NOTIFICATION_REFUSE_REPOSITORY]));
            $refuse['nc_type'] == NOTIFICATION_REFUSE_GROUP && $this->assertEquals(32, strlen($refuse['g_key']));
            $refuse['nc_type'] == NOTIFICATION_REFUSE_REPOSITORY && $this->assertEquals(32, strlen($refuse['r_key']));
        }
    }
}
