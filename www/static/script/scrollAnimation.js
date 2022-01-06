
/*
  *   效果：页面滚动到元素位置时显示出该元素
  *   使用方法
  *   <div class="listen-element">
  *       <div class="animation-y">xxxxxx</div>
  *       <img class="animation-o delay-1" />
  *   </div>
  *   <script>
  *       var an = new WindowScrollAnimation();
  *   </script>
  * */


// 监听滚动后显示动画元素
function WindowScrollAnimation (listenElementName, runClassName) {
    this.listenElementName = listenElementName ? listenElementName : 'listen-element';
    this.runClassName = runClassName ? runClassName : 'running';

    this.init();
}

WindowScrollAnimation.prototype = {
    init: function () {
        this.startListenElement();
    },
    startListenElement: function () {
        var self = this;
        self.scrollEvent();
        $(document).on('scroll', function() {self.scrollEvent()});
    },
    scrollEvent: function () {
        var self = this;
        var scrollTop =  $(window).scrollTop(),
        height = $(window).height(),
        top = 0,
        bottom = 0;
        $('.' + self.listenElementName).each(function (key, item) {
            top = $(item).offset().top - scrollTop;
            bottom = top - height;
            top = top + $(item).height();
            if (bottom < 30 && top > 10 && !$(item).hasClass(self.runClassName)) {
                $(item).addClass(self.runClassName);
                $(item).removeClass(self.listenElementName);
            }
        });

        if ($('.' + self.listenElementName).length == 0) {
            $(document).off('scroll', this.scrollEvent);
        }
    }
}
