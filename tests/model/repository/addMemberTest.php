<?php

namespace Repository;

use PHPUnit\Framework\TestCase;

class addMemberTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $result = $CI->repositoryModel->addMember(TESTING_USER_KEY_NO_RELATION, TESTING_REPOSITORY_KEY);

        $this->assertTrue($result);
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->addMember('', '');

        $this->assertFalse($result);
    }
}