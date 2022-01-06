<!DOCTYPE html>
<html>
<head>
    <title><?php echo APP_NAME; ?></title>
    <?php include TPLPATH . 'header_include.php'; ?>
</head>
<body style="background-color:#fff">
 <div style="height:100px;margin-bottom100px;">&nbsp;</div>
 <div ng-controller="nopageCtrl">
     <div class="container error-v4" style="margin-top:100px;">
         <div class="row">
             <div class="col-lg-12 col-xs-12 col-md-12 col-sm-12 text-center">
                 <p class="img-responsive center-block animated fadeInDown"><img src="/static/assets/images/404_pic.png"></p>
                 <h1 class="sorry">The page you’re looking for is not here.</h1>
                 <p class="regret">抱歉，页面不见了~</p>
                 <a href="/" role="button" class="btn btn-primary btn-border">
                     <i class="fa fa-home fa-fw"></i>
                     返回首页
                 </a>
             </div>
         </div>
     </div>
 </div>
</body>
