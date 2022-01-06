<?php
namespace Repository;
use PHPUnit\Framework\TestCase;

class normalizeTest extends TestCase
{
    protected $CI;
    protected function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function dataProvider()
    {
        $data = [];
        // empty data
        array_push($data, [[]]);
        // invalid data
        array_push($data, [[[], null ,123, false]]);
        // real data
        global $CI;
        $CI->db->limit(20);
        $query = $CI->db->get('repositories');
        $realData = $query->result_array();
        array_push($data, [$realData]);
        return $data;
    }

    /**
     * @dataProvider dataProvider
     */
    public function test_main($input)
    {
        $output = $this->CI->repositoryModel->normalize($input);
        // check structure
        $this->assertIsArray($output);
        // check value type
        foreach ($output as $item) {
            $this->assertIsString($item['id']);
            $item['icon'] !== NULL && $this->assertIsString($item['icon']);
            $this->assertIsString($item['displayName']);
            $this->assertIsString($item['name']);
            $this->assertIsString($item['description']);
            $this->assertIsString($item['owner']);
            $item['forkFrom'] !== NULL && $this->assertIsString($item['forkFrom']);
            $this->assertIsInt($item['created']);
            $this->assertIsInt($item['updated']);
            $this->assertIsArray($item['group']);
            $this->assertIsInt($item['forkCount']);
            $this->assertIsArray($item['mergeRequestCount']);
        }
    }
}