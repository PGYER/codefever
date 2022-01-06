<?php

use PHPUnit\Framework\TestCase;
use service\AccessControl\AccessController;

class CommandTest extends TestCase {
    public function testCheckPermission()
    {
        // test guest has repository read
        $this->assertTrue(AccessController::checkPermission(1 ,1));

        // test guest has not repository push
        $this->assertFalse(AccessController::checkPermission(2 ,1));

        // test owner has group remove
        $this->assertTrue(AccessController::checkPermission(16 ,5));

        // test maintainer has repository push action
        $this->assertTrue(AccessController::checkRepositoryAction(4, 'git-receive-pack'));
    }
}