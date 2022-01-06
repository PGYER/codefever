<script src="/static/vendor/jquery-3.5.0/jquery.min.js" type="text/javascript"></script>
<script src="/static/vendor/bootstrap-4.4.1/js/bootstrap.bundle.min.js" type="text/javascript"></script>
<script src="/static/vendor/jquery-validation-1.19.1/dist/jquery.validate.min.js" type="text/javascript"></script>
<script src="/static/<?php echo RELEASENUMBER;?>/script/common.js" type="text/javascript"></script>
<script src="/static/<?php echo RELEASENUMBER;?>/script/scrollAnimation.js" type="text/javascript"></script>
<script src="/static/vendor/intltel/js/intlTelInput.js"></script>
<script src="/static/vendor/toastr/toastr.js" type="text/javascript"></script>

<script>
  function pregEmail(email) {
    return /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(email)
  }

  function pregTel(tel, isChina) {
    if (isChina) {
      return /^1[3456789]\d{9}$/.test(tel);
    }

    return /^[0-9]{5,11}$/.test(tel)
  }
</script>
