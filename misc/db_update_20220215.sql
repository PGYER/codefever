CREATE TABLE IF NOT EXISTS `cc_repository_webhooks` (
  `rw_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `r_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_secret` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_events` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_active` tinyint(3) NOT NULL DEFAULT '1',
  `rw_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rw_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rw_key`),
  KEY `r_key` (`r_key`),
  KEY `u_key` (`u_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cc_repository_webhook_events` (
  `rwe_key` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwe_user` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_key` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwe_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwe_data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwe_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rwe_key`),
  KEY `rw_key` (`rw_key`),
  KEY `rwe_user` (`rwe_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cc_repository_webhook_logs` (
  `rwl_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rw_key` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwl_request` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwl_response` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rwl_start` double NOT NULL,
  `rwl_end` double NOT NULL,
  `rwl_status` int(11) NOT NULL,
  `rwl_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rwl_id`),
  KEY `rw_key` (`rw_key`),
  KEY `rwl_created` (`rwl_created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
