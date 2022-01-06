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
                <form name="verifyform" id="verifyform" class="form-horizontal" action="index.html" method="post" onsubmit="return false">
                    <div class="login-top flexRowCenter">
                        <div class="text-center login-logo" style="margin-left:-4px"><img src="/static/images/header-codefever-logo.png"></div>
                        <div class="ml-20 flexColumn">
                            <div class="login-top-des color-2F3950 font-26"><?php echo lang('user_form_page_welcome'); ?></div>
                            <div class="color-687089 font-14">CodeFever</div>
                        </div>
                    </div>
                    <div class="tap-content account-content">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <input type="number" class="form-control form-control-lg login-placeholder" name="code" id="code" style="ime-mode:disabled;" value="" placeholder="<?php echo lang('user_form_code');?>" required>
                        </div>
                    </div>
                    <div class="form-group mb-20" style="margin-top:20px;">
                        <input type="submit" id='submitButton' name="submit" class="btn btn-lg btn-self-primary btn-block btn-primary-<?php echo $appId;?>" value="<?php echo lang('user_login_btn_login'); ?>">
                    </div>
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

var key = '<?php echo $key?>';

function verify(data) {
    var verifyForm = $('#verifyform').serialize();
    verifyForm += '&key=' + key;
    $.ajax({
        type : "POST",
        data : verifyForm,
        url : "/user/verify",
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
            } else {
                alertMessage(result.message);
                if (result.extra.redirect) {
                    setTimeout(function() {
                        window.location.href = result.extra.redirect;
                    }, 2000)
                }
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
    $("#verifyform").validate({
        rules: {
            code: {
                required: true,
                number: true	
            }
        },
        messages: {
            code: {
                required: "<?php echo lang('user_form_code')?>",
                number: "<?php echo lang('user_form_code')?>"
            }
        },
        submitHandler: function(form) {
            verify();
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
