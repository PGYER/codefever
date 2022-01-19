<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/*
|--------------------------------------------------------------------------
| File and Directory Modes
|--------------------------------------------------------------------------
|
| These prefs are used when checking and setting modes when working
| with the file system.  The defaults are fine on servers with proper
| security, but you may wish (or even need) to change the values in
| certain environments (Apache running a separate process for each
| user, PHP under CGI with Apache suEXEC, etc.).  Octal values should
| always be used to set the mode correctly.
|
*/
define('FILE_READ_MODE', 0644);
define('FILE_WRITE_MODE', 0666);
define('DIR_READ_MODE', 0755);
define('DIR_WRITE_MODE', 0777);

if (ENVIRONMENT == 'development') {
} else if (ENVIRONMENT == 'testing') {
    // unit test: user test, group codefever, repository codefever
    define('TESTING_USER_KEY', 'f4a9c54adef17599d4f709a1167f0fcd');
    define('TESTING_GROUP_KEY', 'e6508c1a66e86f697c96bdffb30c1ae3');
    define('TESTING_REPOSITORY_KEY', '2f941aef39bc8a048da55dd28c678655');
    define('TESTING_USER_KEY_NO_RELATION', '26c20714af8bc20aa85be657a5170e71');
    define('TESTING_GROUP_NAME', 'codefever');
    define('TESTING_GROUP_DISPLAY_NAME', 'codefever');
    define('TESTING_USER_EMAIL', 'test@pgyer.com');

    define('TESTING_SSHKEY', 'f90613f05b53e9bc080f01e2a465d8e6');
    define('TESTING_PUBLIC_KEY', 'AAAAB3NzaC1yc2EAAAADAQABAAABgQDHTyC4jcWdgDEeF6qeAsV0hmkb0uetkwQj3aqXIFnUgMudD8QjQ/dEFNQtYB0Fc1H3CAh3O4NTiWF7cGjj9RuSdAlB4hH96/UzwNraBrczyib1xw1H5VxuqRxdz/GBPnRJUZ84mzyJJuPBsh15lEclVKtdhNr0rNfghQkPaxcOBn3yH1JCOyCBbwtA23CGc2XmT2j8If3lkyoebmZ/fg5Kc8pNu2cZVFyAADgl7OjhXamU8FcYD3ZZ/x0WcUi28kiuAy57p5ZQS9+zqUT8zHXqz553YXreglV/Qp1jm/6g16yliuCeFTtRJ6eL59mqfkUIlXAUkE6bnRrWettoLfyBE56lRxwC5tlBvvYcP9346opb85QxXM1ixj8/CzHZwG38KnKEq6rKbKLUTum3/fRPsuU+GwgKs7/q1sZkctT9FJA1qGh0SseXlV7nWiQ8Hz+HhE/8TE8jwBXyzY1IBes2K4j7SZKP1a2qPbOp9HvxxLPNdhQOZ8F2ux/NIARrCU8=');
    define('TESTING_KEY_HASH', 'e69cbde8123c9e57657c1aa0067166a3');

    define('TESTING_SOURCE_REPOSITORY_COMMIT_HASH', '019bb67c577c9db529cdd7fc5d8f1195cf630d34');
    define('TESTING_COMMIT_HASH', '019bb67c577c9db529cdd7fc5d8f1195cf630d34');
    define('TESTING_NEW_TAG_NAME', 'unitTestTag');
    define('TESTING_COMMON_DESCRIPTION', 'decription');
    define('TESTING_COMMON_NAME', 'unitTestName');
    define('TESTING_SOURCE_BRANCH_NAME', 'master');
    define('TESTING_NEW_BRANCH_NAME', 'unitTestBranch');
    define('TESTING_COMMON_KEYWORD', '');
    define('TESTING_COMMON_PAGE', 1);
    define('TESTING_COMMON_PERPAGE', 10);
} else {
}

/*
|--------------------------------------------------------------------------
| File Stream Modes
|--------------------------------------------------------------------------
|
| These modes are used when working with fopen()/popen()
|
*/

define('APP_NAME', 'CodeFever');

define('SERVICE_EMAIL', 'service@pgyer.com');

define('LANG_CN', 1);
define('LANG_EN', 2);

define('FOPEN_READ',                            'rb');
define('FOPEN_READ_WRITE',                        'r+b');
define('FOPEN_WRITE_CREATE_DESTRUCTIVE',        'wb'); // truncates existing file data, use with care
define('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE',    'w+b'); // truncates existing file data, use with care
define('FOPEN_WRITE_CREATE',                    'ab');
define('FOPEN_READ_WRITE_CREATE',                'a+b');
define('FOPEN_WRITE_CREATE_STRICT',                'xb');
define('FOPEN_READ_WRITE_CREATE_STRICT',        'x+b');

define('GLOBAL_TRUE', 1);
define('GLOBAL_FALSE', 2);
define('GROUP_STATUS_NORMAL', 0);
define('GROUP_STATUS_DELETE', 4);

define('RETURN_TRUE', 1);
define('RETURN_FALSE', 0);

define('COMMON_STATUS_NORMAL', 1);
define('COMMON_STATUS_DELETE', 4);

define('COLOR_GREEN', 1);
define('COLOR_YELLOW', 2);
define('COLOR_BLUE', 3);
define('COLOR_GRASSGREEN', 4);
define('COLOR_PURPLE', 5);
define('COLOR_GRAY', 6);
define('COLOR_RED', 7);
define('COLOR_BLACK', 8);

// notification type
define('NOTIFY_FOR_PUBLIC', 1);
define('NOTIFY_FOR_USER', 2);
define('NOTIFY_FOR_DM', 3);

// notification read
define('NOTIFY_READ', 1);
define('NOTIFY_UNREAD', 2);

// doc
define('DOC_LANG_CN', 1);
define('DOC_LANG_EN', 2);

// max displayed file size
define('MAX_DISPLAY_DIFF_FILE', 100);
define('MAX_DISPLAY_DIFF_LINE', 500);
define('MAX_DISPLAY_DIFF_LENGTH', 0x2000); // 8K
define('MAX_DISPLAY_FILE_SIZE', 0x200000); // 2M

// workspace for git repository operation
define('WORKSPACE_DIR', '/tmp/workspace');

// salt for totp generator
define('TOTP_SALT', 'codefever-salt');

// default paging sessing
define('DEFAULT_PAGE_SIZE', 20);
define('DEFAULT_PAGE_SIZE_MAX', 100);

// Group (Namespace) Type
define('GROUP_TYPE_NORMAL', 1); // 普通组
define('GROUP_TYPE_USER', 2); // 用户个人默认分组

// preserve url segment
define('PRESERVE_URI', [
    '/^(feature|doc|lang|service|about|pricing|user|users|file|avatar|boss|captcha)$/i',
    '/^(static|static-\d+)$/i',
    '/^(api|apiv\d+|apis)$/i',
    '/^(userInfo|userInfos)$/i',
    '/^(pay|payment|transaction|order|coupon|invoice)$/i',
    '/^(group|groups|repository|repositories|setting|settings|mergerequest|mergerequests|admin)$/i',
]);

// Git Command type
define('GIT_COMMAND_QUERY', 'q');
define('GIT_COMMAND_BATCH_QUERY', 'bq');
define('GIT_COMMAND_FORK', 'f');
define('GIT_COMMAND_INIT', 'i');
define('GIT_COMMAND_DIFF_REMOTE', 'drh');
define('GIT_COMMAND_LOG_REMOTE', 'lrh');

// activity category
define('ACTIVITY_CATEGORY_ALL', 0);
define('ACTIVITY_CATEGORY_COMMIT', 1);
define('ACTIVITY_CATEGORY_MERGE_REQUEST', 2);
define('ACTIVITY_CATEGORY_MEMBER', 3);

// notification category
define('NOTIFICATION_CATEGORY_ALL', 0);
define('NOTIFICATION_CATEGORY_UNREAD', 1);
define('NOTIFICATION_CATEGORY_SYSTEM', 2);
define('NOTIFICATION_CATEGORY_MENTION_ME', 3);

// refuse notification type
define('NOTIFICATION_REFUSE_GROUP', 1);
define('NOTIFICATION_REFUSE_REPOSITORY', 2);

// notification status
// 二进制的每位是一个开关(0打开, 1关闭), 这里定义对应第几位
define('NOTIFICATION_STATUS_MR', 1);
define('NOTIFICATION_STATUS_EMAIL', 2);

// admin user list category
define('ADMIN_USER_CATEGORY_MFAENABLED', 1);
define('ADMIN_USER_CATEGORY_MFADISABLED', 2);
define('ADMIN_USER_CATEGORY_STATUSDELETE', 3);

/* End of file constants.php */
/* Location: ./application/config/constants.php */
