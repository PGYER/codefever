const data = {
  'mergeRequest:create': '{user} Open Merge Request: !{number} {title}',
  'mergeRequest:close': '{user} Close Merge Request: !{number} {title}',
  'mergeRequest:merge': '{user} Merge The Merge Request: !{number} {title}',
  'mergeRequestReviewer:create': '{user} Assign You As The Reviewer For The Merge Request !{number} {title}',
  'mergeRequestReviewer:review': '{user} Approve Changes Of Merge Request !{number} {title} '
}

export default { ...data, __namespace__: 'notification' }
