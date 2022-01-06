import Term from 'APPSRC/lang/zh-cn/Term'
import Phrase from 'APPSRC/lang/zh-cn/Phrase'

// let phraseSeperator = ''

const data = {
  ...Term,
  ...Phrase,

  dashboard: '概览',
  general: '常规',
  advanced: '高级',
  profile: '个人信息',
  mail: '多邮箱'
}

export default { ...data, __namespace__: 'menu' }
