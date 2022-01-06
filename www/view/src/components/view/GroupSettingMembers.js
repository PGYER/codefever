// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

// components
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import GroupData from 'APPSRC/data_providers/GroupData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import CircularProgress from '@material-ui/core/CircularProgress'

import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import MemberList from 'APPSRC/components/unit/MemberList'
import { injectIntl } from 'react-intl'

const styles = (theme) => ({
  btn: {
    marginRight: theme.spacing(2)
  },
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  marginBottom: {
    marginBottom: theme.spacing(4)
  }
})

class GroupSettingMembers extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      groupConfig: {},
      email: '',
      error: {}
    }

    this.mountedFlag = false

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'email',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'email',
        passPattern: /^.+@[^.]+\..+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'email',
        exceptionCode: 0x0407,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_notFound' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'email',
        exceptionCode: 0x0408,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.canNotAddCreatorAsMember' }
        )
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.email !== nextState.email && nextState.email.length === 0) {
      this.setState({
        error: {}
      })
      return false
    }
    return true
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  addMembers () {
    if (!this.checkInput()) {
      return true
    }

    const data = {
      group: this.props.currentGroupConfig.group.id,
      email: this.state.email
    }

    this.setState({ pending: true })
    GroupData.addMember(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({ pending: false, email: '' })
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.Added' })
            , 0)
          )
          this.reloadGroupData()
        } else if (!this.checkResponse(data.code)) {
          this.setState({ pending: false })
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.AddFail' })
            , 2)
          )
          this.setState({ pending: false })
        }
      })

    return true
  }

  changeMemberRole (gKey, uKey, roleID) {
    const data = {
      group: gKey,
      userID: uKey,
      roleID
    }

    GroupData.changeMemberRole(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.updated' })
            , 0)
          )
          this.reloadGroupData()
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.updateFail' })
            , 2)
          )
        }
      })
  }

  removeMember (gKey, uKey) {
    const data = {
      group: gKey,
      userID: uKey
    }

    GroupData.removeMember(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.removed' })
            , 0)
          )
          this.reloadGroupData()
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.removeFail' })
            , 2)
          )
        }
      })
  }

  reloadGroupData () {
    RepositoryData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.repositoryList.update', data: data.data })
        }
      })

    GroupData.config({ gKey: this.props.currentGroupConfig.group.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: data.data })
        }
      })
  }

  render () {
    const { currentGroupConfig, classes, intl } = this.props

    return (<Grid container>
      <Grid container justifyContent='flex-end' className={classes.marginBottom}>
        <Grid item xs={3}>
          <TextField
            fullWidth
            value={this.state.email}
            error={!!this.state.error.email}
            helperText={this.state.error.email}
            onChange={e => this.setState({ email: e.target.value })}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                this.addMembers()
              }
            }}
            variant='outlined'
            placeholder={intl.formatMessage({ id: 'message.plsInputInvitedEmail' })}
          />
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            color='primary'
            disableElevation
            onClick={e => this.addMembers()}
            disabled={this.state.pending}
          >
            { this.state.pending
              ? [<CircularProgress size='1rem' color='inherit' />, ' ']
              : ''
            }
            {intl.formatMessage({ id: 'label.inviteMember' })}
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        { currentGroupConfig.group
          ? <Grid item xs={12}>
            <MemberList
              currentConfig={currentGroupConfig}
              changeMemberRole={(e, e1, e2) => this.changeMemberRole(e, e1, e2)}
              removeMember={(e, e1) => this.removeMember(e, e1)}
              isRepository={Boolean(false)}
              groupMember={Boolean(true)}
            />
          </Grid>
          : <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        }
      </Grid>
    </Grid>)
  }
}

GroupSettingMembers.propTypes = {
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentGroupConfig: state.DataStore.currentGroupConfig
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
      connect(mapStateToProps, mapDispatchToProps)(GroupSettingMembers)
    )
  )
)
