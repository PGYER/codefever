/**
 * HOMER - Responsive Admin Theme
 * version 1.8
 *
 */

// set splash show at least some second
var splashRemovableFlag = false;
setTimeout(function(){
    if(splashRemovableFlag) {
        $('.splash').css('display', 'none');
    } else {
        splashRemovableFlag = true;
    }
}, 3000)

$(document).ready(function () {

    // Add error monitor for error auto report
    setTimeout(setErrorReporter, 500);

    // Set minimal height of #wrapper to fit the window
    fixWrapperHeight();

    // Add special class to minimalize page elements when screen is less than 768px
    setBodySmall();

    if (document.getElementById('openApp')) {
        document.getElementById('openApp').onclick = function(e){
            // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
            // 否则打开a标签的href链接
            var ifr = document.createElement('iframe');
            ifr.src = 'pgyerBug://';
            ifr.style.display = 'none';
            document.body.appendChild(ifr);
            window.setTimeout(function(){
                document.body.removeChild(ifr);
            },3000)
        };
    }

});

$(window).bind("load", function () {

    // Remove splash screen after load
    if(splashRemovableFlag) {
        //  splash shows time out
        $('.splash').css('display', 'none');
    } else {
        //  splash shows not out
        splashRemovableFlag = true;
    }
});

$(window).bind("resize click", function () {

    // Add special class to minimalize page elements when screen is less than 768px
    setBodySmall();

    // Waint until metsiMenu, collapse and other effect finish and set wrapper height
    setTimeout(function () {
        fixWrapperHeight();
    }, 300);
});

function fixWrapperHeight() {

    // Get and set current height
    var headerH = 62;
    var navigationH = 0;
    var contentH = $(".content").height();

    // Set new height when contnet height is less then navigation
//    if (contentH < navigationH) {
//        $("#wrapper").css("min-height", navigationH + 'px');
//    }

    // Set new height when contnet height is less then navigation and navigation is less then window
//    if (contentH < navigationH && navigationH < $(window).height()) {
//        $("#wrapper").css("min-height", $(window).height() - headerH  + 'px');
//    }

    //:: the following feature was disabled, because of headerH not right
    // Set new height when contnet is higher then navigation but less then window
    //if (contentH > navigationH && contentH < $(window).height()) {
    //    $("#wrapper").css("min-height", $(window).height() - headerH + 'px');
    //}

}

function setBodySmall() {
    if ($(this).width() < 769) {
        $('body').addClass('page-small');
    } else {
        $('body').removeClass('page-small');
        $('body').removeClass('show-sidebar');
    }
}

function setErrorReporter() {
    window.setTracker({
        endpoint: '/api/bugReport/frontEnd',
        xhr: {
            log: {
                crossOrigin: true,
                slowRequest: true,
                timeout: true,
                error: true
            },
            origin: [
                '//bug.pgyer.com',
                '//www.pgyer.com',
                /^\/.*/,
                'qnssl.com',
                'tracup.com',
                '//up.qbox.me',
                'Reference.of.Image',
                '//a1.easemob.com'
            ],
            timeLimit: {
                send: 5000,
                load: 5000,
                total: 5000
            },
            exclude: [
                '\/api\/bugReport\/frontEnd'
            ]
        },
        resource: {
            log: {
                crossOrigin: true,
                error: true
            },
            origin: [
                '//bug.pgyer.com',
                '//www.pgyer.com',
                /^\/.*/,
                /^data.*/,
                'qnssl.com',
                'tracup.com',
                '//up.qbox.me',
                'Reference.of.Image',
                '//a1.easemob.com'
            ],
            exclude: [
                '\/api\/bugReport\/frontEnd'
            ]
        },
        script: {
            log: {
                error: true
            },
            exclude: [
                '\/api\/bugReport\/frontEnd'
            ]
        }
    });
}

Date.prototype.dateFormate = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
           '-' + (mm>9 ? '' : '0')  + mm,
           '-' + (dd>9 ? '' : '0')  + dd
         ].join('');
};

window.clientAPI = function(){
    var exportStorage = {};
    function checkEnv() {
        var userAgent = navigator.userAgent;
        var matches = userAgent.match(/TracupClient\/(\d+)\.(\d+)\.(\d+)/);
        if(matches) {
            return {
                system: true,
                version: matches[1] + '.' + matches[2] + '.' + matches[3],
            };
        } else {
            return {
                system: false,
                version: null,
            };
        }
    }

    function setExportFn(name, fn) {
        var env = checkEnv();
        if(env.system) {
            exportStorage[name] = fn;
            return fn;
        } else {
            return null;
        }
    }

    function getFn(name) {
        var env = checkEnv();
        if(env.system) {
            return exportStorage[name] ? exportStorage[name] : function (){console.warn('Method ' + name + ' is not defined...')};
        } else {
            return function (){};
        }
    }

    var API = {
        // createIssue
        set createIssue(fn) {return setExportFn('createIssue', fn);},
        get createIssue() {return getFn('createIssue');},

        // createProject
        set createProject(fn) {return setExportFn('createProject', fn);},
        get createProject() {return getFn('createProject');},

        // onNotification
        set onNotification(fn) {return setExportFn('onNotification', fn);},
        get onNotification() {return getFn('onNotification');},

        // setNotificationAsRead
        set setNotificationAsRead(fn) {return setExportFn('setNotificationAsRead', fn);},
        get setNotificationAsRead() {return getFn('setNotificationAsRead');},

        // openWindow
        set openWindow(fn) {return setExportFn('openWindow', fn);},
        get openWindow() {return getFn('openWindow');},

        versionCheck: checkEnv,
    }

    return API;
}();

// for tracup client, convert <a target="_blank"> link to API call
+function(){
    function hyperLinkClickHandler (e) {
        var url = $(e.currentTarget).attr('href');
        if(url.length) {
            window.clientAPI.openWindow({url: url, closeFn: function() {}});
        }
    }
    $(document).on('click', 'a[target="_blank"]', hyperLinkClickHandler);
}();


function constants() {
    var conts = {};
    conts['appName'] = 'Tracup';
    conts['company'] = '蒲公英';

    conts['hostingServer'] = 'http://www.pgyer.yunhuiju.com/dev';
    conts['pgyerServer'] = 'https://www.pgyer.com/';

    conts['imageQiniu'] = 'https://image.tracup.com';
    conts['imageCorp'] = '?imageMogr2/thumbnail/!200x200r/gravity/center/crop/200x200';
    conts['ticketServer'] = 'http://kf.pgyer.com';

    conts['returnSuccess'] = 0;
    conts['returnErrorNoChanged'] = 3;

    conts['globalTrue'] = 1;
    conts['globalFalse'] = 0;

    // 问题类型
    conts['issuesBug'] = 1;
    conts['issuesFeature'] = 2;
    conts['issuesTask'] = 3;

    // 问题优先级
    conts['issuesHigh'] = 1;
    conts['issuesMiddle'] = 2;
    conts['issuesLow'] = 3;

    // 问题状态
    conts['issuesNew'] = 1;
    conts['issuesProcessing'] = 2;
    conts['issuesProcessed'] = 3;
    conts['issuesUnsolved'] = 4;
    conts['issuesFeedback'] = 5;
    conts['issuesClosed'] = 6;

    conts['userRoleDefault'] = 0;
    conts['userRoleManager'] = 1;
    conts['userRoleDeveloper'] = 2;
    conts['userRoleTester'] = 3;
    conts['userRoleOwner'] = 4;
    conts['userRoleUnknown'] = 5;

    // 问题优先级css
    conts['issuesHighCss'] = "fa fa-circle text-danger";
    conts['issuesMiddleCss'] = "fa fa-circle text-warning";
    conts['issuesLowCss'] = "fa fa-circle text-success";

    // 问题类型css
    conts['issuesBugCss'] = "label label-info";
    conts['issuesFeatureCss'] = "label label-warning";
    conts['issuesTaskCss'] = "label label-success";

    conts['themeGray'] = 1;
    conts['themeOrange'] = 2;
    conts['themeYellow'] = 3;
    conts['themeGrassgreen'] = 4;
    conts['themeGreen'] = 5;
    conts['themeBlue'] = 6;
    conts['themePurple'] = 7;

    // 查看范围
    conts['CHECK_ISSUE_ALL'] = 1;
    conts['CHECK_ISSUE_FROM_ME'] = 2;
    conts['CHECK_ISSUE_FOLLOW_ME'] = 3;
    conts['CHECK_ISSUE_ASSIGN_ME'] = 4;

    // 查看范围
    conts['issueType'] = 1;
    conts['fileType'] = 2;

    // 问题活动的类型
    conts['Issue_activity_type_description'] = 7;
    conts['Issue_activity_type_title'] = 8;
    conts['Issue_activity_add_file'] = 15;

    // 最多显示用户数量，多余的自动影藏
    conts['showUserMax'] = 9;

    // localStorage 保存变量的名称
    conts['localStorageUnsavedIssue'] = 'BugTracker_unsavedIssueDraft';

    // 会员配额类型
    conts['quotaMemberLimit'] = 1;
    conts['quotaProjectLimit'] = 2;
    conts['quotaFileLimit'] = 3;
    conts['quotaSpaceLimit'] = 4;

    // 购入商品类型
    conts['productTypeMembershipNormal'] = 0;
    conts['productTypeMembershipAdvanced'] = 1;
    conts['productTypeMembershipProfessional'] = 2;
    // 购买付款方式
    conts['payMethodAlipay'] = 2;
    conts['payMethodWechat'] = 3;
    // 支付状态
    conts['payStatusSuccess'] = 1;
    conts['payStatusFail'] = 2;
    conts['payStatusReject'] = 3;
    // 发票配送状态
    conts['deliverStatusSuccess'] = 1;
    conts['deliverStatusDelivering'] = 2;
    conts['deliverStatusWaitting'] = 3;
    conts['deliverStatusClosed'] = 4;

    // 用户访问控制权限标记 User Access Control = UAC
    conts['UAC'] = [];
    // 最高权限标记
    conts['UAC']['fullPrivilege'] = 0xFFFFFFFF;

    // 成员操作 0x00 - 0x03
    conts['UAC']['memberAdd'] = 0x00; // 添加成员
    conts['UAC']['memberChangeRole'] = 0x01; // 修改角色
    conts['UAC']['memberRemove'] = 0x02; // 删除成员

    // 角色操作 0x04 - 0x07
    conts['UAC']['roleAdd'] = 0x04; // 添加角色
    conts['UAC']['roleChange'] =  0x05; // 修改角色权限
    conts['UAC']['roleRemove'] =  0x06; // 删除角色（预留）

    // 项目操作 0x10 - 0x1F
    conts['UAC']['projectInfo'] = 0x10; // 修改项目名称／描述／颜色
    conts['UAC']['projectDelete'] = 0x11; // 删除项目
    conts['UAC']['projectRecycle'] = 0x12; // 回收项目
    conts['UAC']['projectModule'] = 0x13; // 管理模块
    conts['UAC']['projectVersion'] = 0x14; // 管理版本
    conts['UAC']['projectType'] = 0x15; // 管理问题类型
    conts['UAC']['projectStatus'] = 0x16; // 管理问题状态（预留）
    conts['UAC']['projectRepository'] = 0x17; // 管理项目仓库设置
    conts['UAC']['projectImport'] = 0x18; // 导入问题
    conts['UAC']['projectWebhook'] = 0x19; // Webhook 设置
    conts['UAC']['projectTracupbot'] = 0x1A; // Tracupbot 设置

    // 文件操作 0x20 - 0x23
    conts['UAC']['fileChange'] = 0x20; // 上传／编辑文件
    conts['UAC']['fileDelete'] = 0x21; // 删除文件

    // Wiki 操作 0x24 - 0x27
    conts['UAC']['wikiChange'] = 0x24; // 创建／编辑 Wiki
    conts['UAC']['wikiDelete'] = 0x25; // 删除 Wiki
    conts['UAC']['wikiAttachmentChange'] = 0x26; // 添加／编辑附件 
    conts['UAC']['wikiAttachmentDelete'] = 0x27; // 删除附件

    // 问题操作 0x30 - 0x3F
    conts['UAC']['issueAdd'] = 0x30; // 创建问题
    conts['UAC']['issueUpdateText'] = 0x31; // 编辑问题 标题／描述
    conts['UAC']['issueUpdateMember'] = 0x32; // 编辑问题 指派／关注
    conts['UAC']['issueUpdateDeadline'] = 0x33; // 编辑问题 结束时间
    conts['UAC']['issueUpdateOption'] = 0x34; // 编辑问题 类型／模块／状态／优先级／版本
    conts['UAC']['issueClose'] = 0x35; // 关闭问题
    conts['UAC']['issueDelete'] = 0x36; // 删除问题
    conts['UAC']['issueAttachementChange'] = 0x37; // 添加／编辑附件
    conts['UAC']['issueAttachmentDelete'] = 0x38; // 删除附件
    conts['UAC']['issueExport'] = 0x39; // 导出问题
    conts['UAC']['issueMoveOut'] = 0x3A; // 移除问题/复制问题

    // 权限组
    conts['UACGROUP'] = [];

    // 项目设置菜单权限组合
    conts['UACGROUP']['projectSetting'] = [
        conts['UAC']['memberChangeRole'],
        conts['UAC']['memberRemove'],
        conts['UAC']['roleAdd'],
        conts['UAC']['roleChange'],
        conts['UAC']['roleRemove'],
        conts['UAC']['projectInfo'],
        conts['UAC']['projectDelete'],
        conts['UAC']['projectRecycle'],
        conts['UAC']['projectModule'],
        conts['UAC']['projectVersion'],
        conts['UAC']['projectType'],
        conts['UAC']['projectStatus'],
        conts['UAC']['projectRepository'],
        conts['UAC']['projectImport'],
        conts['UAC']['projectWebhook'],
        conts['UAC']['projectTracupbot'],
    ];

    // 成员管理权限组合
    conts['UACGROUP']['manageUser'] = [
        conts['UAC']['memberChangeRole'],
        conts['UAC']['memberRemove'],
    ];

    // 角色管理权限组合
    conts['UACGROUP']['manageRole'] = [
        conts['UAC']['roleAdd'],
        conts['UAC']['roleChange'],
        conts['UAC']['roleRemove'],
    ];


    // 删除项目通知
    conts['deleteProjectActiveNotify'] = 0;

    // 邀请新成员通知
    conts['newInviteNotify'] = 0;

    // 修改问题-主题通知
    conts['issueTitleActiveNotify'] = 0;

    // 修改问题-描述通知
    conts['issueDescribeActiveNotify'] = 1;

    // 修改问题-状态通知
    conts['issueStatusActiveNotify'] = 2;

    // 修改问题-指派通知
    conts['issueAssigneeActiveNotify'] = 3;

    // 修改问题-优先级通知
    conts['issuePriorityActiveNotify'] = 4;

    // 修改问题-备注通知
    conts['issueNoteActiveNotify'] = 5;

    // 修改问题-结束时间通知
    conts['issueEndtimeActiveNotify'] = 6;

    // 修改问题-关注通知
    conts['issueFollowerActiveNotify'] = 7;

    // 删除问题通知
    conts['issueDeleteActiveNotify'] = 8;

    // Tracupbot 消息机器人类型
    conts['tracupbotTypeDingding'] = 1;
    conts['tracupbotTypeSlack'] = 2;

    // 通知类型
    conts['notificationTypeDM'] = 3;
    conts['notificationTypePublic'] = 1;
    conts['notificationTypeUser'] = 2;

   return conts;
}

/**
 * HOMER - Responsive Admin Theme
 * version 1.8
 *
 */

(function () {
    angular.module('bugs', [
        'ui.router',                // Angular flexible routing
        'ngRoute',
        'ngSanitize',               // Angular-sanitize
        'ui.bootstrap',             // AngularJS native directives for Bootstrap
        'angles',                   // Chart.js
        'highcharts-ng',            // hightCharts-ng
        'cgNotify',                 // Angular notify
        'ngAnimate',                // Angular animations
        'xeditable',                // Angular-xeditable
        'ui.select',                // AngularJS ui-select
        'ui.sortable',              // AngularJS ui-sortable
        'ui.footable',              // FooTable
        'angular-ladda',            // Ladda - loading buttons
        'ui.codemirror',             // Ui Codemirror
        'angular-chartist',         // Chartist
        'checklist-model',
        'uiSwitch',
        'ngFileUpload',
        'ngCookies',
        'hc.marked',
        'angular-loading-bar',
        'bm.bsTour',                // Angular bootstrap tour
        'angular-peity',
        'mentio',
        'angularScreenfull',
        'daterangepicker',
        'toastr'

    ])
    .constant('constants', constants());

})();

/**
 * HOMER - Responsive Admin Theme
 * version 1.8
 *
 */

function configState($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider) {

    // Optimize load start with remove binding information inside the DOM element
    $compileProvider.debugInfoEnabled(true);

//    $locationProvider.html5Mode(true);

    // Set default state
    $urlRouterProvider.otherwise("/projects");

    var scrollContent = function() {
        window.scrollTo(0, 0);
    }

    $stateProvider

        // Dashboard - Main page
        .state('dashboard', {
            url: "/dashboard/:type",
            templateUrl: "views/dashboard/agile.html",
            data: {
                pageTitle: '工作台',
                specialClass: 'hide-sidebar'
            }
        })

        .state('login', {
            url: "/login",
            templateUrl: "views/user/login.html",
            data: {
                pageTitle: '用户登录',
                specialClass: 'blank'
            }
        })

        .state('register', {
            url: "/register",
            templateUrl: "views/user/register.html",
            data: {
                pageTitle: '用户注册',
            }
        })

        .state('info', {
            url: "/user/:uKey/view",
            templateUrl: "views/user/info.html",
            data: {
                pageTitle: '用户信息',
            }
        })

        // 项目

        .state('projects', {
            controller: "projectIndexCtrl",
            url: "/projects",
            templateUrl: "views/project/index.html",
            data: {
                pageTitle: '项目概览',
            }
        })

        .state('projects.newIssueFromScreenshot', {
            url: "/:fileURI",
            templateUrl: "views/project/index.html",
            data: {
                pageTitle: '项目概览',
            }
        })

        .state('project', {
            abstract: true,
            controller: "projectMainCtrl",
            url: "/project/:pKey/:viewIssueNumber",
            templateUrl: "views/common/content_project.html",
            data: {
                pageTitle: '项目',
                showNav: true
            }
        })

        .state('project.workbench', {
            url: "/workbench/:type",
            templateUrl: "views/project/agile.html",
            data: {
                pageTitle: '工作台',
                specialClass: 'hide-sidebar'
            }
        })

        .state('project.dashboard', {
            url: "/dashboard",
            templateUrl: "views/project/dashboard.html",
            data: {
                pageTitle: '项目概览',
                showNav: true
            }
        })

        // 问题
        .state('project.issue', {
            url: "/issues/:page",
            templateUrl: "views/issue/index.html",
            data: {
                pageTitle: '问题列表',
                showNav: true
            }
        })

        // 项目设置
        .state('project.setting', {
            url: "/setting",
            templateUrl: "views/project/setting/setting_frame.html",
            data: {
                pageTitle: '项目设置',
                showNav: true
            }
        })

        .state('project.setting.info', {
            url: "/info",
            templateUrl: "views/project/setting/info.html",
            data: {
                pageTitle: '项目信息',
                showNav: true
            }
        })

        .state('project.setting.user', {
            url: "/user",
            templateUrl: "views/project/setting/user.html",
            data: {
                pageTitle: '项目成员',
                showNav: true
            }
        })

        .state('project.setting.role', {
            url: "/role",
            templateUrl: "views/project/setting/role.html",
            data: {
                pageTitle: '角色管理',
                showNav: true
            }
        })

        .state('project.setting.module', {
            url: "/module",
            templateUrl: "views/project/setting/module.html",
            data: {
                pageTitle: "模块管理",
                showNav: true
            }
        })

        .state('project.setting.version', {
            url: "/version",
            templateUrl: "views/project/setting/version.html",
            data: {
                pageTitle: "版本管理",
                showNav: true
            }
        })

        .state('project.setting.type', {
            url: "/type",
            templateUrl: "views/project/setting/type.html",
            data: {
                pageTitle: "问题类型",
                showNav: true
            }
        })

        .state('project.setting.status', {
            url: "/status",
            templateUrl: "views/project/setting/status.html",
            data: {
                pageTitle: "问题状态",
                showNav: true
            }
        })

        .state('project.setting.repository', {
            url: "/repository",
            templateUrl: "views/project/setting/repository.html",
            data: {
                pageTitle: "项目仓库",
                showNav: true
            }
        })

        .state('project.setting.import', {
            url: "/import",
            templateUrl: "views/project/setting/import.html",
            data: {
                pageTitle: "问题导入",
                showNav: true
            }
        })

        .state('project.setting.webhook', {
            url: "/webhook",
            templateUrl: "views/project/setting/webhook.html",
            data: {
                pageTitle: "Webhook",
                showNav: true
            }
        })

        .state('project.setting.tracupbot', {
            url: "/tracupbot",
            templateUrl: "views/project/setting/tracupbot.html",
            data: {
                pageTitle: "Tracupbot",
                showNav: true
            }
        })


        .state('project.setting.advance', {
            url: "/advance",
            templateUrl: "views/project/setting/advance.html",
            data: {
                pageTitle: "高级设置",
                showNav: true
            }
        })

        .state('project.issue_view', {
            url: "/issue/:iNo",
            templateUrl: "views/issue/view.html",
            onEnter: scrollContent,
            data: {
                pageTitle: '问题详情',
                showNav: true
            }
        })

        .state('project.issue_view_from', {
            url: "/issue/:iNo/:referer",
            templateUrl: "views/issue/view.html",
            onEnter: scrollContent,
            data: {
                pageTitle: '问题详情',
                showNav: true
            }
        })

        // 文件
        .state('project.file', {
            url: "/file?:folderKey",
            templateUrl: "views/file/index.html",
            data: {
                pageTitle: '文件',
                showNav: true
            }
        })

        .state('project.wikis', {
            url: "/wikis",
            templateUrl: "views/wiki/wikiIndex.html",
            data: {
                pageTitle: 'Wiki'
            }
        })

        .state('project.wikiIndex', {
            url: "/wikiIndex",
            templateUrl: "views/wiki/wikiIndexes.html",
            data: {
                pageTitle: 'WikiIndex'
            }
        })

        .state('project.wiki', {
            url: "/wiki/:shortcut",
            templateUrl: "views/wiki/wiki.html",
            data: {
                pageTitle: 'Wiki'
            }
        })

        .state('project.wiki_edit', {
            url: "/wiki/:shortcut/edit",
            templateUrl: "views/wiki/wikiEdit.html",
            data: {
                pageTitle: 'Wiki Edit'
            }
        })

        .state('project.wiki_add', {
            url: "/wiki/:shortcut/add",
            templateUrl: "views/wiki/wikiAdd.html",
            data: {
                pageTitle: 'Wiki Add'
            }
        })

        // wiki 历史记录
        .state('project.wiki_history', {
            url: "/wiki/:shortcut/history",
            templateUrl: "views/wiki/wikiHistory.html",
            data: {
                pageTitle: 'Wiki'
            }
        })

        // wiki 历录
        .state('project.wiki_annotate', {
            url: "/wiki/:shortcut/:version/annotate",
            templateUrl: "views/wiki/wikiAnnotate.html",
            data: {
                pageTitle: 'Wiki'
            }
        })

        // 设置
        .state('setting', {
            url: "/setting",
            templateUrl: "views/setting/setting_frame.html",
            data: {
                pageTitle: '个人设置'
            }
        })
        .state('setting.profile', {
            url: "/profile",
            templateUrl: "views/setting/profile.html",
            data: {
                pageTitle: '个人设置'
            }
        })
        .state('setting.account', {
            url: "/account",
            templateUrl: "views/setting/account.html",
            data: {
                pageTitle: '账户信息'
            }
        })
        .state('setting.credential', {
            url: "/credential",
            templateUrl: "views/setting/credential.html",
            data: {
                pageTitle: '信息凭证'
            }
        })
        .state('setting.notification', {
            url: "/notification",
            templateUrl: "views/setting/notification.html",
            data: {
                pageTitle: '通知提醒'
            }
        })
        .state('setting.upgrade', {
            url: "/upgrade",
            templateUrl: "views/setting/upgrade.html",
            data: {
                pageTitle: '升级续费',
            }
        })
        .state('setting.transaction', {
            url: "/transaction",
            templateUrl: "views/setting/transaction.html",
            data: {
                pageTitle: '交易记录'
            }
        })
        .state('setting.invoice', {
            url: "/invoice",
            templateUrl: "views/setting/invoice.html",
            data: {
                pageTitle: '索要发票'
            }
        })



         //搜索
        .state('search', {
            url: "/search/:pKey/:keywords",
            templateUrl: "views/search/index.html",
            data: {
                pageTitle: '搜索',
                showNav: true
            }
        })

        .state('notification', {
            url: "/notification",
            templateUrl: "views/notification/index.html",
            data: {
                pageTitle: '通知'
            }
        })

        .state('activity', {
            url: "/activity/:pKey",
            templateUrl: "views/activity/index.html",
            data: {
                pageTitle: '项目动态'
            }
        })

        .state('fileview', {
            url: "/fileview/:fKey/:type",
            templateUrl: "views/fileview/index.html",
            data: {
                pageTitle: '文件预览'
            }
        })

        .state('nopage', {
            url: "/nopage",
            templateUrl: "views/nopage/index.html",
            data: {
                pageTitle: '页面不见了'
            }
        })

        // 项目权限
        .state('permission', {
            url: "/permission/:pKey",
            templateUrl: "views/project/permission.html",
            data: {
                pageTitle: '权限不足',
                showNav: true
            }
        })

        // 版本
        .state('project.version', {
            url: "/version",
            templateUrl: "views/version/index.html",
            data: {
                pageTitle: '版本列表',
                showNav: true
            }
        })

        // 版本
        .state('project.version_view', {
            url: "/version/:vKey",
            templateUrl: "views/version/view.html",
            data: {
                pageTitle: '版本详情',
                showNav: true
            }
        })

        // 统计
        .state('project.statistics', {
            url: "/statistics",
            templateUrl: "views/statistics/index.html",
            data: {
                pageTitle: '统计',
                showNav: true
            }
        })

        // 插件
        .state('widget', {
            url: "/widget",
            templateUrl: "views/widget/index.html",
            data: {
                pageTitle: '插件',
            }
        })

}

// disabled cache when xhr proceed in IE
function configHttpGetRequest( $httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.common = {};
    }
    $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
    $httpProvider.defaults.headers.common.Pragma = "no-cache";
    $httpProvider.defaults.headers.common["If-Modified-Since"] = "0";
}

angular
    .module('bugs')
    .config(configState)
    .config(configHttpGetRequest)
    .config(['markedProvider', function(markedProvider) {
        markedProvider.setOptions({gfm: true});
    }])
    .config(['markedProvider', function (markedProvider) {
        markedProvider.setRenderer({
            link: function(href, title, text) {
                    return "<a href='" + href + "'" + (title ? " title='" + title + "'" : '') + " target='_blank'>" + text + "</a>";
                }
        });
    }])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.includeBar = true;
     }])
    .config(function(toastrConfig) {
        angular.extend(toastrConfig, {
            allowHtml: false,
            closeButton: false,
            closeHtml: '<button>&times;</button>',
            extendedTimeOut: 1000,
            iconClasses: {
                error: 'toast-error',
                info: 'toast-info',
                success: 'toast-success',
                warning: 'toast-warning'
            },  
            messageClass: 'toast-message',
            onHidden: null,
            onShown: null,
            onTap: null,
            progressBar: true,
            tapToDismiss: true,
            templates: {
                toast: 'directives/toast/toast.html',
                progressbar: 'directives/progressbar/progressbar.html'
            },
            timeOut: 3000,
            titleClass: 'toast-title',
            toastClass: 'toast'
        });
    })
    .run(function($rootScope, $window, $state, $location, editableOptions, userService, constants, $templateCache) {

        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function () {
               $rootScope.$apply(function() {
               $rootScope.online = false;
        });
        }, false);
        $window.addEventListener("online", function () {
              $rootScope.$apply(function() {
              $rootScope.online = true;
        });
        }, false);

        $rootScope.$state = $state;
        $rootScope.defaultPage = 'dashboard';
        editableOptions.theme = 'bs3';

        $rootScope.userInfo = {};
        $rootScope.getUserInfo = function() {
            userService.getUserInfo().then(function(data) {
                if (data.code == constants.returnSuccess) {
                    $rootScope.userInfo = data.data;
                }
                else {
                }
            }, function(err) {
            });
        };
        $rootScope.getUserInfo();

//        $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
//
//            userService.getUserInfo().then(function(data) {
//                if (data.code == constants.returnSuccess) {
//                    // 如果切换用户就重新登录
//                    if ($rootScope.userInfo.u_key != data.data.u_key) {
//                        $window.location.href = '/user/login';
//                    }
//                }
//                else {
//                }
//            }, function(err) {
//            });
//        });

    });


//

/**
 *
 * propsFilter
 *
 */

angular
    .module('bugs')
    .filter('propsFilter', propsFilter)
    .filter('cut', cut)

    function cut() {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    };


function propsFilter(){
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();

                    // cubic fix
                    if(!item[prop]) {
                        continue;
                    }

                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
}


function dashboardService($rootScope, $http, cacheService) {

    var service = {
        getIssueCount : getIssueCount,
        getIssueListAll : getIssueListAll,
        getProjectActivityList: getProjectActivityList,
        getTypeCount:getTypeCount,
        getUserInfo:getUserInfo,
        listAll : listAll,
        getSingleIssue : getSingleIssue,
        listAllProject : listAllProject,
        getCookieVal: getCookieVal,
        setCookieVal: setCookieVal,
        getUserInfoByUsername: getUserInfoByUsername,
        updateAgileOrder: updateAgileOrder,
    };

    return service;

    function getIssueCount(params) {
        return $http({
            method: 'post',
            url: '/api/dashboard/getIssueCount',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getIssueListAll(params) {
        return $http({
            method: 'post',
            url: '/api/dashboard/listAll',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function listAllProject(params) {
        return $http({
            method: 'post',
            url: '/api/agile/listAllProject',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function listAll(params) {
        return $http({
            method: 'post',
            url: '/api/agile/listAll',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getSingleIssue(params) {
        return $http({
            method: 'post',
            url: '/api/agile/getSingleIssue',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getProjectActivityList(params) {
        return $http({
            method: 'post',
            url: '/api/dashboard/getProjectActivityList',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getTypeCount(params) {
        return $http({
            method: 'post',
            url: '/api/dashboard/getTypeCount',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data.list;
            return this.data;
        })
    }

    function getUserInfo(params) {
        return $http({
            method: 'post',
            url: '/api/dashboard/getUserInfo',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getCookieVal(params) {
        return $http({
            method: 'post',
            url: '/api/agile/getCookieVal',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function setCookieVal(params) {
        return $http({
            method: 'post',
            url: '/api/agile/setCookieVal',
            data: params,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getUserInfoByUsername(pKey, uname) {
        var cacheAPI = '/api/dashboard/getUserInfoByUsername:pKey='+pKey+':uname='+uname;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/dashboard/getUserInfoByUsername',
                data: $.param({pKey:pKey, username:uname}),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data.data;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function updateAgileOrder (pKey, psKey, iNoList, range) {
        return $http({
            method: 'post',
            url: '/api/agile/updateAgileOrder',
            data: $.param({
                pKey : pKey,
                psKey: psKey,
                iNoList: iNoList,
                range: range
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

};

angular
    .module('bugs')
    .factory('dashboardService', dashboardService)

/**
 * HOMER - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 * Sweet Alert Directive
 * Official plugin - http://tristanedwards.me/sweetalert
 * Angular implementation inspiring by https://github.com/oitozero/ngSweetAlert
 */


function sweetAlert($timeout, $window) {
    var swal = $window.swal;
    return {
        swal: function (arg1, arg2, arg3) {
            $timeout(function () {
                if (typeof(arg2) === 'function') {
                    swal(arg1, function (isConfirm) {
                        $timeout(function () {
                            arg2(isConfirm);
                        });
                    }, arg3);
                } else {
                    swal(arg1, arg2, arg3);
                }
            }, 200);
        },
        success: function (title, message) {
            $timeout(function () {
                swal(title, message, 'success');
            }, 200);
        },
        error: function (title, message) {
            $timeout(function () {
                swal(title, message, 'error');
            }, 200);
        },
        warning: function (title, message) {
            $timeout(function () {
                swal(title, message, 'warning');
            }, 200);
        },
        info: function (title, message) {
            $timeout(function () {
                swal(title, message, 'info');
            }, 200);
        }

    };
};

/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('sweetAlert', sweetAlert)


function userService($rootScope, $http, cacheService) {

    var data;
    var service = {
        getUserInfo : getUserInfo,
        getUserInfoBatch : getUserInfoBatch,
        update : update,
        getNotificationList : getNotificationList,
        getNotifications : getNotifications,
        getDmNotifications : getDmNotifications,
        getAllNotifications : getAllNotifications,
        getSystemNotifications : getSystemNotifications,
        setAllRead : setAllRead,
        setDmAllRead : setDmAllRead,
        setSystemAllRead : setSystemAllRead,
        setSystemRead : setSystemRead,
        setAsRead : setAsRead,
        checkLogged : checkLogged,
        getNotifyCount : getNotifyCount,
        getSystemNotifyCount : getSystemNotifyCount,
        getDmNotifyCount : getDmNotifyCount,
        getCode : getCode,
        confirmTel: confirmTel,
        allNotifications : allNotifications,
        allSystemNotifications : allSystemNotifications,
        allDmNotifications : allDmNotifications,
        getTicket : getTicket,
    };

    return service;

    function getUserInfo() {
        var cacheAPI = '/api/user/getLoggedInfo';
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http.get('/api/user/getLoggedInfo')
                .then(function(data){
                    this.data = data.data;
                    cacheService.setCache( cacheAPI, this.data);
                    return this.data;
            })
        }
    }

    function getUserInfoBatch(uKeys) {
        var cacheAPI = '/api/user/getUserInfoBatch:uKeys=' + uKeys;
        if( cacheService.checkCached(cacheAPI)) {
            return cacheService.getPromise(cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/user/getUserInfoBatch',
                data: $.param({
                    uKeys: uKeys,
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function checkLogged() {
        var cacheAPI = '/api/user/checkLogged';
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http.get('/api/user/checkLogged')
                .then(function(data){
                    this.data = data.data;
                    cacheService.setCache( cacheAPI, this.data);
                    return this.data;
            })
        }
    }

    function update(field, data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/user/update',
            data: $.param({
                data: data,
                field: field
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getNotificationList(data) {
        return $http({
            method: 'post',
            url: '/api/notification/getNotificationList',
            data:data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }


    function getNotifications() {
        return $http({
            method: 'post',
            url: '/api/notification/getNotifications',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getDmNotifications() {
        return $http({
            method: 'post',
            url: '/api/notification/getDmNotifications',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getAllNotifications() {
        return $http.post(
            '/api/notification/getAllNotifications',
            '',
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'},
                ignoreLoadingBar: true
            }
        ).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getSystemNotifications() {
        return $http({
            method: 'post',
            url: '/api/notification/getSystemNotifications',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function allNotifications(data) {
        return $http({
            method: 'post',
            url: '/api/notification/allNotification',
            data:data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function allSystemNotifications(data) {
        return $http({
            method: 'post',
            url: '/api/notification/allSystemNotification',
            data:data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function allDmNotifications(data) {
        return $http({
            method: 'post',
            url: '/api/notification/allDmNotification',
            data:data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getNotifyCount() {
        return $http({
            method: 'post',
            url: '/api/notification/getNotifyCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getSystemNotifyCount() {
        return $http({
            method: 'post',
            url: '/api/notification/getSystemNotifyCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getDmNotifyCount() {
        return $http({
            method: 'post',
            url: '/api/notification/getDmNotifyCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function setAllRead() {
        return $http({
            method: 'post',
            url: '/api/notification/setAllRead',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function setDmAllRead() {
        return $http({
            method: 'post',
            url: '/api/notification/setDmAllRead',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }


    function setSystemAllRead() {
        return $http({
            method: 'post',
            url: '/api/notification/setSystemAllRead',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function setSystemRead(ncKey) {
        return $http({
            method: 'post',
            url: '/api/notification/setSystemRead',
            data: $.param({
                ncKey: ncKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function setAsRead(ncKey) {
        return $http({
            method: 'post',
            url: '/api/notification/setAsRead',
            data: $.param({
                ncKey: ncKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getCode(callingCode, tel) {
        return $http({
            method: 'post',
            url: '/api/user/getCode',
            data: $.param({
                tel: tel,
                calling_code : callingCode
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function confirmTel(callingCode,tel, telCode) {
        return $http({
            method: 'post',
            url: '/api/user/confirmTel',
            data: $.param({
                tel: tel,
                telCode: telCode,
                calling_code : callingCode
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getTicket() {
        return $http({
            method: 'post',
            url: '/api/notification/getTicket',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }
};

angular
    .module('bugs')
    .factory('userService', userService)


function projectService($rootScope, $http, cacheService, toastr, constants) {

    var data;
    var service = {
        refreshProjectConfig: refreshProjectConfig,
        getData : getData,
        getList : getList,
        getAllProjectList : getAllProjectList,
        getParticipantList : getParticipantList,
        getStarList : getStarList,
        getHideList : getHideList,
        create : create,
        update : update,
        updateProjectUser : updateProjectUser,
        addUser : addUser,
        importProjectUser : importProjectUser,
        removeUser : removeUser,
        changeUserRole : changeUserRole,
        getProjectInfo : getProjectInfo,
        getIssueCount : getIssueCount,
        getIssueListAll : getIssueListAll,
        getProjectActivityList : getProjectActivityList,
        getProjectUserList : getProjectUserList,
        getAllProjectUserList : getAllProjectUserList,
        getManagUserList: getManagUserList,
        checkIsManager : checkIsManager,
        reSendMail : reSendMail,
        checkPermission : checkPermission,
        getUserProjectList : getUserProjectList,
        getOtherProjectsList: getOtherProjectsList,
        createModule: createModule,
        deleteModule: deleteModule,
        getProjectModuleList: getProjectModuleList,
        createType: createType,
        deleteType: deleteType,
        createStatus: createStatus,
        deleteStatus: deleteStatus,
        deleteProject: deleteProject,
        getProjectTypeList: getProjectTypeList,
        getProjectStatusList: getProjectStatusList,
        getAllStatusIcon: getAllStatusIcon,
        updateStatusOrder: updateStatusOrder,
        updateTypeOrder: updateTypeOrder,
        updateModuleOrder: updateModuleOrder,
        uploadIssueFile: uploadIssueFile,
        updateFieldMapping: updateFieldMapping,
        updateValueMapping: updateValueMapping,
        conductCSVImport: conductCSVImport,
        getProjectConfig: getProjectConfig,
        getProjectList: getProjectList,
        getWebhookList: getWebhookList,
        getWebhookInfo: getWebhookInfo,
        saveWebhookInfo: saveWebhookInfo,
        deleteWebhook: deleteWebhook,
        getTracupbotList: getTracupbotList,
        getTracupbotInfo: getTracupbotInfo,
        saveTracupbotInfo: saveTracupbotInfo,
        deleteTracupbot: deleteTracupbot,
        saveRole: saveRole,
        deleteRole: deleteRole,
        getInviteLink: getInviteLink,
        getAllPartners: getAllPartners,
    };

    
    // set watch for state parameters
    $rootScope.$watch('stateParams.pKey', onPKeyChange, true);

    return service;

    // set pKey change function
    function onPKeyChange(newValue, oldValue) {
        $rootScope.projectConfig = null;
        var pKey = newValue ? newValue: false;
        if(!pKey) {
            return false;
        }

        // load project config
        getProjectConfig(pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $rootScope.projectConfig = angular.copy(data.data);
            } else {
                toastr.warning('获取项目设置失败 请刷新重试');
            }
        }, function(err) {
            toastr.error("网路请求失败");
        });
    }

    function refreshProjectConfig() {
        cacheService.clearCache();
        onPKeyChange($rootScope.stateParams.pKey);
    }


    function getData(data) {
        return data.data;
    }

    function getList() {
        return $http.get('/api/project/listAll').then(function(data){
            this.data = data.data.data.list;
            return this.data;
        });
    }

    function getAllProjectList() {
        return $http.get('/api/project/getAllProjectList').then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function getParticipantList() {
        return $http.get('/api/project/listAllParticipant').then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function getStarList() {
        return $http.get('/api/project/listAllStar').then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function getHideList() {
        return $http.get('/api/project/listAllHide').then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function create(data) {
        cacheService.clearCache();
        return $http.post('/api/project/add',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data.data;
                return this.data;
            });
    }

    function update(pKey, name, backgroundColor, description) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/update',
            data: $.param({
                pKey: pKey,
                name: name,
                background: backgroundColor,
                description: description,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function updateProjectUser(pKey, field) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/updateProjectUser',
            data: $.param({
                pKey: pKey,
                field: field
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteProject(pKey) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/deleteProject',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function addUser(pKey, emails) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/addUser',
            data: $.param({
                pKey: pKey,
                emails: emails
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function importProjectUser(pKey, otherPkey) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/importProjectUser',
            data: $.param({
                pKey: pKey,
                otherPkey: otherPkey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function removeUser(pKey, uKey) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/removeUser',
            data: $.param({
                pKey: pKey,
                uKey: uKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function changeUserRole(pKey, uKey, role) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/changeUserRole',
            data: $.param({
                pKey: pKey,
                uKey: uKey,
                role: role
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function reSendMail(pKey, puKey) {
        return $http({
            method: 'post',
            url: '/api/project/reSendMail',
            data: $.param({
                pKey: pKey,
                puKey: puKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getProjectUserList(pKey, byRole) {
        return $http({
            method: 'post',
            url: '/api/project/getUserList',
            data: $.param({
                pKey: pKey,
                byRole : byRole
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getManagUserList(pKey, byRole, showInvite) {
        return $http({
            method: 'post',
            url: '/api/project/getUserList',
            data: $.param({
                pKey: pKey,
                byRole : byRole,
                showInvite : 1
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getAllProjectUserList(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/getAllProjectUserList',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function getOtherProjectsList(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/getOtherProjectsList',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function getProjectActivityList(pKey, perpage) {
        return $http({
            method: 'post',
            url: '/api/project/getProjectActivityList',
            data: $.param({
                pKey: pKey,
                perpage:perpage
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data.list;
            return this.data;
        })
    }

    function getProjectInfo(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/view',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getIssueCount(pKey) {
        return $http({
            method: 'post',
            url: '/api/issues/countByStatus',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getIssueListAll(data) {
        return $http.post('/api/issues/listAll',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data.list;
            return this.data;
        })
    }


    function getUserProjectList(data) {
        return $http({
            method: 'post',
            url: '/api/project/listUserProject',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function checkIsManager(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/isManager',
            data: $.param({
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function checkPermission(pKey) {
        var cacheAPI = '/api/project/checkPermission:pKey='+pKey;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/project/checkPermission',
                data: $.param({
                    pKey: pKey,
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }


    function createModule(data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/createModule',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteModule(data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/deleteModule',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getProjectModuleList(data) {
        var cacheAPI = '/api/project/getProjectModuleList:'+data;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/project/getProjectModuleList',
                data: data,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data.data;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function createType(data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/createType',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function createStatus(data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/createStatus',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteType(data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/deleteType',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteStatus(data) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/deleteStatus',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getProjectTypeList(data) {
        return $http({
            method: 'post',
            url: '/api/project/getProjectTypeList',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getProjectStatusList(data) {
        return $http({
            method: 'post',
            url: '/api/project/getProjectStatusList',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getAllStatusIcon() {
        return $http({
            method: 'post',
            url: '/api/project/getAllStatusIcon',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function updateStatusOrder(order) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/updateStatusOrder',
            data: $.param({
                order : order,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function updateTypeOrder(order) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/updateTypeOrder',
            data: $.param({
                order : order,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function updateModuleOrder(order) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/project/updateModuleOrder',
            data: $.param({
                order : order,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function uploadIssueFile(formData) {
        return $http({
            method:'POST',
            url:"/api/project/uploadIssueFile",
            data: formData,
            headers: {'Content-Type':undefined},
            transformRequest: angular.identity
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function updateFieldMapping(pKey, importID, fieldMappingData) {
        return $http({
            method:'POST',
            url:"/api/project/updateFieldMapping",
            data: $.param({
                pKey: pKey,
                importID: importID,
                fieldMappingData: fieldMappingData,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function updateValueMapping(pKey, importID, valueMappingData) {
        return $http({
            method:'POST',
            url:"/api/project/updateValueMapping",
            data: $.param({
                pKey: pKey,
                importID: importID,
                valueMappingData: valueMappingData,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function conductCSVImport(pKey, importID) {
        return $http({
            method:'POST',
            url:"/api/project/conductCSVImport",
            data: $.param({
                pKey: pKey,
                importID: importID
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function getProjectConfig(pKey) {
        var cacheAPI = '/api/project/config:pKey='+pKey;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/project/config',
                data: $.param({
                    pKey: pKey,
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function getProjectList() {
        var cacheAPI = '/api/project/getProjectList';
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/project/getProjectList',
                data: $.param({}),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                cacheService.setCache(cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function getWebhookList(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/getWebhookList',
            data: $.param({
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getWebhookInfo(pwKey) {
        return $http({
            method: 'post',
            url: '/api/project/getWebhookInfo',
            data: $.param({
                pwKey: pwKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function saveWebhookInfo(data) {
        return $http({
            method: 'post',
            url: '/api/project/saveWebhookInfo',
            data: $.param(data),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteWebhook(pwKey, pKey) {
        return $http({
            method: 'post',
            url: '/api/project/deleteWebhook',
            data: $.param({
                pwKey: pwKey,
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    };

    function getTracupbotList(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/getTracupbotList',
            data: $.param({
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getTracupbotInfo(pmrKey) {
        return $http({
            method: 'post',
            url: '/api/project/getTracupbotInfo',
            data: $.param({
                pmrKey: pmrKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function saveTracupbotInfo(data) {
        return $http({
            method: 'post',
            url: '/api/project/saveTracupbotInfo',
            data: $.param(data),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteTracupbot(pmrKey, pKey) {
        return $http({
            method: 'post',
            url: '/api/project/deleteTracupbot',
            data: $.param({
                pmrKey: pmrKey,
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    };

    function saveRole(pKey, roleName, roleClass, prPrivilegeSegments, prKey) {
        return $http({
            method: 'post',
            url: '/api/project/saveRole',
            data: $.param({
                pKey: pKey,
                roleName: roleName,
                roleClass: roleClass,
                prPrivilegeSegments: prPrivilegeSegments,
                prKey: prKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteRole(pKey, prKey) {
        return $http({
            method: 'post',
            url: '/api/project/deleteRole',
            data: $.param({
                pKey: pKey,
                prKey: prKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getInviteLink(pKey) {
        return $http({
            method: 'post',
            url: '/api/project/getInviteLink',
            data: $.param({
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getAllPartners() {
        return $http({
            method: 'post',
            url: '/api/project/getAllPartners',
            data: '',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

};

/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('projectService', projectService)

///

angular
    .module('bugs')
    .factory('fileService', fileService)

function fileService($rootScope, $http, cacheService) {

    var data;
    var service = {
        listFilesInFolder: listFilesInFolder,
        getFileInfo: getFileInfo,
        getUptoken: getUptoken,
    };

    return service;

    function listFilesInFolder(pKey, folderKey) {
        return $http({
            method: 'post',
            url: '/api/file/listFilesInFolder',
            data: $.param({
                folderKey: folderKey,
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    function getFileInfo(fKey, type) {
        return $http({
            method: 'post',
            url: '/api/file/getFileInfo',
            data: $.param({
                fKey: fKey,
                type: type
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    function getUptoken() {
        var cacheAPI = '/api/file/getToken';
        if(cacheService.checkCached(cacheAPI)) {
            return cacheService.getPromise(cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/file/getToken',
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                cacheService.setCache(cacheAPI, this.data);
                return this.data;
            })
        }
    }
};


function issueService($rootScope, $http, cacheService) {

    var data;
    var code;
    var message;
    var service = {
        getList : getList,
        create : create,
        update : update,
        updateFollowUser : updateFollowUser,
        view : view,
        getUserList : getUserList,
        getAuthorList : getAuthorList,
        configList : configList,
        followUserList : followUserList,
        projectUserList : projectUserList,
        getNoteList : getNoteList,
        getActivityList : getActivityList,
        getTrendList : getTrendList,
        getActivityCount : getActivityCount,
        addNote : addNote,
        updateNote : updateNote,
        deleteNote : deleteNote,
        deleteNoteFile: deleteNoteFile,
        uploadNoteFileFromFileHub: uploadNoteFileFromFileHub,
        uploadIssueFileFromFileHub: uploadIssueFileFromFileHub,
        getNoteCount : getNoteCount,
        uploadFile : uploadFile,
        getFileList : getFileList,
        getUploadTrendFileList : getUploadTrendFileList,
        getFileByUploadKey : getFileByUploadKey,
        getFileInfo : getFileInfo,
        getIssueCount : getIssueCount,
        getTypeCount : getTypeCount,
        getStatusCount : getStatusCount,
        getProjectList : getProjectList,
        countIssueByStatus : countIssueByStatus,
        getProjectInfo : getProjectInfo,
        resetIssue : resetIssue,
        renameFile : renameFile,
        getPreNext : getPreNext,
        exportIssues : exportIssues,
        getPreviewHtml : getPreviewHtml,
        duplicateIssue : duplicateIssue,
        deleteIssueFilter : deleteIssueFilter,
        saveIssueFilter : saveIssueFilter,
        getIssueFilterList : getIssueFilterList,
        requestUploadKey : requestUploadKey,
        removeImageUpload : removeImageUpload,
    };

    return service;

    function getList(data) {
        return $http({
            method: 'post',
            data: data,
            url: '/api/issues/listAll',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getIssueCount(data) {
        return $http({
            method: 'post',
            data: data,
            url: '/api/issues/getIssueCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getTypeCount(pKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getTypeCount',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data.list;
            return this.data;
        })
    }

    function getStatusCount(pKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getStatusCount',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getUserList(pKey, type) {
            return $http({
                method: 'post',
                url: '/api/issues/listUser',
                data: $.param({
                    pKey: pKey,
                    type: type
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data.data;
                return this.data;
            })
    }

    function getAuthorList(pKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getAuthorList',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getProjectList() {
        var cacheAPI = '/api/issues/listProject';
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                url: '/api/issues/listProject',
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data.data.list;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function create(data) {
        return $http.post('/api/issues/add',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data.data;
                return this.data;
            });
    }

    function view(pKey, iNo) {
        return $http({
            method: 'post',
            url: '/api/issues/view',
            data: $.param({
                pKey: pKey,
                iNo: iNo
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getProjectInfo(pKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getProjectInfo',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function followUserList(iKey) {
        return $http({
            method: 'post',
            data: $.param({
                iKey: iKey,
            }),
            url: '/api/issues/followUserList',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function configList(pKey) {
        var cacheAPI = '/api/issues/configList:pKey='+pKey;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http({
                method: 'post',
                data: $.param({
                    pKey: pKey
                }),
                url: '/api/issues/configList',
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data.data;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function projectUserList(pKey) {
        var cacheAPI = '/api/project/getUserList:pKey='+pKey;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http.post(
                '/api/project/getUserList',
                $.param({pKey: pKey}),
                {
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'},
                    ignoreLoadingBar: true
                }
            ).then(function(data){
                this.data = data.data.data.list;
                cacheService.setCache( cacheAPI, this.data);
                return this.data;
            })
        }
    }

    function update(pKey, iNo, field, data, arr) {
        return $http({
            method: 'post',
            url: '/api/issues/update',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                data: data,
                field: field,
                inoArray : arr
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }


    function getNoteList(pKey, iNo, page, perpage) {
        return $http({
            method: 'post',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                page: page,
                perpage: perpage,
            }),
            url: '/api/issues/getNoteList',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getActivityList(pKey, iNo, page, perpage) {
        return $http({
            method: 'post',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                page: page,
                perpage: perpage,
            }),
            url: '/api/issues/getActivityList',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getTrendList(pKey, iNo) {
        return $http({
            method: 'post',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
            }),
            url: '/api/issues/getTrendList',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getActivityCount(pKey, iNo) {
        return $http({
            method: 'post',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
            }),
            url: '/api/issues/getActivityCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function addNote(pKey, iNo, data, naKeyList) {
        return $http({
            method: 'post',
            url: '/api/issues/addNote',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                data: data,
                naKeyList: naKeyList,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function updateNote(pKey, inKey, inNote) {
        return $http({
            method: 'post',
            url: '/api/issues/updateNote',
            data: $.param({
                inKey: inKey,
                pKey: pKey,
                inNote: inNote
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteNote(pKey, iNo, inKey) {
        return $http({
            method: 'post',
            url: '/api/issues/deleteNote',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                inKey: inKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteNoteFile(pKey, iNo, naKey) {
        return $http({
            method: 'post',
            url: '/api/issues/deleteNoteFile',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                naKey: naKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function uploadNoteFileFromFileHub(pKey, iNo, fKeyList) {
        return $http({
            method: 'post',
            url: '/api/issues/uploadNoteFileFromFileHub',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                fKeyList: fKeyList,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function uploadIssueFileFromFileHub(pKey, iNo, fKeyList) {
        return $http({
            method: 'post',
            url: '/api/issues/uploadIssueFileFromFileHub',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                fKeyList: fKeyList,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getNoteCount(pKey, iNo) {
        return $http({
            method: 'post',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
            }),
            url: '/api/issues/getNoteCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function uploadFile(pKey, iKey, targetName, name , size, type) {
        return $http({
            method: 'post',
            url: '/api/issues/uploadIssueFileFinish',
            data: $.param({
                fileKey: targetName,
                fileName: name,
                pKey: pKey,
                iKey: iKey,
                fileSize : size,
                type: type
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function getFileList(pKey, iNo) {
        return $http({
            method: 'post',
            url: '/api/issues/getFileList',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    function getUploadTrendFileList(pKey, iNo, uploadKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getUploadTrendFileList',
            data: $.param({
                pKey : pKey,
                iNo : iNo,
                uploadKey : uploadKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function getFileByUploadKey(uploadKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getFileByUploadKey',
            data: $.param({
                uploadKey : uploadKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function getFileInfo( iaKey, fileType) {
        fileType = fileType ? fileType : 'file';
        return $http({
            method: 'post',
            url: '/api/issues/getFileInfo',
            data: $.param({
                iaKey: iaKey,
                fileType: fileType,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    function updateFollowUser(pKey, iNo, uKey, add) {
        return $http({
            method: 'post',
            url: '/api/issues/update',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                data: uKey,
                field: 'follow',
                isAdd: add
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function countIssueByStatus(data) {
        return $http.post('/api/issues/countByStatus',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data.data.data;
                return this.data;
            });
    }

    function resetIssue(data) {
        return $http.post('/api/issues/resetIssue',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data.data.data;
                return this.data;
            });
    }

    function renameFile(data) {
        return $http.post('/api/issues/renameFile',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data;
                return this.data;
            });
    }

    function exportIssues(data) {
        return $http.post('/api/issues/exportIssues',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data;
                return this.data;
            })
    }

    function getPreNext(pKey, iNo, pre) {
        return $http({
            method: 'post',
            url: '/api/issues/getPreNext',
            data: $.param({
                pKey: pKey,
                iNo: iNo,
                pre: pre,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getPreviewHtml(markdownString) {
        return $http({
            method: 'post',
            url: '/api/issues/getPreviewHtml',
            data: $.param({
                markdownString: markdownString,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function duplicateIssue (newtitle, pKey, iKey, options) {
        return $http({
            method: 'post',
            url: '/api/issues/duplicateIssue',
            data: $.param({
                newtitle : newtitle,
                pKey : pKey,
                iKey : iKey,
                options: options,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function getIssueFilterList (pKey) {
        return $http({
            method: 'post',
            url: '/api/issues/getIssueFilterList',
            data: $.param({
                pKey : pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function saveIssueFilter (pKey, name, public, filter) {
        return $http({
            method: 'post',
            url: '/api/issues/saveIssueFilter',
            data: $.param({
                pKey : pKey,
                name : name,
                public : public,
                filter : filter,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function deleteIssueFilter (pfKey) {
        return $http({
            method: 'post',
            url: '/api/issues/deleteIssueFilter',
            data: $.param({
                key : pfKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function requestUploadKey (pKey, iKey, iNo) {
        return $http({
            method: 'post',
            url: '/api/issues/requestUploadKey',
            data: $.param({
                pKey : pKey,
                iKey : iKey,
                iNo : iNo,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }

    function removeImageUpload (uploadKey) {
        return $http({
            method: 'post',
            url: '/api/issues/removeImageUpload',
            data: $.param({
                uploadKey : uploadKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        });
    }


};
/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('issueService', issueService)

///


function searchService($rootScope, $http) {

    var data;
    var service = {
        getSearchList : getSearchList,
        getSearchCount : getSearchCount,
        getProjectList : getProjectList,
        getSearchProjectList : getSearchProjectList,
        feedback : feedback
    };

    return service;


    function getSearchCount(data) {
        return $http.post('/api/search/getSearchCount',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
               this.data = data.data.data;
               return this.data;
        })
    }

    function getSearchList(data) {
        return $http.post('/api/search/getSearchList',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
               this.data = data.data.data.list;
               return this.data;
        })
    }

    function getProjectList(data) {
        return $http.post('/api/search/getProjectList',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
               this.data = data.data.data;
               return this.data;
        })
    }

    function getSearchProjectList(data) {
        return $http.post('/api/search/getSearchProjectList',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
               this.data = data.data.data.list;
               return this.data;
        })
    }


    function feedback(data) {
        return $http.post('/product/feedback',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
               this.data = data.data.data;
               return this.data;
        })
    }

};
/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('searchService', searchService)


function activityService($rootScope, $http) {

    var data;
    var service = {
        getActivityCount : getActivityCount,
        getActivityList : getActivityList,
    };

    return service;
    function getActivityCount(data) {
        return $http({
            method: 'post',
            url: '/api/activity/getActivityCount',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getActivityList(data) {
        return $http({
            method: 'post',
            url: '/api/activity/getActivityList',
            data: data,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

};

/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('activityService', activityService)


function wikiService($rootScope, $http) {

    var data;
    var code;
    var message;
    var service = {
        getWikiInfo : getWikiInfo,
        addWiki : addWiki,
        updateWiki : updateWiki,
        getHistoryList : getHistoryList,
        getHistoryCount : getHistoryCount,
        getVersionInfo : getVersionInfo,
        getWikiList : getWikiList,
        getWikiIndex : getWikiIndex,
        uploadFile : uploadFile,
        getFileList : getFileList,
        deleteWiki : deleteWiki,
        getPreViewInfo : getPreViewInfo,
        update : update,
        wikiDiff : wikiDiff
    };

    return service;

    function getWikiInfo(data, shortcut) {

        return $http({
            method: 'post',
            url: '/api/wiki/getInfo',
            data: $.param({
                pKey: data,
                shortcut: shortcut
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function update(pKey, shortcut, field, data) {
        return $http({
            method: 'post',
            url: '/api/wiki/update',
            data: $.param({
                pKey: pKey,
                shortcut: shortcut,
                data: data,
                field: field
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getHistoryList(pKey, shortcut, page, perpage) {

        return $http({
            method: 'post',
            url: '/api/wiki/getHistoryList',
            data: $.param({
                pKey: pKey,
                shortcut: shortcut,
                page: page,
                perpage: perpage,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getHistoryCount(pKey, shortcut) {
        return $http({
            method: 'post',
            data: $.param({
                pKey: pKey,
                shortcut: shortcut,
            }),
            url: '/api/wiki/getHistoryCount',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getVersionInfo(pKey, shortcut, version) {

        return $http({
            method: 'post',
            url: '/api/wiki/getVersionInfo',
            data: $.param({
                pKey: pKey,
                version: version,
                shortcut: shortcut
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function addWiki(data) {
         return $http.post('/api/wiki/add',
             data,
             {
                 headers : {'Content-Type': 'application/x-www-form-urlencoded'}
             })
             .then(function(data){
                 this.data = data.data;
                 return this.data;
             });
     }

    function updateWiki(data) {
         return $http.post('/api/wiki/updateWiki',
             data,
             {
                 headers : {'Content-Type': 'application/x-www-form-urlencoded'}
             })
             .then(function(data){
                 this.data = data.data;
                 return this.data;
             });
     }

    function getWikiList(pKey, shortcut) {

        return $http({
            method: 'post',
            url: '/api/wiki/getWikiList',
            data: $.param({
                pKey: pKey,
                shortcut: shortcut
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getWikiIndex(pKey) {

        return $http({
            method: 'post',
            url: '/api/wiki/getWikiIndex',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function deleteWiki(pKey, shortcut) {
        return $http({
            method: 'post',
            url: '/api/wiki/deleteWiki',
            data: $.param({
                pKey: pKey,
                shortcut: shortcut,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function uploadFile(pKey, shortcut, targetName, name) {
        return $http({
            method: 'post',
            url: '/api/wiki/uploadFileFinish',
            data: $.param({
                fileKey: targetName,
                fileName: name,
                pKey: pKey,
                shortcut: shortcut,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            this.data = data.data;
            return this.data;
        });
    }

    function getFileList(pKey, shortcut) {
        return $http({
            method: 'post',
            url: '/api/wiki/getFileList',
            data: $.param({
                pKey: pKey,
                shortcut: shortcut,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    function getPreViewInfo(data, pKey) {

        return $http({
            method: 'post',
            url: '/api/wiki/getPreViewInfo',
            data: $.param({
                content: data,
                pKey: pKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function wikiDiff(data) {
        return $http({
            method: 'post',
            data: data,
            url: '/api/wiki/wikiDiff',
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

};
/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('wikiService', wikiService)


function versionService($rootScope, $http, cacheService, toastr) {

    var data;
    var code;
    var message;
    var service = {
        getList : getList,
        create : create,
        update : update,
        view : view,
        updateVersion : updateVersion,
        getProjectInfo : getProjectInfo,
        updateOrder : updateOrder,
        updateVersionStatus : updateVersionStatus,
    };

    return service;

    function getList(data) {
        var cacheAPI = '/api/version/listAll:'+data;
        if( cacheService.checkCached( cacheAPI)) {
            return cacheService.getPromise( cacheAPI);
        } else {
            return $http.post('/api/version/listAll',
                data,
                {
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data){
                   this.code = data.data.code;
                   this.data = data.data.data;
                   this.message = data.data.message;
                   if(this.code == 0){
                      cacheService.setCache(cacheAPI, this.data);
                      return this.data;
                   }else{
                       toastr.warning(this.message);
                       return false;
                   }
            })
        }
    }

    function create(data) {
        cacheService.clearCache();
        return $http.post('/api/version/add',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data.data;
                return this.data;
            });
    }

    function updateVersion(data) {
        cacheService.clearCache();
        return $http.post('/api/version/updateVersion',
            data,
            {
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            })
            .then(function(data){
                this.data = data.data;
                return this.data;
            });
    }

    function view(pKey, vKey) {
        return $http({
            method: 'post',
            url: '/api/version/view',
            data: $.param({
                pKey: pKey,
                vKey: vKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function getProjectInfo(pKey) {
        return $http({
            method: 'post',
            url: '/api/version/getProjectInfo',
            data: $.param({
                pKey: pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function update(pKey, vKey, field, data, arr) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/version/update',
            data: $.param({
                pKey: pKey,
                vKey: vKey,
                data: data,
                field: field,
                inoArray : arr
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function updateOrder(order, startItem) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/version/updateOrder',
            data: $.param({
                order : order,
                startItem : startItem,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function updateVersionStatus (vKey, status, startTime, releaseTime) {
        cacheService.clearCache();
        return $http({
            method: 'post',
            url: '/api/version/updateVersionStatus',
            data: $.param({
                vKey : vKey,
                status : status,
                startTime : startTime,
                releaseTime : releaseTime,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

};
/**
 * Pass function into module
 */
angular
    .module('bugs')
    .factory('versionService', versionService)

function statisticsService ($http, toastr) {


    var service = {
        loadStatData : function ( pKey) {
            return $http.post('/api/statistics/getStatData',
                encodeURIComponent('pKey') + '=' + encodeURIComponent(pKey),
                {
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(response){
                   if( response.data.code == 0 ){
                      return response.data.data;
                   }else{
                        toastr.warning(response.data.message);
                        return false;
                   }
            });
        },
    }

    return service;
}


//register service
angular
    .module('bugs')
    .factory('statisticsService', statisticsService)

angular
    .module('bugs')
    .factory('cacheService', cacheService)

function cacheService( $cacheFactory, $q) {

    var flashCachePool = $cacheFactory( 'pgyerCache-Flash');
    var normalCachePool = $cacheFactory( 'pgyerCache-Normal');
    var permanentCachePool = $cacheFactory( 'pgyerCache-Permanent');

    window.setInterval( flashCachePool.removeAll, 30000); // 30 seconds
    window.setInterval( normalCachePool.removeAll, 600000); // 10 minitus

    var flashCachePoolAPI = [
        '/api/project/checkPermission'
    ];

    var service = {
        checkCached: checkCached,
        setCache: setCache,
        getCache: getCache,
        getPromise: getPromise,
        clearCache: clearCache
    };

    return service;

    function getCachePool( apiName) {
        if ( apiName.toLowerCase().indexOf('::permanent::') > -1) {
            return permanentCachePool;
        }
        for( index in flashCachePoolAPI) {
            if ( apiName.toLowerCase().indexOf( flashCachePoolAPI[index].toLowerCase()) > -1) {
                return flashCachePool;
            }
        }
        return normalCachePool;
    }

    function checkCached( apiName) {
        var pool = getCachePool( apiName);
        if( pool.get( apiName)) {
            return true;
        } else {
            return false;
        }
    }

    function setCache( apiName, data) {
        var pool = getCachePool( apiName);
        pool.put( apiName, data);
    }

    function getCache( apiName) {
        var pool = getCachePool( apiName);
        return pool.get( apiName);
    }

    function getPromise( apiName) {
        var pool = getCachePool( apiName);
        var data = pool.get( apiName);
        var deferred = $q.defer();
        var promise = deferred.promise;
        window.setTimeout( function(){ deferred.resolve(data);}, 10);
        return promise;
    }

    function clearCache() {
        flashCachePool.removeAll();
        normalCachePool.removeAll();
    }
};

angular
    .module('bugs')
    .factory('helper', function($cookies) {
        return {
            issueFilter: issueFilter,
            chartDataComposer: chartDataComposer,
            highChartDataBuilder : highChartDataBuilder,
            stringFormater: stringFormater,
            styleParser: styleParser,
            Stat: Stat,
            configReader: configReader,
            groupFn: groupFn,
            permision: permision,
            utilities: utilities,
        };

        // helpers for issue filter
        function issueFilter() {

            return {
                get: get,
                set: set,
                remove: remove,
                getEmptyFilter: getEmptyFilter,
            }

            function get(pKey, field) {
                var filterData = $cookies.get('issueFileter:' + pKey);
                if(filterData) {
                    if(field) {
                        return angular.fromJson(filterData)[field];
                    } else {
                        return angular.fromJson(filterData);
                    }
                } else {
                    return null;
                }
            }

            function set(pKey, field, value) {

                var filterData = get(pKey);

                if(!filterData) {
                    filterData =  getEmptyFilter();
                }

                if(field) {
                    filterData[field] = value;
                } else {
                    filterData = value;
                }

                $cookies.put('issueFileter:' + pKey, angular.toJson(filterData));
                return filterData;
            }

            function remove(pKey, field) {
                var currentFilter = get(pKey);
                var emptyFilter = getEmptyFilter();

                if(field) {
                    currentFilter[field] = emptyFilter[field];
                } else {
                    currentFilter = emptyFilter;
                }

                $cookies.put('issueFileter:' + pKey, angular.toJson(currentFilter));

                return currentFilter;
            }

            function getEmptyFilter() {
                return {
                    type: [],
                    status:[],
                    priority: [],
                    author: [],
                    assignee: [],
                    version: [],
                    module: [],
                    createdDate: {startDate: null, endDate: null},
                    updatedDate: {startDate: null, endDate: null},
                    endedDate: {startDate: null, endDate: null},
                    keywords: '',
                    sortIndex: 0,
                    sortType: 'desc',
                    perpage: 20,
                }
            }
        }


        // helper for compose chart data
        function highChartDataBuilder() {

            return {
                generateDateLabels: generateDateLabels,
                generateHighChartData : generateHighChartData,
                setChartTitle : setChartTitle,
                setChartPlotOptions : setChartPlotOptions,
                chartDataRearrangement: chartDataRearrangement,
            }

           //defaultColor = '#6a6c6f', titleFontSize = '16px' 
            function _setBaseChartOption(chartType){
                return {
                    options : {
                        chart : {
                            type : chartType,
                            style : {
                                //override
                                fontFamily : 'PingFang SC,Helvetica Neue,Hiragino Sans GB,Microsoft Yahe',
                            },
                            height : null
                        },

                       title : {
                            text : null,
                            align : 'center',
                            verticalAlign : 'middle',
                            style : {
                                //fontSize : titleFontSize,
                                color : '#6a6c6f',
                            },
                            y: 0
                        },

                        legend : {
                            align : 'center',
                            verticalAlign : 'top',
                            itemStyle : {
                                color : '#6a6c6f',
                            },
                            enabled : true,
                        } ,

                        plotOptions : {
                            series : {},
                            areaspline : {
                                fillOpacity : 0.2,
                                lineWidth : 1,
                                marker : {
                                    symbol : 'circle',
                                    enabled : false,
                                },
                            },
                            column : { stacking : null },
                            pie : {
                                dataLabels : { enabled : false },
                                showInLegend : true,
                                innerSize : '0%',
                            },
                        },
                        tooltip : { 
                            shared : false,
                            crosshairs : false
                        },
                        colors : [],
                        xAxis : {},
                        yAxis : {},
                    } ,
                    series : null,
                };
            }

            //
            function setChartTitle(chartOption, text, color, fontSize, textPosition){
                if(chartOption.options.hasOwnProperty('title')){
                    chartOption.options.title.text = text;
                    chartOption.options.title.y = textPosition;
                    chartOption.options.title.style = {
                         color : color,
                         fontSize : fontSize,
                    };
                    return chartOption;
                }
            }

            //Object ChartOption, Object/String OptionSet
            function setChartPlotOptions(chartOption, optionSet){

                var chartType = chartOption.options.chart.type;

                switch(chartType){
                    case  'areaspline':
                       chartOption.options.plotOptions.areaspline = optionSet;
                       break;
                    case  'column':
                       chartOption.options.plotOptions.column.stacking = optionSet;
                       break;
                    case 'pie':
                       chartOption.options.plotOptions.pie.innerSize = optionSet;
                       break;
                }

                return chartOption;
            }

            function _setLegendItem(chartOption, itemScale){
                if(itemScale > 3 && itemScale <= 6){
                    chartOption.options.legend.itemWidth = 65;
                }

                if(itemScale > 6){
                    chartOption.options.legend.itemWidth = 70;
                    //chartOption.options.legend.itemDistance = 0;
                }
            }
            //
            function setChartAxis(chartOption, labelX, labelY){

               chartOption.options.xAxis = {
                    categories : labelX,
               };

               chartOption.options.yAxis = {
                    title : {text : false},
                    tickInterval : labelY,
                    softMin : 0,
                    softMax : 1 ,
                    lineWidth : 1
               };

               return chartOption;
            }

            // generate data labels
            function generateDateLabels(days) {
                var stringFormaterHelper = stringFormater();
                var currentDate = new Date();
                var startDate = new Date(currentDate.getTime() - ((days - 1) * 86400000)); // - 29 days
                var returnArray = [];
                for(var index = 0; index < days; index ++) {
                    var tmpDate = new Date(startDate.getTime() + (index * 86400000));
                    var item = stringFormaterHelper.zeroPrepend(tmpDate.getMonth() + 1, 2);
                    returnArray.push(stringFormaterHelper.zeroPrepend(tmpDate.getMonth() + 1, 2) + '-' + stringFormaterHelper.zeroPrepend(tmpDate.getDate(), 2));
                }

                return returnArray;
            }
            // calculate a properdata interveal for a chart
            function calInterval(maxLevel) {
                var level = Math.floor( ( Math.log( maxLevel / 40) / Math.log( 2)) + 1);
                level = level > 0 ? level : 0;
                return 5 * Math.pow( 2, level);
            }

            // pieChart 设置为 true 时, 直接返回关联数据的排序结果
            function chartDataRearrangement(chartData, order, limit, pieChart) {

                var chartData = angular.copy(chartData);

                /**if(pieChart){
                    chartData.series[0].data.sort(function (prev, next){
                        return order.toLowerCase() != 'asc' ?  next.y - prev.y : prev.y - next.y;
                    });
                    chartData.series[0].data.slice(0, limit);
                    return chartData;
                } **/

                var dataSizeX = chartData.options.xAxis.categories.length;
                var dataSizeY = chartData.series.length;
                var sumDataArray = _getSumData(chartData);
                // sort data
                orderedIndexArray = _getAscendingOrderedIndexArray(sumDataArray);

                if (order.toLowerCase() != 'asc') {
                    orderedIndexArray.reverse();
                }

                // apply limitation
                var finalIndexArray = orderedIndexArray.slice(0, limit);
                // apply final output
                return _getChartDataByIndex(chartData, finalIndexArray);

                // get sumed data in datasets by labels
                function _getSumData(chartData) {
                    var returnArray = [];
                    for(var indexX in chartData.options.xAxis.categories) {
                        var sumedData = 0;
                        for(var indexY in chartData.series) {
                            sumedData += chartData.series[indexY].data[indexX];
                        }
                        returnArray.push(sumedData);
                    }
                    return returnArray;
                }

                // get ascending data index array
                function _getAscendingOrderedIndexArray(dataArray) {
                    var returnArray = [];
                    var lastMinData = null;
                    var currentMinData = null;

                    while(returnArray.length < dataArray.length) {

                        for(var index = 0; index < dataArray.length; index ++) {
                            if(lastMinData === null) {
                                if(currentMinData === null) {
                                    currentMinData = dataArray[index];
                                } else {
                                    currentMinData = dataArray[index] < currentMinData ? dataArray[index] : currentMinData;
                                }
                            } else if (dataArray[index] > lastMinData) {
                                if(currentMinData === null) {
                                    currentMinData = dataArray[index];
                                } else {
                                    currentMinData = dataArray[index] < currentMinData ? dataArray[index] : currentMinData;
                                }
                            }
                        }

                        for(index in dataArray) {
                            if(dataArray[index] == currentMinData) {
                                returnArray.push(index);
                            }
                        }

                        lastMinData = currentMinData;
                        currentMinData = null;
                    }

                    return returnArray;
                }

                // return an ordered chartData accoring to index array
                function _getChartDataByIndex(chartData, indexArray) {
                    var returnData = angular.copy(chartData);
                    // empty data and label array

                    returnData.options.xAxis.categories = [];
                    for(var indexY = 0; indexY < chartData.series.length; indexY ++) {
                        returnData.series[indexY].data = [];
                    }

                    // set data and label array
                    for(var indexX = 0; indexX < indexArray.length; indexX ++) {
                        returnData.options.xAxis.categories.push(chartData.options.xAxis.categories[indexArray[indexX]]);
                        for(var indexY = 0; indexY < chartData.series.length; indexY ++) {
                            returnData.series[indexY].data.push(chartData.series[indexY].data[indexArray[indexX]]);
                        }
                    }
                    return returnData;
                }

            }

            //generateHighChartData(Array labelX, Array labelY, Array inputData, Number maxValue, String chartType, Boolean aixsEnabled)
            // 默认情况下 pieChart 设置坐标启用为 false
            function generateHighChartData (labelX, labelY, inputData, maxValue, chartType, aixsEnabled) {
                // load helper
                var styleHelper = styleParser();
                // process label parameters
                var intervalNumber = calInterval(maxValue);
                // make an zero filed matrix x=labelX ans y=labelY
                var dataMatrix = [];
                var finalLabelsX = [];
                for(var x = 0; x < labelX.length; x ++) {
                    dataMatrix[x] = [];
                    for(var y = 0; y < labelY.length; y ++) {
                        dataMatrix[x][y] = 0;
                    }
                }


                // fill real data into matrix
                for(x in labelX) {
                    var xKey = typeof labelX[x] === 'string' ? labelX[x] : labelX[x].key;
                    var xLabel = typeof labelX[x] === 'string' ? labelX[x] : labelX[x].label;

                    finalLabelsX.push(xLabel);

                    for (y in labelY) {
                        var yKey = typeof labelY[y] === 'string' ? labelY[y] : labelY[y].key;
                        dataMatrix[x][y] = _getData(inputData, xKey, yKey);
                    }
                }

                // regroup matrix and out put data
                var finalDataSeries = [];
                for(y = 0; y < labelY.length; y ++) {
                    var finalLabelY = typeof labelY[y] === 'string' ? labelY[y] : labelY[y].label;
                    var finalDataY = [];
                    for(var x = 0; x < labelX.length; x ++) {
                        finalDataY.push(dataMatrix[x][y]);
                    }
                    //
                    var seriesData = _getChartSeriesData(labelY, finalLabelsX, finalDataY, finalLabelY, aixsEnabled);
                    finalDataSeries.push(seriesData);
                }

                var chart = _setBaseChartOption(chartType);
                chart.series = finalDataSeries;
                chart = _appendColorSetting(chart, labelX, labelY, aixsEnabled);
                //
                //if(!aixsEnabled){
                //    _setLegendItem(chart, finalLabelsX.length);
               //}

                setChartAxis(chart, finalLabelsX, intervalNumber);

                return chart;

                //
                function _getChartSeriesData(labelY, finalLabelsX, finalDataY, finalLabelY, aixsEnabled){
                    if(!aixsEnabled){
                        return {
                            name : labelY,
                            data : _piePercentageParser({names : finalLabelsX, data : finalDataY})
                        };
                    }

                    return {
                        name : finalLabelY,
                        data : finalDataY
                    };
                }

                function _piePercentageParser(mapData){
                    var pieDataMap = [];
                    var sum = 0;

                    for(var index = 0; index < mapData.data.length; index ++){
                        sum +=  mapData.data[index];
                    }


                    /**var sum = mapData.data.reduce(function(prev, next){
                        return prev + next;
                    })**/

                    //var percentage = 0;


                    for(index in mapData.names){
                        //percentage = Math.floor(100 * mapData.data[index] / sum);
                        //pieDataMap.push({ name : mapData.names[index],  y : percentage });
                        pieDataMap.push({ name : mapData.names[index],  y : mapData.data[index] });
                    }
                    return pieDataMap;
                }

                // get data in Input data
                function _getData(data, xKey, yKey) {

                    var yData = data[xKey];
                    if(typeof yData != 'object') {
                        if (typeof yData != 'undefined') {
                            return yData;
                        } else {
                            return 0;
                        }
                    }

                    if(typeof yData[yKey] != 'undefined') {
                        return yData[yKey];
                    } else {
                        return 0;
                    }
                }

                // append color data
                function _appendColorSetting(data, labelX, labelY, aixsEnabled) {
                    var alphaSolid = 1;
                    var alphaTranslucent = 0.2;

                    backgroudColorCollection = [];

                    for(var index in labelY) {
                        var colorSolid = _getColor(labelX, labelY, index, alphaSolid);
                        //var colorTranslucent = _getColor(labelX, labelY, index, alphaTranslucent);
                        backgroudColorCollection.push(colorSolid);
                    }

                    if(!aixsEnabled){
                        data.options.colors = backgroudColorCollection[0];
                        return data;
                    }

                    data.options.colors = backgroudColorCollection;
                    return data;
                }

                function _getColor(labelX, labelY, index, alpha) {
                    var defaultColorSingle = [91, 192, 222];
                    var defaultColorList = [
                        [156, 188, 232],
                        [156, 166, 232],
                        [124, 131, 205],
                        [115, 145, 232],
                        [98, 131, 227],
                        [111, 196, 236],
                        [130, 231, 213],
                        [187, 218, 44],
                        [227, 229, 31],
                        [254, 228, 57]
                    ];

                    if(typeof labelY[0] == 'object') {
                        var className = labelY[index].class;
                        return styleHelper.getRGBAFromClass(className, alpha);
                    } else if (labelY.length < 2) {
                        // if label Y is an single label try get label X color
                        if(typeof labelX[0] == 'object') {
                            var colorArray = [];
                            for(var x in labelX) {
                                if(labelX[x].class) {
                                    colorArray.push(styleHelper.getRGBAFromClass(labelX[x].class, alpha));
                                } else {
                                    colorArray.push('rgba(' + defaultColorSingle[0] + ', ' + defaultColorSingle[1] + ', ' + defaultColorSingle[2] + ', ' + alpha + ')');
                                }
                            }
                            return colorArray;
                        } else {
                            return 'rgba(' + defaultColorSingle[0] + ', ' + defaultColorSingle[1] + ', ' + defaultColorSingle[2] + ', ' + alpha + ')';
                        }
                    } else if (index < 9) {
                        return 'rgba(' + defaultColorList[index][0] + ', ' + defaultColorList[index][1] + ', ' + defaultColorList[index][2] + ', ' + alpha + ')';
                    }

                    return '';
                }
            }

        }




        // helper for compose chart data
        function chartDataComposer() {

            return {
                generateDateLabels: generateDateLabels,
                generateChartData: generateChartData,
                chartOptionBuilder: chartOptionBuilder,
                chartDataRearrangement: chartDataRearrangement,
            }

            // generate data labels
            function generateDateLabels(days) {
                var stringFormaterHelper = stringFormater();
                var currentDate = new Date();
                var startDate = new Date(currentDate.getTime() - ((days - 1) * 86400000)); // - 29 days
                var returnArray = [];
                for(var index = 0; index < days; index ++) {
                    var tmpDate = new Date(startDate.getTime() + (index * 86400000));
                    var item = stringFormaterHelper.zeroPrepend(tmpDate.getMonth() + 1, 2);
                    returnArray.push(stringFormaterHelper.zeroPrepend(tmpDate.getMonth() + 1, 2) + '-' + stringFormaterHelper.zeroPrepend(tmpDate.getDate(), 2));
                }

                return returnArray;
            }

            // generate a chart option compatible with chartjs
            function chartOptionBuilder( tooltipsEnabled, tooltipsMode, legendEnabled, lengendLocation, stackedMode, maxValue) {

                return {tooltips: _tooltipBuilder(tooltipsEnabled, tooltipsMode), legend: _legendBuilder(legendEnabled, lengendLocation), scales: _scalesBuilder(stackedMode, maxValue)};

                function _scalesBuilder(stacked, maxValue) {
                    if(stacked === null && maxValue === null) {
                        return {};
                    }
                    var interval = _calInterval(maxValue);
                    return {xAxes: [{stacked: stacked}], yAxes: [{stacked: stacked, ticks: {beginAtZero: true, stepSize: interval}}]};
                };

                function _legendBuilder(display, position) {
                    if(display === null && position === null) {
                        return {};
                    }
                    return {display: display, position: position, labels: {boxWidth: 12}};
                };

                function _tooltipBuilder(enabled, mode) {
                    if(enabled === null && mode === null) {
                        return {};
                    }
                    return {enabled: enabled, mode: mode};
                };

                // calculate a properdata interveal for a chart
                function _calInterval(maxLevel) {
                    var level = Math.floor( ( Math.log( maxLevel / 40) / Math.log( 2)) + 1);
                    level = level > 0 ? level : 0;
                    return 5 * Math.pow( 2, level);
                }
            }

            // function chartDataFilter
            function chartDataRearrangement(chartData, order, limit) {

                var chartData = angular.copy(chartData);
                var dataSizeX = chartData.labels.length;
                var dataSizeY = chartData.datasets.length;
                var sumDataArray = _getSumData(chartData);
                var orderedIndexArray = [];

                // sort data
                orderedIndexArray = _getAscendingOrderedIndexArray(sumDataArray);

                if (order.toLowerCase() != 'asc') {
                    orderedIndexArray.reverse();
                }

                // apply limitation
                var finalIndexArray = orderedIndexArray.slice(0, limit);

                // apply final output
                return _getChartDataByIndex(chartData, finalIndexArray);

                // get sumed data in datasets by labels
                function _getSumData(chartData) {
                    var returnArray = [];
                    for(var indexX in chartData.labels) {
                        var sumedData = 0;
                        for(var indexY in chartData.datasets) {
                            sumedData += chartData.datasets[indexY].data[indexX];
                        }
                        returnArray.push(sumedData);
                    }
                    return returnArray;
                }

                // get ascending data index array
                function _getAscendingOrderedIndexArray(dataArray) {
                    var returnArray = [];
                    var lastMinData = null;
                    var currentMinData = null;

                    while(returnArray.length < dataArray.length) {

                        for(var index = 0; index < dataArray.length; index ++) {
                            if(lastMinData === null) {
                                if(currentMinData === null) {
                                    currentMinData = dataArray[index];
                                } else {
                                    currentMinData = dataArray[index] < currentMinData ? dataArray[index] : currentMinData;
                                }
                            } else if (dataArray[index] > lastMinData) {
                                if(currentMinData === null) {
                                    currentMinData = dataArray[index];
                                } else {
                                    currentMinData = dataArray[index] < currentMinData ? dataArray[index] : currentMinData;
                                }
                            }
                        }

                        for(index in dataArray) {
                            if(dataArray[index] == currentMinData) {
                                returnArray.push(index);
                            }
                        }

                        lastMinData = currentMinData;
                        currentMinData = null;
                    }

                    return returnArray;
                }

                // return an ordered chartData accoring to index array
                function _getChartDataByIndex(chartData, indexArray) {
                    var returnData = angular.copy(chartData);
                    // empty data and label array
                    returnData.labels = [];
                    for(var indexY = 0; indexY < chartData.datasets.length; indexY ++) {
                        returnData.datasets[indexY].data = [];
                    }

                    // set data and label array
                    for(var indexX = 0; indexX < indexArray.length; indexX ++) {
                        returnData.labels.push(chartData.labels[indexArray[indexX]]);
                        for(var indexY = 0; indexY < chartData.datasets.length; indexY ++) {
                            returnData.datasets[indexY].data.push(chartData.datasets[indexY].data[indexArray[indexX]]);
                        }
                    }
                    return returnData;
                }



            }

            // generate a data object compatible with chartjs
            // if lineChart set true , returned data will used for line chart
            function generateChartData (labelX, labelY, inputData, lineChart) {

                // load helper
                var styleHelper = styleParser();

                // process label parameters
                lineChart = lineChart ? true : false;

                // make an zero filed matrix x=labelX ans y=labelY
                var dataMatrix = [];
                var finalLabelsX = [];
                for(var x = 0; x < labelX.length; x ++) {
                    dataMatrix[x] = [];
                    for(var y = 0; y < labelY.length; y ++) {
                        dataMatrix[x][y] = 0;
                    }
                }

                // fill real data into matrix
                for(x in labelX) {
                    var xKey = typeof labelX[x] === 'string' ? labelX[x] : labelX[x].key;
                    var xLabel = typeof labelX[x] === 'string' ? labelX[x] : labelX[x].label;

                    finalLabelsX.push(xLabel);

                    for (y in labelY) {
                        var yKey = typeof labelY[y] === 'string' ? labelY[y] : labelY[y].key;
                        dataMatrix[x][y] = _getData(inputData, xKey, yKey);
                    }
                }


                // regroup matrix and out put data
                var finalDatasets = [];
                for(y = 0; y < labelY.length; y ++) {
                    var finalLabelY = typeof labelY[y] === 'string' ? labelY[y] : labelY[y].label;
                    var finalDataY = [];
                    for(var x = 0; x < labelX.length; x ++) {
                        finalDataY.push(dataMatrix[x][y]);
                    }

                    finalDatasets.push({label: finalLabelY, data:finalDataY});
                }


                var data = {};
                data.labels = finalLabelsX;
                data.datasets = finalDatasets;
                data = _appendColorSetting(data, labelX, labelY, lineChart);
                return data;
                // get data in Input data
                function _getData(data, xKey, yKey) {

                    var yData = data[xKey];
                    if(typeof yData != 'object') {
                        if (typeof yData != 'undefined') {
                            return yData;
                        } else {
                            return 0;
                        }
                    }

                    if(typeof yData[yKey] != 'undefined') {
                        return yData[yKey];
                    } else {
                        return 0;
                    }
                }
                // append color data
                function _appendColorSetting(data, labelX, labelY, lineChart) {
                    var alphaSolid = 1;
                    var alphaTranslucent = 0.2;
                    var tmpDataset = data.datasets;

                    for(var y in labelY) {
                        var colorSolid = _getColor(labelX, labelY, y, alphaSolid);
                        var colorTranslucent = _getColor(labelX, labelY, y, alphaTranslucent);

                        data.datasets[y].fill = true;
                        if(lineChart) {
                            data.datasets[y].backgroundColor = colorTranslucent;
                            data.datasets[y].borderColor = colorSolid;
                            data.datasets[y].borderWidth = 1;
                            data.datasets[y].pointBorderColor = colorSolid;
                        } else {
                            data.datasets[y].backgroundColor = colorSolid;
                            data.datasets[y].hoverBackgroundColor = colorSolid;
                        }
                    }

                    return data;
                }

                function _getColor(labelX, labelY, index, alpha) {
                    var defaultColorSingle = [91, 192, 222];
                    var defaultColorList = [
                        [156, 188, 232],
                        [156, 166, 232],
                        [124, 131, 205],
                        [115, 145, 232],
                        [98, 131, 227],
                        [111, 196, 236],
                        [130, 231, 213],
                        [187, 218, 44],
                        [227, 229, 31],
                        [254, 228, 57]
                    ];

                    if(typeof labelY[0] == 'object') {
                        var className = labelY[index].class;
                        return styleHelper.getRGBAFromClass(className, alpha);
                    } else if (labelY.length < 2) {
                        // if label Y is an single label try get label X color
                        if(typeof labelX[0] == 'object') {
                            var colorArray = [];
                            for(var x in labelX) {
                                if(labelX[x].class) {
                                    colorArray.push(styleHelper.getRGBAFromClass(labelX[x].class, alpha));
                                } else {
                                    colorArray.push('rgba(' + defaultColorSingle[0] + ', ' + defaultColorSingle[1] + ', ' + defaultColorSingle[2] + ', ' + alpha + ')');
                                }
                            }
                            return colorArray;
                        } else {
                            return 'rgba(' + defaultColorSingle[0] + ', ' + defaultColorSingle[1] + ', ' + defaultColorSingle[2] + ', ' + alpha + ')';
                        }
                    } else if (index < 9) {
                        return 'rgba(' + defaultColorList[index][0] + ', ' + defaultColorList[index][1] + ', ' + defaultColorList[index][2] + ', ' + alpha + ')';
                    }

                    return '';
                }
            }
        }

        // helper to formate string
        function stringFormater() {
            return {
                zeroPrepend: zeroPrepend,
                readableSize: readableSize,
                currency: currency,
                filterEmoji: filterEmoji,
                filterInput: filterInput,
                timeFormateMs: timeFormateMs,
                getTimeBasedID: getTimeBasedID
            }

            function zeroPrepend(string, targetLength) {
                string = string.toString();
                targetLength = targetLength ? targetLength : 2;
                while(string.length < targetLength) {
                    string = '0' + string;
                }
                return string;
            }

            function readableSize(size) {
                var unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
                var unitOffset = 0;
                var displaySize = size;
                while(displaySize / 102.4 > 10 && unitOffset < unit.length) {
                    displaySize = Math.ceil(displaySize / 102.4);
                    displaySize = displaySize / 10;
                    unitOffset ++;
                }
                return displaySize + ' ' + unit[unitOffset];
            }

            function currency(number) {
                if(number) {
                    var numberArray = (number.toString()).split('.');
                    if(numberArray[1]) {
                        while(numberArray[1].length < 2) {
                            numberArray[1] = numberArray[1] + '0';
                        }
                    } else {
                        numberArray[1] = '00';
                    }
                    return numberArray[0] + '.' + numberArray[1];
                } else {
                    return '0.00';
                }
            }

            function filterEmoji(input) {
                var string = input ? input : '';
                string = string.replace(/\ud83c[\udf00-\udfff]/g, '');
                string = string.replace(/\ud83d[\udc00-\ude4f]/g, '');
                string = string.replace(/\ud83d[\ude80-\udeff]/g, '');
                return string;
            }

            function filterInput(input) {
                return input;
            }

            function timeFormateMs(msTimestamp) {
                var date = new Date(msTimestamp);
                var currentDate = new Date();
                var output = '';

                if(currentDate.getFullYear() != date.getFullYear()) {
                    output = output + date.getFullYear() + '/';
                    output = output + zeroPrepend(date.getMonth(), 2) + '/';
                    output = output + zeroPrepend(date.getDate(), 2) + ' ';
                } else if (currentDate.getMonth() != date.getMonth() || currentDate.getDate() != date.getDate()){
                    output = output + zeroPrepend(date.getMonth(), 2) + '/';
                    output = output + zeroPrepend(date.getDate(), 2) + ' ';
                }

                return output + zeroPrepend(date.getHours(), 2) + ':' + zeroPrepend(date.getMinutes(), 2);
            }

            function getTimeBasedID () {
                var uploadFileTmpID = '';
                uploadFileTmpID += new Date().getTime();
                uploadFileTmpID += zeroPrepend(new Date().getMilliseconds(), 3);
                uploadFileTmpID += Math.ceil(Math.random() * 1000);
                return uploadFileTmpID;
            }
        }


        // helper to process styles
        function styleParser () {
            return {
                getRGBAFromClass: getRGBAFromClass,
                getIconNameByMIME: getIconNameByMIME,
                getIconNameByNoteType: getIconNameByNoteType,
            }

            // get raba color class, return color || bgColor in rgba format, #000 will be ignore.
            function getRGBAFromClass(className, alpha) {
                if(!$('#bug_tracker_class_reader').length) {
                    var $dom = $('<div id="bug_tracker_class_reader" style="width:0px;height:0px;color:#000000;background-color:#000000"><i></i></div>');
                    $('body').append($dom);
                }
                $('#bug_tracker_class_reader i').attr('class', className);
                var color = $('#bug_tracker_class_reader i').css('color');
                var bgColor = $('#bug_tracker_class_reader i').css('backgroundColor');

                var resultArray = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
                if(!(parseInt(resultArray[1]) || parseInt(resultArray[2]) || parseInt(resultArray[3]))) {
                    resultArray = bgColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
                }
                return 'rgba(' + resultArray[1] + ',' + resultArray[2] + ',' + resultArray[3] + ',' + alpha + ')'
            }

            function getIconNameByMIME(mime) {
                if (mime.match('word')) {
                    return 'fa-file-word-o';
                } else if (mime.match('spreadsheet')) {
                    return 'fa-file-excel-o';
                } else if (mime.match('presentation')) {
                    return 'fa-file-powerpoint-o';
                } else if (mime.match('^image')) {
                    return 'fa-file-image-o';
                } else if (mime.match('^video')) {
                    return 'fa-file-movie-o';
                } else if (mime.match('^audio')) {
                    return 'fa-file-audio-o';
                } else if (mime.match('^text')) {
                    return 'fa-file-code-o';
                } else if (mime.match('application/pdf')) {
                    return 'fa-file-pdf-o';
                } else if (mime.match('application/zip')) {
                    return 'fa-file-archive-o';
                }

                return 'fa-file-o';
            }

            function getIconNameByNoteType(type) {
                if (type == 1) {
                    return 'fa-plus';
                } else if (type == 2) {
                    return 'fa-bookmark';
                } else if (type == 3) {
                    return 'fa-eye';
                } else if (type == 4) {
                    return 'fa-circle';
                } else if (type == 5) {
                    return 'fa-hand-o-right';
                } else if (type == 6) {
                    return 'fa-heart-o';
                } else if (type == 7) {
                    return 'fa-sticky-note';
                } else if (type == 8) {
                    return 'fa-pencil';
                } else if (type == 9) {
                    return 'fa-heart-o';
                } else if (type == 10) {
                    return 'fa-heart-o';
                } else if (type == 11) {
                    return 'fa-share';
                } else if (type == 12) {
                    return 'fa-share';
                } else if (type == 13) {
                    return 'fa-code-fork';
                } else if (type == 14) {
                    return 'fa-cube';
                } else if (type == 15) {
                    return 'fa-paperclip';
                } else if (type == 16) {
                    return 'fa-paperclip';
                } else if (type == 17) {
                    return 'fa-trash';
                } else if (type == 18) {
                    return 'fa-sticky-note';
                } else if (type == 19) {
                    return 'fa-sticky-note';
                } else if (type == 20) {
                    return 'fa-clock-o';
                }

                return 'fa-pencil';
            }


        }


        // statistics data processer
        function Stat() {

            return {
                map: map,
                pick: pick,
                sum: sum,
                max: max,
                filter: filter
            }


            // function get status
            function map(operator, data) {
                var returnArray = [];
                for(index in data) {
                    returnArray[index] = operator(data[index]);
                }
                return returnArray;
            }

            // pick a data from keys
            function pick(data, keys) {
                var returnArray = [];
                for(var index in keys) {
                    var pushedValue = data[keys[index]];
                    pushedValue = pushedValue ? pushedValue : 0;
                    returnArray.push(pushedValue);
                }
                return returnArray;
            }

            // get sum value
            function sum(data) {
                var returnValue = 0;
                for(index in data) {
                    returnValue += data[index];
                }
                return returnValue;
            }

            // get max value
            function max(data) {
                var returnValue = null;
                for(index in data) {
                    returnValue = returnValue === null ? data[index] : returnValue;
                    returnValue = returnValue > data[index] ? returnValue : data[index];
                }
                return returnValue;
            }

            function filter(data, keys){
                var returnArray = [];
                for(var dataIndex in data) {
                    for(var keyIndex in keys) {
                        if(dataIndex != keys[keyIndex]) {
                            returnArray[dataIndex] = data[dataIndex];
                        }
                    }
                }
                return returnArray;
            }
        }

        // use to read project config data
        function configReader() {
            return {
                read: read,
                pick: pick,
                filter: filter,
                search: search,
            }

            // return object of specific key
            function read(config, key) {
                for(var index in config) {
                    if(config[index].key == key) {
                        return config[index];
                    }
                }
                return null;
            }

            function pick(config, keyArray) {
                var returnArray = [];
                for(var index in keyArray) {
                    var tmpObject = read(config, keyArray[index]);
                    if(tmpObject !== null) {
                        returnArray.push(tmpObject);
                    }
                }
                return returnArray;
            }

            // return a list object of same property
            function filter(object, propertyName, key, retriveFiltered) {
                var returnObject = [];
                retriveFiltered = retriveFiltered ? true: false;
                for(var index in object) {
                    if(_getProperty(object[index], propertyName) == key && !retriveFiltered) {
                        returnObject.push(object[index]);
                    } else if(_getProperty(object[index], propertyName) != key && retriveFiltered) {
                        returnObject.push(object[index]);
                    }
                }
                return returnObject;
            }

            function search(sourceObject, value, keyArray, insensitive) {
                insensitive = insensitive ? true : false;
                if(insensitive) {
                    value = value.toLowerCase();
                }
                var output = [];
                for(var objectIndex in sourceObject) {
                    var matchFlag = false;
                    for(var keyIndex in keyArray) {
                        var source = _getProperty(sourceObject[objectIndex], keyArray[keyIndex]);
                        if(insensitive) {
                            source = source.toLowerCase();
                        }

                        if(source != undefined && source.match(value)) {
                            matchFlag = true;
                        }
                    }

                    if(matchFlag) {
                        output.push(sourceObject[objectIndex]);
                    }
                }
                return output;
            }

            function _getProperty(inputObject, propertyName) {
                var propertyStack = propertyName.split('.');
                var stackPointer = 0;
                var returnValue = inputObject;
                while(stackPointer < propertyStack.length) {
                        if(returnValue) {
                            returnValue = returnValue[propertyStack[stackPointer]];
                            stackPointer ++;
                        } else {
                            return undefined
                        }
                }
                return returnValue;
            }

        }

        // a container contains fome group function for angular-ui-select
        function groupFn() {
            return {
                projectGroupFn: projectGroupFn,
                groupedMenuGenerator: groupedMenuGenerator,
                roleGroupFn: roleGroupFn,
            }

            function projectGroupFn(item) {
                if(item.starFlag) {
                    return '星标项目';
                } else if (item.creatorFlag) {
                    return '我创建的';
                } else {
                    return '我参与的';
                }
            }

            function roleGroupFn(item) {
                item.class = item.role ? item.role.class: '';
                if(item.deleteFlag) {
                    item.class = 'project-dashboard-number-closed';
                    return '已退出';
                } else {
                    return item.role ? item.role.label: null;
                }
            }

            // generated an ordered menu list group by groupFn
            function groupedMenuGenerator(menuList, groupFn) {
                var outputList = [];
                var groupList = {};
                for(var index in menuList) {
                    var groupID = groupFn(menuList[index]);

                    groupID = groupID !== null ? groupID : 'bugTracker::ungrouped';

                    if(!groupList[groupID]) {
                        groupList[groupID] = [];
                    }

                    groupList[groupID].push(menuList[index]);
                }

                var currentGroupIndex = 0;
                var currentGroupID = null;
                for(groupID in groupList) {
                    if(currentGroupID != groupID) {
                        if(currentGroupIndex != 0) {
                            outputList.push({key: 'bugTracker::divider', label: '::'});
                        }

                        if(groupID != 'bugTracker::ungrouped') {
                            outputList.push({key: 'bugTracker::group-label', label: groupID});
                        }

                        outputList = outputList.concat(groupList[groupID]);
 
                        currentGroupIndex ++;
                        currentGroupID == groupID;
                    }
                }

                return outputList;
            }
        }

        // permision
        // check permision of individual request
        function permision() {
            return {
                checkPermision: checkPermision,
                checkPermisionGroup: checkPermisionGroup,
                getPrivilege: getPrivilege,
            };

            function checkPermision(permisionCode, privilegeSegments) {
                var segmentIndex = Math.floor(permisionCode / 0x20);
                var permisionOffset = permisionCode % 0x20;
                
                var segmentCode = privilegeSegments[segmentIndex];

                if(segmentCode >> permisionOffset & 1) {
                    return true;
                } else {
                    return false;
                }
            }

            function checkPermisionGroup(permisionCodeGroup, mode, privilegeSegments) {
                var groupLength = permisionCodeGroup.length;
                var groupGrantedCount = 0;
                
                if(!groupLength) {
                    return false;
                }

                for(var codeIndex in permisionCodeGroup) {
                    groupGrantedCount += checkPermision(permisionCodeGroup[codeIndex], privilegeSegments) ? 1 : 0;
                }

                if(mode == 'and') {
                    return groupGrantedCount == groupLength;
                } else {
                    return groupGrantedCount > 0;
                }
            }

            function getPrivilege (privilegeList) {
                var code = [];

                for(var index in privilegeList) {
                    var segment = Math.floor(privilegeList[index] / 0x20);
                    var flag = privilegeList[index] % 0x20;

                    if(!code[segment]) {
                        code[segment] = 0;
                    }

                    code[segment] |= 1 << flag;
                }

                return code;
            }

        }

        function utilities() {
            return {
                qiniuUploader: qiniuUploader,
            }

            function qiniuUploader() {
                var stringFormaterHelper = stringFormater();
                var uploadArray = [];
                var self = this;
                self.length = 0;

                self.onProgress = function(data){};
                self.onUpload = function(data){};
                self.onSuccess = function(data){};
                self.onAbort = function(data){};
                self.onError = function(data){};



                function getFileExtesion(file) {
                    var ext = '';
                    if(file.name) {
                        ext = '.' + file.name.split('.')[1];
                    } else {
                        if(file.type.match( /png/i )) {
                            ext = '.png'
                        }
                        if(file.type.match( /jp/i )) {
                            ext = '.jpg'
                        }
                        if(file.type.match( /b/i )) {
                            ext = '.bmp'
                        }
                    }
                    return ext;
                }

                function composeFileKey(fileID, ext) {
                    return 'upload_' + fileID + ext;
                }

                self.upload = function(uploadToken, file) {
                    var fileID = stringFormaterHelper.getTimeBasedID();
                    var fileKey = composeFileKey(fileID, getFileExtesion(file));
                    var fileName = file.name ? file.name : fileKey;
                    var formData = new FormData();
                    var xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = function () {
                        if(xhr.readyState == 4 && xhr.status == 200) {
                            var data = JSON.parse(xhr.responseText);
                            if(data.key) {
                                //data {hash, key}
                                var targetItem = getItem(fileID);
                                if(targetItem) {
                                    targetItem.progress = 100;
                                    targetItem.fileKey = data.key;
                                    self.onSuccess({type: 'success', target: targetItem});
                                    removeItem(fileID);
                                }
                            } else {
                                var targetItem = getItem(fileID);
                                if(targetItem) {
                                    targetItem.progress = 0;
                                    self.onError({type: 'error', target: targetItem, error:xhr.statusText});
                                    removeItem(fileID);
                                }
                            }
                        } else if (xhr.readyState == 4) {
                            var targetItem = getItem(fileID);
                            if(targetItem) {
                                targetItem.progress = 0;
                                self.onError({type: 'error', target: targetItem, error:xhr.statusText});
                                removeItem(fileID);
                            }
                        }
                    }

                    xhr.addEventListener('error', function(e) {
                        var targetItem = getItem(fileID);
                        if(targetItem) {
                            targetItem.progress = 0;
                            self.onError({type: 'error', target: targetItem, error:e.type});
                            removeItem(fileID);
                        }
                    })

                    if(xhr.upload) {
                        xhr.upload.onprogress = function(e) {
                            if(e.lengthComputable) {
                                var percentComplete = e.loaded / e.total;
                                percentComplete = Math.floor(percentComplete * 100);
                                var targetItem = getItem(fileID);
                                if(targetItem) {
                                    targetItem.progress = percentComplete;
                                    self.onProgress({type: 'progress', target: targetItem});
                                }
                            }
                        }
                    }

                    var item = {
                        id: fileID,
                        fileKey: fileKey,
                        name: fileName,
                        mime: file.type,
                        xhr: xhr,
                        progress: 0,
                        uploaded: false,
                    };
                    addItem(item);

                    formData.append('key', fileKey);
                    formData.append('token', uploadToken);
                    formData.append('accept', '*');
                    formData.append('file', file, fileName);
                    xhr.open('POST', 'https://up.qbox.me/', true);
                    xhr.send(formData);
                    return item;
                }

                self.abort = function(id) {
                    var item = getItem(id);
                    if(item) {
                        item.xhr.abort();
                        self.onAbort({type:'abort', data:item});
                        removeItem(id);
                    }
                };

                function addItem(item) {
                    self[self.length] = item;
                    self.length ++;
                    self.onUpload({type: 'upload', target: item});
                    return item;
                }

                function removeItem(id) {
                    var arrangedIndex = 0;
                    var removed = false;
                    var targetLength = self.length;
                    for(var index = 0; index < self.length; index ++) {
                        if(self[index] && self[index].id === id) {
                            self[index] = null;
                            targetLength --;
                            removed = true;
                        } else {
                            self[arrangedIndex] = self[index];
                            arrangedIndex ++;
                        }
                    }
                    self.length = targetLength;
                    return removed;
                }

                function getItem(id) {
                    for(var index = 0; index < self.length; index ++) {
                        if(self[index] && self[index].id === id) {
                            return self[index];
                        }
                    }
                }
            }
        }

    });


function VCSService ( $http, $uibModal, $rootScope) {


    var service = {

        getRepositoryList : function (pKey, repositoryType, type) {
            return $http({
                method: 'post',
                url: '/api/VCS/getRepositoryList',
                data: $.param({
                    pKey: pKey,
                    repositoryType: repositoryType,
                    type: type ? type : 'normal'
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        setRepository : function (pKey, repositoryInfo) {
            return $http({
                method: 'post',
                url: '/api/VCS/setRepository',
                data: $.param({
                    pKey: pKey,
                    repositoryName: repositoryInfo.repositoryName,
                    repositoryConfig: angular.toJson(repositoryInfo.configData)
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        getRepository : function ( pKey) {
            return $http({
                method: 'post',
                url: '/api/VCS/getRepository',
                data: $.param({
                    pKey: pKey
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        loadCommit : function ( iKey) {
            return $http({
                method: 'post',
                url: '/api/VCS/loadCommit',
                data: $.param({
                    iKey: iKey
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        addBind : function ( iKey, bindHashes) {
            return $http({
                method: 'post',
                url: '/api/VCS/bindCommit',
                data: $.param({
                    iKey: iKey,
                    binds: bindHashes
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        bindCommit : function ( issueInfo, callback) {

            var scope = $rootScope.$new();
            scope.data = {
                iKey : issueInfo.i_key,
                iNo: issueInfo.i_no,
                pKey: issueInfo.p_key,
                title: issueInfo.i_title,
                callback: callback
            }

            $uibModal.open({
                templateUrl: 'views/issue/bindCommit.html',
                size: 'md',
                controller: bindCommitCtrl,
                backdrop: 'static',
                scope: scope,
                keyboard: false
            });
        },

        loadCommitInfo : function (ikey) {
            return $http({
                method: 'post',
                url: '/api/VCS/loadCommitInfo',
                data: $.param({
                    iKey: ikey
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        importIssue : function (pKey) {
            return $http({
                method: 'post',
                url: '/api/VCS/importIssue',
                data: $.param({
                    pKey: pKey
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

    }

    return service;
}


//register service
angular
    .module('bugs')
    .factory('VCSService', VCSService)

function IMService ( $http, $rootScope, cacheService) {

    var service = {

        getCredential : function () {
            return $http({
                method: 'post',
                url: '/api/IM/getCredential',
                data: $.param({
                }),
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(data){
                this.data = data.data;
                return this.data;
            })
        },

        getChatUserInfo : function (uKey) {
            var cacheAPI = '/api/IM/getChatUserInfo:uKey=' + uKey;
            if( cacheService.checkCached( cacheAPI)) {
                return cacheService.getPromise( cacheAPI);
            } else {
                return $http({
                    method: 'post',
                    url: '/api/IM/getChatUserInfo',
                    data: $.param({
                        user: uKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                }).then(function(data){
                    this.data = data.data;
                    cacheService.setCache(cacheAPI, this.data);
                    return this.data;
                })
            }
        },

    }

    return service;
}

//register service
angular
    .module('bugs')
    .factory('IMService', IMService)

function settingService($rootScope,$http){
    var data;
    var service = {
        getLoggedUserInfo : getLoggedUserInfo,
        changePassword: changePassword,
        changeEmail: changeEmail,
        getPaymentRecord: getPaymentRecord,
        updateInvoice: updateInvoice,
        loadInvoiceInfo: loadInvoiceInfo,
        changeProjectOwner: changeProjectOwner,
        loadCallingCode :loadCallingCode,
    };

    return service;

    function getLoggedUserInfo(){
        return $http.get('/api/user/setting').then(function(data){
            this.data = data.data.data;
            return this.data;
        })
    }

    function changePassword(oldPassword, newPassword) {
        return $http({
            method: 'post',
            url: '/api/user/changePassword',
            data: $.param({
                oldPassword: oldPassword,
                newPassword: newPassword,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function changeEmail(password, email) {
        return $http({
            method: 'post',
            url: '/api/user/changeEmail',
            data: $.param({
                password: password,
                email: email,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getPaymentRecord(filterUnfinished) {
        return $http({
            method: 'post',
            url: '/api/user/getPaymentRecord',
            data: $.param({
                finished: filterUnfinished ? 1 : 0,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function updateInvoice(param) {
        return $http({
            method: 'post',
            url: '/api/user/updateInvoice',
            data: param,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function loadInvoiceInfo(rrKey) {
        return $http({
            method: 'post',
            url: '/api/user/loadInvoiceInfo',
            data: $.param({
                rechargeKey: rrKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function changeProjectOwner(pKey, uKey) {
        return $http({
            method: 'post',
            url: '/api/project/changeProjectOwner',
            data: $.param({
                pKey: pKey,
                uKey: uKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function loadCallingCode(){
        return $http({
            method: 'get',
            url : '/api/user/getAllCallingCode',
            headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }
};



angular
    .module('bugs')
    .factory('settingService',settingService)

angular
    .module('bugs')
    .factory('httpInterceptor', ['$q', '$injector', httpInterceptor])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push(httpInterceptor);
    }]);

function httpInterceptor($q, $injector) {
    var toastr;
    return {
        request: function(config){
            return config;
        },
        requestError: function(err){
            return $q.reject(err);
        },
        response: function(res){
            return res;
        },
        responseError: function(err) {
            if (!toastr) { toastr = $injector.get('toastr');};
            if(err.status === 429) {
                var remains = err.headers('Retry-After');
                console.log(['Your request is rejected by server, please try it again after', remains, 'second(s).'].join(' '));
                toastr.error('您的操作过于频繁, 请在 ' + remains + ' 秒后重试。');
                return $q.reject(err);
            }
        }
    };
};


function upgradeService($rootScope, $http, cacheService) {

    var data;
    var service = {
        updatePrice : updatePrice,
        submitOrder : submitOrder,
        checkPayStatus : checkPayStatus,
        getProducQuotaConfig : getProducQuotaConfig,
    };

    return service;

    function updatePrice(paymentData) {
        return $http({
            method: 'post',
            url: '/api/upgrade/updatePrice',
            data: $.param(paymentData),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function submitOrder(paymentData) {
        return $http({
            method: 'post',
            url: '/api/upgrade/submitOrder',
            data: $.param(paymentData),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function checkPayStatus(key) {
        return $http({
            method: 'post',
            url: '/pay/getPayStatus',
            data: $.param({key:key}),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }

    function getProducQuotaConfig() {
        return $http({
            method: 'post',
            url: '/api/upgrade/getProducQuotaConfig',
            data: $.param({}),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data){
            this.data = data.data;
            return this.data;
        })
    }


};

angular
    .module('bugs')
    .factory('upgradeService', upgradeService)

/**
 * HOMER - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */

angular
    .module('bugs')
    .directive('pageTitle', pageTitle)
    .directive('sparkline', sparkline)
    .directive('icheck', icheck)
    .directive('panelTools', panelTools)
    .directive('panelToolsFullscreen', panelToolsFullscreen)
    .directive('smallHeader', smallHeader)
    .directive('animatePanel', animatePanel)
    .directive('landingScrollspy', landingScrollspy)
    .directive('clockPicker', clockPicker)
    .directive('dateTimePicker', dateTimePicker)
    .directive('setHeight', setHeight)
    .directive('noScrollHeight', noScrollHeight)
    .directive('fullScroll', fullScroll)
    .directive('resize', resize)
    .directive('errSrc', errSrc)
    .directive('loadError', loadError)

function resize($window) {
    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': window.innerHeight,
                'w': window.innerWidth
            };
        }, function (newValue, oldValue) {
//            console.log(newValue, oldValue);
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.resizeWithOffset = function (offsetH) {
                scope.$eval(attr.notifier);
                return {
                    'max-height': (newValue.h - offsetH) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
}

function setHeight($window) {
    return {
        link: function(scope, element, attrs){
            function setHeight() {
                var top = element.offset().top;
                var setHeight = $window.innerHeight - top;
                element.css('min-height', setHeight + 'px');
            }
            angular.element(window).bind('resize', setHeight);
            setTimeout(setHeight, 1000);
        }
    }
};

function noScrollHeight($window) {
    return {
        link: function(scope, element, attrs) {
            var bottomStickBox = attrs.stickBox ? angular.element(attrs.stickBox) : null;
            var windowHeight = $window.innerHeight;
            var top = element.offset().top - $(window).scrollTop();
            var setHeight = 0;
            var minSetHeight = attrs.minSetHeight ? parseInt(attrs.minSetHeight) : 0;
            var bottomTrim = attrs.bottomTrim ? parseInt(attrs.bottomTrim) : 0;
            function setNoScrollHeight() {
                windowHeight = $window.innerHeight;
                bottomStickBox = attrs.stickBox ? angular.element(attrs.stickBox) : null;
                top = element.offset().top - $(window).scrollTop();
                setHeight = 0;
                minSetHeight = attrs.minSetHeight ? parseInt(attrs.minSetHeight) : 0;
                bottomTrim = attrs.bottomTrim ? parseInt(attrs.bottomTrim) : 0;
                if(bottomStickBox) {
                    if(windowHeight > top + bottomTrim) {
                        setHeight = windowHeight - top - bottomStickBox.height();
                    } else {
                        setHeight = minSetHeight;
                    }
                    element.css('height', setHeight + 'px');
                } else {
                    if(windowHeight > top + bottomTrim) {
                        setHeight = windowHeight - top - bottomTrim;
                    } else {
                        setHeight = minSetHeight;
                    }
                    element.css('height', setHeight + 'px');
                }
            }

            if(bottomStickBox) {
                scope.$watch(function () {
                    return bottomStickBox.height();
                }, function(newValue, oldValue) {
                    if(windowHeight > top + bottomTrim) {
                        setHeight = windowHeight - top - newValue;
                    } else {
                        setHeight = minSetHeight;
                    }

                    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        element.css('height', setHeight + 'px');
                    }
                });
            }

            angular.element(window).bind('resize', setNoScrollHeight);
            setTimeout(setNoScrollHeight, 10);
            setTimeout(setNoScrollHeight, 50);
        }
    }
};

function fullScroll($timeout, $window){
    return {
        restrict: 'A',
        link: function(scope, element) {
            $timeout(function(){
                element.slimscroll({
                    height: '100%',
                    color: '#ccc',
                    alwaysVisible: true,
                    railOpacity: 0.4,
                    railColor: '#fff',
                });

            });
        }
    };
}

/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                // Default title
                var title = 'Tracup | 用最优雅的方式追踪 Bug';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'Tracup | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
};

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            element.metisMenu();

            // Colapse menu in mobile mode after click on element
            var menuElement = $('#side-menu a:not([href$="\\#"])');
            menuElement.click(function(){

                if ($(window).width() < 769) {
                    $("body").toggleClass("show-sidebar");
                }
            });


        }
    };
};

/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
function minimalizaMenu($rootScope) {
    return {
        restrict: 'EA',
        template: '<div class="header-link hide-menu" ng-click="minimalize()"><i class="fa fa-bars"></i></div>',
        controller: function ($scope, $element) {

            $scope.minimalize = function () {
            if ($(window).width() < 769) {
                    $("body").toggleClass("show-sidebar");
                } else {
                    $("body").toggleClass("hide-sidebar");
                }
            }
        }
    };
};


/**
 * sparkline - Directive for Sparkline chart
 */
function sparkline() {
    return {
        restrict: 'A',
        scope: {
            sparkData: '=',
            sparkOptions: '=',
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.sparkData, function () {
                render();
            });
            scope.$watch(scope.sparkOptions, function(){
                render();
            });
            var render = function () {
                $(element).sparkline(scope.sparkData, scope.sparkOptions);
            };
        }
    }
};

/**
 * icheck - Directive for custom checkbox icheck
 */
function icheck($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function($scope, element, $attrs, ngModel) {
            return $timeout(function() {
                var value;
                value = $attrs['value'];

                $scope.$watch($attrs['ngModel'], function(newValue){
                    $(element).iCheck('update');
                })

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_minimal-green',
                    radioClass: 'iradio_minimal-green'

                }).on('ifChanged', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
            });
        }
    };
}


/**
 * panelTools - Directive for panel tools elements in right corner of panel
 */
function panelTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/panel_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var hpanel = $element.closest('div.hpanel');
                var icon = $element.find('i:first');
                var body = hpanel.find('div.panel-body');
                var footer = hpanel.find('div.panel-footer');
                body.slideToggle(300);
                footer.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                hpanel.toggleClass('').toggleClass('panel-collapse');
                $timeout(function () {
                    hpanel.resize();
                    hpanel.find('[id^=map-]').resize();
                }, 50);
            },

            // Function for close ibox
            $scope.closebox = function () {
                var hpanel = $element.closest('div.hpanel');
                hpanel.hide();
            }

        }
    };
};

/**
 * panelToolsFullscreen - Directive for panel tools elements in right corner of panel with fullscreen option
 */
function panelToolsFullscreen($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/panel_tools_fullscreen.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var hpanel = $element.closest('div.hpanel');
                var icon = $element.find('i:first');
                var body = hpanel.find('div.panel-body');
                var footer = hpanel.find('div.panel-footer');
                body.slideToggle(300);
                footer.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                hpanel.toggleClass('').toggleClass('panel-collapse');
                $timeout(function () {
                    hpanel.resize();
                    hpanel.find('[id^=map-]').resize();
                }, 50);
            };

            // Function for close ibox
            $scope.closebox = function () {
                var hpanel = $element.closest('div.hpanel');
                hpanel.hide();
                if($('body').hasClass('fullscreen-panel-mode')) { $('body').removeClass('fullscreen-panel-mode');}
            };

            // Function for fullscreen
            $scope.fullscreen = function () {
                var hpanel = $element.closest('div.hpanel');
                var icon = $element.find('i:first');
                $('body').toggleClass('fullscreen-panel-mode');
                icon.toggleClass('fa-expand').toggleClass('fa-compress');
                hpanel.toggleClass('fullscreen');
                setTimeout(function() {
                    $(window).trigger('resize');
                }, 100);
            }

        }
    };
};

/**
 * smallHeader - Directive for page title panel
 */
function smallHeader() {
    return {
        restrict: 'A',
        scope:true,
        controller: function ($scope, $element) {
            $scope.small = function() {
                var icon = $element.find('i:first');
                var breadcrumb  = $element.find('#hbreadcrumb');
                $element.toggleClass('small-header');
                breadcrumb.toggleClass('m-t-lg');
                icon.toggleClass('fa-arrow-up').toggleClass('fa-arrow-down');
            }
        }
    }
}

function animatePanel($timeout,$state) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            //Set defaul values for start animation and delay
            var startAnimation = 0;
            var delay = 0.06;   // secunds
            var start = Math.abs(delay) + startAnimation;

            // Store current state where directive was start
            var currentState = $state.current.name;

            // Set default values for attrs
            if(!attrs.effect) { attrs.effect = 'zoomIn'};
            if(attrs.delay) { delay = attrs.delay / 10 } else { delay = 0.06 };
            if(!attrs.child) { attrs.child = '.row > div'} else {attrs.child = "." + attrs.child};

            // Get all visible element and set opactiy to 0
            var panel = element.find(attrs.child);
            panel.addClass('opacity-0');

            // Count render time
            var renderTime = panel.length * delay * 1000 + 700;

            // Wrap to $timeout to execute after ng-repeat
            $timeout(function(){

                // Get all elements and add effect class
                panel = element.find(attrs.child);
                panel.addClass('stagger').addClass('animated-panel').addClass(attrs.effect);

                var panelsCount = panel.length + 10;
                var animateTime = (panelsCount * delay * 10000) / 10;

                // Add delay for each child elements
                panel.each(function (i, elm) {
                    start += delay;
                    var rounded = Math.round(start * 10) / 10;
                    $(elm).css('animation-delay', rounded + 's');
                    // Remove opacity 0 after finish
                    $(elm).removeClass('opacity-0');
                });

                // Clear animation after finish
                $timeout(function(){
                    $('.stagger').css('animation', '');
                    $('.stagger').removeClass(attrs.effect).removeClass('animated-panel').removeClass('stagger');
                    panel.resize();
                }, animateTime)

            });



        }
    }
}

function landingScrollspy(){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.scrollspy({
                target: '.navbar-fixed-top',
                offset: 80
            });
        }
    }
}

/**
 * clockPicker - Directive for clock picker plugin
 */
function clockPicker() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element.clockpicker();
        }
    };
};

function dateTimePicker($parse){
    return {
        require: '?ngModel',
        restrict: 'AE',
        scope: true,
        link: function (scope, elem, attrs) {
            attrs.start = attrs.start ? attrs.start : false;
            attrs.end = attrs.end ? attrs.end : false;
            attrs.useCurrent = attrs.useCurrent ? attrs.useCurrent : false;
            attrs.defaultDate = attrs.defaultDate ? attrs.defaultDate : false;
            if(attrs.defaultDate && !attrs.defaultDate.match(/\d{4}-\d{2}-\d{2}/)) {
                attrs.defaultDate = false;
            }
            elem.datetimepicker({
                pick12HourFormat: scope.pick12HourFormat,
                format: "YYYY-MM-DD",
                locale: "zh-cn",
                useCurrent: attrs.useCurrent,
                defaultDate: attrs.defaultDate,
                minDate: attrs.start,
                maxDate: attrs.end,
                showTodayButton: true,
                showClear: true,
                showClose: true,
                tooltips: {
                    today: '今天',
                    clear: '清除',
                    close: '关闭',
                    selectMonth: '选择月份',
                    prevMonth: '上个月',
                    nextMonth: '下个月',
                    selectYear: '选择年份',
                    prevYear: '上一年',
                    nextYear: '下一年',
                    selectDecade: '按十年选择',
                    prevDecade: '上十年',
                    nextDecade: '下十年',
                    prevCentury: '上世纪',
                    nextCentury: '下世纪',
                },
                icons: {
                    close: 'glyphicon glyphicon-text-close',
                    today: 'glyphicon glyphicon-text-today',
                    clear: 'glyphicon glyphicon-text-clear',
                }
            })

            attrs.$observe('start', function (val) {
                attrs.start = attrs.start ? attrs.start : false;
                elem.data('DateTimePicker').minDate(attrs.start);
            });

            attrs.$observe('end', function (val) {
                attrs.end = attrs.end ? attrs.end : false;
                elem.data('DateTimePicker').maxDate(attrs.end);
            });

            elem.on('dp.change', function () {
                if(!$(elem).data("DateTimePicker").date()) {
                    $(elem).data("DateTimePicker").hide();
                }
            });

            $(elem).data("DateTimePicker").widgetPositioning({vertical: 'bottom', horizontal: 'auto'});

            //Local event change
            elem.on('blur', function () {

                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply(function() {
                        var model = $parse(attrs.ngModel);
                        model.assign(scope, $(elem).val());

                    });
                }

                // For test
                //console.info('this', this);
                //console.info('scope', scope);
                //console.info('attrs', attrs);


                /*// returns moments.js format object
                 scope.dateTime = new Date(elem.data("DateTimePicker").getDate().format());
                 // Global change propagation
                 $rootScope.$broadcast("emit:dateTimePicker", {
                 location: scope.location,
                 action: 'changed',
                 dateTime: scope.dateTime,
                 example: scope.useCurrent
                 });
                 scope.$apply();*/
            })
        }
    };
}

// when load error switch default src
function errSrc() {
    return {
        link: function(scope, element, attrs) {
                  element.bind('error', function() {
                      if (attrs.src != attrs.errSrc) {
                          attrs.$set('src', attrs.errSrc);
                      }
                  });
              }
    }
}

// when load error call the callback
function loadError() {
    return {
        restrict: 'A',
        scope: {
            loadError: "&",
        },
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                scope.loadError();
            });
        }
    }
}

angular
    .module('bugs')
    .directive('loading', loading);

function loading($rootScope, $timeout) {
    return {
        restrict: 'E',
        template: '<div class="sk-fading-circle"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>',
        //template: '<div class="loadingIcon"><img src="/static/images/loading-100px.gif"/></div>',
        link: function (scope, element, attrs) {
        }
    }
};

angular
    .module('bugs')
    .directive('loadingHorizonal', loadingHorizonal);

function loadingHorizonal($rootScope, $timeout) {
    return {
        restrict: 'E',
        template: '<div class="col-xs-12"><div class="la-ball-beat la-dark la" style="margin: 0 auto;"><div></div><div></div><div></div></div></div>',
        link: function (scope, element, attrs) {
        }
    }
};

angular
    .module('bugs')
    .directive('topNav', topNav);
/**
 * topNav - Directive for set if show top navigation
 */
function topNav($rootScope, $timeout, $uibModal, $state, $stateParams) {
    return {
        restrict: 'E',
        templateUrl: 'views/common/project_sub_nav.html',
        scope: {
            pKey: '@',
            manage: '@',
            list: '@',
            listJoin: '@',
            listStar: '@',
            projectInfo : '@'
        },
        controller: function($rootScope, $scope, $http, $element, constants, helper, $state, $stateParams){ 
            $scope.constants = constants;

            // user access control setting
            $scope.UAC = {};
            $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'topNav');
            function onProjectConfigChange(newValue, oldValue) {

                if(newValue) {
                    var permision = helper.permision();
                    $scope.projectConfig = $rootScope.projectConfig;

                    // check user privilege
                    $scope.UAC.settingMenu = permision.checkPermisionGroup(constants.UACGROUP.projectSetting, 'or', $rootScope.projectConfig.current.role.privilege);
                    $scope.UAC.manageUser = permision.checkPermisionGroup([constants.UAC.memberChangeRole, constants.UAC.memberRemove], 'or', $rootScope.projectConfig.current.role.privilege);
                    $scope.UAC.memberAdd = permision.checkPermision(constants.UAC.memberAdd, $rootScope.projectConfig.current.role.privilege);
                    $scope.UAC.addIssue = permision.checkPermision(constants.UAC.issueAdd, $rootScope.projectConfig.current.role.privilege);
                } else {
                    // do nothing
                }
            }

        },
        link: function(scope, http, element, attrs, state, stateParams) {
            scope.$state = $state;
            scope.projectDashboard = function (val){
                $state.go('project.dashboard', {pKey: val});
            };

            scope.createQuestion = function (parentIssueKey) {
                scope.newSubIssueParentKey = parentIssueKey ? parentIssueKey : false;
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/issue/addIssue.html',
                    size: 'lg',
                    controller: addIssuesCtrl,
                    scope: scope,
                    backdrop: 'static',
                    keyboard: false
                });
            };

           scope.manageUser = function () {
               var modalInstance = $uibModal.open({
               templateUrl: 'views/project/manage_user_modal.html',
               controller: manageUserCtrl,
               windowClass: "hmodal-success",
               backdrop: 'static',
               keyboard: false
            });
          };

           scope.inviteUser = function () {
               var modalInstance = $uibModal.open({
               templateUrl: 'views/project/invite_user_modal.html',
               controller: inviteUserCtrl,
               windowClass: "hmodal-success",
               backdrop: 'static',
               keyboard: false
            });
          };

       }
    };
};

angular.module('bugs')
.directive('contextMenu', ["$parse", "$q", function ($parse, $q) {
    var inoArray = [];
    var contextMenus = [];
    var removeContextMenus = function (level) {
        while (contextMenus.length && (!level || contextMenus.length > level)) {
            contextMenus.pop().remove();
        }
        if (contextMenus.length == 0 && $currentContextMenu) {
            $currentContextMenu.remove();
        }
    };

    var $currentContextMenu = null;

    var renderContextMenu = function ($scope, event, options, model, level) {
        if (!level) { level = 0; }
        if (!$) { var $ = angular.element; }
        $(event.currentTarget).addClass('context');
        var $contextMenu = $('<div>');
        if ($currentContextMenu) {
            $contextMenu = $currentContextMenu;
        } else {
            $currentContextMenu = $contextMenu;
        }
        $contextMenu.addClass('dropdown clearfix');
        $contextMenu.attr({'id':'dropdown'});
        var $ul = $('<ul>');
        $ul.addClass('dropdown-menu');
        $ul.css({
            position: 'absolute',
            left: event.pageX + 'px',
            top: event.pageY + 'px',
            "z-index": 10000
        });
       var hh = 0;
        angular.forEach(options, function (item, i) {
            var $li = $('<li>');
            if (item === null) {
                //$li.addClass('divider');
            } else {
                if(level<=0){ 
                    $li.addClass('dropdown-submenu');
                    $li.on("mouseover", function(e){
                        $(".dropdown-submenu").removeClass('active');
                        $(this).addClass('active');
                    })
                }
                var nestedMenu = angular.isArray(item[1])
                  ? item[1] : angular.isArray(item[2])
                  ? item[2] : angular.isArray(item[3])
                  ? item[3] : null;
                var $a = $('<a>');
                $a.attr({ tabindex: '0'});
                var text = typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope, event, model);
                var arr = text.split(',');
                text = arr[0];
                var uKey = arr[1];
                var assignee = arr[2];

                $q.when(text).then(function (text) {
                    if (nestedMenu) {
                        $a.html(text);
                        if(text.length == 2){
                            $a.append("<i class='fa fa-caret-right' style=margin-left:114px;></i>")
                        }else{
                            $a.append("<i class='fa fa-caret-right' style=margin-left:100px;></i>")
                        }
                    } else {
                        $a.html("<span class='pull-left'>" + text + "</span>");
                        angular.forEach($scope.menuOptionsSelected, function (item) {
                            if (assignee && item == uKey) {
                                // 加对号
                                $a.append("<i class='fa fa-check pull-right'></i>");
                            }else if(!assignee && item == text){
                                $a.append("<i class='fa fa-check pull-right'></i>");
                            }

                        });
                    }
                });
                $li.append($a);
                var enabled = angular.isFunction(item[2]) ? item[2].call($scope, $scope, event, model, text) : true;
                if (enabled) {
                    var openNestedMenu = function ($event) {
                        removeContextMenus(level + 1);
                        var ev = {
                            pageX: event.pageX + $ul[0].offsetWidth - 1,
                            pageY: $ul[0].offsetTop + $li[0].offsetTop - 3
                        };
                        renderContextMenu($scope, ev, nestedMenu, model, level + 1);
                    }
                    $li.on('click', function ($event) {
                        //$event.preventDefault();
                        $scope.$apply(function () {
                            if (nestedMenu) {
                                openNestedMenu($event);
                            } else {
                                $(event.currentTarget).removeClass('context');
                                removeContextMenus();
                                item[1].call($scope, $scope, event, model);
                            }
                        });
                    });

                    $li.on('mouseover', function ($event) {
                        $scope.$apply(function () {
                            if (nestedMenu) {
                                openNestedMenu($event);
                            }
                        });
                    });
                } else {
                    $li.on('click', function ($event) {
                        $event.preventDefault();
                    });
                    $li.addClass('disabled');
                }
            }
            $ul.append($li);
            hh += 18;
        });

        var h1 = document.body.scrollTop + document.body.clientHeight;
        var h2 = h1 - event.pageY;
        var h3 = event.pageY;
        if( h2 < 300 ) {
          h3 = event.pageY - hh;
        }
        $ul.css({
            top: h3 + 'px'
        });
         var ww = document.body.clientWidth - event.pageX;
         if(ww<170) {
                $ul.css({
                    left: event.pageX-342 + 'px'
                });
         }

        $contextMenu.append($ul);
        var height = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        $contextMenu.css({
            width: '100%',
            height: height + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999
        });
        $(document).find('body').append($contextMenu);
        $contextMenu.on("mousedown", function (e) {
            if ($(e.target).hasClass('dropdown')) {
                $(event.currentTarget).removeClass('context');
                removeContextMenus();
                $("table.table-striped tr").removeClass("rightMenuBg");
                inoArray = [];
            }
        }).on('contextmenu', function (event) {
            $(event.currentTarget).removeClass('context');
            event.preventDefault();
            removeContextMenus(level);
        });
        $scope.$on("$destroy", function () {
            removeContextMenus();
                $("table.table-striped tr").removeClass("rightMenuBg");
        });

        contextMenus.push($ul);
    };
    return function ($scope, element, attrs) {
        element.on('contextmenu', function (event) {
            if (!$(this).hasClass('rightMenuBg')) {   
                inoArray = [];
                $("table.table-striped tr").removeClass("rightMenuBg");
                $(this).addClass("rightMenuBg");
            }

            event.stopPropagation();
            $scope.$apply(function () {
                event.preventDefault();
                var options = $scope.$eval(attrs.contextMenu);
                var model = $scope.$eval(attrs.model);
                if (options instanceof Array) {

                    $scope.contextMenuData = angular.fromJson(attrs.contextMenuData);

                    $scope.rightClick($scope.contextMenuData.p_key, inoArray);
                    options = $scope.$eval(attrs.contextMenu);

                    if (options.length === 0) { return; }

                    if (inoArray.length <= 1) {
                         $scope.menuOptionsSelected = [$scope.contextMenuData.status, $scope.contextMenuData.pt_key, $scope.contextMenuData.priority, $scope.contextMenuData.i_assignee, $scope.contextMenuData.p_key, $scope.contextMenuData.pm_key, $scope.contextMenuData.v_key];
                    }else{

                         $scope.menuOptionsSelected = [$scope.contextMenuData.p_key];
                    }

                    renderContextMenu($scope, event, options, model);
                } else {
                    throw '"' + attrs.contextMenu + '" not an array';
                }
            });
        });
        element.on('click', function (event) {
            var select = attrs.select;
            e = event;
            e.preventDefault();
            e.stopPropagation();
            var $this = $(this);
            if (e.ctrlKey || e.metaKey && select != 'disabled') {
                var inoObj = angular.fromJson($this.attr("context-menu-data"));
                if ($this.hasClass('rightMenuBg')){
                    $this.removeClass("rightMenuBg last");
                    inoArray = $scope.dealArr(inoArray, false, inoObj.i_no);
                } else {
                    $('#listIssues tr').removeClass("last");
                    $this.addClass('rightMenuBg last');
                    inoArray = $scope.dealArr(inoArray, true, inoObj.i_no);
                }
            } else if (e.shiftKey && select != 'disabled') {
                if(select == 'disabled') {   return false; }
                var currentSelectedIndex = $('#listIssues tr.last').eq(0).index() > 0 ? $('#listIssues tr.last').eq(0).index() : 0;
                var selectedElementIndex = $('#listIssues tr').index($this);
                if (currentSelectedIndex < selectedElementIndex){
                    inoArray = [];
                    $('#listIssues tr').removeClass('rightMenuBg');
                    for (var indexOfRows = currentSelectedIndex; indexOfRows <= selectedElementIndex; indexOfRows++)
                    {
                        $('#listIssues tr').eq(indexOfRows).addClass('rightMenuBg');
                        var inoObj = angular.fromJson($('#listIssues tr').eq(indexOfRows).attr("context-menu-data"));
                        inoArray = $scope.dealArr(inoArray, true, inoObj.i_no);
                    }
                } else {
                    inoArray = [];
                    $('#listIssues tr').removeClass('rightMenuBg');
                    for (var indexOfRows = selectedElementIndex; indexOfRows <= currentSelectedIndex; indexOfRows++)
                    {
                        $('#listIssues tr').eq(indexOfRows).addClass('rightMenuBg');
                        var inoObj = angular.fromJson($('#listIssues tr').eq(indexOfRows).attr("context-menu-data"));
                        inoArray = $scope.dealArr(inoArray, true, inoObj.i_no);
                    }
                }
            } else {
                inoArray = [];

                $('#listIssues tr').removeClass('rightMenuBg last');
                $this.addClass('rightMenuBg last');

                var inoObj = angular.fromJson($this.attr("context-menu-data"));
                inoArray = $scope.dealArr(inoArray, true, inoObj.i_no);
            }
        });
    };
}]);


angular
    .module('bugs')
    .directive('qiniuUpload', function() {
        return {
            scope: true,
            restrict: 'AE',
            link: function(scope, element, attrs) {
                var uploader = Qiniu.uploader({
                    runtimes: 'html5,flash,html4',
                    browse_button: 'pickfiles',
                    container: 'qiniu-container',
                    drop_element: 'qiniu-drop-container',
                    max_file_size: '1000mb',
                    flash_swf_url: 'bower_components/plupload/js/Moxie.swf',
                    dragdrop: true,
                    chunk_size: '4mb',
                    uptoken_url: $('#uptoken_url').val(),
                    domain: 'http://qiniu-plupload.qiniudn.com/',
                    get_new_uptoken: false,
                    // downtoken_url: '/downtoken',
                    unique_names: true,
                    // save_key: true,
                    // x_vars: {
                    //     'id': '1234',
                    //     'time': function(up, file) {
                    //         var time = (new Date()).getTime();
                    //         // do something with 'time'
                    //         return time;
                    //     },
                    // },
                    auto_start: true,
                    log_level: 1,
                    init: {
                        'FilesAdded': function(up, files) {
                            $('#upload-panel').slideDown();
                            $('#upload-panel .panel-title').text('文件上传')
                            plupload.each(files, function(file) {
                                var progress = new FileProgress(file, 'fsUploadProgress');
                                progress.setStatus("等待...");
                                progress.bindUploadCancel(up);
                            });
                        },
                        'BeforeUpload': function(up, file) {
                            var progress = new FileProgress(file, 'fsUploadProgress');
                            var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                            if (up.runtime === 'html5' && chunk_size) {
                                progress.setChunkProgess(chunk_size);
                            }
                        },
                        'UploadProgress': function(up, file) {
                            $('#upload-panel .panel-title').text('上传中...')
                            var progress = new FileProgress(file, 'fsUploadProgress');
                            var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                            progress.setProgress(file.percent + "%", file.speed, chunk_size);
                        },
                        'UploadComplete': function(up, file) {
                            $('#upload-panel .panel-title').text('上传完成')
                            var hpanel = angular.element('#upload-panel');
//                            hpanel.hide();
                            setTimeout(function() {
                                $('#upload-panel').slideUp();
                                $('#fsUploadProgress').html('');
                            }, 3000);
                        },
                        'FileUploaded': function(up, file, info) {
                            var progress = new FileProgress(file, 'fsUploadProgress');
                            progress.setComplete(up, info);
//                            console.log(up.total);
                        },
                        'Error': function(up, err, errTip) {
                            $('#upload-panel').show();
                            var progress = new FileProgress(err.file, 'fsUploadProgress');
                            progress.setError();
                            progress.setStatus(errTip);
                        }
                            // ,
                            // 'Key': function(up, file) {
                            //     var key = "";
                            //     // do something with key
                            //     return key
                            // }
                    }
                });

                uploader.bind('FileUploaded', function(up, info) {
                    // 刚上传完成就去qiniu获取文件信息有时候是拿不到的
                    setTimeout(function() {
                        scope.$eval(attrs.qiniuUpload, {targetName: info.target_name.toLowerCase(), name: info.name, size: info.size});
                    }, 2000);
                });

                var counter = 0;

                $('#qiniu-drop-container').on('dragenter', function(e) {
                    counter++;

                    e.preventDefault();
                    $('#qiniu-drop-container').addClass('draging');

                    var pDiv = $('#qiniu-drop-container');
                    var dropDiv = $('#qiniu-drop-over-layer');
                    if (!dropDiv.length) {
                        dropDiv = $('<div style="background-color:#f7f9fa; border:1px solid #e4e5e7; text-align:center; position:absolute; left:0; top:0;">拖拽文件到这里</div>');
                        dropDiv.attr('id', 'qiniu-drop-over-layer');
                        $('#qiniu-drop-container').append(dropDiv);
                    }

                    var paddingTop = (pDiv.css('height').replace(/px/, '') / 2 - 4) + 'px';
                    dropDiv.css('padding-top', paddingTop);
                    dropDiv.css('width', pDiv.css('width'));
                    dropDiv.css('height', pDiv.css('height'));
                    dropDiv.show();

                    e.stopPropagation();
                }).on('drop', function(e) {
                    e.preventDefault();
                    $('#qiniu-drop-container').removeClass('draging');
                    var dropDiv = $('#qiniu-drop-over-layer');
                    dropDiv.hide();
                    e.stopPropagation();
                }).on('dragleave', function(e) {
                    counter--;
                    e.preventDefault();
                    if (counter === 0) {
                        $('#qiniu-drop-container').removeClass('draging');
                        e.stopPropagation();
                        var dropDiv = $('#qiniu-drop-over-layer');
                        dropDiv.hide();
                    }
                }).on('dragover', function(e) {
                    e.preventDefault();
                    $('#qiniu-drop-container').addClass('draging');
                    e.stopPropagation();
                });
            }
        };
    })
    .directive('qiniuUploadPanel', function() {
        return {
            scope: true,
            restrict: 'E',
            templateUrl: 'views/common/qiniu_panel.html'
        }
    });

/*
 * 以下为 UI 处理的相关逻辑
 */
function FileProgress(file, targetID) {
    this.fileProgressID = file.id;
    this.file = file;

    this.opacity = 100;
    this.height = 0;
    this.fileProgressWrapper = $('#' + this.fileProgressID); // <tr>
    if (!this.fileProgressWrapper.length) {
        this.fileProgressWrapper = $('<div></div>');
        var Wrappeer = this.fileProgressWrapper;
        Wrappeer.attr('id', this.fileProgressID).addClass('progressContainer');

        // name
        var progressText = $("<div/>");
        var fileSize = plupload.formatSize(file.size).toUpperCase();
        progressText.addClass('progressName').text(file.name + ' - ' + fileSize);
        Wrappeer.append(progressText);

        // cancel
        var progressExtraText = $('<span/>');
        progressExtraText.addClass('extraText');
        progressExtraText.addClass('pull-right');
        progressText.append(progressExtraText);

        var progressCancel = $('<a href=javascript:; />');
        progressCancel.show().addClass('progressCancel').text('×')
        progressExtraText.append(progressCancel);

        // progress bar
        var progressBarWrapper = $("<div/>");
        progressBarWrapper.addClass("progress m-t-xs full progress-striped active");
        Wrappeer.append(progressBarWrapper);

        var progressBar = $("<div/>");
        progressBar.addClass("progress-bar progress-bar-info")
            .attr('role', 'progressbar')
            .attr('aria-valuemax', 100)
            .attr('aria-valuenow', 0)
            .attr('aria-valuein', 0)
            .width('0%');
        progressBarWrapper.append(progressBar);
        $('#' + targetID).append(Wrappeer);
    } else {
        this.reset();
    }

    this.height = this.fileProgressWrapper.offset().top;
    this.setTimer(null);
}

FileProgress.prototype.setTimer = function(timer) {
    this.fileProgressWrapper.FP_TIMER = timer;
};

FileProgress.prototype.getTimer = function(timer) {
    return this.fileProgressWrapper.FP_TIMER || null;
};

FileProgress.prototype.reset = function() {
    this.fileProgressWrapper.attr('class', "progressContainer");
    this.fileProgressWrapper.find('td .progress .progress-bar-info').attr('aria-valuenow', 0).width('0%').find('span').text('');
    this.appear();
};

FileProgress.prototype.setChunkProgess = function(chunk_size) {
    var chunk_amount = Math.ceil(this.file.size / chunk_size);
    if (chunk_amount === 1) {
        return false;
    }

    var viewProgess = $('<button class="btn btn-default">查看分块上传进度</button>');

    var progressBarChunkTr = $('<tr class="chunk-status-tr"><td colspan=3></td></tr>');
    var progressBarChunk = $('<div/>');
    for (var i = 1; i <= chunk_amount; i++) {
        var col = $('<div class="col-md-2"/>');
        var progressBarWrapper = $('<div class="progress progress-striped"></div');

        var progressBar = $("<div/>");
        progressBar.addClass("progress-bar progress-bar-info text-left")
            .attr('role', 'progressbar')
            .attr('aria-valuemax', 100)
            .attr('aria-valuenow', 0)
            .attr('aria-valuein', 0)
            .width('0%')
            .attr('id', this.file.id + '_' + i)
            .text('');

        var progressBarStatus = $('<span/>');
        progressBarStatus.addClass('chunk-status').text();

        progressBarWrapper.append(progressBar);
        progressBarWrapper.append(progressBarStatus);

        col.append(progressBarWrapper);
        progressBarChunk.append(col);
    }

    if(!this.fileProgressWrapper.find('td:eq(2) .btn-default').length){
        this.fileProgressWrapper.find('td>div').append(viewProgess);
    }
    progressBarChunkTr.hide().find('td').append(progressBarChunk);
    progressBarChunkTr.insertAfter(this.fileProgressWrapper);

};

FileProgress.prototype.setProgress = function(percentage, speed, chunk_size) {
    this.fileProgressWrapper.attr('class', "progressContainer green");

    var file = this.file;
    var uploaded = file.loaded;

    var size = plupload.formatSize(uploaded).toUpperCase();
    var formatSpeed = plupload.formatSize(speed).toUpperCase();
    var progressbar = this.fileProgressWrapper.find('.progress').find('.progress-bar-info');
    if (this.fileProgressWrapper.find('.status').text() === '取消上传'){
        return;
    }
    this.fileProgressWrapper.find('.status').text("已上传: " + size + " 上传速度： " + formatSpeed + "/s");
    percentage = parseInt(percentage, 10);
//    if (file.status !== plupload.DONE && percentage === 100) {
//        percentage = 99;
//    }

    progressbar.text(percentage + "%");
    progressbar.attr('aria-valuenow', percentage).css('width', percentage + '%');

    if (chunk_size) {
        var chunk_amount = Math.ceil(file.size / chunk_size);
        if (chunk_amount === 1) {
            return false;
        }
        var current_uploading_chunk = Math.ceil(uploaded / chunk_size);
        var pre_chunk, text;

        for (var index = 0; index < current_uploading_chunk; index++) {
            pre_chunk = $('#' + file.id + "_" + index);
            pre_chunk.width('100%').removeClass().addClass('alert-success').attr('aria-valuenow', 100);
            text = "块" + index + "上传进度100%";
            pre_chunk.next().html(text);
        }

        var currentProgessBar = $('#' + file.id + "_" + current_uploading_chunk);
        var current_chunk_percent;
        if (current_uploading_chunk < chunk_amount) {
            if (uploaded % chunk_size) {
                current_chunk_percent = ((uploaded % chunk_size) / chunk_size * 100).toFixed(2);
            } else {
                current_chunk_percent = 100;
                currentProgessBar.removeClass().addClass('alert-success');
            }
        } else {
            var last_chunk_size = file.size - chunk_size * (chunk_amount - 1);
            var left_file_size = file.size - uploaded;
            if (left_file_size % last_chunk_size) {
                current_chunk_percent = ((uploaded % chunk_size) / last_chunk_size * 100).toFixed(2);
            } else {
                current_chunk_percent = 100;
                currentProgessBar.removeClass().addClass('alert-success');
            }
        }
        currentProgessBar.width(current_chunk_percent + '%');
        currentProgessBar.attr('aria-valuenow', current_chunk_percent);
        text = "块" + current_uploading_chunk + "上传进度" + current_chunk_percent + '%';
        currentProgessBar.next().html(text);
    }

    this.appear();
};

FileProgress.prototype.setComplete = function(up, info) {
    var td = this.fileProgressWrapper.find('td:eq(2)'),
        tdProgress = td.find('.progress');

    var res = $.parseJSON(info);
    var url;
    if (res.url) {
        url = res.url;
        str = "<div><strong>Link:</strong><a href=" + res.url + " target='_blank' > " + res.url + "</a></div>" +
            "<div class=hash><strong>Hash:</strong>" + res.hash + "</div>";
    } else {
        var domain = up.getOption('domain');
        url = domain + encodeURI(res.key);
        var link = domain + res.key;
        str = "<div><strong>Link:</strong><a href=" + url + " target='_blank' > " + link + "</a></div>" +
            "<div class=hash><strong>Hash:</strong>" + res.hash + "</div>";
    }

    tdProgress.html(str).removeClass().next().next('.status').hide();
    td.find('.progressCancel').hide();

    var progressNameTd = this.fileProgressWrapper.find('.progressName');
    this.fileProgressWrapper.find('.progress-striped').removeClass('progress-striped').removeClass('active');
    this.fileProgressWrapper.find('.progress-bar').text('完成');
    this.fileProgressWrapper.find('.progressCancel').hide();
};

FileProgress.prototype.setError = function() {
    this.fileProgressWrapper.find('td:eq(2)').attr('class', 'text-warning');
    this.fileProgressWrapper.find('td:eq(2) .progress').css('width', 0).hide();
    this.fileProgressWrapper.find('button').hide();
    this.fileProgressWrapper.next('.chunk-status-tr').hide();
};

FileProgress.prototype.setCancelled = function(manual) {
    var progressContainer = 'progressContainer';
    if (!manual) {
        progressContainer += ' red';
    }

    var fileProgressWrapper = this.fileProgressWrapper;

    fileProgressWrapper.attr('class', progressContainer);
//    fileProgressWrapper.find('.progress').remove();
//    fileProgressWrapper.find('.btn-default').hide();
    fileProgressWrapper.find('.progressCancel').hide();

    setTimeout(function() {
        fileProgressWrapper.removeClass('green');
        fileProgressWrapper.find('.progress').removeClass('active').removeClass('progress-striped');
        fileProgressWrapper.find('.progress .progress-bar').text('已取消').css('width', '100%').css('background-color', '#ccc').removeClass('active').removeClass('progress-striped').css('border-right', '#ccc');
    }, 100)
};

FileProgress.prototype.setStatus = function(status, isUploading) {
    if (!isUploading) {
        this.fileProgressWrapper.find('.status').text(status).attr('class', 'status text-left');
    }
};

// 绑定取消上传事件
FileProgress.prototype.bindUploadCancel = function(up) {
    var self = this;
    if (up) {
        self.fileProgressWrapper.find('.progressCancel').on('click', function(){
            self.setCancelled(false);
            self.setStatus("取消上传");
            self.fileProgressWrapper.find('.status').css('left', '0');
            up.removeFile(self.file);
        });
    }
};

FileProgress.prototype.appear = function() {
    if (this.getTimer() !== null) {
        clearTimeout(this.getTimer());
        this.setTimer(null);
    }

    if (this.fileProgressWrapper[0].filters) {
        try {
            this.fileProgressWrapper[0].filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
        } catch (e) {
            // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
            this.fileProgressWrapper.css('filter', "progid:DXImageTransform.Microsoft.Alpha(opacity=100)");
        }
    } else {
        this.fileProgressWrapper.css('opacity', 1);
    }

    this.fileProgressWrapper.css('height', '');

    this.height = this.fileProgressWrapper.offset().top;
    this.opacity = 100;
    this.fileProgressWrapper.show();

};

angular
    .module('bugs')
    .directive('fileFinder', function() {
        return {
            scope: '&',
            restrict: 'AE',
            link: function(scope, element, attrs) {
                $("#columns").hColumns({
                    nodeSource: function(node_id, callback) {
                        $.ajax({
                            type: "POST",
                            data: {"folderKey": node_id, "pKey": scope.pKey},
                            url: "/api/file/listFolderByFfKey",
                            dataType: 'json',
                            beforeSend: function(xhr) {

                            },
                            success: function(result, textStatus, jqXHR) {
                                return callback(null, result.data.dirList);
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                return callback("AJAX error");
                            }
                        });
                    },
                    selectedCallback: function(folderKey) {
                        scope.selectedCallback(folderKey);
                    },
                    noContentString: "没有更多文件夹",
                    labelText_maxLength: 15,
                    customNodeTypeIndicator: {},
                    customNodeTypeHandler: {}
                });

            }
        }
    });

angular
    .module('bugs')
    .directive('pgyEnterKeyPressed', function() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.pgyEnterKeyPressed);
                    });

                    event.preventDefault();
                }
            });
        };
    });

angular
    .module('bugs')
    .directive('pageNav', function($state) {
    return {
        restrict: 'EA',
        templateUrl: 'views/common/page_nav_new.html',
        replace: true,
        link: function(scope, element, attrs) {
            scope.conf.itemsPerPage = attrs.size;
            scope.conf.rememberPerPage = attrs.size;
            scope.pageType  = attrs.type;

            // 变更当前页
            scope.changeCurrentPage = function(item) {
                if(item == '...'){
                    return;
                }else{
                    if (!item) {
                       if(scope.pageType == 1) {
                          item = scope.conf.currentPage;
                       } else {
                          item = 1;
                       }
                    }

                    if(scope.pageType != 1) {
                        scope.conf.currentPage = item;
                    }
                }

                if(scope.pageType == 1) {
                     $state.go('project.issue', {pKey: scope.pKey, page: item});
                } else {
                     scope[attrs.method](scope.conf.currentPage, scope.conf.itemsPerPage, function (data) {
                     });
                }
            };

            // 定义分页的长度必须为奇数 (default:9)
            scope.conf.pagesLength = parseInt(scope.conf.pagesLength) ? parseInt(scope.conf.pagesLength) : 9 ;
            scope.conf.pagesLength = 7;

            if(scope.conf.pagesLength % 2 === 0){
                // 如果不是奇数的时候处理一下
                scope.conf.pagesLength = scope.conf.pagesLength -1;
            }

            // conf.erPageOptions
            if(!scope.conf.perPageOptions){
                scope.conf.perPageOptions = [10, 15, 20, 30, 50];
            }

            // pageList数组
            function getPagination(newValue, oldValue) {

                // conf.currentPage
                scope.conf.currentPage = parseInt(scope.conf.currentPage) ? parseInt(scope.conf.currentPage) : 1;

                // conf.totalItems
                scope.conf.totalItems = parseInt(scope.conf.totalItems) ? parseInt(scope.conf.totalItems) : 0;

                // conf.itemsPerPage (default:15)
                scope.conf.itemsPerPage = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 20;

                // numberOfPages
                scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems/scope.conf.itemsPerPage);

                // judge currentPage > scope.numberOfPages
                if(scope.conf.currentPage < 1){
                    scope.conf.currentPage = 1;
                }

                // 如果分页总数>0，并且当前页大于分页总数
                if(scope.conf.numberOfPages > 0 && scope.conf.currentPage > scope.conf.numberOfPages){
                    scope.conf.currentPage = scope.conf.numberOfPages;
                }

                // jumpPageNum
                scope.jumpPageNum = scope.conf.currentPage;

                // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                var perPageOptionsLength = scope.conf.perPageOptions.length;
                // 定义状态
                var perPageOptionsStatus;
                for(var i = 0; i < perPageOptionsLength; i++){
                    if(scope.conf.perPageOptions[i] == scope.conf.itemsPerPage){
                        perPageOptionsStatus = true;
                    }
                }
                // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                if(!perPageOptionsStatus){
                    scope.conf.perPageOptions.push(scope.conf.itemsPerPage);
                }

                // 对选项进行sort
                scope.conf.perPageOptions.sort(function(a, b){return a-b});

                scope.pageList = [];
                if(scope.conf.numberOfPages <= scope.conf.pagesLength){
                    // 判断总页数如果小于等于分页的长度，若小于则直接显示
                    for(i =1; i <= scope.conf.numberOfPages; i++){
                        scope.pageList.push(i);
                    }
                }else{
                    // 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
                    // 计算中心偏移量
                    var offset = (scope.conf.pagesLength - 1)/2;
                    if(scope.conf.currentPage <= offset){
                        // 左边没有...
                        for(i =1; i <= offset +1; i++){
                            scope.pageList.push(i);
                        }
                        scope.pageList.push('...');
                        scope.pageList.push(scope.conf.numberOfPages);
                    }else if(scope.conf.currentPage > scope.conf.numberOfPages - offset){
                        scope.pageList.push(1);
                        scope.pageList.push('...');
                        for(i = offset + 1; i >= 1; i--){
                            scope.pageList.push(scope.conf.numberOfPages - i);
                        }
                        scope.pageList.push(scope.conf.numberOfPages);
                    }else{
                        // 最后一种情况，两边都有...
                        scope.pageList.push(1);
                        scope.pageList.push('...');

                        for(i = Math.ceil(offset/2) ; i >= 1; i--){
                            scope.pageList.push(scope.conf.currentPage - i);
                        }
                        scope.pageList.push(scope.conf.currentPage);
                        for(i = 1; i <= offset/2; i++){
                            scope.pageList.push(scope.conf.currentPage + i);
                        }

                        scope.pageList.push('...');
                        scope.pageList.push(scope.conf.numberOfPages);
                    }
                }

                if(scope.conf.onChange){
                    // 防止初始化两次请求问题
                    if(!(oldValue != newValue && oldValue[0] == 0)) {
                        scope.conf.onChange();
                    }
                }

                scope.$parent.conf = scope.conf;
            }

            // firstPage
            scope.firstPage = function(){
                scope.conf.currentPage = 1;
                scope.changeCurrentPage(scope.conf.currentPage);
            };

            // prevPage
            scope.prevPage = function(){
                if(scope.conf.currentPage > 1){
                    scope.conf.currentPage -= 1;
                    scope.changeCurrentPage(scope.conf.currentPage);
                }
            };
            // nextPage
            scope.nextPage = function(){
                if(scope.conf.currentPage < scope.conf.numberOfPages){
                    scope.conf.currentPage = Number(scope.conf.currentPage) + 1;
                    scope.changeCurrentPage(scope.conf.currentPage);
                }
            };

            // 跳转页
            scope.jumpToPage = function(){
                scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g,'');
                if(scope.jumpPageNum !== ''){
                    scope.conf.currentPage = scope.jumpPageNum;
                    scope.changeCurrentPage(scope.conf.currentPage);
                }
            };

            // lastPage
            scope.lastPage = function(){
                scope.conf.currentPage = scope.conf.numberOfPages;
                scope.changeCurrentPage(scope.conf.currentPage);
            };

            // scope.$watch(function() {
            //
            //     if(!scope.conf.totalItems) {
            //         scope.conf.totalItems = 0;
            //     }
            //
            //     if (scope.pageType == 1) {
            //         scope.conf.currentPage = scope.statePage;
            //     }
            //
            //     var newValue = scope.conf.totalItems + ' ' +  scope.conf.currentPage + ' ' + scope.conf.itemsPerPage;
            //     newValue = 'conf.totalItems + conf.currentPage + conf.itemsPerPage';
            //     return newValue;
            // }, getPagination);

            scope.$watch('conf', getPagination, true);

            scope.changeCurrentPage();
        }
    };
});

angular
    .module('bugs')
    .directive('tooltip', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                $(element).hover(function(){
                    $(element).tooltip('show');
                }, function(){
                    $(element).tooltip('hide');
                });
            }
        };
    });

angular.module('bugs').directive('focusMe', function($timeout, $parse) {
  return {
    //scope: true,   // optionally create a child scope
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      element.bind('blur', function() {
//         scope.$apply(model.assign(scope, false));
      });
    }
  };
});

angular
    .module('bugs')
    .directive('markdownEditor', function($parse, $http) {
        return {
            scope: true,
            restrict: 'AE',
            link: function(scope, element, attrs) {
                var textarea = $(element),
                    toolbar = $('<div class="editor" id="wmd-button-bar" />').insertBefore(textarea.parent()),
                    preview = $('<div id="wmd-preview" class="wmd-hidetab markdown-content" />').insertAfter('.editor');

                var options = {}, isMarkdown = 1;

                options.strings = {
                    bold: '加粗 <strong> Ctrl+B',
                    boldexample: '加粗文字',

                    italic: '斜体 <em> Ctrl+I',
                    italicexample: '斜体文字',

                    link: '链接 <a> Ctrl+L',
                    linkdescription: '请输入链接描述',

                    quote:  '引用 <blockquote> Ctrl+Q',
                    quoteexample: '引用文字',

                    code: '代码 <pre><code> Ctrl+K',
                    codeexample: '请输入代码',

                    image: '图片 <img> Ctrl+G',
                    imagedescription: '请输入图片描述',

                    olist: '数字列表 <ol> Ctrl+O',
                    ulist: '普通列表 <ul> Ctrl+U',
                    litem: '列表项目',

                    heading: '标题 <h1>/<h2> Ctrl+H',
                    headingexample: '标题文字',

                    hr: '分割线 <hr> Ctrl+R',
                    more: '摘要分割线 <!--more--> Ctrl+M',

                    undo: '撤销 - Ctrl+Z',
                    redo: '重做 - Ctrl+Y',
                    redomac: '重做 - Ctrl+Shift+Z',

                    fullscreen: '全屏 - Ctrl+J',
                    exitFullscreen: '退出全屏 - Ctrl+E',
                    fullscreenUnsupport: '此浏览器不支持全屏操作',

                    /*
                    imagedialog: '<p><b>插入图片</b></p><p>请在下方的输入框内输入要插入的远程图片地址或<a href="javascript:void(0)" onclick="showUpload">本地图片</a></p>',
                    */
                    imagedialog: '<p style="padding:5px 0 10px 0;"><b>插入图片</b></p><p><a href="javascript:void(0)" onclick="$(\'#btnUpload\').hide();$(\'#okButton\').show();$(\'#inputText\').show();">远程图片</a> 或 <a href="javascript:void(0)" onclick="$(\'#btnUpload\').show();$(\'#okButton\').hide();$(\'#inputText\').hide();">本地图片</a></p>',
                    linkdialog: '<p style="padding:10px 0;"><b>插入链接</b></p><p>请在下方的输入框内输入要插入的链接地址</p>',

                    ok: '确定',
                    cancel: '取消',
                    upload: '选择图片上传',

                    help: 'Markdown语法帮助'
                };
                options.helpButton = {
                    'handler': function() {
                    }
                };

                var converter = new Markdown.Converter(),
                    editor = new Markdown.Editor(converter, '', options),
                    cache = {};

                Markdown.Extra.init(converter, {
                    'extensions' : ["tables", "fenced_code_gfm", "def_list", "attr_list", "footnotes", "strikethrough", "newlines"]
                });

                converter.hooks.chain("preConversion", function(text) {
                    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        scope.$apply(function() {
                            var model = $parse(attrs.ngModel);
                            model.assign(scope, text);
                        });
                    }
                    return text;
                });

                // 自动跟随
                converter.hooks.chain('postConversion', function (html) {

                    // clear special html tags
                    html = html.replace(/<\/?(\!doctype|html|head|body|link|title|input|select|button|textarea|style|noscript)[^>]*>/ig, function (all) {
                        return all.replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/'/g, '&#039;')
                            .replace(/"/g, '&quot;');
                    });

                    // clear hard breaks
                    html = html.replace(/\s*((?:<br>\n)+)\s*(<\/?(?:p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|address|form|fieldset|iframe|hr|legend|article|section|nav|aside|hgroup|header|footer|figcaption|li|dd|dt)[^\w])/gm, '$2');

                    // 替换img
                    html = html.replace(/<(img)\s+([^>]*)\s*src="([^"]+)"([^>]*)>/ig, function (all, tag, prefix, src, suffix) {
                        if (!cache[src]) {
                            cache[src] = false;
                        } else {
                            return '<span class="cache" data-width="' + cache[src][0] + '" data-height="' + cache[src][1] + '" '
                                + 'style="background:url(' + src + ') no-repeat left top; width:'
                                + cache[src][0] + 'px; height:' + cache[src][1] + 'px; display: inline-block; max-width: 100%;'
                                + '-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain;background-size: contain;" />';
                        }

                        return all;
                    });

                    // 替换block
                    html = html.replace(/<(iframe|embed)\s+([^>]*)>/ig, function (all, tag, src) {
                        if (src[src.length - 1] == '/') {
                            src = src.substring(0, src.length - 1);
                        }

                        return '<div style="background: #ddd; height: 40px; overflow: hidden; line-height: 40px; text-align: center; font-size: 12px; color: #777">'
                            + tag + ' : ' + $.trim(src) + '</div>';
                    });

                    return html;
                });

                var to;
                editor.hooks.chain('onPreviewRefresh', function () {
                });

                var th = textarea.height(), ph = preview.height();

                editor.hooks.chain('enterFakeFullScreen', function () {
                    th = textarea.height();
                    ph = preview.height();
                    $(document.body).addClass('fullscreen');
                    var h = $(window).height() - toolbar.outerHeight();

                    textarea.css('height', h);
                    preview.css('height', h);
                });

                editor.hooks.chain('enterFullScreen', function () {
                    $(document.body).addClass('fullscreen');

                    var h = window.screen.height - toolbar.outerHeight();
                    textarea.css('height', h);
                    preview.css('height', h);
                });

                editor.hooks.chain('exitFullScreen', function () {
                    $(document.body).removeClass('fullscreen');
                    textarea.height(th);
                    preview.height(ph);
                });

                function initMarkdown() {
                    editor.run(textarea[0]);
                    editor.input = document.getElementById('texts');

                    // 编辑预览切换
//                    var edittab = $('.editor').prepend('<div class="wmd-edittab"><a href="#wmd-editarea" class="active">撰写</a><a href="#wmd-preview">预览</a></div>'),
//                        editarea = $(textarea.parent()).attr("id", "wmd-editarea");

                    $(".wmd-edittab a").click(function() {
                        $(".wmd-edittab a").removeClass('active');
                        $(this).addClass("active");
                        $("#wmd-editarea, #wmd-preview").addClass("wmd-hidetab");

                        var selected_tab = $(this).attr("href"),
                            selected_el = $(selected_tab).removeClass("wmd-hidetab");

                        // 预览时隐藏编辑器按钮
                        if (selected_tab == "#wmd-preview") {
                            $("#wmd-button-row").addClass("wmd-visualhide");
                        } else {
                            $("#wmd-button-row").removeClass("wmd-visualhide");
                        }

                        // 预览和编辑窗口高度一致
                        $("#wmd-preview").outerHeight($("#wmd-editarea").innerHeight());

                        return false;
                    });
                }

                initMarkdown();

                // set edior frame
                var $editorFrame = $('<div>');
                $editorFrame.insertAfter(textarea[0]);
                $editorFrame.append(textarea[0]);
                // set new style for frame and textarea
                textarea[0].style.border = 'none';
                textarea[0].style.resize = 'none';
                $editorFrame.css('border', 'solid 1px #e4e5e7');

                // set preview container
                var $previewContainer = $('<div>');
                $previewContainer.addClass('markdown-content');
                $previewContainer.css({'min-height':'192px', 'padding': '0px 15px'});
                $previewContainer.hide();
                $editorFrame.append($previewContainer);

                // set loading container
                var $loadingContainer = $('<div>');
                $loadingContainer.css({'margin':'86px 0px'});
                $loadingContainer.html('<div class="sk-fading-circle"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>');
                $loadingContainer.hide();
                $editorFrame.append($loadingContainer);

                // set status bar
                var $statusBar = $('<div>');
                $statusBar.css({'border':'none', 'border-top':'1px dashed #e4e5e7', 'line-height': '20px', 'min-height': '30px', 'padding': '5px', 'color':'#999999'});
                $editorFrame.append($statusBar);

                // set preview and writting tab
                toolbar.prepend('<div class="wmd-edittab"><span role="writting" class="optiontab active">编写</span><span role="preview" class="optiontab">预览</span></div>');

                var writtingButton = toolbar.find('span[role="writting"]');
                var previewButton = toolbar.find('span[role="preview"]');

                writtingButton.on('click', function() {
                    previewButton.removeClass('active');
                    writtingButton.removeClass('active');
                    writtingButton.addClass('active');

                    textarea.show();
                    $previewContainer.hide();
                    $loadingContainer.hide();
                    $statusBar.text('已经切换到代码视图');
                });

                previewButton.on('click', function() {
                    previewButton.removeClass('active');
                    writtingButton.removeClass('active');
                    previewButton.addClass('active');

                    textarea.hide();
                    $previewContainer.hide();
                    $loadingContainer.show();
                    $statusBar.text('正在生成预览...');

                    $http({
                        method: 'post',
                        url: '/api/issues/getPreviewHtml',
                        data: $.param({
                            markdownString: textarea.val(),
                        }),
                        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).then(function(data) {
                        if(data.data.code == 0) {
                            $previewContainer.html(data.data.data.html);
                            textarea.hide();
                            $previewContainer.show();
                            $loadingContainer.hide();
                            $statusBar.text('已经切换到预览视图');
                        } else {
                            writtingButton.click();
                            $statusBar.text('无法产生预览');
                        }
                    }, function(err) {
                        writtingButton.click();
                        $statusBar.text('无法产生预览');
                    })

                });

                //set placeholder by browser type. // surpport paste image to editor
                if(navigator.userAgent.match(/chrome|safari/i)) {
                    //element[0].setAttribute('placeholder', '支持 Markdown 语法，支持粘贴图片。');
                    $statusBar.text('支持 Markdown 语法, 支持粘贴图片上传, 拖拽图片上传。');
                } else if (navigator.userAgent.match(/firefox/i)) {
                    //element[0].setAttribute('placeholder', '支持 Markdown 语法。');
                    $statusBar.text('支持 Markdown 语法, 支持快捷键粘贴粘贴图片上传。');
                } else {
                    //element[0].setAttribute('placeholder', '支持 Markdown 语法。');
                    $statusBar.text('支持 Markdown 语法。');
                }

                //set clipboardReader working space. usually it is a <textarea/>
                clipboardReader.setWorkDom( element[0]);
                //set anular model change when paste image or text.
                clipboardReader.onUpdate = function (text) {
                    scope.$apply(function() {
                        var model = $parse(attrs.ngModel);
                        model.assign(scope, text);
                    });
                };
            }
        };
    });

angular
    .module('bugs')
    .directive('codeRevisionViewer', codeRevisionViewer);

function codeRevisionViewer( $rootScope, $timeout) {
    return {
        restrict: 'AE',
        scope: {
            commitdata: "=",
        },
        replace: false,
        templateUrl: 'views/issue/codeRevisionViewer.html',
        link: function ( $scope, $element, $attrs) {

            //console.log( $scope.commitdata)

        }
    }

};

angular
    .module('bugs')
    .directive('userNotifier', userNotifier)
    .directive('bindHtmlCompile', bindHtmlCompile);

function userNotifier($rootScope, $timeout, $stateParams, dashboardService, constants, helper) {
    return {
        restrict: 'A',
        scope: {
            userNotifier: "@",
        },
        replace: false,
        transclude:true,
        templateUrl: 'views/project/user_notifier.html',
        link: function (scope, element, attrs) {

            scope.popup = false;
            scope.constants = constants;

            var timeoutHandler = null;


            scope.show = function () {
                clearTimeout(timeoutHandler);
                if( !scope.popup) {
                    return null;
                }
                var offsetTop = element.offset().top;
                var offsetLeft = element.offset().left;
                var scrollTop = $(document).scrollTop();
                var w = element.width();
                var h = element.height();
                var $node = element.find('div[role="notifier"]');
                if(offsetTop - scrollTop > 190) {
                    $node.addClass('top');
                    $node.removeClass('bottom');
                    $node.css({
                        display: 'block',
                        position: 'fixed',
                        top: offsetTop - scrollTop - 170 - element.height() - 5 + 'px',
                        left: offsetLeft + (element.width() / 2) - 97 + 'px',
                        "z-index": 99999999
                    });
                } else {
                    $node.addClass('bottom');
                    $node.removeClass('top');
                    $node.css({
                        display: 'block',
                        position: 'fixed',
                        top: offsetTop - scrollTop + element.height() + 5 + 'px',
                        left: offsetLeft + (element.width() / 2) - 97 + 'px',
                        "z-index": 99999999
                    });
                }
            }

            scope.hide = function () {
                timeoutHandler = setTimeout(function () {
                    var $node = element.find('div[role="notifier"]');
                    $node.css({
                        display: 'none',
                    });
                }, 200);
            }

            scope.chatWith = function (uKey, $event) {
                $event.stopPropagation();
                scope.hide();
                $rootScope.chatWith(uKey);
            }

            pKey = $stateParams.pKey;
            username = scope.userNotifier;

            // load user info from project config
            var configReader = helper.configReader();
            if($rootScope.projectConfig && $rootScope.projectConfig.users) {
                var userArray = configReader.filter($rootScope.projectConfig.users, 'label', username);
                if(userArray[0]) {
                    scope.popup = true;
                    scope.showUserInfo = userArray[0];
                    scope.currentUser = $rootScope.projectConfig.current.key;
                }
            } else {
                dashboardService.getUserInfoByUsername(pKey, username).then(function(data) {
                    if(data.u_avator) {
                        scope.popup = true;
                        scope.showUserInfo = {};
                        scope.showUserInfo.key = data.u_key;
                        scope.showUserInfo.label = data.u_name;
                        scope.showUserInfo.avatar = data.u_avator;
                        scope.showUserInfo.email = data.u_email;
                        scope.showUserInfo.role = {};
                        scope.showUserInfo.role.label = data.pu_roler;
                        scope.currentUser = data.login;
                    } else {
                        scope.popup = false;
                    }
                }, function(err) {
                    // net work error, doing nothing
                });
            }
        }
    }
};


function bindHtmlCompile($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return scope.$eval(attrs.bindHtmlCompile);
            }, function (value) {
            // Incase value is a TrustedValueHolderType, sometimes it
            // needs to be explicitly called into a string in order to
            // get the HTML string.
            element.html(value && value.toString());
            // If scope is provided use it, otherwise use parent scope
            var compileScope = scope;
            if (attrs.bindHtmlScope) {
                compileScope = scope.$eval(attrs.bindHtmlScope);
            }
            $compile(element.contents())(compileScope);
            });
        }
    };
};

angular.module('bugs')
.directive('issueContextMenu', issueContextMenu);

function issueContextMenu($rootScope, $timeout, $stateParams, $rootScope, issueService, projectService, constants, helper) {
    return {
        restrict: 'A',
        scope: {
            contextMenuItemData: "=",
            contextMenuHandler: "&",
            multiChoice: "@",
        },
        replace: false,
        link: function (scope, element, attrs) {

            var targetItemData = scope.contextMenuItemData;
            var activeUserInfo = $rootScope.userInfo;
            var multiSelectMode = 0; // 0 off, 1 control + click, 2 shift + click
            var selectStatus = 0; // 0 off, 1 on

            var projectConfig = $rootScope.projectConfig;
            var UAC = {
                 issueUpdateMember: false,
                 issueUpdateOption: false,
                 issueClose: false,
                 issueMoveOut: false,
            };

            if(targetItemData.i_key && targetItemData.p_key) {
                var targetIKey = targetItemData.i_key;
                var targetPKey = targetItemData.p_key;
            } else {
                console.error('Issue context menu error, context-menu-item-data is missing or invalid.');
                return false;
            }

            var groupFn = helper.groupFn();
            var permision = helper.permision();
            var configReader = helper.configReader();

            var contextMenuIDPrefix = 'issue-context-menu-';
            var contextMenuID = contextMenuIDPrefix + targetIKey;
            var contextMenuOptionRoleID = contextMenuIDPrefix + 'option';
            var contextMenuSubOptionRoleID = contextMenuIDPrefix + 'option_sub';
            var contextMenuSubOptionContainerRoleID = contextMenuIDPrefix + 'option_subcon';

            var menuOption = [];
            menuOption.push({key:'i_status', field:'status', label:'状态', icon:'eye', option:[]});
            menuOption.push({key:'pt_key', field:'type', label:'类型', icon:'bookmark', option:[]});
            menuOption.push({key:'bugTracker::divider'});
            menuOption.push({key:'i_priority', field:'priority', label:'优先级', icon:'circle', option:[]});
            menuOption.push({key:'i_assignee', field:'assignee', label:'指派给', icon:'hand-o-right', option:[]});
            menuOption.push({key:'p_key', field:'project', label:'移动到', icon:'share', option:[]});
            menuOption.push({key:'bugTracker::divider'});
            menuOption.push({key:'pm_key', field:'module', label:'模块', icon:'cube', option:[]});
            menuOption.push({key:'v_key', field:'version', label:'版本', icon:'code-fork', option:[]});

            var destroyMenu = function (keepChecked) {
                // remove dom
                $('[key^="'+ contextMenuIDPrefix +'"]').remove();

                // clear data
                menuOption = [];
                menuOption.push({key:'i_status', field:'status', label:'状态', icon:'eye', option:[]});
                menuOption.push({key:'pt_key', field:'type', label:'类型', icon:'bookmark', option:[]});
                menuOption.push({key:'bugTracker::divider'});
                menuOption.push({key:'i_priority', field:'priority', label:'优先级', icon:'circle', option:[]});
                menuOption.push({key:'i_assignee', field:'assignee', label:'指派给', icon:'hand-o-right', option:[]});
                menuOption.push({key:'p_key', field:'project', label:'移动到', icon:'share', option:[]});
                menuOption.push({key:'bugTracker::divider'});
                menuOption.push({key:'pm_key', field:'module', label:'模块', icon:'cube', option:[]});
                menuOption.push({key:'v_key', field:'version', label:'版本', icon:'code-fork', option:[]});

                dataStatus = 0;
                if(!keepChecked) {
                    $('.rightMenuBg').removeClass('rightMenuBg');
                    $('[first-tag="true"]').removeAttr('first-tag');
                }
                // remove event listener for menu options
                $('*').off('scroll', destroyMenu);
                $(document)
                    .off('click', hideMenu)
                    .off('contextmenu', '#issueContextMenu', hideMenu)
                    .off('mouseover', 'li[role^="' + contextMenuOptionRoleID + '"]', activeOption)
                    .off('mouseover', 'li[role="' + contextMenuOptionRoleID + '"]', renderSubMenu)
                    .off('click', 'li[role="' + contextMenuOptionRoleID + '"]', stopPropagation)
                    .off('click', 'li[role="' + contextMenuSubOptionRoleID + '"]', updateIssueSetting);
            };

            var hideMenu = function (e) {
                if (e) { e.preventDefault();};
                setTimeout(destroyMenu, 10);
            }

            var activeOption = function (e) {
                var roleID = $(this).attr('role');
                $('li[role="' + roleID + '"]').removeClass('active');
                $(this).addClass('active');
            }

            var showMenu = function (e) {
                // get active data
                targetItemData = scope.contextMenuItemData;
                activeUserInfo = $rootScope.userInfo;

                if(targetItemData.i_key && targetItemData.p_key) {
                    targetIKey = targetItemData.i_key;
                    targetPKey = targetItemData.p_key;
                } else {
                    console.error('Issue context menu error, context-menu-item-data is missing or invalid.');
                    return false;
                }
                // get document height
                var height = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );
                // add context menu container
                e.preventDefault();
                var $menuContainer = $('<div>');
                $menuContainer.addClass('dropdown clearfix');
                $menuContainer.attr('key', contextMenuID);
                $menuContainer.attr('id', 'issueContextMenu');
                $menuContainer.css({
                    width: '100%',
                    height: height + 'px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 9999
                });

                var $menuUl = $('<ul>');
                $menuUl.attr('id', contextMenuID);
                $menuUl.addClass('dropdown-menu');
                $menuUl.css({
                    position: 'absolute',
                    display: 'block',
                    margin: '0px',
                    left: e.pageX + 'px',
                    top: e.pageY + 'px',
                    "z-index": 10000
                });

                // loading animation
                $menuUl.html('<div class="sk-fading-circle sm" style="margin:52.5px auto;"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>');

                $menuContainer.append($menuUl);

                // checke if new item or selected item
                if(selectStatus && $(this).hasClass('rightMenuBg')) {
                    destroyMenu(true);
                } else {
                    // distrory all context menu
                    selectStatus = 0;
                    destroyMenu(false);
                }

                $(document.body).append($menuContainer);
                $(this).addClass('rightMenuBg');

                // get project setting by pkey
                var dataStatus = 0;
                var tmpIndex = null;

                // get project list
                var projectListOption = {};
                projectService.getProjectList().then(function(data) {

                    dataStatus += 1;

                    // project list
                    menuOption[5].option = [];
                    menuOption[5].option = groupFn.groupedMenuGenerator(configReader.filter(data.data, 'recycled', 0), groupFn.projectGroupFn);

                    if (dataStatus >= 7) {
                        renderMenu();
                    }
                }, function(err) {
                    hideMenu();
                });

                // get project config info
                projectService.getProjectConfig(targetPKey).then(function(data) {

                    projectConfig = angular.copy(data.data);

                    dataStatus += 6;

                    // status
                    menuOption[0].option = projectConfig.status;

                    // type
                    menuOption[1].option = projectConfig.type;

                    // priority
                    menuOption[3].option = projectConfig.priority;

                    // users
                    menuOption[4].option = groupFn.groupedMenuGenerator(configReader.filter(projectConfig.users, 'deleteFlag', 0), groupFn.roleGroupFn);
                    menuOption[4].option.unshift({key: 'bugTracker::divider', label: ''});
                    menuOption[4].option.unshift({key: activeUserInfo.u_key, label: '我', icon: 'user-circle-o', class:''});
                    menuOption[4].option.unshift({key: '', label: '未指派', icon: 'ban', class:''});

                    // module
                    menuOption[7].option = projectConfig.module;

                    // versions
                    menuOption[8].option = projectConfig.version;

                    // calculate UAC
                    UAC.issueUpdateMember = permision.checkPermision(constants.UAC.issueUpdateMember, projectConfig.current.role.privilege);
                    UAC.issueUpdateOption = permision.checkPermision(constants.UAC.issueUpdateOption, projectConfig.current.role.privilege);
                    UAC.issueClose = permision.checkPermision(constants.UAC.issueClose, projectConfig.current.role.privilege);
                    UAC.issueMoveOut = permision.checkPermision(constants.UAC.issueMoveOut, projectConfig.current.role.privilege);

                    if(!UAC.issueClose) {
                        for(var index in menuOption[0].option) {
                            if(menuOption[0].option[index].closeFlag == 1) {
                                menuOption[0].option.splice(index, 1);
                            }
                        }
                    }

                    if (dataStatus >= 7) {
                        renderMenu();
                    }

                }, function(err) {
                    hideMenu();
                });

                // add event listener for menu options
                $('*').on('scroll', destroyMenu);
                $(document)
                    .on('click', hideMenu)
                    .on('contextmenu', '#issueContextMenu', hideMenu)
                    .on('mouseover', 'li[role^="' + contextMenuOptionRoleID + '"]', activeOption)
                    .on('mouseover', 'li[role="' + contextMenuOptionRoleID + '"]', renderSubMenu)
                    .on('click', 'li[role="' + contextMenuOptionRoleID + '"]', stopPropagation)
                    .on('click', 'li[role="' + contextMenuSubOptionRoleID + '"]', updateIssueSetting);
            };

            var stopPropagation = function (e) {
                e.stopPropagation();
                $(this).find('a').blur();
            };

            var renderMenu = function() {

                // if no privilege get hide menu
                if(!UAC.issueUpdateMember && !UAC.issueUpdateOption) {
                    return destroyMenu();
                }

                var $menuUl = $('#' + contextMenuID);
                $menuUl.html('');
                for (var index in menuOption) {

                    var $tmpList = $('<li>');

                    // stop render menu options banded by privilige setting
                    if(!UAC.issueUpdateOption) {
                        if(index != 4) {
                            continue;
                        }
                    }

                    if(!UAC.issueUpdateMember) {
                        if(index == 4) {
                            continue;
                        }
                    }

                    if(!UAC.issueMoveOut) {
                        if(index == 5) {
                            continue;
                        }
                    }

                    if(menuOption[index].key == 'bugTracker::divider') {
                        $tmpList.addClass('divider');
                        $tmpList.html('');
                    } else {

                        // ignore if no suboption
                        if(menuOption[index].option.length < 1) {
                            continue;
                        }

                        $tmpList.attr('key', menuOption[index].key);
                        $tmpList.attr('field', menuOption[index].field);
                        //$tmpList.text(menuOption[index].label);
                        //$tmpList.html('<i class="fa fa-' + menuOption[index].icon + '"></i> ' + menuOption[index].label);
                        $tmpList.addClass('dropdown-submenu');
                        //$tmpList.html('<a tabindex="0">' + menuOption[index].label + '<i class="fa fa-caret-right pull-right" style="margin-top:3px;"></i></a>');
                        $tmpList.html('<a tabindex="0"><i class="fa fa-caret-right pull-right"></i>' + '<i class="fa fa-' + menuOption[index].icon + ' pull-left">&nbsp;</i>&nbsp;&nbsp;' + menuOption[index].label + '</a>');
                        $tmpList.attr('index', index);
                        $tmpList.attr('role', contextMenuOptionRoleID);
                    }

                    $menuUl.append($tmpList);
                }

                if($menuUl.children().last().hasClass('divider')) {
                    $menuUl.children().last().remove();
                }

                var refBox = {
                    top : $menuUl.offset().top - $(document.body).offset().top,
                    left : $menuUl.offset().left - $(document.body).offset().left,
                    width : 0,
                    height : 0,
                }
                positionAdjust($menuUl, refBox);
            }

            var renderSubMenu = function (e) {
                var index = $(this).attr('index');
                var type = $(this).attr('key');
                var field = $(this).attr('field');
                var subOption = menuOption[index].option;

                $('ul[role="' + contextMenuSubOptionContainerRoleID + '"]').remove();

                $subMenuContainer = $('<ul>');
                $subMenuContainer.addClass('dropdown-menu');
                $subMenuContainer.css({
                    position: 'absolute',
                    display: 'block',
                    margin: '0px',
                    left: e.pageX + 'px',
                    top: e.pageY + 'px',
                    "z-index": 10000
                });
                $subMenuContainer.attr('role', contextMenuSubOptionContainerRoleID);
                
                if(index == 4) {
                    // user (user list for assign)
                    var $searchItem = $('<li class="search-item" ><input type="text" placeholder="搜索"/><i class="fa fa-search"></i></li>');
                    $searchItem.on('click', stopPropagation);
                    $searchItem.on('input', resetSubMenu);
                    $subMenuContainer.append($searchItem);
                }

                setupSubMenu($subMenuContainer, subOption);

                $('div[key="' + contextMenuID + '"]').append($subMenuContainer);
                var refBox = {
                    top : $(this).offset().top - $(document.body).offset().top,
                    left : $(this).offset().left - $(document.body).offset().left,
                    width : $(this).width(),
                    height : $(this).height(),
                }
                positionAdjust($subMenuContainer, refBox);

                function resetSubMenu(e) {
                    var searchValue = $(e.target).val();
                    var filteredOption = configReader.search(subOption, searchValue, ['label'], true);
                    $subMenuContainer.find('>*[class!="search-item"]').remove();
                    setupSubMenu($subMenuContainer, filteredOption);
                }

                function stopPropagation(e) {
                    e.stopPropagation();
                }

                function setupSubMenu($container, options) {
                    for (var subindex in options) {
                        var $tmpList = $('<li>');
                        if(options[subindex].key == 'bugTracker::divider') {
                            $tmpList.addClass('divider');
                            $tmpList.html('');
                        } else if(options[subindex].key == 'bugTracker::group-label') {
                            $tmpList.addClass('group-label');
                            $tmpList.html('<span>' + options[subindex].label + '</span>');
                        } else {
                            $tmpList.attr('key', options[subindex].key);
                            $tmpList.attr('type', type);
                            $tmpList.attr('field', field);
                            $tmpList.attr('status', 'unchecked');
                            $tmpList.addClass('dropdown-submenu');
                            if(targetItemData[type] == options[subindex].key) {
                                $tmpList.attr('status', 'checked');
                                $tmpList.html('<a tabindex="0"><i class="fa fa-check pull-right"></i>' + '<i class="fa fa-' + options[subindex].icon + ' ' + options[subindex].class + ' pull-left">&nbsp;</i>&nbsp;&nbsp;' + options[subindex].label + '</a>');
                            } else {
                                $tmpList.html('<a tabindex="0">' + '<i class="fa fa-' + options[subindex].icon + ' ' + options[subindex].class + ' pull-left">&nbsp;</i>&nbsp;&nbsp;' + options[subindex].label + '</a>');
                            }
                            $tmpList.attr('index', subindex);
                            $tmpList.attr('role', contextMenuSubOptionRoleID);
                        }
                        $container.append($tmpList);
                    }

                    if($container.children().last().hasClass('divider')) {
                        $container.children().last().remove();
                    }
                }

            }

            // fix postion of absolute dom to display in screen
            // $dom is the target dom that you want to adjust its position, must be a jQuery Object
            // refBox {top:Number, left:Number, width:Number,height:Number }, describe a box which you want $dom to align to.
            function positionAdjust ($dom, refBox) {
                // get screen position
                var screenHeight = document.body.clientHeight;
                var screenWidth = document.body.clientWidth;
                var scrollTop = $(document).scrollTop();
                var scrollLeft = $(document).scrollLeft();

                // get $dom position
                var domHeight = $dom.outerHeight(true);
                var domWidth = $dom.outerWidth(true);

                // start to feat
                var matchFlagUp = false;
                var matchFlagLeft = false;

                // feat up
                if ((refBox.top + domHeight + 10) > (screenHeight + scrollTop)) {
                    matchFlagUp = true;
                }

                // feat left
                if ((refBox.left + refBox.width + domHeight + 10) > (screenWidth + scrollLeft)) {
                    matchFlagLeft = true;
                }

                // set final position
                var finalTop = refBox.top;
                var finalLeft = refBox.left + refBox.width;
                if (matchFlagUp) {
                    finalTop = refBox.top + refBox.height - domHeight;
                }
                if (matchFlagLeft) {
                    finalLeft = refBox.left - domWidth;
                }

                // ul.top < 10
                if(finalTop < scrollTop + 10) {
                    finalTop = scrollTop + 10;
                }

                // ul out of screen, scroll content.
                if(domHeight + 20 > screenHeight) {
                    finalHeight = screenHeight - 20;
                    $dom.css({
                        "overflow-y": 'scroll',
                        "overflow-x": 'hidden',
                        height: finalHeight + 'px',
                    });
                }

                $dom.css({
                    left: finalLeft+ 'px',
                    top: finalTop + 'px',
                });
            }

            function updateIssueSetting (e) {

                if ($(this).attr('status') == 'checked') {
                    return true;
                }

                var field = $(this).attr('field');
                var type = $(this).attr('type');
                var value = $(this).attr('key');

                if(scope.multiChoice) {
                    // get iKeyArray
                    var iNoArray = [];
                     $('.rightMenuBg').each(function (index, dom) {
                         var $dom = $(dom);
                         if($dom.attr('context-menu-multi-choice-id')) {
                             iNoArray.push($dom.attr('context-menu-multi-choice-id'));
                         }
                     });
                    // build event
                    var issueContextMenuEvent = {
                        success : false,
                        ikey : targetItemData.i_key,
                        type : type,
                        value : value,
                        multiple : true,
                        issueNumbers : iNoArray
                    }

                    // set issue update
                    issueService.update(targetItemData.p_key, targetItemData.i_no, field, value, iNoArray).then(function(data) {
                            if (data.code == constants.globalFalse) {
                                // success
                                issueContextMenuEvent.success = true;
                                scope.contextMenuHandler({e: issueContextMenuEvent});
                            } else {
                                // fail
                                scope.contextMenuHandler({e: issueContextMenuEvent});
                            }
                    }, function(err) {
                        // fail
                        scope.contextMenuHandler({e: issueContextMenuEvent});
                    });

                } else {
                    // build event
                    issueContextMenuEvent = {
                        success : false,
                        ikey : targetItemData.i_key,
                        type : type,
                        value : value,
                        multiple : false,
                        issueNumbers : [targetItemData.i_no]
                    }
                    // set issue update
                    issueService.update(targetItemData.p_key, targetItemData.i_no, field, value).then(function(data) {
                            if (data.code == constants.globalFalse) {
                                // success
                                issueContextMenuEvent.success = true;
                                scope.contextMenuHandler({e: issueContextMenuEvent});
                            } else {
                                // fail
                                scope.contextMenuHandler({e: issueContextMenuEvent});
                            }
                    }, function(err) {
                        // fail
                        scope.contextMenuHandler({e: issueContextMenuEvent});
                    });
                }
            }

            function multiCheck(e) {
                //e.stopPropagation();
                selectStatus = 1;
                if(multiSelectMode) {
                    if (multiSelectMode == 1) {
                        // control or command
                        if($(this).hasClass('rightMenuBg')) {
                            $(this).removeClass('rightMenuBg');
                        } else {
                            $(this).addClass('rightMenuBg');
                        }
                    }
                    if (multiSelectMode == 2) {
                        // shift
                        e.preventDefault();
                        $('.rightMenuBg').removeClass('rightMenuBg');
                        var itemTagName = $(this).get(0).tagName;
                        var $itemContainer = $(this).parent();
                        var startIndex = $(this).index();
                        var endIndex = $('[first-tag="true"]').index();
                        endIndex = endIndex < 0 ? 0 : endIndex;
                        $itemContainer.find(itemTagName).each(function(index, dom) {
                            if(index <= Math.max(startIndex, endIndex) && index >= Math.min(startIndex, endIndex)) {
                                $(dom).addClass('rightMenuBg');
                            }
                        });

                        window.getSelection && window.getSelection().removeAllRanges();
                        !window.getSelection && document.selection.empty();

                    }
                } else {
                    $('.rightMenuBg').removeClass('rightMenuBg');
                    $(this).addClass('rightMenuBg');
                    $('[first-tag="true"]').removeAttr('first-tag');
                    $(this).attr('first-tag', 'true');
                }
            }

            function parseMode(e) {
                if (e.shiftKey) {
                // shift
                    multiSelectMode = 2;
                } else if (e.ctrlKey || e.metaKey) {
                // control or command
                    multiSelectMode = 1;
                }
                if (e.type == 'keyup') {
                    multiSelectMode = 0;
                }
            }

            // add right click listener
            element.on('contextmenu', showMenu);
            // add click listener if multiChoice option is on
            if (scope.multiChoice) {
                element.on('click', multiCheck);
                element.attr('context-menu-multi-choice-id', targetItemData.i_no);
                document.addEventListener('keydown', parseMode);
                document.addEventListener('keyup', parseMode);
            }
        }
    }
}

angular
    .module('bugs')
    .directive('issueSearchBar', issueSearchBar);

function issueSearchBar($rootScope, $state, $stateParams, constants, toastr) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        template: '<div class="input-group issue-search-bar"><div class="input-group-addon indicator">此项目</div><input class="form-control" type="text" placeholder="..."/><label class="input-group-addon"><span class="glyphicon glyphicon-search"></span></label></div>',
        link: function (scope, element, attrs) {
            var pKey = $stateParams.pKey;
            var $indicator = element.find('.indicator');
            var $input = element.find('input');
            var $searchBtn = element.find('label');
            var globalMode = true;

            if(pKey) {
                globalMode = false;
            }

            $input.on('focus', searchBarfocusHandler);
            $input.on('blur', searchBarfocusHandler);
            $input.on('keydown', searchBarInputHandler);
            $searchBtn.on('click', makeSearch);

            resetSearchBar();
            $input.val($stateParams.keywords);

            function makeSearch(e) {
                var keywords = $input.val();
                if(keywords.length < 2) {
                    toastr.warning('关键词长度过短');
                    return false;
                }
                if(globalMode) {
                    $state.go('search', {pKey: '', keywords :keywords});
                } else {
                    $state.go('search', {pKey: $stateParams.pKey, keywords : keywords});
                }
            }

            function searchBarInputHandler(e) {
                if(e.keyCode == 8) {
                    // backspace
                    if($input.val() == '' && globalMode == false) {
                        globalMode = true;
                        resetSearchBar();
                    }
                }
                if(e.keyCode == 13) {
                    makeSearch(false);
                }
            }

            function searchBarfocusHandler(e) {
                if(e.type == 'focus') {
                    // focus
                    element.addClass('active');
                } else {
                    // focusout
                    if(pKey && $input.val() == '') {
                        globalMode = false;
                        resetSearchBar();
                    }
                    element.removeClass('active');
                }
            }

            function resetSearchBar() {
                if(globalMode) {
                    $indicator.css('display', 'none');
                    $input.attr('placeholder', '搜索所有项目');
                } else {
                    $indicator.css('display', 'table-cell');
                    $input.attr('placeholder', '搜索');
                }
            }
        }
    }

};

/*!
 * angular-vertilize 1.0.1
 * 将多个div的高度保持一致
 *
 * Christopher Collins
 * https://github.com/Sixthdim/angular-vertilize.git
 * License: MIT
 */

(function () {
  "use strict";

  var module = angular.module('bugs');

  // Vertilize Container
  module.directive('vertilizeContainer', [
    function(){
      return {
        restrict: 'EA',
        controller: [
          '$scope', '$window',
          function($scope, $window) {
            // check jquery
            if($) {} else { console.error('Directive vertilize-container requires JQuery Library');}

            // Alias this
            var _this = this;

            // Array of children heights
            _this.childrenHeights = [];

            // API: Allocate child, return index for tracking.
            _this.allocateMe = function(){
                _this.childrenHeights.push(0);
                return (_this.childrenHeights.length - 1);
            };

            // API: Update a child's height
            _this.updateMyHeight = function(index, height){
              _this.childrenHeights[index] = height;
            };

            // API: Get tallest height
            _this.getTallestHeight = function(){
              keepActiveElementHeight();
              var height = 0;
              for (var i=0; i < _this.childrenHeights.length; i=i+1){
                height = Math.max(height, _this.childrenHeights[i]);
              }
              return height;
            };

            // keep active layout height
            function keepActiveElementHeight() {
                var childElements = $('[vertilize-container]').find('[vertilize-index]');
                var activeIndexArray = [];
                for(var index = 0; index < childElements.length; index++) {
                    activeIndexArray.push($(childElements[index]).attr('vertilize-index'));
                }

                for(index = 0; index < _this.childrenHeights.length; index++ ) {
                    var clearFlag = true;
                    for(var i in activeIndexArray) {
                        if(index == activeIndexArray[i]) {
                            clearFlag = false;
                            break;
                        }
                    }

                    if(clearFlag) {
                        _this.childrenHeights[index] = 0;
                    }
                }
            }

            // Add window resize to digest cycle
            angular.element($window).bind('resize', function(){
              return $scope.$apply();
            });

            // Add document click event to digest cycle
            angular.element(document).on('click', function(){
              return setTimeout(function(){$scope.$apply();}, 10);
            });
         }
        ]
      };
    }
  ]);

  // Vertilize Item
  module.directive('vertilize', [
    function(){
      return {
        restrict: 'EA',
        require: '^vertilizeContainer',
        link: function(scope, element, attrs, parent){
          // My index allocation
          var myIndex = parent.allocateMe(element);
          element.attr('vertilize-index', myIndex);

          // Get my real height by cloning so my height is not affected.
          var getMyRealHeight = function(){
            var clone = element.clone()
              .removeAttr('vertilize')
              .removeAttr('vertilize-index')
              .css({
                height: '',
                width: element.outerWidth(),
                position: 'fixed',
                top: 0,
                left: 0,
                visibility: 'hidden'
              });
            $(clone).find('input[type="radio"]').removeAttr('name');
            element.after(clone);
            var realHeight = clone.height();
            clone['remove']();
            return realHeight;
          };

          // Watch my height
          scope.$watch(getMyRealHeight, function(myNewHeight){
            if (myNewHeight){
              parent.updateMyHeight(myIndex, myNewHeight);
            }
          });

          // Watch for tallest height change
          scope.$watch(parent.getTallestHeight, function(tallestHeight){
            if (tallestHeight){
              var offset = attrs.vertilizeOffset;
              if (offset == undefined) {
                offset = 0;
              } else {
                offset = parseInt(offset);
              }

              var resultHeight = tallestHeight;
              if (offset != 0) {
                resultHeight = tallestHeight + offset;
              }
              element.css('height', resultHeight);
            }
          });
        }
      };
    }
  ]);

}());

angular
    .module('bugs')
    .directive('emojiPicker', emojiPicker)

function emojiPicker($rootScope, $timeout, $stateParams, dashboardService, constants, helper) {
    return {
        restrict: 'A',
        scope: {
            inputModel: "=",
        },
        replace: false,
        transclude: true,
        templateUrl: 'views/issue/emoji_picker.html',
        link: function (scope, element, attrs) {

            scope.popup = false;
            scope.constants = constants;

            var timeoutHandler = null;


            scope.show = function (e) {
                if(!scope.popup) {
                    e.stopPropagation();
                }
                clearTimeout(timeoutHandler);
                var offsetTop = element.offset().top;
                var offsetLeft = element.offset().left;
                var scrollTop = $(document).scrollTop();
                var w = element.width();
                var h = element.height();
                var $node = element.find('div[role="picker"]');
                if(offsetTop - scrollTop > 112) {
                    $node.addClass('top');
                    $node.removeClass('bottom');
                    $node.css({
                        display: 'block',
                        position: 'fixed',
                        top: offsetTop - scrollTop - 112 - element.height() + 20 + 'px',
                        left: offsetLeft + (element.width() / 2) - 120 + 'px',
                        "z-index": 99999999
                    });
                } else {
                    $node.addClass('bottom');
                    $node.removeClass('top');
                    $node.css({
                        display: 'block',
                        position: 'fixed',
                        top: offsetTop - scrollTop + element.height() + 30 + 'px',
                        left: offsetLeft + (element.width() / 2) - 120 + 'px',
                        "z-index": 99999999
                    });
                }
                $(document).on('click', scope.hide);
                scope.popup = true;
            }

            scope.hide = function () {
                var $node = element.find('div[role="picker"]');
                $node.css({
                    display: 'none',
                });
                $(document).off('click', scope.hide);
                scope.popup = false;
            }

            scope.check = function(e) {
                var pickedEmoji = e.target.innerText;
                if(!scope.inputModel) {
                    scope.inputModel = '';
                }
                scope.inputModel = scope.inputModel + pickedEmoji;
            }
        }
    }
};

angular
    .module('bugs')
    .directive('trendEditor', trendEditor)

function trendEditor($rootScope, $timeout, $stateParams, dashboardService, issueService, fileService, constants, helper, toastr) {
    return {
        restrict: 'AE',
        scope: {
            onSubmit: "&",
            trendModel: "=",
            editorPending: "=",
            onFileUploaded: "&",
            onFileSaved: "=",
            resetEditor: "=",
            mentioItems: "=",
            mentioSearch: "&",
            mentioSelect: "&",
            mentioTypedTerm: "=",
            mentioReferenceId: "=",
        },
        replace: true,
        transclude: false,
        templateUrl: 'views/issue/trendEditor.html',
        link: function (scope, element, attrs) {
            var storageKey = "local-submit-mode-key";
            var pKey = $stateParams.pKey;

            var stringFormater = helper.stringFormater();
            var utilities = helper.utilities();
            var uploader = new utilities.qiniuUploader();

            var upTokenTimer = null;
            var uploadToken = null;

            function getToken() {
                fileService.getUptoken().then(function(data) {
                    uploadToken = data.uptoken;
                }, function(err) {});

                if(upTokenTimer) {
                    $timeout.cancel(upTokenTimer);
                }
                upTokenTimer = $timeout(getToken, 60000);
            }

            uploader.onProgress = uploaderEventHandler;
            uploader.onUpload = uploaderEventHandler;
            uploader.onSuccess = uploaderEventHandler;
            uploader.onAbort = uploaderEventHandler;
            uploader.onError = uploaderEventHandler;

            scope.submitModeText = "Enter";
            scope.uploadKey = "";
            scope.showDropDownFlag = false;

            scope.editorStatus = {
                expand: false,
            };
            // for mentio
            scope.mentioSearchx = function (term) {
                return scope.mentioSearch({term: term});
            }
            scope.mentioSelectx = function (item) {
                return scope.mentioSelect({item: item});
            }

            scope.styleParser = helper.styleParser();

            scope.resetEditor = function () {
                abortAllFile();
                scope.editorStatus.expand = false;
                scope.fileList = [];
                scope.trendModel = '';
                scope.editorPending = false;
                scope.showDropDownFlag = false;
                $(element.find('.input-area textarea')).height(30);
                scope.resetUploadPhone();
            }

            // for add at
            scope.addAt = function() {
                element.find('textarea').focus();
                $timeout(function(){
                    scope.trendModel += " @";
                    element.find('textarea').change();
                }, 10);
            }

            // submit
            scope.showDropDown = function ($event, obj) {
                if (!scope.showDropDownFlag) {
                    $event.stopPropagation();
                }

                var dom = $($event.currentTarget);
                var select = angular.element('.' + obj);
                var topAdd = select.height() + 19;
                var leftAdd = select.width();
                var scrollTop = $(document).scrollTop();

                var top = dom.offset().top - scrollTop - topAdd;
                var left = dom.offset().left - leftAdd;

                if (left < 10) {
                    left = 10;
                }

                select.css({
                    top: top,
                    left: left,
                    display: 'block'
                });

                $(document).on('click', {obj: obj}, scope.hideDropDown);
                scope.showDropDownFlag= true;
            }

            scope.hideDropDown = function (e) {
                var obj = e.data.obj;
                var dom = angular.element('.' + obj);

                dom.css({
                    display: 'none',
                });

                $(document).off('click', scope.hideDropDown);
                scope.showDropDownFlag = false;
            }

            scope.submitTrend = function () {
                scope.editorPending = true;
                var naKeyList = [];
                for(var index = 0; index < scope.fileList.length; index ++) {
                    if(scope.fileList[index].uploaded) {
                        naKeyList.push(scope.fileList[index].uploaded);
                    }
                }
                scope.onSubmit({trend: scope.trendModel, naKeyList: naKeyList});
            }

            angular.element(".trend-model").keydown(function(e) {
                if (scope.submitMode == 1) {
                    scope.enterSubmit(e);
                } else if (scope.submitMode == 2) {
                    scope.ctrlEnterSubmit(e);
                }
            });

            scope.enterSubmit = function (e) {
                if(e.keyCode == 13 && e.ctrlKey){
                    // ctrl + enter 作为换行
                    scope.trendModel += "\n";
                }else if(e.keyCode == 13){
                    // enter 提交
                    e.preventDefault();
                    if ($('mentio-menu').css('display') === 'none') {
                        scope.submitTrend();
                    }
                }
            }

            scope.ctrlEnterSubmit = function (e) {
                // ctrl + enter 提交
                if(e.keyCode == 13 && e.ctrlKey || e.keyCode == 13 && e.metaKey){
                    scope.submitTrend();
                }
            }

            scope.setSubmitMode = function (index) {
                window.localStorage.setItem(storageKey, index);
                scope.getSubmitMode();
            }

            scope.getSubmitMode = function () {
                var mode = window.localStorage.getItem(storageKey);
                if (!mode) {
                    mode = 1;
                }

                scope.submitMode = mode;

                if (mode == 1) {
                    scope.submitModeText = "Enter"
                } else {
                    scope.submitModeText = "Ctrl+Enter"
                }
            }

            scope.getSubmitMode();

            // functions for uploading file

            // 文件库上传
            scope.fileHubUpload = function (fKeyList) {
                issueService.uploadNoteFileFromFileHub(pKey, $stateParams.viewIssueNumber, fKeyList).then(
                    function (data) {
                        if(data.code != constants.returnSuccess) {
                            toastr.warning(data.message);
                        }

                        var data = data.data;
                        for (var index in data) {
                            var file = {
                                id: stringFormater.getTimeBasedID(),
                                fileKey: data[index].na_file_key,
                                name: data[index].na_file_name,
                                mime: data[index].na_file_type,
                                progress: 0,
                                uploaded: data[index].na_key,
                                status: "success",
                            };

                            scope.fileList.push(file);
                        }
                        setEditorExpand();
                    },
                    function (error) {
                        toastr.error('网络错误，请稍后再试');
                    }
                );
            }

            scope.selectFiles = function () {
                element.find('>input').click();
            }

            function initUplaoder() {
                $(element.find('>input')).on('change', fileSelectHandler);
                $(element.find('.input-area textarea')).on('paste', getPasteAction);
                $(element.find('.input-area')).on('paste', getPasteAction);
                $(element.find('.input-area textarea')).on('keyup', getClipboardData);
                //$(element.find('.input-area textarea')).on('drop', getDragAction);
                //$(element.find('.input-area')).on('drop', getDragAction);

                $(element).on('dragenter', dragWrapHandle);
                $(element).on('dragleave', dragWrapHandle);
                $(element.find('.drag-wrap')).on('drop', getDragAction);
                $(element.find('.drag-wrap')).on('dragover', setDragOption);

                getToken();
            }

            function dragWrapHandle (e) {
                if (e.type == 'dragenter') {
                    var trendWrap = $(element);
                    var height = trendWrap.height();
                    var width = trendWrap.width();

                    element.find('.drag-wrap')[0].contentEditable = true;
                    element.find('.drag-wrap').css({
                        height: height,
                        width: width,
                        lineHeight: height + 'px',
                        opacity: 0.8,
                    });
                } else if (e.type == 'dragleave') {
                    if($(e.target).hasClass('drag-wrap')) {
                        element.find('.drag-wrap')[0].contentEditable = false;
                        element.find('.drag-wrap').css({
                            height: 0,
                            width: 0,
                            opacity: 0,
                        });
                    }
                }
            }

            var nextUploadToken = null;
            var upTokenTimer = null;
            scope.fileList = [];
            // { fileID, key, mime, dataURL, blob, progress, uploaded}

            var dataURLtoBlob = function(dataURL){
                var arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1];
                var bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while( n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], {type:mime});
            };

            var getFileData = function(id) {
                for(var index in scope.fileList) {
                    if(scope.fileList[index].id == id) {
                        return scope.fileList[index];
                    }
                }
            }

            var getFileDataByKey = function(fileKey) {
                for(var index in scope.fileList) {
                    if(scope.fileList[index].fileKey == fileKey) {
                        return scope.fileList[index];
                    }
                }
            }

            var setProgress = function(id, progress) {
                var fileData = getFileData(id);
                if(progress) {
                    fileData.status = "progress";
                    fileData.progress = progress;
                }
                isLoading();

                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
                return true;
            }

            var setSave = function(id, key) {
                var fileData = getFileData(id);
                fileData.progress = 100;
                scope.onFileUploaded(fileData);
                fileData.status = "success";
                isLoading();

                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
                return true;
            }

            var setError = function(id) {
                var fileData = getFileData(id);
                fileData.progress = 0;
                fileData.status = 'error';

                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
                return true;
            }

            scope.onFileSaved = function (fileKey, naKey) {
                var fileData = getFileDataByKey(fileKey);
                fileData.uploaded = naKey;
                return true;
            }

            scope.removeFile = function(id) {
                scope.editorPending = false;
                uploader.abort(id);

                for(var index in scope.fileList) {
                    if(scope.fileList[index].id == id) {
                        if (scope.fileList[index].status == 'success') {
                            issueService.deleteNoteFile(pKey, $stateParams.viewIssueNumber, scope.fileList[index].uploaded).then(
                                function (data) {
                                    if(data.code == constants.returnSuccess) {
                                    } else {
                                        toastr.warning(data.message);
                                    }
                                },
                                function (error) {
                                    toastr.error('网络错误，请稍后再试');
                                }
                            );
                        }

                        scope.fileList.splice(index, 1);
                        setEditorExpand();
                        return true;
                    }
                }
            }

            // 手机传图
            scope.loadFileList = function (uploadKey) {
                scope.uploadKey = uploadKey;
                issueService.getUploadTrendFileList(pKey, $stateParams.viewIssueNumber, uploadKey).then(
                    function (data) {
                        if(data.code == constants.returnSuccess) {
                            setFileList(data.data, uploadKey);
                        }
                    },
                    function (error) {
                        toastr.error('网络错误，请稍后再试');
                    }
                );
            }

            function setFileList (fileList, uploadKey) {
                var newList = clearThisUpFileList();

                for (var index in fileList) {
                    var file = {
                        id: stringFormater.getTimeBasedID(),
                        fileKey: fileList[index].na_file_key,
                        name: fileList[index].na_file_name,
                        mime: fileList[index].na_file_type,
                        progress: 0,
                        uploaded: fileList[index].na_key,
                        uploadKey: fileList[index].na_description,
                        status: "success",
                    };

                    if (filterFileList(file.uploaded, newList)) {
                        newList.push(file);
                    }
                }

                if (newList.length != scope.fileList.length) {
                    hideUploadFileSelect();
                }

                scope.fileList = newList;
                setEditorExpand();
            }

            function clearThisUpFileList () {
                var newList = [];

                for (var index in scope.fileList) {
                    if (!scope.fileList[index].uploadKey || scope.fileList[index].uploadKey != scope.uploadKey) {
                       newList.push(scope.fileList[index]);
                    }
                }

                return newList;
            }

            function filterFileList (uploaded, fileList) {
                for (var index in fileList) {
                    if (fileList[index].uploaded == uploaded) {
                        return false;
                    }
                }

                return true;
            }

            function hideUploadFileSelect () {
                var dom = angular.element('.uploadFileSelect');

                dom.css({
                    display: 'none',
                });
                scope.showDropDownFlag = false;
            }

            scope.sortableOptions = {
                handle: '.attachment-item',
                stop: function (e, ui) {
                },
                update: function (e, ui) {
                }
            };

            function uploaderEventHandler(e) {
                var eventType = e.type;
                var affectedData = e.target;
                if(eventType === 'upload') {
                    scope.fileList.push({
                        id: affectedData.id,
                        fileKey: affectedData.fileKey,
                        name: affectedData.name,
                        mime: affectedData.mime,
                        progress: affectedData.progress,
                        uploaded: affectedData.uploaded,
                        status: 'upload',
                    });
                    setEditorExpand();
                } else if (eventType === 'progress') {
                    setProgress(affectedData.id, affectedData.progress);
                } else if (eventType === 'success') {
                    setProgress(affectedData.id, 100);
                    setSave(affectedData.id, affectedData.fileKey);
                } else if (eventType === 'error') {
                    setError(affectedData.id);
                    setEditorExpand();
                } else if (eventType === 'abort') {
                    setEditorExpand();
                }
            }

            function getDragAction(e) {
                e.stopPropagation();
                e.preventDefault();
                var dataTransfer = e.originalEvent.dataTransfer;
                if (dataTransfer.files.length) {
                    readFileFromDataTransfer(dataTransfer);
                }
                dragWrapHandle({target:element.find('.drag-wrap'), type: 'dragleave'});
            }

            function setDragOption(e) {
                e.preventDefault();
                var dataTransfer = e.originalEvent.dataTransfer;
                if(dataTransfer && dataTransfer.dropEffect) {
                    dataTransfer.dropEffect = "copy";
                }
            }

            function getPasteAction (e) {
                e.stopPropagation();
                var clipboardData = e.originalEvent.clipboardData;
                if(clipboardData.files.length) {
                    e.preventDefault();
                    readFileFromDataTransfer(clipboardData);
                } else if (clipboardData.items.length) {
                    readFileFromDataTransferItem(clipboardData, e);
                }
            };

            function getClipboardData(e) {
                setEditorExpand();
                scope.$apply();
            }

            function setEditorExpand() {
                var $dom = $(element.find('.input-area textarea'));
                $dom.height(0);
                var setHeight = $dom[0].scrollHeight - 5;
                $dom.height(setHeight);
                if($dom[0].scrollHeight > 40 && $dom.val().length > 0) {
                    scope.editorStatus.expand = true;
                    setTimeout(function() {$(window).resize()}, 10);
                    setTimeout(function() {$(window).resize()}, 50);
                } else {
                    if (scope.fileList.length > 0) {
                        scope.editorStatus.expand = true;
                        setTimeout(function() {$(window).resize()}, 10);
                        setTimeout(function() {$(window).resize()}, 50);
                    } else {
                        $dom.height(30);
                        scope.editorStatus.expand = false;
                        setTimeout(function() {$(window).resize()}, 10);
                        setTimeout(function() {$(window).resize()}, 50);
                    }
                }

                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
            }

            function fileSelectHandler (e) {
                var dataTransfer = e.target;
                readFileFromDataTransfer(dataTransfer);
                $(element.find('>input')).val('');
            }

            function readFileFromDataTransfer(dataTransfer) {
                var items = dataTransfer.files;
                for(var index = 0; index < items.length; index ++) {
                    uploader.upload(uploadToken, items[index]);
                }
            }

            function readFileFromDataTransferItem(dataTransfer, e) {
                var items = dataTransfer.items;
                for(var index = 0; index < items.length; index ++) {
                    if(items[index].kind.toLowercase == 'file') {
                        e.preventDefault();
                        uploader.upload(uploadToken, items[index].getAsFile());
                    }
                }
            }

            function isLoading () {
                scope.editorPending = true;
                for (var index in scope.fileList) {
                    if (scope.fileList[index].status != 'success') {
                        return false;
                    }
                }
                scope.editorPending = false;
            }

            function abortAllFile () {
                for( var index = 0; index < scope.fileList.length; index ++) {
                    uploader.abort(scope.fileList[index].id);
                }
            }

            initUplaoder();

        }
    }
};

angular
    .module('bugs')
    .directive('fileSelector', fileSelector)

function fileSelector($rootScope, $timeout, $stateParams, dashboardService, issueService, fileService, constants, helper, toastr, $uibModal) {
    return {
        restrict: 'AE',
        scope: {
            onSubmit: "&",
        },
        replace: false,
        transclude: true,
        template: '<ng-transclude ng-click="showFileSelect()" style="width:100%;display:block;"></ng-transclude>',
        link: function (scope, element, attrs) {
            var $uibModalInstance;
            scope.list = {};
            scope.folderKey = "";
            scope.openList = [];
            scope.selectFileList = [];

            scope.showFileSelect = function () {
                $uibModalInstance = $uibModal.open({
                    templateUrl: 'views/file/file_select.html',
                    size: 'lg',
                    backdrop: 'static',
                    scope: scope,
                    keyboard: false,
                });
            }

            scope.init = function () {
                var pKey = $stateParams.pKey;

                fileService.listFilesInFolder(pKey, scope.folderKey).success(function(data) {
                    if (data.code != 0) {
                        scope.list = [];
                        return false;
                    }
                    scope.list = data.data;
                    scope.openList = [];
                    scope.openList.push(scope.list);
                    scope.folderKey = "";
                    scope.selectFileList = [];
                }, function(err) {
                });
            }

            scope.getFileTypeIcon = function (mime, regex) {
                if (mime.match('word')) {
                    return 'fa-file-word-o';
                } else if (mime.match('spreadsheet')) {
                    return 'fa-file-excel-o';
                } else if (mime.match('presentation')) {
                    return 'fa-file-powerpoint-o';
                } else if (mime.match('^image')) {
                    return 'fa-file-image-o';
                } else if (mime.match('^video')) {
                    return 'fa-file-movie-o';
                } else if (mime.match('^audio')) {
                    return 'fa-file-audio-o';
                } else if (mime.match('^text')) {
                    return 'fa-file-code-o';
                } else if (mime.match('application/pdf')) {
                    return 'fa-file-pdf-o';
                } else if (mime.match('application/zip')) {
                    return 'fa-file-archive-o';
                }

                return 'fa-file-o';
            }

            scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            }

            scope.openDir = function (dir, listIndex) {
                getFileList(dir.ff_key);
                clearOpenDirFlag(listIndex);
                dir.openFlag = true;
            }

            scope.selectFile = function (file) {
                file.selectFlag = file.selectFlag ? false : true;
            }

            scope.submitSelect = function () {
                var openList = scope.openList;
                for (var index in openList) {
                    for (var i in openList[index].fileList) {
                        if (openList[index]['fileList'][i].selectFlag) {
                            scope.selectFileList.push(openList[index]['fileList'][i].f_key);
                        }
                    }
                }
                if (scope.selectFileList.length > 0) {
                    scope.onSubmit({fKeyList: scope.selectFileList});
                }

                scope.cancel();
            }

            function isHadFileKey (fKey) {
                for (var index in scope.selectFileList) {
                    if (scope.selectFileList[index] == fKey) {
                        return [index]
                    }
                }
                return false;
            }

            function clearOpenDirFlag (listIndex) {
                var list = scope.openList[listIndex].dirList;
                for (var index in list) {
                    list[index]['openFlag'] = false;
                }
            }

            function getFileList (ffKey) {
                fileService.listFilesInFolder($stateParams.pKey, ffKey).success(function(data) {
                    if (data.code != 0) {
                        return false;
                    }
                    var paths = data.data.paths;
                    scope.openList[paths.length] = data.data;

                    for (var index in scope.openList) {
                        if (index > paths.length) {
                            scope.openList.splice(index, scope.openList.length);
                        }
                    }
                }, function(err) {
                });
            }

        }
    }
}

angular
    .module('bugs')
    .directive('uploadPhone', uploadPhone)

function uploadPhone($rootScope, $timeout, $stateParams, dashboardService, issueService, constants, helper, toastr, $uibModal, $state) {
    return {
        restrict: 'AE',
        scope: {
            onSubmit: "&",
            resetUpload: "=",
            uploadType: "=",
        },
        replace: false,
        transclude: true,
        templateUrl: 'views/file/upload_phone.html',
        link: function (scope, element, attrs) {
            var pKey = $stateParams.pKey;
            scope.uploadKeyUpdateFlag = true;
            scope.uploadKey = "";

            element.bind("$destroy", function () {
                scope.resetUpload();
            });

            scope.imageUpload = {
                popup: false,
                uploadKey: null,
                uploadQR: null,
                timer: null,
                currentIssueNumber: null,
                timerCycle: 36,
            };

            scope.resetUpload = function () {
                removeThisUpload();
                scope.uploadKeyUpdateFlag = true;
                scope.uploadKey = "";
                $timeout.cancel(scope.imageUpload.timer);
            }

            scope.toggleUploadQR = function(action, $event) {

                if(scope.imageUpload.popup == action) {
                    return true;
                }

                scope.imageUpload.popup = action;
                scope.imageUpload.currentIssueNumber = $stateParams.viewIssueNumber;

                if(action) {
                    // load upload key
                    issueService.requestUploadKey(pKey, '', scope.imageUpload.currentIssueNumber).then(
                        function (data) {
                            if(data.code == constants.returnSuccess) {
                                if (scope.uploadKeyUpdateFlag) {
                                    scope.imageUpload.uploadKey = data.data.uploadKey;
                                    scope.uploadKey = data.data.uploadKey;
                                } else {
                                    scope.imageUpload.uploadKey = scope.uploadKey;
                                }

                                // 二维码
                                scope.imageUpload.uploadQR = '/api/issues/getUploadQR/' + scope.uploadKey + '/' + scope.uploadType;
                                // 等待刷新fileList
                                scope.imageUpload.timerCycle = 0;
                                refreshFileList();
                                scope.uploadKeyUpdateFlag = false;
                            } else {
                                toastr.warning(data.message);
                                scope.imageUpload.popup = false;
                            }
                        },
                        function (error) {
                            toastr.error('网络错误，请稍后再试');
                            scope.imageUpload.popup = false;
                        }
                    );
                    // set timer for loading file list
                } else {
                    // erase upload key
                    scope.imageUpload.uploadKey = null;
                    scope.imageUpload.uploadQR = null;
                }
            }

            function refreshFileList () {
                $timeout.cancel(scope.imageUpload.timer);
                if(scope.imageUpload.currentIssueNumber == $stateParams.viewIssueNumber) {
                    scope.onSubmit({uploadKey: scope.uploadKey});
                    if(scope.imageUpload.timerCycle < 36) {
                        scope.imageUpload.timer = $timeout(refreshFileList, 5000);
                        scope.imageUpload.timerCycle ++;
                    }
                }
            }

            function removeThisUpload () {
                if (!scope.uploadKey) {
                    return false;
                }

                issueService.removeImageUpload(scope.uploadKey).then(
                    function (data) {
                    },
                    function (error) {
                        toastr.error('网络错误，请稍后再试');
                    }
                );
            }

        }
    }
}

angular
    .module('bugs')
    .controller('baseCtrl', baseCtrl)
    .controller('projectPermissionCtrl', projectPermissionCtrl)

function baseCtrl($scope, $rootScope, $location, constants, $state, $stateParams, userService, $window, projectService, toastr) {

     // important, state can be watched anywhere
    // require proejct service
    $rootScope.stateParams = $stateParams;

    $scope.online = $rootScope.online;
    $scope.$watch('online', function(newStatus) {

      if(newStatus == false) {
            toastr.error("网络异常");
      }
    });

    $scope.constants = constants;
    $scope.checkPermission = function() {
        userService.checkLogged().then(function(data) {
            var logged = data.code;
            if (logged) {
                // 如果没登陆就跳转到未登陆页面
                $window.location.href = '/user/login';
            }
        }, function(err) {
        });
    };

    $scope.isManager = function(pKey) {
        projectService.checkIsManager(pKey).then(function(data) {
            $scope.userInfo.isManager =  constants.globalFalse;
            if (data.code == constants.globalFalse) {
                $scope.userInfo.isManager = data.data.isManager;
            }
        }, function(err) {
        });
    }

    $scope.checkPermission();
    document.documentElement.style.overflow = 'auto';
    var notice = angular.element('#inbox-view');
    notice.slideUp(300);
}

function projectPermissionCtrl($scope, constants, $state, $stateParams, projectService, $window) {
    $scope.constants = constants;
    var pKey = $stateParams.pKey;
    $scope.checkPermission = function() {
        projectService.checkPermission(pKey).then(function(data) {
            var  permission = data;

            if (permission.code != constants.returnSuccess) {
                // 如果没权限就跳转到限无权限页面
                $state.go('permission', {'pKey' : pKey});
            }

        }, function(err) {
        });
    };

    $scope.checkPermission();
}

/**
 *
 * appCtrl
 *
 */

angular
    .module('bugs')
    .controller('appCtrl', appCtrl);

function appCtrl($http, $scope, $rootScope, $timeout, $uibModal) {
    $scope.createProject = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_project_modal.html',
            controller: createProjectCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.createQuestion = function (parentIssueKey) {
        $scope.newSubIssueParentKey = parentIssueKey ? parentIssueKey : false;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/issue/addIssue.html',
            size: 'lg',
            controller: addIssuesCtrl,
            scope: $scope,
            backdrop: 'static',
            keyboard: false
        });
    };

    // projectConfig Watch List
    var projectConfigCallbackList = [];

    $rootScope.addProjectConfigWatcher = function (callback, id) {
        if(projectConfigCallbackList[id]) {
            projectConfigCallbackList[id]();
        }
        projectConfigCallbackList[id] = $rootScope.$watch('projectConfig', callback, true);
    }

    // export to tracup client
    window.clientAPI.createIssue = $scope.createQuestion;
    window.clientAPI.createProject = $scope.createProject;
}

function createProjectCtrl ($scope, $state, constants, $uibModalInstance, projectService, toastr) {
    $scope.constants = constants;
    $scope.project = {};
    $scope.create = function () {
        $scope.submitting = true;
        projectService.create($.param($scope.project)).then(function(data) {
            $scope.submitting = false;
            $uibModalInstance.close();
            $state.go('project.dashboard', {'pKey' : data});
        }, function(err) {
            toastr.error("网络请求失败");
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

angular
.module('bugs')
.controller('userCtrl', userCtrl)

function userCtrl($scope, $http, $state, $stateParams, $rootScope, constants, sweetAlert, userService, $sce, $interval, cacheService, projectService) {
    $scope.constants = constants;
    $scope.userName = $rootScope.userInfo.u_name;
    $scope.userAvator = $rootScope.userInfo.u_avator;

//    $scope.notifications = {};
    $scope.notificationCount = 0;

//    $scope.listNotification = {};

    userService.getAllNotifications().then(function(data) {
//        $scope.notifications = data.data.list;
          $scope.notificationCount = data.data.count;

          var refreshTimer = cacheService.getCache('::permanent::controller.user.getAllNotifications.interval');
          if( refreshTimer) {
              $interval.cancel( refreshTimer);
              cacheService.setCache('::permanent::controller.user.getAllNotifications.interval', null);
          }
          refreshTimer = $interval( function(){$scope.getNotificationCount();}, 60000);
          cacheService.setCache('::permanent::controller.user.getAllNotifications.interval', refreshTimer);
    }, function(err) {
    });

    // listening click event, force refresh pages if no click in 1 hour
    $(document).on('click', function(){
        var lastOptionTime = cacheService.getCache('::permanent::controller.user.reloadPage.timer');
        var currentOptionTime = new Date().getTime();
       
        if(lastOptionTime && currentOptionTime - lastOptionTime > 3600000) {
            window.location.reload();
        }

        cacheService.setCache('::permanent::controller.user.reloadPage.timer', currentOptionTime);
    });

    $scope.getNotificationCount = function() {
        userService.getAllNotifications().then(function(data) {
//            $scope.notifications = data.data.list;
            window.clientAPI.onNotification(data.data);
            $scope.notificationCount = data.data.count;
            // set system alert
            for(var ncKey in data.data.system) {
                sweetAlert.swal({
                    title: '系统消息',
                    text: data.data.system[ncKey],
                    html: true,
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "好的",
                    cancelButtonText: "稍后再提醒我"
                },

                function(isConfirm) {
                    if (isConfirm) {
                        // set ncKey read
                        userService.setSystemRead(ncKey);
                    } else {
                        // do nothing
                    }
                });
            }
            // refresh project config
            if($stateParams.pKey) {
                if($rootScope.projectConfig.cacheFlag < data.data.cacheFlag) {
                    projectService.refreshProjectConfig();
                }
            }
        }, function(err) {
        });
    }

//    $scope.setRead = function() {
//        userService.setAllRead().then(function(data) {
//            // 将数量设置为0
//            $scope.notificationCount = 0;
//        }, function(err) {
//        });
//    }

    $scope.loadNotification = function() {
//        userService.allNotifications().then(function(data) {
//            $scope.listNotification = data.data.list;
//        }, function(err) {
//        });
    }

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };
}

angular
    .module('bugs')
    .controller('dashboardCtrl', dashboardCtrl);

function dashboardCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, constants, dashboardService, $stateParams, $sce, $element, $controller, $uibModal, issueService, $cookies, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.projectActivityList = {};
    $scope.params = {};
    $scope.params.range = $scope.constants.CHECK_ISSUE_ALL;
    $scope.params.page = 1;
    $scope.show = false;
    $scope.userInfo = $rootScope.userInfo;
    $scope.projectUsers = {};
    $scope.projectVersions = {};
    $scope.projectModules = {};
    $scope.projectTypes = {};
    $scope.projectList = [];
    $scope.type = {};
    $scope.status = {};
    $scope.level = {};
    $scope.select = [];
    $scope.follow = {};
    $scope.issueList = {};
    $scope.issueCount = {};
    $scope.issueCount.countNew = 0;
    $scope.issueCount.countProcessing = 0;
    $scope.issueCount.countProcessed = 0;
    $scope.issueCount.countUnsolved = 0;
    $scope.issueCount.countFeedback = 0;
    $scope.issueCount.countClosed = 0;

    var dashType = $cookies.get('dashType');
    var dashStatus = $cookies.get('dashStatus');
    var dashLevel = $cookies.get('dashLevel');
    var dashUsers = $cookies.get('dashUsersnew');


    $cookies.get('dashSort') ? $scope.params.sort = $cookies.get('dashSort') : '';
    $cookies.get('dashSortName') ? $scope.params.sortName = $cookies.get('dashSortName') : '';


    $scope.type.bug = dashType ?  dashType.indexOf(constants.issuesBug) >= 0 ? true : false : false;
    $scope.type.feature = dashType ? dashType.indexOf(constants.issuesFeature) >= 0 ? true : false : false;
    $scope.type.task = dashType ? dashType.indexOf(constants.issuesTask) >= 0 ? true : false : false;

    $scope.status.new = dashStatus ? dashStatus.indexOf(constants.issuesNew) >= 0 ? true : false : false;
    $scope.status.processing = dashStatus ? dashStatus.indexOf(constants.issuesProcessing) >= 0 ? true : false : false;
    $scope.status.processed = dashStatus ? dashStatus.indexOf(constants.issuesProcessed) >= 0 ? true : false : false;
    $scope.status.unsolved = dashStatus ? dashStatus.indexOf(constants.issuesUnsolved) >= 0 ? true : false : false;
    $scope.status.feedback = dashStatus ? dashStatus.indexOf(constants.issuesFeedback) >= 0 ? true : false : false;
    $scope.status.closed = dashStatus ? dashStatus.indexOf(constants.issuesClosed) >= 0 ? true : false : false;

    $scope.level.high =  dashLevel ?  dashLevel.indexOf(constants.issuesHigh) >= 0 ? true : false : false;
    $scope.level.middle = dashLevel ? dashLevel.indexOf(constants.issuesMiddle) >= 0 ? true : false : false;
    $scope.level.low = dashLevel ? dashLevel.indexOf(constants.issuesLow) >= 0 ? true : false : false;

    $scope.userList =  [];
    if(dashUsers) {
        $scope.dashUserArray = [];
        angular.forEach(angular.fromJson(dashUsers), function(value, key) {
                $scope.dashUserArray.push(value.u_key);
        });
    }

    $scope.params.users = $scope.dashUserArray ? $scope.dashUserArray : [];
    $scope.params.types = dashType ? dashType.split(',') : [];
    $scope.params.prioritys = dashLevel ? dashLevel.split(',') : [];
    $scope.params.status = dashStatus ? dashStatus.split(',') : [];

    $(document).bind('click',function(e){
         $("table.table-striped tr").removeClass("rightMenuBg");
    });

    if($stateParams.type == 'all') { $scope.params.range = $scope.constants.CHECK_ISSUE_ALL; }
    if($stateParams.type == 'create') { $scope.params.range = $scope.constants.CHECK_ISSUE_FROM_ME; }
    if($stateParams.type == 'follow') { $scope.params.range = $scope.constants.CHECK_ISSUE_FOLLOW_ME; }
    if($stateParams.type == 'assignee') { $scope.params.range = $scope.constants.CHECK_ISSUE_ASSIGN_ME; }

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };
    $scope.params.perpage = $scope.conf.itemsPerPage;

    $scope.issuesLoaded = false;
    $scope.activitiesLoaded = false;

    $scope.initInfo = function (){
        $scope.getIssueCount();
//        $scope.loadUserList();
//        $scope.getTypeCount();
        $scope.loadProjectList();
    };

    $scope.getTypeCount = function () {
        dashboardService.getTypeCount($.param($scope.params)).then(function(data) {
        $scope.issueCount = data;
    }, function(err) {
        });
    };

    $scope.getIssueCount = function (page) {
        dashboardService.getIssueCount($.param($scope.params)).then(function(data) {
            $scope.conf.totalItems = data.count;
            $scope.conf.currentPage = page ? page : 1;
        }, function(err) {
        });
    };

    $scope.getIssueList = function (page, size, callback) {
        $scope.params.page = page;
        $scope.params.perpage = size;
        $scope.issuesLoaded = false;

        dashboardService.getIssueListAll($.param($scope.params)).then(function(data) {
            $scope.issuesLoaded = true;
            $scope.issueList = data.data.list;
            $scope.projectUsers = data.data.projectUser;
            $scope.projectVersions = data.data.projectVersion;
            $scope.projectModules = data.data.projectModule;
            $scope.projectTypes = data.data.projectType;
        }, function(err) {
        });
    };

    $scope.loadProjectList = function() {
        issueService.getProjectList().then(function(data) {
            $scope.projectList = data;
        }, function(err) {
        });
    };

    $scope.loadProjectActivityList = function() {
        var pKey = $stateParams.pKey;
        var perpage = 5;
        dashboardService.getProjectActivityList($.param($scope.params)).then(function(data) {
            $scope.projectActivityList = data.data.list;
            $scope.activitiesLoaded = true;
        }, function(err) {
        });
    };

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('dashboardCtrl');
            $anchorScroll();
        }
    });

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.loadProjectActivityList();

    $scope.tabIssue = function (val) {

        if(val == $scope.constants.CHECK_ISSUE_ALL) {  value = 'all';  }
        if(val == $scope.constants.CHECK_ISSUE_FROM_ME) {  value = 'create'; }
        if(val == $scope.constants.CHECK_ISSUE_FOLLOW_ME) {  value = 'follow'; }
        if(val == $scope.constants.CHECK_ISSUE_ASSIGN_ME) {  value = 'assignee'; }

        $state.go('dashboard', { type : value});

    }

    $scope.change = function (){
        $scope.show = true;
        $scope.getIssueCount();
        $scope.getIssueList(1, $scope.conf.itemsPerPage);
    };

    $scope.loadUserList = function() {
        $scope.show = true;
        issueService.getUserList($stateParams.pKey).then(function(data) {
            $scope.userList = data.list;
            dashUsers ? $scope.follow.follows = angular.fromJson(dashUsers) : '';
        }, function(err) {
       });
    };

    $scope.getType = function(val, str){
        $scope.show = true;
        $scope.params.types = $scope.dealArr($scope.params.types, val, str);
        $cookies.put('dashType', $scope.params.types);
        $scope.getIssueCount();
        $scope.getIssueList(1, $scope.conf.itemsPerPage);
    };

    $scope.getStatus = function(val, str){
        $scope.show = true;
        $scope.params.status = $scope.dealArr($scope.params.status, val, str);
        $cookies.put('dashStatus', $scope.params.status);
        $scope.getIssueCount();
        $scope.getIssueList(1, $scope.conf.itemsPerPage);
    };

    $scope.getLevel = function(val, str){
        $scope.show = true;
        $scope.params.prioritys = $scope.dealArr($scope.params.prioritys, val, str);
        $cookies.put('dashLevel', $scope.params.prioritys);
        $scope.getIssueCount();
        $scope.getIssueCount();
        $scope.getIssueList(1, $scope.conf.itemsPerPage);
    };

    $scope.getUsers2 = function(){
          $scope.newUserArray = [];
          angular.forEach($scope.follow.follows, function(value, key) {
                  $scope.newUserArray.push(value.u_key);
          });

          $scope.show = true;
          $scope.params.users = $scope.newUserArray;
          $cookies.put('dashUsersnew', angular.toJson($scope.follow.follows));
          $scope.getIssueCount();
          $scope.getIssueList(1, $scope.conf.itemsPerPage);
    };

    $scope.dealArr = function(arr, val, str){
       if(val==false){
            for(i=0; i< arr.length; i++){
                if(arr[i] == str){
                    arr.splice(i,1);
                }
            }
        }else{
         arr.push(str);
        }
       return arr;
    };

    $scope.showhide = function () {
        var icon = $element.find('.dropdown-toggle .caret');
        var body = $element.find('.search');
        body.slideToggle(300);
        //icon.toggleClass('caret').toggleClass('caret');
    };

    $scope.levelClass = function(data){
        if(data == $scope.constants.issuesHigh){
            return $scope.constants.issuesHighCss;
        }else if(data == $scope.constants.issuesMiddle){
            return $scope.constants.issuesMiddleCss;
        }else if(data == $scope.constants.issuesLow){
            return $scope.constants.issuesLowCss;
        }
    };

    $scope.menuOptions = [];
    $scope.rightClick = function (pkey,arr){
          $scope.userArray = [];
          $scope.versionArray = [];
          $scope.moduleArray = [];
          $scope.typeArray = [];
          $scope.projectArray = [];

        angular.forEach($scope.projectUsers[pkey], function(value, key, obj) {
                $scope.userArray.push([value.u_name +','+ value.u_key + ',assignee', function ($itemScope) {
                      $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'assignee', value.u_key);
                    }]);
                });

        angular.forEach($scope.projectVersions[pkey], function(value, key, obj) {
               $scope.versionArray.push([value.v_no +','+ value.v_key + ',version', function ($itemScope) {
                      $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'version', value.v_key);
                    }]);
                });

        angular.forEach($scope.projectTypes[pkey], function(value, key, obj) {
               $scope.typeArray.push([value.pt_name +','+ value.pt_key + ',type', function ($itemScope) {
                      $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'type', value.pt_key);
                    }]);
                });

        angular.forEach($scope.projectModules[pkey], function(value, key, obj) {
                $scope.moduleArray.push([value.pm_name +','+ value.pm_key + ',module', function ($itemScope) {
                      $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'module', value.pm_key);
                    }]);
                });


        angular.forEach($scope.projectList, function(value, key) {
                var p_name = value.p_name;

                $scope.projectArray.push([p_name + ',' + value.p_key + ', project', function ($itemScope) {
                    if($itemScope.issues.p_key !=value.p_key) $scope.editInfo($itemScope.issues.p_key, $itemScope.issues.i_no, 'project', value.p_key, $scope.inoArray);
                    }]);
                });

        $scope.menuOptions = [
            ['状态', [
            ['新建', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'status',$scope.constants.issuesNew);
            }],
            ['处理中', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'status',$scope.constants.issuesProcessing);
            }],
            ['已解决', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'status',$scope.constants.issuesProcessed);
            }],
            ['未解决', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'status',$scope.constants.issuesUnsolved);
            }],
            ['待反馈', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'status',$scope.constants.issuesFeedback);
            }],
            ['关闭', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'status',$scope.constants.issuesClosed);
            }],
            ]],
            $scope.typeArray.length<=0 ? null : ['类型',$scope.typeArray] ,
            ['优先级', [
                ['高', function ($itemScope) {
                    $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'priority',$scope.constants.issuesHigh);
                }],
            ['中', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'priority',$scope.constants.issuesMiddle);
            }],
            ['低', function ($itemScope) {
                $scope.editInfo($itemScope.issues.p_key,$itemScope.issues.i_no,'priority',$scope.constants.issuesLow);
            }]
            ]],

            ['指派给',$scope.userArray],

            $scope.versionArray.length<=0 ? null : ['版本',$scope.versionArray] ,

            $scope.moduleArray.length <=0 ? null : ['模块', $scope.moduleArray] ,

            ['移动到', $scope.projectArray],
        ];
    }

    $scope.isMove = false;
    $scope.editInfo = function(pKey,iNo,field,data) {
        var g = $(document).scrollTop();
        var h = document.body.clientHeight;
        var move = angular.element('#spinner2');
        var h2 = (g+h)/2 - 400 ;
        move.css({
            top: h2+'px'
        });

        $scope.isMove = true;

        var arr = [];
        issueService.update(pKey,iNo,field,data, arr).then(function(data) {
                $scope.getIssueCount($scope.params.page);
                $scope.getIssueList($scope.params.page, $scope.conf.itemsPerPage);
                $scope.loadProjectActivityList();
                $scope.successMsg();
                angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                angular.element(document.getElementById('userCtrl')).scope().loadNotification();
                $scope.isMove = false;
          }, function(err) {
                $scope.isMove = false;
         });
    };

   $scope.sortList = function (val, sort) {
       $scope.params.sort =  sort ? sort == 'asc' ? 'desc' : 'asc' : 'asc';
       $scope.params.sortName = val;
       $cookies.put('dashSort',$scope.params.sort);
       $cookies.put('dashSortName', $scope.params.sortName);
       $scope.getIssueCount();
       $scope.getIssueList(1, $scope.conf.itemsPerPage);
   }

   $scope.successMsg = function(){
        toastr.info("操作成功");
   }

    $scope.statusClass = function(data){
        if(data == $scope.constants.issuesNew){
            return "statusNew";
        }else if(data == $scope.constants.issuesProcessing){
            return "statusProcessing";
        }else if(data == $scope.constants.issuesProcessed){
            return "statusProcessed";
        }else if(data == $scope.constants.issuesUnsolved){
            return "statusUnsolved";
        }else if(data == $scope.constants.issuesFeedback){
            return "statusFeedback";
        }else if(data == $scope.constants.issuesClosed){
            return "statusClosed";
        }
    };

}

///

angular
    .module('bugs')
    .controller('agileCtrl', agileCtrl);

function agileCtrl($scope, $controller, $location, $anchorScroll, $http, $state, $rootScope, constants, $stateParams, $cookies, $uibModal, dashboardService, issueService, userService, projectService, helper, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
//    $scope.userInfo = $rootScope.userInfo;

    // load helper
    $scope.configReader = helper.configReader();
    $scope.stringFormater = helper.stringFormater();

    $scope.getUserInfo = function() {
        if ($rootScope.userInfo.u_key) {
            $scope.userInfo = $rootScope.userInfo;
        } else {
            userService.getUserInfo().then(function(data) {
                if (data.code == constants.returnSuccess) {
                    $scope.userInfo = data.data;
                    if (!$scope.userInfo.u_key) {
                        setTimeout(function () {
                            $scope.getUserInfo();
                        }, 500);
                    }
                }
                else {
                }
            }, function(err) {
            });
        }
    };

    $scope.getUserInfo();

    var tmpList = [];

    $scope.sortingLog = [];

    $scope.sortableOptions = {
//        placeholder: "app-item",
        connectWith: ".apps-container",
        update: function(e, ui) {
        }
    };

    $scope.params = {};
    $scope.params.range = $scope.constants.CHECK_ISSUE_ASSIGN_ME;
    $scope.params.pKey = $stateParams.pKey;

    if($stateParams.type == 'create') { $scope.params.range = $scope.constants.CHECK_ISSUE_FROM_ME; }
    if($stateParams.type == 'follow') { $scope.params.range = $scope.constants.CHECK_ISSUE_FOLLOW_ME; }
    if($stateParams.type == 'assignee') { $scope.params.range = $scope.constants.CHECK_ISSUE_ASSIGN_ME; }

    $scope.isReset = 0;
    $scope.issuesLoaded = false;
    $scope.issueList = {};
    $scope.listAll = function () {
        $scope.issuesLoadPending = true;
        dashboardService.listAll($.param($scope.params)).then(function(data) {
            $scope.issueList = data.data;
            $scope.issuesLoaded = true;
            $scope.issuesLoadPending = false;
            $scope.isReset = 1;

            for(var index in $scope.issueList.config) {
                if(!$scope.issueList.list[$scope.issueList.config[index].key]) {
                    $scope.issueList.list[$scope.issueList.config[index].key] = [];
                }
            }

            setTimeout(function() {
                $scope.isReset = 0;
            }, 1000);

        }, function(err) {

        });
    }

    loadProjectConfig = function () {
        projectService.getProjectConfig($stateParams.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectConfig = data.data;
                $scope.listAll();
            } else {
                toastr.warning("获取项目设置失败 请刷新重试");
            }
        }, function(err) {
            toastr.error("网络故障 请刷新重试");
       });
    }

    $scope.manageShowProjects = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/dashboard/manageShowProjects_modal.html',
            controller: manageShowProjects,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    }

    // watching varible $scpoe.issueList, get the increment item when list changes, that is secret of how to find the status changes!
    $scope.$watch('issueList.list', function(newValue, oldValue) {

        if(!newValue || !oldValue) {
            return false;
        }

        if ($scope.isReset) {
            return false;
        }

        var pKey = false;
        var iNo = false;
        var field = false;
        var data = false;

        var activeMovingItem = getActiveMoveingItem(newValue, oldValue);

        if (activeMovingItem.key) {
            data = activeMovingItem.key.split('.')[0];
            field = 'status';
            iNo = activeMovingItem.item.i_no;
            pKey = activeMovingItem.item.p_key;
        }

        if (pKey && iNo && field) {
            issueService.update(pKey,iNo,field,data).then(function(data) {
                if (data.code == 0) {
                    // modify model when drag success
                    $scope.issueList.list[activeMovingItem.key.split('.')[0]][activeMovingItem.key.split('.')[1]].i_status = activeMovingItem.key.split('.')[0];
                    // get notification
                    angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                } else {
                    toastr.warning(data.message);
                }
            }, function(err) {
                toastr.error("网络出错，已经恢复到最新状态。");
                $scope.listAll();
            });
        }

        // 设置排序
        if (activeMovingItem.key || activeMovingItem.oldKey) {
            pKey = activeMovingItem.item.p_key;
            var orderNo = [];
            var psKey = '';

            if (activeMovingItem.key) {
                psKey = activeMovingItem.key.split('.')[0];
            } else {
                psKey = activeMovingItem.oldKey;
            }

            var list = $scope.issueList.list[psKey];

            for (var i in list) {
                orderNo.push(list[i].i_no);
            }

            if (newValue[psKey].length >= oldValue[psKey].length) {
                dashboardService.updateAgileOrder(pKey, psKey, orderNo, $scope.params.range);
            }
        }

    }, true);

    // this function use to handle context menu changes
    $scope.contextMenuHandler = function (e) {
        if(e.success) {
            // if status changes move to corresponding colum
            if (e.type == 'i_status') {
                // move to colum
                var stopFlag = false;
                for (var issueType in $scope.issueList.list) {
                    for (var issueIndex in $scope.issueList.list[issueType]) {
                        if ($scope.issueList.list[issueType][issueIndex].i_key == e.ikey) {
                            stopFlag = true;
                            var avtiveItem = $scope.issueList.list[issueType].splice(issueIndex, 1);
                            $scope.issueList.list[e.value].unshift(avtiveItem[0]);
                            break;
                        }
                    }
                    if (stopFlag) { break; };
                }
            }

            // if pKey change remove form this project
            if (e.type == 'p_key') {
                var stopFlag = false;
                for (var issueType in $scope.issueList.list) {
                    for (var issueIndex in $scope.issueList.list[issueType]) {
                        if ($scope.issueList.list[issueType][issueIndex].i_key == e.ikey) {
                            stopFlag = true;
                            $scope.issueList.list[issueType].splice(issueIndex, 1);
                            break;
                        }
                    }
                    if (stopFlag) { break; };
                }
            }

            // if assignee change remove form assignee me
            if (e.type == 'i_assignee' && $stateParams.type == 'assignee') {
                var stopFlag = false;
                for (var issueType in $scope.issueList.list) {
                    for (var issueIndex in $scope.issueList.list[issueType]) {
                        if ($scope.issueList.list[issueType][issueIndex].i_key == e.ikey) {
                            stopFlag = true;
                            $scope.issueList.list[issueType].splice(issueIndex, 1);
                            break;
                        }
                    }
                    if (stopFlag) { break; };
                }
            }

            // update info
            dashboardService.getSingleIssue($.param({i_key:e.ikey})).then(function(data) {
                var stopFlag = false;
                for (var issueType in $scope.issueList.list) {
                    for (var issueIndex in $scope.issueList.list[issueType]) {
                        if ($scope.issueList.list[issueType][issueIndex].i_key == e.ikey) {
                            $scope.issueList.list[issueType][issueIndex] = data.data;
                            stopFlag = true;
                            break;
                        }
                    }
                    if (stopFlag) { break; };
                }
                // get notification
                angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
            }, function(err) {
                toastr.error("网络出错，已经恢复到最新状态。");
                $scope.listAll();
            });

        } else {
            toastr.error("数据出错，已经恢复到最新状态。");
            $scope.listAll();
        }
    }

    // this function return the first increment item and Key between newValue and oldValue, but not record decrements.
    function getActiveMoveingItem2(newValue, oldValue) {
        var incrementItem = {key : null, item : null};
        for(var key in newValue) {
            if(newValue[key].length > oldValue[key].length) {
                for(var key_sub in newValue[key]) {
                    if (oldValue[key][key_sub] && (newValue[key][key_sub].i_key == oldValue[key][key_sub].i_key)) {
                        continue;
                    } else {
                        incrementItem.key = key + '.' + key_sub;
                        incrementItem.item = newValue[key][key_sub];
                        break;
                    }
                }
                break;
            }
        }
        return incrementItem;
    }

    // this function return the first increment item and Key between newValue and oldValue, but not record decrements.
    function getActiveMoveingItem(newValue, oldValue) {
        var incrementItem = {key : null, oldKey: null, item : null};
        for(var key in newValue) {
            if(newValue[key].length > oldValue[key].length) {
                for(var key_sub in newValue[key]) {
                    if (oldValue[key][key_sub] && (newValue[key][key_sub].i_key == oldValue[key][key_sub].i_key)) {
                        continue;
                    } else {
                        incrementItem.key = key + '.' + key_sub;
                        incrementItem.item = newValue[key][key_sub];
                        break;
                    }
                }
            } else {
                for (var i in oldValue[key]) {
                    if (newValue[key][i] && (newValue[key][i].i_key == oldValue[key][i].i_key)) {
                        continue;
                    } else {
                        incrementItem.oldKey = key;
                        incrementItem.item = oldValue[key][i];
                        break;
                    }
                }
            }
        }
        return incrementItem;
    }

    $scope.statusClass = function(data){
        if(data == $scope.constants.issuesNew){
            return "statusNew";
        }else if(data == $scope.constants.issuesProcessing){
            return "statusProcessing";
        }else if(data == $scope.constants.issuesProcessed){
            return "statusProcessed";
        }else if(data == $scope.constants.issuesUnsolved){
            return "statusUnsolved";
        }else if(data == $scope.constants.issuesFeedback){
            return "statusFeedback";
        }else if(data == $scope.constants.issuesClosed){
            return "statusClosed";
        }
    };

    $scope.levelBorder = function (val) {
        if(val == $scope.constants.issuesHigh) {
            return "border-danger";
        }
        if(val == $scope.constants.issuesMiddle) {
            return "border-warning";
        }
        if(val == $scope.constants.issuesLow) {
            return "border-success";
        }
    }

    $scope.tabIssue = function (val) {
//        if(val == $scope.constants.CHECK_ISSUE_ALL) {  value = 'all';  }
        if(val == $scope.constants.CHECK_ISSUE_FROM_ME) {  value = 'create'; }
        if(val == $scope.constants.CHECK_ISSUE_FOLLOW_ME) {  value = 'follow'; }
        if(val == $scope.constants.CHECK_ISSUE_ASSIGN_ME) {  value = 'assignee'; }

        $state.go('project.workbench', { type : value});
    }

    if ($scope.userInfo.u_key) {
        loadProjectConfig();
    }

    $scope.$watch('userInfo.u_key', function(newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.listAll();
        }
    });

}

function manageShowProjects ($scope, $rootScope, $http, $filter, constants, sweetAlert,  $uibModalInstance, $stateParams, $controller, dashboardService, $cookies) {
    $controller('baseCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.userInfo = $rootScope.userInfo;

    var getCookieVal = function getCookie_value() {
        dashboardService.getCookieVal().then(function(data) {
          if(data.code == 0) {
             return data.data.ds_content;
          }
        }, function(err) {
        });
    }

    var setCookieVal = function setCookie_value(val) {
        dashboardService.setCookieVal($.param({cookieVal:val})).then(function(data) {
            if(data.code == 0) {
            }
        }, function(err) {
        });
    }

//    $scope.listAllProject = {};
    $scope.issuesLoaded = false;
    $scope.listAll = function () {
        dashboardService.listAllProject().then(function(data) {
            $scope.issuesLoaded = true;
            $scope.listAllProject = data.data.listAllProject;
            var agile  = data.data.cookiInfo.ds_content;

            if (agile) {
                $scope.agileArray = [];
                angular.forEach(angular.fromJson(agile), function(value, key) {
                    $scope.agileArray.push(value);
                });
            }

            if (agile && $scope.agileArray) {
                angular.forEach($scope.listAllProject, function(value, key) {
                    angular.forEach($scope.agileArray, function(data, k) {
                        if($scope.listAllProject[key].p_key == data) {
                            $scope.listAllProject[key].is_checked = true;
                        }
                    });
                });

                var allPro =  new Array();
                allPro['p_key'] = 'allProject';
                allPro['p_name'] = '全部';
                allPro['is_checked'] = $scope.listAllProject.length == $scope.agileArray.length ? true : false;
                $scope.listAllProject.unshift(allPro);

            } else {

                var allPro =  new Array();
                allPro['p_key'] = 'allProject';
                allPro['p_name'] = '全部';
                allPro['is_checked'] =  true;
                $scope.listAllProject.unshift(allPro);

                $scope.newAglieArray = [];
                angular.forEach($scope.listAllProject, function(value, key) {
                    $scope.listAllProject[key].is_checked = true;
                    $scope.newAglieArray.push(value.p_key);
                });

                setCookieVal(angular.toJson($scope.newAglieArray));
            }

        }, function(err) {

        });
    }

    $scope.listAll();

    $scope.deleteProject = function (val) {

        if($scope.agileArray) {
            $scope.agileCookieArray = $scope.agileArray;

            angular.forEach($scope.agileCookieArray, function(value, key) {
                    if($scope.agileCookieArray[key] == val) {
                         $scope.agileCookieArray.splice(key, 1);
                    }
            });

            setCookieVal(angular.toJson($scope.agileCookieArray));

            angular.forEach($scope.listAllProject, function(value, key) {
                    if($scope.listAllProject[key].p_key == val) {
                        $scope.listAllProject[key].is_checked = false;
                    }
            });

            $scope.listAllProject[0].is_checked = false;
            angular.element(document.getElementById('agileCtrl')).scope().listAll();
        }
    }

    $scope.choose = {};
    $scope.setProjectChange = function () {
        if($scope.choose.project.is_checked) {
            return false;
        }

        $scope.agileAddCookieArray = $scope.agileCookieArray ? $scope.agileCookieArray : $scope.agileArray;

        $scope.agileAddCookieArray.push($scope.choose.project.p_key);

        $scope.newAglieArray = [];
        setCookieVal(angular.toJson($scope.agileAddCookieArray));
        angular.forEach($scope.listAllProject, function(value, key) {
                if($scope.choose.project.p_key == 'allProject') {
                    $scope.newAglieArray.push(value.p_key);
                    $scope.listAllProject[key].is_checked = true;
                } else {
                    if($scope.listAllProject[key].p_key == $scope.choose.project.p_key) {
                        $scope.listAllProject[key].is_checked = true;
                    }
                }
        });

        if($scope.choose.project.p_key == 'allProject') {
            setCookieVal(angular.toJson($scope.newAglieArray));
            $scope.listAllProject[0].is_checked = true;
        } else {
            $scope.listAllProject[0].is_checked = $scope.listAllProject.length == $scope.agileAddCookieArray.length ? true : false;
        }

        angular.element(document.getElementById('agileCtrl')).scope().listAll();
     }

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

/**
 *
 * project controllers
 *
 */

angular
    .module('bugs')
    .controller('projectMainCtrl', projectMainCtrl)
    .controller('projectIndexCtrl', projectIndexCtrl)

    .controller('projectSettingCtrl', projectSettingCtrl)
    .controller('projectSettingMenuCtrl', projectSettingMenuCtrl)
    .controller('projectSettingInfoCtrl', projectSettingInfoCtrl)
    .controller('projectSettingUserCtrl', projectSettingUserCtrl)
    .controller('projectSettingRoleCtrl', projectSettingRoleCtrl)
    .controller('projectSettingModuleCtrl', projectSettingModuleCtrl)
    .controller('projectSettingTypeCtrl', projectSettingTypeCtrl)
    .controller('projectSettingStatusCtrl', projectSettingStatusCtrl)
    .controller('projectSettingRepositoryCtrl', projectSettingRepositoryCtrl)
    .controller('projectSettingImportCtrl', projectSettingImportCtrl)
    .controller('projectSettingWebhookCtrl', projectSettingWebhookCtrl)
    .controller('projectSettingTracupbotCtrl', projectSettingTracupbotCtrl)
    .controller('projectSettingAdvanceCtrl', projectSettingAdvanceCtrl)

    .controller('dashboardProjectCtrl', dashboardProjectCtrl)
    .controller('changeProjectOwnerCtrl', changeProjectOwnerCtrl)
    .controller('inviteUserCtrl', inviteUserCtrl);

function projectSettingMenuCtrl($scope, $rootScope, $http, constants, $stateParams, $controller, $state,  helper) {

    // user access control setting
    $scope.UAC = {
        projectInfo: false,

        manageUser: false,
        memberAdd: false,
        memberChangeRole: false,
        memberRemove: false,

        manageRole: false,
        roleAdd: false,
        roleChange: false,
        roleRemove: false,

        projectModule: false,
        projectVersion: false,
        projectType: false,
        projectStatus: false,
        projectRepository: false,
        projectImport: false,
        projectWebhook: false,
        projectTracupbot: false,
        projectDelete: false,
        projectRecycle: false,
        seniorSet: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'projectSettingMenuCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
            // calculate UAC
            $scope.UAC.projectInfo = permision.checkPermision(constants.UAC.projectInfo, $scope.projectConfig.current.role.privilege);

            $scope.UAC.manageUser = permision.checkPermisionGroup(constants.UACGROUP.manageUser, 'or', $scope.projectConfig.current.role.privilege);
            $scope.UAC.manageRole = permision.checkPermisionGroup(constants.UACGROUP.manageRole, 'or', $scope.projectConfig.current.role.privilege);
            $scope.UAC.changeUser = permision.checkPermisionGroup([constants.UAC.memberChangeRole, constants.UAC.memberRemove], 'or', $scope.projectConfig.current.role.privilege);

            $scope.UAC.roleAdd = permision.checkPermision(constants.UAC.roleAdd, $scope.projectConfig.current.role.privilege);
            $scope.UAC.roleChange = permision.checkPermision(constants.UAC.roleChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.roleRemove = permision.checkPermision(constants.UAC.roleRemove, $scope.projectConfig.current.role.privilege);

            $scope.UAC.memberAdd = permision.checkPermision(constants.UAC.memberAdd, $scope.projectConfig.current.role.privilege);
            $scope.UAC.memberChangeRole = permision.checkPermision(constants.UAC.memberChangeRole, $scope.projectConfig.current.role.privilege);
            $scope.UAC.memberRemove = permision.checkPermision(constants.UAC.memberRemove, $scope.projectConfig.current.role.privilege);

            $scope.UAC.projectModule = permision.checkPermision(constants.UAC.projectModule, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectVersion = permision.checkPermision(constants.UAC.projectVersion, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectType = permision.checkPermision(constants.UAC.projectType, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectStatus = permision.checkPermision(constants.UAC.projectStatus, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectRepository = permision.checkPermision(constants.UAC.projectRepository, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectImport = permision.checkPermision(constants.UAC.projectImport, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectWebhook = permision.checkPermision(constants.UAC.projectWebhook, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectTracupbot = permision.checkPermision(constants.UAC.projectTracupbot, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectDelete = permision.checkPermision(constants.UAC.projectDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectRecycle = permision.checkPermision(constants.UAC.projectRecycle, $scope.projectConfig.current.role.privilege);
            $scope.UAC.seniorSet = permision.checkPermisionGroup([constants.UAC.projectRecycle, constants.UAC.projectDelete], 'or',  $scope.projectConfig.current.role.privilege);
            init();
        } else {
            // do nothing
        }
    }

    var uacArr = {
        info: 'projectInfo',
        user: 'manageUser',
        role: 'manageRole',
        module: 'projectModule',
        version: 'projectVersion',
        type: 'projectType',
        status: 'projectStatus',
        repository: 'projectRepository',
        import: 'projectImport',
        webhook: 'projectWebhook',
        tracupbot: 'projectTracupbot',
        advance: 'seniorSet',
    }

    function init() {
        $scope.currentPage = $state.current.name;
        var matches = $scope.currentPage.match(/project\.setting(\.(\w+))?/i);
        
        if(!matches) {
            return false;
        }

        if(matches[2]) {
            if(!$scope.UAC[uacArr[matches[2]]]) {
                for (index in uacArr) {
                    if ($scope.UAC[uacArr[index]]) {
                        $state.go('project.setting.' + index);
                        break;
                    }
                }
            } else {
                $state.go($scope.currentPage);
            }
        } else {
            for (index in uacArr) {
                if ($scope.UAC[uacArr[index]]) {
                    $state.go('project.setting.' + index);
                    break;
                }
            }
        }
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $scope.currentPage = $state.current.name;
        if ($scope.currentPage == "project.setting") {
            for (index in uacArr) {
                if ($scope.UAC[uacArr[index]]) {
                    $state.go('project.setting.' + index);
                    break;
                }
            }
        }
    });
}

function projectMainCtrl($rootScope, $scope, constants, $state, $stateParams, $controller, $timeout, $rootScope) {
    $controller('baseCtrl', {$scope: $scope});

    $scope.constants = constants;
    $scope.showNav = $state.current.data.showNav;
    $scope.pKey = $stateParams.pKey;

    // issue view control
    $scope.state = $stateParams;

    // issue view bar openstatus
    $scope.issueSideBarStatus = false;
    if(statusWatcher) {
        statusWatcher();
    }
    var statusWatcher = $scope.$watch('issueSideBarStatus', function(newValue, oldValue) {
        $(document).off('scroll', sideViewOffsetAdjsut);
        if(newValue) {
            $(document).on('scroll', sideViewOffsetAdjsut);
        } else {
            $(document).off('scroll', sideViewOffsetAdjsut);
        }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, fromState) {
        $(document).off('scroll', sideViewOffsetAdjsut);
        if(toState.name == 'fileview') {
            $scope.cancelSideView({target:document.body});
        }
    });

    var resizeFixedFlag = false;
    function sideViewOffsetAdjsut() {
        var offsetTop = 103 - $(document).scrollTop();
        if(offsetTop < 0) {
            $('#side-view-bar').css({top: '0px', position: 'fixed'});
            if(resizeFixedFlag == false) {
                $(document).resize();
                resizeFixedFlag = true;
            }
        } else {
            $('#side-view-bar').css({top: 'auto', position: 'absolute'});
            $(document).resize();
            resizeFixedFlag = false;
        }
    }

    $scope.cancelSideView = function (e) {
        var $eventElement = $(e.target)[0];
        var $container = $('#side-view-bar')[0];
        var $containerModal = $('.modal-dialog').parent()[0];
        var $containerSweetAlert = $('.sweet-alert').parent()[0];
        var $containerToastr = $('#toast-container')[0];
        var $markdownEditorPopupBg = $('.wmd-prompt-background')[0];
        var $markdownEditorPopup = $('.wmd-prompt-dialog')[0];

        var preventCloseFlag = false;
        if($container && ($.contains($container, $eventElement) || $container == $eventElement)) {
            preventCloseFlag |= true;
        }

        if($containerModal && ($.contains($containerModal, $eventElement) || $containerModal == $eventElement)) {
            preventCloseFlag |= true;
        }

        if($containerSweetAlert && ($.contains($containerSweetAlert, $eventElement) || $containerSweetAlert == $eventElement)) {
            preventCloseFlag |= true;
        }

        if($containerToastr && ($.contains($containerToastr, $eventElement) || $containerToastr == $eventElement)) {
            preventCloseFlag |= true;
        }

        if($markdownEditorPopupBg && ($.contains($markdownEditorPopupBg, $eventElement) || $markdownEditorPopupBg == $eventElement)) {
            preventCloseFlag |= true;
        }

        if($markdownEditorPopup && ($.contains($markdownEditorPopup, $eventElement) || $markdownEditorPopup == $eventElement)) {
            preventCloseFlag |= true;
        }

        if(!$.contains($(document)[0], $eventElement)) {
            preventCloseFlag |= true;
        }

        if( !preventCloseFlag || $eventElement.id == 'cancelSideBtn') {
            // remove viewIssueNumber on state params
            $timeout(function() {
                setIssueViewRouter('');
            }, 10);
            $('#side-view-bar').removeClass('side-view-open');
            $('.issue-container').removeClass('col-md-pull-4');
            $('.issue-container').removeClass('col-lg-pull-3');
            $('.issue-container').removeClass('col-sm-pull-3');
            $('.issue-container').addClass('reset-right');
            $scope.issueSideBarStatus = false;
            $(document).off('click', $scope.cancelSideView);
            $(document).off('contextmenu', $scope.cancelSideView);
        }
    }

    var sideViewTimer = null;
    var sideViewCloseTriggerTimer = null;
    $scope.showIssue = function (iNo, evt, issue) {
        // add viewIssueNumber on state params
        $timeout.cancel(sideViewTimer);
        $timeout.cancel(sideViewCloseTriggerTimer);
        if($('#side-view-bar').hasClass('side-view-open')) {
            evt.stopPropagation();
            $timeout(function() {
                $scope.sideINo = iNo;
                setIssueViewRouter(iNo, issue);
            }, 10);
        } else {
            $timeout(function() {
                $scope.sideINo = iNo;
                setIssueViewRouter(iNo, issue);
            }, 200);
        }

        $timeout(function() {
            $('#side-view-bar').addClass('side-view-open');
            $('.issue-container').addClass('col-md-pull-4');
            $('.issue-container').addClass('col-lg-pull-3');
            $('.issue-container').addClass('col-sm-pull-3');
            $('.issue-container').removeClass('reset-right');
        }, 10);

        $scope.issueSideBarStatus = false;
        sideViewTimer = $timeout(function() { 
            $scope.issueSideBarStatus = true;
            sideViewOffsetAdjsut();
        }, 10);

        sideViewCloseTriggerTimer = $timeout(sideViewAddCloseTrigger, 200);
    }

    function sideViewAddCloseTrigger() {
        $(document).off('click', $scope.cancelSideView);
        $(document).on('click', $scope.cancelSideView);
        $(document).off('contextmenu', $scope.cancelSideView);
        $(document).on('contextmenu', $scope.cancelSideView);
    }

    function setIssueViewRouter(iNo, issue) {
        var statParameters = $state.params;
        var statRouterName = $state.current.name;
        statParameters.viewIssueNumber = iNo;
        $rootScope.viewIssue = issue;
        $state.transitionTo(statRouterName, statParameters, {
            notify: false,
            reload: true,
        });
    }

    function setIssueView() {
        var iNo = $state.params.viewIssueNumber;
        if(iNo) {
            $scope.showIssue(iNo, {stopPropagation: function(){}});
        }
    }


    $timeout(setIssueView, 500);

}

function projectIndexCtrl($scope, $state, constants, $rootScope, projectService, $uibModal, toastr, $controller, sweetAlert, $stateParams) {
    $controller('baseCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.projectList = {};
    $scope.projectParticipantList = {};
    $scope.projectStarList = {};
    $scope.projectHideList = {};

    $scope.isLoaded = false;
    $scope.isLoadedParticipant = false;
    $scope.isLoadedStar = false;
    $scope.isLoadedHide = false;

    $scope.isHideProject = true;
    $scope.isHideProjectTitle = '显示';

    $scope.fileURI = $stateParams.fileURI;

    $rootScope.$watch('userInfo', onUserInfoChange, true);
    function onUserInfoChange(newValue, oldValue) {
        $scope.userInfo = $rootScope.userInfo;
    }

    $scope.$watch('fileURI',function(newValue,oldValue){

       if( newValue) {
           $scope.$parent.createQuestion();
       }

   });

    $scope.loadAllProjectList = function() {
        loadProjectList();
    }

    // set project list
    function loadProjectList() {
        $scope.projectList = {stared: [], created: [], joined: [], recycled:[]};
        projectService.getProjectList().then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.isLoaded = true;
                var projectList = data.data;
                for(var index in projectList) {
                    if(!projectList[index].recycled) {
                        if(projectList[index].starFlag) {
                            $scope.projectList.stared.push(projectList[index]);
                        } else if (projectList[index].creatorFlag) {
                            $scope.projectList.created.push(projectList[index]);
                        } else {
                            $scope.projectList.joined.push(projectList[index]);
                        }
                    } else {
                        $scope.projectList.recycled.push(projectList[index]);
                    }
                }

            } else {
                fall();
            }
        }, function(err) {
            fall();
        });

        function fall() {
            toastr.error('获取项目列表设置失败 3秒后将再次尝试');
            window.setTimeout(loadProjectList, 3000);
        }
    }

    $scope.create = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_project_modal.html',
            controller: createProjectCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.setProjectStar = function(pKey, $event) {
        $scope.updateProjectUser('isStar', pKey);
        $event.stopPropagation();
    }

    $scope.setProjectHide = function(pKey) {
        $scope.updateProjectUser('isHide', pKey);
    }

    $scope.showHideProject = function () {
        $scope.isHideProject = !$scope.isHideProject;

        if ($scope.isHideProject) {
            $scope.isHideProjectTitle = '显示';
        } else {
            $scope.isHideProjectTitle = '隐藏';
        }
    }

    $scope.updateProjectUser = function(field, pKey) {
        projectService.updateProjectUser(pKey, field).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            }
            else {
                toastr.info('设置成功');
                $scope.loadAllProjectList();
                angular.element(document.getElementById('header-container')).scope().$$childHead.refreshProjectList();
            }
        }, function(err) {
            toastr.error('网络连接错误');
        });
    };

  $scope.goDashboard = function(pKey){
      $state.go('project.dashboard', { 'pKey' : pKey});
  };


    $scope.askSetHide = function(pKey) {
        var askTitle = '';
        var askStr = '';
        var askText = '';

        // 用户是否为管理员
        projectService.checkIsManager(pKey).then(function(data) {
            if (data.code == constants.globalFalse) {
                if (data.data.isManager) {
                    askTitle = '重新打开项目';
                    askText = '重新打开项目后，您就可以正常使用该项目了';
                    askStr = '重新打开项目';
                    sweetAlert.swal({
                        title: askTitle,
                        text: askText,
                        showCancelButton: true,
                        confirmButtonColor: "#34495e",
                        confirmButtonText: askStr,
                        cancelButtonText: "取消"
                    },

                    function(isConfirm) {
                        if (isConfirm) {
                            $scope.updateProjectUser('isHide', pKey);
                        }
                    });
                } else {
                    askTitle = '权限不足';
                    askText = '您没有权限重新打开项目，请联系项目管理员';
                    askStr = '取消';

                    sweetAlert.swal({
                        title: askTitle,
                        text: askText,
                        showCancelButton: false,
                        confirmButtonColor: "#34495e",
                        confirmButtonText: askStr,
                        cancelButtonText: "取消"
                    },

                    function(isConfirm) {
                        if (isConfirm) {
                            // $scope.updateProjectUser('isHide', pKey);
                        }
                    });
                }

            }
        }, function(err) {
        });

    }
}

function projectSettingInfoCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    $scope.projectInfo = {};
    var pKey = $stateParams.pKey;

    var configReader = helper.configReader();
    var stringFormater = helper.stringFormater();

    $scope.projectBackgroundConfig = [
        {key: constants.themeGray, label: "红色", class: "project-index-bg-gray"},
        {key: constants.themeOrange, label: "橙色", class: "project-index-bg-orange"},
        {key: constants.themeYellow, label: "黄色", class: "project-index-bg-yellow"},
        {key: constants.themeGrassgreen, label: "绿色", class: "project-index-bg-grassgreen"},
        {key: constants.themeGreen, label: "青色", class: "project-index-bg-green"},
        {key: constants.themeBlue, label: "蓝色", class: "project-index-bg-blue"},
        {key: constants.themePurple, label: "紫色", class: "project-index-bg-purple"},
    ];

    $scope.selectedBackgroundColor = configReader.read($scope.projectBackgroundConfig, constants.themeBlue);

    $scope.getProjectInfo = function() {
        projectService.refreshProjectConfig();
        $scope.isLoaded = false;
        var pKey = $stateParams.pKey;
        projectService.getProjectInfo(pKey).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.projectInfo = data.data.pInfo;
                $scope.selectedBackgroundColor = configReader.read($scope.projectBackgroundConfig, $scope.projectInfo.p_background);
                $scope.isHide = $scope.projectInfo.p_is_hide;

                if ($scope.isHide == constants.globalFalse) {
                    $scope.isHideTitle = '回收项目';
                } else {
                    $scope.isHideTitle = '重新打开项目';
                }
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
            $scope.isLoaded = true;
         });
     };

    $scope.updateProject = function() {
        var name = stringFormater.filterInput($scope.projectInfo.p_name);
        var bgColor = $scope.selectedBackgroundColor.key;
        var description = stringFormater.filterInput($scope.projectInfo.p_description);

        if (name.length > 20) {
            toastr.error('项目名称不能超过20个字符');
            return false;
        }
        
        if (description.length > 200) {
            toastr.error('项目描述不能超过200个字符');
            return false;
        }

        var pKey = $stateParams.pKey;
        projectService.update(pKey, name, bgColor, description).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('修改项目信息成功');
            }
        }, function(err) {
            toastr.error('网络连接错误');
        });
    };

    $scope.changeBackgroundColor = function(selected) {
        $scope.selectedBackgroundColor = selected;
    }

    $scope.getProjectInfo();
}

function projectSettingUserCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    $scope.constants = constants;
    var pKey = $stateParams.pKey;

    $scope.configReader = helper.configReader();

    $scope.manageUser = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/manage_user_modal.html',
            controller: manageUserCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.UAC = {
        memberChangeRole: false,
        memberRemove: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'projectSettingUserCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.memberChangeRole = permision.checkPermision(constants.UAC.memberChangeRole, $scope.projectConfig.current.role.privilege);
            $scope.UAC.memberRemove = permision.checkPermision(constants.UAC.memberRemove, $scope.projectConfig.current.role.privilege);
        } else {
            // do nothing
        }
    }

    $scope.loadProjectUserList = function() {
        var pKey = $stateParams.pKey;

        projectService.getManagUserList(pKey, constants.globalFalse, constants.globalTrue).then(function(data) {

            $scope.projectUserList = data.data.list;
            $scope.projectQuota = data.data.quota;
        }, function(err) {
        });
    }

    $scope.changeRole = function (uKey, prKey) {
        projectService.changeUserRole(pKey, uKey, prKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('更改角色成功');
                projectService.refreshProjectConfig();
            }
        }, function(err) {
            toastr.error('网络连接错误');
        });
    };

    var removeUser = function (pKey, uKey) {
        projectService.removeUser(pKey, uKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            }
            else {
                toastr.info('移除用户成功');
                projectService.refreshProjectConfig();
            }
        }, function(err) {
            toastr.error('网络连接错误');
        });
    };


    /*
     * 删除用户
     */
    $scope.askUserDelete = function(user) {
        sweetAlert.swal({
            title: '确定要删除用户"' +  user.label + '"吗?',
            text: "用户删除后，将无法恢复",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.removeuser(user);
            }
        });
    }

    $scope.removeuser = function(user) {
        removeUser(pKey, user.key);
    };
}

function projectSettingRoleCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    $scope.constants = constants;
    var pKey = $stateParams.pKey;

    $scope.configReader = helper.configReader();

    $scope.UAC = {
        roleAdd: false,
        roleChange: false,
        roleRemove: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'projectSettingRoleCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.roleAdd = permision.checkPermision(constants.UAC.roleAdd, $scope.projectConfig.current.role.privilege);
            $scope.UAC.roleChange = permision.checkPermision(constants.UAC.roleChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.roleRemove = permision.checkPermision(constants.UAC.roleRemove, $scope.projectConfig.current.role.privilege);
        } else {
            // do nothing
        }
    }

    $scope.createRole = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_role_modal.html',
            size: 'lg',
            controller: manageRoleCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.renameRole = function(index) {
        $scope.roleInfo = $scope.projectConfig.role[index];
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_role_modal.html',
            size: 'lg',
            controller: manageRoleCtrl,
            windowClass: "hmodal-success",
            scope:$scope,
            backdrop: 'static',
            keyboard: false
        });
    }


    /*
     * 删除角色
     */
    $scope.askRoleDelete = function(prKey) {
        sweetAlert.swal({
            title: '确定要删除该角色吗？',
            text: "角色删除后，将无法恢复",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                removeRole(prKey);
            }
        });
    }

    function removeRole (prKey) {
        projectService.deleteRole(pKey, prKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('移除角色成功');
                projectService.refreshProjectConfig();
            }
        }, function(err) {
            toastr.error('网络连接错误');
        });
    };
}


function projectSettingModuleCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    var pKey = $stateParams.pKey;
    var stringFormater = helper.stringFormater();

    $scope.isCreatingModule = false;

    $scope.loadProjectModuleList = function() {
        var pKey = $stateParams.pKey;
        projectService.getProjectModuleList($.param({pKey: pKey})).then(function(data) {
            $scope.projectModuleList = data.list;
        }, function(err) {
        });
    }
    $scope.loadProjectModuleList();

    /*
     * 创建模块
     */
    $scope.module = {};
    $scope.createModule = function() {
        $scope.module.moduleName = '';
        $scope.isCreatingModule = true;
    }

    $scope.createModuleCancel = function() {
        $scope.isCreatingModule = false;
    }

    $scope.createModuleConfirm = function() {
        if (!$scope.module.moduleName) {
            toastr.error('请输入模块名称');
            return false;
        }

        if ($scope.module.moduleName.length>10) {
            toastr.error('模块名称不能超过10个字符');
            return false;
        }

        if ($scope.newModuleSubmitting == true) {
            return false;
        }

        $scope.newModuleSubmitting = true;

        projectService.createModule($.param({pmName: stringFormater.filterInput($scope.module.moduleName), pKey: $stateParams.pKey})).then(function(data) {
            $scope.newModuleSubmitting = false;
            if (data.code == 0) {
                projectService.refreshProjectConfig();
                $scope.loadProjectModuleList();
                $scope.module.moduleName = '';
                toastr.info('创建成功');
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
            toastr.error('网络请求失败');
            $scope.newModuleSubmitting = false;
        });
    }

    // 模块排序
    $scope.sortableOptions = {
        handle: '>td .fa-sort',
        stop: function (e, ui) {
            var newModuleKeyArray = [];
            angular.forEach($scope.projectModuleList, function (value) {
                newModuleKeyArray.push(value.pm_key);
            });
            projectService.updateModuleOrder(newModuleKeyArray.join(',')).then(function(){
                projectService.refreshProjectConfig();
            });
        }
    };

    /*
     * 模块重命名
     */
    $scope.renameModule = function(pmKey, pmName) {
        $scope.oldPmname = pmName;
        $scope.renameModuleKey = pmKey;
    }

    $scope.renameModuleCancel = function(index) {
        $scope.projectModuleList[index].pm_name = $scope.oldPmname;
        $scope.renameModuleKey = '';
    }

    $scope.renameModuleConfirm = function(pmName) {
        var pmKey = $scope.renameModuleKey;

        if (!pmName) {
            toastr.error('请输入模块名称');
            return false;
        }


        if (pmName.length>10) {
            toastr.error('模块名称不能超过10个字符');
            return false;
        }


        if ($scope.renameModuleSubmitting == true) {
            return false;
        }

        $scope.renameModuleSubmitting = true;

        projectService.createModule($.param({pmName: pmName, pKey: $stateParams.pKey, pmKey: pmKey})).then(function(data) {
            $scope.renameModuleKey = '';
            $scope.renameModuleSubmitting = false;
            if (data.code == 0) {
                toastr.info('操作成功');
            } else {
                toastr.warning('操作失败');
            }
        }, function(err) {
            $scope.renameModuleCancel();
            toastr.error('网络请求失败');
            $scope.renameModuleSubmitting = false;
        });
    }

    /*
     * 模块删除
     */
    $scope.deleteModule = function(pmKey, pmName) {
        sweetAlert.swal({
            title: '确定要删除模块"' +  pmName + '"吗?',
            text: "模块删除后，将无法恢复",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                projectService.deleteModule($.param({pKey: $stateParams.pKey, pmKey: pmKey})).then(function(data) {
                    if (data.code == 0) {
                        projectService.refreshProjectConfig();
                        $scope.loadProjectModuleList();
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(err) {
                    toastr.error('网络请求失败');
                });
            }
        });
    }

}

function projectSettingTypeCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    var pKey = $stateParams.pKey;

    $scope.isCreatingType = false;

    $scope.loadProjectTypeList = function() {
        var pKey = $stateParams.pKey;
        $scope.loadingProjectType = true;
        projectService.getProjectTypeList($.param({pKey: pKey})).then(function(data) {
            $scope.projectTypeList = data.list;
            $scope.loadingProjectType = false;
        }, function(err) {
        });
    }

    $scope.loadProjectTypeList();

    // 类型排序，创建，删除
    $scope.sortableOptions = {
        handle: '>td .fa-sort',
        stop: function (e, ui) {
            var newTypeKeyArray = [];
            angular.forEach($scope.projectTypeList, function (value) {
                newTypeKeyArray.push(value.pt_key);
            });
            projectService.updateTypeOrder(newTypeKeyArray.join(',')).then(function(){
                projectService.refreshProjectConfig();
            });
        }
    };

    $scope.createType = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_type_modal.html',
            controller: projectTypeCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.renameType = function(index) {
        $scope.typeInfo = $scope.projectTypeList[index];
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_type_modal.html',
            controller: projectTypeCtrl,
            scope:$scope,
            backdrop: 'static',
            keyboard: false
        });
    }

    $scope.deleteType = function(ptKey, ptName) {
        sweetAlert.swal({
            title: '确定要删除问题类型"' +  ptName + '"吗?',
            text: "类型删除后，将无法恢复",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                projectService.deleteType($.param({pKey: $stateParams.pKey, ptKey: ptKey})).then(function(data) {
                    if (data.code == 0) {
                        angular.element(document.getElementById('projectSettingTypeCtrl')).scope().loadProjectTypeList();
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(err) {
                    toastr.error('网络请求失败');
                });
            }
        });
    }
}

function projectSettingStatusCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    var pKey = $stateParams.pKey;

    $scope.loadProjectStatusList = function() {
        var pKey = $stateParams.pKey;
        $scope.loadingProjectStatus = true;
        projectService.getProjectStatusList($.param({pKey: pKey})).then(function(data) {
            $scope.projectStatusList = data.list;
            $scope.loadingProjectStatus = false;
        }, function(err) {
        });
    }
    $scope.loadProjectStatusList();

    // 排序，创建，编辑，删除状态
    $scope.sortableOptions = {
        handle: '>td .fa-sort',
        stop: function (e, ui) {
            var newStatusKeyArray = [];
            angular.forEach($scope.projectStatusList, function (value) {
                newStatusKeyArray.push(value.key);
            });
            projectService.updateStatusOrder(newStatusKeyArray.join(',')).then();
        }
    };

    $scope.createStatus = function() {
        $scope.iconList = $scope.allStatusIcon;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_status_modal.html',
            controller: projectStatusCtrl,
            $scope: $scope,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.renameStatus = function(index) {
        $scope.statusInfo = $scope.projectStatusList[index];
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/create_status_modal.html',
            controller: projectStatusCtrl,
            scope:$scope,
            backdrop: 'static',
            keyboard: false
        });
    }

    $scope.deleteStatus = function(psKey, psName) {
        sweetAlert.swal({
            title: '确定要删除问题状态"' +  psName + '"吗?',
            text: "状态删除后，将无法恢复",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                projectService.deleteStatus($.param({pKey: $stateParams.pKey, psKey: psKey})).then(function(data) {
                    if (data.code == 0) {
                        angular.element(document.getElementById('projectSettingStatusCtrl')).scope().loadProjectStatusList();
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(err) {
                    toastr.error('网络请求失败');
                });
            }
        });
    }
}

function projectSettingRepositoryCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    var pKey = $stateParams.pKey;

    $scope.projectVCSData = {};
    $scope.projectVCSData.bindingStep = 0;
    $scope.projectVCSData.choosenRespoitory = {};
    $scope.projectVCSData.connetConfig = {};

    $scope.importAllIssue = function () {
        if($('[ng-click="importAllIssue()"]').attr('disabled')) {
            return true;
        }
        sweetAlert.swal({
            title: '是否导入所有 Issue ?',
            text: '点击确认后将自动导入仓库中所有的 Issue（自动创建的 Issue 不会受到影响）。',
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: '确定导入',
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.importIssue(pKey);
            }
        });
    }

    $scope.importIssue = function(pKey) {
        // add notification to UI
        $('[ng-click="importAllIssue()"]').attr('disabled', 'disabled');
        $('[ng-click="importAllIssue()"]').text('正在导入...');
        VCSService.importIssue(pKey).then(function(data) {
            // remove modification and notify user
            if (data.code == constants.returnSuccess) {
                toastr.info('导入问题成功');
            }
            else {
                toastr.warning('导入问题失败，请稍后再试');
            }
            $('[ng-click="importAllIssue()"]').removeAttr('disabled');
            $('[ng-click="importAllIssue()"]').text('导入所有 Issue');
        }, function(err) {
            // remove modification and notify user
            toastr.error('网络错误，请稍后再试');
            $('[ng-click="importAllIssue()"]').removeAttr('disabled');
            $('[ng-click="importAllIssue()"]').text('导入所有 Issue');
        });
    }

    $scope.cancelSetRepository = function () {
        //$scope.projectVCSData = {};
        $scope.projectVCSData.bindingStep = 0;
        $scope.projectVCSData.choosenRespoitory = {};
        $scope.projectVCSData.connetConfig.p_key = null;
        $scope.projectVCSData.connetConfig.pv_driver_config = null;
        $scope.projectVCSData.connetConfig.pv_driver_name = null;
        $scope.projectVCSData.connetConfig.pv_oauth_token = null;
        $scope.projectVCSData.connetConfig.pv_repository = null;
    }

    $scope.loadRepositoryList = function (pKey, repositoryType, type) {
        $scope.projectVCSData.pending = true;
        VCSService.getRepositoryList( pKey, repositoryType, type).then( function( data) {
            $scope.projectVCSData.pending = false;
            if( data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
                $scope.projectVCSData.bindingStep = 0;
            } else {
                $scope.projectVCSData.bindingStep = 1;
                $scope.projectVCSData.repositoryList = data.data.repositories;
                angular.forEach($scope.projectVCSData.repositoryList, function(data, index, array) {
                    $scope.projectVCSData.repositoryList[index].configData = angular.fromJson(data.configData);
                });
            }
        }, function(err) {
            toastr.error('链接超时, 请再次尝试');
            $scope.projectVCSData.pending = false;
        });
    }

    $scope.getRepositoryList = function () {
        var repositoryType = $scope.projectVCSData.repositoryType;
        var pKey = $stateParams.pKey;

        $scope.setWebhookURL(pKey);

        if( !( username && password)) {
            toastr.error('请填写用户名和密码');
            return false;
        }
        $scope.loadRepositoryList( pKey, repositoryType, 'normal');
    }

    $scope.setWebhookURL = function ( pKey) {
        $scope.projectVCSData.webhookURL = 'https://www.tracup.com/api/VCS/webhook/' + pKey;
    }

    $scope.loadRepositoryInfo = function () {
        var pKey = $stateParams.pKey;
        $scope.setWebhookURL(pKey);
        VCSService.getRepository(pKey).then(function(data){
            if( data.data.pv_repository) {
                $scope.projectVCSData.choosenRespoitory = {repositoryName: data.data.pv_repository, configData: angular.fromJson(data.data.pv_driver_config)};
                $scope.projectVCSData.connetConfig = data.data;
                $scope.setRepositoryType( data.data.pv_driver_name);
                $scope.projectVCSData.bindingStep = 2;
                $scope.projectVCSData.pending = false;
            } else {
                $scope.projectVCSData.connetConfig = data.data;
                $scope.projectVCSData.connetConfig.p_key = null;
                $scope.projectVCSData.connetConfig.pv_driver_config = null;
                $scope.projectVCSData.connetConfig.pv_driver_name = null;
                $scope.projectVCSData.connetConfig.pv_oauth_token = null;
                $scope.projectVCSData.connetConfig.pv_repository = null;
            }
        });
    }

    $scope.loadRepositoryInfo();

    $scope.updateRepositorySettings = function () {
        var choosenRespoitory = $scope.projectVCSData.choosenRespoitory;
        var pKey = $stateParams.pKey;
        VCSService.setRepository(pKey, choosenRespoitory).then(function(data){
            $scope.projectVCSData.bindingStep = 2;
            $scope.projectVCSData.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectVCSData.pending = false;
        });
    }

    $scope.confirmRepository = function () {

        var choosenRespoitory = $scope.projectVCSData.choosenRespoitory;
        var pKey = $stateParams.pKey;

        $scope.projectVCSData.pending = true;
        if( choosenRespoitory.repositoryName) {
            VCSService.setRepository(pKey, choosenRespoitory).then( function( data){
                $scope.projectVCSData.bindingStep = 2;
                $scope.projectVCSData.pending = false;
            }, function(err) {
                toastr.error('连接超时, 请再次尝试');
                $scope.projectVCSData.pending = false;
            });
        } else {
            toastr.error('请选择项目');
            $scope.projectVCSData.pending = false;
        }
    }

    // setting for version control system
    $scope.setRepository = function (repositoryType) {

        $scope.projectVCSData.bindingStep = 0;
        var credentialArray = $scope.projectVCSData.connetConfig.credentialInfo;
        var pKey = $stateParams.pKey;

        var credentialCheckFlag = false;
        for(var index in credentialArray) {
            if(repositoryType == credentialArray[index]) {
                credentialCheckFlag = true;
                break;
            }
        }

        $scope.setRepositoryType(repositoryType);

        if(credentialCheckFlag) {
            $scope.loadRepositoryList( pKey, repositoryType, 'credential');
        } else {
            $scope.setRepositoryWithoutCredential(repositoryType);
            $scope.projectVCSData.pending = true;
        }

    }

    $scope.setRepositoryWithoutCredential = function(repositoryType) {

        if( repositoryType == 'github') {
            var openURL = 'https://github.com/login/oauth/authorize?client_id=' + $scope.projectVCSData.connetConfig.auth_githubClientID + '&scope=user:email repo';
            var repositoryType = $scope.projectVCSData.repositoryType;
            var pKey = $stateParams.pKey;
            waittingOAuth(repositoryType);
            window.open( openURL);
        } else if( repositoryType == 'bitbucket') {
            var openURL = 'https://bitbucket.org/site/oauth2/authorize?client_id=' + $scope.projectVCSData.connetConfig.auth_bitbucketClientID + '&response_type=code';
            var repositoryType = $scope.projectVCSData.repositoryType;
            var pKey = $stateParams.pKey;
            waittingOAuth(repositoryType);
            window.open( openURL);
        }
    }

    function waittingOAuth(repositoryType) {
        var repositoryName = {github: 'Github', bitbucket: 'Bitbucket'};
        var displayTitle = '已经成功获得 ' + repositoryName[repositoryType] + ' 授权?';
        var displayText = '您需要在弹出 ' + repositoryName[repositoryType] + ' 授权页面中完成授权操作，如果您已经完成了操作请点击已授权按钮。';
        sweetAlert.swal({
            title: displayTitle,
            text: displayText,
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: '已授权',
            cancelButtonText: '取消'
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.loadRepositoryList( pKey, repositoryType, 'wait');
            } else {
                $scope.projectVCSData.bindingStep = 0;
                $scope.projectVCSData.pending = false;
            }
        });
    }

    // settings of VCS

    $scope.setRepositoryType = function ( repositoryType) {

        if( repositoryType == 'github') {
            $scope.projectVCSData.repositoryType = repositoryType;
            $scope.projectVCSData.repositoryTypeName = 'Github';
            $scope.projectVCSData.repositoryTypeClass = 'fa-github';
            $scope.projectVCSData.bindingStep = true;
        }

        if( repositoryType == 'bitbucket') {
            $scope.projectVCSData.repositoryType = repositoryType;
            $scope.projectVCSData.repositoryTypeName = 'Bitbucket';
            $scope.projectVCSData.repositoryTypeClass = 'fa-bitbucket';
            $scope.projectVCSData.bindingStep = true;
        }

    }

}

function projectSettingImportCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope})
    var pKey = $stateParams.pKey;;


    // settings of Issue import
    $scope.IssueImportData = {};
    $scope.IssueImportData.importStep = 0;
    $scope.IssueImportData.importID = 0;
    $scope.IssueImportData.pending = false;
    $scope.IssueImportData.pKey = $stateParams.pKey;
    $scope.IssueImportData.fieldMappingData = [];
    $scope.IssueImportData.valueMappingData = [];
    $scope.IssueImportData.CSVSeperator = ',';
    $scope.IssueImportData.csvFile = '';
    $scope.IssueImportData.csvFileName = '';
    $scope.IssueImportData.encodingList = ['UTF-8', 'GB18030', 'GB2312', 'GBK', 'ASCII'];
    $scope.IssueImportData.CSVFileEncoding = $scope.IssueImportData.encodingList[0];

    $scope.IssueImportData.importID = '';
    $scope.IssueImportData.demoField = [];
    $scope.IssueImportData.mappingValues = [];
    $scope.IssueImportData.mappingTargets = [];
    $scope.IssueImportData.messageList = [];

    $scope.getIssueFile = function () {
        $(document).on('change', 'input[role="csvFile"]',function(e){
            var nodeInput = document.querySelector('input[role="csvFile"]');
            if(nodeInput && nodeInput.files && nodeInput.files[0] && nodeInput.files[0].name) {
                $scope.IssueImportData.csvFileName = '已选择: ' + nodeInput.files[0].name;
            } else {
                $scope.IssueImportData.csvFileName = '文件已选择'
            }
            $scope.$apply();
        });
        $('input[role="csvFile"]').click();
    }

    $scope.cancelIssueFile = function() {
        $('input[role="csvFile"]').val('');
        $scope.IssueImportData.csvFileName = '';
    }

    $scope.uploadCSVFile = function() {
        var fromData = new FormData();
        var csvFile = document.querySelector('input[role="csvFile"]').files[0];
        fromData.append('csv', csvFile);
        fromData.append('pKey', $scope.IssueImportData.pKey);
        fromData.append('seperator', $scope.IssueImportData.CSVSeperator);
        fromData.append('encoding', $scope.IssueImportData.CSVFileEncoding);

        if(!csvFile || !$scope.IssueImportData.CSVSeperator) {
            toastr.error('请选择 CSV 文件并设置分隔符');
            return false;
        }

        $scope.IssueImportData.pending = true;
        projectService.uploadIssueFile(fromData).then(function(data) {
            if (data.code == 0) {
                $scope.IssueImportData.importStep = 1;
                $scope.IssueImportData.importID = data.data.key;
                $scope.IssueImportData.demoField = data.data.data;
                $scope.IssueImportData.mappingField = data.data.mappingField;
            } else {
                toastr.warning(data.message);
                $scope.IssueImportData.csvFile = '';
                $scope.IssueImportData.csvFileName = '';
            }
            $scope.IssueImportData.pending = false;
        }, function(err) {
            toastr.error('网络请求失败，请稍后再试');
            $scope.IssueImportData.pending = false;
        });

    }

    $scope.updateFieldMapping = function () {
        var pKey = $scope.IssueImportData.pKey;
        var importID = $scope.IssueImportData.importID;
        var fieldMappingData = $scope.IssueImportData.fieldMappingData.join('-');

        if(fieldMappingData.indexOf('主题') < 0 || fieldMappingData.indexOf('描述') < 0) {
            toastr.error('您需要至少对应主题和描述两个数据');
            return false;
        }
        $scope.IssueImportData.pending = true;

        projectService.updateFieldMapping(pKey, importID, fieldMappingData).then(function(data){
            if (data.code == 0) {
                $scope.IssueImportData.importStep = 2;
                $scope.IssueImportData.mappingValues = data.data.value;
                $scope.IssueImportData.mappingTargets = data.data.target;
            } else {
                toastr.warning(data.message);
            }
            $scope.IssueImportData.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectVCSData.pending = false;
        });
    }

    $scope.updateValueMapping = function () {

        var pKey = $scope.IssueImportData.pKey;
        var importID = $scope.IssueImportData.importID;
        var valueMappingData = angular.toJson($scope.IssueImportData.valueMappingData, true);

        $scope.IssueImportData.pending = true;
        projectService.updateValueMapping(pKey, importID, valueMappingData).then(function(data){
            if (data.code == 0) {
                $scope.IssueImportData.importStep = 3;
                $scope.IssueImportData.messageList.info = data.data.info;
                $scope.IssueImportData.messageList.warning = data.data.warning;
                $scope.IssueImportData.messageList.error = data.data.error;
            } else {
                toastr.warning(data.message);
            }
            $scope.IssueImportData.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectVCSData.pending = false;
        });
    }

    $scope.conductCSVImport = function() {
        var pKey = $scope.IssueImportData.pKey;
        var importID = $scope.IssueImportData.importID;

        $scope.IssueImportData.pending = true;
        projectService.conductCSVImport(pKey, importID).then(function(data){
            if (data.code == 0) {
                toastr.info(data.data.message);
                $scope.IssueImportData.importStep = 0;
                $state.go('project.issue', { 'pKey' : pKey});
            } else {
                toastr.warning(data.message);
            }
            $scope.IssueImportData.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectVCSData.pending = false;
        });
    }

    $scope.issueImportBack = function() {
        if($scope.IssueImportData.importStep > 0) {
            $scope.IssueImportData.importStep --;
        } else {
            $scope.IssueImportData.importStep = 0;
        }
        $scope.IssueImportData.csvFile = '';
        $scope.IssueImportData.csvFileName = '';
    }
}

function projectSettingWebhookCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});

    var pKey = $stateParams.pKey;
    var stringFormater = helper.stringFormater();

    // setting of webhook
    $scope.projectWebhook = {};
    $scope.projectWebhook.pending = false;
    $scope.projectWebhook.submiting = false;
    $scope.projectWebhook.bindingStep = 0;
    $scope.projectWebhook.showRadio = 0;

    $scope.projectWebhook.dataList = {};

    function initWebhookOption() {
        $scope.projectWebhook.formOption = {};
        $scope.projectWebhook.formOption.pw_key = '';
        $scope.projectWebhook.formOption.p_key = pKey;
        $scope.projectWebhook.formOption.pw_name = '';
        $scope.projectWebhook.formOption.pw_url = '';
        $scope.projectWebhook.formOption.pw_secret = '';
        $scope.projectWebhook.formOption.pw_is_active = true;
        $scope.projectWebhook.formOption.pw_push_event_project = true;
        $scope.projectWebhook.formOption.pw_push_event_issue = true;
        $scope.projectWebhook.formOption.pw_push_event_member = true;
        $scope.projectWebhook.formOption.pw_push_event_file = false;
        $scope.projectWebhook.formOption.pw_push_event_wiki = false;
        $scope.projectWebhook.formOption.pw_push_event_module = false;
        $scope.projectWebhook.formOption.pw_push_event_version = false;
        $scope.projectWebhook.formOption.pw_push_event_type = false;
        $scope.projectWebhook.formOption.pw_push_event_status = false;
    }

    $scope.cancelWebhookSettings = function () {
        initWebhookOption();
        $scope.projectWebhook.bindingStep = 0;
    }

    $scope.newWebhookSettings = function () {
        initWebhookOption();
        $scope.projectWebhook.bindingStep = 1;
        $scope.projectWebhook.showRadio = 0;
    }

    $scope.changeWebhookSettings = function (pwKey) {
        $scope.projectWebhook.bindingStep = 1;
        $scope.projectWebhook.pending = false;
        loadWebhookInfo(pwKey);
        $scope.projectWebhook.showRadio = 1;
    }

    // 展更多的webhook选项
    $scope.showMoreRadio = function() {
        $scope.projectWebhook.showRadio = 1;
    };

    $scope.saveWebhookSettings = function () {
        // validate options
        if($scope.projectWebhook.formOption.pw_name == '') {
            toastr.error('请输入 Webhook 名称');
            return false;
        } else {
            $scope.projectWebhook.formOption.pw_name = stringFormater.filterInput($scope.projectWebhook.formOption.pw_name);
        }

        if (!$scope.projectWebhook.formOption.pw_url.match(/^(https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/)) {
            toastr.error('Webhook URL 不合法');
            return false;
        }
        // save data
        $scope.projectWebhook.submiting = true;
        projectService.saveWebhookInfo($scope.projectWebhook.formOption).then(function(data) {
            if (data.code == constants.returnSuccess) {
                toastr.info('保存成功');
                $scope.cancelWebhookSettings();
                $scope.loadWebhookList();
            } else {
                toastr.warning(data.message);
            }
            $scope.projectWebhook.submiting = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectWebhook.submiting = false;
        });

    }

    $scope.loadWebhookList = function () {
        $scope.projectWebhook.pending = true;
        projectService.getWebhookList(pKey).then(function(data){
            if (data.code == constants.returnSuccess) {
                $scope.projectWebhook.dataList = data.data;

            } else {
                toastr.warning(data.message);
            }
            $scope.projectWebhook.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectWebhook.pending = false;
        });

    }

    function loadWebhookInfo (pwKey) {
        $scope.projectWebhook.pending = true;
        projectService.getWebhookInfo(pwKey).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.projectWebhook.formOption = data.data;

                $scope.projectWebhook.formOption.pw_is_active = parseInt($scope.projectWebhook.formOption.pw_is_active)  === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_project = parseInt($scope.projectWebhook.formOption.pw_push_event_project) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_issue = parseInt($scope.projectWebhook.formOption.pw_push_event_issue) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_member = parseInt($scope.projectWebhook.formOption.pw_push_event_member) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_file = parseInt($scope.projectWebhook.formOption.pw_push_event_file) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_wiki = parseInt($scope.projectWebhook.formOption.pw_push_event_wiki) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_module = parseInt($scope.projectWebhook.formOption.pw_push_event_module) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_version = parseInt($scope.projectWebhook.formOption.pw_push_event_version) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_type = parseInt($scope.projectWebhook.formOption.pw_push_event_type) === 1 ? true : false;
                $scope.projectWebhook.formOption.pw_push_event_status = parseInt($scope.projectWebhook.formOption.pw_push_event_status) === 1 ? true : false;
            } else {
                toastr.warning(data.message);
                $scope.cancelWebhookSettings();
            }
            $scope.projectWebhook.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectWebhook.pending = false;
            $scope.cancelWebhookSettings();
        });
    }

    $scope.deleteWebhookSettings = function (pwKey) {
        $scope.projectWebhook.pending = true;
        projectService.deleteWebhook(pwKey, pKey).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.loadWebhookList();
            } else {
                toastr.warning(data.message);
            }
            $scope.projectWebhook.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectWebhook.pending = false;
        });
    }

    initWebhookOption();
    $scope.loadWebhookList();
}

function projectSettingTracupbotCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});

    var pKey = $stateParams.pKey;
    var stringFormater = helper.stringFormater();

    // setting of webhook
    $scope.projectTracupbot = {};
    $scope.projectTracupbot.pending = false;
    $scope.projectTracupbot.submiting = false;
    $scope.projectTracupbot.bindingStep = 0;
    $scope.projectTracupbot.showRadio = 0;

    $scope.projectTracupbot.dataList = {};
    $scope.projectTracupbotTypeOptionData = {};

    $scope.configReader = helper.configReader();

    $scope.tracupbotTypeConfig = [
        {
            key : constants.tracupbotTypeDingding,
            label : "钉钉群机器人",
            dataOption : [
                {
                    key: "webhookURL",
                    label: "Webhook URL",
                    placeholder: "来自钉钉的 Webhook URL",
                },
            ]
        },
        {
            key : constants.tracupbotTypeSlack,
            label : "Slack Bot User",
            dataOption : [
                {
                    key: "token",
                    label: "API Token",
                    placeholder: "来自 Slack 的 Bot User Token",
                },
                {
                    key: "channel",
                    label: "Channel",
                    placeholder: "消息需要发送到的 Channel 名称，不包含 # 。",
                },
            ]
        },
    ];

    $scope.changeTracupbotType = function (selectedObject) {
        if(selectedObject) {
            $scope.selectedTracupbotType = selectedObject;
            $scope.projectTracupbot.formOption.pmr_type = selectedObject.key;
        }
    }

    function initTracupbotOption() {
        $scope.projectTracupbot.formOption = {};
        $scope.projectTracupbot.formOption.pmr_key = '';
        $scope.projectTracupbot.formOption.p_key = pKey;
        $scope.projectTracupbot.formOption.pmr_name = '';
        $scope.projectTracupbot.formOption.pmr_type = 0;
        $scope.projectTracupbot.formOption.pmr_data = {};
        $scope.projectTracupbot.formOption.pmr_is_active = true;
        $scope.projectTracupbot.formOption.pmr_push_event_project = true;
        $scope.projectTracupbot.formOption.pmr_push_event_issue = true;
        $scope.projectTracupbot.formOption.pmr_push_event_member = true;
        $scope.projectTracupbot.formOption.pmr_push_event_file = false;
        $scope.projectTracupbot.formOption.pmr_push_event_wiki = false;
        $scope.projectTracupbot.formOption.pmr_push_event_module = false;
        $scope.projectTracupbot.formOption.pmr_push_event_version = false;
        $scope.projectTracupbot.formOption.pmr_push_event_type = false;
        $scope.projectTracupbot.formOption.pmr_push_event_status = false;
    }

    $scope.cancelTracupbotSettings = function () {
        initTracupbotOption();
        $scope.projectTracupbot.bindingStep = 0;
    }

    $scope.newTracupbotSettings = function () {
        initTracupbotOption();
        $scope.projectTracupbot.bindingStep = 1;
        $scope.projectTracupbot.showRadio = 0;
    }

    $scope.changeTracupbotSettings = function (pmrKey) {
        $scope.projectTracupbot.bindingStep = 1;
        $scope.projectTracupbot.pending = false;
        loadTracupbotInfo(pmrKey);
        $scope.projectTracupbot.showRadio = 1;
    }

    // 展更多的选项
    $scope.showMoreRadio = function() {
        $scope.projectTracupbot.showRadio = 1;
    };

    $scope.saveTracupbotSettings = function () {
        // validate options
        if($scope.projectTracupbot.formOption.pmr_name == '') {
            toastr.error('请输入 Tracupbot 名称');
            return false;
        } else {
            $scope.projectTracupbot.formOption.pmr_name = stringFormater.filterInput($scope.projectTracupbot.formOption.pmr_name);
        }
        if(!$scope.projectTracupbot.formOption.pmr_type) {
            toastr.error('请选择 Tracupbot 类型');
            return false;
        }

        // composre json data
        var tmpObjectData = {};
        var tmpDataOptions = $scope.selectedTracupbotType.dataOption;

        for(dataindex in tmpDataOptions) {
            if(!$scope.projectTracupbotTypeOptionData[tmpDataOptions[dataindex].key]) {
                toastr.error(tmpDataOptions[dataindex].label + ' 不能为空');
                return false;
            } else {
                tmpObjectData[tmpDataOptions[dataindex].key] = stringFormater.filterEmoji($scope.projectTracupbotTypeOptionData[tmpDataOptions[dataindex].key]);
            }

        }

        $scope.projectTracupbot.formOption.pmr_data = angular.toJson(tmpObjectData);

        // save data
        $scope.projectTracupbot.submiting = true;
        projectService.saveTracupbotInfo($scope.projectTracupbot.formOption).then(function(data) {
            if (data.code == constants.returnSuccess) {
                toastr.info('保存成功');
                $scope.cancelTracupbotSettings();
                $scope.loadTracupbotList();
            } else {
                toastr.warning(data.message);
            }
            $scope.projectTracupbot.submiting = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectTracupbot.submiting = false;
        });

    }

    $scope.loadTracupbotList = function () {
        $scope.projectTracupbot.pending = true;
        projectService.getTracupbotList(pKey).then(function(data){
            if (data.code == constants.returnSuccess) {
                $scope.projectTracupbot.dataList = data.data;
            } else {
                toastr.warning(data.message);
            }
            $scope.projectTracupbot.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectTracupbot.pending = false;
        });

    }

    function loadTracupbotInfo (pmrKey) {
        $scope.projectTracupbot.pending = true;
        projectService.getTracupbotInfo(pmrKey).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.projectTracupbot.formOption = data.data;

                $scope.projectTracupbot.formOption.pmr_is_active = parseInt($scope.projectTracupbot.formOption.pmr_is_active)  === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_project = parseInt($scope.projectTracupbot.formOption.pmr_push_event_project) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_issue = parseInt($scope.projectTracupbot.formOption.pmr_push_event_issue) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_member = parseInt($scope.projectTracupbot.formOption.pmr_push_event_member) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_file = parseInt($scope.projectTracupbot.formOption.pmr_push_event_file) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_wiki = parseInt($scope.projectTracupbot.formOption.pmr_push_event_wiki) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_module = parseInt($scope.projectTracupbot.formOption.pmr_push_event_module) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_version = parseInt($scope.projectTracupbot.formOption.pmr_push_event_version) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_type = parseInt($scope.projectTracupbot.formOption.pmr_push_event_type) === 1 ? true : false;
                $scope.projectTracupbot.formOption.pmr_push_event_status = parseInt($scope.projectTracupbot.formOption.pmr_push_event_status) === 1 ? true : false;
                
                // setup option data
                $scope.selectedTracupbotType = $scope.configReader.read($scope.tracupbotTypeConfig, $scope.projectTracupbot.formOption.pmr_type);
                $scope.projectTracupbotTypeOptionData = angular.fromJson($scope.projectTracupbot.formOption.pmr_data);

            } else {
                toastr.warning(data.message);
                $scope.cancelTracupbotSettings();
            }
            $scope.projectTracupbot.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectTracupbot.pending = false;
            $scope.cancelTracupbotSettings();
        });
    }

    $scope.deleteTracupbotSettings = function (pmrKey) {
        $scope.projectTracupbot.pending = true;
        projectService.deleteTracupbot(pmrKey, pKey).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.loadTracupbotList();
            } else {
                toastr.warning(data.message);
            }
            $scope.projectTracupbot.pending = false;
        }, function(err) {
            toastr.error('连接超时, 请再次尝试');
            $scope.projectTracupbot.pending = false;
        });
    }

    initTracupbotOption();
    $scope.loadTracupbotList();
}

function projectSettingAdvanceCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('projectSettingCtrl', {$scope: $scope});
    var pKey = $stateParams.pKey;

    $scope.isHide = constants.globalFalse;
    $scope.isHideTitle = '回收项目';
    $scope.isDeleteTitle = '删除项目';

    $scope.UAC = {
        projectDelete: false,
        projectRecycle: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'projectSettingAdvanceCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.projectDelete = permision.checkPermision(constants.UAC.projectDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectRecycle = permision.checkPermision(constants.UAC.projectRecycle, $scope.projectConfig.current.role.privilege);
        } else {
            // do nothing
        }
    }

    // settings of project delete
    $scope.askDeleteProject = function() {
        var askTitle = '';
        var askStr = '';
        var askText = '';
        askTitle = '删除项目';
        askText = '确定要删除项目吗？项目删除后，将无法恢复。';
        askStr = '删除项目';

        sweetAlert.swal({
            title: askTitle,
            text: askText,
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: askStr,
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.deleteProject(pKey);
            }
        });
    }

    $scope.deleteProject = function(pKey) {
        projectService.deleteProject(pKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('删除成功');
                $state.go('projects');
            }
        }, function(err) {
            toastr.error('网络连接失败');
        });
    };

    $scope.askSetHide = function() {
        var askTitle = '';
        var askStr = '';
        var askText = '';
        if ($scope.isHide == constants.globalFalse) {
            askTitle = '回收项目';
            askText = '如果项目已经完成或是暂时中止，你可以先将项目回收。回收的项目可以很容易地再次激活，并且不会有数据丢失';
            askStr = '回收项目';
        } else {
            askTitle = '重新打开项目';
            askText = '重新打开项目后，您就可以正常使用该项目了';
            askStr = '重新打开项目';
        }

        sweetAlert.swal({
            title: askTitle,
            text: askText,
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: askStr,
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.updateProjectUser('isHide', pKey);
            }
        });
    }

    $scope.changeProjectOwner = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/change_owner.html',
            controller: changeProjectOwnerCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.updateProjectUser = function(field, pKey) {
        projectService.updateProjectUser(pKey, field).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            }
            else {
                toastr.info('设置成功');
                $state.go('projects');
            }
        }, function(err) {
            toastr.error('网络连接失败');
        });
    };
}

function projectSettingCtrl($scope, $rootScope, $http, projectService, constants, sweetAlert, $stateParams, $uibModal, $controller, toastr, $state, $filter, VCSService, cacheService, helper) {
    $controller('baseCtrl', {$scope: $scope});
    //$controller('projectSettingMenuCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;

    $scope.userInfo = $rootScope.userInfo;

    var pKey = $stateParams.pKey;

    $scope.isManager = function() {
        projectService.checkIsManager(pKey).then(function(data) {
            $scope.userInfo.isManager =  constants.globalFalse;
            if (data.code == constants.globalFalse) {
                $scope.userInfo.isManager = data.data.isManager;
                $scope.userInfo.isOwner = data.data.isOwner;

                if (!$scope.userInfo.isManager) {
                    // 如果没权限就跳转到限无权限页面
                    $state.go('permission', {'pKey' : pKey});
                }
            }
        }, function(err) {
        });
    }

    $scope.isManager();

    $scope.reSendMail = function (user) {
        projectService.reSendMail(pKey, user.key).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('重发邮件成功');
            }
        }, function(err) {
            toastr.error('网络请求失败');
        });
    };

    $scope.handleExistUser = function (bool, item) {
        $scope.checking = true;
        if (bool) {
            addUser(pKey, item.u_key, constants.userRoleDefault);
        }
        else {
            removeUser(pKey, item.u_key);
        }
        $scope.checking = false;
    };

   $scope.exitPlugin = function () {
     if(angular.element('#com_pgyer_bugcloudextension').length > 0) {
        return true;
     }else{
       return false;
     }
   }
}

function projectTypeCtrl ($scope, $rootScope, $http, $filter, constants, toastr, sweetAlert, projectService, $uibModalInstance, $stateParams, $controller, helper) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.userInfo = $rootScope.userInfo;
    var stringFormater = helper.stringFormater();
    var pKey = $stateParams.pKey;
    var typeInfo = angular.copy($scope.typeInfo);
    $scope.createTitle = typeInfo ? '编辑问题类型' : '创建问题类型';

    $scope.type = {};

    $scope.type.typeName = $scope.typeInfo ? $scope.typeInfo.pt_name : '';
    $scope.type.typeKey = $scope.typeInfo ? $scope.typeInfo.pt_key : '';
    $scope.type.template = $scope.typeInfo ? $scope.typeInfo.pt_template : '';

    $scope.selectTypeBgColor = $scope.typeInfo ? $scope.typeInfo.pt_background : constants.themeGray ;

    $scope.selectTypeBg = function(color){
        $scope.selectTypeBgColor = color;
    }

    $scope.submitting = false;
    $scope.createTypeConfirm = function() {
        $scope.submitting = true;
        if ($scope.signup_form.$valid) {
            if (/^\s*$/.test($scope.type.template)) {
                $scope.type.template = '';
            }
            projectService.createType($.param({ptName: stringFormater.filterInput($scope.type.typeName), ptColor: $scope.selectTypeBgColor, template: stringFormater.filterInput($scope.type.template), ptKey: $scope.type.typeKey, pKey: $stateParams.pKey})).then(function(data) {
                if (data.code == 0) {
                    angular.element(document.getElementById('projectSettingTypeCtrl')).scope().loadProjectTypeList();
                    toastr.info('操作成功');
                    $scope.ok();
                    projectService.refreshProjectConfig();
                } else {
                    toastr.warning(data.message);
                    $scope.submitting = false;
                }
            }, function(err) {
                toastr.error('网络请求失败');
                $scope.submitting = false;
            });

        } else {
            $scope.submitting = false;
            $scope.signup_form.submitted = true;
        }
    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function projectStatusCtrl ($scope, $rootScope, $http, $filter, constants, toastr, sweetAlert, projectService, $uibModalInstance, $stateParams, $controller, helper) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.userInfo = $rootScope.userInfo;
    var stringFormater = helper.stringFormater();
    var pKey = $stateParams.pKey;
    var statusInfo = angular.copy($scope.statusInfo);
    $scope.createTitle = statusInfo ? '编辑问题状态' : '创建问题状态';
    $scope.status = {};

    $scope.status.statusName = $scope.statusInfo ? $scope.statusInfo.label : '';
    $scope.status.statusKey = $scope.statusInfo ? $scope.statusInfo.key : '';

    $scope.styleParser = helper.styleParser();

    $scope.submitting = false;
    $scope.createStatusConfirm = function() {
        $scope.submitting = true;
        if ($scope.signup_form.$valid) {
            projectService.createStatus($.param({psName: stringFormater.filterInput($scope.status.statusName), psIcon: $scope.selectStatus.index, pKey: $stateParams.pKey, psKey: $scope.status.statusKey})).then(function(data) {
                if (data.code == 0) {
                    angular.element(document.getElementById('projectSettingStatusCtrl')).scope().loadProjectStatusList();
                    toastr.info('操作成功');
                    $scope.ok();
                } else {
                    toastr.warning(data.message);
                    $scope.submitting = false;
                }
            }, function(err) {
                toastr.error('网络请求失败');
                $scope.submitting = false;
            });

        } else {
            $scope.submitting = false;
            $scope.signup_form.submitted = true;
        }
    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.loadAllStatusIcon = function() {
        projectService.getAllStatusIcon().then(function(data) {
            $scope.allStatusIcon = data.list;
            $scope.selectStatus = $scope.statusInfo ? $scope.statusInfo : $scope.allStatusIcon[1];
        }, function(err) {
        });
    }
    $scope.loadAllStatusIcon();

    $scope.setStatusOption = function(index) {
        $scope.selectStatus = $scope.allStatusIcon[index];
    }
}

function manageRoleCtrl ($scope, $rootScope, $http, $filter, constants, helper, toastr, sweetAlert, projectService, $uibModalInstance, $stateParams, $controller) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.userInfo = $rootScope.userInfo;
    var roleInfo = angular.copy($scope.roleInfo);
    var pKey = $stateParams.pKey;

    $scope.roleName = roleInfo ? roleInfo.label : "";
    $scope.roleClass = roleInfo ? roleInfo.class : "project-dashboard-number-new";

    if (roleInfo && roleInfo.adminFlag) {
        $scope.cancel();
        return false;
    }

    $scope.configReader = helper.configReader();
    $scope.permision = helper.permision();
    var stringFormater = helper.stringFormater();

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'manageRoleCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
        } else {
            // do nothing
        }
    }

    $scope.colorArr = {
        "project-dashboard-number-new": 1,
        "project-dashboard-number-processing": 2,
        "project-dashboard-number-processed": 3,
        "project-dashboard-number-feedback": 4,
        "project-dashboard-number-reopen": 5,
        "project-dashboard-number-closed": 6,
        "project-dashboard-number-unsolved": 7,
    };

    $scope.permissionGroupConfig = {
        0 : ['成员和权限', 6, 6, false],
        6 : ['项目设置', 11, 17, false],
        17 : ['文件库', 2, 19, false],
        19 : ['Wiki', 4, 23, false],
        23 : ['问题', 11, 34, false],
    };

    $scope.permisionList = [
        ['添加成员', constants.UAC.memberAdd],
        ['修改成员角色', constants.UAC.memberChangeRole],
        ['删除成员', constants.UAC.memberRemove],

        ['添加角色', constants.UAC.roleAdd],
        ['修改角色权限', constants.UAC.roleChange],
        ['删除角色', constants.UAC.roleRemove],

        ['修改项目 名称／描述／颜色', constants.UAC.projectInfo],
        ['删除项目', constants.UAC.projectDelete],
        ['回收项目', constants.UAC.projectRecycle],
        ['管理模块', constants.UAC.projectModule],
        ['管理版本', constants.UAC.projectVersion],
        ['管理问题类型', constants.UAC.projectType],
        ['管理问题状态', constants.UAC.projectStatus],
        ['管理项目仓库设置', constants.UAC.projectRepository],
        ['导入问题', constants.UAC.projectImport],
        ['Webhook 设置', constants.UAC.projectWebhook],
        ['Tracupbot 设置', constants.UAC.projectTracupbot],

        ['上传／编辑文件', constants.UAC.fileChange],
        ['删除文件', constants.UAC.fileDelete],

        ['创建／编辑 Wiki', constants.UAC.wikiChange],
        ['删除 Wiki', constants.UAC.wikiDelete],
        ['添加／编辑 Wiki 附件', constants.UAC.wikiAttachmentChange],
        ['删除 Wiki 附件', constants.UAC.wikiAttachmentDelete],

        ['创建问题', constants.UAC.issueAdd],
        ['编辑问题 标题／描述', constants.UAC.issueUpdateText],
        ['编辑问题 指派／关注', constants.UAC.issueUpdateMember],
        ['编辑问题 结束时间', constants.UAC.issueUpdateDeadline],
        ['编辑问题 类型／模块／状态／优先级／版本', constants.UAC.issueUpdateOption],
        ['关闭问题', constants.UAC.issueClose],
        ['删除问题', constants.UAC.issueDelete],
        ['添加／编辑问题附件', constants.UAC.issueAttachementChange],
        ['删除问题附件', constants.UAC.issueAttachmentDelete],
        ['导出问题', constants.UAC.issueExport],
        ['移出问题／复制问题', constants.UAC.issueMoveOut],
    ];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.changeColor = function (color) {
        $scope.roleClass = color;
    }

    // 全选
    $scope.checkAllPermision = function (index) {
        index = parseInt(index);
        var group = $scope.permissionGroupConfig[index];
        for(var pIndex in $scope.permisionList) {
            if (pIndex >= index && pIndex < group[2]) {
                $scope.permisionCodes[$scope.permisionList[pIndex][1]] = group[3];
            }
        }
    }

    // 被全选
    $scope.checkTheAllBox = function (index) {
        index = parseInt(index);
        var group = $scope.permissionGroupConfig[index];
        var permisionArr = $scope.permisionList.slice(index, group[2]);
        var flag = true;
        for (var pIndex in permisionArr) {
            if ($scope.permisionCodes[permisionArr[pIndex][1]] == false) {
                flag = false;
            }
        }
        $scope.permissionGroupConfig[index][3] = flag;
    }

    // set model permision codes
    $scope.permisionCodes = [];
    function setPermisionCodes() {
        if(!$scope.projectConfig) {
            return false;
        }
        var role = roleInfo ? roleInfo.privilege : getTestPrivilege();
        for(var permisionIndex in $scope.permisionList) {
            $scope.permisionCodes[$scope.permisionList[permisionIndex][1]] = $scope.permision.checkPermision($scope.permisionList[permisionIndex][1], role);
        }

        for (var index in $scope.permissionGroupConfig) {
            $scope.checkTheAllBox(index);
        }
    }

    setPermisionCodes();

    // 默认测试人员权限
    function getTestPrivilege () {
        var testerPrivilege = $scope.permision.getPrivilege([
            constants.UAC.memberAdd,
            constants.UAC.projectModule,
            constants.UAC.projectVersion,
            constants.UAC.projectType,
            constants.UAC.projectStatus,
            constants.UAC.issueAdd,
            constants.UAC.issueUpdateText,
            constants.UAC.issueUpdateMember,
            constants.UAC.issueUpdateOption,
            constants.UAC.issueClose,
            constants.UAC.issueDelete,
            constants.UAC.issueAttachementChange,
            constants.UAC.issueAttachmentDelete,
            constants.UAC.issueExport,
            constants.UAC.fileChange,
            constants.UAC.wikiChange,
            constants.UAC.wikiAttachmentChange,
        ]);
        return testerPrivilege;
    }

    // 编辑、创建角色
    $scope.createRoleConfirm = function () {
        // parse permision segment
        var privilegeSegments = [];
        for(var permisionIndex in $scope.permisionCodes) {
            var segmentNumber = Math.floor(permisionIndex / 0x20);
            var segmentOffset = permisionIndex % 0x20;

            if(!privilegeSegments[segmentNumber]) {
                privilegeSegments[segmentNumber] = 0;
            }

            if($scope.permisionCodes[permisionIndex]) {
                privilegeSegments[segmentNumber] |= 1 << segmentOffset;
            } else {
                // do nothing
            }
        }

        // save permision
        if (!$scope.roleName) {
            toastr.warning("用户名有误");
            return false;
        }
        $scope.submitting = true;
        var roleKey = roleInfo ? roleInfo.key : "";
        projectService.saveRole(pKey, stringFormater.filterInput($scope.roleName), $scope.colorArr[$scope.roleClass], privilegeSegments, roleKey).then(
            function(data) {
                $scope.submitting = false;
                if (data.code == constants.returnSuccess) {
                    if (roleInfo) {
                        toastr.info('角色编辑成功');
                    } else {
                        toastr.info("角色添加成功");
                    }
                    projectService.refreshProjectConfig();
                    $scope.cancel();
                } else {
                    toastr.warning(data.message);
                }
            }, function(err) {
                $scope.submitting = false;
                toastr.error('网络错误，请稍后再次尝试');
            }
        )
    }

}

function createProjectCtrl ($scope, $state, toastr, constants, $uibModalInstance, projectService, $controller, helper) {
    $controller('baseCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.project = {};
    $scope.selectBgColor = constants.themeBlue;
    $scope.project.background = constants.themeBlue;
    var stringFormater = helper.stringFormater();
    
    $scope.create = function () {

    $scope.project.name = stringFormater.filterInput($scope.project.name);
    $scope.project.description = stringFormater.filterInput($scope.project.description);

    $scope.submitting = true;
    if ($scope.signup_form.$valid) {

        projectService.create($.param($scope.project)).then(function(data) {
            $scope.submitting = false;
            if (data.code == constants.returnSuccess) {
                toastr.info('创建成功');
                $uibModalInstance.close();
                $state.go('project.dashboard', {'pKey' : data.data});
            } else {
            $scope.signup_form.submitted = false;
                toastr.warning(data.message);
            }
        }, function(err) {
            $scope.submitting = false;
            $scope.signup_form.submitted = false;
            toastr.error('网络连接失败');
        });
       } else {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
       }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectBg = function(color) {
        $scope.selectBgColor = color;
        $scope.project.background = color;
    }

}

function inviteUserCtrl ($scope, $rootScope, $http, $filter, constants, helper, toastr, sweetAlert, projectService, $uibModalInstance, $stateParams, $controller) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.projectUserList = {};
    $scope.userInfo = $rootScope.userInfo;
    var pKey = $stateParams.pKey;

    $scope.configReader = helper.configReader();
    $scope.listPending = false;

    $scope.assignee = {};

    // user access control setting
    $scope.UAC = {
        memberAdd: false,
    };

    $scope.inviteCheck = false;
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'inviteUserCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.memberAdd = permision.checkPermision(constants.UAC.memberAdd, $scope.projectConfig.current.role.privilege);
        } else {
            // do nothing
        }
    }

    $scope.isCollapsed = true;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.emailFilter = function(val) {
        return $http.get('/api/user/emailFilter', {
            params: {
                email: val,
                sensor: false
            }
            }).then(function(response){
                return response.data.data.list.map(function(item){
                return item;
            });
        });
    };

    $scope.allPartners = [];
    $scope.listedProjects = [];
    $scope.listedPartners = [];
    $scope.listedUsers = [];
    $scope.finalInvited = [];
    $scope.inputList = [];
    $scope.inviteEmails = {text: ""};

    $scope.getAllPartners = function () {
        $scope.listPending = true;
        projectService.getAllPartners().then(function(data) {
            var data = data.data;
            $scope.allPartners = data;
            parsePartnerInfo();
        }, function(err) {
        });
    }
    $scope.getAllPartners();

    function parsePartnerInfo() {
        var tmpProjectList = $scope.configReader.filter($scope.allPartners, 'key', pKey, true);
        for(var projectIndex in tmpProjectList) {
            var tmpProject = angular.copy(tmpProjectList[projectIndex]);
            tmpProject.checked = false;
            tmpProject.userList = filterUserList(tmpProject.userList);
            if (tmpProject.userList.length > 0) {
                $scope.listedProjects.push(tmpProject);
            }
        }

        var tmpUserList = [];
        for(projectIndex in $scope.listedProjects) {
             tmpUserList = tmpUserList.concat($scope.listedProjects[projectIndex].userList);
        }

        $scope.listedPartners = filterUserList(tmpUserList);
        $scope.listPending = false;
    }

    function updateInputList() {
        var final = $scope.finalInvited;
        var inputList = [];
        for (var i in final) {
            if (final[i].userList) {
                // 处理项目
                inputList.push(final[i].label + "<" + final[i].userList.length + "人>");
            } else if (final[i].inputFlag) {
                // 处理输入
                inputList.push(final[i].email);
            }else {
                // 处理已有成员
                inputList.push(final[i].label + "<" + final[i].email + ">");
            }
        }
        $scope.inviteEmails.text = inputList.join('; ');
        if ($scope.inviteEmails.text != "") {
            $scope.inviteEmails.text += "; ";
        }
    }

    function addCheckToFinal(list) {
        var checkArr = $scope.configReader.filter(list, 'checked', true);
        var outArr = $scope.configReader.filter(list, 'checked', false);
        for (var i in $scope.finalInvited) {
            if ($scope.configReader.filter(outArr, 'key', $scope.finalInvited[i].key).length > 0) {
                $scope.finalInvited.splice(i, 1);
            }
        }
        $scope.finalInvited = filterUserList($scope.finalInvited.concat(checkArr));
    }

    function addInputToFinal() {
        var arr = $scope.inviteEmails.text.split(';');
        clearListCheck();
        $scope.finalInvited = [];
        for (var i in arr) {
            var matchRes = arr[i].match(/([\w\.\-]+@[\w\-]+\.[\w\.\-]*[\w\-]+)\>?$/);
            if (matchRes) {
                var email = matchRes[1];
                var data = {
                    email: email,
                    key: email,
                    label: email,
                    inputFlag: 1
                };
                var flag = 0;
                for (var index in $scope.listedPartners) {
                    // projectLabel = $scope.listedPartners[index].label + "<" + $scope.listedPartners[index].email + ">";
                    if ($scope.listedPartners[index].email == email) {
                        $scope.listedPartners[index].checked = true;
                        $scope.finalInvited.push($scope.listedPartners[index]);
                        flag = 1;
                    }
                }
                if (!flag) {
                    $scope.finalInvited.push(data);
                }
            } else {
                for (var index in $scope.listedProjects) {
                    projectLabel = $scope.listedProjects[index].label + "<" + $scope.listedProjects[index].userList.length + "人>";
                    if (projectLabel == arr[i].replace(" ", "")) {
                        $scope.listedProjects[index].checked = true;
                        $scope.finalInvited.push($scope.listedProjects[index]);
                    }
                }
            }
        }
    }

    function clearListCheck() {
        for (var index in $scope.listedPartners) {
            $scope.listedPartners[index].checked = false;
        }
        for (var index in $scope.listedProjects) {
            $scope.listedProjects[index].checked = false;
        }
    }

    function updatePartnerList() {
        var final = $scope.configReader.filter($scope.finalInvited, 'inputFlag', undefined);
        for (var i in $scope.listedPartners) {
            if ($scope.configReader.filter(final, 'email', $scope.listedPartners[i].email).length > 0) {
                $scope.listedPartners[i].checked = true;
            } else {
                $scope.listedPartners[i].checked = false;
            }
        }
    }

    $scope.checkChange = function(type) {
        $scope.emailError = false;
        $scope.emailErrorText = "";
        if(type == 'partner') {
            // add partner list to final
            // updateProjectList
            // updateInputList

            addCheckToFinal($scope.listedPartners);
            updateInputList();
        } else if(type == 'project') {
            // add project list to final
            // updatePartnerList
            // updateInputList

            addCheckToFinal($scope.listedProjects);
            updateInputList();

        } else if(type == 'invite') {
            // add input list to final
            // updateInputList
            // updatePartnerList
            // updateProjectList

            addInputToFinal();
            updatePartnerList();

        }
    }

    function filterUserList(input) {

        var output = [];

        for(var userIndex in input) {
            if($scope.configReader.filter(output, 'key', input[userIndex].key).length == 0 && $scope.configReader.filter($scope.configReader.filter($scope.projectConfig.users, 'deleteFlag', 0), 'key', input[userIndex].key).length == 0) {
                var tmpUser = angular.copy(input[userIndex]);
                tmpUser.checked = false;
                output.push(tmpUser);
            }
        }

        return output;
    }

    $scope.showMyUsers = function () {
        $scope.isCollapsed = !$scope.isCollapsed;
        if (!$scope.isCollapsed) {
            projectService.getAllProjectUserList(pKey).then(function(data) {
                $scope.allProjectUserList = data.data.list;
            }, function(err) {
            });
        }
    }
    $scope.showMyUsers();

    $scope.otheProject = {};
    $scope.showAdvanceSettingProjects = function () {
            projectService.getOtherProjectsList(pKey).then(function(data) {
                $scope.otherProjects = data.data.list;
            }, function(err) {
            });
    }
    $scope.showAdvanceSettingProjects();

    var addUser = function (pKey, emails, callback) {

        $scope.submitting = true;

        projectService.addUser(pKey, emails).then(function(data) {

            $scope.submitting = false;

            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            }
            else {
                toastr.info(data.data.invitedNumber + '位用户被邀请成功');
                projectService.refreshProjectConfig();
            }
            callback(data);
        }, function(err) {
            $scope.submitting = false;
            toastr.error('网络连接失败');
        });
    };

    $scope.setProjectUser = function (){
        $scope.projectUsers = $scope.assignee.assignees;
        addUser(pKey, $scope.projectUsers.u_key, constants.userRoleDefault);
        $scope.assignee.assignees = "";

        angular.forEach($scope.allProjectUserList, function(data,index,array){
                if($scope.projectUsers.u_key == data.u_key) {  $scope.allProjectUserList[index]['is_checked'] = true; }
        });
    }

    $scope.importStatus = true;
    $scope.setOtherProject = function () {
        $scope.importStatus = false;
        var otherPkey = $scope.otheProject.project;
        projectService.importProjectUser(pKey, otherPkey.p_key).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            }else {
                toastr.info('导入成功');
                projectService.refreshProjectConfig();
            }
            $scope.importStatus = true;
        }, function(err) {
            $scope.importStatus = true;
            toastr.error('网络连接失败');
        });
    }

    $scope.reSendMail = function (user) {
        projectService.reSendMail(user.p_key, user.pu_key).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('重发邮件成功');
            }
        }, function(err) {
            toastr.error('网络连接失败');
        });
    };

    $scope.inviteBtnText = "复制链接";
    $scope.emailError = false;
    $scope.emailErrorText = "";

    // 发送邀请
    $scope.sendInvite = function () {
        if ($scope.finalInvited.length < 1) {
            toastr.warning('请填写邀请人');
            $scope.emailError = true;
            $scope.emailErrorText = '请填写邀请人';
            return false;
        }

        var emails = getFinalEmails();

        addUser(pKey, emails, function(){
            if (data.code == constants.returnSuccess) {
                $scope.cancel();
            } else {
                $scope.emailError = true;
                $scope.emailErrorText = data.message;
            }
        });
    };

    function getFinalEmails() {
        var list = [];
        var final = $scope.finalInvited;
        for (var i in final) {
            if (final[i].userList) {
                for (var j in final[i].userList) {
                    list.push(final[i].userList[j].email);
                }
            } else {
                list.push(final[i].email);
            }
        }
        return list.join(";");
    }

    // 获取邀请链接
    $scope.getInviteLink = function () {
        projectService.getInviteLink(pKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
                $scope.inviteLinkError = true;
                $scope.inviteLinkErrorText = data.message;
            } else {
                $scope.inviteLink = data.data.link;
            }
        }, function(err) {
            toastr.error('网络错误, 请稍后重试');
        });
    }

    // 复制邀请链接
    function copyLinkSuccess(e) {
        toastr.info('链接复制成功');
        e.trigger.innerText = "已复制";
    }
    function copyLinkError() {
        toastr.error('链接复制失败, 请手动复制');
    }

    if(!window.clipboardSetter) {
        window.clipboardSetter = new Clipboard("#copyLink");
        window.clipboardSetter.on('success', copyLinkSuccess);
        window.clipboardSetter.on('error', copyLinkError);
    }

    // nav 切换
    $scope.linkShow = false;
    $scope.emailShow = true;
    var getLinkOnce = true;
    $scope.changeInviteNav = function (flag) {
        if (flag) {
            $scope.emailShow = true;
            $scope.linkShow = false;
        } else {
            if (getLinkOnce) {
                $scope.getInviteLink();
                getLinkOnce = false;
            }
            $scope.emailShow = false;
            $scope.linkShow = true;
        }
    }

    // 邮箱邀请
    $scope.hadUser = true;
    $scope.searchValue = {text:""};
    $scope.changeLeadMember = function () {
        $scope.searchValue = {text: ""};
        $scope.hadUser = !$scope.hadUser;
        if (!$scope.hadUser) {
            angular.element(".moveUserNav").animate({left:"-189px"}, 200);
        } else {
            angular.element(".moveUserNav").animate({left:"0px"}, 200);
        }
        angular.element(".leadUserContent").css({scrollTop: 0});
    }
 }


function manageUserCtrl ($scope, $rootScope, $http, $filter, constants, helper, toastr, sweetAlert, projectService, $uibModalInstance, $stateParams, $controller) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.projectUserList = {};
    $scope.userInfo = $rootScope.userInfo;
    var pKey = $stateParams.pKey;
    
    $scope.configReader = helper.configReader();

    $scope.assignee = {};

    $scope.UAC = {
        memberChangeRole: false,
        memberRemove: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'manageUserCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.memberChangeRole = permision.checkPermision(constants.UAC.memberChangeRole, $scope.projectConfig.current.role.privilege);
            $scope.UAC.memberRemove = permision.checkPermision(constants.UAC.memberRemove, $scope.projectConfig.current.role.privilege);
        } else {
            // do nothing
        }
    }

    $scope.isCollapsed = true;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    var removeUser = function (pKey, uKey) {
        projectService.removeUser(pKey, uKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            }
            else {
                toastr.info('移除用户成功');
                projectService.refreshProjectConfig();
            }
        }, function(err) {
            toastr.error('网络连接失败');
        });
    };

    $scope.importStatus = true;

    $scope.changeRole = function (uKey, prKey) {
        projectService.changeUserRole(pKey, uKey, prKey).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('更改角色成功');
                projectService.refreshProjectConfig();
            }
        }, function(err) {
            toastr.error('网络连接失败');
        });
    };

    $scope.reSendMail = function (user) {
        projectService.reSendMail(user.p_key, user.pu_key).then(function(data) {
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
            } else {
                toastr.info('重发邮件成功');
            }
        }, function(err) {
            toastr.error('网络连接失败');
        });
    };

    /*
     * 删除用户
     */
    $scope.askUserDelete = function(user) {
        sweetAlert.swal({
            title: '确定要删除用户"' +  user.label + '"吗?',
            text: "用户删除后，将无法恢复",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.removeuser(user);
            }
        });
    }

    $scope.removeuser = function(user) {
        removeUser(pKey, user.key);
    };

    $scope.handleExistUser = function (bool, item) {
        $scope.checking = true;
        if (bool) {
            addUser(pKey, item.u_key, constants.userRoleDefault);
        }
        else {
            removeUser(pKey, item.u_key);
        }
        $scope.checking = false;
    };
}

function createProjectCtrl ($scope, $state, toastr, constants, $uibModalInstance, projectService, $controller, helper) {
    $controller('baseCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.project = {};
    $scope.selectBgColor = constants.themeBlue;
    $scope.project.background = constants.themeBlue;
    var stringFormater = helper.stringFormater();
    
    $scope.create = function () {

    $scope.project.name = stringFormater.filterInput($scope.project.name);
    $scope.project.description = stringFormater.filterInput($scope.project.description);

    $scope.submitting = true;
    if ($scope.signup_form.$valid) {

        projectService.create($.param($scope.project)).then(function(data) {
            $scope.submitting = false;
            if (data.code == constants.returnSuccess) {
                toastr.info('创建成功');
                $uibModalInstance.close();
                $state.go('project.dashboard', {'pKey' : data.data});
            }
            else {
            $scope.signup_form.submitted = false;
                toastr.warning(data.message);
            }
        }, function(err) {
            $scope.submitting = false;
            $scope.signup_form.submitted = false;
            toastr.error('网络错误，请稍后再次尝试');
        });
       } else {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
       }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectBg = function(color) {
        $scope.selectBgColor = color;
        $scope.project.background = color;
    }

}

function dashboardProjectCtrl($scope, $http, $state, $rootScope, constants, $filter, projectService, $stateParams, $uibModal, $sce, toastr, $controller, issueService, dashboardService, helper, statisticsService, sweetAlert) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.userListLoaded = false;
    $scope.projectUserList = {};
    $scope.projectInfo = {};
    $scope.issueCount = {};
    $scope.issueList = {};
    $scope.projectActivityList = {};
    $scope.issuesLoaded = false;
    $scope.activitiesLoaded = false;
    $scope.showAllUser1 = false;
    $scope.showAllUser2 = false;
    $scope.showAllUser3 = false;
    $scope.showAllUser4 = false;
    $scope.projectList = [];
    $scope.issue = {};
    $scope.isMove = false;

    var issueFilterHelper = helper.issueFilter();
    var chartDataComposer = helper.chartDataComposer();
    var highChartBuilder = helper.highChartDataBuilder();
    var stringFormater = helper.stringFormater();
    var Stat = helper.Stat();
    var configReader = helper.configReader();

    var pKey = $stateParams.pKey;
    $scope.stateParams = $stateParams;

    $scope.configFilter = configReader.filter;

    $scope.currentUserInfo = $rootScope.userInfo;
    $scope.projectShow = {
        'name' : 0,
        'description':0
    };

    // set space usage
    $scope.spaceUsage = {};
    $scope.spaceUsage.percent = 0;
    $scope.spaceUsage.description = '正在估算...';

    $scope.projectConfig = $rootScope.projectConfig;
    $scope.isLoaded = false;

    $scope.init = function () {
        _getData();
    };

    // user access control setting
    $scope.UAC = {
        manageUser: false,
        inviteUser: false,
        projectInfo: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'dashboardProjectCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.manageUser = permision.checkPermisionGroup([constants.UAC.memberChangeRole, constants.UAC.memberRemove], 'or', $scope.projectConfig.current.role.privilege);
            $scope.UAC.inviteUser = permision.checkPermisionGroup([constants.UAC.memberAdd], 'or', $scope.projectConfig.current.role.privilege);
            $scope.UAC.projectInfo = permision.checkPermision(constants.UAC.projectInfo, $scope.projectConfig.current.role.privilege);
        } else {
            // do nothing
        }
    }




    function _getData() {
        projectService.getProjectConfig($stateParams.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectConfig = $rootScope.projectConfig;
                _loadStatData();
            } else {
                toastr.warning('获取项目设置失败 请刷新重试');
            }
        }, function(err) {
            toastr.error('网络故障 请刷新重试');
        });
    };

    function _loadStatData() {
        statisticsService.loadStatData($scope.pKey).then(function(data) {
            $scope.statisticsData = data;
            $scope.newIssueStatData = chartDataComposer.generateChartData(chartDataComposer.generateDateLabels(30), ['问题数量'], Stat.map(Stat.sum, $scope.statisticsData.typeCount), true);

            $scope.singleDataLineChartOptions = chartDataComposer.chartOptionBuilder(true, 'single', false, 'top', false, Stat.max(Stat.map(Stat.sum, $scope.statisticsData.typeCount)));

            $scope.newIssueTrendency = highChartBuilder.generateHighChartData(highChartBuilder.generateDateLabels(30), ['问题数量'], Stat.map(Stat.sum, $scope.statisticsData.typeCount), Stat.max(Stat.map(Stat.sum, $scope.statisticsData.typeCount)), 'areaspline', true);
            $scope.newIssueTrendency.options.legend.enabled = false;
            $scope.newIssueTrendency.options.chart.height = 200;
            $scope.newIssueTrendency.options.xAxis.crosshair = {color : $scope.newIssueTrendency.options.colors[0], width : 1};

            $scope.isLoaded = true;
        });
    };

    $scope.getProjectInfo = function() {
        var pKey = $stateParams.pKey;
        projectService.getProjectInfo(pKey).then(function(data) {
            $scope.projectInfo = data.data.pInfo;
            $scope.projectSpaceQuota = data.data.spaceQuota;
            $scope.projectInfo.p_name_old = $scope.projectInfo.p_name;
            $scope.projectInfo.p_description_old = $scope.projectInfo.p_description;

            if($scope.projectSpaceQuota.quota == -1) {
                $scope.spaceUsage.percent = 0;
                $scope.spaceUsage.description = stringFormater.readableSize($scope.projectSpaceQuota.usage) + ' / ∞';
            } else {
                $scope.spaceUsage.percent = Math.ceil($scope.projectSpaceQuota.usage / $scope.projectSpaceQuota.quota * 100);
                $scope.spaceUsage.description = stringFormater.readableSize($scope.projectSpaceQuota.usage) + ' / ' + stringFormater.readableSize($scope.projectSpaceQuota.quota);
            }
        }, function(err) {
        });
    }

    $scope.getIssueList = function() {
        $scope.issue.pKey = $stateParams.pKey;
        projectService.getIssueListAll($.param($scope.issue)).then(function(data) {
            $scope.issueList = data;
            $scope.issuesLoaded = true;
        }, function(err) {
        });
    }

    $scope.loadProjectActivityList = function() {
        var perpage = 5;
        projectService.getProjectActivityList(pKey, perpage).then(function(data) {
            $scope.projectActivityList = data;
            $scope.activitiesLoaded = true;
        }, function(err) {
        });
    }

    $scope.editProjectName = function() {
        $scope.projectShow.name = !$scope.projectShow.name;
    }

    $scope.updateProjectTitle = function(field, data) {
        if (field == 'name' && data.length > 20) {
            $scope.projectInfo.p_name = $scope.projectInfo.p_name_old;
            return '项目名称不能超过20个字符';
        } else if (field == 'description' && data.length > 200) {
            $scope.projectInfo.p_description = $scope.projectInfo.p_description_old;
            return '项目描述不能超过200个字符';
        } else {
            projectService.update(pKey, field, data).then(function(data) {
                if (data.code !== constants.returnSuccess) {
                    toastr.warning(data.message);
                } else {
                    toastr.info('修改成功');
                    // 修改项目名称全刷
                    if (field == 'name') {
                        $state.reload();
                    } else {
                        angular.element(document.getElementById('dashboardProjectCtrl')).scope().loadProjectActivityList();
                        angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                        angular.element(document.getElementById('userCtrl')).scope().loadNotification();
                    }
                }
            }, function(err) {
                toastr.error('网络连接失败');
            });
        }
    }

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.manageUser = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/manage_user_modal.html',
            controller: manageUserCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.inviteUser = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/project/invite_user_modal.html',
            controller: inviteUserCtrl,
            windowClass: "hmodal-success",
            backdrop: 'static',
            keyboard: false
        });
    };

   $scope.successMsg = function(){
       toastr.info('操作成功');
   }


    $scope.hoverIn = function(event, ukey, pkey) {
        $scope.userInfo = {};
        $scope.userInfo.uKey = ukey;
        $scope.userInfo.pKey = pkey;

        dashboardService.getUserInfo($.param($scope.userInfo)).then(function(data) {
            $scope.showUser = data;
            var ot = angular.element(event.target).offset().top;
            var ol = angular.element(event.target).offset().left;

            var  $ul = angular.element('#userinfo');

            var g = $(document).scrollTop();

            $ul.css({
                display: 'block',
                position: 'fixed',
                top: ot-g-33 + 'px',
                left: ol - 225 + 'px',
                "z-index": 99999999
            });
        }, function(err) {

        });

    }

    $scope.hoverOut = function(event, val) {
        $scope.isshowuser = false;
        var  $ul = angular.element('#userinfo');
        $ul.css({
            display: 'none'
        });
    }

    $scope.goIssue = function (val) {
        var tmpStatusFilter = [val];
        issueFilterHelper.remove(pKey);
        issueFilterHelper.set(pKey, 'status', tmpStatusFilter);
        $state.go('project.issue', { 'pKey' : pKey, 'page': 1});
        window.scrollTo(0, 0);
    }


    /*
     * 退出项目
     *
    */
    $scope.askQuitProject = function(pKey) {
        var title = '确定要退出项目吗?';

        sweetAlert.swal({
            title: title,
            text: "退出后，无法恢复",
//            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "退出",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/project/quitProject',
                    data: $.param({
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data) {
                    data = data.data
                    if (data.code == 0) {
                        var message = '你已退出项目';
                        toastr.info('你已退出项目');
                        projectService.refreshProjectConfig();
                        $state.go('projects');
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(data) {
                    toastr.error('网络请求失败');
                });
            }
        });
    }

}



function changeProjectOwnerCtrl ($scope, $rootScope, $http, $filter, constants, toastr, sweetAlert, projectService, settingService, $uibModalInstance, $stateParams, $controller) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.projectUserList = {};
    $scope.userInfo = $rootScope.userInfo;
    var pKey = $stateParams.pKey;

    $scope.userList = {};
    $scope.currentOwner = {};
    $scope.pending = true;

    $scope.isManager = function() {
        projectService.checkIsManager(pKey).then(function(data) {
            $scope.userInfo.isManager =  constants.globalFalse;
            if (data.code == constants.globalFalse) {
                $scope.userInfo.isManager = data.data.isManager;
                $scope.userInfo.isOwner = data.data.isOwner;
                if(!$scope.userInfo.isOwner) {
                    toastr.error('您不是项目所有者不能进行此操作');
                    $scope.cancel();
                }
            }
        }, function(err) {
        });
    }

    $scope.isManager();


    $scope.loadProjectConfig = function() {
        projectService.getProjectConfig($stateParams.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.userList = angular.copy(data.data.users);

                for(var index in $scope.userList) {
                    if($scope.userList[index].role == constants.userRoleOwner) {
                        $scope.currentOwner = $scope.userList[index];
                    }
                }

                $scope.pending = false;
            } else {
                toastr.error('获取项目设置失败 请刷新重试');
            }
        }, function(err) {
            toastr.error('网络故障 请刷新重试');
       });
    };


    $scope.loadProjectConfig();



    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.setCurrentProjectOwner = function(owner) {
        $scope.currentOwner = owner;
    }

    $scope.changeOwner = function() {
        if(!$scope.currentOwner.label) {
            toastr.error('请选择新项目所有者');
            return false;
        }
        sweetAlert.swal({
            title: '确定要设置用户"' + $scope.currentOwner.label + '"为本项目的所有者吗?',
            text: "设置后不可撤销，点击确定继续您的操作。",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "确定",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                changeProjectOwner();
            }
        });
    }

    function changeProjectOwner() {
         settingService.changeProjectOwner($stateParams.pKey, $scope.currentOwner.key).then(function(data) {
            if(data.code == constants.returnSuccess) {
                toastr.info('变更项目所有者成功');
                projectService.refreshProjectConfig();
            } else {
                toastr.warning(data.message);
            }
            $scope.cancel();
        }, function(err) {
            toastr.error('网络故障 请再次尝试');
            $scope.cancel();
       });

    }

}

//

angular
    .module('bugs')
    .controller('fileCtrl', fileCtrl);

function fileCtrl($scope, $http, $state, $rootScope, constants, $stateParams, $route, fileService, sweetAlert, $uibModal, $controller, helper, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.list = {};
    $scope.newFolderSubmitting = false;
    $scope.renameFolderKey = '';
    $scope.renameFileKey = '';

    $scope.stringFormater = helper.stringFormater();
    $scope.configReader = helper.configReader();

    // user access control setting
    $scope.UAC = {
        fileChange: false,
        fileDelete: false,
    };
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'fileCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.fileChange = permision.checkPermision(constants.UAC.fileChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.fileDelete = permision.checkPermision(constants.UAC.fileDelete, $scope.projectConfig.current.role.privilege);

        } else {
            // do nothing
        }
    }

    $scope.init = function() {
        $scope.userInfo = $rootScope.userInfo;

        $scope.isCreatingFolder = false;

        var pKey = $stateParams.pKey;
        $scope.pKey = pKey;
        $rootScope.pKey = pKey;
        $scope.isManager(pKey);

        var folderKey = $stateParams.folderKey;
        $scope.folderKey = folderKey;

        $scope.isshow = true;
        fileService.listFilesInFolder(pKey, folderKey).success(function(data) {
            $scope.list = data.data;
            $scope.isshow = false;
        }, function(err) {
        $scope.isshow = false;
       });
    }

    $scope.getFileTypeIcon = function(mime, regex) {
        if (mime.match('word')) {
            return 'fa-file-word-o';
        } else if (mime.match('spreadsheet')) {
            return 'fa-file-excel-o';
        } else if (mime.match('presentation')) {
            return 'fa-file-powerpoint-o';
        } else if (mime.match('^image')) {
            return 'fa-file-image-o';
        } else if (mime.match('^video')) {
            return 'fa-file-movie-o';
        } else if (mime.match('^audio')) {
            return 'fa-file-audio-o';
        } else if (mime.match('^text')) {
            return 'fa-file-code-o';
        } else if (mime.match('application/pdf')) {
            return 'fa-file-pdf-o';
        } else if (mime.match('application/zip')) {
            return 'fa-file-archive-o';
        }

        return 'fa-file-o';
    }

    $rootScope.initFileList = $scope.init;

    /*
     * 文件夹创建
     */
    $scope.createFolder = function() {
        $scope.newFolderName = '';
        $scope.isCreatingFolder = true;
    }

    $scope.createFolderCancel = function() {
        $scope.isCreatingFolder = false;
    }

    $scope.createFolderConfirm = function() {
        $scope.newFolderName = $scope.stringFormater.filterInput($scope.newFolderName);
        if (!$scope.newFolderName || $scope.newFolderName == '') {
            toastr.warning("请输入文件夹的名称");
            return false;
        }

        if ($scope.newFolderName.length > 20) {
            toastr.warning("文件夹的名称不可超过20个字");
            return false;
        }

        if ($scope.newFolderSubmitting == true) {
            return false;
        }

        $scope.newFolderSubmitting = true;

        $http({
            method: 'post',
            url: '/api/file/createFolder',
            data: $.param({
                newFolderName: $scope.newFolderName,
                pKey: $stateParams.pKey,
                parentFolderKey: $scope.folderKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            $scope.newFolderSubmitting = false;
            data = data.data
            if (data.code == 0) {
                $scope.init();
                toastr.info($scope.newFolderName, "文件夹创建成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
            toastr.error('网络请求失败');
            $scope.newFolderSubmitting = false;
        });
    }

    /*
     * 文件夹删除
     */
    $scope.askFolderDelete = function(folderKey, folderName) {
        sweetAlert.swal({
            title: '确定要删除文件夹"' +  folderName + '"吗?',
            text: "文件夹删除后，文件夹内的所有文件及子文件夹也会一起删除",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/file/removeFolder',
                    data: $.param({
                        folderKey: folderKey,
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data) {
                    data = data.data
                    if (data.code == 0) {
                        $scope.init();
                        toastr.info(folderName, '文件夹已经删除');
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(data) {
                    toastr.error("网络请求失败");
                });
            }
        });
    }

    /*
     * 文件夹重命名
     */
    $scope.renameFolder = function(ffKey, dirName) {
        $scope.oldDirname = dirName;
        $scope.renameFolderKey = ffKey;
    }

    $scope.renameFolderCancel = function(index) {
        $scope.list.dirList[index].ff_name = $scope.oldDirname;
        $scope.renameFolderKey = '';
    }

    $scope.renameFolderConfirm = function(newFolderName) {
        var ffKey = $scope.renameFolderKey;

        newFolderName = $scope.stringFormater.filterInput(newFolderName);

        if (!newFolderName || newFolderName == '') {
            toastr.warning("请输入文件夹的名称");
            return false;
        }

        if (newFolderName.length > 20) {
            toastr.warning("文件夹的名称不可超过20个字");
            return false;
        }

        if ($scope.renameFolderSubmitting == true) {
            return false;
        }

        $scope.renameFolderSubmitting = true;

        $http({
            method: 'post',
            url: '/api/file/renameFolder',
            data: $.param({
                newFolderName: newFolderName,
                pKey: $stateParams.pKey,
                folderKey: ffKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            $scope.renameFolderKey = '';
            $scope.renameFolderSubmitting = false;
            data = data.data
            if (data.code == 0) {
                $scope.init();
                toastr.info(newFolderName, "文件夹重命名成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            $scope.renameFolderCancel();
            toastr.error("网络请求失败");
            $scope.renameFolderSubmitting = false;
        });
    }

    $scope.fileUploadFinished = function(targetName, name) {
        $http({
            method: 'post',
            url: '/api/file/uploadFileFinish',
            data: $.param({
                fileKey: targetName,
                fileName: name,
                pKey: $stateParams.pKey,
                folderKey: $scope.folderKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            data = data.data
            if (data.code == 0) {
                $scope.init();
                toastr.info(name, "文件上传成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            toastr.error("网络请求失败");
        });
    }

    /*
     * 文件删除
     */
    $scope.askFileDelete = function(fileKey, fileName) {
        sweetAlert.swal({
            title: '确定要删除文件"' +  fileName + '"吗?',
            text: "文件删除后，将无法恢复",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/file/removeFile',
                    data: $.param({
                        fileKey: fileKey,
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                }).then(function(data) {
                    data = data.data
                    if (data.code == 0) {
                        $scope.init();
                        toastr.info(fileName, '文件已经删除');
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(data) {
                    toastr.error("网络请求失败");
                });
            }
        });
    }

    /*
     * 文件重命名
     */
    $scope.renameFile = function(item) {
        $scope.oldFilename = item.f_file_name.split('.')[0];
        $scope.oldFilenameExt = item.f_file_name.split('.')[1];
        $scope.renameFileKey = item.f_key;
        item.f_file_name = $scope.oldFilename;
    }

    $scope.renameFileCancel = function(index) {
        $scope.list.fileList[index].f_file_name = $scope.oldFilename + '.' + $scope.oldFilenameExt;
        $scope.renameFileKey = '';
    }

    $scope.renameFileConfirm = function(newFileName) {
        var fKey = $scope.renameFileKey;
        newFileName = newFileName + '.' + $scope.oldFilenameExt;

        newFileName = $scope.stringFormater.filterInput(newFileName);

        if (!newFileName || newFileName == '') {
            toastr.warning('请输入文件的名称');
            return false;
        }

        if ($scope.renameFileSubmitting == true) {
            return false;
        }

        $scope.renameFileSubmitting = true;

        $http({
            method: 'post',
            url: '/api/file/renameFile',
            data: $.param({
                newFileName: newFileName,
                pKey: $stateParams.pKey,
                fileKey: fKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            $scope.renameFileKey = '';
            $scope.renameFileSubmitting = false;
            data = data.data
            if (data.code == 0) {
                $scope.init();
                toastr.info(newFileName, "文件重命名成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            $scope.renameFileCancel();
            toastr.error("网络请求失败");
            $scope.renameFileSubmitting = false;
        });
    }

    // 文件移动
    $scope.askFileMove = function(fKey, fFileName) {
        $rootScope.willMoveFileKey = fKey;
        $rootScope.willMoveFileName = fFileName;

        var modalInstance = $uibModal.open({
            templateUrl: 'views/file/file_finder.html',
            size: 'lg',
            controller: FileFinderModalInstanceCtrl,
            backdrop: 'static',
            keyboard: false
        });
    }
}

function FileFinderModalInstanceCtrl($scope, $uibModalInstance, $rootScope, $http, $controller, toastr) {

    $controller('baseCtrl', {$scope : $scope});
    $scope.ok = function () {
        $uibModalInstance.close();

        if (!$scope.selectedFolderKey) {
            $scope.selectedFolderKey = '1';
        }

        $http({
            method: 'post',
            url: '/api/file/moveFile',
            data: $.param({
                folderKey: $scope.selectedFolderKey,
                fileKey: $rootScope.willMoveFileKey,
                pKey: $rootScope.pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(data) {
            data = data.data
            if (data.code == 0) {
                $rootScope.initFileList();
                toastr.info("文件移动成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            $rootScope.willMoveFileKey = '';
            $scope.selectedFolderKey = '';
            toastr.error("移动文件失败");
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectedCallback = function(folderKey) {
        $scope.selectedFolderKey = folderKey;
    };
};

angular
.module('bugs')
.controller('fileviewCtrl', fileviewCtrl)

function fileviewCtrl($scope, $http, $state, $rootScope, constants, $stateParams, $route, fileService, sweetAlert, $uibModal, $controller, issueService, $sce, $interval, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.fileInfo = {};
    $scope.fileShow = false;

    $scope.init = function() {
        $scope.userInfo = $rootScope.userInfo;

        $scope.fKey = $stateParams.fKey;
        $scope.type = $stateParams.type;

        fileService.getFileInfo($scope.fKey, $scope.type).success(function(data) {
                $scope.fileShow = true;
                $scope.fileInfo = data.data.fileInfo;
                $scope.fileInfo.f_fileview = $scope.getFileTypeIcon($scope.fileInfo.f_mime_type, $scope.fileInfo.f_file_key);
        }, function(err) {
        });
    }

    var file_view = $scope.constants.imageQiniu+'/file/view/files/f_file_key';
    $scope.getFileTypeIcon = function(mime, file_key) {
        if (mime.match('word')) {
            $scope.fileType = 'word';
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?odconv/pdf');
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?yifangyun_preview/v2');
        } else if (mime.match('spreadsheet')) {
            $scope.fileType = 'word';
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?odconv/pdf');
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?yifangyun_preview/v2');
        } else if (mime.match('excel')) {
            $scope.fileType = 'word';
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?odconv/pdf');
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?yifangyun_preview/v2');
        } else if (mime.match('presentation')) {
            $scope.fileType = 'word';
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?odconv/pdf');
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?yifangyun_preview/v2');
        } else if (mime.match('powerpoint')) {
            $scope.fileType = 'word';
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?odconv/pdf');
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?yifangyun_preview/v2');
        } else if (mime.match('^image')) {
            $scope.fileType = 'img';
            return '/file/view/files/' + file_key;
        } else if (mime.match('^video')) {
            $scope.fileType = 'video';
            file_key = file_key.split('.')[0] + '_thumb.mp4';
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key));
        } else if (mime.match('^audio')) {
            $scope.fileType = 'video';
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key));
        } else if (mime.match('^text')) {
            $scope.fileType = 'word';
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?odconv/pdf');
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key) + '?md2html/0/css/aHR0cHM6Ly9vYXA0MGRic3UucW5zc2wuY29tL2Nsb3VkL3N0eWxlcy9zdHlsZS43YzMxMGMxYi5jc3M=');
            //return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key));
        } else if (mime.match('application/pdf')) {
            $scope.fileType = 'word';
            return $sce.trustAsResourceUrl(file_view.replace('f_file_key', file_key));
        } else if (mime.match('application/zip')) {
            return '/file/view/files/' + file_key;
        }
        return '/file/view/files/' + file_key;
    }

    $scope.renameFileName = function(newFileName) {
      if (!newFileName || newFileName == '') {
            toastr.warning('请输入文件名称');
            return false;
      }
      if($scope.type == 'issue') {
        issueService.renameFile($.param({newFileName: newFileName,fileKey: $scope.fKey})).then(function(data) {
            data = data.data
            if (data.code == 0) {
                $scope.fileInfo.f_file_name = newFileName;
                $scope.fileInfo.shortFileName = data.data.shortFileName;
                toastr.info("操作成功");
            } else {
                toastr.warning('操作失败');
            }
        }, function(err) {
            toastr.error("网络请求失败");
        });
      } else {
        $http({
            method: 'post',
            url: '/api/file/renameFile',
            data: $.param({
                newFileName: newFileName,
                pKey: $scope.fileInfo.p_key,
                fileKey: $scope.fKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
                $scope.fileInfo.f_file_name = newFileName;
                $scope.fileInfo.shortFileName = data.data.shortFileName;
                toastr.info("操作成功");
            } else {
                toastr.warning('操作失败');

            }
        }, function(data) {
            toastr.error("网络请求失败");
        });
     }
   }

    $scope.askFileDelete = function() {
        sweetAlert.swal({
            title: '确定要删除文件"' + $scope.fileInfo.f_file_name + '"吗?',
            text: "文件删除后，将无法恢复",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                if($scope.type == 'issue') {
                    $http({
                        method: 'post',
                        url: '/api/issues/deleteIssueFile',
                        data: $.param({
                            iaKey: $scope.fKey,
                            pKey: $scope.fileInfo.p_key
                        }),
                        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                    })
                    .then(function(data) {
                        data = data.data
                        if (data.code == 0) {
                            toastr.info('文件"' + $scope.fileInfo.f_file_name + '"已经删除');
                            $state.go('project.issue_view', {'pKey' : $scope.fileInfo.p_key , 'iNo' : $scope.fileInfo.i_no });
                        } else {
                            toastr.warning('操作失败');
                        }
                    }, function(data) {
                        toastr.error("网络请求失败");
                    });
                } else {
                    $http({
                        method: 'post',
                        url: '/api/file/removeFile',
                        data: $.param({
                            fileKey: $scope.fKey,
                            pKey: $scope.fileInfo.p_key,
                        }),
                        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                    })
                    .then(function(data) {
                        data = data.data
                        if (data.code == 0) {
                            toastr.info('文件"' + $scope.fileInfo.f_file_name + '"已经删除');
                            $state.go('project.file', {'pKey' : $scope.fileInfo.p_key });
                        } else {
                            toastr.warning('操作失败');
                        }
                    }, function(data) {
                        toastr.error("网络请求失败");
                    });
                }
            }
        });
     }

    // 文件移动
    $scope.askFileMove = function() {
        $rootScope.willMoveFileKey = $scope.fKey;
        $rootScope.pKey = $scope.fileInfo.p_key;
        $rootScope.willMoveFileName = $scope.fileInfo.f_file_name;

        var modalInstance = $uibModal.open({
            templateUrl: 'views/file/file_finder.html',
            size: 'lg',
            controller: FileFinderModalInstanceCtrl,
            backdrop: 'static',
            keyboard: false
        });
    }

    var clientH = document.body.clientHeight;
    clientH = clientH-76;
    $rootScope.initFileList = $scope.init;

    var viewpdf = angular.element('#viewpdf');
    viewpdf.css({
        width:'100%',
        'text-align':'center',
        height: clientH +'px',
    });

    $scope.setHeight = false;
    $scope.suofangB = 100;
    var i = 0;
    var  oWdth;
    $scope.ImageSuofang = function (args) {
        if(($scope.suofangB<=10 && !args) || ($scope.suofangB>=500 && args)){
            return false;
        }
        i = i+1;
        var oImg = document.getElementById("oImg");
        if(i<=1) { oWdth = $scope.oImgWidth }
        if (args) {
            oImg.width = oImg.width * 1.1;
//            oImg.height = oImg.height * 1.1;
        } else {
            oImg.width = oImg.width / 1.1;
//            oImg.height = oImg.height / 1.1;
        }

        var clientH = document.body.clientHeight;
        clientH = clientH-70;

        var oImgSet = angular.element('#oImg');
        if(oImg.height<clientH){
            $scope.setHeight = true;
        }

        $scope.suofangB = Math.ceil(oImg.width/oWdth * 100);
    }

    var current = 0;
    $scope.reaptImg = function () {
        var oImg = document.getElementById("oImg");
        current = (current+90)%360;
        oImg.style.transform = 'rotate('+current+'deg)';
    }

    $scope.oImgWidth = 0;
    $scope.loadImg = function () {
        var promise = $interval(function(){
                var oImg = document.getElementById("oImg");
                $scope.oImgWidth = oImg.width;
                if ($scope.oImgWidth > 0) {
                   $interval.cancel(promise);
                   if($scope.oImgWidth > $('body').width() ) {
                      oImg.width = $('body').width();
                      oImg.width = oImg.width / 1.1;
                      $scope.suofangB = parseInt(oImg.width/$scope.oImgWidth * 100);
                   }

                    var clientH = document.body.clientHeight;
                    clientH = clientH - 70;

                    var oImgSet = angular.element('#oImg');
                    if(oImg.height < clientH){
                        $scope.setHeight = true;
                    }
                }
        },10);
    }

   $scope.loadZipi = function () {

       var clientH = document.body.clientHeight;
       clientH = clientH-70;

       var oImgSet = angular.element('#showZip');
            oImgSet.css({
                'margin-top': (clientH - 350)/2
            });
   }
    $scope.isLoadiframe = false;
    $scope.$watch('fileType', function(newValue, oldValue) {
        if(newValue == 'word') {
            $scope.isLoadiframe = false;
            var iframe = document.createElement("iframe");
            iframe.src = $scope.fileInfo.f_fileview;
            iframe.style.height = '100%';
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.backgroundColor = '#FFF';
            if (iframe.attachEvent){
                iframe.attachEvent("onload", function(){
                    $scope.isLoadiframe = true;
                });
            } else {
                iframe.onload = function(){
                    $scope.isLoadiframe = true;
                };
            }
            viewpdf.html(iframe);
        }
    }, true);

    $scope.$watch('isLoadiframe', function(newValue, oldValue) {
        if(newValue == true) {
            $scope.isLoadiframe = true;
            var isLoadiframe = angular.element('#isLoadiframe');
            isLoadiframe.css({
                display:'none'
            });
        }
    }, true);

    $scope.videoError = function () {
        sweetAlert.swal({
            title: '预览不可用',
            text: '文件 ' + $scope.fileInfo.f_file_name + ' 暂时不能预览，请下载查看。',
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "我知道了",
        },
        function(isConfirm) {
            if (isConfirm) {
                if($scope.fileInfo.i_no) {
                    $state.go('project.issue_view', {pKey : $scope.fileInfo.p_key, iNo : $scope.fileInfo.i_no});
                } else {
                    $state.go('project.file', {pKey : $scope.fileInfo.p_key});
                }
            }
        });
    }

 }

function FileFinderModalInstanceCtrl($scope, $uibModalInstance, $rootScope, $http, toastr, $controller) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.ok = function () {
        $uibModalInstance.close();

        if (!$scope.selectedFolderKey) {
            $scope.selectedFolderKey = '1';
        }

        $http({
            method: 'post',
            url: '/api/file/moveFile',
            data: $.param({
                folderKey: $scope.selectedFolderKey,
                fileKey: $rootScope.willMoveFileKey,
                pKey: $rootScope.pKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
                $rootScope.initFileList();
                toastr.info("操作成功");
            } else {
                toastr.warning("操作失败");
            }
        }, function(data) {
            $rootScope.willMoveFileKey = '';
            $scope.selectedFolderKey = '';
            toastr.error('移动文件失败');
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectedCallback = function(folderKey) {
        $scope.selectedFolderKey = folderKey;
    };
};

angular
    .module('bugs')
    .controller('issuesCtrl', issuesCtrl)
    .controller('viewIssueCtrl', viewIssueCtrl)
    .controller('addIssuesCtrl', addIssuesCtrl)
    .controller('noteCtrl', noteCtrl)
    .controller('activityCtrl', activityCtrl)
    .controller('trendCtrl', trendCtrl)
    .controller('duplicateIssueCtrl', duplicateIssueCtrl)
    .controller('moveIssueCtrl', moveIssueCtrl)
    .controller('addFilterCtrl', addFilterCtrl)
    .controller('exportIssueCtrl', exportIssueCtrl)

function issuesCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, constants, issueService, projectService, $stateParams,  $element, sweetAlert, $uibModal, $controller, $timeout, helper, toastr)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});

    $scope.constants = constants;
    $scope.issuesList = {}; // fileterd issue list in a page
    $scope.datePickerValue = {}; // use for display date range
    $scope.pKey = $stateParams.pKey;
    $scope.issue = {};
    $scope.issueListPending = true;
    $scope.userInfo = {};
    $scope.filterStatus = false;
    $scope.filterList = [];
    $scope.filterName = '筛选';
    $scope.filterSaveStatus = false;
    $scope.sideINo = false;

    var issueFilterHelper = helper.issueFilter();
    var configReader = helper.configReader();
    var groupFn = helper.groupFn();

    $scope.userGroupFn = groupFn.roleGroupFn;

    // set project config
    $scope.projectConfig = {};
    // set issue filter
    $scope.filter = issueFilterHelper.getEmptyFilter();
    $scope.filterData = {};
    // set pagenation
    $scope.conf = {
        currentPage: $stateParams.page ? $stateParams.page : 1,
        totalItems: 0,
        itemsPerPage: 20,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function() {
        }
    };

    // set sort option
    $scope.sortOption = [
        {key: 'i_no', label: '问题编号'},
        {key: 'i_priority', label: '优先级'},
        {key: 'i_status', label: '问题状态'},
        {key: 'i_created', label: '创建时间'},
        {key: 'i_updated', label: '更新时间'},
        {key: 'i_finished', label: '结束时间'},
    ];

    // set page option
    $scope.pageOption = [20, 30, 50, 100];

    // user access control setting
    $scope.UAC = {
        issueExport: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'issuesCtrl');
    function onProjectConfigChange(newValue, oldValue) {

        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
            $scope.userInfo = $rootScope.userInfo;

            // calculate UAC
            $scope.UAC.issueExport = permision.checkPermision(constants.UAC.issueExport, $scope.projectConfig.current.role.privilege);
            
            if($state.current.name == 'project.issue') {
                // add empty option to version & module list
                $scope.moduleList = angular.copy($scope.projectConfig.module);
                $scope.moduleList.unshift({key: 'unassign', label: '未指定', icon: 'ban', class:''});
                $scope.versionList = angular.copy($scope.projectConfig.version);
                $scope.versionList.unshift({key: 'unassign', label: '未指定', icon: 'ban', class:''});

                // custom settings
                $scope.projectConfig.assignee = [];
                for (var tmpIndex in $scope.projectConfig.users) {
                    $scope.projectConfig.assignee.push($scope.projectConfig.users[tmpIndex]);
                }

                $scope.projectConfig.assignee.unshift({key: 'unassign', label: '未指派', icon: 'ban', class:''});

                if($scope.projectConfig.current.key) {
                    $scope.projectConfig.assignee.unshift({key: $scope.projectConfig.current.key, label: '我', icon: 'user-circle-o', class:''});
                }

                // get filter data from cookie
                var cachedFilter = issueFilterHelper.get($scope.pKey);
                if(cachedFilter) {
                    cachedFilter = convertToFilter(cachedFilter);
                    $scope.filter.type = cachedFilter.type ? cachedFilter.type : [];
                    $scope.filter.status = cachedFilter.status ? cachedFilter.status : [];
                    $scope.filter.priority = cachedFilter.priority ? cachedFilter.priority : [];
                    $scope.filter.author = cachedFilter.author ? cachedFilter.author : [];
                    $scope.filter.assignee = cachedFilter.assignee ? cachedFilter.assignee : [];
                    $scope.filter.version = cachedFilter.version ? cachedFilter.version : [];
                    $scope.filter.module = cachedFilter.module ? cachedFilter.module : [];
                    $scope.filter.createdDate = cachedFilter.createdDate ? cachedFilter.createdDate : {startDate: null, endDate: null};
                    $scope.filter.updatedDate = cachedFilter.updatedDate ? cachedFilter.updatedDate : {startDate: null, endDate: null};
                    $scope.filter.endedDate = cachedFilter.endedDate ? cachedFilter.endedDate : {startDate: null, endDate: null};
                    $scope.filter.keywords = cachedFilter.keywords ? cachedFilter.keywords : '';
                    $scope.filter.sortIndex = cachedFilter.sortIndex ? cachedFilter.sortIndex : 0;
                    $scope.filter.sortType = cachedFilter.sortType ? cachedFilter.sortType : 'desc';
                    $scope.filter.perpage = cachedFilter.perpage ? cachedFilter.perpage : 20;
                } else {
                    cachedFilter = issueFilterHelper.getEmptyFilter();
                    cachedFilter = convertToFilter(cachedFilter);
                }

                // loadIssueList api is relay on loadProjectConfig to parse key to value
                $scope.filterData = convertToFilterData($scope.filter);
                $scope.getStatusCount();
                $scope.loadIssueList(true);
                $scope.loadFilterList();

            }

        } else {
            // do nothing
        }
    }

    // set filters
    $scope.applyFilter = function (filterKey) {

        if(filterKey) {
            // set filter as saved filter
            for(var index in $scope.filterList) {
                if($scope.filterList[index].pf_key == filterKey) {
                    $scope.filter = convertToFilter(angular.fromJson($scope.filterList[index].pf_filter));
                    break;
                }
            }
        }

        $scope.filterData = convertToFilterData($scope.filter);
        // save filter info
        issueFilterHelper.set($scope.pKey, false, $scope.filterData);
        // laod issue list
        window.scrollTo(0, 0);
        $scope.loadIssueList();
    }

    // load issue list
    $scope.loadIssueList = function (pageingLoad, noLoading) {

        if(!pageingLoad && $stateParams.page > 1) {
            $state.go('project.issue', {'pKey' : $scope.pKey, 'page' : 1});
            return true;
        }

        if(!noLoading) {
            $scope.issueListPending = true;
        }

        // check filter list is empty or not
        $scope.filterStatus = checkFilterClear($scope.filter);

        // parse filter to query
        var query = angular.copy($scope.filterData);
        query.pKey = $stateParams.pKey;
        query.page = $stateParams.page ? $stateParams.page : 1;
        query.perpage = $scope.filter.perpage;
        query.sortName = $scope.sortOption[$scope.filter.sortIndex].key;
        query.sort = $scope.filter.sortType;
        query.keywords = $scope.filter.keywords;
        
        // load list
        issueService.getList($.param(query)).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.issuesList = data.data.list;
                $scope.conf.totalItems = data.data.issueCount;
                $scope.issueListPending = false;
            } else {
                toastr.warning("获取问题列表失败 请刷新重试");
            }
         }, function(err) {
               $scope.issueListPending = false;
               toastr.error("网络故障 请刷新重试");
        });
    }

    // convert filter to filter data
    function convertToFilterData(filter) {
        var filterData = {};

        // type
        filterData.types = [];
        for(var index in filter.type) {
            var tmpObject = configReader.read($scope.projectConfig.type, filter.type[index].key);
            if(tmpObject) {
                filterData.types.push(tmpObject.key);
            }
        }

        // status
        filterData.status = [];
        for(index in filter.status) {
            var tmpKey = $scope.projectConfig.status[index].key;
            tmpObject = configReader.read($scope.projectConfig.status, tmpKey);
            if(tmpObject && filter.status[index]) {
                filterData.status.push(tmpObject.key);
            }
        }

        // priority
        filterData.prioritys = [];
        for(index in filter.priority) {
            tmpKey = $scope.projectConfig.priority[index].key;
            tmpObject = configReader.read($scope.projectConfig.priority, tmpKey);
            if(tmpObject && filter.priority[index]) {
                filterData.prioritys.push(tmpObject.key);
            }
        }

        // author
        filterData.authors = [];
        for(index in filter.author) {
            tmpObject = configReader.read($scope.projectConfig.users, filter.author[index].key);
            if(tmpObject) {
                filterData.authors.push(tmpObject.key);
            }
        }

        // assignee
        filterData.users = [];
        for(index in filter.assignee) {
            tmpObject = configReader.read($scope.projectConfig.assignee, filter.assignee[index].key);
            if(tmpObject) {
                filterData.users.push(tmpObject.key);
            }
        }

        // version
        filterData.versions = [];
        for(index in filter.version) {
            //tmpObject = configReader.read($scope.projectConfig.version, filter.version[index].key);
            tmpObject = configReader.read($scope.versionList, filter.version[index].key);
            if(tmpObject) {
                filterData.versions.push(tmpObject.key);
            }
        }

        // module
        filterData.modules = [];
        for(index in filter.module) {
            //tmpObject = configReader.read($scope.projectConfig.module, filter.module[index].key);
            tmpObject = configReader.read($scope.moduleList, filter.module[index].key);
            if(tmpObject) {
                filterData.modules.push(tmpObject.key);
            }
        }

        // createdDate updatedDate endedDate
        filterData.dateFilter = {
            createdDate: getDateFromDateRangePicker(filter.createdDate),
            updatedDate: getDateFromDateRangePicker(filter.updatedDate),
            endedDate: getDateFromDateRangePicker(filter.endedDate),
        };

        filterData.keywords = filter.keywords;
        filterData.sortIndex = filter.sortIndex;
        filterData.sortType = filter.sortType;
        filterData.perpage = filter.perpage;

        return filterData;
    }

    // convert filter data to filter
    function convertToFilter(filterData) {
        var filter = {};

        // type
        filter.type = [];
        for(var index in filterData.types) {
            var tmpObject = configReader.read($scope.projectConfig.type, filterData.types[index]);
            if(tmpObject) {
                filter.type.push(tmpObject);
            }
        }

        // status
        filter.status = [];
        for(index in $scope.projectConfig.status) {
            filter.status[index] = false;
            for(var subIndex in filterData.status) {
                if($scope.projectConfig.status[index].key == filterData.status[subIndex]) {
                    filter.status[index] = true;
                    break;
                }
            }
        }

        // priority
        filter.priority = [];
        for(index in $scope.projectConfig.priority) {
            filter.priority[index] = false;
            for(var subIndex in filterData.prioritys) {
                if($scope.projectConfig.priority[index].key == filterData.prioritys[subIndex]) {
                    filter.priority[index] = true;
                    break;
                }
            }
        }

        // author
        filter.author = [];
        for(index in filterData.authors) {
            tmpObject = configReader.read($scope.projectConfig.users, filterData.authors[index]);
            if(tmpObject) {
                filter.author.push(tmpObject);
            }
        }

        // assignee
        filter.assignee = [];
        for(index in filterData.users) {
            tmpObject = configReader.read($scope.projectConfig.assignee, filterData.users[index]);
            if(tmpObject) {
                filter.assignee.push(tmpObject);
            }
        }

        // version
        filter.version = [];
        for(index in filterData.versions) {
            //tmpObject = configReader.read($scope.projectConfig.version, filterData.versions[index]);
            tmpObject = configReader.read($scope.versionList, filterData.versions[index]);
            if(tmpObject) {
                filter.version.push(tmpObject);
            }
        }

        // module
        filter.module = [];
        for(index in filterData.modules) {
            //tmpObject = configReader.read($scope.projectConfig.module, filterData.modules[index]);
            tmpObject = configReader.read($scope.moduleList, filterData.modules[index]);
            if(tmpObject) {
                filter.module.push(tmpObject);
            }
        } 

        if(!filterData.dateFilter) {
            filterData.dateFilter = {
                createdDate: {},
                updatedDate: {},
                endedDate: {},
            }
        }
        // createdDate updatedDate endedDate
        filter.createdDate = getDateFromDateRangePicker(filterData.dateFilter.createdDate);
        filter.updatedDate = getDateFromDateRangePicker(filterData.dateFilter.updatedDate);
        filter.endedDate = getDateFromDateRangePicker(filterData.dateFilter.endedDate);

        filter.keywords = filterData.keywords;
        filter.sortIndex = filterData.sortIndex;
        filter.sortType = filterData.sortType;
        filter.perpage = filterData.perpage;

        return filter;
    }



    // get key list array from filterArray for checkbox
    function getKeysFromCheckBox(filterArray, configArray) {
        var returnArray = [];
        for (var key in filterArray) {
            if(filterArray[key]) {
                returnArray.push(configArray[key].key);
            }
        }
        return returnArray;
    }

    // get date range from Date Range Picker
    function getDateFromDateRangePicker(dateRangeObject) {
        var returnArray = {};
        if(dateRangeObject.startDate) {
            returnArray.startDate = new Date(dateRangeObject.startDate.toString()).dateFormate();
        }

        if(dateRangeObject.endDate) {
            returnArray.endDate = new Date(dateRangeObject.endDate.toString()).dateFormate();
        }

        return returnArray;
    }

    // check filter equal or not
    function checkFilterEqual(filter1, filter2) {

        var compareObject1 = angular.copy(filter1);
        var compareObject2 = angular.copy(filter2);

        compareObject1.status = getKeysFromCheckBox(compareObject1.status, $scope.projectConfig.status);
        compareObject2.status = getKeysFromCheckBox(compareObject2.status, $scope.projectConfig.status);

        compareObject1.priority = getKeysFromCheckBox(compareObject1.priority, $scope.projectConfig.priority);
        compareObject2.priority = getKeysFromCheckBox(compareObject2.priority, $scope.projectConfig.priority);

        compareObject1.sortIndex = 0;
        compareObject2.sortIndex = 0;

        compareObject1.sortType = 'asc';
        compareObject2.sortType = 'asc';
        
        compareObject1.perpage = 20;
        compareObject2.perpage = 20;

        if(angular.toJson(compareObject1) == angular.toJson(compareObject2)) {
            return true;
        } else {
            return false;
        }
    }

    // check filter clear or not
    function checkFilterClear(filterArray) {

        $scope.filterSaveStatus = false;
        if( filterArray.type.length
        || getKeysFromCheckBox(filterArray.status, $scope.projectConfig.status).length
        || getKeysFromCheckBox(filterArray.priority, $scope.projectConfig.priority).length
        || filterArray.author.length
        || filterArray.assignee.length
        || filterArray.module.length
        || filterArray.version.length
        || filterArray.createdDate.startDate
        || filterArray.createdDate.endDate
        || filterArray.updatedDate.startDate
        || filterArray.updatedDate.endDate
        || filterArray.endedDate.startDate
        || filterArray.endedDate.endDate
        || filterArray.keywords.length
        /*|| filterArray.sortIndex
        || !(filterArray.sortType != 'asc')*/ ) {
            $scope.filterName = '未保存的筛选';
            for(var index in $scope.filterList) {
                if(checkFilterEqual(convertToFilter(angular.fromJson($scope.filterList[index]['pf_filter'])), filterArray)) {
                    $scope.filterName = $scope.filterList[index]['pf_name'];
                    $scope.filterSaveStatus = true;
                    return true;
                }
            }
            return true;
        } else {
            $scope.filterName = '筛选';
            return false;
        }
    }

    // clear filter options
    $scope.clearFilter = function (field) {

        var emptyFilter = issueFilterHelper.getEmptyFilter();

        if(field) {
            $scope.filter[field] = angular.copy(emptyFilter[field]);
        } else {
            $scope.filter = angular.copy(emptyFilter);
        }

        $scope.applyFilter();

        return true;
    }

    // delete user filter group
    $scope.deleteFilter = function(key, e) {
        e.stopPropagation();
        $(e.target).parent().parent().remove();
        issueService.deleteIssueFilter(key).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.loadFilterList();
            }
        }, function(err) { });
    }

    // open add filer popup
    $scope.saveFilter = function () {
         var modalInstance = $uibModal.open({
             templateUrl: 'views/issue/addFilter.html',
             size: 'md',
             controller: addFilterCtrl,
             scope:$scope,
             backdrop: 'static',
             keyboard: false
         });
    }

    // open export popup
    $scope.exportIssue = function () {
         var modalInstance = $uibModal.open({
             templateUrl: 'views/issue/exportIssue.html',
             size: 'md',
             controller: exportIssueCtrl,
             scope:$scope,
             backdrop: 'static',
             keyboard: false
         });
    }

    $scope.loadFilterList = function () {
        issueService.getIssueFilterList($scope.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.filterList = data.data;
                $scope.filterStatus = checkFilterClear($scope.filter);
            }
        }, function(err) { });
    }

    // set per page number
    $scope.setPageOption = function(option) {
        $scope.filter.perpage = option;
        $scope.conf.itemsPerPage = option;
        issueFilterHelper.set($scope.pKey, 'perpage', $scope.filter.perpage);
        $scope.applyFilter();
    }

    // set Sort Option
    $scope.setSortOption = function (index) {

        var currentIndex = $scope.filter.sortIndex;

        if(index == currentIndex) {
            $scope.filter.sortType = $scope.filter.sortType != 'asc' ? 'asc' : 'desc';
        } else {
            $scope.filter.sortType = 'desc';
            $scope.filter.sortIndex = index;
        }

        $scope.applyFilter();
    }

    $scope.getStatusCount = function () {
        issueService.getStatusCount($scope.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.issueCount = data.data;
            } else {
                toastr.warning("获取问题列表统计信息失败 请刷新重试");
            }
        }, function(err) {
            toastr.error("网络故障 请刷新重试");
        });
    };

    $scope.dateRangePickerOptions = {
        locale: {
            applyClass: 'btn-green',
            applyLabel: "确定",
            fromLabel: "From",
            format: "YYYY-MM-DD",
            toLabel: "至",
            separator: ' 至 ',
            cancelLabel: '取消',
            customRangeLabel: '自定义时间',
            daysOfWeek:[ '日', '一', '二', '三', '四', '五', '六'],
            monthNames:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月',]
        },
        ranges: {
            '今天': [moment().subtract(0, 'days'), moment()],
            '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近7天': [moment().subtract(6, 'days'), moment()],
            '最近一个月': [moment().subtract(29, 'days'), moment()],
            //'最近三个月': [moment().subtract(3, 'months'), moment()],
            '最近一年': [moment().subtract(1, 'year'), moment()]
        }
    };


    $scope.$watch('filter.createdDate', function(newDate, oldDate) {
        if(newDate) {} else { return false;};
        if(newDate.startDate && newDate.endDate) {
            var startDate = new Date(newDate.startDate.toString()).dateFormate();
            var endDate = new Date(newDate.endDate.toString()).dateFormate();
            var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
            var result = startDate.match(reg);

            if (result == null) {
                $scope.datePickerValue.createdDate = '选择开始时间';
            } else {
                $scope.datePickerValue.createdDate = startDate + ' 至 ' + endDate;
            }

            if(oldDate) {} else { return false;};
            if(oldDate.startDate && oldDate.endDate) {
                if(newDate.startDate.toString() == oldDate.startDate.toString() && newDate.endDate.toString() == oldDate.endDate.toString()) {
                    // do nothing
                } else {
                    $scope.applyFilter();
                }
            } else {
                $scope.applyFilter();
            }
        } else {
            $scope.datePickerValue.createdDate = '选择开始时间';
        }

    }, false);

    $scope.$watch('filter.updatedDate', function(newDate, oldDate) {
        if(newDate) {} else { return false;};
        if(newDate.startDate && newDate.endDate) {
            var startDate = new Date(newDate.startDate.toString()).dateFormate();
            var endDate = new Date(newDate.endDate.toString()).dateFormate();
            var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
            var result = startDate.match(reg);

            if (result == null) {
                $scope.datePickerValue.updatedDate = '选择开始时间';
            } else {
                $scope.datePickerValue.updatedDate = startDate + ' 至 ' + endDate;
            }

            if(oldDate) {} else { return false;};
            if(oldDate.startDate && oldDate.endDate) {
                if(newDate.startDate.toString() == oldDate.startDate.toString() && newDate.endDate.toString() == oldDate.endDate.toString()) {
                    // do nothing
                } else {
                    $scope.applyFilter();
                }
            } else {
                $scope.applyFilter();
            }

        } else {
            $scope.datePickerValue.updatedDate = '选择开始时间';
        }

    }, false);

    $scope.$watch('filter.endedDate', function(newDate, oldDate) {
        if(newDate) {} else { return false;};
        if(newDate.startDate && newDate.endDate) {
            var startDate = new Date(newDate.startDate.toString()).dateFormate();
            var endDate = new Date(newDate.endDate.toString()).dateFormate();
            var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
            var result = startDate.match(reg);

            if (result == null) {
                $scope.datePickerValue.endedDate = '选择开始时间';
            } else {
                $scope.datePickerValue.endedDate = startDate + ' 至 ' + endDate;
            }

            if(oldDate) {} else { return false;};
            if(oldDate.startDate && oldDate.endDate) {
                if(newDate.startDate.toString() == oldDate.startDate.toString() && newDate.endDate.toString() == oldDate.endDate.toString()) {
                    // do nothing
                } else {
                    $scope.applyFilter();
                }
            } else {
                $scope.applyFilter();
            }

        } else {
            $scope.datePickerValue.endedDate = '选择开始时间';
        }

    }, false);

    $scope.getConfigOption = function (type, key, value) {

        var loopArray = $scope.projectConfig[type];

        var returnValue = '';
        for (var tmpIndex in loopArray) {
            if(loopArray[tmpIndex].key == value) {
                returnValue = loopArray[tmpIndex][key];
                break;
            }
        }

        if(returnValue == '') {
            if(key == 'label') {
                if(type == 'users') {
                    returnValue = '未指派';
                } else {
                    returnValue = '未指定';
                }
            } else if (key == 'class') {
                returnValue = 'project-index-bg-notset';
            }
        }

        return returnValue;
    }

    $scope.initInfo = function (){
        //$scope.getStatusCount();
        //$scope.loadFilterList();
        //$scope.loadIssueList(true);
    };

    $scope.showhide = function () {
        var icon = $element.find('.dropdown-toggle .caret');
        var body = $element.find('.search');
        body.slideToggle(300);
        //icon.toggleClass('caret').toggleClass('caret');
    };

   $scope.contextMenuHandler = function (e) {
       if(e.success) {
           if(e.type == 'i_status' || e.type == 'p_key') {
               $scope.getStatusCount();
           }
           $scope.loadIssueList(true, true);
           $scope.successMsg();
       } else {
           toastr.warning("操作失败");
       }
   };

    $scope.successMsg = function(){
        toastr.info("操作成功");
    }

    $scope.exportIssues = function (filterType, format) {

        var filterString = '{}';
        var fomatString = 'xls';
        if(filterType == 'filter') {
            var query = angular.copy($scope.filterData);
            query.pKey = $stateParams.pKey;
            query.page = $stateParams.page ? $stateParams.page : 1;
            query.perpage = 20;
            query.sortName = $scope.sortOption[$scope.filter.sortIndex].key;
            query.sort = $scope.filter.sortType;
            query.keywords = $scope.filter.keywords;

            filterString = angular.toJson(query);
        }

        if(format == 'csv') {
            fomatString = 'csv';
        }

        var openURL = '/api/issues/exportIssues?format=' + fomatString + '&filter=' + filterString + '&pKey=' + $scope.pKey;
        var windowObject = window.open(openURL, '_blank');
        window.clientAPI.openWindow({url: openURL, closeFn: function () {windowObject.close()}});

    }

    $scope.stopPropagation = function(e) {
        e.stopPropagation();
    }

}

function addIssuesCtrl($scope, $http, $state, $rootScope, constants, $stateParams, issueService, projectService,  sweetAlert, $controller, $uibModalInstance, $q, helper, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.issue = {};
    $scope.pKey = $stateParams.pKey;
    $scope.iaKey = $stateParams.fileURI;

    // set project config
    $scope.projectConfig = {module: [], priority: [], status: [], type: [], users: [], version: []};
    $scope.projectList = [];
    $scope.issueInfo = {};
    $scope.placeholder = {};
    $scope.placeholder.version = '无';
    $scope.placeholder.module = '无';
    var configReader = helper.configReader();
    var Stat = helper.Stat();
    var groupFn = helper.groupFn();
    var stringFormater = helper.stringFormater();
    $scope.prjectGroupFn = groupFn.projectGroupFn;
    $scope.userGroupFn = groupFn.roleGroupFn;
    $scope.configFilter = configReader.filter;

    // get if sub Issue Created
    var subIssueFlag = $scope.newSubIssueParentKey;
    $scope.poupTitle = subIssueFlag ? '新建子问题' : '新建问题';

    function loadProjectConfig (pKey) {
        pKey = pKey ? pKey : $scope.pKey;

        if(!pKey) {
            return true;
        }

        $scope.currentPKey = pKey;

        projectService.getProjectConfig(pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectConfig = data.data;
                clearSelection(pKey);
            } else {
                toastr.warning("获取项目设置失败 请刷新重试");
            }
        }, function(err) {
            toastr.error("网络故障 请刷新重试");
       });
    };

    function loadProjectList() {
        projectService.getProjectList().then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectList = [];
                for ( var index in data.data) {
                    if(data.data[index].recycled == 0) {
                        $scope.projectList.push(data.data[index]);
                    }
                }
                $scope.issueInfo.project = configReader.read($scope.projectList, $scope.pKey);
            } else {
                toastr.warning("获取项目列表失败 请刷新重试");
            }
        }, function(err) {
            toastr.error("网络故障 请刷新重试");
       });
    };

    function clearSelection(pKey) {
        $scope.issueInfo.project = configReader.read($scope.projectList, pKey);
        $scope.issueInfo.type = $scope.projectConfig.type.length ? $scope.projectConfig.type[0] : {};
        $scope.issueInfo.priority = $scope.projectConfig.priority[1];
        $scope.issueInfo.version = null;
        $scope.issueInfo.module = null;
       // $scope.issueInfo.fileList = [];

        $scope.placeholder.version = $scope.projectConfig.version.length ? '请选择问题版本' : '无';
        $scope.placeholder.module = $scope.projectConfig.module.length ? '请选择问题模块' : '无';

        $scope.template = $scope.issueInfo.type.template;
        if ($scope.issueInfo.description) {
            $scope.issueInfo.description = $scope.template + $scope.issueInfo.description;
        } else {
            $scope.issueInfo.description = $scope.template;
        }
    }

    function clearAll(pKey) {
        // clearSelection(pKey);
        // $scope.issueInfo.fileList = [];
        $scope.issueInfo.fileList = [];
        $scope.issueInfo.assignee = null;
        $scope.issueInfo.follows = null;

        var descripton = angular.element('#description');
        descripton.val('');
        $('span[role="writting"]').click();

        $scope.issue.description = descripton.val();
        $scope.issueInfo.title = '';
        $scope.issueInfo.finished = '';
    }

    $scope.setCurrentProject = function (pKey) {
        loadProjectConfig(pKey);
    }

    $scope.setCurrentType = function (ptKey) {
        var typeInfo = configReader.read($scope.projectConfig.type, ptKey);
        if (typeInfo.template.length) {
            $scope.issueInfo.description = typeInfo.template + "\n" + $scope.issueInfo.description;
        }
    }

    $scope.loadDatePicker = function (pKey) {
        document.getElementById('newIssueFinished').focus();
    }

    loadProjectConfig();
    loadProjectList();

    $scope.parentIssueKey = $scope.issueInfo ? $scope.issueInfo.i_key : '';

    $scope.fileUploadFinished = function(targetName, name, size) {
        $scope.submitting = true;
        //angular.element(".ladda-button").attr("disabled","disabled");

        $http({
            method: 'post',
            url: '/api/issues/uploadIssueFileFinish',
            data: $.param({
                fileKey: targetName,
                fileName: name,
                fileSize: size,
                pKey: $scope.currentPKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
                 $scope.fileArr = {};
                 $scope.fileArr.name = name;
                 $scope.fileArr.targetName = targetName;
                 $scope.fileArr.targetName = targetName;
                 $scope.fileArr.fkey = data.data.key;
                 $scope.fileArr.shortFileName = data.data.shortFileName;
                 $scope.issueInfo.fileList = $scope.issueInfo.fileList ? $scope.issueInfo.fileList : [];
                 $scope.issueInfo.fileList.push($scope.fileArr);
                 $scope.submitting = false;
            } else {
                toastr.warning(data.message);
                $scope.submitting = false;
            }
        }, function(data) {
            toastr.error("网络请求失败");
            $scope.submitting = false;
        });
    };

    // 新建问题文件库上传
    $scope.fileHubUpload = function (fKeyList) {
        $scope.submitting = true;
        issueService.uploadIssueFileFromFileHub('', '', fKeyList).then(
            function (data) {
                if(data.code != constants.returnSuccess) {
                    toastr.warning(data.message);
                }

                var list  = data.data;
                for (var index in list) {
                    var fileArr = {};
                    fileArr.name = list[index].ia_file_name;
                    fileArr.targetName = list[index].ia_file_name;
                    fileArr.shortFileName = list[index].ia_file_name;
                    fileArr.fkey = list[index].ia_key;
                    $scope.issueInfo.fileList = $scope.issueInfo.fileList ? $scope.issueInfo.fileList : [];
                    $scope.issueInfo.fileList.push(fileArr);
                }
                $scope.submitting = false;
            },
            function (error) {
                toastr.error('网络错误，请稍后再试');
            }
        );
    }

    // 新建问题手机上传后执行
    $scope.phoneFileLoad = function (uploadKey) {
        $scope.uploadKey = uploadKey;
        issueService.getFileByUploadKey(uploadKey).then(
            function (data) {
                if(data.code == constants.returnSuccess) {
                    var list = data.data;
                    setFileList(list);
                }
            },
            function (error) {
                toastr.error('网络错误，请稍后再试');
            }
        );
    }

    function setFileList (list) {
        var newList = clearThisUpFileList();

        for (var index in list) {
            var fileArr = {};
            fileArr.name = list[index].ia_file_name;
            fileArr.targetName = list[index].ia_file_name;
            fileArr.shortFileName = list[index].shortFileName;
            fileArr.fkey = list[index].ia_key;
            fileArr.uploadKey = list[index].ia_description;
            newList.push(fileArr);
        }

        $scope.issueInfo.fileList = newList;
    }

    function clearThisUpFileList () {
        var newList = [];

        for (var index in $scope.issueInfo.fileList) {
            if (!$scope.issueInfo.fileList[index].uploadKey || $scope.issueInfo.fileList[index].uploadKey != $scope.uploadKey) {
                newList.push($scope.issueInfo.fileList[index]);
            }
        }

        return newList;
    }

   $scope.deleteFile = function (item,fKey) {
        $http({
            method: 'post',
            url: '/api/issues/deleteIssueFile',
            data: $.param({
                iaKey: fKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
              $scope.issueInfo.fileList.splice(item,1);
            } else {
                toastr.warning("操作失败");
            }
        }, function(data) {
            toastr.error("网络请求失败");
        });
   }

   $scope.create = function () {
       $scope.submitting = true;
       if ($scope.signup_form.$valid && alertForImageNotUpload( sweetAlert, $scope.create, [])) {

           $scope.issue = {};

           var descripton = angular.element('#description');
           $scope.issue.description = stringFormater.filterInput(descripton.val());
           $scope.issue.title = stringFormater.filterInput($scope.issueInfo.title);
           $scope.issue.finished = $scope.issueInfo.finished;

           var pickOperator = function(input) {
               return input.key;
           }

           $scope.issue.follows = angular.toJson(Stat.map(pickOperator, $scope.issueInfo.follows));
           $scope.issue.assignee = $scope.issueInfo.assignee ? $scope.issueInfo.assignee.key : '';
           $scope.issue.fileList = angular.toJson($scope.issueInfo.fileList);
           $scope.issue.projects = $scope.issueInfo.project.key;
           $scope.issue.priority = $scope.issueInfo.priority.key;
           $scope.issue.vKey = $scope.issueInfo.version ? $scope.issueInfo.version.key : '';
           $scope.issue.pmKey = $scope.issueInfo.module ? $scope.issueInfo.module.key : '';
           $scope.issue.ptKey = $scope.issueInfo.type.key;

           // mark for sub issue
           if(subIssueFlag) {
               $scope.issue.parentIssueKey = subIssueFlag;
           }

         //Submit as normal
           issueService.create($.param($scope.issue)).then(function(data) {
                      $scope.submitting = false;
                      if(data.code == constants.returnSuccess) {
                          clearAll(data.data.pKey);
                          if ($scope.parentIssueKey) {
                             angular.element(document.getElementById('viewIssueCtrl')).scope().loadIssueInfo();
                          }else{
                             //$state.go('project.issue_view', {'pKey' : data.pKey, 'iNo' : data.iNo});
                             $state.go('project.issue', {'pKey' : data.data.pKey, 'page' : 1});
                          }
                          angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                          angular.element(document.getElementById('userCtrl')).scope().loadNotification();
                      } else {
                          toastr.warning(data.message);
                      }
                   }, function(err) {
                        $scope.submitting = false;
                       toastr.error("网络请求失败");
                  });
       } else {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
           return false;
       }
    };

   $scope.build = function () {
       $scope.submitting = true;
       if ($scope.signup_form.$valid && alertForImageNotUpload( sweetAlert, $scope.build, [])) {

           var descripton = angular.element('#description');
           $scope.issue.description = stringFormater.filterInput(descripton.val());
           $scope.issue.title = stringFormater.filterInput($scope.issueInfo.title);
           $scope.issue.finished = $scope.issueInfo.finished;

           var pickOperator = function(input) {
               return input.key;
           }

           $scope.issue.follows = angular.toJson(Stat.map(pickOperator, $scope.issueInfo.follows));
           $scope.issue.assignee = $scope.issueInfo.assignee ? $scope.issueInfo.assignee.key : '';
           $scope.issue.fileList = angular.toJson($scope.issueInfo.fileList);
           $scope.issue.projects = $scope.issueInfo.project.key;
           $scope.issue.priority = $scope.issueInfo.priority.key;
           $scope.issue.vKey = $scope.issueInfo.version ? $scope.issueInfo.version.key : '';
           $scope.issue.pmKey = $scope.issueInfo.module ? $scope.issueInfo.module.key : '';
           $scope.issue.ptKey = $scope.issueInfo.type.key;

           // mark for sub issue
           if(subIssueFlag) {
               $scope.issue.parentIssueKey = subIssueFlag;
           }

           //Submit as normal
           issueService.create($.param($scope.issue)).then(function(data) {
                      $scope.submitting = false;
                      if(data.code == constants.returnSuccess) {
                          $scope.ok();
                          if( !data.data.pKey) {
                              return false;
                          }

                          if ($scope.parentIssueKey) {
                             angular.element(document.getElementById('viewIssueCtrl')).scope().loadIssueInfo();
                          }else{
                             //$state.go('project.issue_view', { 'pKey' : data.data.pKey , 'iNo' : data.data.iNo });
                             $state.go('project.issue', {'pKey' : data.data.pKey, 'viewIssueNumber' : data.data.iNo, 'page' : 1});
                          }

                          angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                          angular.element(document.getElementById('userCtrl')).scope().loadNotification();
                      } else {
                          toastr.warning(data.message);
                      }

                   }, function(err) {
                       $scope.submitting = false;
                       toastr.error("网络请求失败");
                  });
       } else {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
           return false;
       }
    };

   $scope.subKeyup = function($event){
       var e = $event;
       var keycode = window.event ? e.keyCode : e.which;
       if(e.ctrlKey && keycode == 13){
           $scope.build();
        }else if(e.metaKey && keycode == 13){
           $scope.build();
       }
   };

   $scope.addSuc = function(){
        toastr.info("创建成功");
    }

    $scope.ok = function () {
        $uibModalInstance.close();
        window.localStorage.setItem(constants.localStorageUnsavedIssue, '');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        saveDraft();
    };

    $scope.searchPeople = function(term) {
        var peopleList = [];
        issueService.projectUserList($scope.pKey).then(function(data) {
            angular.forEach(data, function(item) {
                if(item.u_avator.length == 32) {
                    // convert avator key to url
                    item.u_avator = $scope.constants.imageQiniu + "/avator/view/avator/" + item.u_avator + $scope.constants.imageCorp;
                }
                if (item.u_name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                    peopleList.push(item);
                }
            });

            $scope.people = peopleList;
            return $q.when(peopleList);

        }, function(err) {
        });
     };

    $scope.getPeopleTextRaw = function(item) {
        return '@' + item.u_name;
    };

    function saveDraft() {
        if(!window.localStorage) {
            return false;
        }
        var draftData = {};
        draftData.title = $scope.issueInfo.title;
        draftData.finished = $scope.issueInfo.finished;
        draftData.description = angular.element('#description').val();
        draftData.projects = $scope.issueInfo.project;
        draftData.follows = $scope.issueInfo.follows;
        draftData.assignee = $scope.issueInfo.assignee;
        draftData.fileList = $scope.issueInfo.fileList;
        draftData.priority = $scope.issueInfo.priority;
        draftData.vKey = $scope.issueInfo.version;
        draftData.pmKey = $scope.issueInfo.module;
        draftData.ptKey = $scope.issueInfo.type;

        if(draftData.title || draftData.description) {
            window.localStorage.setItem(constants.localStorageUnsavedIssue, angular.toJson(draftData));

            toastr.info("编辑已暂存");
        } else {
            window.localStorage.setItem(constants.localStorageUnsavedIssue, '');
        }
    }

    function proceedDraftRecovery() {
        if(!window.localStorage) {
            return false;
        }
        var draftData = window.localStorage.getItem(constants.localStorageUnsavedIssue);

        if(draftData) {
            sweetAlert.swal({
                title: '是否继续上次编辑',
                text: '上次编辑尚未保存，是否继续上次编辑?',
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "继续",
                cancelButtonText: "放弃"
            },
            function(isConfirm) {
                if (isConfirm) {
                    draftData = angular.fromJson(draftData);
                    angular.element('#description').val(draftData.description);
                    $scope.issueInfo.description = draftData.description;
                    $scope.issueInfo.title = draftData.title;
                    $scope.issueInfo.finished = draftData.finished;

                    if(!subIssueFlag) {
                        $scope.issueInfo.project = draftData.projects;
                        $scope.issueInfo.follows = draftData.follows;
                        $scope.issueInfo.assignee = draftData.assignee;
                        $scope.issueInfo.fileList = draftData.fileList;
                        $scope.issueInfo.priority = draftData.priority;
                        $scope.issueInfo.version = draftData.vKey;
                        $scope.issueInfo.module = draftData.pmKey;
                        $scope.issueInfo.type = draftData.ptKey;
                    }

                    toastr.info("编辑已恢复");

                } else {
                    window.localStorage.setItem(constants.localStorageUnsavedIssue, '');
                }
            });
        } else {
            return true
        }
    }

    proceedDraftRecovery();


    // for browser plugin image
    if($scope.iaKey) {

        issueService.getFileInfo($scope.iaKey, 'image').then(function(data) {
            var id = data.data.data.id;
            var name = data.data.data.name;
            var path = data.data.data.path;
            var url = data.data.data.url;

            if( name && path && url) {
                $scope.issueInfo.description = "![" + name + "](" + url + ")";
                $scope.issueInfo.fileList = $scope.issueInfo.fileList ? $scope.issueInfo.fileList : [];
                $scope.issueInfo.fileList.push({ name: name, targetName: path, fkey: id, shortFileName: name});
            }

        });
    }
};

function checkUploadImageStatus(toastr) {
    var returnVal = false;
    if( clipboardReader && clipboardReader.uploadFileList.length == 0 ) {
        returnVal = true;
    } else if ( clipboardReader) {
        returnVal = false;
        toastr.warning("请等待图片上传完成后再保存内容");
    } else {
        returnVal = true;
    }
    return returnVal;
}

function alertForImageNotUpload( sweetAlert, callback, parameters) {
    if( clipboardReader && clipboardReader.uploadFileList.length == 0 ) {
        return true;
    }
    sweetAlert.swal({
        title: "确定保存？",
        text: "点击确定后，编辑器内正在上传的文件将会被忽略。",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "保存",
        cancelButtonText: "取消",
        closeOnConfirm: true,
        closeOnCancel: true
    },

        function(isConfirm) {
            if (isConfirm) {
                clipboardReader.cancelAllImage();
                callback.apply( this, parameters);
            } else {
                //do nothing
            }
        }
    );
    return false;
}

function ModalInstanceCtrl ($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};

function viewIssueCtrl($scope, $http, $state, $rootScope, $sce, $filter, $compile, constants, $stateParams, issueService, versionService, projectService, sweetAlert, $controller, dashboardService, $uibModal, $q, $element, userService, VCSService, helper, toastr, $timeout) {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.issueInfo = {};
    $scope.followSubmitting = false;

    $scope.step = 1;
    $scope.editDes = false;
    $scope.fileList = {};
    $scope.subIssuesList = {};
    $scope.issuesLoaded = false;
    $scope.filesLoaded = false;
    $scope.subIssuesLoaded = false;
    $scope.isShowAddFollow = false;
    $scope.isEditAssign = false;
    $scope.userInfo = $rootScope.userInfo;
    $scope.editTitle = false;
    $scope.issueUpdateFlag = 1;
    $scope.isShowMore = false;
    $scope.showMoreDescription = false;
    $scope.maxHeight = "250px";
    $scope.trendLast = '';

    // VCS Panel data
    $scope.VCSPanel = {};
    $scope.VCSPanel.show = false;
    $scope.VCSPanel.commitList = [];

    // project config
    $scope.projectConfig = {};
    $scope.issueConfig = {};

    // load helper
    $scope.configReader = helper.configReader();
    $scope.groupFn = helper.groupFn();
    var stringFormater = helper.stringFormater();


    // user access control setting
    $scope.UAC = {
        issueUpdateText: false,
        issueUpdateMember: false,
        issueUpdateDeadline: false,
        issueUpdateOption: false,
        issueClose: false,
        issueDelete: false,
        issueAttachementChange: false,
        issueAttachmentDelete: false,
        issueMoveOut: false,
    };

    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'viewIssueCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.issueAdd = permision.checkPermision(constants.UAC.issueAdd, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueUpdateText = permision.checkPermision(constants.UAC.issueUpdateText, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueUpdateMember = permision.checkPermision(constants.UAC.issueUpdateMember, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueUpdateDeadline = permision.checkPermision(constants.UAC.issueUpdateDeadline, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueUpdateOption = permision.checkPermision(constants.UAC.issueUpdateOption, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueClose = permision.checkPermision(constants.UAC.issueClose, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueDelete = permision.checkPermision(constants.UAC.issueDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueAttachementChange = permision.checkPermision(constants.UAC.issueAttachementChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueAttachmentDelete = permision.checkPermision(constants.UAC.issueAttachmentDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.issueMoveOut = permision.checkPermision(constants.UAC.issueMoveOut, $scope.projectConfig.current.role.privilege);

            //if($state.params.viewIssueNumber || $state.params.iNo) {

                // custom settings
                $scope.projectConfig.assignee = [];

                var tmpList = $scope.configReader.filter($scope.projectConfig.users, 'deleteFlag', 0)
                for (var tmpIndex in tmpList) {
                    tmpList[tmpIndex].class = $scope.projectConfig.users[tmpIndex].role.class;
                    $scope.projectConfig.assignee.push(tmpList[tmpIndex]);
                }

                $scope.groupedAssigneeList = $scope.groupFn.groupedMenuGenerator($scope.projectConfig.assignee, $scope.groupFn.roleGroupFn);

                $scope.groupedAssigneeList.unshift({key: 'bugTracker::divider', label:''});
                $scope.groupedAssigneeList.unshift({key: $scope.projectConfig.current.key, label: '我', icon: 'user-circle-o', class:''});
                $scope.groupedAssigneeList.unshift({key: 'unassign', label: '未指派', icon: 'ban', class:''});

            //}

        } else {
            // do nothing
        }
    }

    var pKey = $stateParams.pKey;
    var iNo = $stateParams.iNo ? $stateParams.iNo : $stateParams.viewIssueNumber;
    var iKey = false;
    var sideFlag = $stateParams.viewIssueNumber ? true : false;
    $scope.sideFlag = sideFlag;
    $scope.state = $state;

    $scope.$watch('state.params.viewIssueNumber', function(newDate, oldDate) {
        sideFlag = newDate ? true : false;
        $scope.sideFlag = sideFlag;
        $scope.editDes = false;
        $scope.editTitle = false;
        $scope.isShowMore = false;
        $scope.showMoreDescription = false;
        $scope.maxHeight = "250px";

        if (!sideFlag) {
            $scope.issueInfoLoadingFlag = true;
            return false;
        }

        // 监听trend, 更新更新人
        $scope.$on('getTrendLast', function(e, newTrendLast) {
            $scope.trendLast = newTrendLast;
            e.stopPropagation();
        });

        pKey = $stateParams.pKey;
        iKey = false;
        iNo = newDate;

        if (iNo) {
            $scope.loadProjectList();
        }
    });

    $scope.showEditTitle = function() {
        $scope.editTitle = true;
        $timeout(function(){
            angular.element('#inputTitle').focus();
        },10);
    }

    // 描述是否要显示更多
    function isShowMoreDescription() {
        var height = $('.issue-description').height();

        if (height > 250) {
            $scope.isShowMore = true;
        } else {
            $scope.isShowMore = false;
        }
    }

    $scope.clickShowMoreDescription = function(flag) {
        if (flag) {
            $scope.maxHeight = "none";
        } else {
            $scope.maxHeight = "250px";
        }

        $scope.showMoreDescription = flag;
    }

    $scope.getIssueInfo = function() {
        $scope.loadIssueInfo();
        $scope.loadFileList();
    };

    $scope.shortcut = {
        'Ctrl-B':'bold',
            'Ctrl-I':'italic',
            'Ctrl-H':'header',
            'Ctrl-U':'ul',
            'Ctrl-O':'ol',
            'Ctrl-K':'code',
            'Ctrl-Q':'quote',
            'Ctrl-L':'link',
            'Ctrl-G':'img'
    };

    // issue info
    $scope.issueInfoLoadingFlag = true;
    $scope.loadIssueInfo = function(callback) {

        // destroy date time picker
        $('#finished').parent().data('DateTimePicker') && $('#finished').parent().data('DateTimePicker').destroy();

        $scope.issueInfoLoadingFlag = true;
        issueService.view(pKey, iNo).then(function(data) {
            iKey = data.i_key;
            if(!iKey) {
                toastr.warning("此问题不存在");
                $state.go('project.issue', {'pKey' : $stateParams.pKey, 'page' : 1});
            }

            $scope.issueInfo = data;
            $scope.subIssuesList = data.subIssueList;
            $scope.description = $scope.issueInfo.i_description;
            $scope.issueInfo.i_description = $sce.trustAsHtml($scope.issueInfo.i_description);
            $scope.issueInfo.orgDescription = $scope.issueInfo.i_description_org;
            $scope.oldOrgDescription = $scope.issueInfo.i_description_org;
            $scope.issueInfo.i_title_old = $scope.issueInfo.i_title;
            $scope.loadCommitInfo();
            $scope.issuesLoaded = true;
            $scope.subIssuesLoaded = true;
            getTargetObjectFromConfig();
            $scope.loadFollowUserList();
            callback && callback(data);
            $scope.issueInfoLoadingFlag = false;

            $timeout(function(){
                isShowMoreDescription();
                $(document).resize();
                $('.markdown-content img').off('load',  isShowMoreDescription);
                $('.markdown-content img').on('load',  isShowMoreDescription);
            }, 10)
        }, function(err) {
            $scope.issueInfoLoadingFlag = false;
        });
    };

    function getTargetObjectFromConfig() {
        $scope.issueConfig.type = $scope.configReader.read($scope.projectConfig.type, $scope.issueInfo.pt_key);
        $scope.issueConfig.status = $scope.configReader.read($scope.projectConfig.status, $scope.issueInfo.i_status);
        $scope.issueConfig.priority = $scope.configReader.read($scope.projectConfig.priority, $scope.issueInfo.i_priority);
        $scope.issueConfig.module = $scope.configReader.read($scope.projectConfig.module, $scope.issueInfo.pm_key);
        $scope.issueConfig.version = $scope.configReader.read($scope.projectConfig.version, $scope.issueInfo.v_key);
        $scope.issueConfig.assignee = $scope.configReader.read($scope.projectConfig.users, $scope.issueInfo.i_assignee) ? $scope.configReader.read($scope.projectConfig.users, $scope.issueInfo.i_assignee) : {key: 'unassign'};
        $scope.issueConfig.project = $scope.configReader.read($scope.projectList, $scope.issueInfo.p_key);
    }

    // 跟踪用户 key
    $scope.loadFollowUserList = function() {
        issueService.followUserList(iKey).then(function(data) {
            $scope.issueConfig.follows = $scope.configReader.pick($scope.projectConfig.users, data.list);
            $scope.issueFollowcancel();
        }, function(err) {
        });
    };

    $scope.editAssign = function() {
        $scope.isEditAssign = true;
    }

    $scope.updateIssue = function(field, newData) {
      $scope.submitting = true;
        if (field == 'title' && (newData.length > 80 || !newData || newData == '')) {
            if (newData.length > 80) {
                $scope.issueInfo.i_title = $scope.issueInfo.i_title_old;
                toastr.warning("标题名称不能超过80个字符");
            } else if ( !newData || newData == '') {
                $scope.issueInfo.i_title = $scope.issueInfo.i_title_old;
                toastr.warning("标题名称不能为空");
            }
            $scope.submitting = false;
        } else if ( !alertForImageNotUpload( sweetAlert, $scope.updateIssue, [ field, newData])) {
            $scope.submitting = false;
        } else {

            if (field == 'title') {
                $scope.editTitle = false;
            }

            if (field == 'description') {
                var descripton = angular.element('#description');
                newData = descripton.val();
            }

            if(field == 'description' || field == 'title') {
                newData = stringFormater.filterInput(newData);
            }

            issueService.update(pKey, iNo, field, newData).then(function(data) {
                $scope.submitting = false;
                if (data.code !== constants.returnSuccess) {
                    if (data.code != constants.returnErrorNoChanged) {
                        toastr.warning(data.message);
                    }

                    if (field == 'description') {
                        $scope.editDes = !$scope.editDes;
                    }
                }
                else {
                    var message = '';

                    if (field == 'type') {
                        $scope.issueInfo.pt_key = newData;

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.pt_key = newData;
                        }

                        message = '修改类型成功';
                    }

                    if (field == 'status') {
                        $scope.issueInfo.i_status = newData;

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.i_status = newData;
                        }

                        if (newData == constants.issuesClosed) {
                            message = '关闭成功，即将返回问题列表';
                        } else {
                            message = '修改状态成功';
                        }
                    }

                    if (field == 'priority') {
                        $scope.issueInfo.i_priority = newData;

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.i_priority = newData;
                        }

                        message = '修改优先级成功';
                    }

                    if (field == 'assignee') {
                        $scope.issueInfo.i_assignee = newData;

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.i_assignee = newData;
                        }

                        if (newData == '') {
                            $scope.issueInfo.assigner = '未指派';
                        }
                        message = '修改指派成功';
                        $scope.isEditAssign = false;
                    }

                    if (field == 'title') {
                        $scope.issueInfo.i_title_old = $scope.issueInfo.i_title;
                        $scope.editTitle = false;
                        message = null; // 修改标题时不弹出提醒

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.i_title = newData;
                        }
                    }

                    if (field == 'description') {
                        // $state.reload();
                        $scope.loadIssueInfo();
                        message = '修改描述成功';
                        $scope.editDes = !$scope.editDes;
                        //$scope.issueInfo.i_description = $scope.description;
                    }

                    if (field == 'version') {
                        $scope.issueInfo.v_key = newData;

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.v_key = newData;
                        }

                        if (!newData) {
                            $scope.issueInfo.v_no = '';
                        }

                        message = '修改版本成功';
                    }

                    if (field == 'module') {
                        $scope.issueInfo.pm_key = newData;

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.pm_key = newData;
                        }

                        if (!newData) {
                            $scope.issueInfo.pm_name = '';
                        }

                        message = '修改模块成功';
                    }


                    if (field == 'finished') {
                        $scope.issueInfo.unfinished = data.data.unfinished;

                        if(!newData) {
                            newData = '未设置';
                            $scope.issueInfo.i_finished = newData;
                        }

                        if ($rootScope.viewIssue) {
                            $rootScope.viewIssue.i_finished = newData;
                        }

                        message = '修改完成日期成功';
                    }

                    if (newData == constants.issuesClosed && field == 'status') {
                        /*VCSService.bindCommit( $scope.issueInfo, function(){
                            setTimeout(function () { $state.go('project.issue', {'pKey' : pKey});}, 2000);
                        });*/
                        if($stateParams.referer) {
                            var refererData = $stateParams.referer.split('_');
                            if(refererData[0] == 'version') {
                                setTimeout(function () { $state.go('project.version_view', {'vKey' : refererData[1]});}, 2000);
                            } else {
                                setTimeout(function () { $state.go('project.issue', {'pKey' : pKey});}, 2000);
                            }
                        } else {
                            setTimeout(function () { $state.go('project.issue', {'pKey' : pKey});}, 2000);
                        }
                    }

                    if (message) {
                        toastr.info(message);
                    }

                    if(field != 'finished'){
                        // 重新加载操作记录
                        if (!sideFlag) {
                            angular.element(document.getElementById('activityCtrl')).scope().initActivityPage();
                            angular.element(document.getElementById('activityCtrl')).scope().load();
                        }
                        angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                        angular.element(document.getElementById('userCtrl')).scope().loadNotification();

                    }

                    $scope.issueUpdateFlag ++;

                    getTargetObjectFromConfig();
                }
            }, function(err) {
                $scope.submitting = false;
                toastr.error("网络请求失败");
            });
        }
    };

    $scope.updateDes = function($event) {
        if ($event) {
            var current = $($event.target);
            if (current.attr('data-gallery') == '' || current.parent().attr('data-gallery') == '') {
                return null;
            }
        }
        $timeout(updateDes, 10);
    }

    function updateDes () {
        $scope.editDes = true;
        //$scope.editIssueTitleCancel();

        // 保存标题
        if ($scope.editTitle) {
            $scope.updateIssue('title', $scope.issueInfo.i_title);
        }
    }

    $scope.showNote = function(step) {
        if (step) {
            $scope.step = step;
        } else {
            step = $scope.step;
        }

    }

    $scope.issueEditcancel = function() {
        $timeout(issueEditcancel, 10);
    };

    function issueEditcancel () {
        $scope.editDes = false;
        $scope.description = $scope.issueInfo.i_description;
        $scope.issueInfo.orgDescription = $scope.oldOrgDescription;
    }

    $scope.fileUploadFinished = function(targetName, name, size) {
        issueService.uploadFile(pKey, $scope.issueInfo.i_key, targetName, name , size , '').then(function(data) {
            if (data.code == 0) {
                $scope.loadFileList();
                $scope.issueUpdateFlag ++;
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    }

    // 文件库上传
    $scope.fileHubUpload = function (fKeyList) {
        issueService.uploadIssueFileFromFileHub(pKey, iNo, fKeyList).then(
            function (data) {
                if(data.code != constants.returnSuccess) {
                    toastr.warning(data.message);
                }
                $scope.loadFileList();
            },
            function (error) {
                toastr.error('网络错误，请稍后再试');
            }
        );
    }

    // 文件列表
    $scope.loadFileList = function() {
        issueService.getFileList(pKey, iNo).then(function(data) {
            if (data.data.code == 0) {
                $scope.fileList = data.data.data.list.fileList;
            }

            $scope.filesLoaded = true;
        }, function(err) {
        });
    }

    /*
     * 文件删除
     */
    $scope.askFileDelete = function(iaKey, fileName) {
        sweetAlert.swal({
            title: '确定要删除文件"' +  fileName + '"吗?',
            text: "文件删除后，将无法恢复",
//            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/issues/deleteIssueFile',
                    data: $.param({
                        iaKey: iaKey,
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data) {
                    data = data.data
                    if (data.code == 0) {
                        $scope.loadFileList();
//                        $scope.initActivityPage();
//                        $scope.load(1);

                        toastr.info('文件"' + fileName + '"已经删除');
                        $scope.issueUpdateFlag ++;
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(data) {
                    toastr.error("网络请求失败");
                });
            }
        });
    }

    $scope.showAddFollow = function () {
        $scope.isShowAddFollow = true;
        $timeout(function(){
            angular.element('.issue-follow .ui-select-search').focus();
        }, 10);
    }

    $scope.issueFollowcancel = function () {
        $scope.isShowAddFollow = false;
    }

    $scope.updateFollow = function () {
        $scope.followSubmitting = true;
        $scope.follows = angular.toJson($scope.issueConfig.follows);
        issueService.update(pKey, iNo, 'follow', $scope.follows).then(function(data) {
            $scope.followSubmitting = false;
            if (data.code !== constants.returnSuccess) {
                toastr.warning(data.message);
                $scope.isShowAddFollow = !$scope.isShowAddFollow;
            }
            else {
                toastr.info("编辑跟踪者成功");

                // 重新加载操作记录
                if ($stateParams.iNo) {
                    angular.element(document.getElementById('activityCtrl')).scope().initActivityPage();
                    angular.element(document.getElementById('activityCtrl')).scope().load();
                }
                angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                angular.element(document.getElementById('userCtrl')).scope().loadNotification();

                $scope.loadFollowUserList();
                $scope.issueUpdateFlag ++;
                $scope.isShowAddFollow = !$scope.isShowAddFollow;
            }
        }, function(err) {
            $scope.followSubmitting = false;
            toastr.error("网络请求失败");
            $scope.isShowAddFollow = !$scope.isShowAddFollow;
        });
    };

    $scope.getFileTypeIcon = function(mime, regex) {
        if (mime.match('word')) {
            return 'fa-file-word-o';
        } else if (mime.match('spreadsheet')) {
            return 'fa-file-excel-o';
        } else if (mime.match('presentation')) {
            return 'fa-file-powerpoint-o';
        } else if (mime.match('^image')) {
            return 'fa-file-image-o';
        } else if (mime.match('^video')) {
            return 'fa-file-movie-o';
        } else if (mime.match('^audio')) {
            return 'fa-file-audio-o';
        } else if (mime.match('^text')) {
            return 'fa-file-code-o';
        } else if (mime.match('application/pdf')) {
            return 'fa-file-pdf-o';
        } else if (mime.match('application/zip')) {
            return 'fa-file-archive-o';
        }

        return 'fa-file-o';
    }

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

   $scope.hoverIn = function(event, ukey) {
       $scope.userII = {};
       $scope.userII.uKey = ukey;
       $scope.userII.pKey =  $stateParams.pKey;

       dashboardService.getUserInfo($.param($scope.userII)).then(function(data) {
           $scope.showUser = data;
           var ot = angular.element(event.target).offset().top;
           var ol = angular.element(event.target).offset().left;

           var  $ul = angular.element('#userinfo');

           var g = $(document).scrollTop();

           $ul.css({
               display: 'block',
               position: 'fixed',
               top: ot-g-33 + 'px',
               left: ol + 35 + 'px',
               "z-index": 99999999
           });
       }, function(err) {

       });
   }

   $scope.hoverOut = function(event, val) {
       $scope.isshowuser = false;
       var  $ul = angular.element('#userinfo');
       $ul.css({
           display: 'none'
       });
   }

   $scope.setShowAllUser = function () {
        $scope.showAllFollowUser = !$scope.showAllFollowUser;
   }

    $scope.loadProjectList = function() {
        projectService.getProjectList().then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectList = data.data;

                // project list
                $scope.displayProjectList = [];
                $scope.displayProjectList = $scope.groupFn.groupedMenuGenerator($scope.projectList, $scope.groupFn.projectGroupFn);
                $scope.getIssueInfo();
            } else {
                toastr.warning('获取项目列表失败 请刷新重试');
            }
        }, function(err) {
            toastr.error("网络请求失败");
       });
    };

    if (iNo && !sideFlag) {
        $scope.loadProjectList();
    }

    $scope.changeIssueProject = function(pKey,iNo,field,data) {
        issueService.update(pKey,iNo,field,data, '').then(function(data) {
            if (data.code == constants.globalFalse) {
                toastr.info("问题已经移动到新的项目");
                $state.go('project.issue_view', {'pKey' : data.data.pKey , 'iNo' : data.data.iNo });
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
            toastr.error("网络请求失败");
        });
   };

    $scope.editIssueTitle = function () {
        $scope.issueInfo.i_title_old = $scope.issueInfo.i_title;
        $scope.editTitle = true;

        // 保存描述
        if ($scope.editDes) {
            $scope.updateIssue('description', $scope.issueInfo.orgDescription);
        }
    };

    $scope.editIssueTitleCancel = function () {
        $scope.issueInfo.i_title = $scope.issueInfo.i_title_old;
        $scope.editTitle = false;
    };

   $scope.createSubIssue = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/issue/addSubIssue.html',
            size: 'lg',
            controller: addIssuesCtrl,
            scope:$scope,
            backdrop: 'static',
            keyboard: false
        });
   }

  $scope.resetIssue = function (iKey) {
        sweetAlert.swal({
            title: '确定要转为一般问题吗?',
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "确定",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                issueService.resetIssue($.param({iKey:iKey})).then(function(data) {
                    toastr.info("该问题已经转为一般问题");
                    $scope.loadIssueInfo();
                }, function(err) {
              });
            }
        });
  }

  $scope.renameFileKey = '';
  /*
   * 文件重命名
   */
  $scope.renameFile = function(item) {
      $scope.oldFilename = item.ia_file_name.split('.')[0];
      $scope.oldFilenameExt = item.ia_file_name.split('.')[1];
      $scope.renameFileKey = item.ia_key;
      $timeout.cancel($scope.imageUpload.timer);
      item.ia_file_name = $scope.oldFilename;
  }

  $scope.renameFileCancel = function(index) {
      $scope.fileList[index].ia_file_name = $scope.oldFilename + '.' + $scope.oldFilenameExt;
      $scope.renameFileKey = '';
  }

    $scope.renameFileConfirm = function(newFileName) {
        var fKey = $scope.renameFileKey;
        newFileName = newFileName + '.' + $scope.oldFilenameExt;
        if (!newFileName || newFileName == '') {
            toastr.warning('请输入文件名称');
            return false;
        }

        if ($scope.renameFileSubmitting == true) {
            return false;
        }

        $scope.renameFileSubmitting = true;

        newFileName = stringFormater.filterInput(newFileName);

        issueService.renameFile($.param({newFileName: newFileName,fileKey: fKey})).then(function(data) {
            $scope.renameFileKey = '';
            $scope.renameFileSubmitting = false;
            data = data.data
            if (data.code == 0) {
                $scope.loadFileList();
                toastr.info(newFileName, "文件重命名成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
            $scope.renameFileCancel();
            toastr.error("网络请求失败");
            $scope.renameFileSubmitting = false;
        });
    }

    $scope.searchPeople = function(term) {
        var peopleList = [];
        issueService.projectUserList(pKey).then(function(data) {
            angular.forEach(data, function(item) {
               if(item.u_avator.length == 32) {
                    // convert avator key to url
                    item.u_avator = $scope.constants.imageQiniu + "/avator/view/avator/" + item.u_avator + $scope.constants.imageCorp;
                }
                if (item.u_name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                    peopleList.push(item);
                }
            });

            $scope.people = peopleList;
            return $q.when(peopleList);

        }, function(err) {
        });
     };

    $scope.getPeopleTextRaw = function(item) {
        return '@' + item.u_name;
    };

    $scope.selectDate = function () {
        if ($('#finished').parent().data('DateTimePicker')) {
            var  $ui =  angular.element('#finished');
            var finished = $ui.val();
            if($scope.issueInfo.i_finished != finished) {
                $scope.updateIssue('finished', finished);
                $scope.issueInfo.i_finished = finished ? finished : '未设置';
            }
        }
    }

    /*
     * 删除问题
     */
    $scope.askIssueDelete = function(iNo, iParentKey, deleteInSideFlag) {
        var title = '确定要删除问题 #' +  iNo  + ' 吗?';
        if (iParentKey) {
            title = '确定要删除子问题 #' +  iNo  + ' 吗?';
        }

        sweetAlert.swal({
            title: title,
            text: "问题删除后，问题下相关的内容也将一起删除，无法恢复",
            animation: false,
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/issues/deleteIssue',
                    data: $.param({
                        iNo: iNo,
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data) {
                    data = data.data
                    if (data.code == 0) {

                        var message = '问题"' + iNo + '"已经删除';
                        if (iParentKey) {
                            message = '子问题"' + iNo + '"已经删除';
                        }

                        toastr.info(message);

                        if (!iParentKey || !deleteInSideFlag) {
                            $('#cancelSideBtn').click();
                        }

                        $timeout(function () {$state.reload();}, 10);
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(data) {
                    toastr.error("网络请求失败");
                });
            }
        });
    }

    $scope.askIssueDuplicate = function () {
        $scope.issueInfo;

        $uibModal.open({
            templateUrl: 'views/issue/duplicateIssue.html',
            size: 'md',
            controller: duplicateIssueCtrl,
            backdrop: 'static',
            scope: $scope,
            keyboard: false
        });

    }

    $scope.askIssueMove = function () {
        $scope.issueInfo;

        $uibModal.open({
            templateUrl: 'views/issue/moveIssue.html',
            size: 'md',
            controller: moveIssueCtrl,
            backdrop: 'static',
            scope: $scope,
            keyboard: false
        });
    }

    // Version Control System actions VCS
    $scope.loadCommitInfo = function () {
        var iKey = $scope.issueInfo.i_key;
        VCSService.loadCommitInfo( iKey).then( function( data){
            if( data.code == constants.returnSuccess) {
                $scope.VCSPanel.show = true;
                $scope.VCSPanel.commitList = parseCommitInfo( data.data);
            }
        });
    }

    $scope.bindCommit = function () {
        VCSService.bindCommit( $scope.issueInfo, $scope.loadCommitInfo);
    }

    function parseCommitInfo( commitInfoArray) {
        var returnArray = [];
        for( var i1 = 0 ; i1 < commitInfoArray.length ; i1 ++) {
            var tmpCommitInfo = {};
            tmpCommitInfo.hash = commitInfoArray[i1].iv_commit_hash;
            tmpCommitInfo.author = commitInfoArray[i1].iv_commit_info.author;
            tmpCommitInfo.time = commitInfoArray[i1].iv_commit_info.commit_time;
            tmpCommitInfo.message = commitInfoArray[i1].iv_commit_info.message;
            tmpCommitInfo.files = [];
            if( commitInfoArray[i1].iv_file_change) {
                for( var i2 =0 ; i2 < commitInfoArray[i1].iv_file_change.length ; i2 ++) {
                    var tmpFileInfo = {};
                    tmpFileInfo.fileName = commitInfoArray[i1].iv_file_change[i2].fileName;
                    tmpFileInfo.filePatch = parseFilePatchInfo( commitInfoArray[i1].iv_file_change[i2].patch);
                    tmpCommitInfo.files.push( tmpFileInfo);
                }
            }
            returnArray.push( tmpCommitInfo);
        }
        return returnArray;
    }

    function parseFilePatchInfo( filePatch) {
        var lineArray = filePatch.split('\n');
        var returnArray = [];
        var lineNumber0 = 1;
        var lineNumber1 = 1;
        for( var i = 0 ; i < lineArray.length ; i ++) {
            var lineInfo = {};
            lineInfo.code = lineArray[i];
            lineInfo.class = '';
            var matchArray = lineInfo.code.match(/\@\@\s*[+|-]?(\d+)/);
            if( matchArray && matchArray.length) {
                lineNumber0 = matchArray[1] < 1 ? 0 : matchArray[1] - 1;
                lineNumber1 = matchArray[1] < 1 ? 0 : matchArray[1] - 1;
                lineInfo.class = 'l0';
            }
            if( lineInfo.code.charAt(0) == '+') {
                lineNumber1 ++;
                lineInfo.class = 'i';
                lineInfo.lineNumber0 = '';
                lineInfo.lineNumber1 = lineNumber1;
            } else if ( lineInfo.code.charAt(0) == '-') {
                lineNumber0 ++;
                lineInfo.class = 'd';
                lineInfo.lineNumber0 = lineNumber0;
                lineInfo.lineNumber1 = '';
            } else {
                if( lineInfo.class == 'l0') {
                    lineInfo.lineNumber0 = '';
                    lineInfo.lineNumber1 = '';
                } else {
                    lineNumber0 ++;
                    lineNumber1 ++;
                    lineInfo.class = '';
                    lineInfo.lineNumber0 = lineNumber0;
                    lineInfo.lineNumber1 = lineNumber1;
                }
            }
            returnArray.push( lineInfo);
        }
        return returnArray;
    }

    $scope.getPre = function(){
        issueService.getPreNext(pKey, iNo, 1).then(function(data) {
            if (data.code == constants.globalFalse) {
                $state.go('project.issue_view', {pKey: pKey, iNo: data.data.i_no});
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
       });
    };

    $scope.getNext = function(){
        issueService.getPreNext(pKey, iNo, 0).then(function(data) {
            if (data.code == constants.globalFalse) {
                $state.go('project.issue_view', {pKey: pKey, iNo: data.data.i_no});
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
       });
    };

    $scope.stopPropagation = function(e) {
        e.stopPropagation();
    }


};

function noteCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $sce, $filter, constants, $stateParams, issueService, userService, sweetAlert, $controller, toastr, helper) {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.noteList = {};
    $scope.pKey = $stateParams.pKey;
    $scope.iNo = $stateParams.iNo;
    $scope.noteLoaded = false;
    $scope.isShowAddNote = false;
    $scope.noteText = "";
    $scope.userInfo = $rootScope.userInfo;

    var stringFormater = helper.stringFormater();

    if (!$scope.userInfo.u_key) {
        $scope.getUserInfo = function() {
            userService.getUserInfo().then(function(data) {
                if (data.code == constants.returnSuccess) {
                    $scope.userInfo = data.data;
                    $scope.userInfo.isManager = $rootScope.userInfo.isManager;
                }
                else {
                }
            }, function(err) {
            });
        };

        $scope.getUserInfo();
    }

    var pKey = $scope.pKey;

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.showAddNote = function() {
        $scope.isShowAddNote = !$scope.isShowAddNote;
        $scope.noteText = "";
    };

    $scope.doAddNote = function() {
        $scope.submitting = true;

        var descripton = angular.element('#remark');
        var content = stringFormater.filterInput(descripton.val());

        issueService.addNote($scope.pKey, $scope.iNo, content).then(function(data) {
            $scope.submitting = false;
            // 重新加载评论
            $scope.initNotePage();
            $scope.loadNote(1, $scope.conf.itemsPerPage);
            $scope.showAddNote();
            $scope.noteText = "";
            descripton.val('');
            angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
            angular.element(document.getElementById('userCtrl')).scope().loadNotification();
            angular.element(document.getElementById('activityCtrl')).scope().initActivityPage();
            angular.element(document.getElementById('activityCtrl')).scope().load();
        }, function(err) {
            $scope.submitting = false;
        });
    };

    $scope.loadNote = function (page, size, callback) {
        $scope.noteLoaded = false;
        var pKey = $stateParams.pKey;
        var iNo = $stateParams.iNo;
        issueService.getNoteList(pKey, iNo, page, size).then(function(data) {
            $scope.noteList = data.list;
            $scope.noteLoaded = true;
            callback && callback(data);
        }, function(err) {
        });
    };

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('activityList');
            $anchorScroll();
        }
    });

    // 评论分页
    $scope.initNotePage = function() {
        var pKey = $stateParams.pKey;
        var iNo = $stateParams.iNo;
        issueService.getNoteCount(pKey, iNo).then(function(data) {
            $scope.conf.totalItems = data.count;
            $scope.conf.currentPage = 1;
            // refresh conf to trigger watch
            $scope.conf = angular.copy($scope.conf);
        }, function(err) {
        });
    };

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    // 编辑
    $scope.editNote = function(nKey, nNote, oNote) {
        $scope.oldNote = nNote;
        $scope.oldONote = oNote;
        $scope.editNoteKey = nKey;
    }

    $scope.editNoteCancel = function(index) {
        $scope.noteList[index].in_note = $scope.oldNote;
        $scope.noteList[index].in_note_org = $scope.oldONote;
        $scope.editNoteKey = '';
    }

    $scope.updateNote = function(inKey, index) {

        var descripton = angular.element('.' + inKey);
        inNote = stringFormater.filterInput(descripton.val());

        var inKey = $scope.editNoteKey;

        if (!inNote || inNote == '') {
            toastr.warning('请输入备注');
            return false;
        }

        if ($scope.renameFolderSubmitting == true) {
            return false;
        }

        $scope.renameFolderSubmitting = true;

        $http({
            method: 'post',
            url: '/api/issues/updateNote',
            data: $.param({
                inKey: inKey,
                pKey: pKey,
                inNote: inNote
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            $scope.renameFolderSubmitting = false;
            data = data.data
            if (data.code == 0) {
                $scope.editNoteKey = '';
                toastr.info("修改备注成功");
                $scope.noteList[index].in_note = data.data.in_note;
                $scope.noteList[index].in_note_org = data.data.in_note_org;

                angular.element(document.getElementById('activityCtrl')).scope().initActivityPage();
                angular.element(document.getElementById('activityCtrl')).scope().load();
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            $scope.editNoteCancel(index);
            toastr.error("网络请求失败");
            $scope.renameFolderSubmitting = false;
        });
    }
};

function activityCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $filter, constants, $stateParams, issueService, sweetAlert, $controller, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.activityList = {};
    $scope.activityLoaded = false;

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.load = function (page, size, callback) {
        $scope.activityLoaded = false;
        var pKey = $stateParams.pKey;
        var iNo = $stateParams.iNo;
        if (!size) {
            size = $scope.conf.itemsPerPage;
        }

        issueService.getActivityList(pKey, iNo, page, size).then(function(data) {
            $scope.activityList = data.list;
            $scope.activityLoaded = true;
            $scope.conf.totalItems = data.count;
            // refresh conf to trigger watch
            $scope.conf = angular.copy($scope.conf);
            callback && callback(data);
        }, function(err) {
        });
    };

    // 动态分页
    $scope.initActivityPage = function() {
        var pKey = $stateParams.pKey;
        var iNo = $stateParams.iNo;
        $scope.conf.currentPage = 1;
//        issueService.getActivityCount(pKey, iNo).then(function(data) {
//            $scope.conf.totalItems = data.count;
//            $scope.conf.currentPage = 1;
//        }, function(err) {
//        });
    };

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('activityList');
            $anchorScroll();
        }
    });
}

function trendCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $filter, constants, $stateParams, $timeout, issueService, sweetAlert, $controller, toastr, helper) {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    var stringFormater = helper.stringFormater();
    $scope.styleParser = helper.styleParser();
    var pKey = $stateParams.pKey;
    var iNo = $stateParams.viewIssueNumber ? $stateParams.viewIssueNumber : $stateParams.iNo;

    $scope.$watch('state.params.viewIssueNumber', function(newDate, oldDate) {

        iNo = $stateParams.viewIssueNumber ? $stateParams.viewIssueNumber : $stateParams.iNo;

        if (iNo) {
            try {
                if (typeof(eval($scope.resetTrendEdit)) == "function") {
                    $scope.resetTrendEdit();
                }
            } catch(e) {
            }

            $scope.getTrendList();
            $scope.noteText = "";
        }
    });

    $scope.$watch('issueUpdateFlag', function(newDate, oldDate) {
        if ($scope.issueUpdateFlag > 1) {
           $scope.getTrendList();
        }
    });

    $scope.trendLast = '';
    $scope.getTrendLast = function() {
        $scope.$emit('getTrendLast', $scope.trendLast);
    }

    $scope.trendList = {};
    $scope.trendLoaded = false;

    $scope.getTrendList = function () {
        $scope.trendLoaded = false;

        issueService.getTrendList(pKey, iNo).then(function(data) {
            if (data.code != 0) {
                toastr.warning(data.message);
                return false;
            }

            $scope.trendFileList = data.data.file;
            $scope.trendListAll = data.data.list;
            $scope.trendListShort = [];

            if ($scope.trendListAll.length > 0) {
                $scope.trendListShort = $scope.trendListAll.slice(-5);
                $scope.trendLast = $scope.trendListAll[$scope.trendListAll.length - 1];
                $scope.getTrendLast();
            }

            $scope.trendList = $scope.trendListShort;
            $scope.trendLoaded = true;

            if ($scope.trendListAll.length > 5) {
                $scope.showMoreTrendCount = $scope.trendListAll.length - 5;
                $scope.showMoreTrendFlag = true;
            }

        }, function(err) {
            toastr.error("网络连接有误");
        });
    };

    $scope.showMoreTrend = function () {
        $scope.trendList = $scope.trendListAll;
        $scope.showMoreTrendFlag = false;
    }

    $scope.hideMoreTrend = function () {
        $scope.trendList = $scope.trendListShort;
        $scope.showMoreTrendFlag = true;
    }

    $scope.showEditTrend = function (index, flag, $event) {
        if ($event) {
            var current = $($event.target);
            if (current.attr('data-gallery') == '' || current.parent().attr('data-gallery') == '') {
                return null;
            }
        }

        $scope.trendList[index].editTrend = flag;
    }

    $scope.trendAttachmentUploaded = function(fileKey, name) {
        $scope.trendAttachmentSubmitting = true;

        $http({
            method: 'post',
            url: '/api/issues/uploadNoteFileFinish',
            data: $.param({
                fileKey: fileKey,
                fileName: name,
                pKey: pKey,
                iKey: $scope.issueInfo.i_key,
                type: 'up',
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            $scope.trendAttachmentSubmitting = false;
            data = data.data

            if (data.code != 0) {
                toastr.warning(data.message);
            }

            $scope.onFileSaved(fileKey, data.data.key);
        }, function(data) {
            toastr.error("网络请求失败");
            $scope.trendAttachmentSubmitting = false;
        });
    }

    $scope.doAddNote = function(trend, naKeyList) {
        var content = "";

        if ($scope.sideFlag) {
            content = trend;
        } else {
            var description = angular.element('#noteText');
            content = stringFormater.filterInput(description.val());
        }

        if (!content && !naKeyList) {
            toastr.warning("请输入评论内容");
        }

        $scope.noteSubmiting = true;

        issueService.addNote(pKey, iNo, content, naKeyList).then(function(data) {
            $scope.noteSubmiting = false;

            if (data.code != 0) {
                toastr.warning(data.message);
                return false;
            }

            // 重新加载动态
            $scope.noteText = "";
            $scope.isShowAddNote = false;
            $scope.resetTrendEdit();

            if ($scope.sideFlag) {
                angular.element(document.getElementById('sideTrendList')).scope().getTrendList();
            } else {
                angular.element(document.getElementById('trendList')).scope().getTrendList();
            }

            scrollToBottom();
        }, function(err) {
            toastr.error("网络连接有误");
            $scope.noteSubmiting = false;
        });
    };

    $scope.addAt = function() {
        $('#sideNoteText').focus();

        $timeout(function(){
            $scope.noteText += " @";
            $('#sideNoteText').change();
        }, 10);
    };

    $scope.updateNote = function(inKey, index, time) {
        /*
            if (!compareTime(time)) {
                toastr.warning('只能修改10分钟以内的动态');
                return false;
            }
        */

        var descripton = angular.element('.' + inKey);
        inNote = stringFormater.filterInput(descripton.val());

        if (!inNote || inNote == '') {
            toastr.warning('请输入备注');
            return false;
        }

        if ($scope.renameFolderSubmitting == true) {
            return false;
        }

        $scope.renameFolderSubmitting = true;

        issueService.updateNote(pKey, inKey, inNote).then(function(data) {
            $scope.renameFolderSubmitting = false;

            if (data.code == 0) {
                toastr.info("修改备注成功");

                if ($scope.sideFlag) {
                    angular.element(document.getElementById('sideTrendList')).scope().getTrendList();
                } else {
                    angular.element(document.getElementById('trendList')).scope().getTrendList();
                }
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            toastr.error("网络请求失败");
            $scope.renameFolderSubmitting = false;
        });
    }

    $scope.deleteNote = function(inKey, time) {
        /*
            if (!compareTime(time)) {
                toastr.warning('只能删除10分钟以内的动态');
                return false;
            }
        */

        sweetAlert.swal({
            title: '确定要删除该动态吗?',
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                issueService.deleteNote(pKey, iNo, inKey).then(function(data) {
                    if (data.code != 0) {
                        toastr.warning(data.message);
                        return false;
                    }

                    // 重新加载动态
                    if ($scope.sideFlag) {
                        angular.element(document.getElementById('sideTrendList')).scope().getTrendList();
                    } else {
                        angular.element(document.getElementById('trendList')).scope().getTrendList();
                    }
                }, function(err) {
                    toastr.error("网络连接有误");
                });
            }
        });
    };

    function compareTime(time) {
        var nowTime = Date.parse(new Date()) / 1000;
        var createTime = Date.parse(new Date(time)) / 1000;

        if ((nowTime - createTime) > 10 * 60) {
            return false;
        }

        return true;
    }

    function scrollToBottom() {
        var height = $(".scroll-content-wrap").height();
        angular.element("#side-bar-issue-view-container").animate({scrollTop: height}, 300);
    }
    $(document).on('click', '#bottom-sitck-box', scrollToBottom);
}

function duplicateIssueCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $filter, constants, $stateParams, issueService, sweetAlert, $controller, $uibModalInstance, toastr, helper) {

    $scope.constants = constants;

    $scope.duplicateInfo = {};
    $scope.duplicateInfo.title = '复制 - ' + $scope.issueInfo.i_title;
    $scope.duplicateInfo.iKey = $scope.issueInfo.i_key;

    $scope.duplicateInfo.withAttachment = false;
    $scope.duplicateInfo.withSubIssue = true;
    $scope.duplicateInfo.withVCS = false;

    $scope.duplicateInfo.showOptionWithSubIssue = ($scope.subIssuesList.length > 0 && !$scope.issueInfo.i_parent_key) ? true: false;
    $scope.duplicateInfo.showOptionWithAttachment = $scope.fileList.length > 0 ? true: false;
    $scope.duplicateInfo.showOptionWithVCS = $scope.VCSPanel.commitList.length > 0 ? true: false;

    $scope.duplicateInfo.withSubIssue = $scope.duplicateInfo.showOptionWithSubIssue && $scope.duplicateInfo.withSubIssue;
    $scope.duplicateInfo.withAttachment = $scope.duplicateInfo.showOptionWithAttachment && $scope.duplicateInfo.withAttachment;
    $scope.duplicateInfo.withVCS = $scope.duplicateInfo.showOptionWithVCS && $scope.duplicateInfo.withVCS;

    //projectGroup
    var groupFn = helper.groupFn();
    var configReader = helper.configReader();
    var stringFormater = helper.stringFormater();
    $scope.prjectGroupFn = groupFn.projectGroupFn;
    $scope.userGroupFn = groupFn.roleGroupFn;

    //ui-selected current project
    $scope.issueInfo.currentProject = configReader.read($scope.projectList, $scope.issueInfo.p_key);

    $scope.setCurrentProject = function (projectKey){
        $scope.duplicateInfo.pKey = projectKey;

        if($scope.issueInfo.p_key != projectKey){
            $scope.duplicateInfo.showOptionWithVCS = false;
        }
    };

    $scope.pending = false;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


    $scope.duplicate = function () {
        $scope.pending = true;
        if ($scope.signup_form.$valid) {
            var newtitle = stringFormater.filterInput($scope.duplicateInfo.title);

            var pKey = $scope.duplicateInfo.pKey ? $scope.duplicateInfo.pKey : $scope.issueInfo.p_key;
            var iKey = $scope.duplicateInfo.iKey;
            var options = 0;

            options |= $scope.duplicateInfo.withSubIssue ? 1 : 0;
            options |= $scope.duplicateInfo.withAttachment ? 2 : 0;
            options |= $scope.duplicateInfo.withVCS ? 4 : 0;
            issueService.duplicateIssue(newtitle, pKey, iKey, options).then(function (data) {
                $uibModalInstance.dismiss('cancel');
                if(data.code == 0) {
                    toastr.info(newtitle, "问题复制成功");
                    if ($stateParams.pKey == pKey && $scope.sideFlag) {
                        $state.go('project.issue', {pKey: pKey, page: 1, viewIssueNumber: data.data});
                    } else {
                        $stateParams.viewIssueNumber = "";
                        $state.go('project.issue', {pKey: pKey, page: 1});
                    }
                } else {
                    toastr.warning(data.message);
                }
                $scope.pending = false;
            }, function (error) {
                $uibModalInstance.dismiss('cancel');
                toastr.error("请稍后重试");
                $scope.pending = false;
            });
        } else {
            $scope.pending = false;
            $scope.signup_form.submitted = true;
        }
    };

}

function moveIssueCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $filter, constants, $stateParams, issueService, sweetAlert, $controller, $uibModalInstance, toastr, helper) {

    $scope.constants = constants;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.changeIssueProject = function() {
        var pKey = $scope.issueInfo.p_key;
        var iNo = $scope.issueInfo.i_no;
        var field = "project";
        var data = $scope.issueInfo.currentProject.key;

        issueService.update(pKey,iNo,field,data, '').then(function(data) {
            if (data.code == constants.globalFalse) {
                toastr.info("问题已经移动到新的项目");
                $stateParams.viewIssueNumber = "";
                $state.go('project.issue', {'pKey' : data.data.pKey});
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
            toastr.error("网络请求失败");
        });
    };
}

function addFilterCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $filter, constants, $stateParams, issueService, sweetAlert, $controller, $uibModalInstance, toastr, helper) {

    $scope.constants = constants;

    $scope.savedFilerInfo = {};
    $scope.savedFilerInfo.pKey = $scope.pKey;
    $scope.savedFilerInfo.name = '';
    $scope.savedFilerInfo.public = false;
    $scope.savedFilerInfo.filter = $scope.filterData;

    $scope.pending = false;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    var stringFormater = helper.stringFormater();

    $scope.save = function () {
        $scope.pending = true;
        if ($scope.signup_form.$valid) {
            var pKey = $scope.savedFilerInfo.pKey;
            var name = stringFormater.filterInput($scope.savedFilerInfo.name);
            var public = $scope.savedFilerInfo.public ? 1 : 0;
            var filter = angular.toJson($scope.savedFilerInfo.filter);
            issueService.saveIssueFilter (pKey, name, public, filter).then(function(data) {
                if(data.code == constants.returnSuccess) {
                    $scope.loadFilterList();
                    $scope.pending = false;
                    $scope.signup_form.submitted = true;
                    $uibModalInstance.dismiss('cancel');
                } else {
                    toastr.warning(data.message ? data.message : '保存失败，请稍后重试');
                    $scope.pending = false;
                    $scope.signup_form.submitted = true;
                }
            }, function(err) {
                toastr.error("保存失败，请稍后重试");
            });
        } else {
            $scope.pending = false;
            $scope.signup_form.submitted = true;
        }
    };

}


function exportIssueCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, $filter, constants, $stateParams, issueService, sweetAlert, $controller, $uibModalInstance, toastr) {

    $scope.constants = constants;

    $scope.issueExportParam = 'all_xls';

    $scope.pending = false;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.doIssueExport = function() {
        $scope.exportIssues($scope.issueExportParam.split('_')[0], $scope.issueExportParam.split('_')[1]);
        $scope.cancel();
    }
}

///

angular
.module('bugs')
.controller('menuCtrl', menuCtrl)
.controller('settingCtrl', settingCtrl)
.controller('accountCtrl', accountCtrl)
.controller('credentailCtrl', credentailCtrl)
.controller('notificationCtrl', notificationCtrl)
.controller('transactionCtrl', transactionCtrl)
.controller('invoiceCtrl', invoiceCtrl)
.controller('updateInvoiceCtrl', updateInvoiceCtrl)
.controller('upgradeCtrl', upgradeCtrl)
.controller('alipayCtrl', alipayCtrl)
.controller('wechatpayCtrl', wechatpayCtrl)

function menuCtrl($scope, $state) {

    function init() {
        $scope.currentPage = $state.current.name;
        if($scope.currentPage == 'setting') {
            $state.go('setting.profile');
        }
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        init();
    });

    init();
}

function settingCtrl($scope, $state, $element, $rootScope, $http, constants, userService, $uibModal, Upload, $timeout, $sce, $controller, cacheService, helper, toastr){
    $controller('baseCtrl',{ $scope : $scope });
    $scope.constants = constants;
    $scope.userInfo = {};
    $scope.submitting = false;
    $scope.pending = true;

    var stringFormater =  helper.stringFormater();
    $scope.readableSize = stringFormater.readableSize;
    $scope.constants = constants;

    $scope.getUserInfo = function() {
        userService.getUserInfo().then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.userInfo = data.data;
                $scope.userInfo.tel = $scope.userInfo.u_tel;
                $scope.pending = false;
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    $scope.updateUserInfo = function(field, data) {
        $scope.userName = data;
        if (field == 'name' && data.length>15) {
            return "姓名长度不能超过15个";
         }else{
             if (data.length>30) {
                 return "字符长度不能超过30个";
             }else{
                if (field == "name") {
                    data = stringFormater.filterInput(data);
                }
                userService.update(field, data).then(function(data) {
                    if (data.code !== constants.returnSuccess) {
                        toastr.warning(data.message);
                    }
                    else {
                        toastr.info("修改成功");
                        cacheService.clearCache();
                        $rootScope.getUserInfo();
                        $scope.getUserInfo();
                        // 修改项目名称全刷
                        if (field == 'name') {
                            angular.element(".userName").text($scope.userName);
                        }
                    }
                }, function(err) {
                    toastr.error("网络请求失败");
                });
            }
         }
    };

    $scope.getUserInfo();

    $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/api/user/uploadAvatar',
                data: {file: file}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    $scope.userInfo.u_avator = file.result.data.list;
                    toastr.info("修改成功");
                    $rootScope.getUserInfo();
                    angular.element(".header-icon").attr("src", constants.imageQiniu + "/avator/view/avator/" + file.result.data.list + constants.imageCorp);
                    cacheService.clearCache();
                });
            }, function (response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    }
};

function accountCtrl($rootScope, $scope, $http, $state, constants, userService, $controller, settingService, cacheService, $timeout, toastr, helper) {
    $controller('baseCtrl',{$scope:$scope});
    var stringFormater = helper.stringFormater();
    $scope.constants = constants;
    $scope.userInfo = {};
    $scope.callingCodes = {};
    $scope.callingCodeTag = '';
    $scope.callingCodeCommon = '';

    $scope.pending = true;
    $scope.submitting = false;
    $scope.passwordFlag = false;

    $scope.password = {};
    $scope.password.oldPassword = '';
    $scope.password.newPassword1 = '';
    $scope.password.newPassword2 = '';

    $scope.loadingCallingCodes = function(){
        settingService.loadCallingCode().then(function(data){
            if(data.code == constants.returnSuccess){
                $scope.callingCodes = $scope.setCallingCodeTags(data.data);
                $scope.callingCodeCommon = $scope.callingCodes.common;
                delete $scope.callingCodes.common;
            }else{
                toastr.warning(data.message);
            }
        }, function(err){

        });
    };

    $scope.loadingCallingCodes();

    $scope.callingCode = '';

    $scope.changeCallingCode = function(code){
        $scope.callingCode = code;
    }

    //build the category of callingCode
    $scope.setCallingCodeTags = function(data){
        var tagsData = data;

        for(var index in tagsData){
            if(typeof tagsData[index].name == 'string' ){
                var tagName = tagsData[index].name.substr(0,1);

                if($scope.callingCodeTag != tagName){
                    tagsData[index].tagNode = tagName;
                    tagsData[index].tagShowFlag = true;
                    $scope.callingCodeTag = tagName;
                }else{
                    tagsData[index].tagShowFlag = false;
                }
            }
        }

        return tagsData;
    }

    $scope.getUserInfo = function() {
        userService.getUserInfo().then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.userInfo = data.data;
                $scope.pending = false;
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    $scope.getUserInfo();

    $scope.togglePasswordChange = function () {
        $scope.passwordFlag = !$scope.passwordFlag;
        if(!$scope.passwordFlag) {
            $scope.password.oldPassword = '';
            $scope.password.newPassword1 = '';
            $scope.password.newPassword2 = '';
            $scope.submitting = false;
        }
    }

    $scope.changePassword = function () {
        $scope.submitting = true;

        // check form
        if($scope.password.oldPassword.length < 1) {
            toastr.warning('请输入密码');
            $scope.submitting = false;
            return false;
        } else if ($scope.password.newPassword1.length < 6) {
            toastr.warning('密码长度至少6位');
            $scope.password.newPassword1 = '';
            $scope.password.newPassword2 = '';
            $scope.submitting = false;
            return false;
        } else if ($scope.password.newPassword1 != $scope.password.newPassword2) {
            toastr.warning('两次输入不一致');
            $scope.password.newPassword1 = '';
            $scope.password.newPassword2 = '';
            $scope.submitting = false;
            return false;
        }

        // send password request
        settingService.changePassword($scope.password.oldPassword, $scope.password.newPassword1).then(function(data) {
            if (data.code == constants.returnSuccess) {
               toastr.info("修改密码成功, 请使用新密码登录");
               setTimeout(function(){
                   window.location.href = '/user/logout';
               }, 3000);
            } else {
               toastr.warning(data.message);
               $scope.submitting = false;
            }
        }, function(err) {
            toastr.error("网络请求失败");
            $scope.submitting = false;
        });
    }

    // update user info
    $scope.updateUserInfo = function(field, data) {
        $scope.userName = data;
        if (field == 'name' && data.length>10) {
            return "姓名长度不能超过10个";
         }else{
             if (data.length>30) {
                 return "字符长度不能超过30个";
             }else{
                if (field == "job" || field == "company" || field == "location") {
                    data = stringFormater.filterEmoji(data);
                }
                userService.update(field, data).then(function(data) {
                    if (data.code !== constants.returnSuccess) {
                        toastr.warning(data.message);
                    }
                    else {
                        toastr.info("修改成功");
                        cacheService.clearCache();
                        // 修改项目名称全刷
                        if (field == 'name') {
                            angular.element(".userName").text($scope.userName);
                        }
                    }
                    $rootScope.getUserInfo();
                    $scope.getUserInfo();
                }, function(err) {
                    toastr.error("网络请求失败");
                });
             }
         }
    };


    // varify phone number
    $scope.phoneValidationFlag = 0;
    $scope.phoneValidationSubmitting = false;
    $scope.phoneRefetchButtonDisables = false;
    $scope.phoneRefetchButtonText = '60s 后重试';

    $scope.startPhoneValidation = function() {
        $scope.phoneValidationFlag = 1;
    }

    $scope.cancelPhoneValidation = function() {
        $scope.phoneValidationFlag = 0;
    }

    $scope.getCode = function() {
        $scope.phoneValidationSubmitting = true;
        userService.getCode($scope.callingCode, $scope.userInfo.tel).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.phoneValidationFlag = 2;
                $scope.phoneValidationSubmitting = false;
                startCountdown();
            }
            else {
                $scope.phoneValidationSubmitting = false;
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    var phoneValidationCodeCountDown = 60;
    function startCountdown() {
        if(phoneValidationCodeCountDown) {
            $scope.phoneRefetchButtonDisables = true;
            $scope.phoneRefetchButtonText = phoneValidationCodeCountDown + 's 后重试';
            phoneValidationCodeCountDown --;
            $timeout(startCountdown, 1000);
        } else {
            phoneValidationCodeCountDown = 60;
            $scope.phoneRefetchButtonDisables = false;
            $scope.phoneRefetchButtonText = '重新获取';
        }
    }

    $scope.confirmTel = function() {
        $scope.phoneValidationSubmitting = true;
        userService.confirmTel($scope.callingCode, $scope.userInfo.tel, $scope.userInfo.code).then(function(data) {
            $scope.phoneValidationSubmitting = false;
            if (data.code == constants.returnSuccess) {
                toastr.info("验证成功");
                $scope.userInfo.u_tel = $scope.userInfo.tel;
                $scope.userInfo.code = '';
                cacheService.clearCache();
                $scope.getUserInfo();
                $scope.cancelPhoneValidation();
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };


    // change email
    $scope.changeEmailFlag = false;
    $scope.emailChangeSubmitting = false;

    $scope.changeEmailData ={};
    $scope.changeEmailData.password = '';
    $scope.changeEmailData.newEmail = '';

    $scope.toggleEmailChange = function () {
        $scope.changeEmailFlag = !$scope.changeEmailFlag;
        if($scope.changeEmailFlag) {
            $scope.changeEmailData.password = '';
            $scope.changeEmailData.newEmail = '';
        }
    }

    $scope.changeEmail = function() {
        $scope.emailChangeSubmitting = true;
        if($scope.changeEmailData.password.length < 6) {
            toastr.warning('密码长度至少6位');
            $scope.emailChangeSubmitting = false;
            return false;
        } else if($scope.changeEmailData.newEmail == $rootScope.userInfo.u_email) {
            toastr.warning('您输入的邮箱地址正在使用');
            $scope.emailChangeSubmitting = false;
            return false;
        }
        settingService.changeEmail($scope.changeEmailData.password, stringFormater.filterEmoji($scope.changeEmailData.newEmail)).then(function(data) {
            if (data.code == constants.returnSuccess) {
               toastr.info("验证邮件已经发送, 请在验证邮件后请使用新邮箱登录");
               setTimeout(function(){
                   window.location.href = '/user/logout';
               }, 3000);
            } else {
                $scope.emailChangeSubmitting = false;
                toastr.warning(data.message);
                $scope.submitting = false;
            }
        }, function(err) {
            toastr.error("网络请求失败");
            $scope.emailChangeSubmitting = false;
        });

    }
}

function credentailCtrl($scope, $http, $state, constants, userService, $controller, cacheService, toastr) {
    $controller('baseCtrl',{$scope:$scope});

    $scope.constants = constants;
    $scope.userInfo = {};

    $scope.pending = true;

    $scope.getUserInfo = function() {
        userService.getUserInfo().then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.userInfo = data.data;
                $scope.pending = false;
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    $scope.getUserInfo();

    $scope.destroyCredential = function (type) {
        userService.update( 'destroy_credential', type).then( function(data) {
            toastr.info("凭据删除成功");
            cacheService.clearCache();
            $scope.getUserInfo();
        }, function(err) {
        });
    }
}

function notificationCtrl($scope, $http, $state, constants, userService, $controller, cacheService, toastr){
   $controller('baseCtrl',{$scope:$scope});
    $scope.constants = constants;
    $scope.userInfo  = {};
    $scope.userAccount = {};
    $scope.envStatus = window.clientAPI.versionCheck();
    var projectNotify = 0,
        issueNotify = 0,
        inviteNotify = 0;

    $scope.pending = true;

    $scope.getUserInfo = function(firstLoad) {
        userService.getUserInfo().then(function(data) {
            if (data.code == constants.returnSuccess) {

                $scope.pending = false;

                $scope.userInfo = data.data;

                projectNotify = angular.copy($scope.userInfo.u_is_accept_project_active_notify);
                issueNotify = angular.copy($scope.userInfo.u_is_accept_issue_active_notify);
                inviteNotify = angular.copy($scope.userInfo.u_is_accept_invite_notify);

                $scope.userAccount.projectActiveNotify = ($scope.userInfo.u_is_accept_project_active_notify == 0) ? false : true;

                $scope.userAccount.inviteNotify = ($scope.userInfo.u_is_accept_invite_notify == 0) ? false : true;

                $scope.userAccount.issueActiveNotify = ($scope.userInfo.u_is_accept_issue_active_notify == 0) ? false : true;

                // 项目子项
                updateNotifyChild (projectNotify, inviteNotify, issueNotify);

                $scope.userAccount.emailNotify = ($scope.userInfo.u_is_accept_email == 0) ? false : true;
                $scope.userAccount.smsNotify = ($scope.userInfo.u_is_accept_sms_notification == 0) ? false : true;
                $scope.userAccount.progressNotify = ($scope.userInfo.u_is_accept_progress_email == 0) ? false : true;

                //browserNotify
                $scope.userAccount.browserNotify = $scope.userInfo.u_is_accept_browser_notification && $scope.userInfo.u_endpoints.length > 0 ? true : false;

                if( $scope.userAccount.browserNotify) {
                    if(firstLoad) {
                        webNotificationService.subscribe();
                    }
                }
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    // 更新通知子项
    function updateNotifyChild (projectNotify, inviteNotify, issueNotify) {
        $scope.userAccount.deleteProjectActiveNotify = (projectNotify >> constants.deleteProjectActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.deleteProjectActiveNotify);

        $scope.userAccount.newInviteNotify = (inviteNotify >> constants.newInviteNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.newInviteNotify);

        $scope.userAccount.issueTitleActiveNotify = (issueNotify >> constants.issueTitleActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueTitleActiveNotify);
        $scope.userAccount.issueDescribeActiveNotify = (issueNotify >> constants.issueDescribeActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueDescribeActiveNotify);
        $scope.userAccount.issueStatusActiveNotify = (issueNotify >> constants.issueStatusActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueStatusActiveNotify);
        $scope.userAccount.issueAssigneeActiveNotify = (issueNotify >> constants.issueAssigneeActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueAssigneeActiveNotify);
        $scope.userAccount.issuePriorityActiveNotify = (issueNotify >> constants.issuePriorityActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issuePriorityActiveNotify);
        $scope.userAccount.issueNoteActiveNotify = (issueNotify >> constants.issueNoteActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueNoteActiveNotify);
        $scope.userAccount.issueEndtimeActiveNotify = (issueNotify >> constants.issueEndtimeActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueEndtimeActiveNotify);
        $scope.userAccount.issueFollowerActiveNotify = (issueNotify >> constants.issueFollowerActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueFollowerActiveNotify);
        $scope.userAccount.issueDeleteActiveNotify = (issueNotify >> constants.issueDeleteActiveNotify & 1) == 0 ? 0 : $scope.getPrivilageCode(constants.issueDeleteActiveNotify);
    }

    // 获取子项的值
    function getNotifyChildValue(data) {
        var value = 0;
        if (data == 'issue') {
            value = $scope.userAccount.issueTitleActiveNotify | 
                        $scope.userAccount.issueDescribeActiveNotify | 
                        $scope.userAccount.issueStatusActiveNotify | 
                        $scope.userAccount.issueAssigneeActiveNotify | 
                        $scope.userAccount.issuePriorityActiveNotify | 
                        $scope.userAccount.issueNoteActiveNotify | 
                        $scope.userAccount.issueEndtimeActiveNotify | 
                        $scope.userAccount.issueFollowerActiveNotify | 
                        $scope.userAccount.issueDeleteActiveNotify;
        } else if (data == 'project') {
            value = $scope.userAccount.deleteProjectActiveNotify;
        } else if (data == 'invite') {
            value = $scope.userAccount.newInviteNotify;
        }
        return value;
    }

    // 位运算左移
    $scope.getPrivilageCode = function (power) {
        return 1 << power;
    }

    // 项目开关
    $scope.setProjectActiveNotify = function() {
         if ($scope.userAccount.projectActiveNotify) {
            $scope.userAccount.projectActiveNotify = $scope.getPrivilageCode(constants.deleteProjectActiveNotify);
         } else {
            $scope.userAccount.projectActiveNotify = 0;
         }
         $scope.updateAccountSetting('is_accept_project_active_notify', $scope.userAccount.projectActiveNotify);
    }

    // 问题开关
    $scope.setIssueActiveNotify = function() {
        if ($scope.userAccount.issueActiveNotify) {
            $scope.userAccount.issueActiveNotify = $scope.getPrivilageCode(constants.issueTitleActiveNotify) | $scope.getPrivilageCode(constants.issueStatusActiveNotify) | $scope.getPrivilageCode(constants.issueAssigneeActiveNotify) | $scope.getPrivilageCode(constants.issueEndtimeActiveNotify) | $scope.getPrivilageCode(constants.issueFollowerActiveNotify) | $scope.getPrivilageCode(constants.issueDeleteActiveNotify);
        } else {
            $scope.userAccount.issueActiveNotify = 0;
        }
        $scope.updateAccountSetting('is_accept_issue_active_notify', $scope.userAccount.issueActiveNotify);
    }

    // 邀请成员通知开关
    $scope.setInviteNotify = function() {
        if ($scope.userAccount.inviteNotify) {
            $scope.userAccount.inviteNotify = $scope.getPrivilageCode(constants.newInviteNotify);
        } else {
            $scope.userAccount.inviteNotify = 0;
        }
        $scope.updateAccountSetting('is_accept_invite_notify', $scope.userAccount.inviteNotify);
    }

    // 选择项目通知子项,更改父级的值
    $scope.setProjectActiveNotifyChild = function() {
        projectNotifyValue = getNotifyChildValue('project');
        $scope.updateAccountSetting('is_accept_project_active_notify', projectNotifyValue);
    }

    // 选择问题通知子项，更改父级的值
    $scope.setIssueActiveNotifyChild = function() {
        issueNotifyValue = getNotifyChildValue('issue');
        $scope.updateAccountSetting('is_accept_issue_active_notify', issueNotifyValue);
    }

    // 邀请成员通知子项，更改父级的值
    $scope.setInviteNotifyChild = function(val, isCheck) {
        inviteNotifyValue = getNotifyChildValue('invite');
        $scope.updateAccountSetting('is_accept_invite_notify', inviteNotifyValue);
    }

    $scope.setEmailNotify = function() {
        $scope.updateAccountSetting('is_accept_email', $scope.userAccount.emailNotify);
    }

    $scope.setSmsNotify = function() {
        $scope.updateAccountSetting('is_accept_sms_notification', $scope.userAccount.smsNotify);
    }

    $scope.setProgressNotify = function() {
        $scope.updateAccountSetting('is_accept_progress_email', $scope.userAccount.progressNotify);
    }

    $scope.setBrowserNotify = function() {
        if ( $scope.userAccount.browserNotify) {

            if ( !webNotificationService.getServiceStatus()) {
                toastr.warning('暂时不支持此类浏览器通知');
                $scope.userAccount.browserNotify = false;
                return false;
            }
            webNotificationService.subscribe();
        } else {
            $scope.updateAccountSetting('is_accept_browser_notification', $scope.userAccount.browserNotify);
            $scope.userAccount.browserNotify = false;
        }
    }

    $scope.updateAccountSetting = function(field, val) {
        userService.update(field, val).then(function(data) {
            cacheService.clearCache();
            $scope.getUserInfo();
        }, function(err) {
        });
    };

    $scope.destroyCredential = function ( type) {
        userService.update( 'destroy_credential', type).then( function(data) {
            toastr.info("凭据删除成功");
            cacheService.clearCache();
            $scope.getUserInfo();
        }, function(err) {
        });
    }

    function subscribeError(data) {
        if( data.type == 'permission') {
            toastr.info("请设置浏览器允许此站点向您推送消息");
        } else if ( data.type == 'network') {
            toastr.warning('网络故障，请稍后再试');
        } else {
            toastr.warning('订阅失败');
        }
        $scope.userAccount.browserNotify = false;
    }

    function subscribed( data) {
        $scope.userAccount.browserNotify = true;
        $scope.updateAccountSetting('is_accept_browser_notification', $scope.userAccount.browserNotify);
    }

    webNotificationService.onSubscribe = subscribed;
    webNotificationService.onSubscribeError = subscribeError;

    $scope.getUserInfo(true);
};

function transactionCtrl($scope, $http, $state, constants, settingService, $controller, cacheService, toastr) {
    $controller('baseCtrl',{$scope:$scope});

    $scope.constants = constants;

    $scope.pending = true;

    $scope.getPaymentRecord = function() {
        settingService.getPaymentRecord(false).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.pending = false;
                $scope.paymentRecordList = data.data;
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    $scope.getPaymentRecord();

};

function invoiceCtrl($scope, $http, $state, constants, settingService, $controller, cacheService, $uibModal, toastr) {
    $controller('baseCtrl',{$scope:$scope});

    $scope.constants = constants;

    $scope.pending = true;

    $scope.getPaymentRecord = function() {
        settingService.getPaymentRecord(true).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.pending = false;
                $scope.paymentRecordList = data.data;
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    $scope.getPaymentRecord();

    // open popup to add invoice
    $scope.updateInvoce = function (key) {
         $scope.cuurentRequestRechargeKey = key;
         var modalInstance = $uibModal.open({
             templateUrl: 'views/setting/updateInvoice.html',
             size: 'md',
             controller: updateInvoiceCtrl,
             scope:$scope,
             backdrop: 'static',
             keyboard: false
         });
    }
};

function updateInvoiceCtrl($scope, $http, $state, $rootScope, constants, $stateParams, settingService, sweetAlert, $controller, cacheService, $uibModalInstance, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.invoiceData = {};

    //bind recharge record key
    $scope.invoiceData.rechargeKey = $scope.cuurentRequestRechargeKey;
    $scope.formDisabled = true;
    $scope.showInvoiceStatus = false;

    $scope.loadInvoiceData = function() {
        settingService.loadInvoiceInfo($scope.invoiceData.rechargeKey).then(function(data) {
            if (data.code == constants.globalFalse) {
                if(data.data.i_deal_status) {
                    if(data.data.i_deal_status == constants.deliverStatusWaitting || data.data.i_deal_status == constants.deliverStatusClosed) {
                        $scope.formDisabled = false;
                    } else {
                        $scope.formDisabled = true;
                    }
                    $scope.showInvoiceStatus = true;
                    $scope.invoiceStatus = data.data.deliver_text;
                    $scope.invoiceData.title = data.data.i_title;
                    $scope.invoiceData.taxID = data.data.i_tax_id;
                    $scope.invoiceData.address = data.data.i_address;
                    $scope.invoiceData.receiveName = data.data.i_receive_name;
                    $scope.invoiceData.tel = data.data.i_tel;
                } else {
                    $scope.showInvoiceStatus = false;
                    $scope.formDisabled = false;
                }
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
            toastr.error("网络请求失败");
        });
    }

    $scope.loadInvoiceData();

    $scope.build = function () {
        $scope.submitting = true;
        if ($scope.signup_form.$valid) {
            //Submit as normal
            settingService.updateInvoice($.param($scope.invoiceData)).then(function(data) {
                $scope.submitting = false;
                if (data.code == constants.globalFalse) {
                    $scope.ok();
                } else {
                    toastr.warning(data.message);
                }
            }, function(err) {
                toastr.error("网络请求失败");
            });
        } else {
            $scope.submitting = false;
            $scope.signup_form.submitted = true;
        }
     };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.ok = function() {
        $state.reload();
        $uibModalInstance.dismiss('cancel');
    }
};

function upgradeCtrl($scope, $state, constants, $rootScope, upgradeService, $uibModal, $controller, sweetAlert, $stateParams, $timeout, helper, $window, cacheService, userService, toastr) {
    $controller('baseCtrl', {$scope: $scope});

    $scope.init = function() {
        $scope.updatePrice();
    }

    var stringFormater =  helper.stringFormater();
    $scope.readableSize = stringFormater.readableSize;
    $scope.currency = stringFormater.currency;
    $scope.constants = constants;

    // set variable for payment
    $scope.paymentData = {};
    $scope.paymentData.updatedFlag = false;
    $scope.paymentData.productType = constants.productTypeMembershipAdvanced;
    $scope.paymentData.paymethod = constants.payMethodAlipay;
    $scope.paymentData.amount = 1;
    $scope.paymentData.unitPrice = 0;
    $scope.paymentData.totalPrice = 0;
    $scope.paymentData.expriy = false;

    $scope.updatePrice = function () {
        $scope.paymentData.updatedFlag = false;
        upgradeService.updatePrice($scope.paymentData).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.paymentData.unitPrice = data.data.unitPrice;
                $scope.paymentData.totalPrice = data.data.totalPrice;
                $scope.paymentData.discountSetting = data.data.discountArray;
                $scope.paymentData.expriyAdvanced = data.data.expriyAdvanced;
                $scope.paymentData.expriyProfessional = data.data.expriyProfessional;
                $scope.paymentData.expriyCustomized = data.data.expriyCustomized;
                $scope.paymentData.updatedFlag = true;
            } else {
                toastr.warning(data.message);
                $scope.paymentData.updatedFlag = false;
            }
        }, function(err){
            toastr.error("网络请求失败");
            $scope.paymentData.updatedFlag = false;
        });
    }

    $scope.setProductType = function(productType) {
        /*if($scope.userInfo.u_membership == constants.productTypeMembershipProfessional && productType == constants.productTypeMembershipAdvanced) {
            notify({
                message:'专业版用户只能续费专业版用户',
                classes: 'alert-danger',
                duration: 3000
            });
            $scope.paymentData.productType = constants.productTypeMembershipProfessional;
            $scope.updatePrice();
        } else {*/
            $scope.paymentData.productType = productType;
            $scope.updatePrice();
        /*}*/
    }

    // order payment status
    $scope.orderSubmittingFlag = false;
    $scope.paymentWindow = false;

    $scope.submitOrder = function () {

        $scope.orderSubmittingFlag = true;

        if($scope.paymentData.paymethod == constants.payMethodAlipay) {
            $scope.paymentWindow = window.open('about:blank');
        }

        upgradeService.submitOrder($scope.paymentData).then(function(data) {
            if(data.code == constants.returnSuccess) {

                $scope.makePayment(data.data.key, data.data.type, true);

            } else {
                toastr.warning(data.message);
                newWindow.close();
            }
            $scope.orderSubmittingFlag = false;
        }, function(err){
            toastr.error("网络请求失败");
            $scope.orderSubmittingFlag = false;
            newWindow.close();
        });
    }

    $scope.makePayment = function(rrKey, method, windowFlag) {
        if(method == constants.payMethodAlipay) {
            if(!windowFlag) {
                // open window
                $scope.paymentWindow = window.open('about:blank');
            }
            // set timeout for setting window url
            $timeout(function() {
                $scope.paymentWindow.location.href = '/pay/transfer?key=' + rrKey;
                window.clientAPI.openWindow({url: '/pay/transfer?key=' + rrKey, closeFn: function () {$scope.paymentWindow.close()}});
            }, 1);
            // open modal

            $scope.currentPaymentRechargeKey = rrKey;
            var modalInstance = $uibModal.open({
                templateUrl: 'views/setting/alipay.html',
                size: 'md',
                controller: alipayCtrl,
                scope:$scope,
                backdrop: 'static',
                keyboard: false
            });

        } else if (method == constants.payMethodWechat) {
            // open modal for getting qr code

            $scope.currentPaymentRechargeKey = rrKey;
            var modalInstance = $uibModal.open({
                templateUrl: 'views/setting/wechatpay.html',
                size: 'md',
                controller: wechatpayCtrl,
                scope:$scope,
                backdrop: 'static',
                keyboard: false
            });

        }
    }

    $scope.getUserInfo = function() {
        $scope.pending = true;
        userService.getUserInfo().then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.userInfo = data.data;
                if($scope.userInfo.u_membership == 2 || $scope.userInfo.u_membership == 3) {
                    $scope.paymentData.productType = constants.productTypeMembershipAdvanced;
                }
                upgradeService.getProducQuotaConfig().then(function(data) {
                    if (data.code == constants.returnSuccess) {
                        $scope.productConfig = data.data;
                        $scope.pending = false;
                    }
                }, function(err) {
                });
            }
            else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    };

    $scope.getUserInfo();

    $scope.getProducQuotaConfig = function() {
        $scope.pending = true;
        upgradeService.getProducQuotaConfig().then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.userInfo = data.data;
                $scope.pending = false;
            }
        }, function(err) {
        });
    };

    $scope.getDiscountText = function (amount, discountArray) {
        amount --;
        var discount = amount < discountArray.length ? discountArray[amount] * 100 :  discountArray[discountArray.length - 1] * 100;

        if(discount >= 100 || discount < 0) {
            return '';
        } else if (discount == 0)  {
            return '免费';
        } else {
            if(discount % 10) {
                return discount + '折';
            } else {
                return discount / 10 + '折';
            }
        }
    }

};

function alipayCtrl($scope, $http, $state, $rootScope, constants, $stateParams, settingService, sweetAlert, $controller, cacheService, $uibModalInstance, upgradeService, $timeout, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.invoiceData = {};

    $scope.cancel = function() {
        $timeout.cancel($scope.timeout);
        $state.go('setting.profile');
        $uibModalInstance.dismiss('cancel');
    }

    $scope.ok = function() {
        $timeout.cancel($scope.timeout);
        $state.go('setting.profile');
        $uibModalInstance.dismiss('cancel');
    }

    checkPayStatus();

    function checkPayStatus() {
        upgradeService.checkPayStatus($scope.currentPaymentRechargeKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                toastr.info("支付成功");
                paySuccess();
            } else {
                /*notify.closeAll();
                notify({
                    message: '正在等待支付...',
                    classes: 'alert-danger',
                    duration: 2000
                });*/
                $timeout.cancel($scope.timeout);
                $scope.timeout = $timeout(checkPayStatus, 2000);
            }
        }, function(err){
            /*notify.closeAll();
            notify({
                message: '正在等待支付...',
                classes: 'alert-danger',
                duration: 2000
            });*/
            $timeout.cancel($scope.timeout);
            $scope.timeout = $timeout(checkPayStatus, 2000);
        });
    }

    function paySuccess() {
        cacheService.clearCache();
        $state.go('setting.profile');
    }

    checkPayStatus();

};

function wechatpayCtrl($scope, $http, $state, $rootScope, constants, $stateParams, settingService, sweetAlert, $controller, cacheService, $uibModalInstance, upgradeService, $timeout, toastr) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;

    $scope.cancel = function() {
        $timeout.cancel($scope.timeout);
        $state.go('setting.profile');
        $uibModalInstance.dismiss('cancel');
    }

    $scope.ok = function() {
        $timeout.cancel($scope.timeout);
        $state.go('setting.profile');
        $uibModalInstance.dismiss('cancel');
    }


    function checkPayStatus() {
        upgradeService.checkPayStatus($scope.currentPaymentRechargeKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                toastr.info("支付成功");
                paySuccess();
            } else {
                /*notify.closeAll();
                notify({
                    message: '正在等待支付...',
                    classes: 'alert-danger',
                    duration: 2000
                });*/
                $timeout.cancel($scope.timeout);
                $scope.timeout = $timeout(checkPayStatus, 2000);
            }
        }, function(err){
            /*notify.closeAll();
            notify({
                message: '正在等待支付...',
                classes: 'alert-danger',
                duration: 2000
            });*/
            $timeout.cancel($scope.timeout);
            $scope.timeout = $timeout(checkPayStatus, 2000);
        });
    }

    function paySuccess() {
        cacheService.clearCache();
        $state.go('setting.profile');
    }

    checkPayStatus();

};




angular
    .module('bugs')
    .controller('headCtrl', headCtrl)
    .controller('searchCtrl', searchCtrl)

function headCtrl($scope, $http, $state, $rootScope, $timeout, constants, searchService, $stateParams,  $element, sweetAlert, $sce, $controller, userService, $cookies, projectService, helper, constants, toastr, cacheService)  {
    $controller('baseCtrl', {$scope : $scope});
    $scope.pKey = $stateParams.pKey;
    var keydata = $element.find('.search-result');
    $scope.project = {};
    $scope.project.keywords = $stateParams.keywords;
    $scope.projects = {};
    $scope.msg = {};
    $scope.error = {};
    $scope.error.message = "请输入反馈内容";

    $scope.unread = true;
    $scope.read = false;
    $scope.isOver = true;
    $scope.unreadChartCount = 0;

    $scope.notificationStatus = {
        expand: false,
        pending: false,
        empty: false,
        currentTab: 0,
        currentPage: 1,
        currentList: [],
    }

    $scope.toggleChats = function($event) {
        $scope.chatsBarStatus = $rootScope.toggleChats();
    }

    $rootScope.$watch('chatsBarStatus', function (newValue, oldValue) {
        $scope.chatsBarStatus = $rootScope.chatsBarStatus;
    }, true);

    $rootScope.$watch('unreadChartCount', function (newValue, oldValue) {
        $scope.unreadChartCount = $rootScope.unreadChartCount;
    }, true);

    $scope.toggleTab = function(tabID) {

        if($scope.notificationStatus.currentTab == tabID) {
            return true;
        }

        $scope.notificationStatus.currentTab = tabID;
        $scope.notificationStatus.currentPage = 1;
        $scope.notificationStatus.currentList = [];
        $scope.notificationStatus.pending = true;

        $scope.getNotificationList();
    }

    $scope.getNotificationList = function () {

        $scope.notificationStatus.pending = true;
        var param = {
            typeID: $scope.notificationStatus.currentTab,
            page: $scope.notificationStatus.currentPage,
            size: 20,
        };

        userService.getNotificationList($.param(param)).then(function(data) {
            $scope.notificationStatus.pending = false;
            var dataList = data.data.list;
            
            if(dataList.length < param.size) {
                $scope.notificationStatus.empty = true;
            } else {
                $scope.notificationStatus.empty = false;
            }

            for(var index in data.data.list) {
                $scope.notificationStatus.currentList.push(dataList[index]);
            }
        }, function(err) {
        });

        $('#notification-list').off('scroll', loadingTrigger);
        $('#notification-list').on('scroll', loadingTrigger);
        $(document).off('click', closeTrigger);
        $(document).on('click', closeTrigger);

    }

    $scope.setAsRead = function(tabIndex, ncKey, fromReadTrigger) {
        if(ncKey) {
            userService.setAsRead(ncKey).then(function(data){
                if(!fromReadTrigger) {
                    angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                }
            }, function(error){});
        } else if (tabIndex == 2) {
            $scope.setSystemRead();
            $('.unread').removeClass('unread');
        } else if (tabIndex == 1) {
            $scope.setDmRead();
            $('.unread').removeClass('unread');
        } else if (tabIndex == 0) {
            $scope.setRead();
            $('.unread').removeClass('unread');
        }
    }

    // connect to API
    window.clientAPI.setNotificationAsRead = function (data) {
        $scope.setAsRead(data.type, data.key);
    }

    function loadingTrigger() {
        var scrollTop = $(this).scrollTop();
        var contentHeight = $('#notification-list .list').height();
        var elementHeight = $(this).height();
        if(scrollTop + elementHeight >= contentHeight - 10) {
            if(!$scope.notificationStatus.pending && !$scope.notificationStatus.empty) {
                $scope.notificationStatus.currentPage ++;
                $scope.getNotificationList();
            }
        }
    }

    function readTrigger() {
        var dataIndex = $(this).attr('notification-index');
        var data = $scope.notificationStatus.currentList[dataIndex];
        if(data) {
            data.nu_is_read = 1;
            //$scope.isOver = true;
            $scope.$apply();
            //$(document).off('click',closeTrigger);
            //$('body').css('overflow', 'auto');
            $scope.setAsRead($scope.notificationStatus.currentTab, data.nc_key, true);
            angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
            
        }
    }

    function closeTrigger(e) {
        if(!$scope.isOver) {
            var $eventElement = $(e.target)[0];
            var $container = $('#right-sidebar')[0];
            if(!$.contains($container, $eventElement)) {
                closeSideBar();
            }
        }
    }

    function closeSideBar() {
        $scope.isOver = true;
        $scope.$apply();
        $(document).off('click',closeTrigger);
        $('body').css('overflow', '');
    }

    function stopScroll() {
        $('body').css('overflow', 'hidden');
    }


    $(document).off('click', '#notification-list .list .item', readTrigger);
    $(document).off('click', '#notification-side-bar-header', closeSideBar);
    $(document).on('click', '#notification-list .list .item', readTrigger);
    $(document).on('click', '#notification-side-bar-header', closeSideBar);

    var stopScrollTimer;
    $scope.showNotice = function () {

        if(!$scope.isOver) {
            //$scope.isOver = true;
            //$(document).off('click',closeTrigger);
            //$('body').css('overflow', 'auto');
            return true;
        }

        $scope.isOver = false;
       
        if(stopScrollTimer) {
            $timeout.cancel(stopScrollTimer);
        }
        stopScrollTimer = $timeout(stopScroll, 10);

        $scope.notificationStatus = {
            expand: false,
            pending: false,
            empty: false,
            currentTab: 0,
            currentPage: 1,
            currentList: [],
        }

        //$scope.getNotificationList();
        $timeout($scope.getNotificationList, 500);

        return true;
        var notice = angular.element('#inbox-view');

        if($scope.isOver == false) {
            notice.slideDown(300);

            $scope.getNotificationCount(false);
            $scope.getSystemNoticeCount(true);
            $scope.getDmNoticeCount(true);

            if($scope.read) {
                $scope.loadNotifyCount();
            }

            if($scope.sysread) {
                $scope.loadSystemNotifyCount();
            }

            if($scope.dmread) {
                $scope.loadDmNotifyCount();
            }

        }else{
            notice.slideUp(300);
        }

        document.documentElement.style.overflow = $scope.isOver == true ? 'auto' : 'hidden';
    }

    $scope.closeNotice = function () {
        var notice = angular.element('#inbox-view');
        notice.slideUp(300);
        $scope.isOver = $scope.isOver === false ? true: false;
        document.documentElement.style.overflow = $scope.isOver == true ? 'auto' : 'hidden';
    }

    $scope.showIssueNotice = true;
    $scope.showSystemNotice = false;
    $scope.showDmNotice = false;
    $scope.showChange = function (part) {
        if (part == 'showIssueNotice' && !$scope.showIssueNotice) {
            $scope.showIssueNotice = !$scope.showIssueNotice;
            if ($scope.showIssueNotice) {
                $scope.showSystemNotice = false;
                $scope.showDmNotice = false;
            }
            $scope.unread = true;
            $scope.read = false;
            $scope.getNotificationCount();
        }

        if (part == 'showSystemNotice' && !$scope.showSystemNotice) {
            $scope.showSystemNotice = !$scope.showSystemNotice;
            if ($scope.showSystemNotice) {
                $scope.showIssueNotice = false;
                $scope.showDmNotice = false;
            }
            $scope.unSysread = true;
            $scope.sysread = false;
            $scope.getSystemNoticeCount();
        }

        if (part == 'showDmNotice' && !$scope.showDmNotice) {
            $scope.showDmNotice = !$scope.showDmNotice;
            if ($scope.showDmNotice) {
                $scope.showIssueNotice = false;
                $scope.showSystemNotice = false;
            }
            $scope.unDmread = true;
            $scope.dmread = false;
            $scope.getDmNoticeCount();
        }
    }

    $scope.ticketCount = 0;

    $scope.getTicketCount = function() {
        userService.getTicket().then(function(data) {
            $scope.ticketCount = data.data.count;
        }, function(err) {
        });
    }

    $scope.getTicketCount();

    $scope.submitted = false;
    $scope.sendMsg = function () {
        if ($scope.msg.message) {
           if($scope.msg.message.length > 1000){
               $scope.submitted = true;
               $scope.error.message = "反馈内容不能超过1000个字符";
           }else{
               $scope.submitted = false;
               searchService.feedback($.param($scope.msg)).then(function(data) {
               toastr.info("反馈成功");
               $scope.msg.message = "";
               $("#feedback").removeClass("open");
               }, function(err) {

               });
               $scope.submitting = false;
           }
        } else {
            $scope.submitted = true;
            $scope.submitting = false;
        }
    };


    $scope.getUserInfo = function() {
        userService.getUserInfo().then(function(data) {
            if (data.code == constants.returnSuccess) {
                angular.element(".userName").text(data.data.u_name);
                angular.element(".header-icon").attr("src", constants.imageQiniu + "/avator/view/avator/" + data.data.u_avator + constants.imageCorp);
                $scope.membership = {};
                $scope.membership.labelClass = data.data.membership_class;
                $scope.membership.labelName = data.data.membership_name;
            }
            else {
            }
        }, function(err) {
        });
    };

    $scope.setRead = function() {
        userService.setAllRead().then(function(data) {
                // 将数量设置为0
                $scope.notificationCount = 0;
                angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
        }, function(err) {
        });
    }

    $scope.setSystemRead = function() {
        userService.setSystemAllRead().then(function(data) {
                // 将数量设置为0
                $scope.systemNotificationCount = 0;
                angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
        }, function(err) {
        });
    }

    $scope.setDmRead = function() {
        userService.setDmAllRead().then(function(data) {
                // 将数量设置为0
                $scope.dmNotificationCount = 0;
                angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
        }, function(err) {
        });
    }

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.isLoaded = false;
    $scope.listNotification = {};
    $scope.notify = {};

    $scope.loadNotifyCount = function() {
        userService.getNotifyCount().then(function(data) {
            $scope.conf.totalItems = data.data.count;
            $scope.conf.currentPage = 1;
        }, function(err) {
        });
    };

    $scope.loadNotifyList = function (page, size, callback) {
        $scope.isLoaded = true;
        $scope.notify.page = page;
        $scope.notify.perpage = size;
        $scope.notify.type = 'read';
        userService.allNotifications($.param($scope.notify)).then(function(data) {
        $scope.listNotification = data.data.list;
    }, function(err) {
        });
    };

    $scope.notificationCount = 0;
    $scope.getNotificationCount = function(ignorePaging) {
        userService.getNotifications().then(function(data) {
            $scope.notificationCount = data.data.count;
            if(!ignorePaging) {
                $scope.conf.totalItems = data.data.count;
                $scope.conf.currentPage = 1;
            }
        }, function(err) {
        });
    }

    $scope.isUnLoaded = false;
    $scope.unNotify = {};
    $scope.notificationUnread = {}
    $scope.loadNotifyUnreadList = function (page, size, callback) {
        $scope.isUnLoaded = false;
        $scope.unNotify.page = page;
        $scope.unNotify.perpage = size;
        $scope.unNotify.type = 'unread';
        userService.allNotifications($.param($scope.unNotify)).then(function(data) {
        $scope.isUnLoaded = true;
        $scope.notificationUnread = data.data.list;
    }, function(err) {
        });
    };

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.loadSystemNotifyCount = function() {
        userService.getSystemNotifyCount().then(function(data) {
            $scope.conf.totalItems = data.data.count;
            $scope.conf.currentPage = 1;
        }, function(err) {
        });
    };

    $scope.isSystemLoaded = false;
    $scope.listSystemNotification = {};
    $scope.systemNotify = {};
    $scope.loadSystemNotifyList = function (page, size, callback) {
        $scope.isSystemLoaded = true;
        $scope.systemNotify.page = page;
        $scope.systemNotify.perpage = size;
        $scope.systemNotify.type = 'read';
        userService.allSystemNotifications($.param($scope.systemNotify)).then(function(data) {
        $scope.listSystemNotification = data.data.list;
    }, function(err) {
        });
    };

    $scope.systemNotificationCount = 0;
    $scope.getSystemNoticeCount = function (ignorePaging) {
        userService.getSystemNotifications().then(function(data) {
            $scope.systemNotificationCount = data.data.count;
            if(!ignorePaging) {
                $scope.conf.totalItems = data.data.count;
                $scope.conf.currentPage = 1;
            }
        }, function(err) {
        });
    }

    $scope.isUnSystemLoaded = false;
    $scope.listUnSystemNotification = {};
    $scope.systemUnNotify = {};
    $scope.loadUnSystemNotifyList = function (page, size, callback) {
        $scope.isUnSystemLoaded = true;
        $scope.systemUnNotify.page = page;
        $scope.systemUnNotify.perpage = size;
        $scope.systemUnNotify.type = 'unread';
        userService.allSystemNotifications($.param($scope.systemUnNotify)).then(function(data) {
        $scope.listUnSystemNotification = data.data.list;
    }, function(err) {
        });
    };

    $scope.isDmLoaded = false;
    $scope.listDmNotification = {};
    $scope.dmNotify = {};

    $scope.loadDmNotifyCount = function() {
        userService.getDmNotifyCount().then(function(data) {
            $scope.conf.totalItems = data.data.count;
            $scope.conf.currentPage = 1;
        }, function(err) {
        });
    };

    $scope.loadDmNotifyList = function (page, size, callback) {
        $scope.isDmLoaded = true;
        $scope.dmNotify.page = page;
        $scope.dmNotify.perpage = size;
        $scope.dmNotify.type = 'read';
        userService.allDmNotifications($.param($scope.dmNotify)).then(function(data) {
        $scope.listDmNotification = data.data.list;
    }, function(err) {
        });
    };

    $scope.dmNotificationCount = 0;
    $scope.getDmNoticeCount = function (ignorePaging) {
        userService.getDmNotifications().then(function(data) {
                $scope.dmNotificationCount = data.data.count;
                if(!ignorePaging) {
                    $scope.conf.totalItems = data.data.count;
                    $scope.conf.currentPage = 1;
                }
       }, function(err) {
       });
    }

    $scope.isUnDmLoaded = false;
    $scope.listUnDmNotification = {};
    $scope.dmUnNotify = {};

    $scope.loadUnDmNotifyList = function (page, size, callback) {
        $scope.isUnDmLoaded = true;
        $scope.dmUnNotify.page = page;
        $scope.dmUnNotify.perpage = size;
        $scope.dmUnNotify.type = 'unread';
        userService.allDmNotifications($.param($scope.dmUnNotify)).then(function(data) {
        $scope.listUnDmNotification = data.data.list;
    }, function(err) {
        });
    };

   $scope.changeType = function (val) {
       if (val == 1) {
           $scope.unread = true;
           $scope.read = false;
           $scope.getNotificationCount();
       } else if (val == 2) {
           $scope.unread = false;
           $scope.read = true;
           $scope.loadNotifyCount();
       } else if (val == 3) {
           $scope.unSysread = true;
           $scope.sysread = false;
           $scope.getSystemNoticeCount();
       } else if (val == 4) {
           $scope.unSysread = false;
           $scope.sysread = true;
           $scope.loadSystemNotifyCount();
       } else if (val == 5) {
           $scope.unDmread = true;
           $scope.dmread = false;
           $scope.getDmNoticeCount();
       } else if (val == 6) {
           $scope.unDmread = false;
           $scope.dmread = true;
           $scope.loadDmNotifyCount();
       }
   }

   var cookieName = "new-20160826";
   $scope.hasNew = $cookies.get(cookieName);
   $scope.turnNew = function () {
       var expireDate = new Date();
       expireDate.setDate(expireDate.getDate() + 3600*24*100);
       $cookies.put(cookieName, 'true', {'expires': expireDate.toUTCString()});
       window.open("http://blog.pgyer.com/archives/category/bug-%E7%AE%A1%E7%90%86%E4%BA%91%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97", '_blank');
   }

    // set project list
    $scope.projectList = {stared: [], created: [], joined: []};
    $scope.currentProjectName = '项目';
    loadProjectList();
    $scope.refreshProjectList = function() {
        loadProjectList();
    }
    function loadProjectList() {
        $scope.projectList = {stared: [], created: [], joined: []};
        projectService.getProjectList().then(function(data) {
            if(data.code == constants.returnSuccess) {
                var projectList = data.data;
                $scope.projectCount = 0;
                for(var index in projectList) {
                    if(!projectList[index].recycled) {
                        if(projectList[index].starFlag) {
                            $scope.projectList.stared.push(projectList[index]);
                        } else if(projectList[index].creatorFlag) {
                            $scope.projectList.created.push(projectList[index]);
                        } else {
                            $scope.projectList.joined.push(projectList[index]);
                        }
                        $scope.projectCount ++;
                    }
                    if(projectList[index].key == $scope.pKey) {
                        $scope.currentProjectName = projectList[index].label;
                    }
                    if($scope.projectCount < 6) {
                        $scope.showProjectListArrow = false;
                    } else {
                        $scope.showProjectListArrow = true;
                    }

                }
            } else {
                fail();
            }
        }, function(err) {
            fail();
        });

        function fail() {
            toastr.error("获取项目列表设置失败 3秒后将再次尝试");
            cacheService.clearCache();
            window.setTimeout(loadProjectList, 3000);
        }
    }

    $scope.changeProject = function (pKey) {
        var currentPage = $state.current.name;
        var currentProjectKey = $stateParams.pKey;
        var nojumpFlag = false;
        var noJumpPattern = [/^dashboard$/, /^activity$/, /^widget$/, /^project\.(issue|file|wikis|wiki|wikiIndex|version|statistics|workbench)$/, /^project.setting.*/];
        if(currentProjectKey && currentProjectKey != pKey) {
            for(var patternIndex in noJumpPattern) {
                if(currentPage.match(noJumpPattern[patternIndex])) {
                    nojumpFlag = true;
                    break;
                }
            }
            if(nojumpFlag) {
                $state.go(currentPage, {pKey: pKey});
                return null;
            } else {
                $state.go("project.dashboard", {pKey: pKey});
                return null;
            }
        } else {
            // do nothing
            $state.go("project.dashboard", {pKey: pKey});
            return null;
        }
    };

    $scope.showProjectListArrow = true;
    function arrowController() {
        var $dom = $('#project-list-arrow ul');
        $dom.on('scroll', function(e){
            if($scope.projectCount < 6) {
                $scope.showProjectListArrow = false;
                $scope.$apply();
                return true;
            }
            var ulHeight = $dom.height();
            var scrollTop = $dom.scrollTop();
            var scrollHeight = $dom[0].scrollHeight;

            if (ulHeight + scrollTop == scrollHeight) {
                $scope.showProjectListArrow = false;
                $scope.$apply();
            } else {
                $scope.showProjectListArrow = true;
                $scope.$apply();
            }
        });
    }
    arrowController();
};

function searchCtrl($scope, $location, $anchorScroll,  $http, $state, $rootScope, constants, searchService, $stateParams,  $element, sweetAlert, $sce, $controller, toastr)  {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.project = {}
    $scope.project.pKey = $stateParams.pKey;
    $scope.pKey = $stateParams.pKey;
    $scope.project.keywords = $stateParams.keywords;
    $scope.show = false;
    $scope.loading = true;

    $scope.setpKey  = function(val){
        $scope.project.pKey = val;
    }


    //angular.element(document.getElementById('header')).scope().setKeywords($scope.project.keywords);
    $scope.project.page = 1;
    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 15,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };
    $scope.project.perpage = $scope.conf.itemsPerPage;

    $scope.getSearchCount = function (keywords) {
         if(keywords){ $scope.project.keywords = keywords}
        searchService.getSearchCount($.param($scope.project)).then(function(data) {
            $scope.conf.totalItems = data.count;
            $scope.conf.currentPage = 1;
            }, function(err) {
        });
    }

    $scope.getSearchList = function (page, size, callback, keywords) {
        if(keywords){ $scope.project.keywords = keywords}
        $scope.project.page = page;
        $scope.project.perpage = size;
        searchService.getSearchList($.param($scope.project)).then(function(data) {
            $scope.list = data;
            $scope.loading = false;
         }, function(err) {

        });
   }

    $scope.getProjectList = function (keywords) {
        if(keywords){ $scope.project.keywords = keywords;  }
        searchService.getProjectList($.param($scope.project)).then(function(data) {
                $scope.projectList = data.list;
                $scope.isExisIssue = data.isExisIssue;
                $scope.isExisFile = data.isExisFile;
         }, function(err) {
        });
   }

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('searchCtrl');
            $anchorScroll();
        }
    });

   $scope.downloadFile = function (key, name) {
       var host = window.location.host;
       var url  = 'http://' + host + "/file/view/files/" + key + "/" + name;
       sweetAlert.swal({
            title: "您确定下载文件 \"" + name + "\" 吗？",
            showCancelButton: true,
            confirmButtonColor: "#34495e",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
         },
        function (isConfirm) {
            if (isConfirm) {
               window.open(url, '_blank', '');
            }
        });
   }

    $scope.project.types = [];
    $scope.project.projects = [];

    $scope.getType = function(val, str){
        $scope.project.types = $scope.dealArr($scope.project.types, val, str);
        $scope.getSearchCount();
        $scope.getSearchList(1, $scope.conf.itemsPerPage);
        $scope.show = true;
    };
    $scope.getProject = function(val, str){
        $scope.project.projects = $scope.dealArr($scope.project.projects, val, str);
        $scope.getSearchCount();
        $scope.getSearchList(1, $scope.conf.itemsPerPage);
        $scope.show = true;
    };

    $scope.dealArr = function(arr, val, str){
        if(val==false){
            for(i=0; i< arr.length; i++){
                if(arr[i] == str){
                    arr.splice(i,1);
                }
            }
        }else{
         arr.push(str);
        }
       return arr;
    };

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.myKeyup = function(){
            if($scope.project.keywords){
                $scope.show = true;
                $scope.getSearchCount();
                $scope.getSearchList(1, $scope.conf.itemsPerPage);
            }
    };


    $scope.typeClass = function(data){
        if(data == $scope.constants.issuesBug){
            return $scope.constants.issuesBugCss;
        }else if(data == $scope.constants.issuesFeature){
            return $scope.constants.issuesFeatureCss;
        }else if(data == $scope.constants.issuesTask){
            return $scope.constants.issuesTaskCss;
        }
    };

    $scope.levelClass = function(data){
        if(data == $scope.constants.issuesHigh){
            return $scope.constants.issuesHighCss;
        }else if(data == $scope.constants.issuesMiddle){
            return $scope.constants.issuesMiddleCss;
        }else if(data == $scope.constants.issuesLow){
            return $scope.constants.issuesLowCss;
        }
    };

}

angular
.module('bugs')
.controller('activityListCtrl', activityListCtrl);

function activityListCtrl($scope, $location, $anchorScroll, $window, $http, $filter, $state, $rootScope, constants, activityService, $stateParams, $sce, projectService, dashboardService) {
    $scope.constants = constants;
    $scope.activityAllList = {};
    $scope.projectList = {};
    $scope.currentProject = {};
    $scope.activity = {};
    $scope.activity.pKeys = [];
    $scope.isLoaded = false;
    var pKey = $stateParams.pKey;

    if (pKey) {
        $scope.activity.pKeys.push(pKey);
    }

    $scope.pKey = pKey;

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.loadActivityCount = function() {
        $scope.isLoaded = false;
        activityService.getActivityCount($.param($scope.activity)).then(function(data) {
            $scope.conf.totalItems = data.data.count;
            $scope.conf.currentPage = 1;
        }, function(err) {
        });
        $scope.isLoaded = true;
    };

    $scope.loadActivityList = function (page, size, callback) {
        $scope.activity.page = page;
        $scope.activity.perpage = size;
        activityService.getActivityList($.param($scope.activity)).then(function(data) {
        $scope.activityAllList = data.data.list;
    }, function(err) {
        });
    };

    $scope.deliberatelytrustdangeroussnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    // 用户项目列表
    $scope.getProjectList = function () {
        projectService.getUserProjectList().then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.projectList = data.data.list;
                var currentProject = $filter('filter')($scope.projectList, {p_key: pKey});
                $scope.currentProject = currentProject.length ? currentProject[0] : '';

                $scope.projectChecked();
            }

        }, function(err) {
        });
    }

    $scope.projectChecked = function () {
        angular.forEach($scope.projectList, function(value, key) {
            var index = $scope.activity.pKeys.indexOf(value.p_key);
            $scope.projectList[key].is_checked = false;

            if (index >= 0) {
                $scope.projectList[key].is_checked = true;
            }
        });
    }

    $scope.getProjectList();

    $scope.setSearch = function (value, selPKey) {
        if (value == true) {
            $scope.activity.pKeys.push(selPKey);
            $scope.loadActivityCount();
            $scope.loadActivityList(1, $scope.conf.itemsPerPage);
            $scope.projectChecked();
        } else {
            if (selPKey == pKey) {
                $scope.activity.pKeys.splice($scope.activity.pKeys.indexOf(selPKey), 1);
                $scope.activity.pKeys.splice($scope.activity.pKeys.indexOf(selPKey), 1);
            }

            $scope.activity.pKeys.splice($scope.activity.pKeys.indexOf(selPKey), 1);
            $scope.loadActivityCount();
            $scope.loadActivityList(1, $scope.conf.itemsPerPage);
            $scope.projectChecked();
        }
    }

    $scope.goBack = function() {
        $window.history.back();
    };

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('activityList');
            $anchorScroll();
        }
    });

};

///

angular
.module('bugs')
.controller('nopageCtrl', nopageCtrl);

function nopageCtrl($scope, $http, $state, $rootScope, constants, activityService, $stateParams) {
    $scope.constants = constants;
};

angular
.module('bugs')
.controller('notifyCtrl', notifyCtrl)

function notifyCtrl($scope, $http, $state, $rootScope, constants, userService, $sce, $location, $anchorScroll) {
    $scope.constants = constants;
    $scope.isLoaded = false;
    $scope.listNotification = {};
    $scope.notify = {};

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.loadNotifyCount = function() {
        $scope.isLoaded = false;
        userService.getNotifyCount().then(function(data) {
            $scope.conf.totalItems = data.data.count;
            $scope.conf.currentPage = 1;
        }, function(err) {
        });
        $scope.isLoaded = true;
    };

    $scope.loadNotifyList = function (page, size, callback) {
        $scope.notify.page = page;
        $scope.notify.perpage = size;
        userService.allNotifications($.param($scope.notify)).then(function(data) {
        $scope.listNotification = data.data.list;
    }, function(err) {
        });
    };

    $scope.deliberatelyTrustDangerousSnippet = function(value) {
        return $sce.trustAsHtml(value);
    };

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('noticeList');
            $anchorScroll();
        }
    });
}

angular
    .module('bugs')
    .controller('wikiCtrl', wikiCtrl)
    .controller('wikiAddCtrl', wikiAddCtrl)
    .controller('wikiEditCtrl', wikiEditCtrl)
    .controller('wikiIndexCtrl', wikiIndexCtrl)
    .controller('wikiHistoryCtrl', wikiHistoryCtrl)
    .controller('wikiDeleteCtrl', wikiDeleteCtrl)
    .controller('wikiIndexesCtrl', wikiIndexesCtrl)
    .controller('fileUploadCtrl', fileUploadCtrl)
    .controller('wikiAnnotateCtrl', wikiAnnotateCtrl);

function wikiIndexCtrl($scope, $http, $state, $sce, $rootScope, constants, wikiService, $stateParams, $element, sweetAlert, toastr, helper, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiInfo = {};
    $scope.isLoaded = false;
    $scope.deleting = false;

    var pKey = $stateParams.pKey;

    var shortcut = 'Wiki';
    $scope.shortcut = shortcut;

    $scope.loadWiki = function () {
        wikiService.getWikiInfo(pKey, shortcut).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.wikiInfo = data.data;
                $scope.wikiInfo.w_content = $sce.trustAsHtml($scope.wikiInfo.w_content);
            }

        }, function(err) {
        });
    };

    $scope.UAC = {
        wikiChange: false,
        wikiDelete: false,
        wikiAttachmentChange: false,
        wikiAttachmentDelete: false,
    };
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'wikiIndexCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
            
            // calculate UAC
            $scope.UAC.wikiChange = permision.checkPermision(constants.UAC.wikiChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiDelete = permision.checkPermision(constants.UAC.wikiDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentChange = permision.checkPermision(constants.UAC.wikiAttachmentChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentDelete = permision.checkPermision(constants.UAC.wikiAttachmentDelete, $scope.projectConfig.current.role.privilege);

        } else {
            // do nothing
        }
    }

}

function wikiAddCtrl($rootScope, helper, $scope, $http, $state, $rootScope, $sce, constants, wikiService, $stateParams, $element, sweetAlert, toastr, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiInfo = {};
    $scope.isLoaded = false;
    $scope.editWiki = true;
    $scope.prevWiki = false;
    $scope.preTitle = '预览';
    $scope.isReadonly = false;
    $scope.submitting = false;
    $scope.preViewInfo = '';
    $scope.preLoaded = false;

    $scope.fileArr = {};
    $scope.fileList = [];

    var pKey = $stateParams.pKey;
    var shortcut = $stateParams.shortcut;

    var stringFormater = helper.stringFormater();

    $scope.UAC = {
        wikiChange: false,
        wikiDelete: false,
        wikiAttachmentChange: false,
        wikiAttachmentDelete: false,
    };
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'wikiAddCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
            
            // calculate UAC
            $scope.UAC.wikiChange = permision.checkPermision(constants.UAC.wikiChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiDelete = permision.checkPermision(constants.UAC.wikiDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentChange = permision.checkPermision(constants.UAC.wikiAttachmentChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentDelete = permision.checkPermision(constants.UAC.wikiAttachmentDelete, $scope.projectConfig.current.role.privilege);

        } else {
            // do nothing
        }
    }



    // add wiki 调用
    $scope.addWikiFileUploadFinished = function(targetName, name) {
        $scope.submitting = true;
        //angular.element(".ladda-button").attr("disabled","disabled");
        $http({
            method: 'post',
            url: '/api/wiki/uploadFileFinish',
            data: $.param({
                fileKey: targetName,
                fileName: name,
                pKey: pKey,
                shortcut: shortcut,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
                 $scope.fileArr = {};
                 $scope.fileArr.name = name;
                 $scope.fileArr.targetName = targetName;
                 $scope.fileArr.fkey = data.data;
                 $scope.fileList.push($scope.fileArr);
                 $scope.submitting = false;
            } else {
                toastr.warning(data.message);
                $scope.submitting = false;
            }
        }, function(data) {
            toastr.error('网络请求失败');
            $scope.submitting = false;
        });
    };

   $scope.addWikiDeleteFile = function (item,waKey) {
        $http({
            method: 'post',
            url: '/api/wiki/deleteFile',
            data: $.param({
                waKey: waKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
              $scope.fileList.splice(item,1);
            } else {
                toastr.warning('操作失败');
            }
        }, function(data) {
            toastr.error('网络请求失败');
        });
   }

    $scope.wikiInfo.pKey = pKey;
    $scope.wikiInfo.shortcut = shortcut;

    $scope.getWikiList = function () {
        wikiService.getWikiList(pKey, '').then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.wikiList = data.data.list;
                // 删除自己的短链接
                for(i=0; i< $scope.wikiList.length; i++){
                    if($scope.wikiList[i]['w_shortcut_url'] == shortcut){
                        $scope.wikiList.splice(i,1);
                    }
                }
            }
        }, function(err) {
        });
    };

    $scope.getWikiList();

    $scope.prev = function () {
        $scope.preLoaded = true;
        $scope.prevWiki = !$scope.prevWiki;
        if ($scope.prevWiki) {
            $scope.preTitle = '取消预览';
            wikiService.getPreViewInfo($scope.wikiInfo.content, pKey).then(function(data) {
                $scope.preLoaded = false;
                $scope.preViewInfo = $sce.trustAsHtml(data.data.content);
            }, function(err) {
            });
        } else {
            $scope.preViewInfo = '';
            $scope.preLoaded = false;
            $scope.preTitle = '预览';
        }
    };

    // 取消后重置内容
    $scope.wikiAddCancel = function () {
        $scope.submitting = false;
        $scope.wikiInfo = {};
        $scope.wikiInfo.pKey = $scope.pKey;

        if ($scope.shortcut == 'Wiki') {
            $scope.wikiInfo.shortcut = $scope.shortcut;
            $scope.isReadonly = true;
        }
    };

    $scope.wikiContentChange = function () {
        $scope.wiki_form.contentError = false;
    }

   $scope.addWiki = function () {
       $scope.submitting = true;
       if ($scope.wikiInfo.shortcut.length > 30 ) {
           $scope.submitting = false;
           $scope.wiki_form.submitted = true;
       } else if ( !alertForImageNotUpload( sweetAlert, $scope.addWiki, []) ) {
           $scope.submitting = false;
           $scope.wiki_form.submitted = true;
           return false;
       } else {
           var wikiContent = angular.element("#wikiContent");
           $scope.wikiInfo.shortcut = stringFormater.filterEmoji($scope.wikiInfo.shortcut);
           $scope.wikiInfo.content = stringFormater.filterInput(wikiContent.val());

           if ($scope.wiki_form.$valid && $scope.wikiInfo.content != "") {
               $scope.wikiInfo.fileList = angular.toJson($scope.fileList);
               $scope.wikiInfo.parent = angular.toJson($scope.wikiInfo.parent);

               //Submit as normal
               wikiService.addWiki($.param($scope.wikiInfo)).then(function(data) {
                   if (data.code == constants.globalFalse) {
                       $scope.submitting = false;
                       toastr.info('添加成功');

                       $state.go('project.wiki', { 'pKey' : $scope.wikiInfo.pKey , 'shortcut' : $scope.wikiInfo.shortcut });
                   } else {
                       $scope.submitting = false;
                       toastr.warning(data.message);
                   }
               }, function(err) {
                   toastr.error('网络请求失败');
               });
           } else {
               $scope.submitting = false;
               $scope.wiki_form.submitted = true;
               $scope.wiki_form.contentError = true;
           }
       }
    };

}

function alertForImageNotUpload( sweetAlert, callback, parameters) {
    if( clipboardReader && clipboardReader.uploadFileList.length == 0 ) {
        return true;
    }
    sweetAlert.swal({
        title: "确定保存？",
        text: "点击确定后，编辑器内正在上传的文件将会被忽略。",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "保存",
        cancelButtonText: "取消",
        closeOnConfirm: true,
        closeOnCancel: true
    },
    function(isConfirm) {
            if (isConfirm) {
                clipboardReader.cancelAllImage();
                callback.apply( this, parameters);
            } else {
                //do nothing
            }
        }
    );
    return false;
}

function wikiCtrl($scope, $http, $state, $sce, $rootScope, constants, wikiService, $stateParams, $element, sweetAlert, toastr, $uibModal, $controller, helper)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiInfo = {};
    $scope.isLoaded = false;
    $scope.prevWiki = false;
    $scope.preTitle = '预览';
    $scope.isAdd = false;

    var pKey = $stateParams.pKey;
    var shortcut = $stateParams.shortcut;

    $scope.UAC = {
        wikiChange: false,
        wikiDelete: false,
        wikiAttachmentChange: false,
        wikiAttachmentDelete: false,
    };
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'wikiCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
            
            // calculate UAC
            $scope.UAC.wikiChange = permision.checkPermision(constants.UAC.wikiChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiDelete = permision.checkPermision(constants.UAC.wikiDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentChange = permision.checkPermision(constants.UAC.wikiAttachmentChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentDelete = permision.checkPermision(constants.UAC.wikiAttachmentDelete, $scope.projectConfig.current.role.privilege);

        } else {
            // do nothing
        }
    }



    $scope.loadWiki = function () {
        wikiService.getWikiInfo(pKey, shortcut).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.wikiInfo = data.data;
                $scope.wikiInfo.w_content = $sce.trustAsHtml($scope.wikiInfo.w_content);
                $scope.wikiInfo.oldContent = $scope.wikiInfo.w_content;
            } else {
                $scope.isAdd = true;
            }
        }, function(err) {
        });
    };

    $scope.prev = function () {
        $scope.prevWiki = !$scope.prevWiki;
        if ($scope.prevWiki) {
            $scope.preTitle = '取消预览';
        } else {
            $scope.preTitle = '预览';
        }
    };

    $scope.update = function(field, data) {
        if (data.length <= 0) {
            return '内容不能为空';
        } else {
            wikiService.update(pKey, shortcut, field, data).then(function(data) {
                if (data.code !== constants.returnSuccess) {
                    toastr.warning(data.message);
                }
                else {
                    toastr.info('修改成功');
                    $scope.wikiInfo.w_content = $scope.wikiInfo.oldContent;
                }
            }, function(err) {
                toastr.error('网络连接失败');
            });
        }
    };
}

function wikiEditCtrl($scope, $http, $state, $rootScope, $sce, constants, wikiService, $stateParams, $element, sweetAlert, toastr, helper, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiInfo = {};
    $scope.isLoaded = false;
    $scope.prevWiki = false;
    $scope.preTitle = '预览';
    $scope.preViewInfo = '';
    $scope.preLoaded = false;

    $scope.filesLoaded = false;
    $scope.fileArr = {};
    $scope.fileList = [];
    $scope.submitting = false;

    var pKey = $stateParams.pKey;
    var shortcut = $stateParams.shortcut;
    if (!shortcut) {
        shortcut = 'Wiki';
    }

    var stringFormater = helper.stringFormater();

    $scope.UAC = {
        wikiChange: false,
        wikiDelete: false,
        wikiAttachmentChange: false,
        wikiAttachmentDelete: false,
    };
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'wikiEditCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;
            
            // calculate UAC
            $scope.UAC.wikiChange = permision.checkPermision(constants.UAC.wikiChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiDelete = permision.checkPermision(constants.UAC.wikiDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentChange = permision.checkPermision(constants.UAC.wikiAttachmentChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentDelete = permision.checkPermision(constants.UAC.wikiAttachmentDelete, $scope.projectConfig.current.role.privilege);

        } else {
            // do nothing
        }
    }

    $scope.loadWiki = function () {
        wikiService.getWikiInfo(pKey, shortcut).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.wikiInfo = data.data;
                $scope.wikiInfo.shortcut = $scope.wikiInfo.w_shortcut_url;
                $scope.wikiInfo.oldContent = $scope.wikiInfo.w_content_org;
            }

        }, function(err) {
        });
    };

    $scope.prev = function () {
        $scope.preLoaded = true;
        $scope.prevWiki = !$scope.prevWiki;
        if ($scope.prevWiki) {
            $scope.preTitle = '取消预览';
            wikiService.getPreViewInfo($scope.wikiInfo.oldContent, pKey).then(function(data) {
                $scope.preLoaded = false;
                $scope.preViewInfo = $sce.trustAsHtml(data.data.content);
            }, function(err) {
            });
        } else {
            $scope.preViewInfo = '';
            $scope.preLoaded = false;
            $scope.preTitle = '预览';
        }
    };

    $scope.update = function(field, data) {
        if (data.length <= 0) {
            $scope.submitting = false;
            return '内容不能为空';
        } else {
            if(field == 'content'){
                data = stringFormater.filterInput(data);
            }
            wikiService.update(pKey, shortcut, field, data).then(function(data) {
                if (data.code !== constants.returnSuccess) {
                    toastr.warning(data.message);
//                    $state.go('project.wiki', { 'pKey' : pKey , 'shortcut' : shortcut });
                }
                else {
                    toastr.info('修改成功');
                    $scope.wikiInfo.w_content = $scope.wikiInfo.oldContent;
                    if (field == 'content') {
                        $state.go('project.wiki', { 'pKey' : pKey , 'shortcut' : shortcut });
                    }
                }

            }, function(err) {
                toastr.error('网络连接失败');
            });
        }
    };

   $scope.updateWiki = function () {
       $scope.submitting = true;

       if ( !alertForImageNotUpload( sweetAlert, $scope.updateWiki, [])) {
           $scope.submitting = false;
           return false;
           $scope.wiki_form.submitted = true;
       } else if ($scope.wiki_form.$valid) {
           $scope.wikiInfo.fileList = angular.toJson($scope.fileList);
           $scope.wikiInfo.parent = angular.toJson($scope.wikiInfo.parent);
           //Submit as normal

           var oldContent = angular.element("#oldContent");
           $scope.wikiInfo.oldContent = oldContent.val();

           $scope.wikiInfo.w_content = stringFormater.filterInput($scope.wikiInfo.w_content);

           wikiService.updateWiki($.param($scope.wikiInfo)).then(function(data) {
                if (data.code == constants.globalFalse) {
                      $scope.submitting = false;
                      toastr.info('保存成功');

                      $state.go('project.wiki', { 'pKey' : $scope.wikiInfo.p_key , 'shortcut' : $scope.wikiInfo.w_shortcut_url });
                } else {
                      $scope.submitting = false;
                      toastr.warning(data.message);
                }
            }, function(err) {
                toastr.error('网络请求失败');
            });
       } else {
           $scope.submitting = false;
           $scope.wiki_form.submitted = true;
       }
    }

    $scope.getWikiList = function () {
        wikiService.getWikiList(pKey, shortcut).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.wikiList = data.data.list;

                // 删除自己的短链接
                for(i=0; i< $scope.wikiList.length; i++){
                    if($scope.wikiList[i]['w_shortcut_url'] == shortcut){
                        $scope.wikiList.splice(i,1);
                    }
                }
            }
        }, function(err) {
        });
    };

   if (shortcut != 'Wiki') {
        $scope.getWikiList();
   }

    $scope.setParentKey = function () {
         $scope.update('parent_key', $scope.wikiInfo.w_parent_key);
    };

    $scope.addWikiFileUploadFinished = function(targetName, name) {
        $scope.submitting = true;
        //angular.element(".ladda-button").attr("disabled","disabled");
        $http({
            method: 'post',
            url: '/api/wiki/uploadFileFinish',
            data: $.param({
                fileKey: targetName,
                fileName: name,
                pKey: pKey,
                shortcut: shortcut,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
                 $scope.fileArr = {};
                 $scope.fileArr.name = name;
                 $scope.fileArr.targetName = targetName;
                 $scope.fileArr.fkey = data.data;
                 $scope.fileList.push($scope.fileArr);
                 $scope.submitting = false;
            } else {
                toastr.warning(data.message);
                $scope.submitting = false;
            }
        }, function(data) {
            toastr.error('网络请求失败');
            $scope.submitting = false;
        });
    };

    $scope.addWikiDeleteFile = function (item,waKey) {
        $http({
            method: 'post',
            url: '/api/wiki/deleteFile',
            data: $.param({
                waKey: waKey,
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            data = data.data
            if (data.code == 0) {
                $scope.fileList.splice(item,1);
            } else {
                toastr.warning('操作失败');
            }
        }, function(data) {
            toastr.error('网络请求失败');
        });
    }

   $scope.loadFileList = function(pKey, parShortcut) {
        if (!parShortcut) {
            parShortcut = $stateParams.shortcut;
        }

        $scope.filesLoaded = true;
        wikiService.getFileList(pKey, parShortcut).then(function(data) {
            if (data.data.code == 0) {
                $scope.fileList = data.data.data.list.fileList;
            }

        }, function(err) {
        });
    }

   $scope.loadFileList(pKey, shortcut);

    $scope.cancelEdit = function() {
        if (shortcut == 'Wiki') {
            $state.go('project.wikis', { 'pKey' : pKey});
        } else {
            $state.go('project.wiki', { 'pKey' : pKey, 'shortcut' : shortcut});
        }
    };
}

function wikiHistoryCtrl($scope, $http, $state, $rootScope, constants, wikiService, $stateParams, $element, sweetAlert, toastr, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiHistory = {};
    $scope.isLoaded = false;
    $scope.shortcut = $stateParams.shortcut;

    var pKey = $stateParams.pKey;
    var shortcut = $stateParams.shortcut;
    if (!shortcut) {
        shortcut = 'wiki';
    }

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 10,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.loadWikiHistory = function (page, size, callback) {
        $scope.isLoaded = false;
        wikiService.getHistoryList(pKey, shortcut, page, size).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.wikiHistory = data.data.list;
            }
        });
    };

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('historyList');
            $anchorScroll();
        }
    });

    // 分页
    $scope.initHistoryPage = function() {
        wikiService.getHistoryCount(pKey, shortcut).then(function(data) {
            $scope.conf.totalItems = data.data.count;
            $scope.conf.currentPage = 1;
        }, function(err) {
        });
    };


    $scope.changeFirst = function (val) {
        $scope.firstlog = val;
    }

    $scope.changeSecond = function (val) {
        $scope.secondlog = val;
    }

    $scope.viewDiff = function () {
       if( !$scope.firstlog || !$scope.secondlog) {
           toastr.warning('请选择要查看的两条记录');
           return false;
        }
       if( $scope.firstlog == $scope.secondlog) {
           toastr.warning('请选择两条不同的记录进行查看');
           return false;
       }

//        $scope.typeInfo = $scope.projectTypeList[index];
        var modalInstance = $uibModal.open({
            templateUrl: 'views/wiki/wiki_diff_modal.html',
            size: 'wiki',
            controller: wikiDiffCtrl,
            scope:$scope,
            backdrop: 'static',
            keyboard: false
        });
    }
}



function wikiDiffCtrl ($scope, $rootScope, $http, $filter, constants, toastr, sweetAlert, wikiService, $uibModalInstance, $stateParams, $controller) {
    $controller('baseCtrl', {$scope: $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    var pKey = $stateParams.pKey;

    $scope.wiki = {};
    $scope.loaddiff = false;

    $scope.wiki.firstKey = $scope.firstlog ? $scope.firstlog : '';
    $scope.wiki.secondKey = $scope.secondlog ? $scope.secondlog : '';

    wikiService.wikiDiff($.param($scope.wiki)).then(function(data) {
            $scope.loaddiff = true;
            $scope.diff = data.sidediff;
            $scope.newInfo = data.newInfo;
            $scope.oldInfo = data.oldInfo;
    }, function(err) {
    });

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}

function wikiAnnotateCtrl($scope, $http, $state, $sce, $rootScope, constants, wikiService, $stateParams, $element, sweetAlert, toastr, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiInfo = {};
    $scope.isLoaded = false;

    var pKey = $stateParams.pKey;
    var shortcut = $stateParams.shortcut;
    var version = $stateParams.version;

    if (!shortcut) {
        shortcut = 'wiki';
    }

    $scope.loadWiki = function () {
        wikiService.getVersionInfo(pKey, shortcut, version).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.wikiInfo = data.data;
                $scope.wikiInfo.wl_content = $sce.trustAsHtml($scope.wikiInfo.wl_content);
                $scope.wikiInfo.oldContent = $scope.wikiInfo.w_content;
            }
        }, function(err) {
        });
    };
}

function wikiDeleteCtrl($scope, $http, $state, $rootScope, constants, wikiService, $stateParams, $element, sweetAlert, toastr, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.deleting = false;
    $scope.pKey = $stateParams.pKey;

    var pKey = $stateParams.pKey;

    var shortcut = $stateParams.shortcut;
    if (!shortcut) {
        shortcut = "Wiki";
    }

    $scope.shortcut = shortcut;

    $scope.askDelWiki = function(pKey, shortcut) {
        sweetAlert.swal({
            title: '确定要删除"' +  shortcut + '"吗?',
            text: "删除后，将无法恢复",
//            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $scope.deleteWiki(pKey, shortcut);
            }
        });
    }

    $scope.deleteWiki = function (pKey, shortcut) {
        wikiService.deleteWiki(pKey, shortcut).then(function(data) {
                $scope.deleting = true;
                if (data.code == constants.returnSuccess) {
                    toastr.info('删除成功');
                    $scope.deleting = false;

                    if (document.getElementById('wikiIndexCtrl')) {
                        $state.reload();
                    } else {
                        $state.go('project.wikis', { 'pKey' : pKey});
                    }
                } else {
                    toastr.warning(data.message);
                    $scope.deleting = false;
                }
        }, function(err) {
        });
    };
}

function fileUploadCtrl($scope, $http, $state, $rootScope, constants, wikiService, $stateParams, $element, sweetAlert, toastr, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.shortcut = $stateParams.shortcut;
    $scope.filesLoaded = false;
    $scope.fileArr = {};
    $scope.fileList = [];

    var pKey = $stateParams.pKey;
    var shortcut = $stateParams.shortcut;

    // 编辑wiki上传文件调用
    $scope.fileUploadFinished = function(targetName, name) {
        wikiService.uploadFile(pKey, shortcut, targetName, name).then(function(data) {
            if (data.code == 0) {
                $scope.loadFileList(pKey, shortcut);
            } else {
                toastr.warning(data.message);
            }
        }, function(err) {
        });
    }

    $scope.loadFileList = function(pKey, parShortcut) {
        if (!parShortcut) {
            parShortcut = $stateParams.shortcut;
        }

        $scope.filesLoaded = true;
        wikiService.getFileList(pKey, parShortcut).then(function(data) {
            if (data.data.code == 0) {
                $scope.fileList = data.data.data.list.fileList;
            }

        }, function(err) {
        });
    }

    /*
     * 文件删除
     */
    $scope.askFileDelete = function(waKey, fileName) {
        sweetAlert.swal({
            title: '确定要删除文件"' +  fileName + '"吗?',
            text: "文件删除后，将无法恢复",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/wiki/deleteFile',
                    data: $.param({
                        waKey: waKey,
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data) {
                    data = data.data
                    if (data.code == 0) {

                        if (!shortcut) {
                            $scope.loadFileList(pKey, 'Wiki');
                        } else {
                            $scope.loadFileList(pKey, 'Wiki');
                        }

                        toastr.info('文件"' + fileName + '"已经删除');
                    } else {
                        toastr.warning('操作失败');
                    }
                }, function(data) {
                    toastr.error('网络请求失败');
                });
            }
        });
    }
}

function wikiIndexesCtrl($scope, $http, $state, $rootScope, $sce, constants, wikiService, $stateParams, $element, sweetAlert, toastr, helper, $uibModal, $controller)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.wikiInfo = {};
    $scope.isLoaded = false;

    var pKey = $stateParams.pKey;
    var shortcut = 'Wiki';

    $scope.UAC = {
        wikiChange: false,
        wikiDelete: false,
        wikiAttachmentChange: false,
        wikiAttachmentDelete: false,
    };
    $rootScope.addProjectConfigWatcher(onProjectConfigChange, 'wikiIndexesCtrl');
    function onProjectConfigChange(newValue, oldValue) {
        if(newValue) {
            var permision = helper.permision();
            $scope.projectConfig = $rootScope.projectConfig;

            // calculate UAC
            $scope.UAC.wikiChange = permision.checkPermision(constants.UAC.wikiChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiDelete = permision.checkPermision(constants.UAC.wikiDelete, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentChange = permision.checkPermision(constants.UAC.wikiAttachmentChange, $scope.projectConfig.current.role.privilege);
            $scope.UAC.wikiAttachmentDelete = permision.checkPermision(constants.UAC.wikiAttachmentDelete, $scope.projectConfig.current.role.privilege);

        } else {
            // do nothing
        }
    }

    $scope.loadWiki = function () {
        wikiService.getWikiInfo(pKey, shortcut).then(function(data) {
            $scope.isLoaded = true;
            if (data.code == constants.returnSuccess) {
                $scope.wikiInfo = data.data;
                $scope.wikiInfo.shortcut = $scope.wikiInfo.w_shortcut_url;
                $scope.wikiInfo.oldContent = $scope.wikiInfo.w_content_org;
            }

        }, function(err) {
        });
    };

    $scope.getWikiList = function () {
        wikiService.getWikiIndex(pKey).then(function(data) {
            if (data.code == constants.returnSuccess) {
                $scope.wikiList = data.data.list;
                $scope.formateIndex($scope.wikiList, 1);
            }

        }, function(err) {
        });
    };

    $scope.getWikiList();
    $scope.indexHtml = '';

    $scope.formateIndex = function (list, level) {
        if (list.length) {
            $scope.indexHtml += '<ul >';
            $.each(list, function(i, val){
                    $scope.indexHtml += '<li class=" wiki-index level' + level + '">';
                    if (list[i].w_shortcut_url == 'Wiki') {
                        $scope.indexHtml += '<a href="/cloud/#/project/' + pKey + '//wiki/' + val.w_shortcut_url +'" class="wiki-buttons " > Wiki 起始页</a>';
                    } else {
                        $scope.indexHtml += '<a href="/cloud/#/project/' + pKey + '//wiki/' + val.w_shortcut_url +'" class="wiki-buttons " >' + val.w_shortcut_url + '</a>';
                    }

                    $scope.formateIndex(val.sub, level+1);

                    $scope.indexHtml += '</li>';
            });

            $scope.indexHtml += '</ul>';
        }
    };
}

angular
    .module('bugs')
    .controller('versionCtrl', versionCtrl)
    .controller('viewVersionCtrl', viewVersionCtrl)
    .controller('editVersionCtrl', editVersionCtrl)
    .controller('addVersionsCtrl', addVersionsCtrl)
    .controller('releaseVersionCtrl', releaseVersionCtrl)

function versionCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, constants, versionService, $stateParams,  $element, sweetAlert, toastr, $uibModal, $controller, $cookies, cacheService, helper, projectService)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.versionList = {};
    $scope.pKey = $stateParams.pKey;
    $scope.version = {};
    $scope.version = {pKey: $scope.pKey};
    $scope.isLoaded = true;
    $scope.percent = "20";

    var pKey = $scope.pKey;
    $scope.userInfo = $rootScope.userInfo;

    var stringFormater = helper.stringFormater();

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 5,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    $scope.sortableOptions = {
        handle: '>td .fa-sort',
        stop: function (e, ui) {
            var newVersionKeyArray = [];
            angular.forEach($scope.versionList, function (value) {
                newVersionKeyArray.push(value.v_key);
            });
            versionService.updateOrder(newVersionKeyArray.join(','), ($scope.conf.currentPage - 1) * $scope.conf.itemsPerPage).then();
        }
    };

    $scope.statusList = ['未发布', '已发布'];

    $scope.createVersion = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/version/addVersion.html',
            scope:$scope,
            controller: ModalInstanceCtrl,
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.editVersion = function (index) {
        $scope.editVersionInfo = $scope.versionList[index];
        var modalInstance = $uibModal.open({
            templateUrl: 'views/version/editVersion.html',
            controller: ModalInstanceCtrl,
            scope:$scope,
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.loadVersionsList = function (page, size, callback) {
        $scope.isLoaded = false;
        $scope.version.page = page;
        $scope.version.perpage = size;
        versionService.getList($.param($scope.version)).then(function(data) {
            $scope.isLoaded = true;
            $scope.versionList = data.list;
        }, function(err) {
        });
    };

    $scope.updateVersionStatus = function (vKey, status) {

        var currentIndex;

        angular.forEach($scope.versionList, function (value, index) {
            if(value.v_key == vKey) {
                currentIndex = index;
            }
        });

        if (status) {
            $scope.editVersionInfo = $scope.versionList[currentIndex];
            var modalInstance = $uibModal.open({
                templateUrl: 'views/version/releaseVersion.html',
                controller: ModalInstanceCtrl,
                scope:$scope,
                backdrop: 'static',
                keyboard: false
            });
        } else {
            versionService.updateVersionStatus(vKey, status).then(function (data) {
                toastr.info("操作成功");
                $scope.versionList[currentIndex].v_status_flag = status;
            }, function (err) {
                toastr.error("操作失败");
            });
        }
    }

    $scope.$watch('conf.currentPage', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $location.hash('versionCtrl');
            $anchorScroll();
        }
    });

    $scope.version.keywords = '';
    $scope.change = function (){
        $scope.show = true;
        $scope.loadVersionsList(1, $scope.conf.itemsPerPage);
    };

    $scope.editInfo = function(pKey, vKey,field, data, arr) {
        versionService.update(pKey,vKey,field, stringFormater.filterInput(data), arr).then(function(data) {
            consloe.log(data);
               if (data.code == constants.globalFalse) {
                   $scope.loadVersionsList($scope.version.page, $scope.conf.itemsPerPage);
                   toastr.info("编辑成功");
                   $scope.getTypeCount();
                   angular.element(document.getElementById('userCtrl')).scope().getNotificationCount();
                   angular.element(document.getElementById('userCtrl')).scope().loadNotification();
               } else {
                   toastr.warning(data.message);
               }
             }, function(err) {
                 toastr.error("网络请求失败");
             });
   };

    /*
     * 版本删除
     */
    $scope.askVersionDelete = function(vKey, vNo) {
        sweetAlert.swal({
            title: '确定要删除版本"' +  vNo + '"吗?',
            text: "版本删除后，将无法恢复。 版本删除后，版本中的问题不会被删除。",
//            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消"
        },
        function(isConfirm) {
            if (isConfirm) {
                $http({
                    method: 'post',
                    url: '/api/version/deleteVersion',
                    data: $.param({
                        vKey: vKey,
                        pKey: $stateParams.pKey,
                    }),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(function(data) {
                    data = data.data
                    if (data.code == 0) {
                        cacheService.clearCache();
                        $scope.loadVersionsList();
                        toastr.info('版本"' + vNo + '"已经删除');
                    } else {
                        toastr.warning(data.message);
                    }
                }, function(data) {
                    toastr.error("网络请求失败");
                });
            }
        });
    }

    // 编辑
    $scope.editVersionCancel = function(index) {
        $scope.versionList[index].v_no = $scope.oldVno;
        $scope.versionList[index].v_description = $scope.oldVDescription;
        $scope.editVersionKey = '';
    }

    $scope.updateVersion = function(vNo, vDescription, index) {
        var vKey = $scope.editVersionKey;
        if (!vNo || vNo == '') {
            toastr.warning('请输入版本号名称');
            return false;
        }

        if ($scope.renameFolderSubmitting == true) {
            return false;
        }

        $scope.renameFolderSubmitting = true;

        $http({
            method: 'post',
            url: '/api/version/update',
            data: $.param({
                vNo: stringFormater.filterInput(vNo),
                pKey: pKey,
                vDescription: stringFormater.filterInput(vDescription),
                vKey: vKey
            }),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(function(data) {
            $scope.renameFolderSubmitting = false;
            data = data.data
            if (data.code == 0) {
                $scope.editVersionKey = '';
                toastr.info("操作成功");
            } else {
                toastr.warning(data.message);
            }
        }, function(data) {
            $scope.editVersionCancel(index);
            toastr.error("网络请求失败");
            $scope.renameFolderSubmitting = false;
        });
    }
}

function addVersionsCtrl($scope, $http, $state, $rootScope, constants, $stateParams, versionService, $uibModal, sweetAlert, toastr, $controller, cacheService, projectService, helper) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.version = {};
    $scope.pKey = $stateParams.pKey;

    $scope.version = {pKey: $stateParams.pKey};

    var stringFormater = helper.stringFormater();

   $scope.build = function () {
       $scope.submitting = true;
       if ($scope.signup_form.$valid) {
           //Submit as normal
           $scope.version.vNo = stringFormater.filterInput($scope.version.vNo);
           $scope.version.description = stringFormater.filterInput($scope.version.description);
           versionService.create($.param($scope.version)).then(function(data) {
               $scope.submitting = false;
               if (data.code == constants.globalFalse) {
                   toastr.info("添加成功");
                   cacheService.clearCache();
                   $scope.loadVersionsList(1, $scope.conf.itemsPerPage);
                   $scope.ok();
                   // $state.reload();
               } else {
                   toastr.warning(data.message);
               }
           }, function(err) {
               toastr.error("网络请求失败");
           });
       } else {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
       }
    };

    $scope.today = function() {
        $scope.startDate = new Date();
    };

    $scope.today();

    $scope.clear = function () {
        $scope.startDate = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
//        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };

    $scope.toggleMin();

    $scope.startOpened = false;
    $scope.endOpened = false;

    $scope.open = function($event, start) {
        $event.preventDefault();
        $event.stopPropagation();

        if (start) {
            $scope.startOpened = true;
        } else {
            $scope.endOpened = true;
        }
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

};

function ModalInstanceCtrl ($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};

function releaseVersionCtrl($scope, $http, $state, $rootScope, constants, $stateParams, versionService, $uibModal, sweetAlert, toastr, $controller) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.version = {
        'v_no': $scope.editVersionInfo.v_no,
        'v_description': $scope.editVersionInfo.v_description,
        'v_started': $scope.editVersionInfo.v_started,
        'v_ended': $scope.editVersionInfo.v_ended,
        'vKey': $scope.editVersionInfo.v_key,
        'pKey': $scope.editVersionInfo.p_key,
    };

   $scope.buildUpdate = function () {

        $scope.submitting = true;

       if (!$scope.signup_form.$valid) {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
           toastr.warning('您需要填写完整的开始时间和发布时间');
           return null;
       }

       var vKey = $scope.version.vKey;
       var status = 1
       var startTime = $scope.version.v_started;
       var releaseTime = $scope.version.v_ended;

       versionService.updateVersionStatus(vKey, status, startTime, releaseTime).then(function (data) {
           toastr.info("发布成功");
           $scope.loadVersionsList(1, $scope.conf.itemsPerPage);
           $scope.ok();
           // $state.reload();
       }, function (err) {
           toastr.error("操作失败");
           $scope.submitting = false;
       });

    };

    $scope.today = function() {
        $scope.endDate = new Date();
    };

    $scope.today();

    $scope.clear = function () {
        $scope.startDate = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
//        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };

    $scope.toggleMin();

    $scope.startOpened = false;
    $scope.endOpened = false;

    $scope.open = function($event, start) {
        $event.preventDefault();
        $event.stopPropagation();

        if (start) {
            $scope.startOpened = true;
        } else {
            $scope.endOpened = true;
        }
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
};

function editVersionCtrl($scope, $http, $state, $rootScope, constants, $stateParams, versionService, $uibModal, sweetAlert, toastr, $controller) {
    $controller('baseCtrl', {$scope : $scope});
    $scope.constants = constants;
    $scope.pKey = $stateParams.pKey;
    $scope.version = {
        'v_no': $scope.editVersionInfo.v_no,
        'v_description': $scope.editVersionInfo.v_description,
        'v_started': $scope.editVersionInfo.v_started,
        'v_ended': $scope.editVersionInfo.v_ended,
        'vKey': $scope.editVersionInfo.v_key,
        'pKey': $scope.editVersionInfo.p_key,
    };

   $scope.buildUpdate = function () {
       $scope.submitting = true;
       if ($scope.signup_form.$valid) {
           //Submit as normal
           versionService.updateVersion($.param($scope.version)).then(function(data) {
               $scope.submitting = false;
               if (data.code == constants.globalFalse) {
                   toastr.info("编辑成功");
                   $scope.loadVersionsList(1, $scope.conf.itemsPerPage);
                   $scope.ok();
                   // $state.reload();
               } else {
                   toastr.warning(data.message);
               }
           }, function(err) {
               toastr.error("网络请求失败");
           });
       } else {
           $scope.submitting = false;
           $scope.signup_form.submitted = true;
       }
    };

    $scope.today = function() {
        $scope.startDate = new Date();
    };

    $scope.today();

    $scope.clear = function () {
        $scope.startDate = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
//        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };

    $scope.toggleMin();

    $scope.startOpened = false;
    $scope.endOpened = false;

    $scope.open = function($event, start) {
        $event.preventDefault();
        $event.stopPropagation();

        if (start) {
            $scope.startOpened = true;
        } else {
            $scope.endOpened = true;
        }
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
};

function ModalInstanceCtrl ($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
};

function viewVersionCtrl($scope, $http, $state, $rootScope, $sce, $filter, constants, $stateParams, issueService, versionService, sweetAlert, toastr, $controller, dashboardService, projectService, helper) {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.versionInfo = {};
    $scope.issue = {};
    $scope.issuesLoaded = false;
    $scope.versionLoaded = false;
    $scope.userInfo = $rootScope.userInfo;
    $scope.projectConfig = {};
    var chartDataComposer = helper.chartDataComposer();
    var highChartBuilder = helper.highChartDataBuilder();
    var Stat = helper.Stat();
    $scope.configReader = helper.configReader();

    // 分页
    $scope.conf = {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: 15,
        pagesLength: 5,
        perPageOptions: [10, 20, 30, 40, 50],
        rememberPerPage: 'perPageItems',
        onChange: function(){

        }
    };

    var pKey = $stateParams.pKey;
    var vKey = $stateParams.vKey;

    $scope.pageInit = function (page, size, callback) {
        window.scrollTo(0, 0);
        $scope.loadProjectConfig(page, size, callback);
    }


    $scope.loadProjectConfig = function (page, size, callback) {
        projectService.getProjectConfig($stateParams.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectConfig = data.data;
                $scope.issue.page = page ? page : 1;
                $scope.issue.perpage = size;
                $scope.issue.getType = 'version';
                issueService.getList($.param($scope.issue)).then(function(data) {
                    $scope.issuesLoaded = true;
                    $scope.issuesList = data.data.list;
                    $scope.conf.totalItems = data.data.issueCount;
                    var tmpconf = angular.copy($scope.conf);
                    $scope.conf = tmpconf;
                    $scope.conf.currentPage = $scope.issue.page;
                }, function(err) {
                });
                $scope.loadVersionInfo();
            } else {
                toastr.warning('获取项目设置失败 请刷新重试');
            }
        }, function(err) {
            toastr.error("网络请求失败");
       });
    };

    $scope.issue = { pKey:pKey, versions:vKey};

    // version info
    $scope.loadVersionInfo = function(callback) {
        versionService.view(pKey, vKey).then(function(data) {
            $scope.versionLoaded = true;
            $scope.versionInfo = data;
            callback && callback(data);
            $scope.countByStatus();
        }, function(err) {
        });
    };

    //$scope.loadProjectConfig();

    $scope.contextMenuHandler = function (e) {
        $scope.countByStatus();
        $scope.loadProjectConfig($scope.conf.currentPage, 15);
    }

    $scope.statLoaded = false;
    $scope.statList = {};
    $scope.countByStatus = function () {
        issueService.countIssueByStatus($.param($scope.issue)).then(function(data) {
            $scope.statLoaded = true;
            $scope.statList = data;

            // chart options
            $scope.issueBarData = chartDataComposer.generateChartData($scope.projectConfig.status, ['问题数量'], $scope.statList, false);
            $scope.singleBarOptions = chartDataComposer.chartOptionBuilder(true, 'label', false, 'top', false, Stat.max(Stat.map(Stat.max, $scope.statList)));

            var issueBarHighChartData = highChartBuilder.generateHighChartData($scope.projectConfig.status, ['问题数量'], $scope.statList, Stat.max(Stat.map(Stat.max, $scope.statList)), 'column', true);
            issueBarHighChartData.options.legend.enabled = false;
            issueBarHighChartData.options.plotOptions.series.colorByPoint = true;
            issueBarHighChartData.options.chart.height = 150;
            issueBarHighChartData.options.colors = issueBarHighChartData.options.colors[0];
            $scope.issueBarHighChartData = issueBarHighChartData;

            var closeFlag = $scope.configReader.filter($scope.projectConfig.status, 'closeFlag', 1);
            var finishedIssueNumber = Stat.sum(Stat.pick($scope.statList, [closeFlag[0].key]));
            var totalIssueNumber = Stat.sum($scope.statList);
            if(totalIssueNumber) {
                $scope.versionInfo.percent = Math.floor(100 * finishedIssueNumber / totalIssueNumber);
            } else {
                $scope.versionInfo.percent = 0;
            }
        }, function(err) {
        });
    };
}

///

angular
    .module('bugs')
    .controller('statisticsCtrl', statisticsCtrl);

function statisticsCtrl($scope, $location, $anchorScroll, $http, $state, $rootScope, constants, statisticsService, projectService, $stateParams,  $element, sweetAlert, $uibModal, $controller, helper, $timeout, $window, toastr)  {
    $controller('baseCtrl', {$scope : $scope});
    $controller('projectPermissionCtrl', {$scope: $scope});
    $scope.constants = constants;
    $scope.statisticsData = {};
    $scope.projectConfig = {};
    $scope.pKey = $stateParams.pKey;
    $scope.isLoaded = false;
    $scope.userInfo = $rootScope.userInfo;

    $scope.versionStatFlag = false;
    $scope.moduleStatFlag = false;
    var a = 1;
    var chartDataComposer = helper.chartDataComposer();
    var Stat = helper.Stat();
    var ConfigReader = helper.configReader();


    // get project config data
    function _getData() {

        projectService.getProjectConfig($stateParams.pKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.projectConfig = angular.copy(data.data);
                $scope.projectConfig.users.push({key: 'unknown', label: '未指派', icon: 'user-o', class:''});
                _loadStatData();
            } else {
                toastr.warning('获取项目设置失败 请刷新重试');
            }
        }, function(err) {
            toastr.error("网络请求失败");
        });
    };

    function _loadStatData() {
        statisticsService.loadStatData($scope.pKey).then(function(data) {
            $scope.statisticsData = data;
            _processingData();
            _makeChartOption();
            $scope.isLoaded = true;
        });
    };

    function _processingData() {

        var highChartBuilder = helper.highChartDataBuilder();
        var dateLabels = highChartBuilder.generateDateLabels(30);

        // singleChartData Increasing Start
        var maxValue = Stat.max(Stat.map(Stat.sum, $scope.statisticsData.typeCount));
        // generateHighChartData(Array labelX, Array labelY, Array inputData, Number maxValue, String chartType, Boolean aixsEnabled)
        var newIssueData = highChartBuilder.generateHighChartData(dateLabels, ['问题数量'], Stat.map(Stat.sum, $scope.statisticsData.typeCount),  maxValue, 'areaspline', true);
        newIssueData.options.chart.height = 300;
        newIssueData.options.legend.enabled = false;
        newIssueData.options.xAxis.crosshair = {color: newIssueData.options.colors[0], width : 1};
        $scope.highChartDataNewIssue = newIssueData;
        // singleChartData Increasing End

        // issueTypeChartData Start
        maxValue = Stat.max(Stat.map(Stat.max, $scope.statisticsData.typeCount));
        var typeDistributeData = highChartBuilder.generateHighChartData(dateLabels, $scope.projectConfig.type, $scope.statisticsData.typeCount, maxValue ,'areaspline', true );
        typeDistributeData.options.chart.height = 300;
        typeDistributeData.options.tooltip.shared = true;
        typeDistributeData.options.tooltip.crosshairs = true;
        typeDistributeData.options.xAxis.crosshair = { color: '#e6e6e6',  width : 1};
        $scope.issueTypeCountData = typeDistributeData;
        // issueTypeChartData End

        // DistributeChartData Start
        maxValue = Stat.max(Stat.map(Stat.max, $scope.statisticsData.assigneeTypeCount));
        var issueDistributeData = highChartBuilder.generateHighChartData($scope.projectConfig.users, $scope.projectConfig.type, $scope.statisticsData.assigneeTypeCount, maxValue, 'column', true);
        issueDistributeData.options.chart.height = 300;
        highChartBuilder.setChartPlotOptions(issueDistributeData, 'normal');
        issueDistributeData = highChartBuilder.chartDataRearrangement(issueDistributeData, 'desc', 20, false);
        $scope.issueDistributeChartData = issueDistributeData;
        // DistributeChartData End

        //stuffProgressData Start
        maxValue = Stat.max(Stat.map(Stat.sum, $scope.statisticsData.assigneeStatusCount));
        var stuffProgressData =  highChartBuilder.generateHighChartData($scope.projectConfig.users, $scope.projectConfig.status, $scope.statisticsData.assigneeStatusCount, maxValue, 'column', true);
        stuffProgressData.options.chart.height = 300;
        highChartBuilder.setChartPlotOptions(stuffProgressData, 'normal');
        stuffProgressData = highChartBuilder.chartDataRearrangement(stuffProgressData, 'desc', 20, false);
        $scope.stuffProgressData = stuffProgressData;
        //stuffProgressData End

        $scope.versionStatFlag = $scope.projectConfig.version.length > 0 ? true : false;
        $scope.versionIssueStatData = chartDataComposer.generateChartData($scope.projectConfig.version, ['问题数量'], $scope.statisticsData.versionCount, false);

        // VersionStatData start
        maxValue = Stat.max(Stat.filter($scope.statisticsData.versionCount, ['unknown']));
        var versionStatData = highChartBuilder.generateHighChartData($scope.projectConfig.version, ['问题数量'], $scope.statisticsData.versionCount, maxValue, 'column', true);
        versionStatData.options.chart.height = 300;
        versionStatData.options.colors = ['rgba(91, 192, 222, 1)'];
        versionStatData.options.legend.enabled = false;
        $scope.verisonStatData = versionStatData;
        // VersionStatData End

        $scope.moduleStatFlag = $scope.projectConfig.module.length > 0 ? true : false;

        // moduleIssueData Start
        maxValue = Stat.max(Stat.filter($scope.statisticsData.moduleCount, ['unknown']));
        var moduleIssueHighChartData = highChartBuilder.generateHighChartData($scope.projectConfig.module, ['问题数量'], $scope.statisticsData.moduleCount, maxValue, 'column', true);
        moduleIssueHighChartData.options.chart.height = 300;
        moduleIssueHighChartData.options.colors = ['rgba(91, 192, 222, 1)'];
        moduleIssueHighChartData.options.legend.enabled = false;
        $scope.moduleIssueHighChartData = moduleIssueHighChartData;
        // moduleIssueData End

        // issueLevelPercent Start
        var issueLevelDataSets = highChartBuilder.generateHighChartData($scope.projectConfig.priority, ['问题数量'], $scope.statisticsData.priorityCount, maxValue, 'pie', false);
       issueLevelDataSets.options.legend.verticalAlign = 'bottom';
       $scope.issueLevelData = issueLevelDataSets;
        // issueLevelPercent End

        var colsedStatus = ConfigReader.filter($scope.projectConfig.status, 'closeFlag', 1);
        var finishedIssueNumber = Stat.sum(Stat.pick($scope.statisticsData.statusCount, [colsedStatus[0].key]));
        var totalIssueNumber = Stat.sum($scope.statisticsData.statusCount);
        var prpgressPercentString = Math.floor(100 * finishedIssueNumber / totalIssueNumber) + '%';

        $scope.totalIssueNumber = totalIssueNumber;


        var pieProcessData = highChartBuilder.generateHighChartData(['已完成', '待完成'], ['问题数量'], { "已完成": finishedIssueNumber, "待完成" : totalIssueNumber - finishedIssueNumber }, 0 , 'pie', false);
        pieProcessData.options.legend.verticalAlign = 'bottom';
        pieProcessData.options.colors = ['#2b84c9', '#efeeee'];
        highChartBuilder.setChartTitle(pieProcessData, prpgressPercentString, '#6a6c6f', '36px', -5);
        highChartBuilder.setChartPlotOptions(pieProcessData, '80%');
        $scope.pieProcessData = pieProcessData;


        $timeout( function(){
            // 窗口尺寸变化试重新产生百分比文本
            $scope.$watch( $scope.getProgressChartSize, function (newValue, oldValue) {

                $timeout(function () {

                    var size = $scope.getProgressChartSize();
                    $element.find('#progressData').remove();
                    $element.find('#progressChart').append('<div id="progressData" style="height:0px; width:100%; font-size:36px; text-align:center; position:relative; top: -' + size.h + 'px; line-height: ' + size.w + 'px">' + prpgressPercentString + '</div>');

                }, 100);

            }, true);

            //绑定窗口 resize 事件 resize之后激活$watch方法
            angular.element($window).bind('resize', function () {
                $scope.$apply();
            });

        }, 500);


        //distribute stuff Start
        var stuffEachData = highChartBuilder.generateHighChartData($scope.projectConfig.users, ['问题数量'], Stat.map(Stat.sum,$scope.statisticsData.assigneeStatusCount), 0, 'pie', false);
        stuffEachData = highChartBuilder.chartDataRearrangement(stuffEachData, 'desc', 20, true);
        stuffEachData.options.legend.verticalAlign = 'bottom';
        stuffEachData.options.colors = ["#9cbce8", "#9ca6e8", "#7c83cd", "#7391e8", "#6283e3", "#6fc4ec", "#82e7d5", "#bbda2c", "#e3e51f", "#fee439", "#9cbce8", "#9ca6e8", "#7c83cd", "#7391e8", "#6283e3", "#6fc4ec", "#82e7d5", "#bbda2c", "#e3e51f", "#fee439" ];

        $scope.stuffDisData = stuffEachData;
        //distribute stuff End
    }

    $scope.init = function () {
        _getData();
    };

    function _makeChartOption() {

        $scope.singleDataLineChartOptions = chartDataComposer.chartOptionBuilder(true, 'single', false, 'top', false, Stat.max(Stat.map(Stat.sum, $scope.statisticsData.typeCount)));

        $scope.lineChartOptions = chartDataComposer.chartOptionBuilder(true, 'label', true, 'top', false, Stat.max(Stat.map(Stat.max, $scope.statisticsData.typeCount)));
        $scope.barChartOptions = chartDataComposer.chartOptionBuilder(true, 'label', true, 'top', false, Stat.max(Stat.map(Stat.max, $scope.statisticsData.assigneeTypeCount)));
        $scope.stackedBarChartOptions = chartDataComposer.chartOptionBuilder(true, 'label', true, 'top', true, Stat.max(Stat.map(Stat.sum, $scope.statisticsData.assigneeStatusCount)));
        $scope.singleDataBarChartOptions2 = chartDataComposer.chartOptionBuilder(true, 'label', false, 'top', false, Stat.max(Stat.map(Stat.sum, $scope.statisticsData.versionCount)));
        $scope.singleDataBarChartOptions = chartDataComposer.chartOptionBuilder(true, 'label', false, 'top', false, Stat.max(Stat.map(Stat.sum, $scope.statisticsData.moduleCount)));


        $scope.pieChartOptions = chartDataComposer.chartOptionBuilder(true, 'label', true, 'bottom', null, null);
        $scope.pieChartOptions.cutoutPercentage = 0;

        $scope.doughnutOptions = chartDataComposer.chartOptionBuilder(true, 'label', true, 'bottom', null, null);
        $scope.dougmaxValue = $scope.doughnutOptions.cutoutPercentage = 80;
    }

    $scope.getProgressChartSize = function () {
        var b = $element.find('#progressChart');
        return { 'h': b.height(), 'w': b.width() };
    };
}

///

/**
 *
 * project controllers
 *
 */

angular
    .module('bugs')
    .controller('widgetCtrl', widgetCtrl);

function widgetCtrl($scope, constants, $state, $stateParams, $controller) {
    $controller('baseCtrl', {$scope: $scope});

    $scope.constants = constants;

    $scope.showChrome = true;
    $scope.showFirefox = false;
    $scope.showSafari = false;

    $scope.showChange = function (part) {

        if (part == 'showChrome' && !$scope.showChrome) {
            $scope.showChrome = !$scope.showChrome;
            $scope.showChromeArrow = !$scope.showChrome;
            $scope.showFirefox = false;
            $scope.showSafari = false;
        }

        if (part == 'showFirefox' && !$scope.showFirefox) {
            $scope.showFirefox = !$scope.showFirefox;
            $scope.showFirefoxArrow = !$scope.showFirefox;
            $scope.showChrome = false;
            $scope.showSafari = false;
        }

        if (part == 'showSafari' && !$scope.showSafari) {
            $scope.showSafari = !$scope.showSafari;
            $scope.showSafariArrow = !$scope.showSafari;
            $scope.showChrome = false;
            $scope.showFirefox = false;
        }
    }

   $scope.exitPlugin = function () {
     if(angular.element('#com_pgyer_bugcloudextension').length > 0) {
        return true;
     }else{
       return false;
     }
   }

}

angular
.module('bugs')
.controller('bindCommitCtrl', bindCommitCtrl);

function bindCommitCtrl($scope, $location, $window, $state, $rootScope, constants, $stateParams, $uibModalInstance, VCSService, toastr) {

    $scope.constants = constants;

    $scope.commitList = {};
    $scope.selectedCommitList = { list:[]};
    $scope.pending = true;

    var scopeData = $scope.data;

    $scope.init = function() {
        $scope.loadCommit( scopeData.iKey);
    }

    $scope.loadCommit = function ( iKey) {
        VCSService.loadCommit( iKey).then( function (data) {
            if( data.code == constants.returnSuccess) {
                if( data.data.commitList.length) {
                    $scope.commitList = data.data.commitList;
                    $scope.selectedCommitList.list = data.data.choosenCommitList;
                    $scope.pending = false;
                } else {
                    toastr.info("没有可用的提交记录!");
                    $scope.cancel();
                }
            } else {
                toastr.warning(data.message);
                $scope.cancel();
            }
        })
    }

    $scope.cancel = function () {
        scopeData.callback && scopeData.callback();
        $uibModalInstance.dismiss('cancel');
    };

    $scope.bindCommitForIssue = function () {
        var bindList = $scope.selectedCommitList.list;
        var bindHashArray = [];
        for( index in bindList) {
            bindHashArray.push( bindList[index].hash);
        }
        var bindHashes = bindHashArray.join(',');
        $scope.pending = true;
        VCSService.addBind( scopeData.iKey, bindHashes).then( function (data) {
            $uibModalInstance.dismiss('cancel');
            scopeData.callback && scopeData.callback();
        });
    };

};

angular
    .module('bugs')
    .controller('IMCtrl', IMCtrl)

function IMCtrl($scope, $rootScope, $location, constants, $state, $stateParams, $timeout, IMService, $window, projectService, userService, toastr, helper) {
    // chatWith(uKey)
    // showChats()
    // cancelChats()

    $scope.constants = constants;
    $scope.configReader = helper.configReader();
    $scope.configFilter = $scope.configReader.filter;
    $scope.configStat = $scope.configReader.filter;
    $scope.stringFormater = helper.stringFormater();

    $scope.userLoading = true;
    $scope.projectLoading = true;

    $scope.chatStatus = {
        chatMode: false,
        expand: false,
        sending: false,
        currentUser: null,
        currentMessage: '',
        currentChatList: [],
        login: null,
        sender: {},
        user: {},
    }

    function initializeChatSDK() {

        var newImFlag = false;
        if(!$rootScope.im) {
            newImFlag = true;
            // init connection
            $rootScope.im = new WebIM.connection({
                isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
                https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
                url: WebIM.config.xmppURL,
                heartBeatWait: WebIM.config.heartBeatWait,
                autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
                autoReconnectInterval: WebIM.config.autoReconnectInterval,
                apiUrl: WebIM.config.apiURL,
                isAutoLogin: true
            });

            // binding callbacks
            $rootScope.im.listen({
                onOpened: tmpLog,
                onClosed: tmpLog,
                onTextMessage: onTextMessage,
                onEmojiMessage: tmpLog,
                onPictureMessage: tmpLog,
                onCmdMessage: tmpLog,
                onAudioMessage: tmpLog,
                onLocationMessage: tmpLog,
                onFileMessage: tmpLog,
                onVideoMessage: tmpLog,
                onPresence: tmpLog,
                onRoster: tmpLog,
                onInviteMessage: tmpLog,
                onOnline: tmpLog,
                onOffline: tmpLog,
                onError: onError,
                onBlacklistUpdate: tmpLog,
                onReceivedMessage: tmpLog,
                onDeliveredMessage: tmpLog,
                onReadMessage: tmpLog,
                onCreateGroup: tmpLog,
                onMutedMessage: tmpLog,
            });
        }
        // try login
        // get username and password
        IMService.getCredential().then(function(data){
            if(data.code == constants.returnSuccess) {
                var options = { 
                    apiUrl: WebIM.config.apiURL,
                    user: data.data.id,
                    pwd: data.data.secret,
                    appKey: data.data.key,
                };
                $scope.chatStatus.login = data.data.id;
                if(newImFlag) {
                    $rootScope.im.open(options);
                }
                setChatUserList();
                getProjectUser();
            } else {
                toastr.warning(data.message);
            }
        }, function(err){
            toastr.warning("网络连接出错");
        });

        $rootScope.showChats = function () {
            //$scope.chatStatus.chatMode = false;
            addCloseTrigger();
            $scope.chatStatus.expand = true;
            $('#chat-bar').addClass('chatbar-open');
        }

        $rootScope.cancelChats = function () {
            //$scope.chatStatus.chatMode = false;
            $scope.chatStatus.expand = false;
            $('#chat-bar').removeClass('chatbar-open');
            removeCloseTrigger();
        }

        var closeTriggerAddTimer = null;
        $rootScope.toggleChats = function () {
            //$scope.chatStatus.chatMode = false;
            if($scope.chatStatus.expand) {
                $scope.chatStatus.expand = false;
                $('#chat-bar').removeClass('chatbar-open');
                removeCloseTrigger();
            } else {
                if(closeTriggerAddTimer) {
                    $timeout.cancel(closeTriggerAddTimer);
                }
                closeTriggerAddTimer = $timeout(addCloseTrigger, 10);
                $scope.chatStatus.expand = true;
                $('#chat-bar').addClass('chatbar-open');
            }
            return $scope.chatStatus.expand;
        }

        function addCloseTrigger() {
            $(document).off('click', closeTrigger);
            $(document).on('click', closeTrigger);
            $('body').css('overflow', 'hidden');
        }

        function removeCloseTrigger() {
            $(document).off('click', closeTrigger);
            $('body').css('overflow', '');
        }

        function closeTrigger(e) {
            if($scope.chatStatus.expand) {
                var $eventElement = $(e.target)[0];
                var $container = $('#chat-bar')[0];
                if(!$.contains($container, $eventElement)) {
                    $rootScope.cancelChats();
                    $scope.$apply();
                }
             }
        }

    }

    initializeChatSDK();

    $rootScope.chatWith = function (uKey) {
        if(!$scope.chatStatus.login) {
            toastr.warning("网络连接出错 请刷新页面重试");
        }
        // 处理和自己聊天
        if ($scope.chatStatus.login == uKey) {
           return false;
        }
        // get receiver and sender info, and try to register receiver
        IMService.getChatUserInfo(uKey).then(function(data) {
            if(data.code == constants.returnSuccess) {
                $scope.chatStatus.sender = data.data.to;
                $scope.chatStatus.user = data.data.me;
            } else {
                toastr.warning(data.message);
            }
        }, function (err) {
            toastr.warning("网络连接出错 请刷新页面重试");
        });
        // set chart current user
        $scope.chatStatus.currentUser = uKey;
        // load chart record from localstorage
        $scope.chatStatus.currentChatList = getLocalMessageList(uKey);
        scrollToBottom();
        // set chartmode
        $scope.chatStatus.chatMode = true;
        setTimeout($rootScope.showChats, 200);
    }

    $scope.cancelChats = $rootScope.cancelChats;

    $scope.chatWith = function(uKey, $event) {
        $event.stopPropagation();
        $rootScope.chatWith(uKey);
    }

    $scope.sendMessage = function () {

        $scope.chatStatus.sending = true;
        var id = $rootScope.im.getUniqueId();
        var msg = new WebIM.message('txt', id);
        msg.set({
            msg: $scope.chatStatus.currentMessage,
            to:  $scope.chatStatus.currentUser,
            roomType: false,
            success: function (id, serverMsgId) {
                // save to storage
                var data = {
                    from: $scope.chatStatus.login,
                    message: $scope.chatStatus.currentMessage,
                    time: new Date().getTime(),
                    uuid: serverMsgId,
                };
                appendLocalMessageList($scope.chatStatus.currentUser, data);
                addToChatUserList($scope.chatStatus.currentUser);
                $scope.chatStatus.currentChatList =
                getLocalMessageList($scope.chatStatus.currentUser);
                $scope.chatStatus.currentMessage = '';
                $scope.$apply();
                setChatUserList();
                $scope.chatStatus.sending = false;
            },
            fail: function(e){
                toastr.warning('消息发送失败，请稍后重试');
                $scope.chatStatus.sending = false;
            }
        });
        msg.body.chatType = 'singleChat';
        $rootScope.im.send(msg.body);
    }

    setTimeout(updateUnreadChartCount, 400);

    $scope.clearLocalMessage = function () {
        clearLocalMessage($scope.chatStatus.currentUser);
        $scope.chatStatus.currentChatList = getLocalMessageList($scope.chatStatus.currentUser);
    }

    $scope.removeFromChatUserList = function (uKey, $event) {
        $event.stopPropagation();
        removeFromChatUserList(uKey);
        setChatUserList();
    }

    // 切换列表
    $scope.currentTab = 0;
    $scope.toggleTab = function (flag) {
        $scope.currentTab = flag;
        $scope.chatStatus.chatMode = false;
    }

    // 回车提交
    $scope.keyupSend = function(e){
        var keycode = window.event ? e.keyCode : e.which;
        if (keycode == 13) {
            if ($scope.chatStatus.currentMessage) {
                $scope.sendMessage();
            }
        }
    }

    $scope.getLastMessage = function (from) {
        return getLastMessage(from).message;
    }

    $scope.goBackList = function ($event) {
        $event.stopPropagation();
        $scope.chatStatus.chatMode = false;
    }

    function tmpLog() {
        if(false) {
            console.log(arguments);
        }
    }

    function onError(err) {
        if(err.type == 8) {
            toastr.error('您的 Tracup 账号已在其他设备登录，如果不是本人操作请及时修改登录密码');
        }
        if(err.type == 16) {
            toastr.info('正在重新连接...');
            initializeChatSDK();
        }
    }

    function onTextMessage (res) {
        var data = {
            from: res.from,
            message: res.data,
            time: new Date().getTime(),
            uuid: res.id,
        };

        appendLocalMessageList(res.from, data);
        addToChatUserList(res.from);
        updateUnreadChartCount();
        setChatUserList();

        if ($scope.chatStatus.chatMode && $scope.chatStatus.expand && $scope.chatStatus.currentUser == res.from) {
            $scope.chatStatus.currentChatList = getLocalMessageList(res.from);
        } else {
            toastr.info("点击查看", "您有一条新消息", {
                onTap: function () {
                    $rootScope.chatWith(res.from);
                }
            });
            chatAudioPlay();
        }
        $scope.$apply();
    }

    function scrollToBottom () {
        setTimeout(function () {
            var div = angular.element('#chatContent');
            div.scrollTop(div[0].scrollHeight);
        }, 400);
    }

    function getProjectUser () {
        $scope.projectLoading = true;
        projectService.getAllPartners().then(function(data) {
            var data = data.data;
            $scope.projectUser = data;
            setProjectUser();
            $scope.projectLoading = false;
        }, function(err) {
            toastr.error("网络错误");
        });
    }

    function setProjectUser () {
        var project = $scope.projectUser;
        var newList = [];
        for (var index in project) {
            project[index].userList = $scope.configFilter(project[index].userList, 'key', $scope.chatStatus.login, true);
            project[index].userList = $scope.configFilter(project[index].userList, 'deleteFlag', 0);
            if (project[index].userList.length > 0) {
                newList.push(project[index]);
            }
        }
        $scope.projectUser = newList;
    }

    function clearLocalMessage(uKey) {
        cleanUnreadCount(uKey);
        $rootScope.unreadChartCount = getChatUserCount();
        var composedKey = getStorageKey($scope.chatStatus.login, uKey);
        window.localStorage.removeItem(composedKey);
    }

    function removeFromChatUserList(uKey) {
        clearLocalMessage(uKey);
        var storageKey = getLocalStorageKeyForChatUserList();
        var chatUserList = angular.fromJson(window.localStorage.getItem(storageKey));
        var newChatUserList = {};
        if(!chatUserList) {
            chatUserList = {};
        }
        for(var index in chatUserList) {
            if(index != uKey) {
                newChatUserList[index] = chatUserList[index];
            }
        }
        window.localStorage.setItem(storageKey, angular.toJson(newChatUserList));
        return newChatUserList;
    }

    function addToChatUserList(uKey) {
        var storageKey = getLocalStorageKeyForChatUserList();
        var chatUserList = angular.fromJson(window.localStorage.getItem(storageKey));
        if(!chatUserList) {
            chatUserList = {};
        }
        if(!chatUserList[uKey]) {
            chatUserList[uKey] = 0;
        }
        chatUserList[uKey] ++;
        window.localStorage.setItem(storageKey, angular.toJson(chatUserList));
        return chatUserList[uKey];
    }

    function cleanUnreadCount(uKey) {
        var storageKey = getLocalStorageKeyForChatUserList();
        var chatUserList = angular.fromJson(window.localStorage.getItem(storageKey));
        if(!chatUserList) {
            chatUserList = {};
        }
        if(!chatUserList[uKey]) {
            chatUserList[uKey] = 0;
        } else {
            chatUserList[uKey] = 0;
        }
        window.localStorage.setItem(storageKey, angular.toJson(chatUserList));
        return true;
    }

    function getChatUserList() {
        var storageKey = getLocalStorageKeyForChatUserList();
        var chatUserList = angular.fromJson(window.localStorage.getItem(storageKey));
        if(!chatUserList) {
            chatUserList = {};
        }
        return chatUserList;
    }

    function getChatUserCount() {
        var list = getChatUserList();
        var count = 0;
        for (var index in list) {
            count += list[index];
        }
        return count;
    }

    function updateUnreadChartCount() {
        $rootScope.unreadChartCount = getChatUserCount();
    }

    function setChatUserList() {
        $scope.userLoading = true;
        var data = getChatUserList();
        $scope.chatUserListOrigin = data;
        var uKeys = Object.keys(data).join(',');

        userService.getUserInfoBatch(uKeys).then(function(data) {
           $scope.chatUserList = data.data.list;
            $scope.userLoading = false;
        }, function(err) {
            toastr.error("网络错误");
        });
    }

    function getLocalStorageKeyForChatUserList() {
        if($scope.chatStatus.login) {
            return 'tracup-chat-list-storage-' + $scope.chatStatus.login;
        } else {
            return null;
        }
    }

    function getLocalMessageList(uKey) {
        cleanUnreadCount(uKey);
        updateUnreadChartCount();
        setChatUserList();
        scrollToBottom();
        var composedKey = getStorageKey($scope.chatStatus.login, uKey);
        var item = angular.fromJson(window.localStorage.getItem(composedKey));
        return item;
    }

    function getLastMessage(uKey) {
        var composedKey = getStorageKey($scope.chatStatus.login, uKey);
        var item = angular.fromJson(window.localStorage.getItem(composedKey));
        if (!item) {
            return '';
        }
        if(item.length) {
            return item[(item.length - 1)];
        } else {
            return '';
        }
    }

    function appendLocalMessageList(uKey, data) {
        var composedKey = getStorageKey($scope.chatStatus.login, uKey);
        var item = angular.fromJson(window.localStorage.getItem(composedKey));
        if(!item) {
            item = [];
        }
        item.push(data);
        window.localStorage.setItem(composedKey, angular.toJson(item));
        return item;
    }

    function getStorageKey(key1, key2) {
        if(!key1 || !key2) {
            return false;
        }
        return 'tracup-chat-storage-' + (key1 > key2 ? key1 + '-' + key2 : key2 + '-' + key1);
    }

    $scope.$watch('chatStatus.expand', function (newValue, oldValue) {
         $rootScope.chatsBarStatus = $scope.chatStatus.expand;
    }, true);

    function chatAudioPlay () {
        var audio = document.getElementById("chatAudio");
        audio.currentTime = 0;
        audio.play();
    }

}

//# sourceMappingURL=scripts.js.map