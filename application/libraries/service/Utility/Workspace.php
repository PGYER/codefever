<?php
namespace service\Utility;

use service\Utility\UUID;
use service\Utility\Command;

class Workspace {
    public static function create(string $id = NULL)
    {
        $id = $id ? $id : UUID::getUUID();
        $dir = WORKSPACE_DIR . '/' . $id;
        if (!is_dir(WORKSPACE_DIR)) {
            mkdir(WORKSPACE_DIR);
        }
        mkdir($dir);
        return $dir;
    }

    public static function delete(string $workspace)
    {
        if (stripos($workspace, WORKSPACE_DIR) !== 0) {
            return FALSE;
        }
        return Command::run([
            'rm', '-rf', $workspace
        ]);
    }
}