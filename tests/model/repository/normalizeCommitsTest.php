<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class normalizeCommitsTest extends TestCase {
    protected $CI;
    public function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function dataProvider()
    {
        global $CI;

        $data = [
            'sha' => 'f582c9199185d74915bcb60fea15d4de628ab6f5',
            'log' => 'add mkv file',
            'body' => '',
            'email' => 'allengu@pgyer.com',
            'time' => '1589357549'
        ];
        return [[[$data]]];
    }

    /**
     * @dataProvider dataProvider
     */
    public function test_main($input)
    {
        global $CI;

        $data = $CI->repositoryModel->normalizeCommits($input);

        $this->assertIsArray($data[0]);
        $this->assertIsString($data[0]['sha']) && $this->assertSame(40, strlen($data[0]['sha']));
        $this->assertIsString($data[0]['commit']);
        $this->assertIsString($data[0]['email']);
        $this->assertIsInt($data[0]['time']);
    }
}