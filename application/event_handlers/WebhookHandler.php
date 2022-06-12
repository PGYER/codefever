<?php

namespace service\EventHandler;

use service\Event\Event;
use service\Constant\EventType;

class WebhookHandler extends EventHandler
{
    protected $ListenedEventList = [
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
        $eventType = $event->type;
        if(in_array($eventType, $this->ListenedEventList)) {
            $this->_processEvent($event);
        }
        return true;
    }

    private function _processEvent(Event $event)
    {
        $this->CI->load->model('Repository_model', 'repositoryModel');
        $this->CI->repositoryModel->addRepositoryWebhookEvent(
            $event->user,
            $event->data->rKey,
            $event->type,
            $event->data->getData()
        );
    }
}
