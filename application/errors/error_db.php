<!DOCTYPE html>
<html>

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?php echo APP_NAME ?> | 错误</title>

    <link href="/static/assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="/static/assets/font-awesome/css/font-awesome.css" rel="stylesheet">

    <link href="/static/assets/css/animate.css" rel="stylesheet">
    <link href="/static/assets/css/style.css" rel="stylesheet">

</head>

<body class="gray-bg">


    <div class="middle-box text-center animated fadeInDown">
        <h1>500</h1>
        <h3 class="font-bold">抱歉，服务器现在有点忙</h3>

        <div class="error-desc">
            <a class="btn btn-primary" href="/center">回到<?php echo APP_NAME?>首页</a>
        </div>
        <?php file_put_contents('/tmp/bug_database_error.log', '[' . date('Y-m-d H:i:s') . "] $heading\n" . $message . "\n\n", FILE_APPEND); ?>
    </div>

    <!-- Mainly scripts -->
    <script src="/static/assets/js/jquery-2.1.1.js"></script>
    <script src="/static/assets/js/bootstrap.min.js"></script>

</body>

</html>
