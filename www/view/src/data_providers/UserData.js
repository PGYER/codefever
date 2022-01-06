import APIRequest from 'APPSRC/data_providers/main'

function getUserInfo () {
  return APIRequest.GET('/api/user/info')
}

function getKeyList () {
  return APIRequest.GET('/api/user/listKey')
}

function addSSHKey (data) {
  return APIRequest.POST('/api/user/addSSHKey', data)
}

function removeSSHKey (data) {
  return APIRequest.POST('/api/user/removeSSHKey', data)
}

function setUserData (data) {
  return APIRequest.POST('/api/user/update', data)
}

function updateBasicInfo (data) {
  return APIRequest.POST('/api/user/updateBasicInfo', data)
}

function updatePassword (data) {
  return APIRequest.POST('/api/user/updatePassword', data)
}

function changeEmail (data) {
  return APIRequest.POST('/api/user/changeEmail', data)
}

function getMFAData () {
  return APIRequest.GET('/api/user/getMFAData')
}

function updateMFAData (data) {
  return APIRequest.POST('/api/user/updateMFAData', data)
}

function revokeMFAData () {
  return APIRequest.POST('/api/user/revokeMFAData', {})
}

function getCountriesCode (data) {
  return APIRequest.POST('/api/user/getCountriesCode', data)
}

function getCode (data) {
  return APIRequest.POST('/api/user/getCode', data)
}

function confirmTel (data) {
  return APIRequest.POST('/api/user/confirmTel', data)
}

function uploadAvatar (data) {
  return APIRequest.POST('/api/user/uploadAvatar', data)
}

function getEmailCode (data) {
  return APIRequest.POST('/api/user/getEmailCode', data)
}

function addCommitEmail (data) {
  return APIRequest.POST('/api/user/addCommitEmail', data)
}

function resentCommitEmailCode (data) {
  return APIRequest.POST('/api/user/resentCommitEmailCode', data)
}

function deleteCommitEmail (data) {
  return APIRequest.POST('/api/user/deleteCommitEmail', data)
}

function validationCommitEmailCode (data) {
  return APIRequest.POST('/api/user/validationCommitEmailCode', data)
}

function notifications (data) {
  return APIRequest.GET('/api/user/notifications', null, data)
}

function setNotificationRead (data) {
  return APIRequest.POST('/api/user/setNotificationRead', data)
}

function deleteNotification (data) {
  return APIRequest.POST('/api/user/deleteNotification', data)
}

function userNotificationSetting (data) {
  return APIRequest.POST('/api/user/userNotificationSetting', data)
}

function notificationRefused (data) {
  return APIRequest.GET('/api/user/notificationRefused', null, data)
}

function setGroupOrRepoNotification (data) {
  return APIRequest.POST('/api/user/setGroupOrRepoNotification', data)
}

export default {
  getUserInfo,
  getKeyList,
  addSSHKey,
  removeSSHKey,
  setUserData,
  updateBasicInfo,
  updatePassword,
  changeEmail,
  getMFAData,
  revokeMFAData,
  updateMFAData,
  getCountriesCode,
  confirmTel,
  uploadAvatar,
  getCode,
  getEmailCode,
  addCommitEmail,
  resentCommitEmailCode,
  deleteCommitEmail,
  validationCommitEmailCode,
  notifications,
  setNotificationRead,
  deleteNotification,
  userNotificationSetting,
  notificationRefused,
  setGroupOrRepoNotification
}
