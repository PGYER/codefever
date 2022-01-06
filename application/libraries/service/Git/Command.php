<?php

namespace service\Git;

use service\Utility\Helper;

class Command
{
    const DELIMITER = ' ';

    static function getLog($since = NULL, $until = NULL, $author = NULL, $max = NULL)
    {
        $command = ['log'];

        if ($since) {
            array_push($command, '--since=' . $since);
        }

        if ($until) {
            array_push($command, '--until=' . $until);
        }

        if ($author) {
            array_push($command, '--author=' . $author);
        }

        if ($max) {
            array_push($command, '--max-count=' . $max);
        }

        return implode(self::DELIMITER, $command);
    }

    static function showTagCommit(string $tag)
    {
        if (!$tag) {
            return FALSE;
        }

        $pattern = [
            'log' => '%s',
            'time' => '%at',
            'sha' => '%H',
            'email' => '%ae',
        ];

        $prettyPattern = Helper::getDelimiter() . Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();

        return implode(self::DELIMITER, ['show', $tag, "--pretty=\"$prettyPattern\""]);
    }

    static function createBranch(string $branch, string $sourceBranch)
    {
        return implode(self::DELIMITER, ['branch', $branch, $sourceBranch]);
    }

    static function createTag(string $tag, string $message = NULL, $commitSHA = NULL)
    {
        $command = ['tag'];

        if ($message) {
            array_push($command, '-a', $tag);
            array_push($command, '-m', $message);
        } else {
            array_push($command, $tag);
        }

        if ($commitSHA) {
            array_push($command, $commitSHA);
        }

        return implode(self::DELIMITER, $command);
    }

    static function getTagList()
    {
        return implode(self::DELIMITER, ['tag', '-l']);
    }

    static function deleteTag(string $tagName)
    {
        return implode(self::DELIMITER, ['tag', '-d', $tagName]);
    }

    static function getShow($option = NULL)
    {
        if ($option) {
            return 'show';
        } else {
            $pattern = [
                'log' => '%s',
                'time' => '%at',
                'sha' => '%H',
                'email' => '%ae',
            ];

            $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter());

            return implode(self::DELIMITER, ['show', "--pretty=\"$prettyPattern\""]);
        }
    }

    static function checkLastCommitDiffCmd()
    {
        return implode(self::DELIMITER, ['diff', 'HEAD^', 'HEAD']);
    }

    static function checkDiffCmd(string $SHA1Hash, string $SHA1Hash2)
    {
        if (!$SHA1Hash || !$SHA1Hash2) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['diff', $SHA1Hash, $SHA1Hash2, '-B']);
    }

    static function getTotalCommitNumberCmd()
    {
        return implode(self::DELIMITER, ['rev-list', '--all', '--count']);
    }

    public static function deleteBranch(string $branch)
    {
        if (!$branch) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['branch', '-D', $branch]);
    }

    public static function catObject(string $revisionOrObject)
    {
        if (!$revisionOrObject) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['cat-file', '-p', $revisionOrObject]);
    }

    public static function getObjectType(string $object)
    {
        if (!$object) {
            return false;
        }

        return implode(self::DELIMITER, ['cat-file', '-t', $object]);
    }

    public static function getObjectSize(string $object)
    {
        if (!$object) {
            return false;
        }

        return implode(self::DELIMITER, ['cat-file', '-s', $object]);
    }

    public static function getLastLog(string $branch, string $filePath, string $lastSha = '')
    {
        if (!$branch) {
            return FALSE;
        }

        $pattern = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();
        $lastSha = strlen($lastSha) > 4 ? $lastSha : $branch;

        return implode(self::DELIMITER, ['log', '-1', '--left-only', $lastSha, "--pretty=\"$prettyPattern\"", '--', $filePath]);
    }

    public static function getCommitListFromLocal(string $sourceCommitHash, string $targetCommitHash)
    {
        $pattern = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();

        return implode(self::DELIMITER, ['log', '--cherry-pick', '--right-only', "$sourceCommitHash...$targetCommitHash", "--pretty=\"$prettyPattern\""]);
    }

    public static function getCommitList(string $branch, string $path = '', string $keyword = '', int $page = 0, int $perpage = 0)
    {
        if (!$branch) {
            return FALSE;
        }

        $command = ['log', $branch];

        if ($keyword) {
            array_push($command, '--grep=' . $keyword);
        }

        $page = $page ? $page : 1;
        $perpage = $perpage ? $perpage : 20;
        $start = ($page - 1) * $perpage;

        $command = array_merge($command, ['--skip', $start, '-' . $perpage]);

        $pattern = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();
        array_push($command, "--pretty=\"$prettyPattern\"");

        if ($path) {
            array_push($command, '--', $path);
        }

        return implode(self::DELIMITER, $command);
    }

    public static function getCommitListFromRemote(string $localCommitHash, string $remoteRkey, string $remoteAccessURL, string $remoteCommitHash)
    {
        if (!$localCommitHash || !$remoteRkey || !$remoteAccessURL || !$remoteCommitHash) {
            return FALSE;
        }

        $pattern = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();

        return implode(self::DELIMITER, [$localCommitHash, $remoteRkey, $remoteAccessURL, $remoteCommitHash, $prettyPattern]);
    }

    public static function getCommitCount(string $branch)
    {
        if (!$branch) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['rev-list', $branch, '--count']);
    }

    public static function getBranchList()
    {
        return 'branch';
    }

    public static function getCountObjects()
    {
        return implode(self::DELIMITER, ['count-objects', '-v']);
    }

    public static function getBranchCompare(string $branch1, string $branch2)
    {
        if (!$branch1 || !$branch2) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['rev-list', "$branch1..$branch2", '--count']);
    }

    public static function getCommitLog(string $commitSHA)
    {
        if (!$commitSHA) {
            return FALSE;
        }

        $pattern = [
            'log' => '%s',
            'time' => '%at',
            'sha' => '%H',
            'email' => '%ae',
            'parent' => '%P',
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter());

        return implode(self::DELIMITER, ['log', $commitSHA, '-1', "--pretty=\"$prettyPattern\""]);
    }

    public static function getDiffCount(string $commitSHA1, string $commitSHA2)
    {
        if (!$commitSHA2) {
            return FALSE;
        }

        if (!$commitSHA1 || preg_match('/^0+$/i', $commitSHA1)) {
            return implode(self::DELIMITER, ['show', $commitSHA2, '--name-only', '--pretty=%H']);
        }

        return implode(self::DELIMITER, ['diff', "$commitSHA1...$commitSHA2", '--name-only']);
    }

    public static function getDiffDetail(string $commitSHA1, string $commitSHA2)
    {
        if (!$commitSHA2) {
            return FALSE;
        }

        if (!$commitSHA1 || preg_match('/^0+$/i', $commitSHA1)) {
            return implode(self::DELIMITER, ['show', $commitSHA2]);
        }

        return implode(self::DELIMITER, ['diff', "$commitSHA1...$commitSHA2"]);
    }

    public static function getBranchListBySHA(string $commitSHA1)
    {
        if (!$commitSHA1) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['branch', '-a', '--contains', $commitSHA1]);
    }

    public static function getTagListBySHA(string $commitSHA1)
    {
        if (!$commitSHA1) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['tag', '--contains', $commitSHA1]);
    }

    public static function getChangedFileList(string $commitSHA1)
    {
        if (!$commitSHA1) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['log', '--stat', $commitSHA1, '-1', '--name-only']);
    }

    public static function getRevisionRange(string $startHash, string $endHash, string $branch)
    {
        if (!$startHash || !$endHash || !$branch) {
            return FALSE;
        }

        $pattern = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();

        return implode(self::DELIMITER, ['log', $startHash . '..' . $endHash, $branch, "--pretty=\"$prettyPattern\""]);
    }

    public static function getCommitInfoByHash(string $hash)
    {
        if (!$hash) {
            return FALSE;
        }

        $pattern = [
            'sha' => '%H',
            'log' => '%s',
            'body' => '%b',
            'email' => '%ae',
            'time' => '%at'
        ];

        $prettyPattern = Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();

        return implode(self::DELIMITER, ['log', "--pretty=\"$prettyPattern\"", '-1', $hash]);
    }
}
