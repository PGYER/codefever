<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class getCommitsTest extends TestCase {

    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function test_main()
    {
        global $CI;

        $uKey = TESTING_USER_KEY;
        $rKey = TESTING_REPOSITORY_KEY;
        $revision = TESTING_SOURCE_BRANCH_NAME;
        $keyword = TESTING_COMMON_KEYWORD;
        $page = TESTING_COMMON_PAGE;
        $perpage = TESTING_COMMON_PERPAGE;

        $result = $CI->repositoryModel->getCommits($rKey, $uKey, $revision, $keyword, $page, $perpage);

        $this->assertIsArray($result);
        if (count($result)) {
            foreach($result as $commit) {
                $this->assertSame(40, strlen($commit['sha']));
                $this->assertIsString($commit['log']);
                $this->assertIsString($commit['email']);
                $this->assertIsString($commit['time']);
            }
        }
    }

    public function test_main_empty()
    {
        global $CI;

        $result = $CI->repositoryModel->getCommits('', '', '');

        $this->assertFalse($result);
    }
}