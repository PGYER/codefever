import APIRequest from 'APPSRC/data_providers/main'

function list () {
  return APIRequest.GET('/api/repository/list')
}

function create (data) {
  return APIRequest.POST('/api/repository/create', data)
}

function fork (data) {
  return APIRequest.POST('/api/repository/fork', data)
}

function config (data) {
  return APIRequest.GET('/api/repository/config', null, data)
}

function uploadAvatar (data) {
  return APIRequest.POST('/api/repository/uploadAvatar', data)
}

function update (data) {
  return APIRequest.POST('/api/repository/update', data)
}

function updateName (data) {
  return APIRequest.POST('/api/repository/updateName', data)
}

function defaultBranch (data) {
  return APIRequest.POST('/api/repository/defaultBranch', data)
}

function protectedBranchRules (data) {
  return APIRequest.GET('/api/repository/protectedBranchRules', null, data)
}

function createProtectedBranchRule (data) {
  return APIRequest.POST('/api/repository/createProtectedBranchRule', data)
}

function updateProtectedBranchRule (data) {
  return APIRequest.POST('/api/repository/updateProtectedBranchRule', data)
}

function deleteProtectedBranchRule (data) {
  return APIRequest.POST('/api/repository/deleteProtectedBranchRule', data)
}

function addMember (data) {
  return APIRequest.POST('/api/repository/addMember', data)
}

function changeMemberRole (data) {
  return APIRequest.POST('/api/repository/changeMemberRole', data)
}

function removeMember (data) {
  return APIRequest.POST('/api/repository/removeMember', data)
}

function changeOwner (data) {
  return APIRequest.POST('/api/repository/changeOwner', data)
}

function deleteRepository (data) {
  return APIRequest.POST('/api/repository/deleteRepository', data)
}

function activities (data) {
  return APIRequest.GET('/api/repository/activities', null, data)
}

function mergeRequests (data) {
  return APIRequest.GET('/api/repository/mergeRequests', null, data)
}

function mergeRequestClose (data) {
  return APIRequest.POST('/api/repository/mergeRequestClose', data)
}

function mergeRequestCommits (data) {
  return APIRequest.GET('/api/repository/mergeRequestCommits', null, data)
}

function mergeRequestReview (data) {
  return APIRequest.POST('/api/repository/mergeRequestReview', data)
}

function assignReviewer (data) {
  return APIRequest.POST('/api/repository/assignReviewer', data)
}

function deleteReviewer (data) {
  return APIRequest.POST('/api/repository/deleteReviewer', data)
}

function object (data) {
  return APIRequest.GET('/api/repository/object', null, data)
}

function pathStack (data) {
  return APIRequest.GET('/api/repository/pathStack', null, data)
}

function fileContent (data) {
  return APIRequest.GET('/api/repository/fileContent', null, data)
}

function commitList (data) {
  return APIRequest.GET('/api/repository/commitList', null, data)
}

function commitDetail (data) {
  return APIRequest.GET('/api/repository/commitDetail', null, data)
}

function refListContainSHA (data) {
  return APIRequest.GET('/api/repository/refListContainSHA', null, data)
}

function fileChanges (data) {
  return APIRequest.GET('/api/repository/fileChanges', null, data)
}

function branchList (data) {
  return APIRequest.GET('/api/repository/branchList', null, data)
}

function createBranch (data) {
  return APIRequest.POST('/api/repository/createBranch', data)
}

function deleteBranch (data) {
  return APIRequest.POST('/api/repository/deleteBranch', data)
}

function tagList (data) {
  return APIRequest.GET('/api/repository/tagList', null, data)
}

function createTag (data) {
  return APIRequest.POST('/api/repository/createTag', data)
}

function deleteTag (data) {
  return APIRequest.POST('/api/repository/deleteTag', data)
}

function targetRepository (data) {
  return APIRequest.GET('/api/repository/targetRepository', null, data)
}

function lastCommitLog (data) {
  return APIRequest.GET('/api/repository/lastCommitLog', null, data)
}

function getBlameInfo (data) {
  return APIRequest.GET('/api/repository/blameInfo', null, data)
}

function createMergeRequest (data) {
  return APIRequest.POST('/api/repository/createMergeRequest', data)
}

function mergeRequestDetail (data) {
  return APIRequest.GET('/api/repository/mergeRequestDetail', null, data)
}

function checkMergeType (data) {
  return APIRequest.POST('/api/repository/checkMergeType', data)
}

function mergeBranch (data) {
  return APIRequest.POST('/api/repository/mergeBranch', data)
}

function mergeRequestVersionList (data) {
  return APIRequest.GET('/api/repository/mergeRequestVersionList', null, data)
}

function relatedMergeRequests (data) {
  return APIRequest.GET('/api/repository/relatedMergeRequests', null, data)
}

function getWebhook (data) {
  return APIRequest.POST('/api/repository/getWebhook', data)
}

function webhooks (data) {
  return APIRequest.POST('/api/repository/webhooks', data)
}

function editWebhook (data) {
  return APIRequest.POST('/api/repository/editWebhook', data)
}

function deleteWebhook (data) {
  return APIRequest.POST('/api/repository/deleteWebhook', data)
}

function getRepositoryWebhookLogs (data) {
  return APIRequest.POST('/api/repository/getRepositoryWebhookLogs', data)
}

function getRepositoryWebhookLogData (data) {
  return APIRequest.POST('/api/repository/getRepositoryWebhookLogData', data)
}

export default {
  list,
  create,
  fork,
  config,
  uploadAvatar,
  update,
  updateName,
  defaultBranch,
  protectedBranchRules,
  createProtectedBranchRule,
  updateProtectedBranchRule,
  deleteProtectedBranchRule,
  addMember,
  changeMemberRole,
  removeMember,
  changeOwner,
  deleteRepository,
  activities,
  mergeRequests,
  mergeRequestClose,
  mergeRequestCommits,
  mergeRequestReview,
  assignReviewer,
  deleteReviewer,
  object,
  pathStack,
  fileContent,
  commitList,
  commitDetail,
  fileChanges,
  refListContainSHA,
  branchList,
  createBranch,
  deleteBranch,
  tagList,
  createTag,
  deleteTag,
  targetRepository,
  lastCommitLog,
  getBlameInfo,
  createMergeRequest,
  mergeRequestDetail,
  checkMergeType,
  mergeBranch,
  mergeRequestVersionList,
  relatedMergeRequests,
  getWebhook,
  webhooks,
  editWebhook,
  deleteWebhook,
  getRepositoryWebhookLogs,
  getRepositoryWebhookLogData
}
