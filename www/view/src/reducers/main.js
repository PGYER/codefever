// import combineReducers
import { combineReducers } from 'redux'

// import reducer settings
import DataStore from 'APPSRC/reducers/DataStore'
import DrawerStates from 'APPSRC/reducers/DrawerStates'
import NotificationStates from 'APPSRC/reducers/NotificationStates'

// combine reducers
export default combineReducers({
  DataStore,
  DrawerStates,
  NotificationStates
})
