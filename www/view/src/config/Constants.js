const commonStatus = {
  normal: 1,
  delete: 4
}

// Object Viewer 显示模式
const obejctDisplayType = {
  unknown: 0,
  empty: 1,
  oversize: 2,
  text: 3,
  markdown: 4,
  image: 5,
  video: 6
}

// Object Diff Viewer 显示模式
const obejctDiffDisplayType = {
  unknown: 0,
  empty: 1,
  oversize: 2,
  infoChange: 3,
  textChange: 4,
  imageChange: 5
}

// activity category
const activityCategory = {
  all: 0,
  commit: 1,
  mergeRequest: 2,
  member: 3
}

// merge request status
const mergeRequestStatus = {
  open: 1,
  merged: 2,
  closed: 3
}

const notificationCategory = {
  all: 0,
  unRead: 1,
  system: 2,
  mention: 3
}

const notificationRefuseType = {
  group: 1,
  repository: 2
}

const notificationStatus = {
  mr: 1,
  email: 2
}

function getStaticHost () {
  return window.location.origin + '/'
}

const STATIC_VERSION = '00000000000000'

const HOSTS = {
  STATIC_HOST: getStaticHost(),
  PGYER_AVATAR_HOST: getStaticHost() + 'file/fetch/avatar/',
  STATIC_AVATAR_PREFIX: getStaticHost() + 'file/fetch/avatar/'
}

const codeFileExtentsions = {
  bat: 'bat',
  clj: 'clojure',
  cljs: 'clojure',
  cljn: 'clojure',
  cljc: 'clojure',
  cljx: 'clojure',
  coffee: 'coffee',
  litcoffee: 'coffee',
  c: 'cpp',
  h: 'cpp',
  cpp: 'cpp',
  cs: 'csharp',
  css: 'css',
  go: 'go',
  graphql: 'graphql',
  htm: 'html',
  xhtm: 'html',
  html: 'html',
  xhtml: 'html',
  ini: 'ini',
  java: 'java',
  js: 'javascript',
  jsx: 'javascript',
  es: 'javascript',
  jsm: 'javascript',
  esm: 'javascript',
  json: 'json',
  kt: 'kotlin',
  less: 'less',
  lua: 'lua',
  md: 'markdown',
  mysql: 'mysql',
  m: 'objective-c',
  pas: 'pascal',
  perl: 'perl',
  pgsql: 'pgsql',
  php: 'php',
  xhp: 'php',
  php3: 'php',
  php4: 'php',
  ps: 'powershell',
  py: 'python',
  r: 'r',
  rb: 'ruby',
  rust: 'rust',
  scss: 'scss',
  sh: 'bash',
  sql: 'sql',
  swift: 'swift',
  ts: 'typescript',
  tsx: 'typescript',
  tsm: 'typescript',
  vb: 'vb',
  xml: 'xml',
  yml: 'yaml'
}

const Constants = {
  commonStatus,
  obejctDisplayType,
  obejctDiffDisplayType,
  activityCategory,
  mergeRequestStatus,
  notificationCategory,
  notificationRefuseType,
  notificationStatus,
  STATIC_VERSION,
  HOSTS,
  codeFileExtentsions
}

export default Constants
