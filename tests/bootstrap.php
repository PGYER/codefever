<?php
// set env
define('ENVIRONMENT', 'testing');

ob_start(null, 10240);
require_once './www/index.php';
ob_clean();

$CI = &get_instance();
$CI->load->library('service');
