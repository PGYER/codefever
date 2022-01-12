<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Codefever community - Doc</title>

    <link href="/static/vendor/bootstrap-4.4.1/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
    <link href="/static/css/markdown.css" rel="stylesheet" type="text/css"/>
</head>
<body>
    <div class="container-fluid markdown-body">
        <div class="row">
            <div class="col-md-10">
                <?php
                    $path = '/doc';
                    $length = count($segments);
                    for ($i = 1; $i < $length; $i++) {
                        $path .= '/' . $segments[$i];
                        $show = $docName($path);
                        $show = $show ? $show : $segments[$i];

                        $show = $show == 'cn' ? lang('base_cn') : $show;
                        $show = $show == 'en' ? lang('base_en') : $show;
                ?>
                    <a href="<?php echo $path; ?>"><?php echo $show; ?></a>
                    <?php echo $i < $length - 1 ? '/' : ''; ?>
                <?php } ?>
            </div>

            <div class="col-md-2 text-right">
                <?php if ($segments[1] == 'cn') { ?>
                    <a href="<?php echo str_replace('/doc/cn', '/doc/en', $path); ?>"><?php echo lang('base_en'); ?></a>
                <?php } else { ?>
                    <a href="<?php echo str_replace('/doc/en', '/doc/cn', $path); ?>"><?php echo lang('base_cn'); ?></a>
                <?php } ?>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <br>
                <div class='menu'></div>
            </div>
            <div class="col-md-8">
                <div class="doc"></div>
            </div>
        </div>
    </div>

    <script src="/static/vendor/jquery-3.5.0/jquery.min.js" type="text/javascript"></script>
    <script src="/static/<?php echo RELEASENUMBER;?>/script/marked.min.js" type="text/javascript"></script>

    <script>
        var doc = `<?php echo $doc; ?>`;
        var menu = `<?php echo $menu; ?>`;

        $('.doc').append(marked.marked(doc));
        $('.menu').append(marked.marked(menu));
    </script>
</body>
</html>