<?php

namespace service\Utility;

class Command
{
    public static function run(array $command, array &$output = [], array $env=[])
    {
        $status = -1;
        array_unshift($command, 'export LANG=en_US.UTF-8 &&');
        foreach ($env as $key => $value) {
            array_unshift($command, 'export ' . $key . '=' . $value .  ' &&');
        }
        exec(implode(' ', $command), $output, $status);
        return $status ? FALSE : TRUE;
    }

    public static function runWithoutOutput(array $command)
    {
        $status = -1;
        array_unshift($command, 'export LANG=en_US.UTF-8 &&');
        array_push($command, '>/dev/null');
        system(implode(' ', $command), $status);
        return $status ? FALSE : TRUE;
    }

    public static function batch(array $commands)
    {
        if (!$commands) {
            return FALSE;
        }

        $commands = implode(" &&\n", $commands);
        exec($commands, $output, $return);
        return implode("\n", $output);
    }

    public static function wrapArgument(string $argument)
    {
        // $argument = str_replace('\\', '\\\\',$argument);
        // $argument = str_replace('"', '\"',$argument);
        // return '"' . $argument . '"';

        $pattern = [
            '/(^|[^\\\\])((\\\\\\\\)*[\'\"\$\|])/',
            '/(^|[^\\\\])((\\\\\\\\)*\\\\([^\'\"\|\$\\\\]|$))/'
        ];
        $replacement = [
            '$1\\\\$2',
            '$1\\\\$2'
        ];

        $result = preg_replace($pattern, $replacement, $argument);
        while ($result !== $argument) {
            $argument = $result;
            $result = preg_replace($pattern, $replacement, $argument);
        }

        return $result;
        // return '"' . $result . '"';
    }
}
