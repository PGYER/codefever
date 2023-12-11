<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title><?php echo lang('user_form_register_page_title');?></title>
    <?php include TPLPATH . 'newpage/header_include.php'; ?>
</head>
<body class="with-header-border login-body">
<?php $appId = '_pgyer_codefever_'; ?>
<section class="register-section-1 section-body">
    <div class="row no-gutters text-center flexRow">
        <div class="activityBox">
            <?php include TPLPATH . 'newpage/login_activity.php'; ?>
        </div>
        <div class="login-wrap flexRowCenter" style="position:relative;flex-grow: 1;">
            <div class="login-wrap-inner col-12 col-lg-8 col-md-8 col-sm-10" id='registerEmail'>
                <form name="registerform" id="registerform" class="form-horizontal" action="index.html" method="post" autocomplete="off">
                    <div class="login-top flexRowCenter">
                        <div class="text-center login-logo" style="margin-left:-4px"><img src="/static/images/header-codefever-logo.png" /></div>
                        <div class="ml-20 flexColumn">
                            <div class="login-top-des color-2F3950 font-26"><?php echo lang('user_form_register_page_welcome'); ?></div>
                            <div class="color-687089 font-14">CodeFever</div>
                        </div>
                    </div>
                    <div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="text" class="form-control form-control-lg login-placeholder" value="" name="email" id="email" value="" placeholder="<?php echo lang('user_form_register_email')?>" required onkeyup="this.value=this.value.replace(/[\u4e00-\u9fa5]|\s|;|&|\|/ig,'')">
                            <em for="email" class="invalid error"></em>
                        </div>
                    </div>

                    <div class="form-group phone-validate" style="margin-bottom: 16px;">
                        <div class="input-group">
                            <input type="password" autocomplete="new-password" class="form-control form-control-lg login-placeholder" name="password" id="password" placeholder="<?php echo lang('user_register_password')?>" value="" required maxlength='18'>
                            <em for="password" class="invalid error"></em>
                        </div>
                    </div>

                    <div class="form-group phone-validate" style="margin-bottom: 16px;">
                        <div class="input-group">
                            <input type="password" autocomplete="new-password" class="form-control form-control-lg login-placeholder" name="rePassword" id="rePassword" placeholder="<?php echo lang('user_register_re_password')?>" value="" required maxlength='18'>
                            <em for="rePassword" class="invalid error"></em>
                        </div>
                    </div>

                    <div class="form-group mt-50">
                        <input id='submitButton' type="submit" name="submit" class="btn btn-lg btn-self-primary btn-block register-btn btn-primary-<?php echo $appId;?>" value="<?php echo lang('user_register_free')?>">
                    </div>
                </form>
                <div class="forget-sign row no-gutters justify-content-between">
                    <span><?php echo lang('user_register_have_account')?><a href="/user/login" class="color-primary color-<?php echo $appId;?>"><?php echo lang('user_form_login_now')?></a></span>
                </div>
            </div>
        </div>
    </div>

</section>

<?php include TPLPATH . 'newpage/footer_include.php'; ?>
<script src="/static/script/additional-methods.js"></script>

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

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function saveData() {
    var sendForm = $('#registerform').serialize();

    $.ajax({
        type: "POST",
        data: sendForm,
        url: "/user/register",
        dataType: 'json',
        cache: false,
        beforeSend: function( xhr ) {
            $('#submitButton').attr('disabled', 'disabled');
            $('#submitButton').val('<?php echo lang('user_bind_registering'); ?>');
        },
        success: function(result, textStatus, jqXHR) {
            code = result.code;
            if (code == 0) {
                $('em.invalid').text('');
                var redirectURL = result.extra.redirect;
                window.location.href = redirectURL;
            } else {
                alertMessage(result.message);
                $('em.invalid').text('');
            }

            $('#submitButton').removeAttr('disabled');
            $('#submitButton').val('<?php echo lang('user_register_free'); ?>');
        },
        error : function(jqXHR, textStatus, errorThrown) {
            $('#submitButton').removeAttr('disabled');
            $('#submitButton').val('<?php echo lang('user_register_free'); ?>');
        }
    });
}

$(document).ready(function() {
    $('em.invalid').text('');
    var password = $("#password");
    var eye = $(".fa-eye");
         eye.click(function(){
         if(password.attr("type") == "password") {
             password.attr("type", 'text');
             eye.removeClass("fa-eye")
                 .addClass("fa-eye-slash");
         } else {
             password.attr("type", "password");
             eye.removeClass("fa-eye-slash")
                .addClass("fa-eye");
         }
    });

    $("input").focus(function() {
         $("em.invalid").text('');
    })

    $("#registerform").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            },
            rePassword: {
                required: true,
                equalTo:"#password"
            }
       },
        messages: {
            email : {
                required : "<?php echo lang('user_form_email_tel');?>",
                email:"<?php echo lang('user_form_email_tel');?>",
            },
            password : {
                required: "<?php echo lang('user_register_password');?>",
                minlength: "<?php echo lang('user_register_password_regex');?>"
            },
            rePassword: {
                required: "<?php echo lang('user_register_re_password');?>",
                equalTo: "<?php echo lang('user_form_password_re_error');?>"
            }
        },
        submitHandler: function(form) {
            saveData();
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

function alertMessage(message) {
    toastr.error(message)
}

// 国际区号
var intltelInput = setIntlInput("#tel");
</script>
</body>
</html>
