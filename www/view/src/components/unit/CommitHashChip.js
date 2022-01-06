import React, { Component } from 'react'
import PropTypes from 'prop-types'

// component
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import { plCopy } from '@pgyer/icons'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// style
const styles = theme => ({
  disabledBtn: {
    '&:disabled': {
      color: theme.palette.text.main,
      border: '1px solid ' + theme.palette.border
    }
  },
  icon: {
    color: theme.palette.primary.main,
    border: '1px solid ' + theme.palette.border,
    borderLeft: '0px',
    borderRadius: '0px 4px 4px 0px'
  }
})

class CommitHashChip extends Component {
  constructor (props) {
    super(props)
    this.state = {
      copyHash: 'label.copyHash'
    }
  }

  copyHash () {
    const dom = window.document.createElement('input')
    dom.setAttribute('value', this.props.hash)
    dom.setAttribute('type', 'text')
    window.document.body.appendChild(dom)
    dom.select()
    document.execCommand('Copy')
    window.document.body.removeChild(dom)
    this.setState({ copyHash: 'label.copied' })
  }

  render () {
    const { hash, classes } = this.props
    const { copyHash } = this.state
    return (
      <ButtonGroup aria-label='outlined button group'>
        <Button disabled id='hashValue' className={classes.disabledBtn}>{ hash }</Button>
        <SquareIconButton label={copyHash} icon={plCopy} className={classes.icon}
          onClick={e => this.copyHash(e)}
          onMouseLeave={() => {
            window.setTimeout(() => this.setState({ copyHash: 'label.copyHash' }), 150)
          }}
        />
      </ButtonGroup>
    )
  }
}

CommitHashChip.propTypes = {
  hash: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired
}

export default injectIntl(
  withStyles(styles)(
    CommitHashChip
  )
)
