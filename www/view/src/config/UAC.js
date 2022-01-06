const Role = {
  NO_PERMISSION: 0,
  GUEST: 1,
  REPORTER: 2,
  DEVELOPER: 3,
  MAINTAINER: 4,
  OWNER: 5,
  NOBODY: 6
}

const PermissionCode = {
  NO_PERMISSION: 0x00,

  REPO_READ: 0x01,
  REPO_PUSH: 0x02,
  REPO_REMOVE: 0x03,
  REPO_CHANGE_MEMBER: 0x04,
  REPO_CHANGE_INFO: 0x05,

  MR_READ: 0x08,
  MR_PUSH: 0x09,
  MR_MERGE: 0x0A,

  GROUP_CHANGE_MEMBER: 0x10,
  GROUP_CREATE_REPO: 0x11
}

const PermissionConfig = {}
PermissionConfig[Role.NO_PERMISSION] = []
PermissionConfig[Role.GUEST] = [
  PermissionCode.REPO_READ
]
PermissionConfig[Role.REPORTER] = [
  PermissionCode.REPO_READ,
  PermissionCode.MR_READ
]
PermissionConfig[Role.DEVELOPER] = [
  PermissionCode.REPO_READ,
  PermissionCode.MR_READ, PermissionCode.MR_PUSH
]
PermissionConfig[Role.MAINTAINER] = [
  PermissionCode.REPO_READ, PermissionCode.REPO_PUSH, PermissionCode.REPO_CHANGE_MEMBER, PermissionCode.REPO_CHANGE_INFO,
  PermissionCode.MR_READ, PermissionCode.MR_PUSH, PermissionCode.MR_MERGE,
  PermissionCode.GROUP_CHANGE_MEMBER, PermissionCode.GROUP_CREATE_REPO
]
PermissionConfig[Role.OWNER] = [
  PermissionCode.REPO_READ, PermissionCode.REPO_PUSH, PermissionCode.REPO_REMOVE, PermissionCode.REPO_CHANGE_MEMBER, PermissionCode.REPO_CHANGE_INFO,
  PermissionCode.MR_READ, PermissionCode.MR_PUSH, PermissionCode.MR_MERGE,
  PermissionCode.GROUP_CHANGE_MEMBER, PermissionCode.GROUP_CREATE_REPO
]

export default { Role, PermissionCode, PermissionConfig }
