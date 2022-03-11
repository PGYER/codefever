<?php

namespace service\EventHandler;

use service\Event\Event;
use service\Constant\EventType;
use service\Utility\MessageGenerator;
use service\AccessControl\UserAccessController;
use service\Utility\Helper;
use service\MessageService\Email\EmailSender;
use service\MessageService\Email\EmailTemplate;

class UserNotificationHandler extends EventHandler {
    protected $ListenedEventList = [
        EventType::MERGE_REQUEST_CREATE,
        EventType::MERGE_REQUEST_CLOSE,
        EventType::MERGE_REQUEST_MERGE,
        EventType::MERGE_REQUEST_REVIEWER_CREATE,
        EventType::MERGE_REQUEST_REVIEWER_REVIEW
    ];

    protected $messageTemplate = [
        LANG_CN => [
            EventType::MERGE_REQUEST_CREATE => [
                'mailTitle' => '【CodeFever Community】{{$user@users:u_name}} 打开了合并请求',
                'mailBody' => '{{$user@users:u_name}} 打开了和并请求: {{$data->sourceGKey@groups:g_name}}/{{$data->sourceRKey@repositories:r_name}}/{{$data->sourceBranch}} -> {{$data->gKey@groups:g_name}}/{{$data->rKey@repositories:r_name}}/{{$data->targetBranch}}',
            ],
            EventType::MERGE_REQUEST_CLOSE => [
                'mailTitle' => '【CodeFever Community】{{$user@users:u_name}} 关闭了合并请求',
                'mailBody' => '{{$user@users:u_name}} 关闭了和并请求: {{$data->sourceGKey@groups:g_name}}/{{$data->sourceRKey@repositories:r_name}}/{{$data->sourceBranch}} -> {{$data->gKey@groups:g_name}}/{{$data->rKey@repositories:r_name}}/{{$data->targetBranch}}',
            ],
            EventType::MERGE_REQUEST_MERGE => [
                'mailTitle' => '【CodeFever Community】{{$user@users:u_name}} 合并了合并请求',
                'mailBody' => '{{$user@users:u_name}} 合并了和并请求: {{$data->sourceGKey@groups:g_name}}/{{$data->sourceRKey@repositories:r_name}}/{{$data->sourceBranch}} -> {{$data->gKey@groups:g_name}}/{{$data->rKey@repositories:r_name}}/{{$data->targetBranch}}',
            ],
            EventType::MERGE_REQUEST_REVIEWER_CREATE => [
                'mailTitle' => '【CodeFever Community】合并请求评审',
                'mailBody' => '{{$user@users:u_name}} 指定你为和并请求 {{$data->rKey@repositories:r_name}}!{{$data->id}} 的评审员',
            ],
            EventType::MERGE_REQUEST_REVIEWER_REVIEW => [
                'mailTitle' => '【CodeFever Community】合并请求评审',
                'mailBody' => '{{$user@users:u_name}} 通过了合并请求 {{$data->rKey@repositories:r_name}}!{{$data->id}} 的评审',
            ]
        ],
        LANG_EN => [
            EventType::MERGE_REQUEST_CREATE => [
                'mailTitle' => '【CodeFever Community】{{$user@users:u_name}} Open Merge Request',
                'mailBody' => '{{$user@users:u_name}} Open Merge Request: {{$data->sourceGKey@groups:g_name}}/{{$data->sourceRKey@repositories:r_name}}/{{$data->sourceBranch}} -> {{$data->gKey@groups:g_name}}/{{$data->rKey@repositories:r_name}}/{{$data->targetBranch}}',
            ],
            EventType::MERGE_REQUEST_CLOSE => [
                'mailTitle' => '【CodeFever Community】{{$user@users:u_name}} Close Merge Request',
                'mailBody' => '{{$user@users:u_name}} Close Merge Request: {{$data->sourceGKey@groups:g_name}}/{{$data->sourceRKey@repositories:r_name}}/{{$data->sourceBranch}} -> {{$data->gKey@groups:g_name}}/{{$data->rKey@repositories:r_name}}/{{$data->targetBranch}}',
            ],
            EventType::MERGE_REQUEST_MERGE => [
                'mailTitle' => '【CodeFever Community】{{$user@users:u_name}} Merge The Merge Request',
                'mailBody' => '{{$user@users:u_name}} Merge The Merge Request: {{$data->sourceGKey@groups:g_name}}/{{$data->sourceRKey@repositories:r_name}}/{{$data->sourceBranch}} -> {{$data->gKey@groups:g_name}}/{{$data->rKey@repositories:r_name}}/{{$data->targetBranch}}',
            ],
            EventType::MERGE_REQUEST_REVIEWER_CREATE => [
                'mailTitle' => '【CodeFever Community】Merge Request Review',
                'mailBody' => '{{$user@users:u_name}} Designates You As A Reviewer For Merge Request {{$data->rKey@repositories:r_name}}!{{$data->id}}',
            ],
            EventType::MERGE_REQUEST_REVIEWER_REVIEW => [
                'mailTitle' => '【CodeFever Community】Merge Request Review',
                'mailBody' => '{{$user@users:u_name}} Passed Review Of Merge Request {{$data->rKey@repositories:r_name}}!{{$data->id}}',
            ]
        ]
    ];

    protected $messageFieldData = [
        EventType::MERGE_REQUEST_CREATE => [
            'cueOption' => ['members'],
            'internalData' => [
                'user' => '{{$user@users:u_name}}',
                'group' => '{{$data->gKey@groups:g_name}}',
                'repository' => '{{$data->rKey@repositories:r_name}}',
                'sourceRepository' => '{{$data->sourceRKey@repositories:r_name}}',
                'sourceBranch' => '{{$data->sourceBranch}}',
                'targetBranch' => '{{$data->targetBranch}}',
                'number' => '{{$data->id}}',
                'title' => '{{$data->mrKey@merge_requests:mr_title}}',
                'description' => '{{$data->mrKey@merge_requests:mr_description}}',
                'created' => '{{$data->mrKey@merge_requests:mr_created}}'
            ]
        ],
        EventType::MERGE_REQUEST_CLOSE => [
            'cueOption' => ['members'],
            'internalData' => [
                'user' => '{{$user@users:u_name}}',
                'group' => '{{$data->gKey@groups:g_name}}',
                'repository' => '{{$data->rKey@repositories:r_name}}',
                'sourceRepository' => '{{$data->sourceRKey@repositories:r_name}}',
                'sourceBranch' => '{{$data->sourceBranch}}',
                'targetBranch' => '{{$data->targetBranch}}',
                'number' => '{{$data->id}}',
                'title' => '{{$data->mrKey@merge_requests:mr_title}}',
                'description' => '{{$data->mrKey@merge_requests:mr_description}}',
                'closed' => '{{$data->mrKey@merge_requests:mr_close_time}}'
            ]
        ],
        EventType::MERGE_REQUEST_MERGE => [
            'cueOption' => ['members'],
            'internalData' => [
                'user' => '{{$user@users:u_name}}',
                'group' => '{{$data->gKey@groups:g_name}}',
                'repository' => '{{$data->rKey@repositories:r_name}}',
                'sourceRepository' => '{{$data->sourceRKey@repositories:r_name}}',
                'sourceBranch' => '{{$data->sourceBranch}}',
                'targetBranch' => '{{$data->targetBranch}}',
                'number' => '{{$data->id}}',
                'title' => '{{$data->mrKey@merge_requests:mr_title}}',
                'description' => '{{$data->mrKey@merge_requests:mr_description}}',
                'merged' => '{{$data->mrKey@merge_requests:mr_merge_time}}'
            ]
        ],
        EventType::MERGE_REQUEST_REVIEWER_CREATE => [
            'cueOption' => ['reviewer'],
            'internalData' => [
                'user' => '{{$user@users:u_name}}',
                'reviewer' => '{{$data->reviewer@users:u_name}}',
                'group' => '{{$data->gKey@groups:g_name}}',
                'repository' => '{{$data->rKey@repositories:r_name}}',
                'number' => '{{$data->id}}',
                'title' => '{{$data->mrKey@merge_requests:mr_title}}',
                'created' => '{{$data->mrrKey@merge_request_reviewers:mrr_created}}'
            ]
        ],
        EventType::MERGE_REQUEST_REVIEWER_REVIEW => [
            'cueOption' => ['members'],
            'internalData' => [
                'user' => '{{$user@users:u_name}}',
                'reviewer' => '{{$data->reviewer@users:u_name}}',
                'group' => '{{$data->gKey@groups:g_name}}',
                'repository' => '{{$data->rKey@repositories:r_name}}',
                'number' => '{{$data->id}}',
                'title' => '{{$data->mrKey@merge_requests:mr_title}}'
            ]
        ]
    ];

    public function capture(Event $event)
    {
        $eventType = $event->type;
        if (!in_array($eventType, $this->ListenedEventList)) {
            return FAlSE;
        }

        $notifyMessageSet = array_merge($this->messageTemplate[$event->language][$eventType], $this->messageFieldData[$eventType]);
        $affectedUsers = $this->getAffectedUsers($event, $notifyMessageSet['cueOption']);
        $messageData = $this->composeMessageData($event, $notifyMessageSet);

        if (is_array($affectedUsers) && count($affectedUsers)) {
            $this->sendMail($event, $messageData, $affectedUsers);
            $this->addWebSiteMessage($event, $messageData, $affectedUsers);
            // $this->sendSms($event,  $messageData, $affectedUsers, $projectInfo['p_key']);
            // $this->sendWXMessage($event, $messageData, $affectedUsers, $projectInfo['p_key'], $messageData['i_no'], $projectInfo['p_name'], $messageData['i_status_text']);
            // $this->addBrowserNotification($event, $messageData, $affectedUsers, $projectInfo['p_key']);
        }
    }

    public function getAffectedUsers(Event $event, array $cueOption)
    {
        if (count($cueOption) == 0) {
            return FALSE;
        }

        $affectedUsers = MessageGenerator::fetchUserList($cueOption, $event);
        $affectedUsers = $this->filterOtherRule($affectedUsers, $event);
        $affectedUsers = $this->filterProjectNotificationSetting($affectedUsers, $event);
        $affectedUsers = $this->filterUserNotificationSetting($affectedUsers, $event);

        return $affectedUsers;
    }

    // 根据用户对组或仓库的通知设置过滤
    protected function filterProjectNotificationSetting(array $affectedUsers, Event $event)
    {
        $this->CI->load->model('Notification_model', 'notificationModel');
        $result = [];
        foreach ($affectedUsers as $user) {
            // check group
            if ($this->CI->notificationModel->isNotificationRefusedExists(
                $user['u_key'],
                NOTIFICATION_REFUSE_GROUP,
                $event->data->gKey)) {
                continue;
            }

            // check repository
            if ($this->CI->notificationModel->isNotificationRefusedExists(
                $user['u_key'],
                NOTIFICATION_REFUSE_REPOSITORY,
                $event->data->rKey)) {
                continue;
            }

            array_push($result, $user);
        }

        return $result;
    }

    protected function filterOtherRule(array $affectedUsers, Event $event)
    {
        $result = [];

        if ($event->type == EventType::MERGE_REQUEST_REVIEWER_REVIEW) {
            foreach ($affectedUsers as $user) {
                if ($user['role'] > UserAccessController::ROLE_DEVELOPER) {
                    array_push($result, $user);
                }
            }
        } else if (in_array($event->type, [
            EventType::MERGE_REQUEST_CREATE,
            EventType::MERGE_REQUEST_CLOSE,
            EventType::MERGE_REQUEST_MERGE
        ])) {
            if ($event->type == EventType::MERGE_REQUEST_CREATE && $event->data->reviewers) {
                $affectedUsers = [];
            }

            foreach ($affectedUsers as $user) {
                if ($user['role'] > UserAccessController::ROLE_REPORTER) {
                    array_push($result, $user);
                }
            }
        } else if ($event->type == EventType::MERGE_REQUEST_REVIEWER_CREATE) {
            $result = $affectedUsers;
        }

        return $result;
    }

    // 根据用户设置过滤 u_notification_status 字段
    protected function filterUserNotificationSetting(array $affectedUsers, Event $event)
    {
        $result = [
            'email' => [],
            'internal' => []
        ];

        foreach ($affectedUsers as $user) {
            // check merge request event type
            if (in_array($event->type, [
                EventType::MERGE_REQUEST_CREATE,
                EventType::MERGE_REQUEST_CLOSE,
                EventType::MERGE_REQUEST_MERGE,
                EventType::MERGE_REQUEST_REVIEWER_CREATE,
                EventType::MERGE_REQUEST_REVIEWER_REVIEW
            ])) {
                if (($user['u_notification_status'] >> (NOTIFICATION_STATUS_MR - 1) & 1) === 1) {
                    continue;
                }
            } else if (false) {
                // other event type
            }

            array_push($result['internal'], $user);

            // check email notification status
            if (($user['u_notification_status'] >> (NOTIFICATION_STATUS_EMAIL - 1) & 1) === 0) {
                array_push($result['email'], $user['u_email']);
            }
        }

        return $result;
    }

    protected function composeMessageData(Event $event, array $messageSet)
    {
        if (!$messageSet) {
            return FALSE;
        }

        if (isset($messageSet['cueOption'])) {
            unset($messageSet['cueOption']);
        }

        $messageSet['internalData'] = $this->toInternalData($messageSet['internalData']);

        $delimiter = Helper::getDelimiter() . Helper::getDelimiter();
        $template = implode($delimiter, array_values($messageSet));
        $tmpData = MessageGenerator::getMessageData($template, $event);
        $messageData = explode($delimiter, $tmpData);
        $messageData = array_combine(array_keys($messageSet), $messageData);

        $messageData['internalData'] = $this->parseInternalData($messageData['internalData']);

        return $messageData;
    }

    protected function toInternalData(array $data)
    {
        if (!$data) {
            return FALSE;
        }

        $result = [];
        $delimiter = Helper::getDelimiter();

        foreach ($data as $key => $val) {
            $result[] = $key . $delimiter . $val;
        }

        $result = implode("\n", $result);
        return $result;
    }

    protected function parseInternalData(string $message)
    {
        if (!$message) {
            return FALSE;
        }

        $data = [];
        $delimiter = Helper::getDelimiter();
        $keyValueStrs = explode("\n", $message);

        foreach ($keyValueStrs as $keyValueStr) {
            $keyValue = explode($delimiter, $keyValueStr);
            if (count($keyValue) == 2) {
                $data[$keyValue[0]] = $keyValue[1];
            }
        }

        return $data;
    }

    protected function addWebSiteMessage(Event $event, array $messageData, array $affectedUsers)
    {
        if (!isset($affectedUsers['internal']) || count($messageData) == 0) {
            return FALSE;
        }

        $this->CI->load->model('Notification_model', 'notificationModel');
        $users = $affectedUsers['internal'];

        foreach ($users as $user) {
            $this->CI->notificationModel->addNotification($user['u_key'], $event->type, json_encode($messageData['internalData'], TRUE), NOTIFY_FOR_USER, $event->data->gKey, $event->data->rKey);
        }

        return TRUE;
    }

    public function sendMail(Event $event, array $messageData, array $affectedUsers)
    {
        if (!isset($affectedUsers['email']) || count($messageData) == 0) {
            return FALSE;
        }

        $host = YAML_HOST . '/';
        $emails = $affectedUsers['email'];

        if (in_array($event->type, [
            EventType::MERGE_REQUEST_CREATE,
            EventType::MERGE_REQUEST_CLOSE,
            EventType::MERGE_REQUEST_MERGE,
            EventType::MERGE_REQUEST_REVIEWER_CREATE,
            EventType::MERGE_REQUEST_REVIEWER_REVIEW
        ])) {
            $messageData['url'] = $host . $messageData['internalData']['group'] . '/' . $messageData['internalData']['repository'] . '/mergerequests/' . $messageData['internalData']['number'];
        }

        $body = EmailTemplate::notify($messageData);

        foreach($emails as $email) {
            EmailSender::send(
                $email,
                $messageData['mailTitle'],
                $body
            );
        }
    }
}
