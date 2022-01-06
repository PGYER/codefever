<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class ParseObjectToFileTest extends TestCase {
    public function testParseObjectToFile_MaxSize()
    {
        $expected = ['oversize' => TRUE];

        $actual = '00';
        $index = 20;
        while ($index-- > 0) {
            $actual .= $actual;
        }
        $actual .= '1';

        $actual = Helper::parseObjectToFile($actual);

        $this->assertEquals($expected, $actual);
        unset($actual);
    }

    public function testParseObjectToFile_UnSupport()
    {
        $actualFile = APPPATH . '../www/static/vendor/jquery-validation-1.19.1/jquery-validation-1.19.1.zip';
        $actual = file_get_contents($actualFile);

        $imageSize = getimagesize($actualFile);
        $expected = [
            'mime' => 'application/zip',
            'size' => filesize($actualFile),
            'unsupport' => TRUE
        ];

        $actual = Helper::parseObjectToFile($actual);

        $this->assertEquals($expected, $actual);
        unset($actual);
    }

    public function testParseObjectToFile_Plain()
    {
        $expected = [
            'mime' => 'text/plain',
            'size' => '10',
            'raw' => '0123456789'
        ];

        $actual = '0123456789';

        $actual = Helper::parseObjectToFile($actual);

        $this->assertEquals($expected, $actual);
    }

    public function testParseObjectToFile_Img()
    {
        $actualFile = APPPATH . '../www/static/images/logo.png';
        $actual = file_get_contents($actualFile);

        $imageSize = getimagesize($actualFile);
        $expected = [
            'mime' => 'image/png',
            'size' => filesize($actualFile),
            'width' => $imageSize[0],
            'height' => $imageSize[1],
            'base64Encoded' => base64_encode($actual)
        ];

        $actual = Helper::parseObjectToFile($actual);

        $this->assertEquals($expected, $actual);
        unset($actual);
    }
}
