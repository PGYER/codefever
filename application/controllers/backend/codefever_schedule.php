<?php

use service\Utility\Helper;
use service\Utility\Logger;

class Codefever_schedule extends CI_Controller {
    public function __construct()
    {
        parent::__construct();
        $this->load->library('service');
        $this->config->load('schedule', true);
    }

    public function run()
    {
        $schedules = $this->config->item('crontab', 'schedule');
        if (!is_array($schedules)) {
            exit;
        }

        $now = time();
        $ciIndex = APPPATH . '../www/index.php';
        foreach ($schedules as $schedule) {
            if (Helper::isCrontabTime($schedule[0], $now) && $schedule[1] && $schedule[2]) {
                $result = (int) exec("ps aux | grep '{$schedule[2]}' | grep -v 'grep' | wc -l");
                if ($result) {
                    continue;
                }

                if ($schedule[1] == 'backend') {
                    $command = "/usr/local/php7/bin/php {$ciIndex} backend/{$schedule[2]}";
                } else if ($schedule[1] == 'customize') {
                    $command = $schedule[2];
                }

                exec("nohup {$command} > /dev/null &");
                Logger::log("nohup {$command} > /dev/null &", Logger::SCOPE_SCHEDULE);
            }
        }
    }
}
