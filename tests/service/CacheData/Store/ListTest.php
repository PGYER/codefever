<?php
namespace Store;

use PHPUnit\Framework\TestCase;
use service\CacheData\Store;

class ListTest extends TestCase {
    protected $store;

    public function setUp()
    {
        $this->store = new Store();
    }

    public function testList()
    {
        $excepted = [
            'key1' => 'value1',
            'key2' => 'value2',
            'keyOther' => 'valueOther',
            'key3' => [
                'value3'
            ]
        ];
        foreach ($excepted as $key => $value) {
            $this->store->set($key, $value);
        }

        $actual = $this->store->list();

        $this->assertSame($excepted, $actual);

        // test __toString
        $excepted = json_encode($actual);
        ob_start();
        echo $this->store;
        $actual = ob_get_clean();
        $this->assertSame($excepted, $actual);
    }

    public function tearDown()
    {
        unset($this->store);
    }
}
