CREATE TABLE `cc_activities` (
  `a_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `a_type` int(11) NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `a_relative_g_key` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `a_relative_r_key` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `a_relative_mr_key` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `a_data` text COLLATE utf8mb4_unicode_ci,
  `a_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `a_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `a_deleted` timestamp NULL DEFAULT NULL,
  `a_status` tinyint(4) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_commit_emails` (
  `ce_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ce_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ce_is_check` tinyint(3) UNSIGNED NOT NULL DEFAULT '2',
  `ce_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ce_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `ce_deleted` timestamp NULL DEFAULT NULL,
  `ce_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_groups` (
  `g_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID|add=text&edit=hidden',
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UID|add=text&edit=text',
  `g_type` tinyint(3) UNSIGNED NOT NULL DEFAULT '1' COMMENT '组类型|add=radio&edit=radio&items=普通组#1,默认组#2',
  `g_display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '显示名称|add=text&edit=text',
  `g_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '名称|add=text&edit=text',
  `g_description` tinytext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '描述|add=text&edit=text',
  `g_avatar` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '头像|add=text&edit=text',
  `g_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间|add=datetime&edit=datetime',
  `g_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间|add=datetime&edit=datetime',
  `g_deleted` timestamp NULL DEFAULT NULL COMMENT '删除时间|add=datetime&edit=datetime',
  `g_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1' COMMENT '状态|add=ignore&edit=ignore'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_group_members` (
  `gm_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `g_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gm_role` tinyint(3) UNSIGNED NOT NULL,
  `gm_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gm_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `gm_deleted` timestamp NULL DEFAULT NULL,
  `gm_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_merge_requests` (
  `mr_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_merge_u_key` varchar(32) CHARACTER SET utf8 NOT NULL COMMENT '合并人员uKey',
  `mr_source_merged_hash` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_source_r_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_source_branch` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_target_merged_hash` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_target_r_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_target_branch` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_start_hash` varchar(32) CHARACTER SET utf8 NOT NULL COMMENT '请求合并分支的最后一个提交hash',
  `mr_id` int(10) UNSIGNED NOT NULL,
  `mr_title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_description` text COLLATE utf8mb4_unicode_ci,
  `mr_proceed_status` tinyint(4) NOT NULL DEFAULT '1',
  `mr_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mr_merge_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `mr_close_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `mr_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `mr_deleted` timestamp NULL DEFAULT NULL,
  `mr_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_merge_request_reviewers` (
  `mrr_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mr_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mrr_is_review` tinyint(3) UNSIGNED NOT NULL DEFAULT '2',
  `mrr_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mrr_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `mrr_deleted` timestamp NULL DEFAULT NULL,
  `mrr_status` tinyint(4) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='merge request reviewer';

CREATE TABLE `cc_notification_content` (
  `nc_key` varchar(32) NOT NULL COMMENT 'Key|add=ignore&edit=hidden',
  `nc_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息事件类型|add=text&edit=text',
  `g_key` varchar(32) NOT NULL COMMENT 'gKey|add=text&edit=text',
  `r_key` varchar(32) NOT NULL COMMENT 'rKey|add=text&edit=text',
  `nc_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '通知数据|add=textarea&edit=textarea',
  `nc_scope` tinyint(3) UNSIGNED NOT NULL COMMENT '通知范围|add=radio&edit=radio&items=系统通知#1,用户通知#2,站内通知#4,广播通知#5',
  `nc_created` datetime NOT NULL COMMENT '创建时间|add=hidden&edit=text',
  `nc_updated` datetime NOT NULL COMMENT '更新时间|add=hidden&edit=text',
  `nc_deleted` datetime NOT NULL COMMENT '删除时间|add=hidden&edit=text',
  `nc_status` tinyint(3) NOT NULL COMMENT '状态|add=hidden&edit=text',
  `nc_target` varchar(32) DEFAULT '1' COMMENT '通知发送目标用户|add=checkbox&edit=checkbox&items=全部用户#1,免费用户#2,付费已过期用户#3,付费未过期用户#4'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `cc_notification_refuse` (
  `nr_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nr_type` tinyint(3) UNSIGNED NOT NULL DEFAULT '1',
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `g_key` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `r_key` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nr_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nr_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `nr_deleted` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `nr_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='记录用户关闭了通知接收的仓库组或仓库';

CREATE TABLE `cc_notification_users` (
  `nu_key` varchar(32) NOT NULL,
  `u_key` varchar(32) NOT NULL,
  `nc_key` varchar(32) NOT NULL,
  `nu_is_read` tinyint(3) NOT NULL,
  `nu_created` datetime NOT NULL,
  `nu_updated` datetime NOT NULL,
  `nu_deleted` datetime NOT NULL,
  `nu_status` tinyint(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `cc_proteced_branch_rules` (
  `pbr_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `r_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pbr_rule` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pbr_push_min_role_id` tinyint(4) NOT NULL DEFAULT '3',
  `pbr_merge_min_role_id` tinyint(4) NOT NULL DEFAULT '3',
  `pbr_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pbr_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `pbr_deleted` timestamp NULL DEFAULT NULL,
  `pbr_status` tinyint(4) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_repositories` (
  `r_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID|add=text&edit=hidden',
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UID|add=text&edit=text',
  `g_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '组ID|add=text&edit=text',
  `r_fork_r_key` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ForkID|add=text&edit=text',
  `r_display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '显示名|add=text&edit=text',
  `r_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '名称|add=text&edit=text',
  `r_path` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '路径|add=text&edit=text',
  `r_description` tinytext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '描述|add=text&edit=text',
  `r_avatar` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像ID|add=text&edit=text',
  `r_default_branch_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `r_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间|add=datetime&edit=datetime',
  `r_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间|add=datetime&edit=datetime',
  `r_deleted` timestamp NULL DEFAULT NULL COMMENT '删除时间|add=datetime&edit=datetime',
  `r_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1' COMMENT '状态|add=ignore&edit=ignore'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_repository_members` (
  `rm_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `r_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rm_role` tinyint(3) UNSIGNED NOT NULL,
  `rm_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rm_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `rm_deleted` timestamp NULL DEFAULT NULL,
  `rm_status` tinyint(3) UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_ssh_keys` (
  `sk_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_key` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sk_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sk_key_type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sk_key_hash` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sk_key_data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sk_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sk_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  `sk_deleted` timestamp NULL DEFAULT NULL,
  `sk_status` tinyint(3) UNSIGNED DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cc_users` (
  `u_id` int(11) NOT NULL,
  `u_key` varchar(32) NOT NULL,
  `u_email` varchar(255) NOT NULL,
  `u_password` varchar(100) NOT NULL,
  `u_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `u_avatar` varchar(255) NOT NULL COMMENT '用户头像',
  `u_tel` varchar(50) DEFAULT NULL,
  `u_calling_code` int(11) DEFAULT '86' COMMENT 'calling_code|add=text&edit=text',
  `u_team` varchar(150) DEFAULT NULL,
  `u_role` varchar(59) DEFAULT NULL,
  `u_location` varchar(200) DEFAULT NULL,
  `u_notification_status` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `u_register_ip` varchar(20) NOT NULL,
  `u_2fa` varchar(255) DEFAULT NULL,
  `u_admin` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `u_created` datetime NOT NULL,
  `u_updated` datetime NOT NULL,
  `u_status` tinyint(3) NOT NULL DEFAULT '1' COMMENT '状态'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `cc_activities`
  ADD PRIMARY KEY (`a_key`),
  ADD KEY `a_type` (`a_type`),
  ADD KEY `a_relative_g_key` (`a_relative_g_key`),
  ADD KEY `a_relative_r_key` (`a_relative_r_key`),
  ADD KEY `a_status` (`a_status`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `a_relative_mr_key` (`a_relative_mr_key`);

ALTER TABLE `cc_commit_emails`
  ADD PRIMARY KEY (`ce_key`),
  ADD KEY `u_key` (`u_key`);

ALTER TABLE `cc_groups`
  ADD PRIMARY KEY (`g_key`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `g_name` (`g_name`(191)),
  ADD KEY `g_status` (`g_status`),
  ADD KEY `g_type` (`g_type`);

ALTER TABLE `cc_group_members`
  ADD PRIMARY KEY (`gm_key`),
  ADD KEY `rm_status` (`gm_status`),
  ADD KEY `g_key` (`g_key`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `rm_role` (`gm_role`);

ALTER TABLE `cc_merge_requests`
  ADD PRIMARY KEY (`mr_key`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `mr_id` (`mr_id`),
  ADD KEY `mr_proceed_status` (`mr_proceed_status`),
  ADD KEY `mr_status` (`mr_status`),
  ADD KEY `mr_source_r_key` (`mr_source_r_key`) USING BTREE,
  ADD KEY `mr_target_r_key` (`mr_target_r_key`) USING BTREE;

ALTER TABLE `cc_merge_request_reviewers`
  ADD PRIMARY KEY (`mrr_key`),
  ADD KEY `mr_key` (`mr_key`),
  ADD KEY `u_key` (`u_key`);

ALTER TABLE `cc_notification_content`
  ADD PRIMARY KEY (`nc_key`),
  ADD KEY `nc_type` (`nc_scope`,`nc_status`),
  ADD KEY `p_key` (`g_key`);

ALTER TABLE `cc_notification_refuse`
  ADD PRIMARY KEY (`nr_key`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `g_key` (`g_key`),
  ADD KEY `r_key` (`r_key`);

ALTER TABLE `cc_notification_users`
  ADD PRIMARY KEY (`nu_key`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `nc_key` (`nc_key`);

ALTER TABLE `cc_proteced_branch_rules`
  ADD PRIMARY KEY (`pbr_key`),
  ADD KEY `pbr_status` (`pbr_status`),
  ADD KEY `r_key` (`r_key`);

ALTER TABLE `cc_repositories`
  ADD PRIMARY KEY (`r_key`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `g_key` (`g_key`),
  ADD KEY `r_name` (`r_name`(191)),
  ADD KEY `r_status` (`r_status`),
  ADD KEY `r_fork_r_key` (`r_fork_r_key`);

ALTER TABLE `cc_repository_members`
  ADD PRIMARY KEY (`rm_key`),
  ADD KEY `rm_status` (`rm_status`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `rm_role` (`rm_role`),
  ADD KEY `r_key` (`r_key`) USING BTREE;

ALTER TABLE `cc_ssh_keys`
  ADD PRIMARY KEY (`sk_key`),
  ADD UNIQUE KEY `sk_key_hash` (`sk_key_hash`),
  ADD KEY `u_key` (`u_key`),
  ADD KEY `sk_status` (`sk_status`);

ALTER TABLE `cc_users`
  ADD PRIMARY KEY (`u_key`),
  ADD KEY `u_name` (`u_name`),
  ADD KEY `u_email` (`u_email`),
  ADD KEY `u_admin` (`u_admin`);
