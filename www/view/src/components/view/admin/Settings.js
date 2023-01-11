// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import UserData from 'APPSRC/data_providers/UserData'
import AdminData from 'APPSRC/data_providers/AdminData'
// import Constants from 'APPSRC/config/Constants'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2)
  }
})

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.mountedFlag = false
    this.state = {
      allowRegister: false,
      host: '',
      ssh: '',
      email_from: '',
      email_name: '',
      pending: true,
      error: {}
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'host',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.url' }) }
        )
      },
      {
        name: 'host',
        passPattern: /^http(s)?:\/\/[^/]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.urlPrefix' }) }
        )
      },
      {
        name: 'ssh',
        passPattern: /^[^@]+@.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.sshPrefix' }) }
        )
      },
      {
        name: 'email_name',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.name' }) }
        )
      },
      {
        name: 'email_from',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'email_from',
        passPattern: /^[^@]+@[^@]+\.[^@]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
    this.getData()
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  getData () {
    this.setState({ pending: true })
    AdminData.getConfig()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            pending: false,
            host: data.data.host,
            ssh: data.data.ssh,
            allowRegister: data.data.allowRegister,
            email_from: data.data.email.from,
            email_name: data.data.email.name
          })
        }
      })
  }

  updateConfig () {
    if (!this.checkInput()) {
      return false
    }

    const data = {
      host: this.state.host,
      ssh: this.state.ssh,
      allowRegister: this.state.allowRegister,
      email: { name: this.state.email_name, from: this.state.email_from }
    }

    const payload = {
      data: JSON.stringify(data)
    }

    this.setState({ pending: true })
    AdminData.setConfig(payload)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ pending: false })
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.updated' }), 0))
          this.getData()
          this.reloadUserData()
        }
      })
  }

  reloadUserData () {
    UserData.getUserInfo()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentUserInfo.update', data: data.data })
        }
      })
  }

  render () {
    const { classes, intl } = this.props

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.setting' }) }</Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h6' component='div' gutterBottom> {intl.formatMessage({ id: 'label.host' })} </Typography>
            </Grid>
            <Grid item xs={12} mg={9} lg={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom> {intl.formatMessage({ id: 'label.urlPrefix' })} </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    value={this.state.host}
                    error={!!this.state.error.host}
                    helperText={this.state.error.host}
                    placeholder={intl.formatMessage({ id: 'label.urlPrefix' })}
                    onChange={e => this.setState({ host: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom> {intl.formatMessage({ id: 'label.sshPrefix' })} </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    value={this.state.ssh}
                    error={!!this.state.error.ssh}
                    helperText={this.state.error.ssh}
                    placeholder={intl.formatMessage({ id: 'label.sshPrefix' })}
                    onChange={e => this.setState({ ssh: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>&nbsp;</Grid>
            <Grid item xs={12}>
              <Typography variant='h6' component='div' gutterBottom> SMTP </Typography>
            </Grid>
            <Grid item xs={12} mg={9} lg={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom> {intl.formatMessage({ id: 'label.senderName' })} </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    value={this.state.email_name}
                    error={!!this.state.error.email_name}
                    helperText={this.state.error.email_name}
                    placeholder={intl.formatMessage({ id: 'label.name' })}
                    onChange={e => this.setState({ email_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom> {intl.formatMessage({ id: 'label.senderAddress' })} </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    value={this.state.email_from}
                    error={!!this.state.error.email_from}
                    helperText={this.state.error.email_from}
                    placeholder={intl.formatMessage({ id: 'label.email' })}
                    onChange={e => this.setState({ email_from: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>&nbsp;</Grid>
            <Grid item xs={12}>
              <Typography variant='h6' component='div' gutterBottom> {intl.formatMessage({ id: 'label.register' })} </Typography>
            </Grid>
            <Grid item xs={12} mg={9} lg={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom> {intl.formatMessage({ id: 'label.allowRegister' })} </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Switch
                    checked={this.state.allowRegister}
                    onChange={() => { this.setState({ allowRegister: !this.state.allowRegister }) }}
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Button variant='contained' color='primary' disabled={this.state.pending} onClick={() => this.updateConfig()}>{intl.formatMessage({ id: 'label.save' })}</Button>
      </Grid>
    </Grid>)
  }
}

Settings.propTypes = {
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
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
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(Settings)
    )
  )
)
