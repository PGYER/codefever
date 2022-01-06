import { getLang } from 'APPSRC/helpers/VaribleHelper'

function fetchMessage (code) {
  const lang = getLang()
  if (lang === 'zh-cn') {
    const ErrorCode = {
      0x0000: '操作成功',

      0x0100: '请求错误',
      0x0101: '登录信息失效, 需要重新登陆',
      0x0102: null,
      0x0103: null,
      0x0104: null,
      0x0105: '请求的地址不存在',
      0x0106: '没有操作权限',

      0x0200: '请求资源为空',
      0x0201: '输入错误',
      0x0202: '输入值超过允许范围',

      0x0301: '没有此仓库组',
      0x0302: '没有此仓库',

      // internal net work error
      0xFF00: '不能识别的响应数据，请稍后再试',
      0xFF01: '网络链接错误，请稍后再试',
      0xFF02: '请求过于频繁，请稍后再试'
    }
    return ErrorCode[code] || null
  } else {
    const ErrorCode = {
      0x0000: 'Done',

      0x0100: 'Request Error',
      0x0101: 'Invalid Login',
      0x0102: null,
      0x0103: null,
      0x0104: null,
      0x0105: 'Resource Not Found',
      0x0106: 'Insufficient Permission',

      0x0200: 'Empty Resource',
      0x0201: 'Invalid Input',
      0x0202: 'Input Out of Range',

      0x0301: 'No Such Group',
      0x0302: 'No Such Repository',

      // internal net work error
      0xFF00: 'Response Data Can Not Be Parsed, Try Later',
      0xFF01: 'Network Error, Try Later',
      0xFF02: 'Too Many Request, Try Later'
    }
    return ErrorCode[code] || null
  }
}

export default fetchMessage
