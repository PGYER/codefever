// import helper
import { initailizer } from 'APPSRC/helpers/VaribleHelper'

function DrawerReducer (state = {}, event) {
  // initialize status
  state.expandStatus = initailizer(state.expandStatus, true)

  // check event
  if (!event.type.match(/^drawer\./)) {
    return { ...state }
  }

  if (event.type === 'drawer.expandStatus.toggle') {
    state.expandStatus = !state.expandStatus
  } else if (event.type === 'drawer.expandStatus.close') {
    state.expandStatus = false
  } else if (event.type === 'drawer.expandStatus.open') {
    state.expandStatus = true
  }

  return { ...state }
}

export default DrawerReducer
