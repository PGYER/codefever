// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import { MonacoDiffEditor } from 'react-monaco-editor'

// style
const styles = theme => ({
  diff: {
    '& .diffOverview': {
      display: 'none'
    },
    '& .line-numbers > a': {
      cursor: 'pointer'
    },
    '& .modified-in-monaco-diff-editor, & .modified-in-monaco-diff-editor .overflow-guard, & .modified-in-monaco-diff-editor .overflow-guard .monaco-scrollable-element': {
      width: 'calc(100%) !important'
    }
  }
})

class FileDiffViewer extends React.Component {
  constructor (props) {
    super(props)

    this.diffResource = {
      origin: this.props.origin.split('\n'),
      code: this.props.code.split('\n'),
      finalOrigin: null,
      finalCode: null,
      originCount: 0,
      codeCount: 0,
      mountCount: 0,
      gitDiffRegExp: new RegExp(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@(.*)/),
      gitDiff: this.props.gitDiff,
      showLineNumbers: [],
      showNumber: 20,
      lineNumberChange: 0,
      baseLineNumber: 1,
      downOmit: false
    }

    this.state = {
      origin: null,
      code: null
    }

    window.file_diff_global_variable_index = window.file_diff_global_variable_index !== undefined ? window.file_diff_global_variable_index : 0
    window.file_diff_global_variable = window.file_diff_global_variable === undefined ? [] : window.file_diff_global_variable

    this.window_variable = {
      index: window.file_diff_global_variable_index++
    }
    window.file_diff_global_variable[this.window_variable.index] = this
  }

  componentDidMount () {
    this.initShowLineNumbers(this.props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.showFullFile !== nextProps.showFullFile) {
      this.initShowLineNumbers(nextProps)
    }
    return true
  }

  initShowLineNumbers (props) {
    const { origin, code, gitDiffRegExp, gitDiff } = this.diffResource
    if (!gitDiff || !origin || !code) {
      return false
    }

    if (props.showFullFile) {
      this.diffResource.finalOrigin = origin
      this.diffResource.finalCode = code
      this.setState({ origin: origin.join('\n'), code: code.join('\n') })
      return true
    }

    // up omit
    const modifyLineRexExp = new RegExp(/^(-|\+).*/)
    let originIndex = 0
    let codeIndex = 0
    const showLineNumbers = this.diffResource.showLineNumbers = []
    this.diffResource.originCount = 0
    this.diffResource.codeCount = 0
    if (gitDiff.length) {
      gitDiff.map((item, index) => {
        let matchResult = gitDiffRegExp.exec(item)
        if (matchResult) {
          matchResult[1] = parseInt(matchResult[1])
          matchResult[2] = parseInt(matchResult[2])
          matchResult[3] = parseInt(matchResult[3])
          matchResult[4] = parseInt(matchResult[4])
          originIndex = matchResult[1]
          codeIndex = matchResult[3]
          showLineNumbers.push(matchResult)
        } else {
          matchResult = modifyLineRexExp.exec(item)
          if (matchResult && matchResult[1] === '-') {
            origin[originIndex - 1] = origin[originIndex - 1][0] === ' ' ? '-' + origin[originIndex - 1].slice(1) : item
            originIndex++
            this.diffResource.originCount++
          } else if (matchResult && matchResult[1] === '+') {
            code[codeIndex - 1] = code[codeIndex - 1][0] === ' ' ? '+' + code[codeIndex - 1].slice(1) : item
            codeIndex++
            this.diffResource.codeCount++
          } else {
            originIndex++
            codeIndex++
          }
        }
      })
    }

    // down omit
    const lastShowLineNumber = showLineNumbers[showLineNumbers.length - 1]
    if (lastShowLineNumber[1] + lastShowLineNumber[2] - 1 < origin.length || lastShowLineNumber[3] + lastShowLineNumber[4] - 1 < code.length) {
      this.diffResource.downOmit = true
      showLineNumbers.push([false, lastShowLineNumber[1] + lastShowLineNumber[2], 0, lastShowLineNumber[3] + lastShowLineNumber[4], 0])
    }

    this.showDiff()
  }

  showDiff () {
    const { origin, code, showLineNumbers, downOmit } = this.diffResource
    if (!origin || !code) {
      return false
    }

    const finalOrigin = this.diffResource.finalOrigin = []
    const finalCode = this.diffResource.finalCode = []

    if (showLineNumbers.length) {
      showLineNumbers.map((item, index) => {
        // up omit
        if (item[0]) {
          const upperLimit = index > 0 ? showLineNumbers[index - 1][1] + showLineNumbers[index - 1][2] : 1
          if (item[1] > upperLimit) {
            finalOrigin.push(item[0])
            finalCode.push(item[0])
          }
        }

        finalOrigin.push(...(origin.slice(item[1] - 1, item[1] - 1 + item[2])))
        finalCode.push(...(code.slice(item[3] - 1, item[3] - 1 + item[4])))

        // down omit
        if (!item[0] && downOmit) {
          finalOrigin.push('')
          finalCode.push('')
        }
        return item
      })
    }

    this.setState({ origin: finalOrigin.join('\n'), code: finalCode.join('\n') })
  }

  clickUpOmit (startLineNumber) {
    if (!startLineNumber) {
      return false
    }

    const { showNumber, showLineNumbers } = this.diffResource
    const clickIndex = this.findShowLineNumbersIndex(startLineNumber)
    if (clickIndex !== false) {
      const upperLimit = clickIndex > 0 ? showLineNumbers[clickIndex - 1][1] + showLineNumbers[clickIndex - 1][2] : 1
      const diffLine = (showLineNumbers[clickIndex][1] - showNumber > upperLimit) ? showNumber : showLineNumbers[clickIndex][1] - upperLimit

      showLineNumbers[clickIndex][1] -= diffLine
      showLineNumbers[clickIndex][2] += diffLine
      showLineNumbers[clickIndex][3] -= diffLine
      showLineNumbers[clickIndex][4] += diffLine
      showLineNumbers[clickIndex][0] = this.joinDiffLine(showLineNumbers[clickIndex])
    }

    this.showDiff()
  }

  joinDiffLine (diffLineData) {
    const { showNumber } = this.diffResource
    return '@@ -' + diffLineData[1] +
    ',' + (diffLineData[2] > showNumber ? showNumber : diffLineData[2]) +
    ' +' + diffLineData[3] +
    ',' + (diffLineData[4] > showNumber ? showNumber : diffLineData[4]) +
    ' @@'
  }

  clickDownOmit () {
    const { origin, code, showLineNumbers, showNumber } = this.diffResource
    if (!origin || !code || !this.diffResource.downOmit) {
      return false
    }

    const lastIndex = showLineNumbers.length - 1
    const lastShowLineNumber = showLineNumbers[lastIndex]

    showLineNumbers[lastIndex][2] += showNumber
    showLineNumbers[lastIndex][4] += showNumber
    if (lastShowLineNumber[1] + lastShowLineNumber[2] - 1 >= origin.length && lastShowLineNumber[3] + lastShowLineNumber[4] - 1 >= code.length) {
      this.diffResource.downOmit = false
    }

    this.showDiff()
  }

  findShowLineNumbersIndex (startLineNumber) {
    const { showLineNumbers } = this.diffResource
    startLineNumber = parseInt(startLineNumber)
    if (showLineNumbers.length) {
      for (const index in showLineNumbers) {
        if (showLineNumbers[index][1] === startLineNumber) {
          return index
        }
      }
    }

    return false
  }

  checkOriginOrCode () {
    const { originCount, codeCount, mountCount, lineNumberChange } = this.diffResource
    if (originCount <= codeCount) {
      return lineNumberChange % 2 === 1
    } else {
      return mountCount <= 2 ? (lineNumberChange <= 1) : (lineNumberChange <= 4 ? lineNumberChange % 2 === 1 : false)
    }
  }

  resetLineNumber (lineNumber) {
    if (!lineNumber) {
      return false
    }

    if (this.props.showFullFile) {
      return lineNumber
    }

    const { finalOrigin, finalCode, gitDiffRegExp } = this.diffResource
    if (lineNumber === 1) {
      this.diffResource.lineNumberChange++
      this.diffResource.baseLineNumber = 1
    }

    const originOrCode = this.checkOriginOrCode()
    const lineCode = (originOrCode ? finalOrigin : finalCode)[lineNumber - 1]
    const matchResult = gitDiffRegExp.exec(lineCode)
    // up omit btn
    if (matchResult) {
      this.diffResource.baseLineNumber = parseInt(originOrCode ? matchResult[1] : matchResult[3])
      return '<a onclick="window.file_diff_global_variable[' + this.window_variable.index + '].clickUpOmit(' + matchResult[1] + ')">...</a>'
    }

    // down omit btn
    if (lineCode === '' && this.diffResource.downOmit) {
      if ((originOrCode && finalOrigin.length === lineNumber) ||
          (!originOrCode && finalCode.length === lineNumber)) {
        return '<a onclick="window.file_diff_global_variable[' + this.window_variable.index + '].clickDownOmit()">...</a>'
      }
    }

    return parseInt(this.diffResource.baseLineNumber++)
  }

  render () {
    this.diffResource.mountCount++
    this.diffResource.lineNumberChange = 0
    const { origin, code } = this.state
    const { finalOrigin, finalCode, showLineNumbers } = this.diffResource
    const { renderSideBySide } = this.props.renderSideBySide !== undefined ? this.props.renderSideBySide : true
    const options = {
      renderSideBySide: renderSideBySide,
      selectOnLineNumbers: false,
      readOnly: true,
      lineNumbers: (number) => {
        return this.resetLineNumber(number)
      },
      scrollbar: {
        verticalScrollbarSize: '0px',
        handleMouseWheel: 'false'
      },

      overviewRulerLanes: -1
    }

    return (<Grid container spacing={2}>
      <Grid item xs={12} className={this.props.classes.diff}>
        { origin && showLineNumbers && <MonacoDiffEditor
          height={((finalOrigin.length > finalCode.length ? finalOrigin.length : finalCode.length) + 1) * 19 + 'px'}
          language='php'
          value={code}
          original={origin}
          options={options}
          theme='vs-dark' />
        }
      </Grid>
    </Grid>
    )
  }
}

FileDiffViewer.propTypes = {
  origin: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  gitDiff: PropTypes.array.isRequired,
  showFullFile: PropTypes.bool.isRequired,
  renderSideBySide: PropTypes.bool,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(FileDiffViewer)
    )
  )
)
