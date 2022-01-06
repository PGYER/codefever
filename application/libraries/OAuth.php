<?php
/**
 * OAuth
 *
 * 作者:  石瑞 (shirui@comsenz.com)
 * 创建时间: 2010-07-16 13:33:21
 * 修改记录:
 *
 * $Id: OAuth.php 21 2010-10-08 06:47:25Z shirui $
 */

class OAuth {

    /**
     * 请求方式
     */
    const REQUEST_SCHEME_HEADER      = 'header';
    const REQUEST_SCHEME_POSTBODY    = 'postbody';
    const REQUEST_SCHEME_QUERYSTRING = 'querystring';

    /**
     * HTTP请求方法
     */
    const GET                        = 'GET';
    const POST                       = 'POST';
    const PUT                        = 'PUT';
    const DELETE                     = 'DELETE';
    const HEAD                       = 'HEAD';

    /**
     * _config
     * 默认配置
     *
     * @var array
     */
    protected $_config = array(
                               'requestScheme' => self::REQUEST_SCHEME_POSTBODY,
                               'requestMethod' => self::POST,
                               'signatureMethod' => 'HMAC-SHA1',
                               'version' => '1.0',
                               );

    /**
     * setConfig
     *
     * @param  string $key
     * @param  mixed $value
     * @return object OAuth
     */
    public function setConfig($key, $value = null) {

        if (is_array($key)) {
            $this->_config = array_merge($this->_config, $key);
        } else {
            $this->_config[$key] = $value;
        }

        return $this;
    }

    /**
     * getConfig
     *
     * @param  string $key
     * @return mixed
     */
    public function getConfig($key = null) {

        if (!$key) {
            return $this->_config;
        }

        return $this->_config[$key];
    }

}
