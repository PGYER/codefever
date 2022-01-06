import APIRequest from 'APPSRC/data_providers/main'

function list () {
  return APIRequest.GET('/api/group/list')
}

function create (data) {
  return APIRequest.POST('/api/group/create', data)
}

function config (data) {
  return APIRequest.GET('/api/group/config', null, data)
}

function mergeRequests (data) {
  return APIRequest.GET('/api/group/mergeRequests', null, data)
}

function activities (data) {
  return APIRequest.GET('/api/group/activities', null, data)
}

function uploadAvatar (data) {
  return APIRequest.POST('/api/group/uploadAvatar', data)
}

function update (data) {
  return APIRequest.POST('/api/group/update', data)
}

function addMember (data) {
  return APIRequest.POST('/api/group/addMember', data)
}

function changeMemberRole (data) {
  return APIRequest.POST('/api/group/changeMemberRole', data)
}

function removeMember (data) {
  return APIRequest.POST('/api/group/removeMember', data)
}

function changeOwner (data) {
  return APIRequest.POST('/api/group/changeOwner', data)
}

function updateName (data) {
  return APIRequest.POST('/api/group/updateName', data)
}

function deleteGroup (data) {
  return APIRequest.POST('/api/group/deleteGroup', data)
}

export default {
  list,
  create,
  config,
  mergeRequests,
  activities,
  uploadAvatar,
  update,
  addMember,
  changeMemberRole,
  removeMember,
  changeOwner,
  updateName,
  deleteGroup
}
