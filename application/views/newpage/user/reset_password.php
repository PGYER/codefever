<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>CodeFever</title>
    <?php include TPLPATH . 'newpage/header_include.php'; ?>
</head>
<body class="with-header-border login-body">
<?php $appId = '_pgyer_codefever_'; ?>
<section class="reset-section-1 section-body">
    <div class="row no-gutters text-center text-dark flexRow">
        <div class="activityBox">
            <?php include TPLPATH . 'newpage/login_activity.php'; ?>
        </div>
        <div class='login-wrap flexRowCenter' style="position:relative;flex-grow: 1;">
            <div class="login-wrap-inner col-12 col-lg-8 col-md-8 col-sm-10">
                <form name="form" id="form" class="form-horizontal" method="post" action="?mode=<?php echo $mode?>" onsubmit="return false">
                    <div class="login-top">
                        <div class="login-top-des color-2F3950 font-26"><?php echo $mode === 'reset' ? lang('user_password_retrieval') : lang('user_password_retrieval_title'); ?></div>
                    </div>
                    <?php if ($mode === 'reset') {;?>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <div class="input-group">
                                <input type="password" class="form-control form-control-lg login-placeholder" name="password" id="password" placeholder="<?php echo lang('user_password_retrieval_enter_password')?>" value="" required maxlength='18' onkeyup="checkPwdStrength()">
                                <div class="input-group-append pwd-strength flexRowCenter weak hidden">
                                    <span></span>
                                    <span><?php echo lang('user_register_password_strength');?>&nbsp;</span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <input type="password" class="form-control form-control-lg login-placeholder" name="re_password" id="re_password" placeholder="<?php echo lang('user_password_retrieval_re_enter_password')?>" value="" required onkeyup="this.value=this.value.replace(/[\u4e00-\u9fa5]|\s/ig,'')">
                        </div>
                    <?php } else {;?>
                        <!--邮箱找回-->
                        <div class="form-group" style="margin-bottom: 20px;">
                            <input type="text" class="form-control form-control-lg login-placeholder" name="email" id="email" value="" placeholder="<?php echo lang('user_form_email_tel')?>" required onkeyup="this.value=this.value.replace(/[\u4e00-\u9fa5]|\s/ig,'')">
                        </div>
                        <div class="form-group phone-validate" style="margin-bottom: 20px;">
                            <div class="input-group">
                                <input type="text" class="form-control form-control-lg login-placeholder" value="" name="emailCode" id="emailCode" value="" placeholder="<?php echo lang('user_form_email_code')?>" required maxlength='6' onkeyup="this.value=this.value.replace(/\D/ig,'')" autocomplete="off">
                                <span class="input-group-append">
                                    <button type="button" class="btn color-primary color-<?php echo $appId;?> get_code_button border-left-0" id="btn_get_code"><?php echo lang('user_form_get_code')?></button>
                                </span>
                            </div>
                        </div>
                    <?php };?>
                    <div class="form-group mt-50">
                        <input id="submit" type="submit" name="submit" class="btn btn-lg btn-self-primary btn-block btn-primary-<?php echo $appId;?>" value="<?php echo $mode === 'reset' ? lang('user_password_retrieval_reset_password') : lang('user_form_verfiy');?>">
                    </div>

                    <div class="form-group">
                        <p class="text-center" style="margin-bottom:20px;"><?php echo $message;?></p>
                    </div>

                </form>
            </div>
        </div>
    </div>
</section>

<?php include TPLPATH . 'newpage/footer_include.php'; ?>

<!-- App scripts -->
<script type="text/javascript">
jQuery.validator.addMethod("regex",
    function (value, element, params) {  //  addMethod第2个参数:验证方法，参数（被验证元素的值，被验证元素，参数）
      var exp = new RegExp(params); //  实例化正则对象，参数为传入的正则表达式
      return exp.test(value);         //测试是否匹配
    }
, "格式错误"); // addMethod第3个参数:默认错误信息
jQuery.validator.addMethod("regexTel",
    function (value, element, params) {  //  addMethod第2个参数:验证方法，参数（被验证元素的值，被验证元素，参数）
        var telExp = intltelInput.getCode() == 86 ? /^1[3456789]\d{9}$/ : /^[0-9]{5,11}$/
        var exp = new RegExp(telExp); //  实例化正则对象，参数为传入的正则表达式
        return exp.test(value);         //测试是否匹配
    }
, "格式错误"); // addMethod第3个参数:默认错误信息

var validateMobileCodeTimes = 0;
var tickingSecond = 120;
var key = '<?php echo $key; ?>'
var mode = '<?php echo $mode; ?>'

function send() {
    var sendForm = $('#form').serialize();
    sendForm += '&key=' + key;
    sendForm += '&mode=' + mode;

    $.ajax({
        type : "POST",
        data : sendForm,
        url: "/user/resetPassword",
        dataType: 'json',
        cache: false,
        beforeSend: function(xhr) {
            $('#submit').attr('disabled', 'disabled');
            $('input').attr('disabled', 'disabled');
        },
        success : function(result, textStatus, jqXHR) {
            if(result.code) {
                $('#submit').removeAttr('disabled');
                $('input').removeAttr('disabled');
                alertMessage(result.message);
            }
            redirect = result.extra.redirect;
            if (redirect) {
                window.location.href = redirect;
            }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            $('#submit').removeAttr('disabled');
            $('input').removeAttr('disabled');
        }
    });
}

function getResetPasswordCode() {
    var sendForm = $('#form').serialize();    
    var email = $('input[name=email]').val();

    if (!email) {
        alertMessage('<?php echo lang('user_form_email');?>')
        return false;
    }
    if (!pregEmail(email)) {
        alertMessage('<?php echo lang('user_form_email_error');?>')
        return false;
    }

    $.ajax({
        type : "POST",
        data : sendForm,
        url : "/user/getResetPasswordCode",
        dataType: 'json',
        cache: false,
        beforeSend: function(xhr) {
            $('#btn_get_code').text('<?php echo lang('user_form_sending')?>').attr('disabled', 'disabled').addClass('color-grey');
        },
        success : function(result, textStatus, jqXHR) {
            if(result.code) {
                alertMessage(result.message);
                $('#btn_get_code').text('<?php echo lang('user_form_get_code')?>').removeAttr('disabled').removeClass('color-grey');
            } else {
                //calculate Record
                validateMobileCodeTimes++;
                startTicking();
            }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            $('#btn_get_code').text('<?php echo lang('user_form_get_code')?>').removeAttr('disabled').removeClass('color-grey');
        }
    });
}

$(document).ready(function(){
    $("#form").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            emailCode: {
                required: true
            },
            password: {
                required: true,
                minlength: 6
            },
            re_password: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            email: {
                required: "<?php echo lang('user_form_email')?>",
                email: "<?php echo lang('user_form_email_error')?>"
            },
            emailCode : {
                required: "<?php echo lang('user_form_email_code');?>",
            },
            password: {
                required: "<?php echo lang('user_form_password')?>",
                minlength: "<?php echo lang('user_form_password_min_error')?>"
            },
            re_password: {
                required: "<?php echo lang('user_form_password_re')?>",
                equalTo: "<?php echo lang('user_form_password_re_error')?>"
            }
        },
        submitHandler: function(form) {
            send();
        },

        errorPlacement: function(error, element) {
            error.appendTo(element.parents('.form-group'));
        },
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        focusInvalid: false,
        focusCleanup: true
    });
});

function startTicking() {
    if(tickingSecond > 0) {
        $('#btn_get_code').text('<?php echo lang('user_form_code_sent')?> (' + tickingSecond + 's)').attr('disabled', 'disabled').addClass('color-grey');
        setTimeout(startTicking, 1000);
        tickingSecond --;
    } else {
        $('#btn_get_code').text('<?php echo lang('user_form_get_code_re')?>').removeAttr('disabled').removeClass('color-grey');
        tickingSecond = 120;
    }
}

function alertMessage(message) {
    toastr.error(message)
}

$(document)
  .on('click', '#btn_get_code', getResetPasswordCode)

// 国际区号
var intltelInput = setIntlInput("#tel");
</script>

</body>
</html>
