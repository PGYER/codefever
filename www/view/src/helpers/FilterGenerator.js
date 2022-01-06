import GroupConfig from 'APPSRC/config/Group'
import { checkPermission } from 'APPSRC/helpers/VaribleHelper'

function not (filter) {
  return input => !filter(input)
}

function and () {
  return input => [].slice.call(arguments).reduce((final, filter) => {
    return final && filter(input)
  }, false)
}

function or () {
  return input => [].slice.call(arguments).reduce((final, filter) => {
    return final || filter(input)
  }, false)
}

function userGroup () {
  return item => item.type === GroupConfig.Type.USER
}

function normalGroup () {
  return item => item.type === GroupConfig.Type.NORMAL
}

function id (ID) {
  return item => ID === item.id
}

function rule (rule) {
  return item => rule === item.rule
}

function ids (IDS) {
  return item => IDS.some(
    ID => ID === item.id
  )
}

function groupName (groupName) {
  return item => groupName === item.group.name
}

function email (email) {
  return item => email === item.email
}

function indexOfEmails (email) {
  return item => item.emails.indexOf(email) > -1
}

function name (name) {
  return item => name === item.name
}

function names (names) {
  return item => names.some(
    name => name === item.name
  )
}

function groupMember () {
  return item => item.groupMember
}

function notGroupMember () {
  return item => !item.groupMember
}

function deleted () {
  return item => item.deleteFlag
}

function notDeleted () {
  return item => !item.deleteFlag
}

function creator (userID) {
  return item => userID === item.owner
}

function creators (userIDs) {
  return item => userIDs.some(
    userID => userID === item.owner
  )
}

function group (groupID) {
  return item => groupID === item.group.id
}

function groups (groupIDs) {
  return item => groupIDs.some(
    groupID => groupID === item.group.id
  )
}

function fork (forkID) {
  return item => forkID === item.forkFrom
}

function forks (forkIDs) {
  return item => forkIDs.some(
    forkID => forkID === item.forkFrom
  )
}

function nameLikes (keyword) {
  return item => item.name.indexOf(keyword) > -1
}

function search (keyword, fields) {
  return item => fields.reduce(
    (result, field) => result || (item[field].toLowerCase().indexOf(keyword.toLowerCase()) > -1)
    , false)
}

function withPermission (permissionCode) {
  return item => checkPermission(item.role, permissionCode)
}

function withPermissions (permissionCodes) {
  return item => permissionCodes.some(
    permissionCode => checkPermission(item.role, permissionCode)
  )
}

function target (target) {
  return item => target === item.target
}

export default {
  not,
  and,
  or,
  userGroup,
  normalGroup,
  id,
  rule,
  ids,
  email,
  indexOfEmails,
  name,
  names,
  group,
  groups,
  groupMember,
  notGroupMember,
  deleted,
  notDeleted,
  fork,
  forks,
  nameLikes,
  search,
  creator,
  creators,
  withPermission,
  withPermissions,
  groupName,
  target
}
