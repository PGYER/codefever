<!DOCTYPE html>
<html>
<head>
    <link href="/static/assets/css/plugins/toastr/toastr.min.css" rel="stylesheet">
    <?php include TPLPATH . 'center/header_center_include.php'; ?>
    <title><?php echo APP_NAME ?> | <?php echo lang('base_message'); ?></title>
</head>

<body class="top-navigation">
    <div id="wrapper">
        <div id="page-wrapper" class="gray-bg">
            <?php include TPLPATH . 'center/header.php'; ?>

            <div class="row">
                <div class="col-lg-10 col-lg-offset-1">
                    <div class="wrapper wrapper-content">

                    <?php
                    if (!$redirectButtonTitle) {
                        $redirectButtonTitle = lang('base_confirm');
                    }
                    ?>

                        <div class="col-lg-12">
                            <div class="ibox ">
                                <div class="ibox-content text-center">
                                    <div class="m-t-xl"></div>
                                    <br /><br /><br /><br />
                                    <div>
                                        <h3><?php echo $message; ?></h3>
                                        <br />
                                        <?php if ($redirectURL) { ?>
                                        <a class="btn btn-primary" href="<?php echo $redirectURL; ?>"><?php echo $redirectButtonTitle; ?></a> 
                                        <?php } else { ?>
                                        <a class="btn btn-primary" href="/"><?php echo lang('base_go_home'); ?></a> 
                                        <a class="btn btn-primary" href="#" onclick="javascript:window.history.go(-1);"><?php echo lang('base_go_prepage'); ?></a>
                                        <?php } ?>
                                        <br /><br /><br /><br />
                                    </div>
                                    <div class="m-t-xl"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <?php include TPLPATH . 'center/footer_center.php'; ?>
        </div>
    </div>

    <?php include TPLPATH . 'center/footer_center_include.php'; ?>

</body>
</html>
