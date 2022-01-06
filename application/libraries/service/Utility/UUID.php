<?php
// this function use to generated uuid
namespace service\Utility;

class UUID {
    static function getUUID(string $salt = '') {
        $data = microtime(FALSE);
        $data .= md5($data);
        $data .= rand().rand().rand().rand().rand();
        $data .= $salt;
        $hash = strtoupper(hash('ripemd128', $data));
        $uuid = substr($hash, 0, 8) . '-' . substr($hash, 8, 4) . '-' . substr($hash, 12, 4) . '-' . substr($hash, 16, 4) . '-' . substr($hash, 20, 12);
        return $uuid;
    }

    static function getKey() {
        return md5(time() . rand() . rand() . rand() . uniqid());
    }

}
