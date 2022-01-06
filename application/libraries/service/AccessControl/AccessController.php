<?php

namespace service\AccessControl;

use service\AccessControl\UserAccessController;

class AccessController
{
    static public function checkPermission (int $permissionCode, int $role = 0) {
        if ($permissionCode && $role && in_array($role, array_keys(UserAccessController::PERMISSION_SETTING))) {
            // auth with role id
            if (in_array($permissionCode, UserAccessController::PERMISSION_SETTING[$role])) {
                return TRUE;
            }
        }

        return FALSE;
    }

    static public function checkRepositoryAction (int $roleID, string $action) {
        if ($roleID) {
            // get access description
            $permissions = UserAccessController::PERMISSION_SETTING[$roleID];
            $actionMappedPermissions = UserAccessController::REPO_ACTION_MAPPING[$action];

            if (in_array($actionMappedPermissions, $permissions)) {
                return TRUE;
            }
        }

        return FALSE;
    }
}
