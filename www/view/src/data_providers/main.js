import { makeFormData, makeQueryString } from 'APPSRC/helpers/VaribleHelper'

function DataProvider (method, endpoint, data, query) {
  let returnPromise

  if (query) {
    endpoint += '?' + makeQueryString(query)
  }

  // for demo path hwader
  const appendHeader = 'codefever-app'
  const localLanguage = window.localStorage.getItem('lang') || 'zh-cn'

  if (data) {
    returnPromise = window.fetch(
      endpoint,
      {
        body: makeFormData(data),
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'codefever-end-env': appendHeader,
          'codefever-end-lang': localLanguage,
          Accept: 'application/json'
        },
        method: method,
        mode: 'same-origin',
        redirect: 'follow',
        referrer: 'client'
      })
  } else {
    returnPromise = window.fetch(
      endpoint,
      {
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'codefever-end-env': appendHeader,
          'codefever-end-lang': localLanguage,
          Accept: 'application/json'
        },
        method: method,
        mode: 'same-origin',
        redirect: 'follow',
        referrer: 'client'
      })
  }

  return returnPromise
}

function GET (endpoint, data = {}, query = {}) {
  query.requestTime = new Date().getTime()
  return DataProvider('GET', endpoint, null, query)
}

function POST (endpoint, data, query = {}) {
  return DataProvider('POST', endpoint, data, query)
}

function PUT (endpoint, data, query = {}) {
  return DataProvider('PUT', endpoint, data, query)
}

function DELETE (endpoint, data, query = {}) {
  return DataProvider('DELETE', endpoint, data, query)
}

function OPTIONS (endpoint, data, query = {}) {
  return DataProvider('OPTIONS', endpoint, data, query)
}

export default { GET, POST, PUT, DELETE, OPTIONS }
