import Constants from 'APPSRC/config/Constants'
import UAC from 'APPSRC/config/UAC'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

function initailizer (varible, defaultValue = null) {
  return varible === undefined ? defaultValue : varible
}

function makeFormData (data) {
  const formData = new window.FormData()
  for (const key in data) {
    if (typeof data[key] === 'object' && !key.match(/_(SAFE|BINARY)$/)) {
      for (const keyName in data[key]) {
        if (typeof data[key].length === 'number') {
          formData.append(key + '[]', data[key][keyName])
        } else {
          formData.append(key + '[' + keyName + ']', data[key][keyName])
        }
      }
    } else {
      formData.append(key.replace(/_(SAFE|BINARY)$/, ''), data[key])
    }
  }
  return formData
}

function makeQueryString (query) {
  const queryArray = []
  for (const key in query) {
    queryArray.push(key + '=' + window.encodeURIComponent(query[key]))
  }
  return queryArray.join('&')
}

function getObjectByProperty (array, porpertyName, value) {
  for (let index = 0; index < array.length; index++) {
    if (array[index][porpertyName] === value) {
      return array[index]
    }
  }
  return {}
}

function formatNumber (input, inputUnit) {
  const unit = ['', 'k', 'M', 'G', 'T', 'P']
  let unitOffset = 0

  if (Math.abs(input) > Number.MAX_VALUE) {
    return NaN
  }

  if (inputUnit === '%') {
    input = 100 * input
  } else {
    while (input >= 1000) {
      input = input / 1000
      unitOffset++
    }
  }

  if (unitOffset) {
    return ((Math.round(input * 10) / 10) + ' ' + unit[unitOffset]).trim() + (inputUnit || '')
  } else {
    inputUnit = inputUnit ? ' ' + inputUnit : ''
    return Math.round(input * 100) / 100 + (inputUnit || '')
  }
}

function formatUnit (input, inputUnit) {
  const unit = ['p', 'u', 'm', '', 'k', 'M', 'G', 'T', 'P']
  const originPoint = 3

  let unitPrefix, standardUnit, unitScaleIndex, inputSuffix, baseValue, valueScaleIndex

  if (!inputUnit || !input) {
    return [input, inputUnit]
  }

  input = input.toString().trim()
  inputUnit = inputUnit.toString().trim()

  unitPrefix = inputUnit.slice(0, 1)
  standardUnit = inputUnit
  unitScaleIndex = unit.indexOf(unitPrefix)
  if (unitScaleIndex > -1) {
    standardUnit = inputUnit.slice(1)
  } else {
    unitScaleIndex = originPoint
    unitPrefix = ''
  }

  inputSuffix = input.slice(-1)
  baseValue = input
  valueScaleIndex = unit.indexOf(inputSuffix)

  if (valueScaleIndex > -1) {
    baseValue = input.slice(0, -1)
  } else {
    valueScaleIndex = originPoint
    inputSuffix = ''
  }

  return [baseValue, unit[valueScaleIndex + unitScaleIndex - originPoint] + standardUnit]
}

function roundNumber (input, base = 1) {
  let number = Math.round(input * 10 / base) / 10
  number = number.toString().replace(/^(\d+\.\d)\d*$/, (match, p1) => p1)
  number = parseFloat(number)
  if (number.toString() === 'NaN') {
    return input
  }
  return number
}

function percentColor (percent, theme, reverse) {
  const colorLevels = [theme.palette.info, theme.palette.success, theme.palette.warning, theme.palette.error]
  const breakPoints = [0.94, 0.85, 0.70, 0.50]
  let level = 0

  if (reverse) {
    percent = 1 - percent
  }

  for (level = 0; level < breakPoints.length; level++) {
    if (percent >= breakPoints[level] || level === breakPoints.length - 1) {
      break
    }
  }
  return colorLevels[level]
}

function prependZero (number, targetLegnth) {
  let returnString = number.toString()
  while (returnString.length < targetLegnth) {
    returnString = '0' + returnString
  }
  return returnString
}

function makeLink () {
  return '/' + [].slice.call(arguments).join('/')
}

function composeNamespacedData () {
  let data = {}
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] && arguments[i].__namespace__) {
      for (const key in arguments[i]) {
        data[arguments[i].__namespace__ + '.' + key] = arguments[i][key]
      }
    } else if (arguments[i]) {
      data = { ...data, ...arguments[i] }
    }
  }
  return data
}

function dataLabelParser (headerRowIndex) {
  return (parser, data) => {
    if (data && data.map && data[headerRowIndex] && data[headerRowIndex].map) {
      let finalData = [...data]
      finalData = finalData.map((item, index) => {
        if (index === headerRowIndex) {
          return item.map((content) => {
            if (typeof content === 'string') {
              return content.replace(/((legend|label|map)\.\w+)/g, (match, p1) => {
                return parser({ id: p1 })
              })
            }
            return content
          })
        } else {
          return item.map((content, countentIndex) => {
            if (typeof content === 'string' && countentIndex === 0) {
              return content.replace(/((legend|label|map)\.\w+)/g, (match, p1) => {
                return parser({ id: p1 })
              })
            }
            return content
          })
        }
      })

      return finalData
    }
    return data
  }
}

function tableDataLabelParser (parser, data) {
  return dataLabelParser(1)(parser, data)
}

function checkPermission (role, permissionCode) {
  if (role && UAC.PermissionConfig[role] && UAC.PermissionConfig[role].length) {
    return UAC.PermissionConfig[role].indexOf(permissionCode) > -1
  }
  return false
}

function getLang () {
  let lang = ''

  if (window.localStorage.getItem('lang')) {
    lang = window.localStorage.getItem('lang')
  } else {
    lang = navigator.language.toLowerCase() || navigator.userLanguage.toLowerCase()
  }

  return lang
}

function getCodeLanguageType (filename) {
  const ext = filename && filename.split('.').pop().toLowerCase()
  return (ext && Constants.codeFileExtentsions[ext]) || 'markdown'
}

function getUserInfo (members, commitEmail) {
  const userInfo = members ? members.filter(FilterGenerator.indexOfEmails(commitEmail)) : []
  return userInfo.length
    ? userInfo[0]
    : {
        temporary: true,
        name: commitEmail,
        email: commitEmail,
        icon: ''
      }
}

function getDefaultBranch (currentRepositoryConfig) {
  if (currentRepositoryConfig.branches && currentRepositoryConfig.branches.length) {
    const master = currentRepositoryConfig.branches.filter(FilterGenerator.id(currentRepositoryConfig.repository.defaultBranch))
    if (master[0]) {
      return master[0].id
    } else {
      return currentRepositoryConfig.branches[0].id
    }
  }
  return ''
}

function notificationParser (notification, intl) {
  if (!notification.type || !notification.data) {
    return false
  }

  const data = notification.data = JSON.parse(notification.data)
  notification.text = intl.formatMessage({ id: 'notification.' + notification.type }, data)
  notification.url = ''

  if (['mergeRequest:create', 'mergeRequest:close', 'mergeRequest:merge', 'mergeRequestReviewer:create', 'mergeRequestReviewer:review'].includes(notification.type)) {
    notification.url = [data.group, data.repository, 'mergerequests', data.number].join('/')
  }

  return true
}

function copyToClipboard (data, success, el) {
  window.setTimeout(() => {
    const dom = window.document.createElement('textarea')
    dom.innerHTML = data
    el ? el.appendChild(dom) : window.document.body.appendChild(dom)
    dom.select()
    document.execCommand('copy')
    el ? el.removeChild(dom) : window.document.body.removeChild(dom)
    success && success()
  }, 0)
}

export {
  initailizer, makeFormData, makeQueryString, getObjectByProperty, formatNumber,
  formatUnit, roundNumber, percentColor, prependZero,
  makeLink, composeNamespacedData, tableDataLabelParser,
  checkPermission, getLang, getCodeLanguageType, getUserInfo, getDefaultBranch,
  notificationParser, copyToClipboard
}
