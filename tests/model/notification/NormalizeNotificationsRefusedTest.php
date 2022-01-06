<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class NormalizeNotificationsRefusedTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
    }

    public function refusedProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('notification_refuse');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider refusedProvider
     */
    public function testNormalizeNotificationsRefused($refused)
    {
        global $CI;

        $refused = $CI->notificationModel->normalizeNotificationsRefused($refused);
        $this->assertIsArray($refused);

        foreach ($refused as $refuse) {
            $this->assertIsArray($refuse);

            $this->assertEquals(32, strlen($refuse['id']));
            $this->assertTrue(in_array($refuse['type'], [NOTIFICATION_REFUSE_GROUP, NOTIFICATION_REFUSE_REPOSITORY]));
            $this->assertEquals(32, strlen($refuse['target']));
        }
    }

    public function testNormalizeNotificationsRefused_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->notificationModel->normalizeNotifications($excepted);

        $this->assertEquals($excepted, $actual);
    }
}
