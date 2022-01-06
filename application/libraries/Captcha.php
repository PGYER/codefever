<?php
/**
 * Image_Captcha
 * 
 * 作者:  石瑞 (shirui@gmail.com)
 * 创建时间: 2014-10-29 15:04:16
 * 修改记录: 
 * 
 * $Id$
 */

class Image_Captcha {

    /**
     * width
     * 生成的图片宽度
     *
     * @var integer
     */
    public $width = 74;

    /**
     * height
     * 生成的图片高度
     * 
     * @var integer
     */
    public $height = 40;

    /**
     * padding
     * 字符到图片的间距
     * 
     * @var integer
     */
    public $padding = 2;

    /**
     * backColor
     * 背景颜色
     * 
     * @var integer
     */
    public $backColor = 0xFFFFFF;

    /**
     * foreColor
     * 字体颜色
     *
     * @var integer
     */
    public $foreColor = 0x2040A0;

    /**
     * minLength 
     * 字符最小长度
     *
     * @var integer
     */
    public $minLength = 4;

    /**
     * maxLength
     * 字符最大长度
     *
     * @var integer
     */
    public $maxLength = 4;

    /**
     * fontFile
     * 字符字体
     *
     * @var string
     */
    public $fontFile;

    /**
     * code
     * 随机码
     *
     * @var string
     */
    public $code = '';

    /**
     * _instance
     * 本类的实例
     *
     * @var object
     */
    private static $_instance = null;

    /**
     * __construct
     * 构造方法
     *
     * @return void
     */
    private function __construct() {
        return true;
    }

    /**
     * getInstance
     * 获取一个Image_Captcha对象
     *
     * @return object
     */
    public static function getInstance() {
        if (self::$_instance === null) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * generate
     * 根据验证码生成图片的快捷方法
     *
     * @param  string $code
     * @return 随机码
     */
    public static function generate($code) {
        $captcha = self::getInstance();
        $captcha->createImage($code);
        return $captcha->getText();
    }

    /**
     * setWidth
     * 设置宽度
     *
     * @param  integer $num
     * @return void
     */
    public function setWidth($num) {
        $this->width = $num;
    }

    /**
     * setHeight
     * 设置高度
     *
     * @param  integer $num
     * @return void
     */
    public function setHeight($num) {
        $this->height = $num;
    }

    /**
     * 生成图片
     *
     * @param  strng $code 验证码
     * @return void
     */
    public function createImage($code = null) {
        if (!$code) {
            $code = $this->getText();
        }

        $this->renderImage($code);
    }

    /**
     * getText
     * 获取验证码
     * 
     * @return string 验证码
     */
    public function getText() {
        if (!$this->code) {
            $this->code = $this->generateVerifyCode();
        }
        return $this->code;
    }

    /**
     * generateVerifyCode
     * 产生一个随机验证码
     * 
     * @return string 验证码
     */
    protected function generateVerifyCode() {
        if($this->minLength < 3) {
            $this->minLength = 3;
        }

        if($this->maxLength > 20) {
            $this->maxLength = 20;
        }

        if($this->minLength > $this->maxLength) {
            $this->maxLength = $this->minLength;
        }

        $length = rand($this->minLength, $this->maxLength);

        $letters = 'bcdfghjkmnpqrstvwxyz23456789';
        $vowels = 'aeiu';
        $code = '';
        for($i = 0; $i < $length; ++$i) {
            if($i % 2 && rand(0, 10) > 2 || !($i % 2) && rand(0, 10) > 9) {
                $code .= $vowels[rand(0, 3)];
            } else {
                $code .= $letters[rand(0, 27)];
            }
        }

        return $code;
    }

    /**
     * renderImage
     * 生成验证码图片
     *
     * @param  string $code 验证码
     * @return void
     */
    protected function renderImage($code) {
        $image = imagecreatetruecolor($this->width, $this->height);
        $backColor = imagecolorallocate($image,
                                        (int)($this->backColor % 0x1000000 / 0x10000),
                                        (int)($this->backColor % 0x10000 / 0x100),
                                        $this->backColor % 0x100);
        imagefilledrectangle($image, 0, 0, $this->width, $this->height, $backColor);
        imagecolordeallocate($image, $backColor);

        $foreColor=imagecolorallocate($image,
                                      (int)($this->foreColor % 0x1000000 / 0x10000),
                                      (int)($this->foreColor % 0x10000 / 0x100),
                                      $this->foreColor % 0x100);

        if($this->fontFile === null) {
            $this->fontFile = dirname(__FILE__).'/Captcha/Duality.ttf';
        }

        $offset = 1;
        $length = strlen($code);
        $box = imagettfbbox(30, 1, $this->fontFile, $code);
        $w = $box[4] - $box[0] - $offset * ($length-1);
        $h = $box[1] - $box[5];
        $scale = min(($this->width - $this->padding * 2) / $w,
                     ($this->height - $this->padding * 2) / $h);

        $x = 10;
        $y = round($this->height * 27 / 40);
        for($i = 0; $i <= $length; ++$i) {
            $fontSize = (int)(rand(26, 32) * $scale * 0.8);
            $angle = rand(-10, 10);
            $letter = $code[$i];
            $box = imagettftext($image, $fontSize, $angle,
                                $x, $y, $foreColor, $this->fontFile, $letter);
            $x = $box[2] - $offset;
        }

        imagecolordeallocate($image, $foreColor);

        header('Pragma: public');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Content-Transfer-Encoding: binary');
        header("Content-type: image/png");

        imagepng($image);
        imagedestroy($image);
    }

}
