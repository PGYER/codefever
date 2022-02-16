<?php
namespace service\Constant;

class ActivityType {
    // User  0x0100

    // Group 0x0200
    const GROUP_CREATE = 0x0201;
    const GROUP_UPDATE_AVATAR = 0x0202;
    const GROUP_UPDATE_NAME = 0x0203;
    const GROUP_UPDATE_DESCRIPTION = 0x0204;
    const GROUP_ADD_MEMBER = 0x0205;
    const GROUP_CHANGE_MEMBER_ROLE = 0x0206;
    const GROUP_REMOVE_MEMBER = 0x0207;
    const GROUP_CHANGE_OWNER = 0x0208;
    const GROUP_CHANGE_URL = 0x0209;
    const GROUP_REMOVE = 0x020A;


    // Repository 0x0300 (768)
    const REPO_CREATE = 0x0301;
    const REPO_FORK = 0x0302;
    const REPO_UPDATE_AVATAR = 0x0303;
    const REPO_UPDATE_NAME = 0x0304;
    const REPO_UPDATE_DESCRIPTION = 0x0305;
    const REPO_ADD_MEMBER = 0x0306;
    const REPO_CHANGE_MEMBER_ROLE = 0x0307;
    const REPO_REMOVE_MEMBER = 0x0308;
    const REPO_CHANGE_OWNER = 0x0309;
    const REPO_CHANGE_URL = 0x030A;
    const REPO_REMOVE = 0x030B;

    // Branch 0x0400 (1024)
    const BRANCH_PUSH = 0x0401;
    const BRANCH_PUSH_NEW = 0x0402;
    const BRANCH_CREATE = 0x0403;
    const BRANCH_REMOVE = 0x0404;
    const DEFAULT_BRANCH_CHANGE = 0x0405;
    const PROTECTED_BRANCH_RULE_CREATE = 0x0406;
    const PROTECTED_BRANCH_RULE_CHANGE = 0x0407;
    const PROTECTED_BRANCH_RULE_REMOVE = 0x0408;

    // Tag 0x0500 (1280)
    const TAG_PUSH = 0x0501;
    const TAG_PUSH_NEW = 0x0502;
    const TAG_CREATE = 0x0503;
    const TAG_REMOVE = 0x0504;

    // Commit 0x0600

    // Merge Branch(Request) (1792)
    const MERGE_REQUEST_CREATE = 0x0701;
    const MERGE_REQUEST_CLOSE = 0x0702;
    const MERGE_REQUEST_MERGE = 0x0703;
    const MERGE_REQUEST_REVIEWER_CREATE = 0x0704;
    const MERGE_REQUEST_REVIEWER_DELETE = 0x0705;
    const MERGE_REQUEST_REVIEWER_REVIEW = 0x0706;

    // webhook
    const WEBHOOK_CREATE = 0x0901;
    const WEBHOOK_UPDATE = 0x0902;
    const WEBHOOK_DELETE = 0x0903;
}
