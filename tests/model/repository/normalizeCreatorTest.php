<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class normalizeCreatorTest extends TestCase {
    protected $CI;
    public function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        $rKey = TESTING_REPOSITORY_KEY;
        global $CI;

        $data = $CI->repositoryModel->normalizeCreator($rKey);

        $this->assertIsArray($data);
        $this->assertIsString($data['id']);
        $this->assertIsString($data['icon']);
        $this->assertIsString($data['name']);
        $this->assertIsString($data['email']);
        $this->assertIsInt($data['role']);
        $this->assertIsInt($data['joined']);
        $this->assertIsBool($data['groupMember']);
        $this->assertIsBool($data['creatorFlag']);
        $this->assertIsBool($data['deleteFlag']);
    }
}