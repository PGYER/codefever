// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'
import { diffChars } from 'diff/lib'

// style
const styles = theme => ({
  addition: {
    backgroundColor: theme.palette.background.additionDarker
  },
  deletion: {
    backgroundColor: theme.palette.background.deletionDarker
  }
})

class CodeLine extends React.Component {
  constructor (props) {
    super(props)
    this.code = React.createRef()
  }

  componentDidMount () {
    this.refreshCodeLine()
  }

  componentDidUpdate () {
    this.refreshCodeLine()
  }

  refreshCodeLine () {
    if (typeof this.props.htmlCode === 'string') {
      const fragment = document.createElement('span')
      fragment.innerHTML = this.props.htmlCode

      if (typeof this.props.original === 'string') {
        // diff node, highlight adds
        const diff = diffChars(this.props.original, this.props.code)
        let currentPosition = 0
        const offsets = []
        for (let index = 0; index < diff.length; index++) {
          if (!diff[index].added && !diff[index].removed) {
            currentPosition += diff[index].count
          } else if (diff[index].added) {
            for (let offset = 0; offset < diff[index].count; offset++) {
              offsets.push(currentPosition)
              currentPosition++
            }
          }
        }
        this.highlightWord(fragment, this.props.classes.addition, offsets)
      } else if (typeof this.props.modified === 'string') {
        // diff node, highlight removes
        const diff = diffChars(this.props.code, this.props.modified)
        let currentPosition = 0
        const offsets = []
        for (let index = 0; index < diff.length; index++) {
          if (!diff[index].added && !diff[index].removed) {
            currentPosition += diff[index].count
          } else if (diff[index].removed) {
            for (let offset = 0; offset < diff[index].count; offset++) {
              offsets.push(currentPosition)
              currentPosition++
            }
          }
        }
        this.highlightWord(fragment, this.props.classes.deletion, offsets)
      }

      this.code.current.innerHTML = fragment.innerHTML
    }
  }

  highlightWord (fragment, className, offsets) {
    let rangeDom = null
    let rangeStart = null
    let rangeEnd = null

    for (let index = 0; index < offsets.length; index++) {
      const findRangeOffset = this.findOffset(fragment, offsets[index])

      if (!rangeDom) {
        rangeDom = findRangeOffset[0]
        rangeStart = findRangeOffset[1]
        rangeEnd = findRangeOffset[1] - 1
      }

      if (rangeDom !== findRangeOffset[0]) {
        this.highlight(rangeDom, className, rangeStart, rangeEnd)
        rangeDom = null
        index--
        continue
      } else {
        if (findRangeOffset[1] !== rangeEnd + 1) {
          this.highlight(rangeDom, className, rangeStart, rangeEnd)
          rangeDom = null
          index--
          continue
        }
      }

      rangeEnd = findRangeOffset[1]
    }

    if (rangeDom) {
      this.highlight(rangeDom, className, rangeStart, rangeEnd)
    }

    return true
  }

  highlight (targetDom, className, start, end) {
    const range = document.createRange()
    const mark = document.createElement('span')
    mark.className = className
    range.setStart(targetDom, start)
    range.setEnd(targetDom, end + 1)
    range.surroundContents(mark)
  }

  findOffset (parentNode, relativeOffset) {
    let currentOffset = 0
    for (let index = 0; index < parentNode.childNodes.length; index++) {
      const node = parentNode.childNodes.item(index)
      if (node.nodeName === '#text') {
        const contentLength = node.length
        if (relativeOffset - currentOffset >= contentLength) {
          currentOffset += contentLength
          continue
        } else {
          return [node, relativeOffset - currentOffset]
        }
      } else {
        const contentLength = node.innerText.length
        if (relativeOffset - currentOffset >= contentLength) {
          currentOffset += contentLength
          continue
        } else {
          return this.findOffset(node, relativeOffset - currentOffset)
        }
      }
    }
  }

  render () {
    return <pre>
      <code ref={this.code}>
        {this.props.code}
      </code>
    </pre>
  }
}

CodeLine.propTypes = {
  classes: PropTypes.object.isRequired,
  code: PropTypes.string.isRequired,
  original: PropTypes.string,
  modified: PropTypes.string,
  htmlCode: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(CodeLine)
    )
  )
)
