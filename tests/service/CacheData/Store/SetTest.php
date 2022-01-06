<?php
namespace Store;

use PHPUnit\Framework\TestCase;
use service\CacheData\Store;

class SetTest extends TestCase {
    protected $store;

    public function setUp()
    {
        $this->store = new Store();
    }

    public function testSet()
    {
        $key = 'key';
        $value = 'value';
        $this->store->set($key, $value);

        $this->assertTrue($this->store->exsit($key));
    }

    public function tearDown()
    {
        unset($this->store);
    }
}
