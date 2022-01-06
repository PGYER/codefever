<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class GetDelimiterTest extends TestCase
{

    public function test_main()
    {
        $output = Helper::getDelimiter();
        $this->assertEquals("", $output);
    }
}