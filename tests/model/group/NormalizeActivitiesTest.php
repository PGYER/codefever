<?php
namespace Group;

use PHPUnit\Framework\TestCase;

class NormalizeActivitiesTest extends TestCase {
    public function setUp()
    {
        global $CI;
        $CI->load->model('Group_model', 'groupModel');
    }

    public function activitiesProvider()
    {
        global $CI;

        $CI->db->limit(10);
        $data = $CI->db->get('activities');
        $data = $data->result_array();

        return [[$data]];
    }

    /**
     * @dataProvider activitiesProvider
     */
    public function testNormalizeActivities($activities)
    {
        global $CI;

        $activities = $CI->groupModel->normalizeActivities($activities);
        $this->assertIsArray($activities);

        foreach ($activities as $activity) {
            $this->assertIsArray($activity);

            $this->assertSame(32, strlen($activity['id']));
            $this->assertIsInt($activity['type']);
            $this->assertSame(32, strlen($activity['creator']));
            $this->assertSame(32, strlen($activity['group']));
            $activity['repository'] && $this->assertSame(32, strlen($activity['repository']));
            $this->assertIsArray($activity['content']);
            $this->assertIsInt($activity['time']);
        }
    }

    public function testNormalizeActivities_Empty()
    {
        global $CI;

        $excepted = [];
        $actual = $CI->groupModel->normalizeActivities([]);

        $this->assertSame($excepted, $actual);
    }
}