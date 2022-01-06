import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ErrorCodeParser from 'APPSRC/helpers/ErrorCodeParser'

function getJSONData (response, dispatcher = null) {
  dispatcher && dispatcher({ type: 'network.connection.ok' })

  // check response valid
  if (!response.ok) {
    if (parseInt(response.status) === 429) {
      dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(0xFF02), 1))
      return { code: 1 }
    }

    if (parseInt(response.status) >= 500) {
      dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(0xFF03), 1))
      return { code: 1 }
    }
  }

  let responseJson = {}

  responseJson = response.json().catch((e) => {
    dispatcher && dispatcher({ type: 'network.connection.error' })
    dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(0xFF00), 2))
    return { code: 1 }
  })

  responseJson
    .then((data) => {
      if (data && data.code && data.code < 0x0400) {
        dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(data.code) || data.message, 2))
        if (parseInt(data.code) === 0x0101) {
          // login status not valid, redirect to login page
          window.setTimeout(() => {
            window.location.href = '/user/login'
          }, 3000)
        }
        if (parseInt(data.code) === 0x0106) {
          // access denied
        }
      }
    })
    .catch((error) => {
      catchError(error, dispatcher)
    })
  return responseJson
}

function getTextData (response, dispatcher = null) {
  // check response valid
  if (!response.ok) {
    switch (response.status) {
      case 429: {
        dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(0xFF02), 1))
        break
      }
      case 500: {
        dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(0xFF03), 1))
        break
      }
      default: {
        dispatcher && dispatcher(EventGenerator.NewNotification('Oooops...', 1))
      }
    }
    return null
  }

  return response.text()
}

function getFile (response, dispatcher = null) {

}

function catchError (error, dispatcher = null) {
  dispatcher && dispatcher({ type: 'network.connection.error' })
  dispatcher && dispatcher(EventGenerator.NewNotification(ErrorCodeParser(0xFF01), 2))
  return error
}

function withEventdispatcher (dispatcher) {
  return (handler) => (promise) => handler(promise, dispatcher)
}

function getHost (userinfo) {
  return userinfo && userinfo.host
}

function getSSHHost (userinfo) {
  return userinfo && 'git@' + userinfo.host.replace('http://', '').replace('https://', '')
}

function makeSlug (input) {
  return input.replace(/[^\w]/g, '_')
}

export default { getJSONData, getTextData, getFile, catchError, withEventdispatcher, getHost, getSSHHost, makeSlug }
