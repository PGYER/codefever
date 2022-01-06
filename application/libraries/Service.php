<?php
require_once APPPATH . '/libraries/composerlib/vendor/autoload.php';
require_once APPPATH . '/libraries/service/autoLoader.php';
require_once APPPATH . '/libraries/storage.php';

use service\Event\EventData;
use service\Event\ServiceEvent;
use service\AccessControl\UserAccessController;

class Service
{
    protected $CI = NULL;

    public function __construct()
    {
        $this->CI =& get_instance();
    }

    public function newEvent(string $eventName, array $eventData = NULL, string $generatedBy = NULL)
    {
        list($eventName, $eventData) = $this->_validateEvent($eventName, $eventData);
        new ServiceEvent($eventName, new EventData($eventData), $generatedBy);
    }

    public function getGroupRole(string $gKey, string $uKey)
    {
        $this->CI->load->model('Group_model', 'groupModel');
        $roleID = $this->CI->groupModel->getMemberRole($gKey, $uKey);
        if ($roleID) {
            return $roleID;
        }

        return UserAccessController::ROLE_NO_PERMISSION;
    }

    public function getRepositoryRole(string $rKey, string $uKey)
    {
        // check repository owner
        $this->CI->load->model('Repository_model', 'repositoryModel');
        $roleID = $this->CI->repositoryModel->getMemberRole($rKey, $uKey);
        if ($roleID) {
            return $roleID;
        }

        $repositoryData = $this->CI->repositoryModel->get($rKey);

        if (!$repositoryData) {
            return UserAccessController::ROLE_NO_PERMISSION;
        }

        return $this->getGroupRole($repositoryData['g_key'], $uKey);
    }

    public function requestRepositoryPermission(string $rKey, string $uKey, int $permissionCode)
    {
        $roleID = $this->getRepositoryRole($rKey, $uKey);
        if ($roleID) {
            return UserAccessController::checkPermission($permissionCode, $roleID);
        }

        return FALSE;
    }

    public function requestGroupPermission(string $gKey, string $uKey, int $permissionCode)
    {
        $roleID = $this->getGroupRole($gKey, $uKey);
        if ($roleID) {
            return UserAccessController::checkPermission($permissionCode, $roleID);
        }

        return FALSE;
    }

    private function _validateEvent($eventName, $eventData) {
        $eventType = constant('service\Constant\EventType::' . $eventName);
        if (is_null($eventType)) {
            throw new service\Exception\Exception(2001);
        }

        $eventDataDescription = constant('service\Constant\EventType::' . $eventName . '_D');
        if (is_null($eventDataDescription)) {
            throw new service\Exception\Exception(2002);
        }

        $dataDescription = explode('|', $eventDataDescription);
        foreach ($dataDescription as $item) {
            $itemSetting = explode(':', $item);
            if ($item && count($itemSetting) === 2) {
                if (isset($eventData[$itemSetting[0]])) {
                    if (strpos($itemSetting[1], 'int') === 0 && is_int($eventData[$itemSetting[0]])) {
                        continue;
                    } else if (strpos($itemSetting[1], 'float') === 0 && is_float($eventData[$itemSetting[0]])) {
                        continue;
                    } else if (strpos($itemSetting[1], 'bool') === 0 && is_bool($eventData[$itemSetting[0]])) {
                        continue;
                    } else if (strpos($itemSetting[1], 'string') === 0 && is_string($eventData[$itemSetting[0]])) {
                        continue;
                    } else if (strpos($itemSetting[1], 'array') === 0 && is_array($eventData[$itemSetting[0]])) {
                        continue;
                    } else if (strpos($itemSetting[1], '*') === 0) {
                        continue;
                    }
                } else if (strpos($itemSetting[1], '?') > 0) {
                    continue;
                }
                throw new service\Exception\Exception(2003);
            } else if ($item === '') {
                // empty match , pass
                continue;
            } else {
                throw new service\Exception\Exception(2004);
            }
        }
        return [$eventType, $eventData];
    }
}
