const data = {
  'mergeRequest:create': '{user} 打开了和并请求: !{number} {title}',
  'mergeRequest:close': '{user} 关闭了和并请求: !{number} {title}',
  'mergeRequest:merge': '{user} 合并了和并请求: !{number} {title}',
  'mergeRequestReviewer:create': '{user} 指定你为合并请求 !{number} {title} 的评审员',
  'mergeRequestReviewer:review': '{user} 通过了和并请求 !{number} {title} 的评审'
}

export default { ...data, __namespace__: 'notification' }
