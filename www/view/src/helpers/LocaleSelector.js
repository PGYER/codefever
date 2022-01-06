import { composeNamespacedData } from 'APPSRC/helpers/VaribleHelper'

import Lang from 'APPSRC/lang/Lang'

import CNMessage from 'APPSRC/lang/zh-cn/Message'
import CNErrorMessage from 'APPSRC/lang/zh-cn/ErrorMessage'
import CNActivityMessage from 'APPSRC/lang/zh-cn/ActivityMessage'
import CNTerm from 'APPSRC/lang/zh-cn/Term'
import CNPhrase from 'APPSRC/lang/zh-cn/Phrase'
import CNMenu from 'APPSRC/lang/zh-cn/Menu'
import CNLabel from 'APPSRC/lang/zh-cn/Label'
import CNNotification from 'APPSRC/lang/zh-cn/Notification'

import USMessage from 'APPSRC/lang/en-us/Message'
import USErrorMessage from 'APPSRC/lang/en-us/ErrorMessage'
import USActivityMessage from 'APPSRC/lang/en-us/ActivityMessage'
import USTerm from 'APPSRC/lang/en-us/Term'
import USPhrase from 'APPSRC/lang/en-us/Phrase'
import USMenu from 'APPSRC/lang/en-us/Menu'
import USLabel from 'APPSRC/lang/en-us/Label'
import USNotification from 'APPSRC/lang/en-us/Notification'

function localeSelector (locale) {
  switch (locale) {
    case 'zh-cn':
      return composeNamespacedData(
        Lang,
        CNMessage,
        CNActivityMessage,
        CNErrorMessage,
        CNTerm,
        CNPhrase,
        CNMenu,
        CNLabel,
        CNNotification
      )
    case 'en-us':
      return composeNamespacedData(
        Lang,
        USMessage,
        USActivityMessage,
        USErrorMessage,
        USTerm,
        USPhrase,
        USMenu,
        USLabel,
        USNotification
      )
  }
}

export { localeSelector }
