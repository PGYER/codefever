<?php

namespace service\Utility;

class QueryParse {
    static public $handler = [];

    static public function registerHandler(string $name, $handler)
    {
        self::$handler[$name] = $handler;
    }

    static public function parse(array $query)
    {
        $result = [];

        foreach ($query as $key => $conditionStr) {
            $result[$key] = null;

            if (is_array($conditionStr)) {
                $result[$key] = self::parse($conditionStr);
            } else if (is_string($conditionStr)) {
                $condition = self::_parseCondition($conditionStr, $result);
                if ($condition && self::$handler[$condition[0]]) {
                    $result[$key] = self::$handler[$condition[0]]->handle($condition[1]);
                }
            }
        }

        return $result;
    }

    static private function _parseCondition(string $conditionStr, array $data)
    {
        if (!preg_match('/^([a-z_$][a-z0-9_$]*)\((.*)\)$/i', $conditionStr, $match)) {
            return FALSE;
        }

        $result = [$match[1], []];
        $conditions = explode('|', $match[2]);

        foreach ($conditions as $item) {
            $keyValue = explode('=', $item);
            if (count($keyValue) != 2) {
                continue;
            }

            if (strpos($keyValue[1], '.') !== FALSE) {
                $vals = explode('.', $keyValue[1]);
                $keyValue[1] = $data;

                foreach ($vals as $item) {
                    if (!$keyValue[1][$item]) {
                        break;
                    }

                    $keyValue[1] = $keyValue[1][$item];
                }
            } else if (preg_match('/^\[(.*)\]$/', $keyValue[1], $match)) {
                $keyValue[1] = explode(',', $match[1]);
            }

            $result[1][$keyValue[0]] = $keyValue[1];
        }

        return $result;
    }
}
