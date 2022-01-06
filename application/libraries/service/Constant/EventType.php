<?php
namespace service\Constant;

class EventType {
    /*
     * 事件类型在这里注册，事件格式要求如下
     * 事件字符串:        主事件:子事件
     * 事件常量名:        主事件_子事件
     * 事件数据描述:      主事件_子事件_D
     * 事件数据描述内容:   变量名:基础类型[|变量名:基础类型[|变量名:基础类型...]] (空字符串表示不验证)
     *
     * 在使用 $this->service->newEvent('主事件_子事件', [], $uKey); 创建事件时,
     * newEvent 方法会根据 主事件_子事件_D 中的描述来验证事件数据是否正确.
     *
     * 允许的基础类型:  int float bool string array *
     * 允许的基础类型修饰符号(置于类型标记后): ? 表示可以不存在存在 (如: uKey|string?)
     *
     */
    // group event
    const GROUP = 'group';
    const GROUP_D = '';

    const GROUP_CREATE = 'group:create';
    const GROUP_CREATE_D = 'gKey:string|name:string';

    const GROUP_UPDATE_AVATAR = 'group:updateAvator';
    const GROUP_UPDATE_AVATAR_D = 'gKey:string|from:string|to:string';

    const GROUP_UPDATE_NAME = 'group:updateName';
    const GROUP_UPDATE_NAME_D = self::GROUP_UPDATE_AVATAR_D;

    const GROUP_UPDATE_DESCRIPTION = 'group:updateDescription';
    const GROUP_UPDATE_DESCRIPTION_D = 'gKey:string';

    const GROUP_ADD_MEMBER = 'group:addMember';
    const GROUP_ADD_MEMBER_D = 'gKey:string|uid:string|name:string|email:string';

    const GROUP_CHANGE_MEMBER_ROLE = 'group:changeMemberRole';
    const GROUP_CHANGE_MEMBER_ROLE_D = 'gKey:string|uid:string|name:string|email:string|to:int';

    const GROUP_REMOVE_MEMBER = 'group:removeMember';
    const GROUP_REMOVE_MEMBER_D = self::GROUP_ADD_MEMBER_D;

    const GROUP_CHANGE_OWNER = 'group:changeOwner';
    const GROUP_CHANGE_OWNER_D = self::GROUP_ADD_MEMBER_D;

    const GROUP_CHANGE_URL = 'group:changeURL';
    const GROUP_CHANGE_URL_D = self::GROUP_UPDATE_AVATAR_D;

    const GROUP_REMOVE = 'group:remove';
    const GROUP_REMOVE_D = self::GROUP_CREATE_D;

    // repos event
    const REPO = 'repo';
    const REPO_D = '';

    const REPO_CREATE = 'repo:create';
    const REPO_CREATE_D = 'gKey:string|rKey:string|name:string';

    const REPO_FORK = 'repo:fork';
    const REPO_FORK_D = 'gKey:string|rKey:string|forkFrom:string|name:string|sourceName:string';

    const REPO_UPDATE_AVATAR = 'repo:updateAvator';
    const REPO_UPDATE_AVATAR_D = 'gKey:string|rKey:string|from:string|to:string';

    const REPO_UPDATE_NAME = 'repo:updateName';
    const REPO_UPDATE_NAME_D = self::REPO_UPDATE_AVATAR_D;

    const REPO_UPDATE_DESCRIPTION = 'repo:updateDescription';
    const REPO_UPDATE_DESCRIPTION_D = 'gKey:string|rKey:string';

    const REPO_ADD_MEMBER = 'repo:addMember';
    const REPO_ADD_MEMBER_D = 'gKey:string|rKey:string|uid:string|name:string|email:string';

    const REPO_CHANGE_MEMBER_ROLE = 'repo:changeMemberRole';
    const REPO_CHANGE_MEMBER_ROLE_D = 'gKey:string|rKey:string|uid:string|name:string|email:string|to:int';

    const REPO_REMOVE_MEMBER = 'repo:removeMember';
    const REPO_REMOVE_MEMBER_D = self::REPO_ADD_MEMBER_D;

    const REPO_CHANGE_OWNER = 'repo:changeOwner';
    const REPO_CHANGE_OWNER_D = self::REPO_ADD_MEMBER_D;

    const REPO_CHANGE_URL = 'repo:changeURL';
    const REPO_CHANGE_URL_D = self::REPO_UPDATE_AVATAR_D;

    const REPO_REMOVE = 'repo:remove';
    const REPO_REMOVE_D = self::REPO_CREATE_D;

    // branch event
    const BRANCH_CREATE = 'branch:create';
    const BRANCH_CREATE_D = 'gKey:string|rKey:string|name:string';

    const BRANCH_REMOVE = 'branch:remove';
    const BRANCH_REMOVE_D = self::BRANCH_CREATE_D;

    const DEFAULT_BRANCH_CHANGE = 'branch:changeDefaultBranch';
    const DEFAULT_BRANCH_CHANGE_D = self::REPO_UPDATE_AVATAR_D;

    const PROTECTED_BRANCH_RULE_CREATE = 'branch:createProtectedBranchRule';
    const PROTECTED_BRANCH_RULE_CREATE_D = self::BRANCH_CREATE_D;

    const PROTECTED_BRANCH_RULE_CHANGE = 'branch:changeProtectedBranchRule';
    const PROTECTED_BRANCH_RULE_CHANGE_D = self::BRANCH_CREATE_D;

    const PROTECTED_BRANCH_RULE_REMOVE = 'branch:removeProtectedBranchRule';
    const PROTECTED_BRANCH_RULE_REMOVE_D = self::BRANCH_CREATE_D;

    // tag event
    const TAG_CREATE = 'tag:create';
    const TAG_CREATE_D = 'gKey:string|rKey:string|name:string';

    const TAG_REMOVE = 'tag:remove';
    const TAG_REMOVE_D = self::TAG_CREATE_D;

    // merge request
    const MERGE_REQUEST_CREATE = 'mergeRequest:create';
    const MERGE_REQUEST_CREATE_D = 'gKey:string|rKey:string|id:int|mrKey:string|sourceBranch:string|targetBranch:string|sourceRKey:string|sourceGKey:string';

    const MERGE_REQUEST_CLOSE = 'mergeRequest:close';
    const MERGE_REQUEST_CLOSE_D = self::MERGE_REQUEST_CREATE_D;

    const MERGE_REQUEST_MERGE = 'mergeRequest:merge';
    const MERGE_REQUEST_MERGE_D = self::MERGE_REQUEST_CREATE_D;

    const MERGE_REQUEST_REVIEWER_CREATE = 'mergeRequestReviewer:create';
    const MERGE_REQUEST_REVIEWER_CREATE_D = 'gKey:string|rKey:string|id:int|mrKey:string|reviewer:string|mrrKey:string';

    const MERGE_REQUEST_REVIEWER_DELETE = 'mergeRequestReviewer:delete';
    const MERGE_REQUEST_REVIEWER_DELETE_D = 'gKey:string|rKey:string|id:int|mrKey:string|reviewer:string';

    const MERGE_REQUEST_REVIEWER_REVIEW = 'mergeRequestReviewer:review';
    const MERGE_REQUEST_REVIEWER_REVIEW_D = self::MERGE_REQUEST_REVIEWER_DELETE_D;

    // repository hooks event
    const HOOK = 'hook';
    const HOOK_D = '';

    const HOOK_POST_RECEIVE = 'hook:postReceive';
    const HOOK_POST_RECEIVE_D = 'rKey:string|name:string|from:string|to:string';
}
