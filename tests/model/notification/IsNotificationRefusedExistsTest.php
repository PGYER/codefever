<?php
namespace Notification;

use PHPUnit\Framework\TestCase;

class IsNotificationRefusedExistsTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Notification_model', 'notificationModel');
    }

    public function testIsNotificationRefusedExists()
    {
        global $CI;

        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $this->assertFalse($result);

        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertFalse($result);

        $CI->notificationModel->setGroupOrRepoRefused(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertTrue($result);

        $CI->notificationModel->setGroupOrRepoReceive(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertFalse($result);

        $CI->notificationModel->setGroupOrRepoRefused(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $this->assertTrue($result);
        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertTrue($result);

        $CI->notificationModel->setGroupOrRepoReceive(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_GROUP, TESTING_GROUP_KEY);
        $this->assertFalse($result);
        $result = $CI->notificationModel->isNotificationRefusedExists(TESTING_USER_KEY, NOTIFICATION_REFUSE_REPOSITORY, TESTING_REPOSITORY_KEY);
        $this->assertFalse($result);
    }
}
