function Event (type, data) {
  return { type, data }
}

function Network (type, statusCode) {
}

function NewNotification (message, level = 0, action = null) {
  return { type: 'notification.message.add', data: { message, level, action } }
}

function NewComformation (title, description, accept, reject) {
  return { type: 'notification.confirmation.popup', data: { title, description, accept, reject } }
}

function consumeComformation () {
  return { type: 'notification.confirmation.consume', data: null }
}

function cancelComformation () {
  return { type: 'notification.confirmation.close', data: null }
}

function addComformation (key, item) {
  return { type: 'notification.confirmation.add', data: { key: key, data: item } }
}

function removeComformation (key) {
  return { type: 'notification.confirmation.remove', data: { key } }
}

export default { Event, NewNotification, Network, NewComformation, consumeComformation, cancelComformation, addComformation, removeComformation }
