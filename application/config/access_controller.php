<?php

namespace service\AccessControl;

use service\AccessControl\AccessController;

class UserAccessController extends AccessController {
    // promision code

    const UAC_NO_PERMISSION = 0x00;
    // repository permission 0x01-0x07
    const UAC_REPO_READ = 0x01;
    const UAC_REPO_PUSH = 0x02;
    const UAC_REPO_REMOVE = 0x03;
    const UAC_REPO_CHANGE_MEMBER = 0x04;
    const UAC_REPO_CHANGE_INFO = 0x05;
    const UAC_REPO_CHANGE_OWNER = 0x06;
    const UAC_REPO_CHANGE_URL = 0x07;

    // merge request permission 0x08-0x0F
    const UAC_MR_READ = 0x08;
    const UAC_MR_PUSH = 0x09;
    const UAC_MR_MERGE = 0x0A;
    const UAC_MR_CLOSE = 0x0B;

    // group permission 0x10-0x17
    const UAC_GROUP_REMOVE = 0x10;
    const UAC_GROUP_CHANGE_MEMBER = 0x11;
    const UAC_GROUP_CREATE_REPO = 0x12;
    const UAC_GROUP_CHANGE_INFO = 0x13;
    const UAC_GROUP_CHANGE_OWNER = 0x14;
    const UAC_GROUP_CHANGE_URL = 0x15;

    // repository permission2 0x18-0x1F
    const UAC_REPO_BRANCH_CREATE = 0x18;
    const UAC_REPO_BRANCH_REMOVE = 0x19;
    const UAC_REPO_TAG_CREATE = 0x1A;
    const UAC_REPO_TAG_REMOVE = 0x1B;
    const UAC_REPO_DEFAULT_BRANCH_CHANGE = 0x1C;
    const UAC_REPO_PROTECTED_BRANCH_RULE_CREATE = 0x1D;
    const UAC_REPO_PROTECTED_BRANCH_RULE_UPDATE = 0x1E;
    const UAC_REPO_PROTECTED_BRANCH_RULE_REOMVE = 0x1F;

    // role id
    const ROLE_NO_PERMISSION = 0;
    const ROLE_GUEST = 1;
    const ROLE_REPORTER = 2;
    const ROLE_DEVELOPER = 3;
    const ROLE_MAINTAINER = 4;
    const ROLE_OWNER = 5;
    const ROLE_NO_BODY = 6;

    // role permission
    const PERMISSION_SETTING = [
        self::ROLE_GUEST => [
            self::UAC_REPO_READ
        ],
        self::ROLE_REPORTER => [
            self::UAC_REPO_READ,
            self::UAC_MR_READ
        ],
        self::ROLE_DEVELOPER => [
            self::UAC_REPO_READ, self::UAC_REPO_PUSH,
            self::UAC_MR_READ, self::UAC_MR_PUSH,
        ],
        self::ROLE_MAINTAINER => [
            self::UAC_REPO_READ, self::UAC_REPO_PUSH, self::UAC_REPO_CHANGE_MEMBER, self::UAC_REPO_CHANGE_INFO,
            self::UAC_MR_READ, self::UAC_MR_PUSH, self::UAC_MR_MERGE, self::UAC_MR_CLOSE,
            self::UAC_GROUP_CHANGE_MEMBER, self::UAC_GROUP_CREATE_REPO, self::UAC_GROUP_CHANGE_INFO,
            self::UAC_REPO_BRANCH_CREATE, self::UAC_REPO_BRANCH_REMOVE, self::UAC_REPO_TAG_CREATE, self::UAC_REPO_TAG_REMOVE, self::UAC_REPO_DEFAULT_BRANCH_CHANGE,
            self::UAC_REPO_PROTECTED_BRANCH_RULE_CREATE, self::UAC_REPO_PROTECTED_BRANCH_RULE_UPDATE, self::UAC_REPO_PROTECTED_BRANCH_RULE_REOMVE,
        ],
        self::ROLE_OWNER => [
            self::UAC_REPO_READ, self::UAC_REPO_PUSH, self::UAC_REPO_REMOVE, self::UAC_REPO_CHANGE_MEMBER, self::UAC_REPO_CHANGE_INFO, self::UAC_REPO_CHANGE_OWNER, self::UAC_REPO_CHANGE_URL,
            self::UAC_MR_READ, self::UAC_MR_PUSH, self::UAC_MR_MERGE, self::UAC_MR_CLOSE,
            self::UAC_GROUP_REMOVE, self::UAC_GROUP_CHANGE_MEMBER, self::UAC_GROUP_CREATE_REPO, self::UAC_GROUP_CHANGE_INFO, self::UAC_GROUP_CHANGE_OWNER, self::UAC_GROUP_CHANGE_URL,
            self::UAC_REPO_BRANCH_CREATE, self::UAC_REPO_BRANCH_REMOVE, self::UAC_REPO_TAG_CREATE, self::UAC_REPO_TAG_REMOVE, self::UAC_REPO_DEFAULT_BRANCH_CHANGE,
            self::UAC_REPO_PROTECTED_BRANCH_RULE_CREATE, self::UAC_REPO_PROTECTED_BRANCH_RULE_UPDATE, self::UAC_REPO_PROTECTED_BRANCH_RULE_REOMVE,
        ],
        self::ROLE_NO_BODY => [] // no permission
    ];

    // repo basic action setting
    const REPO_ACTION_MAPPING = [
        '' => self::UAC_REPO_READ,
        'git-upload-pack' => self::UAC_REPO_READ,
        'git-receive-pack' => self::UAC_REPO_PUSH
    ];
}
