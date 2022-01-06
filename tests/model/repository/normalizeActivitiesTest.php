<?php
namespace Repository;

use PHPUnit\Framework\TestCase;

class normalizeActivitiesTest extends TestCase {
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

        $CI->db->limit(5);
        $data = $CI->db->get('activities');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider dataProvider
     */
    public function testNormalizeActivities($input)
    {
        global $CI;

        $data = $CI->repositoryModel->normalizeActivities($input);
        $this->assertIsArray($data);

        foreach ($data as $activity) {
            $this->assertIsArray($activity);

            is_string($activity['id']) && $this->assertSame(32, strlen($activity['id']));
            $this->assertIsInt($activity['type']);
            $this->assertLessThanOrEqual(1795, $activity['type']);
            $this->assertGreaterThanOrEqual(513, $activity['type']);
            $this->assertSame(32, strlen($activity['creator']));
            $this->assertSame(32, strlen($activity['group']));
            $this->assertIsArray($activity['content']);
            $this->assertIsInt($activity['time']);
        }
    }
}