<?php

namespace service\EventHandler;

use service\Event\Event;
use service\Constant\EventType;
use service\Constant\ActivityType;
use service\Utility\UUID;

class ActivityHandler extends EventHandler
{

    protected $ListenedEventList = [
        EventType::GROUP_CREATE,
        EventType::GROUP_UPDATE_AVATAR,
        EventType::GROUP_UPDATE_NAME,
        EventType::GROUP_UPDATE_DESCRIPTION,
        EventType::GROUP_ADD_MEMBER,
        EventType::GROUP_CHANGE_MEMBER_ROLE,
        EventType::GROUP_REMOVE_MEMBER,
        EventType::GROUP_CHANGE_OWNER,
        EventType::GROUP_CHANGE_URL,
        EventType::GROUP_REMOVE,

        EventType::REPO_CREATE,
        EventType::REPO_FORK,
        EventType::REPO_UPDATE_AVATAR,
        EventType::REPO_UPDATE_NAME,
        EventType::REPO_UPDATE_DESCRIPTION,
        EventType::REPO_ADD_MEMBER,
        EventType::REPO_CHANGE_MEMBER_ROLE,
        EventType::REPO_REMOVE_MEMBER,
        EventType::REPO_CHANGE_OWNER,
        EventType::REPO_CHANGE_URL,
        EventType::REPO_REMOVE,

        EventType::BRANCH_CREATE,
        EventType::BRANCH_REMOVE,
        EventType::DEFAULT_BRANCH_CHANGE,
        EventType::PROTECTED_BRANCH_RULE_CREATE,
        EventType::PROTECTED_BRANCH_RULE_CHANGE,
        EventType::PROTECTED_BRANCH_RULE_REMOVE,

        EventType::TAG_CREATE,
        EventType::TAG_REMOVE,

        EventType::MERGE_REQUEST_CREATE,
        EventType::MERGE_REQUEST_CLOSE,
        EventType::MERGE_REQUEST_MERGE,
        EventType::MERGE_REQUEST_REVIEWER_CREATE,
        EventType::MERGE_REQUEST_REVIEWER_DELETE,
        EventType::MERGE_REQUEST_REVIEWER_REVIEW,

        EventType::HOOK_POST_RECEIVE
    ];

    function capture(Event $event)
    {
        $this->CI->load->model('Repository_model', 'repositoryModel');

        // filter event type
        $eventType = $event->type;
        if(in_array($eventType, $this->ListenedEventList)) {
            $this->_processEvnet($event);
        }
        return true;
    }

    private function _processEvnet(Event $event)
    {
        // get event type
        $eventType = $event->type;

        if (in_array($eventType, [
            EventType::HOOK_POST_RECEIVE
        ])) {
            $this->_handleRepositoryPushEvent($event);
        } else if (in_array($eventType, [
            EventType::GROUP_CREATE,
            EventType::GROUP_UPDATE_AVATAR,
            EventType::GROUP_UPDATE_NAME,
            EventType::GROUP_UPDATE_DESCRIPTION,
            EventType::GROUP_ADD_MEMBER,
            EventType::GROUP_CHANGE_MEMBER_ROLE,
            EventType::GROUP_REMOVE_MEMBER,
            EventType::GROUP_CHANGE_OWNER,
            EventType::GROUP_CHANGE_URL,
            EventType::GROUP_REMOVE
        ])) {
            $this->_handleGroupEvent($event);
        } else if (in_array($eventType, [
            EventType::REPO_CREATE,
            EventType::REPO_FORK,
            EventType::REPO_UPDATE_AVATAR,
            EventType::REPO_UPDATE_NAME,
            EventType::REPO_UPDATE_DESCRIPTION,
            EventType::REPO_ADD_MEMBER,
            EventType::REPO_CHANGE_MEMBER_ROLE,
            EventType::REPO_REMOVE_MEMBER,
            EventType::REPO_CHANGE_OWNER,
            EventType::REPO_CHANGE_URL,
            EventType::REPO_REMOVE
        ])) {
            $this->_handleRepoEvent($event);
        } else if (in_array($eventType, [
            EventType::BRANCH_CREATE,
            EventType::BRANCH_REMOVE,
            EventType::DEFAULT_BRANCH_CHANGE,
            EventType::PROTECTED_BRANCH_RULE_CREATE,
            EventType::PROTECTED_BRANCH_RULE_CHANGE,
            EventType::PROTECTED_BRANCH_RULE_REMOVE
        ])) {
            $this->_handleBranchEvent($event);
        } else if (in_array($eventType, [
            EventType::TAG_CREATE,
            EventType::TAG_REMOVE
        ])) {
            $this->_handleTagEvent($event);
        } else if (in_array($eventType, [
            EventType::MERGE_REQUEST_CREATE,
            EventType::MERGE_REQUEST_CLOSE,
            EventType::MERGE_REQUEST_MERGE,
            EventType::MERGE_REQUEST_REVIEWER_CREATE,
            EventType::MERGE_REQUEST_REVIEWER_DELETE,
            EventType::MERGE_REQUEST_REVIEWER_REVIEW
        ])) {
            $this->_handleMergeRequestEvent($event);
        }
    }

    private function _handleRepositoryPushEvent(Event $event)
    {
        $matches = [];
        if ($event->data->name && preg_match('/refs\/(heads|tags)\/(.*)/', $event->data->name, $matches)) {

            $insertData = [];
            $insertData['a_key'] = UUID::getKey();
            $insertData['u_key'] = $event->user;
            $insertData['a_relative_r_key'] = $event->data->rKey;

            $repositoryData = $this->CI->repositoryModel->get($insertData['a_relative_r_key']);

            $insertData['a_relative_g_key'] = $repositoryData['g_key'];

            if ($matches[1] === 'heads') {
                $insertData['a_type'] = ActivityType::BRANCH_PUSH;
                if ($event->data->from === '0000000000000000000000000000000000000000') {
                    $insertData['a_type'] = ActivityType::BRANCH_PUSH_NEW;
                }
            } else if ($matches[1] === 'tags') {
                $insertData['a_type'] = ActivityType::TAG_PUSH;
                if ($event->data->from === '0000000000000000000000000000000000000000') {
                    $insertData['a_type'] = ActivityType::TAG_PUSH_NEW;
                }
            }

            $insertData['a_data'] = json_encode([
                'name' => $matches[2],
                'from' => $event->data->from,
                'to' => $event->data->to
            ]);

            $this->CI->db->insert('activities', $insertData);
            $this->CI->repositoryModel->update($insertData['a_relative_r_key'], ['r_updated' => date('Y-m-d H:i:s')]);

            return TRUE;
        }
    }

    private function _handleGroupEvent(Event $event) {
        $eventActivityTypeMapping = [
            EventType::GROUP_CREATE => ActivityType::GROUP_CREATE,
            EventType::GROUP_UPDATE_AVATAR => ActivityType::GROUP_UPDATE_AVATAR,
            EventType::GROUP_UPDATE_NAME => ActivityType::GROUP_UPDATE_NAME,
            EventType::GROUP_UPDATE_DESCRIPTION => ActivityType::GROUP_UPDATE_DESCRIPTION,
            EventType::GROUP_ADD_MEMBER => ActivityType::GROUP_ADD_MEMBER,
            EventType::GROUP_CHANGE_MEMBER_ROLE => ActivityType::GROUP_CHANGE_MEMBER_ROLE,
            EventType::GROUP_REMOVE_MEMBER => ActivityType::GROUP_REMOVE_MEMBER,
            EventType::GROUP_CHANGE_OWNER => ActivityType::GROUP_CHANGE_OWNER,
            EventType::GROUP_CHANGE_URL => ActivityType::GROUP_CHANGE_URL,
            EventType::GROUP_REMOVE => ActivityType::GROUP_REMOVE,
        ];

        $insertData = [];
        $insertData['a_key'] = UUID::getKey();
        $insertData['u_key'] = $event->user;
        $insertData['a_relative_r_key'] = '';
        $insertData['a_relative_g_key'] = $event->data->gKey;
        $insertData['a_type'] = $eventActivityTypeMapping[$event->type];

        if (in_array($event->type, [
            EventType::GROUP_CREATE,
            EventType::GROUP_REMOVE
        ])) {
            $insertData['a_data'] = json_encode([
                'name' => $event->data->name
            ]);
        } else if (in_array($event->type, [
            EventType::GROUP_UPDATE_AVATAR,
            EventType::GROUP_UPDATE_NAME
        ])) {
            $insertData['a_data'] = json_encode([
                'from' => $event->data->from,
                'to' => $event->data->to
            ]);
        } else if (in_array($event->type, [
            EventType::GROUP_UPDATE_AVATAR,
            EventType::GROUP_UPDATE_NAME,
            EventType::GROUP_CHANGE_URL
        ])) {
            $insertData['a_data'] = json_encode([
                'from' => $event->data->from,
                'to' => $event->data->to
            ]);
        } else if (in_array($event->type, [EventType::GROUP_UPDATE_DESCRIPTION])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([]);
        } else if (in_array($event->type, [
            EventType::GROUP_ADD_MEMBER,
            EventType::GROUP_REMOVE_MEMBER,
            EventType::GROUP_CHANGE_OWNER
        ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'uid' => $event->data->uid,
                'name' => $event->data->name,
                'email' => $event->data->email
            ]);
        } else if (in_array($event->type, [EventType::GROUP_CHANGE_MEMBER_ROLE])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'uid' => $event->data->uid,
                'name' => $event->data->name,
                'email' => $event->data->email,
                'to' => $event->data->to,
            ]);
        }

        $this->CI->db->insert('activities', $insertData);

        return TRUE;
    }

    private function _handleRepoEvent(Event $event) {
        $eventActivityTypeMapping = [
            EventType::REPO_CREATE => ActivityType::REPO_CREATE,
            EventType::REPO_FORK => ActivityType::REPO_FORK,
            EventType::REPO_UPDATE_AVATAR => ActivityType::REPO_UPDATE_AVATAR,
            EventType::REPO_UPDATE_NAME => ActivityType::REPO_UPDATE_NAME,
            EventType::REPO_UPDATE_DESCRIPTION => ActivityType::REPO_UPDATE_DESCRIPTION,
            EventType::REPO_ADD_MEMBER => ActivityType::REPO_ADD_MEMBER,
            EventType::REPO_CHANGE_MEMBER_ROLE => ActivityType::REPO_CHANGE_MEMBER_ROLE,
            EventType::REPO_REMOVE_MEMBER => ActivityType::REPO_REMOVE_MEMBER,
            EventType::REPO_CHANGE_OWNER => ActivityType::REPO_CHANGE_OWNER,
            EventType::REPO_CHANGE_URL => ActivityType::REPO_CHANGE_URL,
            EventType::REPO_REMOVE => ActivityType::REPO_REMOVE
        ];

        $insertData = [];
        $insertData['a_key'] = UUID::getKey();
        $insertData['u_key'] = $event->user;
        $insertData['a_relative_r_key'] = $event->data->rKey;
        $insertData['a_relative_g_key'] = $event->data->gKey;

        if (in_array($event->type, [
                EventType::REPO_CREATE,
                EventType::REPO_REMOVE
            ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'name' => $event->data->name
            ]);
        } else if (in_array($event->type, [EventType::REPO_FORK])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'name' => $event->data->name,
                'sourceName' => $event->data->sourceName
            ]);
        } else if (in_array($event->type, [
            EventType::REPO_UPDATE_AVATAR,
            EventType::REPO_UPDATE_NAME,
            EventType::REPO_CHANGE_URL
        ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'from' => $event->data->from,
                'to' => $event->data->to
            ]);
        } else if (in_array($event->type, [EventType::REPO_UPDATE_DESCRIPTION])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([]);
        } else if (in_array($event->type, [
            EventType::REPO_ADD_MEMBER,
            EventType::REPO_REMOVE_MEMBER,
            EventType::REPO_CHANGE_OWNER
        ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'uid' => $event->data->uid,
                'name' => $event->data->name,
                'email' => $event->data->email
            ]);
        } else if (in_array($event->type, [EventType::REPO_CHANGE_MEMBER_ROLE])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'uid' => $event->data->uid,
                'name' => $event->data->name,
                'email' => $event->data->email,
                'to' => $event->data->to,
            ]);
        }

        $this->CI->db->insert('activities', $insertData);
        $this->CI->repositoryModel->update($event->data->rKey, ['r_updated' => date('Y-m-d H:i:s')]);

        return TRUE;
    }

    private function _handleBranchEvent(Event $event) {
        $eventActivityTypeMapping = [
            EventType::BRANCH_CREATE => ActivityType::BRANCH_CREATE,
            EventType::BRANCH_REMOVE => ActivityType::BRANCH_REMOVE,
            EventType::DEFAULT_BRANCH_CHANGE => ActivityType::DEFAULT_BRANCH_CHANGE,
            EventType::PROTECTED_BRANCH_RULE_CREATE => ActivityType::PROTECTED_BRANCH_RULE_CREATE,
            EventType::PROTECTED_BRANCH_RULE_CHANGE => ActivityType::PROTECTED_BRANCH_RULE_CHANGE,
            EventType::PROTECTED_BRANCH_RULE_REMOVE => ActivityType::PROTECTED_BRANCH_RULE_REMOVE
        ];

        $insertData = [];
        $insertData['a_key'] = UUID::getKey();
        $insertData['u_key'] = $event->user;
        $insertData['a_relative_r_key'] = $event->data->rKey;
        $insertData['a_relative_g_key'] = $event->data->gKey;

        if (in_array($event->type, [
                EventType::BRANCH_CREATE,
                EventType::BRANCH_REMOVE,
                EventType::PROTECTED_BRANCH_RULE_CREATE,
                EventType::PROTECTED_BRANCH_RULE_CHANGE,
                EventType::PROTECTED_BRANCH_RULE_REMOVE
            ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'name' => $event->data->name
            ]);
        } else if (in_array($event->type, [
            EventType::DEFAULT_BRANCH_CHANGE
        ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'from' => $event->data->from,
                'to' => $event->data->to
            ]);
        }

        $this->CI->db->insert('activities', $insertData);

        return TRUE;
    }

    private function _handleTagEvent(Event $event) {
        $eventActivityTypeMapping = [
            EventType::TAG_CREATE => ActivityType::TAG_CREATE,
            EventType::TAG_REMOVE => ActivityType::TAG_REMOVE
        ];

        $insertData = [];
        $insertData['a_key'] = UUID::getKey();
        $insertData['u_key'] = $event->user;
        $insertData['a_relative_r_key'] = $event->data->rKey;
        $insertData['a_relative_g_key'] = $event->data->gKey;

        if (in_array($event->type, [
                EventType::TAG_CREATE,
                EventType::TAG_REMOVE
            ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'name' => $event->data->name
            ]);
        }

        $this->CI->db->insert('activities', $insertData);

        return TRUE;
    }

    private function _handleMergeRequestEvent(Event $event) {
        $eventActivityTypeMapping = [
            EventType::MERGE_REQUEST_CREATE => ActivityType::MERGE_REQUEST_CREATE,
            EventType::MERGE_REQUEST_CLOSE => ActivityType::MERGE_REQUEST_CLOSE,
            EventType::MERGE_REQUEST_MERGE => ActivityType::MERGE_REQUEST_MERGE,
            EventType::MERGE_REQUEST_REVIEWER_CREATE => ActivityType::MERGE_REQUEST_REVIEWER_CREATE,
            EventType::MERGE_REQUEST_REVIEWER_DELETE => ActivityType::MERGE_REQUEST_REVIEWER_DELETE,
            EventType::MERGE_REQUEST_REVIEWER_REVIEW => ActivityType::MERGE_REQUEST_REVIEWER_REVIEW
        ];

        $insertData = [];
        $insertData['a_key'] = UUID::getKey();
        $insertData['u_key'] = $event->user;
        $insertData['a_relative_r_key'] = $event->data->rKey;
        $insertData['a_relative_g_key'] = $event->data->gKey;
        $insertData['a_relative_mr_key'] = $event->data->mrKey;

        if (in_array($event->type, [
                EventType::MERGE_REQUEST_CREATE,
                EventType::MERGE_REQUEST_CLOSE,
                EventType::MERGE_REQUEST_MERGE
            ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'id' => $event->data->id,
                'sourceBranch' => $event->data->sourceBranch,
                'targetBranch' => $event->data->targetBranch
            ]);
        } else if (in_array($event->type, [
            EventType::MERGE_REQUEST_REVIEWER_CREATE
        ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'id' => $event->data->id,
                'reviewer' => $event->data->reviewer,
                'mrrKey' => $event->data->mrrKey
            ]);
        } else if (in_array($event->type, [
            EventType::MERGE_REQUEST_REVIEWER_DELETE,
            EventType::MERGE_REQUEST_REVIEWER_REVIEW
        ])) {
            $insertData['a_type'] = $eventActivityTypeMapping[$event->type];
            $insertData['a_data'] = json_encode([
                'id' => $event->data->id,
                'reviewer' => $event->data->reviewer
            ]);
        }

        $this->CI->db->insert('activities', $insertData);

        return TRUE;
    }
}
