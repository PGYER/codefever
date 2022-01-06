// active all popover component
$('[data-toggle="popover"]').popover();

// code for slider
function Slider (selector, duration) {
    var $domSet = $(selector).parent().find('li');
    var totalDom = $domSet.length;
    var currentDomIndex = -1;
    var timer = null;

    function nextSlide () {
        currentDomIndex ++;
        currentDomIndex = currentDomIndex < totalDom ? currentDomIndex : 0;
        goToSlide(currentDomIndex)
    }

    function jumpToSlide () {
        var domIndex = 0;
        for (domIndex; domIndex < $domSet.length; domIndex ++) {
            if ($domSet[domIndex] === $(this)[0]) {
                goToSlide(domIndex);
                return true;
            }
        }
    }

    function goToSlide (tabIndex) {
        var $containerDom = $($domSet[tabIndex]).parent().parent().parent().next().find('.tab-container');
        currentDomIndex = tabIndex;
        $domSet.removeClass('active');
        $($domSet[currentDomIndex]).addClass('active');
        $containerDom.css('left', -100 * tabIndex + '%');
        start();
    }

    function stop() {
        clearTimeout(timer);
    }

    function start() {
        clearTimeout(timer);
        timer = setTimeout(nextSlide, duration);
    }

    nextSlide();
}

// set auto slide for feature page
new Slider('.feature-section-3 .tab-index li', 5000);


// 国际区号码选择插件扩展功能
function setIntlInput (id) {
    var intltelInput = document.querySelector(id);
    var intlSetedObj = null;
    if (intltelInput) {
        var intlSetedObj = window.intlTelInput(intltelInput, {
            initialCountry: "cn", // 默认
            // excludeCountries: ["jp"], //剔除的
            preferredCountries: ['cn', 'us'], // 常用
            // onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'], // 仅有
            separateDialCode: true, // 显示code
            dropdownContainer: document.body.section,
            // utilsScript: "/static/vendor/intltel/js/intlTelInput.js",
        });
    }

    work();
    return {
        getCode: getCode
    };

    function getCode (mark) {
        mark = mark ? mark + '' : '';
        return intlSetedObj ? mark + intlSetedObj.getSelectedCountryData().dialCode : '';
    }

    function work () {
        $(document).keydown(function(event) {
            if ($('.country-list').length) {
                $('.country-list > .country').show();
        　　　　if (checkKeyDownInt(event.keyCode)) {
                    searchCallingCode(event.key);
        　　　　}
            }

            function checkKeyDownInt (keyCode) {
                return keyCode >= 48 && keyCode <= 57;
            }

            function searchCallingCode (num) {
                if ($('.country-list').length) {
                    var haveOneFlag = false;
                    $('.country-list > .country').each(function(key, item) {
                        var thisCode = $(this).attr('data-dial-code');
                        if (thisCode.indexOf(num) != 0) {
                            $(this).hide();
                        } else {
                            haveOneFlag = true;
                        }
                    });
                    if (!haveOneFlag) {
                        $('.country-list > .country').show();
                    }
                }
            }
        });

        $(document).click(function() {
            if ($('.country-list').length) {
                $('.country-list > .country').show();
            }
        });
    }
}
