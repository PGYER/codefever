<?php
namespace service\ErrorCode;

class ErrorCode {

    // statuscode|message
    private static $errorCode = [
        // 0x0000 Success
        0x0000 => '200|Success',

        // 0x0100 Request Error
        0x0100 => '403|Request Error',
        0x0101 => '403|Invalid Login Credential',
        0x0102 => '400|Method Not Allowed',
        0x0103 => '400|Accept and Content-Type Is Required In Header',
        0x0104 => '400|Content-Length Is Not Match The Content Size',
        0x0105 => '404|Endpoint Not Found Or Not Allowed Current Request Method',
        0x0106 => '403|Action Not Allowed',

        // 0x0200 Parameter Error
        0x0200 => '400|empty',
        0x0201 => '400|Missing Parameters',
        0x0202 => '400|Missing Amount Or Amount Out Of Range',

        // 0x0300 Busniss Error (Greneral Error)
        0x0301 => '404|Group Not Found',
        0x0302 => '404|Repository Not Found',

        // 0x0400 Busniss Error (Specific Error, getJSONData Bypassed)
        0x0401 => '400|Duplicate Repository URL Slug',
        0x0402 => '400|Duplicate Repository Display Name',
        0x0403 => '400|Duplicate Group URL Slug',
        0x0404 => '400|Duplicate Group Display Name',
        0x0405 => '400|Operate Fail',
        0x0406 => '400|New Target Exists',
        0x0407 => '404|User Not Found',
        0x0408 => '404|Can Not Add Creator As Member',
        0x0409 => '400|Can Not Delete User Group',
        0x040A => '400|Can Not Non-empty Group',
        0x040B => '400|Can Not Change Owner Of User Group',
        0x040C => '400|Old Target Not Exists',
        0x040D => '400|Duplicate SSH Key',
        0x040E => '404|File Not Found',
        0x040F => '403|Branch Proteced',
        0x0410 => '403|Password Not Correct',
        0x0411 => '403|MFA Code Invalid',
        0x0412 => '403|MFA Code Invalid (2)'
    ];

    public static function parse (int $errcode) {
        $message = explode('|', self::$errorCode[$errcode]);
        return [$message[0], $message[1]];
    }
}