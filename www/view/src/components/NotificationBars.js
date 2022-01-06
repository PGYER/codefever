// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import NotificationBar from '@pgyer/essential-component/NotificationBar'

class NotificationBars extends React.Component {
  constructor () {
    super()
    this.messageLists = []
  }

  componentDidMount () {
    this.messageLists = []
  }

  addMessage (message) {
    if (message.message) {
      const currentIndex = this.messageLists.length
      this.messageLists.push({ ...message, openStatus: true })
      setTimeout(() => { this.closeMessage(currentIndex) }, 5000)
    }
  }

  closeMessage (index) {
    this.messageLists[index].openStatus = false
    this.props.dispatchEvent({ type: 'notification.message.change' })
    setTimeout(() => {
      if (!this.messageLists.reduce((result, message) => (result || message.openStatus), false)) {
        this.messageLists = []
      }
    }, 200)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.notificationBody === this.props.notificationBody) {
      return false
    }
    return true
  }

  render () {
    const { notificationBody } = this.props
    this.addMessage(notificationBody)

    let offset = 0
    return this.messageLists.map(
      (message, index) => {
        offset += message.openStatus ? 1 : 0
        return (<NotificationBar key={index}
          level={message.level}
          offset={offset > 0 ? offset - 1 : 0}
          open={message.openStatus}
          onClose={(ev, reason) => (reason === 'timeout' && this.closeMessage(index))}
          action={message.action}
          message={message.message}
        />)
      }
    )
  }
}

NotificationBars.propTypes = {
  notificationBody: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    notificationBody: state.NotificationStates.notificationBody
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationBars)
