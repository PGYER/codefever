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

import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { getCodeLanguageType } from 'APPSRC/helpers/VaribleHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

// style
const styles = theme => ({})

class FileDiffViewer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      original: [],
      modified: [],
      modifiedFullFile: null,
      instance: null,
      monaco: null,
      editorHeight: 0
    }

    this.cached = {
      originalDecorations: [],
      modifiedDecorations: []
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
      this.initFullFileInfo()
    } else {
      this.initDiffFileInfo()
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.showFullFile !== nextProps.showFullFile) {
      if (!this.props.showFullFile) {
        this.initFullFileInfo()
      } else {
        this.initDiffFileInfo()
      }
    }

    if (this.props.expandStatus !== nextProps.expandStatus) {
      window.setTimeout(() => {
        this.state.instance && this.state.instance.layout()
      }, 300)
    }

    return true
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.renderSideBySide !== prevProps.renderSideBySide ||
      this.props.layoutUpdateTimeStamp !== prevProps.layoutUpdateTimeStamp
    ) {
      this.state.instance && this.state.instance.layout()
    }
  }

  initFullFileInfo () {
    const { fileDiffInfo } = this.props
    if (fileDiffInfo && fileDiffInfo.diff) {
      if (this.state.modifiedFullFile === null) {
        // a full modified file required
        this.getFilContent(data => {
          this.initFullFileInfo()
        })
        return true
      }

      const rawData = fileDiffInfo.diff.raw
      const rawDataLines = rawData.split('\n')
      const state = { original: [], modified: [] }
      const currentParseState = { originalLineNumber: 1, modifiedLineNumber: 1 }

      // combine source code and diff-code
      for (let diffIndex = 0; diffIndex < rawDataLines.length; diffIndex++) {
        const content = rawDataLines[diffIndex]
        const diffMarkerMatches = content.match(/^@@\s+-(\d+),\d+\s+\+(\d+),\d+\s+@@.*$/i)
        const normalLineMatches = content.match(/^(\s|\+|-)(.*)$/i)
        let originalLine = null
        let modifiedLine = null

        if (diffMarkerMatches) {
          const modifiedStopLineNumber = parseInt(diffMarkerMatches[2])
          for (let modifiedCodeIndex = state.modified.length; modifiedCodeIndex < modifiedStopLineNumber - 1; modifiedCodeIndex++) {
            modifiedLine = {
              lineNumber: currentParseState.modifiedLineNumber,
              content: this.state.modifiedFullFile[modifiedCodeIndex],
              type: 'normal',
              bindIndex: state.original.length
            }
            originalLine = {
              lineNumber: currentParseState.originalLineNumber,
              content: this.state.modifiedFullFile[modifiedCodeIndex],
              type: 'normal',
              bindIndex: state.modified.length
            }

            currentParseState.modifiedLineNumber++
            currentParseState.originalLineNumber++
            state.original.push(originalLine)
            state.modified.push(modifiedLine)
            originalLine = null
            modifiedLine = null
          }
        } else if (normalLineMatches) {
          if (normalLineMatches[1] === '+') {
            modifiedLine = {
              lineNumber: currentParseState.modifiedLineNumber,
              content: normalLineMatches[2],
              type: 'addtion'
            }
            currentParseState.modifiedLineNumber++
          } else if (normalLineMatches[1] === '-') {
            originalLine = {
              lineNumber: currentParseState.originalLineNumber,
              content: normalLineMatches[2],
              type: 'deletion'
            }
            currentParseState.originalLineNumber++
          } else {
            modifiedLine = {
              lineNumber: currentParseState.modifiedLineNumber,
              content: normalLineMatches[2],
              type: 'normal',
              bindIndex: state.original.length
            }
            originalLine = {
              lineNumber: currentParseState.originalLineNumber,
              content: normalLineMatches[2],
              type: 'normal',
              bindIndex: state.modified.length
            }
            currentParseState.modifiedLineNumber++
            currentParseState.originalLineNumber++
          }
          originalLine && state.original.push(originalLine)
          modifiedLine && state.modified.push(modifiedLine)
        }
      }

      // compelte unfinished diff-code
      for (let modifiedCodeIndex = state.modified.length; modifiedCodeIndex < this.state.modifiedFullFile.length - 1; modifiedCodeIndex++) {
        const modifiedLine = {
          lineNumber: currentParseState.modifiedLineNumber,
          content: this.state.modifiedFullFile[modifiedCodeIndex],
          type: 'normal',
          bindIndex: state.original.length
        }
        const originalLine = {
          lineNumber: currentParseState.originalLineNumber,
          content: this.state.modifiedFullFile[modifiedCodeIndex],
          type: 'normal',
          bindIndex: state.modified.length
        }

        currentParseState.modifiedLineNumber++
        currentParseState.originalLineNumber++
        state.original.push(originalLine)
        state.modified.push(modifiedLine)
      }

      this.setState({ ...state })
    }
  }

  initDiffFileInfo () {
    const { fileDiffInfo } = this.props
    if (fileDiffInfo && fileDiffInfo.diff) {
      const rawData = fileDiffInfo.diff.raw
      const rawDataLines = rawData.split('\n')
      const state = { original: [], modified: [] }
      const currentParseState = { originalLineNumber: 0, modifiedLineNumber: 0 }
      for (let lineIndex = 0; lineIndex < rawDataLines.length; lineIndex++) {
        const content = rawDataLines[lineIndex]
        const diffMarkerMatches = content.match(/^@@\s+-(\d+),\d+\s+\+(\d+),\d+\s+@@.*$/i)
        const normalLineMatches = content.match(/^(\s|\+|-)(.*)$/i)
        let originalLine = null
        let modifiedLine = null
        if (diffMarkerMatches) {
          currentParseState.originalLineNumber = parseInt(diffMarkerMatches[1])
          currentParseState.modifiedLineNumber = parseInt(diffMarkerMatches[2])

          if (state.modified[state.modified.length - 1] && state.modified[state.modified.length - 1].type === 'normal') {
            state.modified[state.modified.length - 1].type = 'marker-bottom'
          }

          if (state.original[state.original.length - 1] && state.original[state.original.length - 1].type === 'normal') {
            state.original[state.original.length - 1].type = 'marker-bottom'
          }

          originalLine = { lineNumber: '-', content, type: 'marker-diff' }
          modifiedLine = { lineNumber: '-', content, type: 'marker-diff' }
        } else if (normalLineMatches) {
          if (normalLineMatches[1] === '+') {
            modifiedLine = {
              lineNumber: currentParseState.modifiedLineNumber,
              content: normalLineMatches[2],
              type: 'addtion'
            }
            currentParseState.modifiedLineNumber++
          } else if (normalLineMatches[1] === '-') {
            originalLine = {
              lineNumber: currentParseState.originalLineNumber,
              content: normalLineMatches[2],
              type: 'deletion'
            }
            currentParseState.originalLineNumber++
          } else {
            modifiedLine = {
              lineNumber: currentParseState.modifiedLineNumber,
              content: normalLineMatches[2],
              type: 'normal',
              bindIndex: state.original.length
            }
            originalLine = {
              lineNumber: currentParseState.originalLineNumber,
              content: normalLineMatches[2],
              type: 'normal',
              bindIndex: state.modified.length
            }
            currentParseState.modifiedLineNumber++
            currentParseState.originalLineNumber++
          }
        }

        originalLine && state.original.push(originalLine)
        modifiedLine && state.modified.push(modifiedLine)
      }

      if (state.modified[state.modified.length - 1] && state.modified[state.modified.length - 1].type === 'normal') {
        state.modified[state.modified.length - 1].type = 'marker-bottom'
      }

      if (state.original[state.original.length - 1] && state.original[state.original.length - 1].type === 'normal') {
        state.original[state.original.length - 1].type = 'marker-bottom'
      }

      this.setState({ ...state })
    }
  }

  initMonacoEditor (instance, monaco) {
    const editorHeight = this.getEditorScrollHeight(instance)
    this.setState({ instance, monaco, editorHeight })

    // change code when click expand code
    instance.getDomNode().addEventListener('click', (ev) => {
      const role = ev.target.getAttribute('role')
      if (role === 'action-show-omit') {
        const startLine = parseInt(ev.target.dataset.startLine)
        const stopLine = parseInt(ev.target.dataset.stopLine)
        const source = ev.target.dataset.source

        if (startLine) {
          this.expandCode(startLine, source, true)
        } else if (stopLine) {
          this.expandCode(stopLine, source, false)
        }

        ev.stopPropagation()
      }
    }, true)

    // set origin / modified model of linenumber fn
    instance.getModifiedEditor().updateOptions({
      lineNumbers: currentLineNumber => this.parseLineNumbers(currentLineNumber, 'modified')
    })

    instance.getOriginalEditor().updateOptions({
      lineNumbers: currentLineNumber => this.parseLineNumbers(currentLineNumber, 'original')
    })

    // set line wrap when configuration changed by diff editor's default action
    // instance.getModifiedEditor().onDidChangeConfiguration((e) => {
    //   if (instance.getModifiedEditor().getRawOptions().wordWrap !== 'on') {
    //     instance.getModifiedEditor().updateOptions({ wordWrap: 'on' })
    //   }
    // })

    // instance.getOriginalEditor().onDidChangeConfiguration((e) => {
    //   if (instance.getOriginalEditor().getRawOptions().wordWrap !== 'on') {
    //     instance.getOriginalEditor().updateOptions({ wordWrap: 'on' })
    //   }
    // })

    // fit container size when scroll changes
    instance.getModifiedEditor().onDidScrollChange((e) => {
      if (e.scrollHeightChanged) {
        this.setState({ editorHeight: this.getEditorScrollHeight(instance) })
      }
    })
    instance.getOriginalEditor().onDidScrollChange((e) => {
      if (e.scrollHeightChanged) {
        this.setState({ editorHeight: this.getEditorScrollHeight(instance) })
      }
    })

    // set diff marker color if exsit
    instance.getModifiedEditor().getModel().onDidChangeContent((e) => {
      const newDecorator = []
      for (let lineIndex = 0; lineIndex < this.state.modified.length; lineIndex++) {
        if (this.state.modified[lineIndex].type === 'marker-diff') {
          newDecorator.push({
            range: new monaco.Range(lineIndex + 1, 1, lineIndex + 1, 1),
            options: { isWholeLine: true, inlineClassName: 'marker-dark' }
          })
        }
      }

      this.cached.modifiedDecorations = instance.getModifiedEditor().deltaDecorations(this.cached.modifiedDecorations, newDecorator)

      // return cursor to the beginning, and no code be selected
      instance.getModifiedEditor().setPosition({ lineNumber: 1, column: 1 })
    })

    instance.getOriginalEditor().getModel().onDidChangeContent((e) => {
      const newDecorator = []
      for (let lineIndex = 0; lineIndex < this.state.original.length; lineIndex++) {
        if (this.state.original[lineIndex].type === 'marker-diff') {
          newDecorator.push({
            range: new monaco.Range(lineIndex + 1, 1, lineIndex + 1, 1),
            options: { isWholeLine: true, inlineClassName: 'marker-dark' }
          })
        }
      }

      this.cached.originalDecorations = instance.getOriginalEditor().deltaDecorations(this.cached.originalDecorations, newDecorator)

      // return cursor to the beginning, and no code be selected
      instance.getOriginalEditor().setPosition({ lineNumber: 1, column: 1 })
    })

    instance.getOriginalEditor().onDidContentSizeChange(e => {
      this.state.editorHeight !== e.contentHeight && this.setState({ editorHeight: e.contentHeight })
    })
  }

  getEditorScrollHeight (instance) {
    let editorHeight = 0
    if (instance) {
      const originalEditorScrollHeight = instance.getOriginalEditor().getScrollHeight()
      const modifiedEditorScrollHeight = instance.getModifiedEditor().getScrollHeight()
      editorHeight = Math.max(originalEditorScrollHeight, modifiedEditorScrollHeight)
    }
    return editorHeight
  }

  getFilContent (callback) {
    RepositoryData.object({
      repository: this.props.repository,
      parent: this.props.fileDiffInfo.modified.sha
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.state.modifiedFullFile = data.data.object && data.data.object.raw ? data.data.object.raw.split('\n') : null
          this.setState({ modifiedFullFile: this.state.modifiedFullFile })
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

  expandCode (actionLineNumber, source, isDirectionDown) {
    if (this.state.modifiedFullFile === null) {
      // a full modified file required
      this.getFilContent(data => {
        this.expandCode(actionLineNumber, source, isDirectionDown)
      })

      return true
    }

    // calculate insert point and insert code
    const insertPoint = { original: null, modified: null }
    const insertCodeData = { startLineNumber: null, code: [] }

    if (source === 'original') {
      // get modified bind
      const originalIndex = isDirectionDown ? actionLineNumber - 1 : actionLineNumber
      const originalItem = this.state.original[originalIndex]

      if (!originalItem || !originalItem.type || !['normal', 'marker-bottom'].includes(originalItem.type)) {
        return true
      }

      const modifiedIndex = this.state.original[originalIndex].bindIndex
      const modifiedItem = this.state.modified[modifiedIndex]

      if (!modifiedItem || !modifiedItem.type || !['normal', 'marker-bottom'].includes(modifiedItem.type)) {
        return true
      }

      insertPoint.original = isDirectionDown ? originalIndex + 1 : originalIndex
      insertPoint.modified = isDirectionDown ? modifiedIndex + 1 : modifiedIndex
      const calculatedStartLineNumber = isDirectionDown ? modifiedItem.lineNumber + 1 : modifiedItem.lineNumber - 20
      insertCodeData.startLineNumber = calculatedStartLineNumber < 1 ? 1 : calculatedStartLineNumber
      insertCodeData.code = this.state.modifiedFullFile.slice(
        insertCodeData.startLineNumber - 1,
        calculatedStartLineNumber + 19
      )
    } else if (source === 'modified') {
      // get original bind
      const modifiedIndex = isDirectionDown ? actionLineNumber - 1 : actionLineNumber
      const modifiedItem = this.state.modified[modifiedIndex]

      if (!modifiedItem || !modifiedItem.type || !['normal', 'marker-bottom'].includes(modifiedItem.type)) {
        return true
      }

      const originalIndex = this.state.modified[modifiedIndex].bindIndex
      const originalItem = this.state.original[originalIndex]

      if (!originalItem || !originalItem.type || !['normal', 'marker-bottom'].includes(originalItem.type)) {
        return true
      }

      insertPoint.original = isDirectionDown ? originalIndex + 1 : originalIndex
      insertPoint.modified = isDirectionDown ? modifiedIndex + 1 : modifiedIndex
      const calculatedStartLineNumber = isDirectionDown ? modifiedItem.lineNumber + 1 : modifiedItem.lineNumber - 20
      insertCodeData.startLineNumber = calculatedStartLineNumber < 1 ? 1 : calculatedStartLineNumber
      insertCodeData.code = this.state.modifiedFullFile.slice(
        insertCodeData.startLineNumber - 1,
        calculatedStartLineNumber + 19
      )
    }

    // insert code at insert point
    if (insertCodeData.code.length > 0) {
      let insertedItemCount = 0
      if (isDirectionDown) {
        // show codes after marker
        const currentOriginalCodeItem = this.state.original[insertPoint.original - 1]
        const currentModifiedCodeItem = this.state.modified[insertPoint.modified - 1]
        currentOriginalCodeItem.type = 'normal'
        currentModifiedCodeItem.type = 'normal'

        let currentModifiedLineNumber = currentModifiedCodeItem.lineNumber + 1
        let currentOriginalLineNumber = currentOriginalCodeItem.lineNumber + 1
        let stopModifiedLineNumber = null
        // search next diff marker
        if (this.state.modified[insertPoint.modified] && this.state.modified[insertPoint.modified].type === 'marker-diff') {
          stopModifiedLineNumber = this.state.modified[insertPoint.modified + 1] && this.state.modified[insertPoint.modified + 1].lineNumber
        } else if (!this.state.modified[insertPoint.modified]) {
          stopModifiedLineNumber = Math.min(currentModifiedLineNumber + 20, this.state.modifiedFullFile.length)
        }

        // insert code into state
        for (let codeIndex = 0; codeIndex < insertCodeData.code.length; codeIndex++) {
          if (currentModifiedLineNumber >= stopModifiedLineNumber) {
            this.state.modified.splice(insertPoint.modified, 1)
            this.state.original.splice(insertPoint.original, 1)
            insertedItemCount--
            break
          }

          this.state.modified.splice(insertPoint.modified, 0, {
            lineNumber: currentModifiedLineNumber,
            content: insertCodeData.code[codeIndex],
            type: (codeIndex === insertCodeData.code.length - 1) ? 'marker-bottom' : 'normal',
            bindIndex: insertPoint.original
          })

          this.state.original.splice(insertPoint.original, 0, {
            lineNumber: currentOriginalLineNumber,
            content: insertCodeData.code[codeIndex],
            type: (codeIndex === insertCodeData.code.length - 1) ? 'marker-bottom' : 'normal',
            bindIndex: insertPoint.modified
          })

          insertPoint.modified++
          insertPoint.original++
          currentModifiedLineNumber++
          currentOriginalLineNumber++
          insertedItemCount++
        }
      } else {
        // show codes brfore marker
        const currentOriginalCodeItem = this.state.original[insertPoint.original]
        const currentModifiedCodeItem = this.state.modified[insertPoint.modified]

        const currentModifiedLineNumber = currentModifiedCodeItem.lineNumber - 1
        const currentOriginalLineNumber = currentOriginalCodeItem.lineNumber - 1
        let stopModifiedLineNumber = null
        // search last bottom marker
        if (this.state.modified[insertPoint.modified - 2] && this.state.modified[insertPoint.modified - 2].type === 'marker-bottom') {
          stopModifiedLineNumber = this.state.modified[insertPoint.modified - 2] && this.state.modified[insertPoint.modified - 2].lineNumber
        } else if (!this.state.modified[insertPoint.modified - 2]) {
          stopModifiedLineNumber = Math.max(currentModifiedLineNumber - 20, 0)
        }

        if (stopModifiedLineNumber >= insertCodeData.startLineNumber || stopModifiedLineNumber === 0) {
          // when stopModifiedLineNumber cannot find, stopModifiedLineNumber will set to 0
          // insert code start line less than last bottom line marker, remove marker and remove bottom line marker
          insertPoint.modified--
          insertPoint.original--
          if (this.state.modified[insertPoint.modified - 1]) {
            this.state.original[insertPoint.original - 1].type = 'normal'
            this.state.modified[insertPoint.modified - 1].type = 'normal'
          }
          this.state.modified.splice(insertPoint.modified, 1)
          this.state.original.splice(insertPoint.original, 1)
          insertedItemCount--

          // trim insertCodeData based on stopModifiedLineNumber
          const trimCount = stopModifiedLineNumber - insertCodeData.startLineNumber + 1
          insertCodeData.startLineNumber -= trimCount
          insertCodeData.code.splice(0, trimCount)
        } else {
          // the marker still exsit, change line number indicator
          this.state.original[insertPoint.original - 1].content = this.state.original[insertPoint.original - 1].content.replace(/^@@\s+-(\d+),(\d+)\s+\+(\d+),(\d+)\s+@@.*$/i, function (match, d1, d2, d3, d4) {
            return '@@ -' + (parseInt(d1) - 20) + ',' + (parseInt(d2) + 20) + ' +' + (parseInt(d3) - 20) + ',' + (parseInt(d4) + 20) + ' @@'
          })
          this.state.modified[insertPoint.modified - 1].content = this.state.modified[insertPoint.modified - 1].content.replace(/^@@\s+-(\d+),(\d+)\s+\+(\d+),(\d+)\s+@@.*$/i, function (match, d1, d2, d3, d4) {
            return '@@ -' + (parseInt(d1) - 20) + ',' + (parseInt(d2) + 20) + ' +' + (parseInt(d3) - 20) + ',' + (parseInt(d4) + 20) + ' @@'
          })
        }

        for (let codeIndex = 0; codeIndex < insertCodeData.code.length; codeIndex++) {
          this.state.modified.splice(insertPoint.modified, 0, {
            lineNumber: currentModifiedLineNumber - (insertCodeData.code.length - 1 - codeIndex),
            content: insertCodeData.code[codeIndex],
            type: 'normal',
            bindIndex: insertPoint.original
          })

          this.state.original.splice(insertPoint.original, 0, {
            lineNumber: currentOriginalLineNumber - (insertCodeData.code.length - 1 - codeIndex),
            content: insertCodeData.code[codeIndex],
            type: 'normal',
            bindIndex: insertPoint.modified
          })

          insertPoint.modified++
          insertPoint.original++
          // currentModifiedLineNumber++
          // currentOriginalLineNumber++
          insertedItemCount++
        }
      }

      // fix bindIndex after insert
      if (insertedItemCount !== 0) {
        for (let codeIndex = insertPoint.original; codeIndex < this.state.original.length; codeIndex++) {
          if (this.state.original[codeIndex].bindIndex) {
            this.state.original[codeIndex].bindIndex += insertedItemCount
          }
        }

        for (let codeIndex = insertPoint.modified; codeIndex < this.state.modified.length; codeIndex++) {
          if (this.state.modified[codeIndex].bindIndex) {
            this.state.modified[codeIndex].bindIndex += insertedItemCount
          }
        }
      }

      this.setState({ original: [...this.state.original], modified: [...this.state.modified] })
    }
  }

  getCodeFromModel (model) {
    const tmpArray = []
    for (let modelIndex = 0; modelIndex < model.length; modelIndex++) {
      tmpArray.push(model[modelIndex].content)
    }

    return tmpArray.join('\n')
  }

  parseLineNumbers (currentLineNumber, modelName) {
    const peerMapping = { original: 'modified', modified: 'original' }
    const currentLineIndex = currentLineNumber - 1
    const currentLineItem = this.state[modelName][currentLineIndex]
    if (this.state[modelName].length > 0 && currentLineItem) {
      if (currentLineItem.type === 'marker-diff') {
        const currentCodeItem = this.state[modelName][currentLineIndex + 1]
        if (currentCodeItem && currentCodeItem.type === 'normal') {
          const peerCodeItem = this.state[peerMapping[modelName]][currentCodeItem.bindIndex]
          const prevPeerCodeItem = this.state[peerMapping[modelName]][currentCodeItem.bindIndex - 1]
          if (peerCodeItem && currentCodeItem.type === 'normal' && prevPeerCodeItem && prevPeerCodeItem.type === 'marker-diff') {
            return '<a class="marker-dark-clickable" role="action-show-omit" data-source="' + modelName + '" data-stop-line="' + currentLineNumber + '">...</a>'
          }
        }
      } else if (currentLineItem.type === 'marker-bottom') {
        const currentCodeItem = this.state[modelName][currentLineIndex - 1]
        if (currentCodeItem && currentCodeItem.type === 'normal') {
          const peerCodeItem = this.state[peerMapping[modelName]][currentCodeItem.bindIndex]
          const nextPeerCodeItem = this.state[peerMapping[modelName]][currentCodeItem.bindIndex + 1]
          if (peerCodeItem && currentCodeItem.type === 'normal' && nextPeerCodeItem && nextPeerCodeItem.type === 'marker-bottom') {
            return '<a class="marker-dark-clickable" role="action-show-omit" data-source="' + modelName + '" data-start-line="' + currentLineNumber + '">...</a>'
          }
        }
      }
      return currentLineItem.lineNumber
    }
    return '-'
  }

  render () {
    const { renderSideBySide } = this.props
    const defaultOptions = {
      renderSideBySide: renderSideBySide,
      selectOnLineNumbers: false,
      scrollbar: {
        // handleMouseWheel: false,
        alwaysConsumeMouseWheel: false
      },
      renderIndicators: true,
      hideCursorInOverviewRuler: true,
      scrollBeyondLastLine: false,
      readOnly: true,

      // control options (disable editor feature)
      showUnused: false
    }

    const { fileDiffInfo } = this.props

    return (<Grid container spacing={2}>
      <Grid item xs={12} className={this.props.classes.diff}>
        { fileDiffInfo && fileDiffInfo.diff && (typeof fileDiffInfo.diff.raw === 'string') && <MonacoDiffEditor
          height={this.state.editorHeight}
          value={this.getCodeFromModel(this.state.modified)}
          original={this.getCodeFromModel(this.state.original)}
          options={defaultOptions}
          theme='vs'
          language={getCodeLanguageType(fileDiffInfo.modified.name || fileDiffInfo.original.name || '')}
          editorDidMount={(instance, monaco) => this.initMonacoEditor(instance, monaco)}
        />
        }
      </Grid>
    </Grid>
    )
  }
}

FileDiffViewer.propTypes = {
  intl: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  repository: PropTypes.string.isRequired,
  fileDiffInfo: PropTypes.object.isRequired,
  showFullFile: PropTypes.bool,
  renderSideBySide: PropTypes.bool,
  layoutUpdateTimeStamp: PropTypes.number,
  classes: PropTypes.object.isRequired,
  expandStatus: PropTypes.bool.isRequired
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
      connect(mapStateToProps, mapDispatchToProps)(FileDiffViewer)
    )
  )
)
