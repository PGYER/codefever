import Term from 'APPSRC/lang/en-us/Term'
import Phrase from 'APPSRC/lang/en-us/Phrase'

// let phraseSeperator = ''

const data = {
  ...Term,
  ...Phrase,

  dashboard: 'Dashboard',
  general: 'General',
  advanced: 'Advanced',
  profile: 'Profile',
  mail: 'E-mails'
}

export default { ...data, __namespace__: 'menu' }
