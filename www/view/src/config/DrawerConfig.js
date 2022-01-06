// component
import {
  psRepository,
  psRepositoryGroup,
  psBranch,
  psCommit,
  psMerge,
  psLog,
  psMembers,
  psMemberAlt,
  psContent,
  psFile,
  psSetting,
  psTag
} from '@pgyer/icons'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

function makeDrawerConfig () {
  return [
    {
      path: '/repositories',
      name: 'menu.repository_pl',
      icon: psRepository,
      activePattern: [
        /^\/repositories\/?.*$/i
      ]
    },
    {
      path: '/groups',
      name: 'menu.group_pl',
      icon: psRepositoryGroup,
      activePattern: [
        /^\/groups\/?.*$/i
      ]
    },
    {
      path: '/mergerequests',
      name: 'menu.mergeRequest_pl',
      icon: psMerge,
      activePattern: [
        /^\/mergerequests\/?.*$/i
      ]
    },
    {
      path: '/settings',
      name: 'menu.setting_pl',
      icon: psSetting,
      activePattern: [
        /^\/settings$/i,
        /^\/settings\/(profile|email|sshkey|notification)$/i
      ],
      children: [
        {
          path: '/settings/profile',
          name: 'menu.profile',
          icon: psMemberAlt,
          activePattern: [
            /^\/settings$/i,
            /^\/settings\/profile/i
          ]
        },
        {
          path: '/settings/email',
          name: 'menu.mail',
          icon: psMemberAlt,
          activePattern: [
            /^\/settings\/email/i
          ]
        },
        {
          path: '/settings/sshkey',
          name: 'menu.SSHKey_pl',
          icon: psContent,
          activePattern: [
            /^\/settings\/sshkey/i
          ]
        },
        {
          path: '/settings/notification',
          name: 'menu.notification',
          icon: psContent,
          activePattern: [
            /^\/settings\/notification/i
          ]
        }
      ]
    }
  ]
}

function makeAdminDrawerConfig () {
  return [
    {
      path: '/admin/dashboard',
      name: 'menu.dashboard',
      icon: psLog,
      activePattern: [
        /^\/admin(\/)?$/i,
        /^\/admin\/dashboard\/?.*$/i
      ]
    },
    {
      path: '/admin/users',
      name: 'menu.user_pl',
      icon: psMembers,
      activePattern: [
        /^\/admin\/users\/?.*$/i
      ]
    },
    {
      path: '/admin/groups',
      name: 'menu.group_pl',
      icon: psRepositoryGroup,
      activePattern: [
        /^\/admin\/groups\/?.*$/i
      ]
    },
    {
      path: '/admin/repositories',
      name: 'menu.repository_pl',
      icon: psRepository,
      activePattern: [
        /^\/admin\/repositories\/?.*$/i
      ]
    },
    {
      path: '/admin/settings',
      name: 'menu.setting_pl',
      icon: psSetting,
      activePattern: [
        /^\/admin\/settings\/?.*$/i
      ]
    }
  ]
}

function makeGroupDrawerConfig (groupConfig) {
  return (groupConfig && groupConfig.group)
    ? [
        {
          path: ['/groups', groupConfig.group.name, 'repositories'].join('/'),
          name: 'menu.repository_pl',
          icon: psRepository,
          activePattern: [
            /\/groups\/([A-Za-z0-9_]{5,})(\/)?$/i,
            /\/groups\/([A-Za-z0-9_]{5,})\/repositories/i
          ]
        },
        {
          path: ['/groups', groupConfig.group.name, 'mergerequests'].join('/'),
          name: 'menu.mergeRequest_pl',
          icon: psMerge,
          activePattern: [
            /\/groups\/([A-Za-z0-9_]{5,})\/mergerequests\/?.*$/i
          ]
        },
        {
          path: ['/groups', groupConfig.group.name, 'members'].join('/'),
          name: 'menu.member_pl',
          icon: psMembers,
          activePattern: [
            /\/groups\/([A-Za-z0-9_]{5,})\/members(\/)?$/i
          ]
        },
        {
          path: ['/groups', groupConfig.group.name, 'activities'].join('/'),
          name: 'menu.activity_pl',
          icon: psLog,
          activePattern: [
            /\/groups\/([A-Za-z0-9_]{5,})\/activities(\/)?/i
          ]
        },
        {
          path: ['/groups', groupConfig.group.name, 'settings'].join('/'),
          name: 'menu.setting_pl',
          icon: psSetting,
          activePattern: [
            /\/groups\/([A-Za-z0-9_]{5,})\/settings(\/)?$/i,
            /\/groups\/([A-Za-z0-9_]{5,})\/settings\/.*$/i
          ],
          children: [
            {
              path: ['/groups', groupConfig.group.name, 'settings', 'general'].join('/'),
              name: 'menu.general',
              icon: psSetting,
              activePattern: [
                /\/groups\/([A-Za-z0-9_]{5,})\/settings(\/)?$/i,
                /\/groups\/([A-Za-z0-9_]{5,})\/settings\/general(\/)?$/i
              ]
            },
            {
              path: ['/groups', groupConfig.group.name, 'settings', 'advanced'].join('/'),
              name: 'menu.advanced',
              icon: psSetting,
              activePattern: [
                /\/groups\/([A-Za-z0-9_]{5,})\/settings\/advanced(\/)?$/i
              ]
            }
          ]
        }
      ]
    : []
}

function makeRepositoryDrawerConfig (repositoryConfig) {
  return (repositoryConfig && repositoryConfig.repository)
    ? [
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'files'].join('/'),
          name: 'menu.file_pl',
          icon: psFile,
          activePattern: [
            /^\/([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/files(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/files\/.*$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/blame\/.*$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'commits'].join('/'),
          name: 'menu.commit_pl',
          count: repositoryConfig.count.commit,
          icon: psCommit,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/commits(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/commits\/.*$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/commit\/.*$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'mergerequests'].join('/'),
          name: 'menu.mergeRequest_pl',
          count: repositoryConfig.count.mergeRequest.open,
          icon: psMerge,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/mergerequests(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/mergerequests\/.*$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'branches'].join('/'),
          name: 'menu.branch_pl',
          count: repositoryConfig.count.branch,
          icon: psBranch,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/branches(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/branches\/.*$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'tags'].join('/'),
          name: 'menu.tag_pl',
          count: repositoryConfig.count.tag,
          icon: psTag,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/tags(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/tags\/.*$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'members'].join('/'),
          name: 'menu.member_pl',
          count: (repositoryConfig.members && repositoryConfig.members.filter(FilterGenerator.notDeleted()).length) || 0,
          icon: psMembers,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/members(\/)?$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'activities'].join('/'),
          name: 'menu.activity_pl',
          icon: psLog,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/activities(\/)?$/i
          ]
        },
        {
          path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'settings'].join('/'),
          name: 'menu.setting_pl',
          icon: psSetting,
          activePattern: [
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/settings(\/)?$/i,
            /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/settings\/.*$/i
          ],
          children: [
            {
              path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'settings', 'general'].join('/'),
              name: 'menu.general',
              icon: psSetting,
              activePattern: [
                /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/settings(\/)?$/i,
                /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/settings\/general(\/)?$/i
              ]
            },
            {
              path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'settings', 'branch'].join('/'),
              name: 'menu.branch_pl',
              icon: psSetting,
              activePattern: [
                /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/settings\/branch(\/)?$/i
              ]
            },
            {
              path: ['', repositoryConfig.group.name, repositoryConfig.repository.name, 'settings', 'advanced'].join('/'),
              name: 'menu.advanced',
              icon: psSetting,
              activePattern: [
                /([A-Za-z0-9_]{5,})\/[A-Za-z0-9_]+\/settings\/advanced(\/)?$/i
              ]
            }
          ]
        }
      ]
    : []
}

export default { makeDrawerConfig, makeAdminDrawerConfig, makeGroupDrawerConfig, makeRepositoryDrawerConfig }
