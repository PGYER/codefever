// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import AvatarUploader from 'APPSRC/components/unit/AvatarUploader'
import UserData from 'APPSRC/data_providers/UserData'
import Constants from 'APPSRC/config/Constants'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = (theme) => ({
  header: {
    lineHeight: theme.spacing(5) + 'px',
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px',
    marginTop: theme.spacing(4)
  },
  mainMarginTop: {
    marginTop: theme.spacing(3)
  },
  mainMarginBottom: {
    marginBottom: theme.spacing(1)
  },
  noMarginTop: {
    marginTop: 'unset'
  },
  title: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1)
  },
  pl: {
    paddingLeft: theme.spacing(4) + 'px !important'
  },
  btn: {
    color: theme.palette.primary.main,
    cursor: 'pointer'
  },
  paper: {
    paddingBottom: theme.spacing(10)
  },
  fold: {
    fontWeight: 500
  },
  flexRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  flexRowCenter: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    padding: theme.spacing(1.5) + 'px ' + theme.spacing(1) + 'px',
    marginLeft: theme.spacing(4)
  },
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  }
})

class UserSettingGeneral extends React.Component {
  constructor (props) {
    super(props)
    this.updateUserInfo = this.updateUserInfo.bind(this)
    this.mountedFlag = false
    const { currentUserInfo } = this.props
    this.state = {
      name: currentUserInfo.name || '',
      email: currentUserInfo.email || '',
      team: currentUserInfo.team || '',
      role: currentUserInfo.role || '',
      oldPassword: '',
      newPassword: '',
      againPassword: '',
      mfaMode: 0, // 0 = options, 1 = settings
      mfaQRCodeData: '',
      mfaSecret: '',
      mfaCode1: '',
      mfaCode2: '',
      error: {}
    }

    this.checkBaseInfo = ValidatorGenerator.stateValidator(this, [
      {
        name: 'name',
        passPattern: /^\S+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.userName' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.{2,50}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 2, n2: 50 }
        )
      },
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
        passPattern: /^[^@]+@[^@]+\.[^@]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'team',
        passPattern: /^.{0,50}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 50 }
        )
      },
      {
        name: 'role',
        passPattern: /^.{0,50}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 50 }
        )
      }
    ])

    this.checkBaseResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'data',
        exceptionCode: 0x0405,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.updateFail' }
        )
      }
    ])

    this.checkPWDResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'oldPassword',
        exceptionCode: 0x0410,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.password' }) }
        )
      }
    ])

    this.checkMFAInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'mfaCode1',
        passPattern: /^\d{6}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.mfaCode' }) }
        )
      },
      {
        name: 'mfaCode2',
        passPattern: /^\d{6}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.mfaCode' }) }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'mfaCode1',
        exceptionCode: 0x0411,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.mfaCode' }) }
        )
      },
      {
        name: 'mfaCode2',
        exceptionCode: 0x0412,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.mfaCode' }) }
        )
      }
    ])
  }

  checkPWDInput () {
    const validateArr = [
      {
        name: 'oldPassword',
        passPattern: /^.{6,}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.oldPassword' }) }
        )
      },
      {
        name: 'newPassword',
        passPattern: /^.{6,50}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 6, n2: 50 }
        )
      },
      {
        name: 'againPassword',
        passPattern: new RegExp('^' + this.state.newPassword + '$'),
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.inputNotSame' }
        )
      }
    ]
    return ValidatorGenerator.stateValidator(this, validateArr)()
  }

  componentDidMount () {
    this.mountedFlag = true
    this.updateUserInfo()
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.currentUserInfo.name !== nextProps.currentUserInfo.name ||
        this.props.currentUserInfo.email !== nextProps.currentUserInfo.email ||
        this.props.currentUserInfo.team !== nextProps.currentUserInfo.team ||
        this.props.currentUserInfo.role !== nextProps.currentUserInfo.role
    ) {
      this.setState({
        name: nextProps.currentUserInfo.name || '',
        email: nextProps.currentUserInfo.email || '',
        team: nextProps.currentUserInfo.team || '',
        role: nextProps.currentUserInfo.role || ''
      })
    }

    return true
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  avatarUploaded (data) {
    if (!data.code) {
      this.props.dispatchEvent(EventGenerator.NewNotification(
        this.props.intl.formatMessage({ id: 'message.updated' })
        , 0)
      )
      this.updateUserInfo()
    }
  }

  updateUserInfo () {
    UserData.getUserInfo()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentUserInfo.update', data: data.data })
          if (!data.data.mfaEnabled) {
            this.prepareMFADeviceSetup()
          }
        }
      })
  }

  updateBasicInfo () {
    if (!this.checkBaseInfo()) {
      return false
    }

    UserData.updateBasicInfo({
      name: this.state.name,
      email: this.state.email,
      team: this.state.team,
      role: this.state.role
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((result) => {
        if (!result.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.updated' }), 0))
          this.updateUserInfo()
        } else if (!this.checkBaseResponse(result.code)) {
          return false
        }
      })
  }

  updatePassword () {
    const { oldPassword, newPassword } = this.state
    if (!this.checkPWDInput()) {
      return false
    }

    UserData.updatePassword({
      current: oldPassword,
      new: newPassword
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.updated' }), 0))
          this.updateUserInfo()
          this.clearPWD()
        } else if (!this.checkPWDResponse(data.code)) {
          return false
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.error.updateFail' }), 2))
        }
      })
  }

  clearPWD () {
    this.setState({
      oldPassword: '',
      newPassword: '',
      againPassword: ''
    })
  }

  prepareMFADeviceSetup () {
    this.setState({ MFAPending: true })
    UserData.getMFAData()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ MFAPending: false })
        if (data && !data.code && data.data) {
          this.setState({
            mfaMode: 1,
            mfaQRCodeData: data.data.image,
            mfaSecret: data.data.secret,
            mfaCode1: '',
            mfaCode2: ''
          })
        }
      })
  }

  revokeMFADevice () {
    this.setState({ MFAPending: true })
    UserData.revokeMFAData()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ MFAPending: false })
        if (data && !data.code && data.data) {
          this.updateUserInfo()
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.removed' }), 0))
        }
      })
  }

  updateMFADevice () {
    if (!this.checkMFAInput()) {
      return false
    }

    if (this.state.mfaCode1 === this.state.mfaCode2) {
      this.setState({
        error: {
          ...this.state.error,
          mfaCode2: this.props.intl.formatMessage({ id: 'message.error.inputSame' })
        }
      })
      return false
    }

    this.setState({ MFAPending: true })
    UserData.updateMFAData({
      secret: this.state.mfaSecret,
      code1: this.state.mfaCode1,
      code2: this.state.mfaCode2
    })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ MFAPending: false })
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.updated' }), 0))
          this.setState({
            mfaMode: 0,
            mfaSecret: '',
            mfaCode1: '',
            mfaCode2: ''
          })
          this.updateUserInfo()
        } else if (!this.checkResponse(data.code)) {
          return false
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.error.updateFail' }), 2))
        }
      })
  }

  render () {
    const { currentUserInfo, classes, intl } = this.props

    return (<Grid container spacing={2} className={classes.paper}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom className={[classes.header, classes.noMarginTop].join(' ')}>{ intl.formatMessage({ id: 'menu.profile' }) }</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12} sm={5}>
            <Grid item xs={10} className={classes.mainMarginBottom}>
              <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.userName' }) }</Typography>
            </Grid>
            <Grid item xs={10}>
              <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.userName' }) })}
                  value={this.state.name}
                  error={!!this.state.error.name}
                  helperText={this.state.error.name}
                  onChange={(e) => {
                    const name = e.target.value
                    const error = {}
                    this.setState({ name, error })
                  }}
                />
            </Grid>
            <Grid item xs={10} className={classes.title}>
              <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.email' }) }</Typography>
            </Grid>
            <Grid item xs={10}>
              <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.email' }) })}
                  value={this.state.email}
                  error={!!this.state.error.email}
                  helperText={this.state.error.email}
                  onChange={(e) => {
                    const email = e.target.value
                    const error = {}
                    this.setState({ email, error })
                  }}
                />
            </Grid>
            <Grid item xs={10} className={classes.title}>
              <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.team' }) }</Typography>
            </Grid>
            <Grid item xs={10}>
              <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.team' }) })}
                  value={this.state.team}
                  error={!!this.state.error.team}
                  helperText={this.state.error.team}
                  onChange={(e) => {
                    const team = e.target.value
                    const error = {}
                    this.setState({ team, error })
                  }}
                />
            </Grid>
            <Grid item xs={10} className={classes.title}>
              <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.role' }) }</Typography>
            </Grid>
            <Grid item xs={10}>
              <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.role' }) })}
                  value={this.state.role}
                  error={!!this.state.error.role}
                  helperText={this.state.error.role}
                  onChange={(e) => {
                    const role = e.target.value
                    const error = {}
                    this.setState({ role, error })
                  }}
                />
            </Grid>

            <Grid item xs={10} className={classes.mainMarginTop}>
              <Button variant='contained' color='primary' disabled={this.state.pending} onClick={() => this.updateBasicInfo()}>{intl.formatMessage({ id: 'label.save' })}</Button>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={7}>
            <Grid item xs={10} className={classes.mainMarginBottom}>
              <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.userAvatar' }) }</Typography>
            </Grid>
            <Grid item xs={10}>
              <AvatarUploader
                name='avatar'
                variant='circular'
                appendData={{}}
                src={Constants.HOSTS.PGYER_AVATAR_HOST + currentUserInfo.icon}
                onUpdate={data => this.avatarUploaded(data)}
                dataProvider={UserData.uploadAvatar}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom className={classes.header}>{ intl.formatMessage({ id: 'label.security' }) }</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12} sm={5}>
              <Grid item xs={10} className={classes.mainMarginBottom}>
                <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.oldPassword' }) }</Typography>
              </Grid>
              <Grid item xs={10}>
                <TextField
                    fullWidth
                    type='password'
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.oldPassword' }) })}
                    value={this.state.oldPassword}
                    error={!!this.state.error.oldPassword}
                    helperText={this.state.error.oldPassword}
                    onChange={(e) => {
                      const oldPassword = e.target.value
                      const error = {}
                      this.setState({ oldPassword, error })
                    }}
                  />
              </Grid>
              <Grid item xs={10} className={classes.title}>
                <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.newPassword' }) }</Typography>
              </Grid>
              <Grid item xs={10}>
                <TextField
                    fullWidth
                    type='password'
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.newPassword' }) })}
                    value={this.state.newPassword}
                    error={!!this.state.error.newPassword}
                    helperText={this.state.error.newPassword}
                    onChange={(e) => {
                      const newPassword = e.target.value
                      const error = {}
                      this.setState({ newPassword, error })
                    }}
                  />
              </Grid>
              <Grid item xs={10} className={classes.title}>
                <Typography variant='body1' component='div' className={classes.fold}>{ intl.formatMessage({ id: 'label.newPasswordConfirm' }) }</Typography>
              </Grid>
              <Grid item xs={10}>
                <TextField
                    fullWidth
                    type='password'
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_retype' }, { s: intl.formatMessage({ id: 'label.newPassword' }) })}
                    value={this.state.againPassword}
                    error={!!this.state.error.againPassword}
                    helperText={this.state.error.againPassword}
                    onChange={(e) => {
                      const againPassword = e.target.value
                      const error = {}
                      this.setState({ againPassword, error })
                    }}
                  />
              </Grid>
              <Grid item xs={10} className={classes.mainMarginTop}>
                <Button variant='contained' color='primary' disabled={this.state.pending} onClick={() => this.updatePassword()}>{intl.formatMessage({ id: 'label.save' })}</Button>
              </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom className={classes.header}>{ intl.formatMessage({ id: 'label.twoFactorAuthentication' }) }</Typography>
      </Grid>
      <Grid item xs={12} sm={8} />
      { (this.state.mfaMode === 0 && currentUserInfo.mfaEnabled) && <Grid item xs={5}>
          <Button variant='outlined' color='primary' className={classes.btn} disabled={this.state.MFAPending} onClick={() => this.prepareMFADeviceSetup()}>{intl.formatMessage({ id: 'label.changeMFADevice' })}</Button>
          &nbsp;&nbsp;
          <Button variant='contained' color='primary' disabled={this.state.MFAPending} onClick={() => this.revokeMFADevice()}>{intl.formatMessage({ id: 'label.removeMFADevice' })}</Button>
        </Grid> }
      { (this.state.mfaMode === 1 || !currentUserInfo.mfaEnabled) && <React.Fragment>
        <Grid item xs={7}>
          <Typography variant='body2' component='div' gutterBottom>{intl.formatMessage({ id: 'message.mfaGuide' })}</Typography>
        </Grid>
        <Grid item xs={12}>
          {this.state.MFAPending
            ? <CircularProgress />
            : <img width={150} height={150} src={this.state.mfaQRCodeData} />}
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField
            fullWidth
            variant='outlined'
            value={this.state.mfaCode1}
            error={!!this.state.error.mfaCode1}
            helperText={this.state.error.mfaCode1}
            placeholder={intl.formatMessage({ id: 'label.mfaCode' })}
            onChange={e => this.setState({ mfaCode1: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField
            fullWidth
            variant='outlined'
            value={this.state.mfaCode2}
            error={!!this.state.error.mfaCode2}
            helperText={this.state.error.mfaCode2}
            placeholder={intl.formatMessage({ id: 'label.mfaCode' })}
            onChange={e => this.setState({ mfaCode2: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant='contained' color='primary' disabled={this.state.MFAPending} onClick={() => this.updateMFADevice()}>{intl.formatMessage({ id: 'label.save' })}</Button>
        </Grid>
      </React.Fragment> }
    </Grid>)
  }
}

UserSettingGeneral.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
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
      connect(mapStateToProps, mapDispatchToProps)(UserSettingGeneral)
    )
  )
)
