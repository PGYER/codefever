<?php
namespace Store;

use PHPUnit\Framework\TestCase;
use service\CacheData\Store;

class ExsitTest extends TestCase {
    protected $store;

    public function setUp()
    {
        $this->store = new Store();
    }

    public function testExsit()
    {
        $key = 'key';
        $value = 'value';
        $this->store->set($key, $value);

        $this->assertIsBool($this->store->exsit($key));
        $this->assertIsBool($this->store->exsit('keyOther'));
    }

    public function tearDown()
    {
        unset($this->store);
    }
}
