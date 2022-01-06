<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class normalizeTagsTest extends TestCase {
    protected $CI;
    public function setUp()
    {
        global $CI;
        $this->CI = $CI;
        $this->CI->load->model('Repository_model', 'repositoryModel');
    }

    public function testNormalizeBranches()
    {
        global $CI;

        $tagList = ['v1', 'v2'];
        $tagList = $CI->repositoryModel->normalizeTags($tagList);

        $this->assertIsArray($tagList);

        foreach ($tagList as $tag) {
            $this->assertIsString($tag['id']);
            $this->assertIsString($tag['name']);
        }
    }
}