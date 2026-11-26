<?php

namespace service\Git;

use service\Utility\Helper;

class Command
{
    const DELIMITER = ' ';

    private static function isOperand(string $value)
    {
        return $value !== '' && $value[0] !== '-' && strpos($value, "\0") === FALSE;
    }

    public static function isBranchName(string $branch)
    {
        // Apply Git ref-name rules without asking Git to interpret the input.
        if (!self::isOperand($branch) || in_array($branch, ['@', 'HEAD'], TRUE)
            || substr($branch, -1) === '.' || strpos($branch, '..') !== FALSE
            || strpos($branch, '@{') !== FALSE || preg_match('/[\x00-\x20\x7f]/', $branch)
            || strpbrk($branch, '~^:?*[\\') !== FALSE) {
            return FALSE;
        }

        foreach (explode('/', $branch) as $component) {
            if ($component === '' || $component[0] === '.' || substr($component, -5) === '.lock') {
                return FALSE;
            }
        }

        return TRUE;
    }

    static function getLog($since = NULL, $until = NULL, $author = NULL, $max = NULL)
    {
        $command = ['log'];

        if ($since) {
            array_push($command, '--since=' . escapeshellarg($since));
        }

        if ($until) {
            array_push($command, '--until=' . escapeshellarg($until));
        }

        if ($author) {
            array_push($command, '--author=' . escapeshellarg($author));
        }

        if ($max) {
            array_push($command, '--max-count=' . escapeshellarg($max));
        }

        return implode(self::DELIMITER, $command);
    }

    static function showTagCommit(string $tag)
    {
        if (!$tag || $tag[0] === '-') {
            return FALSE;
        }

        $pattern = [
            'log' => '%s',
            'time' => '%at',
            'sha' => '%H',
            'email' => '%ae',
        ];

        $prettyPattern = Helper::getDelimiter() . Helper::toJSON($pattern, Helper::getDelimiter()) . Helper::getDelimiter();

        return implode(self::DELIMITER, ['show', escapeshellarg($tag), "--pretty=\"$prettyPattern\"", '--']);
    }

    static function createBranch(string $branch, string $sourceBranch)
    {
        if (!self::isOperand($branch) || !self::isOperand($sourceBranch)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['branch', '--', escapeshellarg($branch), escapeshellarg($sourceBranch)]);
    }

    static function createTag(string $tag, string $message = NULL, $commitSHA = NULL)
    {
        $command = ['tag'];

        if ($message) {
            array_push($command, '-a', '-m', escapeshellarg($message));
        }

        // Prevent Git from interpreting user input as command-line options.
        array_push($command, '--', escapeshellarg($tag));

        if ($commitSHA) {
            array_push($command, escapeshellarg($commitSHA));
        }

        return implode(self::DELIMITER, $command);
    }

    static function getTagList()
    {
        return implode(self::DELIMITER, ['tag', '-l']);
    }

    static function deleteTag(string $tagName)
    {
        return implode(self::DELIMITER, ['tag', '-d', '--', escapeshellarg($tagName)]);
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
        if (!self::isOperand($SHA1Hash) || !self::isOperand($SHA1Hash2)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['diff', '-B', escapeshellarg($SHA1Hash), escapeshellarg($SHA1Hash2), '--']);
    }

    static function getTotalCommitNumberCmd()
    {
        return implode(self::DELIMITER, ['rev-list', '--all', '--count']);
    }

    public static function deleteBranch(string $branch)
    {
        if (!self::isOperand($branch)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['branch', '-D', '--', escapeshellarg($branch)]);
    }

    public static function catObject(string $revisionOrObject)
    {
        if (!self::isOperand($revisionOrObject)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['cat-file', '-p', escapeshellarg($revisionOrObject)]);
    }

    public static function getObjectType(string $object)
    {
        if (!self::isOperand($object)) {
            return false;
        }

        return implode(self::DELIMITER, ['cat-file', '-t', escapeshellarg($object)]);
    }

    public static function getObjectSize(string $object)
    {
        if (!self::isOperand($object)) {
            return false;
        }

        return implode(self::DELIMITER, ['cat-file', '-s', escapeshellarg($object)]);
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

        if (!self::isOperand($lastSha) || strpos($filePath, "\0") !== FALSE) {
            return FALSE;
        }

        $command = ['log', '-1', '--left-only', escapeshellarg($lastSha), '--pretty=' . escapeshellarg($prettyPattern), '--'];
        if ($filePath !== '') {
            $command[] = escapeshellarg($filePath);
        }

        return implode(self::DELIMITER, $command);
    }

    public static function getCommitListFromLocal(string $sourceCommitHash, string $targetCommitHash)
    {
        if (!self::isOperand($sourceCommitHash) || !self::isOperand($targetCommitHash)) {
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

        return implode(self::DELIMITER, ['log', '--cherry-pick', '--right-only', escapeshellarg("$sourceCommitHash...$targetCommitHash"), "--pretty=\"$prettyPattern\"", '--']);
    }

    public static function getCommitList(string $branch, string $path = '', string $keyword = '', int $page = 0, int $perpage = 0)
    {
        if (!self::isOperand($branch)) {
            return FALSE;
        }

        $command = ['log', escapeshellarg($branch)];

        if ($keyword) {
            array_push($command, '--grep=' . escapeshellarg($keyword));
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

        $command[] = '--';
        if ($path !== '') {
            $command[] = escapeshellarg($path);
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
        if (!self::isOperand($branch)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['rev-list', '--count', escapeshellarg($branch), '--']);
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
        if (!self::isOperand($branch1) || !self::isOperand($branch2)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['rev-list', '--count', escapeshellarg("$branch1..$branch2"), '--']);
    }

    public static function getCommitLog(string $commitSHA)
    {
        if (!$commitSHA || $commitSHA[0] === '-') {
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

        return implode(self::DELIMITER, ['log', escapeshellarg($commitSHA), '-1', "--pretty=\"$prettyPattern\"", '--']);
    }

    public static function getDiffCount(string $commitSHA1, string $commitSHA2)
    {
        if (!$commitSHA2 || $commitSHA2[0] === '-' || (isset($commitSHA1[0]) && $commitSHA1[0] === '-')) {
            return FALSE;
        }

        if (!$commitSHA1 || preg_match('/^0+$/i', $commitSHA1)) {
            return implode(self::DELIMITER, ['show', escapeshellarg($commitSHA2), '--name-only', '--pretty=%H', '--']);
        }

        return implode(self::DELIMITER, ['diff', escapeshellarg("$commitSHA1...$commitSHA2"), '--name-only', '--']);
    }

    public static function getDiffDetail(string $commitSHA1, string $commitSHA2)
    {
        if (!$commitSHA2 || $commitSHA2[0] === '-' || (isset($commitSHA1[0]) && $commitSHA1[0] === '-')) {
            return FALSE;
        }

        if (!$commitSHA1 || preg_match('/^0+$/i', $commitSHA1)) {
            return implode(self::DELIMITER, ['show', escapeshellarg($commitSHA2), '--']);
        }

        return implode(self::DELIMITER, ['diff', escapeshellarg("$commitSHA1...$commitSHA2"), '--']);
    }

    public static function getBranchListBySHA(string $commitSHA1)
    {
        if (!$commitSHA1 || $commitSHA1[0] === '-') {
            return FALSE;
        }

        return implode(self::DELIMITER, ['branch', '-a', '--contains', escapeshellarg($commitSHA1)]);
    }

    public static function getTagListBySHA(string $commitSHA1)
    {
        if (!$commitSHA1 || $commitSHA1[0] === '-') {
            return FALSE;
        }

        return implode(self::DELIMITER, ['tag', '--contains', escapeshellarg($commitSHA1)]);
    }

    public static function getChangedFileList(string $commitSHA1)
    {
        if (!self::isOperand($commitSHA1)) {
            return FALSE;
        }

        return implode(self::DELIMITER, ['log', '--stat', escapeshellarg($commitSHA1), '-1', '--name-only', '--']);
    }

    public static function getRevisionRange(string $startHash, string $endHash, string $branch)
    {
        if (!self::isOperand($startHash) || !self::isOperand($endHash) || !self::isOperand($branch)) {
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

        return implode(self::DELIMITER, ['log', escapeshellarg($startHash . '..' . $endHash), escapeshellarg($branch), "--pretty=\"$prettyPattern\"", '--']);
    }

    public static function getCommitInfoByHash(string $hash)
    {
        if (!self::isOperand($hash)) {
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

        return implode(self::DELIMITER, ['log', "--pretty=\"$prettyPattern\"", '-1', escapeshellarg($hash), '--']);
    }
}
