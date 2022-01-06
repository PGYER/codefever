<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class NormalizeReviewersTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Repository_model', 'repositoryModel');
    }

    public function reviewersProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('merge_request_reviewers');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider reviewersProvider
     */
    public function testNormalizeReviewers($reviewers)
    {
        global $CI;

        $reviewers = $CI->repositoryModel->normalizeReviewers($reviewers);
        $this->assertIsArray($reviewers);

        foreach ($reviewers as $reviewer) {
            $this->assertEquals(32, strlen($reviewer['id']));
            $this->assertEquals(32, strlen($reviewer['user']));
            $this->assertIsBool($reviewer['isReview']);
        }
    }
}
