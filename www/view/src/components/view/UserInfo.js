// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles } from '@material-ui/core/styles'

// components
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import SetEmail from 'APPSRC/components/view/unit/SetEmail'
import SetUserInfo from 'APPSRC/components/view/unit/SetUserInfo'
import UserData from 'APPSRC/data_providers/UserData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'

const styles = (theme) => ({
  infoWrap: {
    padding: '20px 30px 60px 30px',
    marginTop: 20
  }
})

class UserInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.updateAllInfo = this.updateAllInfo.bind(this)
  }

  updateAllInfo (cb) {
    UserData.getUserInfo()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentUserInfo.update', data: data.data })
          typeof cb === 'function' && cb()
        }
      })
  }

  render () {
    const { classes, currentUserInfo, intl } = this.props
    return (
      <div>
        <Typography variant='subtitle1' gutterBottom>{intl.formatMessage({ id: 'label.settings' })}</Typography>

        <Paper className={classes.infoWrap}>
          <Typography variant='subtitle1' gutterBottom>{intl.formatMessage({ id: 'label.profile' })}</Typography>
          <div className='mt30' />
          {'u_key' in currentUserInfo ? <SetUserInfo comData={{ field: 'name', label: 'label.userName' }} currentUserInfo={currentUserInfo} update={this.updateAllInfo} /> : ''}
          <div className='mt30' />
          {'u_key' in currentUserInfo ? <SetEmail currentUserInfo={currentUserInfo} update={this.updateAllInfo} /> : ''}
          <div className='mt30' />
          <Typography variant='subtitle2' gutterBottom>{intl.formatMessage({ id: 'label.loginCredential' })}</Typography>
          <div className='mt30' />
          {'u_key' in currentUserInfo ? <SetUserInfo comData={{ field: 'company', label: 'label.company' }} currentUserInfo={currentUserInfo} update={this.updateAllInfo} /> : ''}
          <div className='mt30' />
          {'u_key' in currentUserInfo ? <SetUserInfo comData={{ field: 'job', label: 'label.job' }} currentUserInfo={currentUserInfo} update={this.updateAllInfo} /> : ''}
        </Paper>
      </div>
    )
  }
}

UserInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(UserInfo)
  )
)
