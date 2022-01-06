<?php

use PHPUnit\Framework\TestCase;
use service\Utility\Helper;

class GetSSHKeyTypeTest extends TestCase
{

    public function dataProvider()
    {
        $data = [];
        // empty data
        array_push($data, ['', 'ssh-rsa']);
        // invalid data
        array_push($data, ['xxxccc', 'ssh-rsa']);
        // ed25519 data
        array_push($data, ['AAAAC3NzaC1lZDI1NTE5AAAAIHYLQfFwqMaGVF+MW92cB2pR3V+eQteUGmaJSyZM3mpr', 'ssh-ed25519']);
        // rsa data
        array_push($data, ['AAAAB3NzaC1yc2EAAAADAQABAAABgQDrLnL7k/817b1iQDN0DseVfB7WZc/A2Tu5mKveTR+o6FGjAQcf/rVcRV2Kc2LNKMJSI0NtZHCfAHJhnhDqPmGc2KlX5iGb2wRS0wsD1uSGMgmIoJZJOoTrcyo8+kMlmcYUFvlLJrmt2Qcbgr6shxIFKEQ5N+MVKAOpKGJgiPrN+221aw8BdK+F5h4hpP3DCwJb8da79kmMApsv7cLZ0y0vG6DSuL/ejXBihiI1XyHhKW+S5HSc26kD0Z3gGhVrn4beGw1sPF0UvP247uLOAV8Q/msNO1k03gH1LpwXSfZaWqD6WGCOe5HuTKiXmAl7Ux2OfupK63RuHJEOBk5FgBdV5XXTGhqEa5HVVp2By814/pFyVFu9lpOEMGpGcNWtQ4Ry/yB6y+6ryxKH14BCz2SgEQ/8tlQynUhtsvZQg+MUTgFAs7b1ZlTZFuIBbW/9R3ROtRkciBQSVUmRVWX3x1Aglrb0qwY3wg8gUAdF9QjKUQgvDG8SDCMc7KngZc3XFpM=', 'ssh-rsa']);
        // ecdsa data
        array_push($data, ['AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKK+5BU15u4TSFe8E6gUKTia9d7z4ptwzQ+pZKdggcTCSeUEUlVTCzJFIo+RS4u2LcDPMEbeMwuKKN7cKgoR9EY=', 'ecdsa-sha2']);

        return $data;
    }

    /**
     * @dataProvider dataProvider
     */
    public function test_main($input, $expected)
    {
        $output = Helper::getSSHKeyType($input);
        $this->assertEquals($expected, $output);
    }
}