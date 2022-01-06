<html>
<head>
    <link href="/static/assets/css/plugins/toastr/toastr.min.css" rel="stylesheet">
    <?php include TPLPATH . 'center/header_center_include.php'; ?>
    <title><?php echo APP_NAME ?> | <?php echo lang('base_message'); ?></title>
</head>

<body class="gray-bg">
    <div class="middle-box text-center animated fadeInDown" style="margin-top:50px;">
        <div class="error-desc margin-bottom-20">
            <img src="/static/images/disable.png" style="width:120px;height:120px;"/>
        </div>
        <h3 class="font-bold"><?php echo $message;?></h3>
        <div class="error-desc">
        </div>
    </div>
</body>
</html>
