<?php
namespace Store;

use PHPUnit\Framework\TestCase;
use service\CacheData\Store;

class EmptyTest extends TestCase {
    protected $store;

    public function setUp()
    {
        $this->store = new Store();
    }

    public function testEmpty()
    {
        $data = [
            'key1' => 'value1',
            'key2' => 'value2',
            'keyOther' => 'valueOther',
            'key3' => [
                'value3'
            ]
        ];
        foreach ($data as $key => $value) {
            $this->store->set($key, $value);
        }

        $this->store->empty();
        $excepted = [];
        $actual = $this->store->list();

        $this->assertSame($excepted, $actual);
    }

    public function tearDown()
    {
        unset($this->store);
    }
}
