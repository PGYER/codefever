<!DOCTYPE html>
<html>
<head>

    <!-- Page title -->
    <title><?php echo APP_NAME?> | <?php echo lang('base_message'); ?></title>

    <?php include TPLPATH . 'console/header_include.php'; ?>

</head>
<body class="blank">

<?php include TPLPATH . 'splash.php'; ?>

<div class="color-line"></div>

<div class="error-container">
    <i class="pe-7s-way text-success big-icon"></i>
    <h1><?php echo $message?></h1>
    <strong><?php echo lang('base_error_message'); ?></strong>
    <p>
        <?php echo lang('base_error_message_tips'); ?>
    </p>
    <input type="button" class="btn  btn-success" onclick="javascript:history.go(-1)" value="<?php echo lang('base_go_prepage'); ?>" />
    &nbsp;&nbsp;&nbsp;<a href="/" class="btn btn-primary"><?php echo lang('base_go_home'); ?></a>
</div>


<?php include TPLPATH . 'console/footer_include.php'; ?>

<!-- App scripts -->
<script src="/static/scripts/homer.js"></script>

</body>
</html>
