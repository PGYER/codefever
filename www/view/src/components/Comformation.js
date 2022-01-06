// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'

// components
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import CircularProgress from '@material-ui/core/CircularProgress'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

class Comformation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false
    }
    this.observed = {
      openStatus: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.observed.openStatus !== nextProps.openStatus) {
      this.observed.openStatus = nextProps.openStatus
      this.setState({ loading: false })
      this.props.dispatchEvent(EventGenerator.consumeComformation())
    }
    if (this.observed.eventCount !== nextProps.eventCount) {
      this.props.dispatchEvent(EventGenerator.consumeComformation())
    }
    return true
  }

  onCancel (ev) {
    this.props.rejectFn && this.props.rejectFn()
    this.props.dispatchEvent(EventGenerator.cancelComformation())
  }

  onAccept (ev) {
    this.setState({ loading: true })
    this.props.acceptFn && this.props.acceptFn()
  }

  render () {
    const { openStatus, title, description, intl } = this.props
    return (
      <Dialog
        open={openStatus}
        onClose={ev => this.onCancel(ev)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='default' onClick={ev => this.onCancel(ev)}>{intl.formatMessage({ id: 'label.cancel' })}</Button>
          <Button color='primary' onClick={ev => this.onAccept(ev)}>{this.state.loading ? <CircularProgress size={24} /> : intl.formatMessage({ id: 'label.ok' })}</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

Comformation.propTypes = {
  openStatus: PropTypes.bool.isRequired,
  eventCount: PropTypes.number.isRequired,
  title: PropTypes.any,
  description: PropTypes.any,
  acceptFn: PropTypes.func,
  rejectFn: PropTypes.func,
  dispatchEvent: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    openStatus: state.NotificationStates.confirmation.open,
    eventCount: state.NotificationStates.confirmation.eventCount,
    title: state.NotificationStates.confirmation.title,
    description: state.NotificationStates.confirmation.description,
    acceptFn: state.NotificationStates.confirmation.accept,
    rejectFn: state.NotificationStates.confirmation.reject
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Comformation)
  )
)
