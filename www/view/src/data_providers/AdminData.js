import APIRequest from 'APPSRC/data_providers/main'

function userList (data) {
  return APIRequest.POST('/api/admin/userList', data)
}

function updateUserStatus (data) {
  return APIRequest.POST('/api/admin/updateUserStatus', data)
}

function closeUserMFA (data) {
  return APIRequest.POST('/api/admin/closeUserMFA', data)
}

function resetPassword (data) {
  return APIRequest.POST('/api/admin/resetPassword', data)
}

function checkPassword (data) {
  return APIRequest.POST('/api/admin/checkPassword', data)
}

function setAdministrator (data) {
  return APIRequest.POST('/api/admin/setAdministrator', data)
}

function addUser (data) {
  return APIRequest.POST('/api/admin/addUser', data)
}

function groupList (data) {
  return APIRequest.POST('/api/admin/groupList', data)
}

function groupMembers (data) {
  return APIRequest.POST('/api/admin/groupMembers', data)
}

function groupAddMember (data) {
  return APIRequest.POST('/api/admin/groupAddMember', data)
}

function groupRemoveMember (data) {
  return APIRequest.POST('/api/admin/groupRemoveMember', data)
}

function setGroupOwner (data) {
  return APIRequest.POST('/api/admin/setGroupOwner', data)
}

function repositoryList (data) {
  return APIRequest.POST('/api/admin/repositoryList', data)
}

function repositoryMembers (data) {
  return APIRequest.POST('/api/admin/repositoryMembers', data)
}

function repositoryAddMember (data) {
  return APIRequest.POST('/api/admin/repositoryAddMember', data)
}

function repositoryRemoveMember (data) {
  return APIRequest.POST('/api/admin/repositoryRemoveMember', data)
}

function systemStatus () {
  return APIRequest.GET('/api/admin/systemStatus')
}

function getConfig () {
  return APIRequest.GET('/api/admin/config')
}

function setConfig (data) {
  return APIRequest.POST('/api/admin/config', data)
}

export default {
  userList,
  updateUserStatus,
  closeUserMFA,
  resetPassword,
  checkPassword,
  setAdministrator,
  addUser,
  groupList,
  groupMembers,
  groupAddMember,
  groupRemoveMember,
  setGroupOwner,
  repositoryList,
  repositoryMembers,
  repositoryAddMember,
  repositoryRemoveMember,
  systemStatus,
  getConfig,
  setConfig
}
