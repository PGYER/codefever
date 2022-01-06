// import helper
import { initailizer, getObjectByProperty } from 'APPSRC/helpers/VaribleHelper'

function NotificationReducer (state = {}, event) {
  // initialize status
  state.notificationCount = initailizer(state.notificationCount, 0)
  state.notificationBody = initailizer(state.notificationBody, {})
  state.askHandleStatus = initailizer(state.askHandleStatus, false)
  state.confirmation = initailizer(state.confirmation, {
    open: false,
    title: '',
    description: '',
    accept: function () {},
    reject: function () {},
    queueList: [],
    eventCount: 0
  })
  state.notificationOpenStatus = initailizer(state.notificationOpenStatus, false)

  // check event
  if (!event.type.match(/^notification\./)) {
    return { ...state }
  }

  // network status
  if (event.type === 'notification.message.add') {
    state.notificationCount++
    state.notificationBody = event.data
  } else if (event.type === 'notification.message.change') {
    state.notificationBody = event.data = {}
  } else if (event.type === 'notification.askhandle.status') {
    state.askHandleStatus = event.data
  }

  // confirm dialog
  if (event.type === 'notification.confirmation.popup') {
    state.confirmation.open = true
    state.confirmation.title = event.data.title
    state.confirmation.description = event.data.description
    state.confirmation.accept = event.data.accept || function () { return true }
    state.confirmation.reject = event.data.reject || function () { return true }
  } else if (event.type === 'notification.confirmation.close') {
    state.confirmation.eventCount++
    state.confirmation.open = false
    state.confirmation.accept = function () { return true }
    state.confirmation.reject = function () { return true }
  }

  // confirm dialog queue management
  if (event.type === 'notification.confirmation.add') {
    state.confirmation.eventCount++
    state.confirmation.queueList.push(event.data)
  } else if (event.type === 'notification.confirmation.remove') {
    state.confirmation.eventCount++
    const id = getObjectByProperty(state.confirmation.queueList, 'key', event.data.key)
    typeof id === 'number' && delete state.confirmation.queueList[id]
  } else if (event.type === 'notification.confirmation.consume') {
    if (state.confirmation.queueList.length && !state.confirmation.open) {
      state.confirmation.eventCount++
      const newItem = state.confirmation.queueList.shift()
      state.confirmation.open = true
      state.confirmation.title = newItem.data.title
      state.confirmation.description = newItem.data.description
      state.confirmation.accept = newItem.data.accept || function () { return true }
      state.confirmation.reject = newItem.data.reject || function () { return true }
    }
  }

  // notification open/close
  if (event.type === 'notification.notificationOpenStatus.toggle') {
    state.notificationOpenStatus = !state.notificationOpenStatus
  } else if (event.type === 'notification.notificationOpenStatus.open') {
    state.notificationOpenStatus = true
  } else if (event.type === 'notification.notificationOpenStatus.close') {
    state.notificationOpenStatus = false
  }

  return { ...state, confirmation: { ...state.confirmation, queueList: [...state.confirmation.queueList] } }
}

export default NotificationReducer
