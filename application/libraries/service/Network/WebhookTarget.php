<?php

namespace service\Network;

use InvalidArgumentException;

class WebhookTarget
{
    public static function parse(string $url)
    {
        if (!filter_var($url, FILTER_VALIDATE_URL) || preg_match('/[\x00-\x20\x7f\\\\]/', $url)) {
            throw new InvalidArgumentException('Invalid webhook URL');
        }
        $parts = parse_url($url);
        if (!$parts || !in_array(strtolower($parts['scheme']), ['http', 'https'], TRUE)
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['fragment'])) {
            throw new InvalidArgumentException('Invalid webhook URL');
        }
        $host = trim($parts['host'], '[]');
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if (!self::isPublicAddress($host)) {
                throw new InvalidArgumentException('Webhook target must be public');
            }
        } elseif (!preg_match('/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?\.?$/iD', $host)
            || preg_match('/(?:^|\.)(?:localhost|local|internal)\.?$/iD', $host)) {
            throw new InvalidArgumentException('Invalid webhook host');
        }
        return [$host, $parts['port'] ?? (strtolower($parts['scheme']) === 'https' ? 443 : 80)];
    }

    public static function isPublicAddress(string $address)
    {
        if (!filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return FALSE;
        }
        $packed = inet_pton($address);
        if (strlen($packed) === 4) {
            $bytes = unpack('C4', $packed);
            // Shared address space, multicast and future-use ranges are not public targets.
            return $bytes[1] !== 0 && $bytes[1] < 224
                && !($bytes[1] === 100 && $bytes[2] >= 64 && $bytes[2] <= 127)
                && !($bytes[1] === 192 && $bytes[2] === 0 && $bytes[3] === 0)
                && !($bytes[1] === 192 && $bytes[2] === 0 && $bytes[3] === 2)
                && !($bytes[1] === 192 && $bytes[2] === 88 && $bytes[3] === 99)
                && !($bytes[1] === 198 && $bytes[2] === 51 && $bytes[3] === 100)
                && !($bytes[1] === 203 && $bytes[2] === 0 && $bytes[3] === 113)
                && !($bytes[1] === 198 && in_array($bytes[2], [18, 19], TRUE));
        }
        // Only global unicast IPv6; exclude transition mechanisms and special assignments.
        $hex = bin2hex($packed);
        return (ord($packed[0]) & 0xe0) === 0x20
            && substr($hex, 0, 4) !== '2002'
            && !(substr($hex, 0, 4) === '2001' && hexdec(substr($hex, 4, 2)) < 2)
            && substr($hex, 0, 8) !== '20010db8'
            && substr($hex, 0, 5) !== '3fff0';
    }

    public static function requestOptions(string $url, callable $resolver = NULL)
    {
        list($host, $port) = self::parse($url);
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $addresses = [$host];
        } else {
            $resolver = $resolver ?? function ($name) {
                $records = dns_get_record($name, DNS_A | DNS_AAAA);
                $addresses = [];
                foreach ($records ?: [] as $record) {
                    if (isset($record['ip'])) { $addresses[] = $record['ip']; }
                    if (isset($record['ipv6'])) { $addresses[] = $record['ipv6']; }
                }
                return $addresses;
            };
            $addresses = $resolver($host);
        }
        if (!$addresses) {
            throw new InvalidArgumentException('Webhook host did not resolve');
        }
        foreach ($addresses as $address) {
            if (!self::isPublicAddress($address)) {
                throw new InvalidArgumentException('Webhook target must be public');
            }
        }
        $address = $addresses[0];
        $curl = [
            CURLOPT_FRESH_CONNECT => TRUE,
            CURLOPT_FORBID_REUSE => TRUE,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_PROXY => '',
        ];
        if (!filter_var($host, FILTER_VALIDATE_IP)) {
            // Pin the checked address so cURL cannot resolve a different address at connect time.
            $curl[CURLOPT_RESOLVE] = [$host . ':' . $port . ':' . (strpos($address, ':') === FALSE ? $address : '[' . $address . ']')];
        }
        return ['allow_redirects' => FALSE, 'proxy' => '', 'curl' => $curl];
    }
}
