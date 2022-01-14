<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Codefever community - Doc</title>
    <?php include TPLPATH . 'newpage/header_include.php'; ?>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-2 bg-EFF3F8 color-2F354D doc-left">
                <div><img class="doc-logo" src="/static/images/logo-community-doc.png" /></div>
                <p class="weight-600"><?php echo lang('base_directory'); ?></p>

                <?php foreach ($menu as $item) { ?>
                    <div class="menu opened">
                        <div class="menu-first flexRowRowCenter">
                            <span class="switch"></span>
                            <span class="ml-16"><?php echo $item['name']; ?></span>
                        </div>

                        <?php if ($item['submenu']) { ?>
                            <div class="menu-second">
                                <?php foreach ($item['submenu'] as $item2) { ?>
                                    <div class="ml-50"><a class="normal-link" href="/doc/<?php echo $segments[1] . '/' . $item2['path']; ?>"><?php echo $item2['name']; ?></a></div>
                                <?php } ?>
                            </div>
                        <?php } ?>
                    </div>
                <?php } ?>
            </div>

            <div class="col-md-10 doc-right">
                <div class="header flexRowCenter justifyContent">
                    <div class="title"><h1></h1></div>
                    <div>
                        <span class="lang mr-50">
                            <div class="flexRowCenter justifyContent">
                                <span><?php echo $segments[1] == 'cn' ? lang('base_cn') : lang('base_en'); ?></span>
                                <span class="switch"></span>
                            </div>
                            <div class="lang-menu">
                                <div><a class="normal-link <?php echo $segments[1] == 'cn' ? 'active' : ''; ?>" href="<?php echo '/doc/cn/' . implode('/', array_slice($segments, 2)); ?>"><?php echo lang('base_cn'); ?></a></div>
                                <div><a class="normal-link <?php echo $segments[1] == 'en' ? 'active' : ''; ?>" href="<?php echo '/doc/en/' . implode('/', array_slice($segments, 2)); ?>"><?php echo lang('base_en'); ?></a></div>
                            </div>
                        </span>
                        <a class="btn" href="/user/login"><?php echo lang('user_login_btn_login'); ?></a>
                        <a class="btn btn-self-primary" href="/user/register"><?php echo lang('user_form_register_page_title'); ?></a>
                    </div>
                </div>
                <div class="doc-content flexRowCenter justifyContent alignStart">
                    <div class="container doc markdown-body"></div>
                    <div class="doc-nav">
                        <div class="track"><div class="thumb"></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php include TPLPATH . 'newpage/footer_include.php'; ?>
    <script>
        $(function () {
            var tops = [];
            var scrollType = 0;
            var doc = `<?php echo $doc; ?>`;

            $('.doc').append(marked.marked(doc));

            $('.menu-first').on('click', function () {
                $(this).parent().toggleClass('opened');
            });

            $('.lang').on('mouseenter', function () {
                $(this).addClass('opened');
            }).on('mouseleave', function () {
                $(this).removeClass('opened');
            });

            if (doc) {
                $('.title h1').text($('.doc h1').text());

                $('.doc h3').each(function (index, item) {
                    $('.doc-nav').append('<div><a href="#' + $(item).attr('id') +  '">' + item.innerText + '</a></div>');
                    tops[index] = $(this).position().top;
                });

                $('.doc-nav a').on('click', function () {
                    scrollType = 1;
                    $('.doc-nav a').removeClass('active');
                    $(this).addClass('active');
                }).eq(0).addClass('active');

                $('.doc-right').on('scroll', function () {
                    var height = $(this).innerHeight();
                    var contentHeight = $('.doc-content').innerHeight() + 64;
                    var scrollTop = $(this).scrollTop();
                    var progress = scrollTop / (contentHeight - height) * 100;
                    var max = 100 * (1 - 28 / 300);
                    var actual = progress > max ? max : progress;

                    $('.doc-nav .thumb').css('top', actual + '%');

                    $('.title h1').css('display', scrollTop > 64 ? 'block' : 'none');

                    scrollTop > 0 ? $('.header').addClass('shadow') : $('.header').removeClass('shadow');

                    if (scrollType == 1) {
                        $(this).scrollTop(scrollTop - 64);
                        scrollType = 2;
                        return true;
                    } else if (scrollType == 2) {
                        scrollType = 0;
                        return true;
                    }

                    for (var i = 0; i < tops.length - 1; i++) {
                        var progress2 = tops[i] / contentHeight * 100;
                        if (progress2 > progress) {
                            break;
                        }
                    }

                    $('.doc-nav a').removeClass('active');
                    $('.doc-nav a').eq(i).addClass('active');
                });
            }
        });
    </script>
</body>
</html>