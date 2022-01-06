<?php
namespace Store;

use PHPUnit\Framework\TestCase;
use service\CacheData\Store;

class GetTest extends TestCase {
    protected $store;

    public function setUp()
    {
        $this->store = new Store();
    }

    public function testGet()
    {
        $key = 'key';
        $excepted = 'value';
        $this->store->set($key, $excepted);

        $actual = $this->store->get($key);
        $this->assertSame($excepted, $actual);
    }

    public function testGet_Empty()
    {
        $actual = $this->store->get('keyOther');
        $this->assertFalse($actual);
    }

    public function tearDown()
    {
        unset($this->store);
    }
}
