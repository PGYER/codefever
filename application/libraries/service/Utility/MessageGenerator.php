<?php

namespace service\Utility;

use service\Event\Event;
use service\Exception\Exception;
use service\AccessControl\UserAccessController;

class MessageGenerator {
    public static $messageComposeFn = 'sprintf';

    // array()   '{eventType}' => [ {tableName}, {primaryKeyName}]
    public static $databaseConfig = [
        'user' => ['users', 'u_key'],
        'group' => ['groups', 'g_key'],
        'repository' => ['repositories', 'r_key'],
        'mergerequest' => ['merge_requests', 'mr_key'],
        'mergerequestReviewer' => ['merge_request_reviewers', 'mrr_key']
    ];

    public static function fetchUserList(array $cueOption, Event $event)
    {
        $CI = self::getCodeigniterObject();
        $CI->load->model('Usr_model', 'userModel');
        $CI->load->model('Group_model', 'groupModel');
        $CI->load->model('Repository_model', 'repositoryModel');

        $eventGenerater = $event->user;
        $result = [];

        foreach ($cueOption as $option) {
            if ($option == 'members') {
                // group members
                $CI->db->select('u.*, gm.gm_role AS role');
                $CI->db->from('group_members AS gm');
                $CI->db->where('g_key', $event->data->gKey);
                $CI->db->where('gm_status', COMMON_STATUS_NORMAL);
                $CI->db->join('users AS u', 'gm.u_key = u.u_key', 'LEFT');
                $groupMembers = $CI->db->get();
                $groupMembers = $groupMembers->result_array();

                // group creator
                $groupData = $CI->groupModel->get($event->data->gKey);
                $groupCreator = $CI->userModel->get($groupData['u_key']);
                $groupCreator['role'] = UserAccessController::ROLE_OWNER;

                // repository members
                $CI->db->select('u.*, rm.rm_role AS role');
                $CI->db->from('repository_members AS rm');
                $CI->db->where('r_key', $event->data->rKey);
                $CI->db->where('rm_status', COMMON_STATUS_NORMAL);
                $CI->db->join('users AS u', 'rm.u_key = u.u_key', 'LEFT');
                $repositoryMembers = $CI->db->get();
                $repositoryMembers = $repositoryMembers->result_array();

                // repository creator
                $repositoryData = $CI->repositoryModel->get($event->data->rKey);
                $repositoryCreator = $CI->userModel->get($repositoryData['u_key']);
                $repositoryCreator['role'] = UserAccessController::ROLE_OWNER;

                $result = array_merge($result, $repositoryMembers, [$repositoryCreator], $groupMembers, [$groupCreator]);
            } else if ($option == 'reviewer') {
                $CI->db->where('u_key', $event->data->reviewer);
                $reviewer = $CI->db->get('users');
                $reviewer = $reviewer->row_array();

                $result = array_merge($result, [$reviewer]);
            }
        }

        $uKeys = [];
        $users = array_filter($result, function($item) use ($eventGenerater, &$uKeys) {
            if (preg_match('/^\w{32}$/', $item['u_key']) &&
                $item['u_key'] != $eventGenerater &&
                !isset($uKeys[$item['u_key']])) {
                $uKeys[$item['u_key']] = true;
                return TRUE;
            }
        });
        unset($uKeys);

        return $users;
    }

    public static function getMessageData(string $messageTemplate, Event $event)
    {
        if (preg_match_all('/{{((?:(?!}}[^}]).)*)}}/', $messageTemplate, $matches)) {
            if (count($matches[1])) {
                $dataSource = $matches[1];

                $databaseQuery = [];
                $result = [];
                $defaultValue = [];
                $proceedFn = [];
                // analize query
                self::_messageQueryBuilder($dataSource, $databaseQuery, $event, $result, $proceedFn, $defaultValue);
                $messageData = self::_getMessageQueryResult($dataSource, $databaseQuery, $result, $proceedFn, $defaultValue);
                $messageStatement = preg_replace('/{{((?:(?!}}[^}]).)*)}}/', '%s', $messageTemplate);
                $args = array_merge([$messageStatement], $messageData);

                return call_user_func_array(self::$messageComposeFn, $args);
            }
        }

        return FALSE;
    }

    private static function _messageQueryBuilder(array $dataSource, array &$databaseQuery, Event $event, array &$result, array &$proceedFn, array &$defaultValue)
    {
        $dataIDPrefix = 'data_';
        // codefever 目前这个没用到,没有 affected
        // $basedPrimaryKeyValue = $event->data->data['affected'];
        $basedPrimaryKeyValue = $event->user;

        $dataIDCount = -1;

        foreach($dataSource as $dataOption) {

            $dataIDCount ++;
            $dataName = $dataIDPrefix . $dataIDCount;

            preg_match('/^(.*(?=\|))?(\|)?(.*(?=\=\>))?(\=\>)?(.*)$/', $dataOption, $dataOptionArray);

            if ($dataOptionArray[2] == '|' && $dataOptionArray[4] == '=>') {
                // data expression, default value and procees function
                $dataOption = $dataOptionArray[1];
                $defaultValue[$dataName] = $dataOptionArray[3];
                $proceedFn[$dataName] = $dataOptionArray[5];
            } else if ($dataOptionArray[2] == '|') {
                // data expression and default value
                $dataOption = $dataOptionArray[1];
                $defaultValue[$dataName] = $dataOptionArray[5];
                $proceedFn[$dataName] = NULL;
            } else if ($dataOptionArray[4] == '=>') {
                // data expression and procees function
                $dataOption = $dataOptionArray[3];
                $defaultValue[$dataName] = NULL;
                $proceedFn[$dataName] = $dataOptionArray[5];
            } else {
                // just data expression
                $dataOption = $dataOptionArray[5];
                $defaultValue[$dataName] = NULL;
                $proceedFn[$dataName] = NULL;
            }

            // $directiveVaribla ^\$([\w\"\'\[\]\-\>]+)$/
            if(preg_match('/^\$([\w\"\'\[\]\-\>]+)$/', $dataOption, $matches)) {
                $result[$dataName] = self::_objectPropertyGetter($event, $matches[1]);
                continue;
            }

            // $directVarible @ databaseVarible /^\$([\w\"\'\[\]\-\>]+)@(\w+)\:(\w+)$/
            if(preg_match('/^\$([\w\"\'\[\]\-\>]+)@(\w+)\:(\w+)$/', $dataOption, $matches)) {
                $indirectValue = self::_objectPropertyGetter($event, $matches[1]);
                self::_appendDatabaseQuery(
                    $databaseQuery,
                    $matches[2], // tableName
                    [$matches[2].'.'.$matches[3].' as '.$dataName,], // select section
                    [], // join section
                    [self::_getPrimaryKeyFromTableName($matches[2]) => $indirectValue], // where section
                    [] // config data
                );
                continue;
            }

            // $directVarible @ constConfig /^\$([\w\"\'\[\]\-\>]+)@(?={)(.*)$/
            if(preg_match('/^\$([\w\"\'\[\]\-\>]+)@(?={)(.*)$/', $dataOption, $matches)) {
                $indirectValue = self::_objectPropertyGetter($event, $matches[1]);
                $tmpConfig = json_decode($matches[3], true);
                $result[$dataName] = $tmpConfig[$indirectValue];
                continue;
            }

            // databaseVarible /^(\w+)\:(\w+)$/
            if(preg_match('/^(\w+)\:(\w+)$/', $dataOption, $matches)) {
                self::_appendDatabaseQuery(
                    $databaseQuery,
                    $matches[1], // tableName
                    [$matches[1].'.'.$matches[2].' as '.$dataName], // select section
                    [], // join section
                    [self::_getPrimaryKeyFromTableName($matches[1]) => $basedPrimaryKeyValue], // where section
                    [] // config data
                );
                continue;
            }

            // databaseVarible @ databaseVarible /^(\w+)\:(\w+)@(\w+)\:(\w+)$/
            // issues:pt_key@project_types:pt_name
            if(preg_match('/^(\w+)\:(\w+)@(\w+)\:(\w+)$/', $dataOption, $matches)) {
                self::_appendDatabaseQuery(
                    $databaseQuery,
                    $matches[1], // tableName
                    [$matches[3].'.'.$matches[4].' as '.$dataName], // select section
                    [
                        [
                            $matches[3], // join table
                            self::_getPrimaryKeyFromTableName($matches[3]).'='.$matches[1].'.'.$matches[2], // condition
                            'left' // join type
                        ],
                    ], // join section
                    [self::_getPrimaryKeyFromTableName($matches[1]) => $basedPrimaryKeyValue], // where section
                    [] // config data
                );
                continue;
            }

            // databaseVarible @ constConfig /^(\w+)\:(\w+)@(?={)(.*)$/
            if(preg_match('/^(\w+)\:(\w+)@(?=\{)(.*)$/', $dataOption, $matches)) {
                self::_appendDatabaseQuery(
                    $databaseQuery,
                    $matches[1], // databaseName
                    [$matches[1].'.'.$matches[2].' as '.$dataName], // select section
                    [], // join section
                    [self::_getPrimaryKeyFromTableName($matches[1]) => $basedPrimaryKeyValue], // where section
                    [$dataName => json_decode($matches[3], TRUE)] // config data
                );
                continue;
            }
        }
    }

    private static function _getMessageQueryResult(array $dataSource, array $databaseQuery, array $result, array $proceedFn, array $defaultValue)
    {
        $CI = self::getCodeigniterObject();

        // run query
        foreach ($databaseQuery as $queryData) {
            $CI->db->select(implode(',', $queryData['select']));

            if (count($queryData['join'])) {
                foreach ($queryData['join'] as $parameters) {
                    $CI->db->join($parameters[0], $parameters[1], $parameters[2]);
                }
            }

            foreach ($queryData['where'] as $field => $constraint) {
                $CI->db->where($field, $constraint);
            }

            $CI->db->limit(1);
            $query = $CI->db->get($queryData['table']);
            $finalResult = $query->row_array();
            if (count($queryData['dataConfig'])) {
                foreach ($queryData['dataConfig'] as $key => $data) {
                    $finalResult[$key] = $queryData['dataConfig'][$key][$finalResult[$key]];
                }
            }

            $result = array_merge($result, $finalResult);
        }

        $dataIDPrefix = 'data_';
        $returnArray = [];
        foreach ($dataSource as $index => $dataExpression) {
            $returnArray[$index] = $result[$dataIDPrefix.$index] ? $result[$dataIDPrefix.$index] : $defaultValue[$dataIDPrefix.$index];

            // proceed default function
            if ($proceedFn[$dataIDPrefix.$index]) {
                $returnArray[$index] =  call_user_func_array($proceedFn[$dataIDPrefix.$index], [$returnArray[$index]]);
            }
        }

        //strict title
        return $returnArray;
    }

    private static function _objectPropertyGetter(Event $object, string $propertyString)
    {
        $finalValue = $object;
        foreach (explode('->', $propertyString) as $tmpProperty) {
            if (preg_match('/^(\w+)\[[\'|\"](\w+)[\'|\"]\]$/', $tmpProperty, $subMatches)) {
                $matchedProperty = $subMatches[1];
                $finalValue = $finalValue->$matchedProperty;
                $finalValue = $finalValue[$subMatches[2]];
            } else {
                $finalValue = $finalValue->$tmpProperty;
            }
        }
        return $finalValue;
    }

    private static function _appendDatabaseQuery(array &$queryArray, string $tableName, array $selectSection, array $joinSection, array $whereSection, array $dataConfig)
    {
        foreach ($queryArray as &$query) {
            if ($tableName == $query['table'] && $whereSection == $query['where']) {
                // new query when join a same table with different condition
                $breakFlag = FALSE;
                $stopJoinFlag = FALSE;

                foreach($query['join'] as $join) {

                    if(!count($joinSection[0])){
                        break;
                    }

                    $interactData = array_diff_assoc($join, $joinSection[0]);
                    if(empty($interactData)){
                        $joinSection = [];
                        break;
                    }

                    if($join[0] == $joinSection[0][0] && $join[1] != $joinSection[0][1]) {
                        $breakFlag = $breakFlag || true;
                        break;
                    }
                }

                if($breakFlag) {
                    break;
                }

                $query['select'] = array_merge($query['select'], $selectSection);
                $query['join'] = array_merge($query['join'], $joinSection);
                $query['dataConfig'] = array_merge($query['dataConfig'], $dataConfig);
                return true;
            }
        }

        // merge setting
        array_push($queryArray, [
            'table' => $tableName,
            'select' => $selectSection,
            'join' => $joinSection,
            'where' => $whereSection,
            'dataConfig' => $dataConfig,
        ]);
        return true;
    }

    private static function _getPrimaryKeyFromTableName(string $tableName)
    {
        foreach (self::$databaseConfig as $config) {
            if ($config[0] == $tableName) {
                return $tableName . '.' . $config[1];
            }
        }
    }

    protected static function getCodeigniterObject()
    {
        $CI = & get_instance();
        return $CI;
    }
}
