// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
// import hljs from 'highlight.js'
import Prism from 'prismjs'
import 'highlight.js/styles/atom-one-light.css'
import { getCodeLanguageType, makeLink } from 'APPSRC/helpers/VaribleHelper'
import CodeLine from 'APPSRC/components/unit/CodeLine'
import CommitItem from 'APPSRC/components/unit/CommitItem'
import CircularProgress from '@material-ui/core/CircularProgress'

// style
const styles = theme => ({
  table: {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    '& tr:first-child': {
      border: 'none'
    }
  },
  topBorder: {
    borderTop: '1px solid ' + theme.palette.border
  },
  blame: {
    width: theme.spacing(40),
    verticalAlign: 'middle'
  },
  blameLoading: {
    width: theme.spacing(40),
    verticalAlign: 'top',
    textAlign: 'center',
    paddingTop: theme.spacing(10)
  },
  lineNumber: {
    width: theme.spacing(4),
    padding: '0 ' + theme.spacing(1) + 'px',
    textAlign: 'right',
    verticalAlign: 'middle',
    userSelect: 'none',
    color: theme.palette.text.lighter,
    backgroundColor: theme.palette.background.main
  },
  code: {
    verticalAlign: 'middle',
    overflowWrap: 'break-word'
  }
})

class CodeViewer extends React.Component {
  constructor (props) {
    super(props)
    const lineNumber = window.location.href.match(/^.*#(\d+)$/)
    this.state = {
      lineNumber: lineNumber ? parseInt(lineNumber[1]) : -1
    }
    this.ref = React.createRef()
  }

  componentDidMount () {
    if (this.ref.current) {
      let parent = this.ref.current
      let scroll = 0
      while (parent) {
        scroll += parent.offsetTop
        parent = parent.offsetParent
      }

      document.querySelector('.app-content').scrollTop = scroll - 64 - 21 * 5
    }
    return true
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  componentDidUpdate (prevProps, prevState) {
    return true
  }

  render () {
    const { object, blame, currentRepositoryConfig, match, classes, fragment } = this.props
    const { lineNumber } = this.state
    const lang = getCodeLanguageType(object.path)
    const codes = fragment ? object.object : object.object.raw.split('\n')
    // let parsed = hljs.highlight(lang, object.object.raw, true)
    // let parsedHtml = parsed.value.split('\n')
    const parsed = Prism.highlight(codes.join('\n'), Prism.languages[lang] || Prism.languages.markdown, lang)
    const parsedHtml = parsed.split('\n')
    let codeLines = []

    if (blame && blame.length) {
      codeLines = codes.map((item, key) => {
        let blameCell = null
        const blameData = blame.filter(blameItem => blameItem.start === (key + 1))
        if (blameData && blameData[0]) {
          blameCell = <td className={classes.blame} rowSpan={blameData[0].length}>
            <CommitItem key={key}
              data={blameData[0].commit}
              linkPathBase={makeLink(
                match.params.groupName,
                match.params.repositoryName,
                'commit'
              )}
              currentRepositoryConfig={currentRepositoryConfig}
              blameMode
            />
          </td>
        }

        return <tr key={key} className={blameCell && classes.topBorder}>
          {(key === (codes.length - 1) && codes[key].length === 0) ? <td className={classes.blame} /> : blameCell}
          <td className={classes.lineNumber}><code>{key + 1}</code></td>
          <td className={classes.code}><CodeLine code={item} htmlCode={parsedHtml[key]} /></td>
        </tr>
      })
    } else if (match.params.type === 'blame') {
      codeLines = codes.map((item, key) => {
        return <tr key={key}>
          { key === 0 && <td className={classes.blameLoading} rowSpan={codes.length}><CircularProgress size={24} /></td> }
          <td className={classes.lineNumber}><code>{key + 1}</code></td>
          <td className={classes.code}><CodeLine code={item} htmlCode={parsedHtml[key]} /></td>
        </tr>
      })
    } else {
      codeLines = codes.map((item, key) => {
        let style = {}
        if (fragment && fragment[key]) {
          style = {
            color: '#fff',
            background: fragment[key]
          }
        }

        return <tr key={key} ref={key + 1 === lineNumber ? this.ref : null}>
          <td className={classes.lineNumber} style={style}><code>{key + 1}</code></td>
          <td className={classes.code}><CodeLine code={item} htmlCode={parsedHtml[key]} /></td>
        </tr>
      })
    }

    return (<table className={classes.table}>
      <tbody>{ codeLines }</tbody>
    </table>)
  }
}

CodeViewer.propTypes = {
  classes: PropTypes.object.isRequired,
  object: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  blame: PropTypes.array,
  fragment: PropTypes.array
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(CodeViewer)
    )
  )
)
