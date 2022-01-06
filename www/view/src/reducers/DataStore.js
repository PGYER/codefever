// import helper
import { initailizer } from 'APPSRC/helpers/VaribleHelper'

function DataStore (state = {}, event) {
  // initialize status
  state.repositoryList = initailizer(state.repositoryList, [])
  state.repositoryListPending = initailizer(state.repositoryListPending, true)
  state.groupList = initailizer(state.groupList, [])
  state.groupListPending = initailizer(state.groupListPending, true)
  state.currentRepositoryKey = initailizer(state.currentRepositoryKey, '')
  state.currentRepositoryError = initailizer(state.currentRepositoryError, false)
  state.currentRepositoryConfig = initailizer(state.currentRepositoryConfig, {})
  state.currentGroupKey = initailizer(state.currentGroupKey, '')
  state.currentGroupConfig = initailizer(state.currentGroupConfig, {})
  state.currentUserInfo = initailizer(state.currentUserInfo, {})

  let localLanguage = window.localStorage.getItem('lang')
  if (!localLanguage) {
    localLanguage = navigator.language.toLowerCase() || navigator.userLanguage.toLowerCase()

    if (['zh-cn', 'en-us'].indexOf(localLanguage) < 0) {
      localLanguage = 'zh-cn'
    }

    window.localStorage.setItem('lang', localLanguage)
    state.currentLanguage = localLanguage
  }
  state.currentLanguage = initailizer(state.currentLanguage, localLanguage)

  // check event
  if (!event.type.match(/^data\./)) {
    return { ...state }
  }

  if (event.type === 'data.repositoryList.update') {
    state.repositoryList = event.data
    state.repositoryListPending = false
  } else if (event.type === 'data.groupList.update') {
    state.groupList = event.data
    state.groupListPending = false
  } else if (event.type === 'data.currentRepositoryKey.update') {
    state.currentRepositoryKey = event.data
  } else if (event.type === 'data.currentRepositoryError.update') {
    state.currentRepositoryError = event.data
  } else if (event.type === 'data.currentRepositoryConfig.update') {
    state.currentRepositoryConfig = event.data
  } else if (event.type === 'data.currentGroupKey.update') {
    state.currentGroupKey = event.data
  } else if (event.type === 'data.currentGroupConfig.update') {
    state.currentGroupConfig = event.data
  } else if (event.type === 'data.currentUserInfo.update') {
    state.currentUserInfo = event.data
  } else if (event.type === 'data.currentLanguage.update') {
    state.currentLanguage = event.data
    window.localStorage.setItem('lang', event.data)
  }

  return { ...state }
}

export default DataStore
