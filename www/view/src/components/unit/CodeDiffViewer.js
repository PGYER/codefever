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
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { getCodeLanguageType } from 'APPSRC/helpers/VaribleHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import CodeLine from 'APPSRC/components/unit/CodeLine'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import { psMore } from '@pgyer/icons'

// style
const styles = theme => ({
  table: {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse'
  },
  diffLabelTop: {
    color: theme.palette.text.light
  },
  diffLabel: {
    height: theme.spacing(4),
    color: theme.palette.text.light,
    '& code': {
      lineHeight: theme.spacing(4) + 'px'
    }
  },
  lineLabelButton: {
    width: theme.spacing(6),
    height: theme.spacing(2),
    padding: 0 + ' !important',
    overflow: 'hidden',
    marginTop: '-5px',
    borderRadius: 0
  },
  lineLabel: {
    width: theme.spacing(6),
    padding: 0,
    verticalAlign: 'top',
    userSelect: 'none'
  },
  lineNumber: {
    width: theme.spacing(6),
    padding: '0 ' + theme.spacing(1) + 'px',
    textAlign: 'right',
    verticalAlign: 'top',
    userSelect: 'none',
    color: theme.palette.text.lighter
  },
  diffMarker: {
    width: theme.spacing(2),
    textAlign: 'center',
    padding: '0',
    verticalAlign: 'top',
    userSelect: 'none',
    color: theme.palette.text.light
  },
  code: {
    verticalAlign: 'top',
    overflowWrap: 'break-word'
  },
  lineNumberAddition: {
    backgroundColor: theme.palette.background.additionDark
  },
  lineNumberDeletion: {
    backgroundColor: theme.palette.background.deletionDark
  },
  lineNumberMarker: {
    backgroundColor: theme.palette.background.diffLabelDark
  },
  addition: {
    backgroundColor: theme.palette.background.addition
  },
  deletion: {
    backgroundColor: theme.palette.background.deletion
  },
  marker: {
    backgroundColor: theme.palette.background.diffLabel
  },
  disabled: {
    backgroundColor: '#fcfdfe'
  }
})

class CodeDiffViewer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      originalHTML: [],
      modifiedHTML: [],
      original: [],
      modified: [],
      fullfileContent: [],
      diffContent: []
    }

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        exceptionCode: 0x040E,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_notFound' },
          { s: this.props.intl.formatMessage({ id: 'phrase.file' }) }
        )
      }
    ])
  }

  componentDidMount () {
    if (this.props.showFullFile) {
      this.makeFullDiffContent()
    } else {
      this.makeDiffContent()
      if (this.state.fullfileContent.length > 0) {
        this.buildFullFileContent()
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.showFullFile !== nextProps.showFullFile) {
      if (nextProps.showFullFile) {
        this.makeFullDiffContent()
      } else {
        this.makeDiffContent()
        if (this.state.fullfileContent.length > 0) {
          this.buildFullFileContent()
        }
      }
      return false
    }
    return true
  }

  getFileContent (callback) {
    RepositoryData.object({
      repository: this.props.repository,
      parent: this.props.fileDiffInfo.original.sha
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.state.fullfileContent = data.data.object && data.data.object.raw ? data.data.object.raw.split('\n') : []
          this.setState({ fullfileContent: this.state.fullfileContent })
          callback(data)
        } else if (!this.checkResponse(data.code)) {
          // do nothing
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.getFileFail' })
            , 2)
          )
        }
      })
  }

  // highlightOld (code) {
  //   // using highlight js
  //   let lang = getCodeLanguageType(this.props.fileDiffInfo.original.name || this.props.fileDiffInfo.modified.name || '')
  //   let parsed = hljs.highlight(lang, code.join('\n'), true)
  //   let parsedHtml = parsed.value.split('\n')
  //   let final = []
  //   for (let index = 0; index < code.length; index++) {
  //     if (typeof code[index] === 'string') {
  //       final[index] = parsedHtml[index]
  //     }
  //   }
  //   return final
  // }

  highlight (code) {
    // using prismjs
    const lang = getCodeLanguageType(this.props.fileDiffInfo.original.name || this.props.fileDiffInfo.modified.name || '')
    const parsed = Prism.highlight(code.join('\n'), Prism.languages[lang] || Prism.languages.markdown, lang)
    const parsedHtml = parsed.split('\n')
    const final = []
    for (let index = 0; index < code.length; index++) {
      if (typeof code[index] === 'string') {
        final[index] = parsedHtml[index]
      }
    }
    return final
  }

  makeDiffContent () {
    if (this.props.fileDiffInfo && this.props.fileDiffInfo.diff && this.props.fileDiffInfo.diff.line.length) {
      const lineData = this.props.fileDiffInfo.diff.line
      const final = []
      const original = []
      const modified = []
      let lineNumber = [null, null]
      for (let index = 0; index < lineData.length; index++) {
        const line = lineData[index]
        const matches = line.match(/^@@\s-+(\d+)(,\d+)?\s+\++(\d+)(,\d+)?\s+@@.*$/i)
        if (matches) {
          lineNumber = [parseInt(matches[1]), parseInt(matches[3])]
          final.push([0, 0, '', line])
        } else if (line[0] === '-') {
          final.push([lineNumber[0], null, '-'])
          original[lineNumber[0]] = line.substring(1)
          lineNumber[0]++
        } else if (line[0] === '+') {
          final.push([null, lineNumber[1], '+'])
          modified[lineNumber[1]] = line.substring(1)
          lineNumber[1]++
        } else {
          final.push([lineNumber[0], lineNumber[1], ''])
          original[lineNumber[0]] = line.substring(1)
          modified[lineNumber[1]] = line.substring(1)
          lineNumber[0]++
          lineNumber[1]++
        }
      }

      this.setState({
        diffContent: final,
        original,
        modified,
        originalHTML: this.highlight(original),
        modifiedHTML: this.highlight(modified)
      })
    }
  }

  makeFullDiffContent () {
    if (this.state.fullfileContent.length > 0) {
      if (this.props.fileDiffInfo && this.props.fileDiffInfo.diff && this.props.fileDiffInfo.diff.line.length) {
        const modifiedLines = this.state.fullfileContent.length
        const lineData = this.props.fileDiffInfo.diff.line
        const final = []
        const original = []
        const modified = []
        let lineNumber = [null, null]
        for (let index = 0; index < lineData.length; index++) {
          const line = lineData[index]
          const matches = line.match(/^@@\s-+(\d+)(,\d+)?\s+\++(\d+)(,\d+)?\s+@@.*$/i)
          if (matches) {
            let lastLineNumber = [0, 0]
            if (final.length) {
              lastLineNumber = [...lineNumber]
            }

            lineNumber = [parseInt(matches[1]), parseInt(matches[3])]

            for (;lastLineNumber[0] < Math.min(lineNumber[0], modifiedLines) - 1;) {
              lastLineNumber[1]++
              lastLineNumber[0]++
              final.push([lastLineNumber[0], lastLineNumber[1], ''])
              original[lastLineNumber[0]] = this.state.fullfileContent[lastLineNumber[0] - 1]
              modified[lastLineNumber[1]] = this.state.fullfileContent[lastLineNumber[0] - 1]
            }
          } else if (line[0] === '-') {
            final.push([lineNumber[0], null, '-'])
            original[lineNumber[0]] = line.substring(1)
            lineNumber[0]++
          } else if (line[0] === '+') {
            final.push([null, lineNumber[1], '+'])
            modified[lineNumber[1]] = line.substring(1)
            lineNumber[1]++
          } else {
            final.push([lineNumber[0], lineNumber[1], ''])
            original[lineNumber[0]] = line.substring(1)
            modified[lineNumber[1]] = line.substring(1)
            lineNumber[0]++
            lineNumber[1]++
          }
        }

        for (;lineNumber[0] <= this.state.fullfileContent.length;) {
          final.push([lineNumber[0], lineNumber[1], ''])
          original[lineNumber[0]] = this.state.fullfileContent[lineNumber[0] - 1]
          modified[lineNumber[1]] = this.state.fullfileContent[lineNumber[0] - 1]
          lineNumber[0]++
          lineNumber[1]++
        }

        this.setState({
          diffContent: final,
          original,
          modified,
          originalHTML: this.highlight(original),
          modifiedHTML: this.highlight(modified)
        })
      }
    } else {
      this.getFileContent((data) => {
        this.makeFullDiffContent()
      })
    }
  }

  expandCode (direction, markerPosition) {
    if (this.state.fullfileContent.length > 0) {
      const diffContent = this.state.diffContent
      const marker = diffContent[markerPosition]
      if (direction === 'head') {
        const previous = this.state.diffContent[markerPosition - 1]
        const next = this.state.diffContent[markerPosition + 1]
        if (!previous && next[1] <= 20) {
          // first marker, and line number less than 20, remove marker
          const insertData = []
          let originLine = next[0] - 1
          for (let index = next[1] - 1; index > 0; index--) {
            insertData.unshift([originLine, index, ''])
            originLine--
          }
          diffContent.splice(markerPosition, 1, ...insertData)
          this.setState({ diffContent })
          return true
        } else if (previous && previous[1] && previous[1] + 21 >= next[1]) {
          // non-first marker, the distance of previous line number and next line number less than 20, remove marker
          const insertData = []
          let originLine = previous[0] + 1
          for (let index = previous[1] + 1; index < next[1]; index++) {
            insertData.push([originLine, index, ''])
            originLine++
          }
          diffContent.splice(markerPosition, 1, ...insertData)
          this.setState({ diffContent })
          return true
        } else {
          // normal condition, just change marker
          const markerData = marker[3].match(/^@@\s-+(\d+)(,)?(\d+)?\s+\++(\d+)(,)?(\d+)?\s+@@.*$/i)
          if (markerData) {
            marker[3] = '@@ -' +
              (parseInt(markerData[1]) - 20) + ',' +
              ((parseInt(markerData[3]) + 20) || '') + ' +' +
              (parseInt(markerData[4]) - 20) + ',' +
              ((parseInt(markerData[6]) + 20) || '') + ' @@'
          }

          const insertData = []
          let originLine = next[0] - 1
          for (let index = next[1] - 1; index >= next[1] - 20; index--) {
            insertData.unshift([originLine, index, ''])
            originLine--
          }
          diffContent.splice(markerPosition + 1, 0, ...insertData)
          this.setState({ diffContent })
          return true
        }
      } else if (direction === 'tail') {
        const previous = this.state.diffContent[markerPosition - 1]
        const next = this.state.diffContent[markerPosition + 1]
        if (!marker && previous[0] + 21 > this.state.fullfileContent.length) {
          // reach the bottom line, remove marker (using original file content)
          const insertData = []
          let modifiedLine = previous[1] + 1
          for (let index = previous[0] + 1; index <= this.state.fullfileContent.length; index++) {
            insertData.push([index, modifiedLine, ''])
            modifiedLine++
          }
          diffContent.splice(markerPosition, 1, ...insertData)
          this.setState({ diffContent })
          return true
        } else if (marker && next && next[1] && previous[1] + 21 >= next[1]) {
          // the distance of previous line number and next line number less than 20, remove marker
          const insertData = []
          let originLine = previous[0] + 1
          for (let index = previous[1] + 1; index < next[1]; index++) {
            insertData.push([originLine, index, ''])
            originLine++
          }
          diffContent.splice(markerPosition, 1, ...insertData)
          this.setState({ diffContent })
          return true
        } else {
          // other condition, just append code
          const insertData = []
          let originLine = previous[0] + 1
          for (let index = previous[1] + 1; index < (previous[1] + 21); index++) {
            insertData.push([originLine, index, ''])
            originLine++
          }
          diffContent.splice(markerPosition, 0, ...insertData)
          this.setState({ diffContent })
          return true
        }
      }
    } else {
      this.getFileContent((data) => {
        this.buildFullFileContent()
        this.expandCode(direction, markerPosition)
      })
    }
  }

  buildFullFileContent () {
    const { original, modified, fullfileContent } = this.state
    let modifiedIndex = 1
    for (let index = 0; index < fullfileContent.length; index++) {
      if (typeof original[index + 1] !== 'string') {
        original[index + 1] = fullfileContent[index]
        modified[modifiedIndex] = fullfileContent[index]
        modifiedIndex++
      } else {
        while (typeof modified[modifiedIndex] === 'string' && modifiedIndex < modified.length) {
          modifiedIndex++
        }
      }
    }

    this.setState({
      original,
      modified,
      originalHTML: this.highlight(original),
      modifiedHTML: this.highlight(modified)
    })
  }

  makeLines () {
    const final = []
    const classes = this.props.classes
    if (this.props.renderSideBySide) {
      let lastDeletionIndex = null
      let lastDeletionDiffIndex = null
      for (let index = 0; index < this.state.diffContent.length; index++) {
        const lineData = this.state.diffContent[index]

        if (lineData[2] === '-' && lastDeletionIndex === null) {
          lastDeletionIndex = final.length
          lastDeletionDiffIndex = index
        }

        if (lineData[2] === '-') {
          final.push([
            <td key={0} className={[classes.lineNumber, classes.lineNumberDeletion].join(' ')}><code>{lineData[0]}</code></td>,
            <td key={1} className={[classes.diffMarker, classes.deletion].join(' ')}><code>-</code></td>,
            <td key={2} className={[classes.code, classes.deletion].join(' ')}><CodeLine code={this.state.original[lineData[0]]} htmlCode={this.state.originalHTML[lineData[0]]} /></td>,
            <td key={3} className={[classes.lineNumber].join(' ')} />,
            <td key={4} className={[classes.diffMarker, classes.disabled].join(' ')} />,
            <td key={5} className={[classes.code, classes.disabled].join(' ')} />
          ])
        }

        if (lineData[2] === '+' && typeof lastDeletionIndex === 'number') {
          if (final[lastDeletionIndex]) {
            final[lastDeletionIndex][3] = <td key={3} className={[classes.lineNumber, classes.lineNumberAddition].join(' ')}><code>{lineData[1]}</code></td>
            final[lastDeletionIndex][4] = <td key={4} className={[classes.diffMarker, classes.addition].join(' ')}><code>+</code></td>
            final[lastDeletionIndex][5] = <td key={5} className={[classes.code, classes.addition].join(' ')}>
              <CodeLine
                code={this.state.modified[lineData[1]]}
                original={this.state.original[this.state.diffContent[lastDeletionDiffIndex][0]]}
                htmlCode={this.state.modifiedHTML[lineData[1]]}
              />
            </td>

            final[lastDeletionIndex][2] = <td key={2} className={[classes.code, classes.deletion].join(' ')}>
              <CodeLine
                code={this.state.original[this.state.diffContent[lastDeletionDiffIndex][0]]}
                modified={this.state.modified[lineData[1]]}
                htmlCode={this.state.originalHTML[this.state.diffContent[lastDeletionDiffIndex][0]]}
              />
            </td>
            lastDeletionIndex++
            lastDeletionDiffIndex++
          } else {
            lastDeletionIndex = null
            lastDeletionDiffIndex = null
          }
        }

        if (lineData[2] === '+' && typeof lastDeletionIndex !== 'number') {
          final.push([
            <td key={0} className={[classes.lineNumber].join(' ')} />,
            <td key={1} className={[classes.diffMarker, classes.disabled].join(' ')} />,
            <td key={2} className={[classes.code, classes.disabled].join(' ')} />,
            <td key={3} className={[classes.lineNumber, classes.lineNumberAddition].join(' ')}><code>{lineData[1]}</code></td>,
            <td key={4} className={[classes.diffMarker, classes.addition].join(' ')}><code>+</code></td>,
            <td key={5} className={[classes.code, classes.addition].join(' ')}><CodeLine code={this.state.modified[lineData[1]]} htmlCode={this.state.modifiedHTML[lineData[1]]} /></td>
          ])

          lastDeletionIndex = null
          lastDeletionDiffIndex = null
        }

        if (lineData[0] === 0 && lineData[1] === 0) {
          if (index === 0) {
            final.push([
              <td key={0} className={[classes.lineLabel, classes.diffLabelTop, classes.lineNumberMarker].join(' ')} >
                <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('head', index)} />
              </td>,
              <td key={1} className={[classes.diffMarker, classes.diffLabelTop, classes.marker].join(' ')} />,
              <td key={2} className={[classes.code, classes.diffLabelTop, classes.marker].join(' ')} colSpan={4}><CodeLine code={lineData[3]} /></td>
            ])
          } else {
            final.push([
              <td key={0} className={[classes.lineLabel, classes.diffLabel, classes.lineNumberMarker].join(' ')} >
                <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('tail', index)} />
                <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('head', index)} />
              </td>,
              <td key={1} className={[classes.diffMarker, classes.diffLabel, classes.marker].join(' ')} />,
              <td key={2} className={[classes.code, classes.diffLabel, classes.marker].join(' ')} colSpan={4}><CodeLine code={lineData[3]} /></td>
            ])
          }

          lastDeletionIndex = null
          lastDeletionDiffIndex = null
        } else if (lineData[2] === '') {
          final.push([
            <td key={0} className={classes.lineNumber}><code>{lineData[0]}</code></td>,
            <td key={1} className={classes.diffMarker} />,
            <td key={2} className={classes.code}><CodeLine code={this.state.original[lineData[0]]} htmlCode={this.state.originalHTML[lineData[0]]} /></td>,
            <td key={3} className={classes.lineNumber}><code>{lineData[1]}</code></td>,
            <td key={4} className={classes.diffMarker} />,
            <td key={5} className={classes.code}><CodeLine code={this.state.modified[lineData[1]]} htmlCode={this.state.modifiedHTML[lineData[1]]} /></td>
          ])

          lastDeletionIndex = null
          lastDeletionDiffIndex = null
        }
      }
    } else {
      for (let index = 0; index < this.state.diffContent.length; index++) {
        const lineData = this.state.diffContent[index]
        const appendClassName = { '+': classes.addition, '-': classes.deletion }[lineData[2]]
        const appendClassNameDark = { '+': classes.lineNumberAddition, '-': classes.lineNumberDeletion }[lineData[2]]

        if (lineData[0] === 0 && lineData[1] === 0) {
          if (index === 0) {
            final.push([
              <td key={0} className={[classes.lineLabel, classes.diffLabelTop, classes.lineNumberMarker].join(' ')}>
                <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('head', index)} />
              </td>,
              <td key={1} className={[classes.lineNumber, classes.diffLabelTop, classes.marker].join(' ')} />,
              <td key={2} className={[classes.diffMarker, classes.diffLabelTop, classes.marker].join(' ')} />,
              <td key={3} className={[classes.code, classes.diffLabelTop, classes.marker].join(' ')}><CodeLine code={lineData[3]} /></td>
            ])
          } else {
            final.push([
              <td key={0} className={[classes.lineLabel, classes.diffLabel, classes.lineNumberMarker].join(' ')}>
                <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('tail', index)} />
                <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('head', index)} />
              </td>,
              <td key={1} className={[classes.lineNumber, classes.diffLabel, classes.marker].join(' ')} />,
              <td key={2} className={[classes.diffMarker, classes.diffLabel, classes.marker].join(' ')} />,
              <td key={3} className={[classes.code, classes.diffLabel, classes.marker].join(' ')}><CodeLine code={lineData[3]} /></td>
            ])
          }
        } else {
          if (lineData[2] === '-') {
            const prevLineData = this.state.diffContent[index - 1]
            const nextLineData = this.state.diffContent[index + 1]
            const nextTwoLineData = this.state.diffContent[index + 2]
            if (nextLineData && nextLineData[2] === '+' &&
              (!nextTwoLineData || (nextTwoLineData && nextTwoLineData[2] !== '+')) &&
              (!prevLineData || (prevLineData && prevLineData[2] !== '+'))
            ) {
              final.push([
                <td key={0} className={[classes.lineNumber, appendClassNameDark].join(' ')}><code>{lineData[0]}</code></td>,
                <td key={1} className={classes.lineNumber} />,
                <td key={2} className={[classes.diffMarker, appendClassName].join(' ')}><code>-</code></td>,
                <td key={3} className={[classes.code, appendClassName].join(' ')}>
                  <CodeLine
                    code={this.state.original[lineData[0]]}
                    modified={this.state.modified[nextLineData[1]]}
                    htmlCode={this.state.originalHTML[lineData[0]]}
                  />
                </td>
              ])
            } else {
              final.push([
                <td key={0} className={[classes.lineNumber, appendClassNameDark].join(' ')}><code>{lineData[0]}</code></td>,
                <td key={1} className={classes.lineNumber} />,
                <td key={2} className={[classes.diffMarker, appendClassName].join(' ')}><code>-</code></td>,
                <td key={3} className={[classes.code, appendClassName].join(' ')}><CodeLine code={this.state.original[lineData[0]]} htmlCode={this.state.originalHTML[lineData[0]]} /></td>
              ])
            }
          } else if (lineData[2] === '+') {
            const prevLineData = this.state.diffContent[index - 1]
            const prevTwoLineData = this.state.diffContent[index - 2]
            if (prevLineData && prevLineData[2] === '-' &&
              (!prevTwoLineData || (prevTwoLineData && prevTwoLineData[2] !== '-'))
            ) {
              final.push([
                <td key={0} className={classes.lineNumber} />,
                <td key={1} className={[classes.lineNumber, appendClassNameDark].join(' ')}><code>{lineData[1]}</code></td>,
                <td key={2} className={[classes.diffMarker, appendClassName].join(' ')}><code>+</code></td>,
                <td key={3} className={[classes.code, appendClassName].join(' ')}>
                  <CodeLine
                    code={this.state.modified[lineData[1]]}
                    original={this.state.original[prevLineData[0]]}
                    htmlCode={this.state.modifiedHTML[lineData[1]]}
                  />
                </td>
              ])
            } else {
              final.push([
                <td key={0} className={classes.lineNumber} />,
                <td key={1} className={[classes.lineNumber, appendClassNameDark].join(' ')}><code>{lineData[1]}</code></td>,
                <td key={2} className={[classes.diffMarker, appendClassName].join(' ')}><code>+</code></td>,
                <td key={3} className={[classes.code, appendClassName].join(' ')}><CodeLine code={this.state.modified[lineData[1]]} htmlCode={this.state.modifiedHTML[lineData[1]]} /></td>
              ])
            }
          } else {
            final.push([
              <td key={0} className={[classes.lineNumber, appendClassNameDark].join(' ')}><code>{lineData[0]}</code></td>,
              <td key={1} className={[classes.lineNumber, appendClassNameDark].join(' ')}><code>{lineData[1]}</code></td>,
              <td key={2} className={[classes.diffMarker, appendClassName].join(' ')}><code>{lineData[2]}</code></td>,
              <td key={3} className={[classes.code, appendClassName].join(' ')}><CodeLine code={this.state.modified[lineData[1]]} htmlCode={this.state.modifiedHTML[lineData[1]]} /></td>
            ])
          }
        }
      }
    }

    if (final.length > 0 && (!this.state.fullfileContent.length || this.state.diffContent[this.state.diffContent.length - 1][0] < this.state.fullfileContent.length - 1)) {
      const lastItem = this.state.diffContent[this.state.diffContent.length - 1]
      if (lastItem[2] === '') {
        if (this.props.renderSideBySide) {
          final.push([
            <td key={0} className={[classes.lineLabel, classes.diffLabelTop, classes.lineNumberMarker].join(' ')} >
              <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('tail', this.state.diffContent.length)} />
            </td>,
            <td key={1} className={[classes.diffMarker, classes.diffLabelTop, classes.marker].join(' ')} />,
            <td key={2} className={[classes.code, classes.diffLabelTop, classes.marker].join(' ')} colSpan={4}><CodeLine code='' /></td>
          ])
        } else {
          final.push([
            <td key={0} className={[classes.lineLabel, classes.diffLabelTop, classes.lineNumberMarker].join(' ')}>
              <SquareIconButton icon={psMore} className={classes.lineLabelButton} onClick={() => this.expandCode('tail', this.state.diffContent.length)} />
            </td>,
            <td key={1} className={[classes.lineNumber, classes.diffLabelTop, classes.marker].join(' ')} />,
            <td key={2} className={[classes.diffMarker, classes.diffLabelTop, classes.marker].join(' ')} />,
            <td key={3} className={[classes.code, classes.diffLabelTop, classes.marker].join(' ')}><CodeLine code='' /></td>
          ])
        }
      }
    }

    return final.map((item, key) => <tr key={key}>{item}</tr>)
  }

  render () {
    const { renderSideBySide, classes } = this.props

    return (<table className={classes.table}>
      {renderSideBySide
        ? <colgroup>
          <col className={this.props.classes.lineNumber} />
          <col className={this.props.classes.diffMarker} />
          <col />
          <col className={this.props.classes.lineNumber} />
          <col className={this.props.classes.diffMarker} />
          <col />
        </colgroup>
        : <colgroup>
          <col className={this.props.classes.lineNumber} />
          <col className={this.props.classes.lineNumber} />
          <col className={this.props.classes.diffMarker} />
          <col />
        </colgroup>}
      <tbody>
        {this.makeLines()}
      </tbody>
    </table>)
  }
}

CodeDiffViewer.propTypes = {
  intl: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  repository: PropTypes.string.isRequired,
  fileDiffInfo: PropTypes.object.isRequired,
  showFullFile: PropTypes.bool,
  renderSideBySide: PropTypes.bool,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    expandStatus: state.DrawerStates.expandStatus
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
      connect(mapStateToProps, mapDispatchToProps)(CodeDiffViewer)
    )
  )
)
