<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title><?php echo lang('user_form_page_title');?></title>
    <?php include TPLPATH . 'newpage/header_include.php'; ?>
    <style>
        .cursorPointer {
            cursor: pointer;
        }
        .color-disabled{
            color: #BCC3CF;
        }
    </style>
</head>

<body class="with-header-border login-body">
<?php $appId = '_pgyer_codefever_'; ?>

<section class="login-section-1 section-body">
    <div class="row no-gutters text-center text-dark flexRow">
        <div class="activityBox">
            <?php include TPLPATH . 'newpage/login_activity.php'; ?>
        </div>
        <div class="login-wrap flexRowCenter" style="position:relative;flex-grow: 1;">
            <div class="login-wrap-inner col-12 col-lg-8 col-md-8 col-sm-10" style="position:unset;">
                <form name="loginform" id="loginform" class="form-horizontal" action="index.html" method="post" onsubmit="return false">
                    <div class="login-top flexRowCenter">
                        <div class="text-center login-logo" style="margin-left:-4px"><img src="/static/images/header-codefever-logo.png"></div>
                        <div class="ml-20 flexColumn">
                            <div class="login-top-des color-2F3950 font-26"><?php echo lang('user_form_page_welcome'); ?></div>
                            <div class="color-687089 font-14">CodeFever</div>
                        </div>
                    </div>
                    <div class="tap-content account-content">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="text" class="form-control form-control-lg login-placeholder" name="email" id="email" style="ime-mode:disabled;" value="<?php echo $email?>" placeholder="<?php echo lang('user_form_email_tel');?>" required>
                        </div>
                        <div class="form-group">
                            <input type="password" class="form-control form-control-lg login-placeholder" name="password" id="password" placeholder="<?php echo lang('user_form_password')?>" value="" required>
                        </div>
                    </div>
                    <div class="forget-sign row no-gutters justify-content-between">
                        <a class="color-primary color-<?php echo $appId;?> resetPassword" href="/user/resetPassword"><?php echo lang('user_form_forget_password')?></a>
                    </div>
                    <div class="form-group mb-20" style="margin-top:20px;">
                        <input type="submit" id='submitButton' name="submit" class="btn btn-lg btn-self-primary btn-block btn-primary-<?php echo $appId;?>" value="<?php echo lang('user_login_btn_login'); ?>">
                    </div>
                    <?php if(YAML_ALLOWREGISTER){;?>
                        <span class="color-AAB0C4"><?php echo lang('user_login_no_account')?><a href="/user/register?bind=<?php echo $bind;?>" class="color-primary color-<?php echo $appId;?>" id="register-btn"><?php echo lang('user_login_register_new')?></a></span>
                    <?php };?>
                </form>
            </div>
        </div>
    </div>
</section>

<?php include TPLPATH . 'newpage/footer_include.php'; ?>

<script>

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

function login(data) {
    var loginForm = $('#loginform').serialize();
    $.ajax({
        type : "POST",
        data : loginForm,
        url : "/user/login",
        dataType: 'json',
        cache: false,
        headers: {
            'Accept': 'application/json'
        },
        beforeSend: function( xhr ) {
            $('#submitButton').attr('disabled', 'disabled');
        },
        success : function(result, textStatus, jqXHR) {
            $('#submitButton').removeAttr('disabled');
            code = result.code;
            if (code == 0) {
                window.location.href = result.extra.redirect;
            } else if (code == 100 && result.extra.key) {
                window.location.href = '/user/verify?key=' + result.extra.key;
            } else {
                alertMessage(result.message);
            }
        },
        error : function(jqXHR, textStatus, errorThrown) {
            $('#submitButton').removeAttr('disabled');
        }
    });
}


function alertMessage(message) {
    toastr.error(message)
}

$(document).ready(function(){
    $("#loginform").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "<?php echo lang('user_form_email_tel')?>",
                email: "<?php echo lang('user_form_email_error')?>"
            },
            password: {
                required: "<?php echo lang('user_form_password')?>",
                minlength: "<?php echo lang('user_form_password_min_error')?>"
            }
        },
        submitHandler: function(form) {
            login();
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
// 国际区号
var intltelInput = setIntlInput("#tel");
</script>

</body>
</html>
