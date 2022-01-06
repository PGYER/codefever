<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class IsCrontabTimeTest extends TestCase {
    public function test_IsCrontabTime()
    {
        $crontab = '* * * * *';
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 00:00')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:00')));

        $crontab = '*/2 * * * *';
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:00')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:02')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:11')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:31')));

        $crontab = '3,15 * * * *';
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:03')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:15')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:00')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:30')));

        $crontab = '3,15 8-11 * * *';
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 08:03')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 08:15')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 09:03')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 10:15')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 11:03')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 07:03')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:15')));

        $crontab = '0 * * * *';
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 08:00')));
        $this->assertTrue(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:00')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 08:01')));
        $this->assertFalse(Helper::isCrontabTime($crontab, strtotime('2020-12-03 12:01')));
    }
}