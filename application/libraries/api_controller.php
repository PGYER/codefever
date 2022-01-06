<?php

class API_Controller extends CI_Controller {

    protected $_get_args = array();
    protected $_post_args = array();
    protected $_args = array();

    public function __construct()
    {
        parent::__construct();

        $this->load->config('rest');

        $this->_get_args = array_merge($this->_get_args, $this->uri->ruri_to_assoc());
        parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY), $get);
        $this->_get_args = array_merge($this->_get_args, $get);

        $this->_post_args = $_POST;

        $this->_args = array_merge($this->_get_args, $this->_post_args);

//        $this->_checkSig();

//        $this->_log(var_export($this->_get_args, true));
//        $this->_log(var_export($this->_post_args, true));
    }

    protected function _checkSig()
    {
        $sig = $this->_get_args['sig'];
        if (!$sig) {
            $this->errorResponse(500, 'can not find signature');
        }

        $sig = strtolower($sig);

        if ($sig != $this->_genSig()) {
            $this->errorResponse(500, 'signature error');
        }
    }

    protected function _genSig()
    {
        $args = array_merge($this->_get_args, $this->_post_args);
        unset($args['sig']);

        ksort($args);
        $string = http_build_query($args);
        $string .= 'rexshi_yunhuiju_xyz';

        return md5($string);
    }

    public function _remap($object_called, $arguments)
    {
        $controller_method = $object_called;
        if (!method_exists($this, $controller_method)) {
            $this->errorResponse(501, 'Unknown method');
        }

        call_user_func_array(array($this, $controller_method), $arguments);
    }

    public function response($data = array(), $http_code = null)
    {
        if (empty($data) && $http_code === null)
        {
            $http_code = 404;
            $output = $data;

        } else {
            if (@ini_get('zlib.output_compression') == FALSE) {
                if (extension_loaded('zlib')) {
                    if (isset($_SERVER['HTTP_ACCEPT_ENCODING']) AND strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== FALSE) {
                        ob_start('ob_gzhandler');
                    }
                }
            }

            is_numeric($http_code) OR $http_code = 200;

            header('Content-Type: application/json');
            $output = json_encode($data);
        }

        header('HTTP/1.1: ' . $http_code);
        header('Status: ' . $http_code);
        header('Content-Length: ' . strlen($output));

//        $this->_log(var_export($output, true));
        echo $output;
        exit;
    }

    public function errorResponse($code, $message = '', $data = array())
    {

        $message = $message ? $message : $this->getErrorMessage($code);
        $data = $data ? $data : [];

        $data =  [
            'code' => $code,
            'message' => $message,
            'data' => $data
        ];
        return $this->response($data);
    }

    public function successResponse($data = '')
    {
        $data = array('code' => 0,
                      'message' => '',
                      'data' => $data
                      );
        return $this->response($data);
    }

    public function post($key = NULL, $xss_clean = TRUE)
    {
        if ($key === NULL) {
            return $this->_post_args;
        }

        return $this->input->post($key, $xss_clean);
    }

    public function filterXSS($input)
    {
        return htmlspecialchars($input, ENT_NOQUOTES);
    }

    public function getErrorMessage($code) {
        $errorMessages = [
            // 0x0000 success
            0x0000 => 'success',

            // 0x0100 auth error
            0x0100 => 'Authentication Error',  // 登录失败
            0x0101 => 'Authentication Required',  // 未登录
            0x0102 => 'Username/Email Exsits',  // 用户名、密码已存在
            0x0103 => 'Username/Email Not Exsits',  // 用户名、密码不存在
            0x0104 => 'Password Not Match Username/Email',  // 密码错误
            0x0105 => 'Email Password Can Not Be Empty',  // 请输入邮箱
            0x0106 => 'User Name Password Can Not Be Empty',  // 请输入用户名
            0x0107 => 'Password Can Not Be Empty',  // 请输入密码
            0x0108 => 'Name Is Too Long',  // 名称太长
            0x0109 => 'Email Format Error',  // 邮箱格式错误

            // 0x0200 input error
            0x0200 => 'Input Not Acceptable', // 参数类型错误
            0x0201 => 'Input Not Valid',  // 参数错误
            0x0202 => 'Duplicated name',  // 名称重复
            0x0203 => 'Project Not Exsits',  // 项目不存在
            0x0204 => 'Phone Number Invalid',  // 手机号错误
            0x0205 => 'Phone is Exsits',  // 手机号已存在
            0x0206 => 'No Phone Validation Code',  // 请输入手机验证码
            0x0207 => 'Phone Validation Code Invalid',  // 手机验证码错误
            0x0208 => 'Fill In The Complete Information',  // 请填写完整信息
            0x0209 => 'File Size Should Less Than 20 Mega Bytes',  // 上传文件应当小于 20 M

            // 0x0300 behavior error
            0x0300 => 'Behavior Error',  // 行为错误
            0x0301 => 'Operation Error',  // 操作失败
            0x0302 => 'Project Creation Fail',  // 项目创建失败
            0x0303 => 'Project Setting Fail',  // 项目设置失败
            0x0304 => 'Unchanged',  // 未改变
            0x0305 => 'Coupon Error', // 代金券错误
            0x0306 => 'Getting Information Error', // 获取信息出错
            0x0307 => 'Invoice Has Been Delivered', // 发票已配送
            0x0308 => 'The Order Cannot Be Applied For Invoices', // 该订单不能申请发票
            0x0309 => 'Add Failure',  // 添加失败
            0x030A => 'Delete Failure',  // 删除失败
            0x030B => 'Update Failure',  // 更新失败
            0x030C => 'Coupon Update Error',  // 代金券更新出错
            0x030D => 'Failure Of Order Payment',  // 订单支付失败请取消订单后重新提交
            0x030E => 'Order Query Error',  // 订单查询有误
            0x030F => 'Order Remove Error',  // 订单取消出错
            0x0310 => 'Get Coupon Info Error',  // 获取代金券信息错误
            0x0311 => 'Empty Set',  // 列表内容为空不能进行下一步操作
            0x0312 => 'Not Found',  // 不存在

            // 0x0400 authority error
            0x0400 => 'Authority Error',  // 权限错误
            0x0401 => 'Exceed Project Quantity Limition',  // 超出项目数量限制
            0x0402 => 'Feture Band For Demo Users',  // 功能在 Demo 账户上被禁用
        ];
        return $errorMessages[$code];
    }

    protected function _log($line = '')
    {
        $pathInfo = $_SERVER['PATH_INFO'];
        $pathInfo = trim($pathInfo, '/');
        $pathInfo = str_replace('//', '/', $pathInfo);
        $pathInfo = str_replace('/', '_', $pathInfo);

        $this->log->write($line, 'api/log_' . $pathInfo);
    }

}
