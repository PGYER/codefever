<?php

namespace service\Utility;

class Helper
{
    public static function composeTemplate (string $tempalte, array $data)
    {
        if (preg_match_all('/{{((?:(?!}}[^}]).)*)}}/', $tempalte, $matches)) {
            foreach ($matches[1] as $match) {
                if (isset($data[$match])) {
                    $tempalte = str_replace('{{' . $match . '}}', $data[$match], $tempalte);
                }
            }
        }

        return $tempalte;
    }

    static public function generateUserName(string $uKey)
    {
        return 'user_' . substr($uKey, -6);
    }

    public static function getDelimiter()
    {
        $delimiter = json_decode('{"encode":"\ue000\ue001\ue000"}', TRUE);
        return $delimiter['encode'];
    }

    public static function getSSHKeyType (string $sshKey)
    {
        $data = base64_decode($sshKey);
        $maches = [];
        preg_match("/((?:ssh|ecdsa)-[\w\d]+)/", $data, $maches);

        if ($maches && $maches[1]) {
            return $maches[1];
        }

        return 'ssh-rsa';
    }

    public static function getSSHKeyHash (string $sshKey)
    {
        return hash('md5', base64_decode($sshKey));
    }

    public static function getUniqueItemList (array $input, string $uniqueKey)
    {
        $output = [];
        foreach ($input as $item) {
            $output[$item[$uniqueKey]] = $item;
        }

        return array_values($output);
    }

    public static function getUniqueMemberList (array $input)
    {
        $output = [];
        foreach ($input as $item) {
            if ($output[$item['id']] && $output[$item['id']]['groupMember'] && $item['deleteFlag']) {
                // a deleted repository user role cannot overwrite a group user Data
            } else {
                $output[$item['id']] = $item;
            }
        }

        return array_values($output);
    }

    public static function addBasicAuth (string $url, string $username, string $password = NULL) {
        $maches = [];

        if ($password && strlen($password)) {
            $authData = urlencode($username) . ':' . urlencode($password);
        } else {
            $authData = urlencode($username);
        }

        preg_match("/^(http:\/\/)([^@]+)?(@.+)?$/", $url, $match);
        if ($match && $match[3]) {
            return $match[1] . $authData . $match[3];
        } else if ($match && $match[2]) {
            return $match[1] . $authData . '@' . $match[2];
        }

        return $url;
    }

    public static function parseTable (string $input, string $linePattern, array $rows) {
        $output = [];
        $lines = explode("\n", $input);
        foreach ($lines as $line) {
            if (preg_match($linePattern, $line, $cell)) {
                $item = [];
                foreach ($rows as $index => $row) {
                    if (preg_match('/^"(.*)"$/i', $cell[$index + 1], $matches)) {
                        $item[$row] = self::parseEscapedSequences($matches[1]);
                    } else {
                        $item[$row] = $cell[$index + 1];
                    }
                }
                array_push($output, $item);
            }
        }

        return $output;
    }

    public static function parseEscapedSequences (string $input)
    {
        $input = preg_replace_callback('/(\\\\[0-7]\d\d){3}/i', function ($matches) {
            $data = explode('\\' ,$matches[0]);
            $output = '';
            for ($i = 1; $i < count($data); $i++) {
                $char = octdec((int) $data[$i]);
                $output .= chr($char);
            }
            return $output;
        }, $input);

        $input = preg_replace_callback('/(\\\\x[0-9a-f][0-9a-f]){3}/i', function ($matches) {
            $data = explode('\\' ,$matches[0]);
            $output = '';
            for ($i = 1; $i < count($data); $i++) {
                $char = hexdec($data[$i]);
                $output .= chr($char);
            }
            return $output;
        }, $input);

        return $input;
    }

    public static function parseDiffString (string $diff)
    {
        $result = [];
        $lines = explode("\n", $diff);

        $tempItem = NULL;
        foreach ($lines as $line) {
            $matches = [];
            if (preg_match('/^diff\s+--git\s+(")?a\/(.*)\s+(")?b\/(.*)/', $line, $matches)) {
                if ($tempItem) {
                    $tempItem['diff']['raw'] = implode("\n", $tempItem['diff']['line']);
                    if (count($tempItem['diff']['line']) > MAX_DISPLAY_DIFF_LINE ||
                        strlen($tempItem['diff']['raw']) > MAX_DISPLAY_DIFF_LENGTH) {
                        $tempItem['type'] = 'oversize';
                        $tempItem['diff']['raw'] = NULL;
                        $tempItem['diff']['line'] = [];
                    }
                    array_push($result, $tempItem);
                }

                $tempItem = [
                    'original' => [
                        'name' => $matches[1] ? self::parseEscapedSequences(rtrim($matches[2], '"')) : $matches[2],
                        'mode' => NULL,
                        'sha' => NULL
                    ],
                    'modified' => [
                        'name' => $matches[3] ? self::parseEscapedSequences(rtrim($matches[4], '"')) : $matches[4],
                        'mode' => NULL,
                        'sha' => NULL
                    ],
                    'diff' => ['raw' => NULL, 'line' => [], 'additions' => 0, 'deletions' => 0],
                    'type' => 'text'
                ];
            }

            if (preg_match('/^index\s+([0-9a-f]+)\.+([0-9a-f]+)(?:\s+(\d+))?/', $line, $matches)) {
                // file changes
                $tempItem['original']['sha'] = $matches[1];
                $tempItem['modified']['sha'] = $matches[2];
                if ($matches[3]) {
                    $tempItem['original']['mode'] = $matches[3];
                    $tempItem['modified']['mode'] = $matches[3];
                }
            } else if (preg_match('/^old\s+mode\s+(\d+)/', $line, $matches)) {
                $tempItem['original']['mode'] = $matches[1];
            } else if (preg_match('/^new\s+mode\s+(\d+)/', $line, $matches)) {
                $tempItem['modified']['mode'] = $matches[1];
            } else if (preg_match('/^deleted\s+file\s+mode\s+(\d+)/', $line, $matches)) {
                $tempItem['modified']['name'] = NULL;
                $tempItem['original']['mode'] = $matches[1];
            } else if (preg_match('/^new\s+file\s+mode\s+(\d+)/', $line, $matches)) {
                $tempItem['original']['name'] = NULL;
                $tempItem['modified']['mode'] = $matches[1];
            } else if (preg_match('/^Binary\s+files\s(.*)\sand\s(.*)\sdiffer/', $line, $matches)) {
                $tempItem['type'] = 'binary';
            } else if (preg_match('/^rename\s+from\s+(")?(.+)/', $line, $matches)) {
                $tempItem['original']['name'] = $matches[1] ? self::parseEscapedSequences(rtrim($matches[2], '"')) : $matches[2];
            } else if (preg_match('/^rename\s+to\s+(")?(.+)/', $line, $matches)) {
                $tempItem['modified']['name'] = $matches[1] ? self::parseEscapedSequences(rtrim($matches[2], '"')) : $matches[2];
            } else if (preg_match('/^@@\s-+\d+(,\d+)?\s+\++\d+(,\d+)?\s+@@.*$/', $line, $matches)) {
                $matches[0] = self::convertToUTF8($matches[0]);
                array_push($tempItem['diff']['line'], $matches[0]);
            } else if ($tempItem['diff']['line'] && count($tempItem['diff']['line']) && preg_match('/^[\s\+-].*$/', $line, $matches)) {
                $matches[0] = self::convertToUTF8($matches[0]);
                array_push($tempItem['diff']['line'], $matches[0]);
                if ($matches[0][0] === '+') {
                    $tempItem['diff']['additions']++;
                } else if ($matches[0][0] === '-') {
                    $tempItem['diff']['deletions']--;
                }
            }
        }

        if ($tempItem) {
            $tempItem['diff']['raw'] = implode("\n", $tempItem['diff']['line']);
            if (count($tempItem['diff']['line']) > MAX_DISPLAY_DIFF_LINE ||
                strlen($tempItem['diff']['raw']) > MAX_DISPLAY_DIFF_LENGTH) {
                $tempItem['type'] = 'oversize';
                $tempItem['diff']['raw'] = NULL;
                $tempItem['diff']['line'] = [];
            }
            array_push($result, $tempItem);
        }

        return $result;
    }

    public static function parseBlameData (array $blameLines) {
        $blameInfo = [];
        $fileLines = [];

        $tmpBlameData = NULL;
        foreach ($blameLines as $line) {
            if (preg_match('/^([0-9a-f]{40})\s+(\d+)\s+(\d+)\s+(\d+)$/', $line, $matches)) {
                $tmpBlameData = [
                    'start' => (int) $matches[3],
                    'length' => (int) $matches[4],
                    'commit' => [
                        'sha' => $matches[1],
                        'commit' => '',
                        'detail' => '',
                        'email' => '',
                        'time' => 0
                    ]
                ];
            }  else if (preg_match('/^summary (.+)$/', $line, $matches)) {
                if ($tmpBlameData) {
                    $tmpBlameData['commit']['commit'] = $matches[1];
                }
            } else if (preg_match('/^committer-mail <(.+)>$/', $line, $matches)) {
                if ($tmpBlameData) {
                    $tmpBlameData['commit']['email'] = $matches[1];
                }
            } else if (preg_match('/^committer-time (\d+)$/', $line, $matches)) {
                if ($tmpBlameData) {
                    $tmpBlameData['commit']['time'] = (int) $matches[1];
                }
            } else if (preg_match('/^\t(.*)$/', $line, $matches)) {
                if ($tmpBlameData && $tmpBlameData['commit']['sha']) {
                    $sameCommitData = array_filter($blameInfo, function ($item) use ($tmpBlameData) {
                        return ($item['commit']['sha'] === $tmpBlameData['commit']['sha']);
                    });

                    if (count($sameCommitData) > 0) {
                        $sameCommitData = array_shift($sameCommitData);
                        $tmpBlameData['commit'] = $sameCommitData['commit'];
                    }

                    array_push($blameInfo, $tmpBlameData);
                    $tmpBlameData = NULL;
                }
                array_push($fileLines, $matches[1]);
            }
        }

        return [$blameInfo, $fileLines];
    }

    public static function parseTagResult (string $result)
    {
        $resultArr = explode("\n", trim($result, "\n"));
        if ($resultArr) {
            $errorPattern = '/^fatal:\sambiguous\sargument.+$/';
            preg_match($errorPattern, $resultArr[0], $errorMatchResult);
            if ($errorMatchResult) {
                return FALSE;
            } else {
                return $result;
            }
        } else {
            return $resultArr;
        }
    }

    public static function toJSON(array $data, string $delimiter = '"')
    {
        $json = json_encode($data);
        $json = str_replace('"', $delimiter, $json);

        return $json;
    }

    public static function parseJSON(string $json, string $delimiter = '"')
    {
        $json = str_replace($delimiter, '"', $json);
        $json = preg_replace('/[\x01-\x1f\x7f]/', ' ', $json);
        $data = json_decode($json, TRUE);

        return $data;
    }

    public static function parseObjectToFile (string $fileContent)
    {
        if (strlen($fileContent) > MAX_DISPLAY_FILE_SIZE) {
            return ['oversize' => TRUE];
        }

        $tmpFile = tmpfile();
        $tmpFileName = stream_get_meta_data($tmpFile)['uri'];
        file_put_contents($tmpFileName, $fileContent);
        $mime = mime_content_type($tmpFileName);

        $output = [];
        $output['mime'] = $mime;
        $output['size'] = strlen($fileContent);

        if (strpos($mime, 'image') === 0) {
            $imageSize = getimagesize($tmpFileName);
            $output['width'] = $imageSize[0];
            $output['height'] = $imageSize[1];
            $output['base64Encoded'] = base64_encode($fileContent);
        } else if (strpos($mime, 'video/mp4') === 0) {
            $output['base64Encoded'] = base64_encode($fileContent);
        } else if (strpos($mime, 'plain') === 0 ||
            strpos($mime, 'text') === 0 ||
            strpos($mime, 'xml') === 0) {
            $output['raw'] = $fileContent;
        } else {
            $output['unsupport'] = TRUE;
        }

        fclose($tmpFile);
        return $output;
    }

    public static function mediaFileParse($file)
    {
        if (!$file) {
            return false;
        }

        $tmpFile = tmpfile();
        $tmpFileName = stream_get_meta_data($tmpFile)['uri'];
        file_put_contents($tmpFileName, $file);
        $fileType = mime_content_type($tmpFileName);
        if (strpos($fileType, 'image') === 0) {
            $imageSize = getimagesize($tmpFileName);
            $fileSize = [];
            $fileSize['width'] = $imageSize[0];
            $fileSize['height'] = $imageSize[1];
        } else {
            $fileSize = [];
        }

        if (strpos($fileType, 'image') === 0 ||
            strpos($fileType, 'video/mp4') === 0 ) {
            $file = base64_encode($file);
        } else if (strpos($fileType, 'text') !== 0 &&
                    strpos($fileType, 'application/xml') !== 0) {
            $file = '';
        }

        fclose($tmpFile);

        return [
            'type' => $fileType,
            'size' => $fileSize,
            'raw' => $file
        ];
    }

    public static function convertToUTF8(string $input) {
        if (!json_encode($input)) {
            mb_substitute_character(0xFFFD);
            return mb_convert_encoding($input, 'UTF-8', 'UTF-8');
        }

        return $input;
    }

    public static function cutMessage(string $input)
    {
        if (mb_strlen($input) > 20) {
            return mb_substr($input, 0, 20) . '...';
        } else {
            return $input;
        }
    }

    public static function getNextDayDate(string $date = '')
    {
        return date('Y-m-d', strtotime('+1 day', $date ? strtotime($date) : time()));
    }

    /**
     * 时间是否满足crontab字符串规则
     * 每小段支持的规则: '*' '* / int' 'int1-int2' 'int1[,int2[,int3]...]'
     * 规则中星期天给0
     */
    public static function isCrontabTime(string $crontab, int $time)
    {
        if (!$crontab ||
            count($crontabFields = explode(' ', $crontab)) != 5 ||
            count($timeFields = explode(' ', date('i H d m w', $time))) != 5) {
            return FALSE;
        }

        $crontabFieldGrep = '/^((\*(\/\d{1,2})?)|(\d{1,2}\-\d{1,2})|(\d{1,2}(\,\d{1,2})*))$/';
        foreach ($crontabFields as $index => $crontabField) {
            if ($crontabField == '' ||
                !preg_match($crontabFieldGrep, $crontabField) ||
                !self::_isCrontabFieldTime($index, $crontabField, (int) $timeFields[$index])) {
                return FALSE;
            }
        }

        return TRUE;
    }

    private static function _isCrontabFieldTime(int $index, string $crontabField, int $timeField)
    {
        $maximum = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]][$index];
        if ($timeField < $maximum[0] || $timeField > $maximum[1]) {
            return FALSE;
        }

        if ($crontabField == '*') {
        } else if (strpos($crontabField, '*/') === 0) {
            $val = (int) substr($crontabField, 2);
            if ($val < $maximum[0] || $val > $maximum[1]) {
                return FALSE;
            }

            if ($index == 2 || $index == 3) {
                $timeField -= 1;
            }

            if ($timeField % $val !== 0) {
                return FALSE;
            }
        } else if (strpos($crontabField, '-')) {
            $vals = explode('-', $crontabField);
            if (!is_array($vals) || count($vals) != 2 ||
                $vals[0] < $maximum[0] || $vals[0] > $maximum[1] ||
                $vals[1] < $maximum[0] || $vals[1] > $maximum[1]) {
                return FALSE;
            }

            if ($vals[0] <= $vals[1]) {
                if ($timeField < $vals[0] || $timeField > $vals[1]) {
                    return FALSE;
                }
            } else {
                if (!($timeField >= $vals[0] && $timeField <= $maximum[1]) &&
                    !($timeField >= $maximum[0] && $timeField <= $vals[1])) {
                    return FALSE;
                }
            }
        } else {
            $vals = explode(',', $crontabField);
            if (is_array($vals)) {
                foreach ($vals as &$val) {
                    $val = (int) $val;
                    if ($val < $maximum[0] || $val > $maximum[1]) {
                        return FALSE;
                    }
                }

                if (!in_array($timeField, $vals)) {
                    return FALSE;
                }
            }
        }

        return TRUE;
    }
}
