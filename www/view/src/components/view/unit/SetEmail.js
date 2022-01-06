// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import UserData from 'APPSRC/data_providers/UserData'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = (theme) => ({
  pr0: {
    '& > div': {
      paddingRight: '0px !important'
    },
    '& button': {
      minWidth: theme.spacing(18)
    }
  }
})

class SetEmail extends React.Component {
  constructor (props) {
    super(props)
    const { intl } = this.props
    this.state = {
      email: '',
      password: '',
      code: '',
      error: {},
      showPassword: false,
      showCodeInput: false,
      emailFocus: false,
      passwordFocus: false,
      codeBtnDisabled: false,
      codeText: intl.formatMessage({ id: 'label.getEmailCode' })
    }

    this.getEmailCodeCheckInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'email',
        passPattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.email' }) }
        )
      }
    ])

    this.getEmailCodeCheckResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'email',
        exceptionCode: 0x040D,
        errorMessage: intl.formatMessage({ id: 'message.error.inputNewEmail' })
      },
      {
        name: 'email',
        exceptionCode: 0x0406,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'password',
        exceptionCode: 0x040C,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.password' }) }
        )
      },
      {
        name: 'email',
        exceptionCode: 0x0405,
        errorMessage: intl.formatMessage({ id: 'message.error.getEmailCodeFail' })
      }
    ])

    this.saveEmailCheckInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'email',
        passPattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'password',
        passPattern: /^.+$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: intl.formatMessage({ id: 'label.password' }) }
        )
      },
      {
        name: 'code',
        passPattern: /^[0-9]{6}$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.emailCode' }) }
        )
      }
    ])

    this.saveEmailCheckResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'email',
        exceptionCode: 0x0405,
        errorMessage: intl.formatMessage(
          { id: 'message.error.change_S_Fail' },
          { s: intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'code',
        exceptionCode: 0x040C,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.email' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.setState({ email: this.props.currentUserInfo.email })
  }

  getEmailCode () {
    const { intl } = this.props
    const { email, password, codeBtnDisabled } = this.state
    if (codeBtnDisabled || !password || !this.getEmailCodeCheckInput()) {
      return false
    }

    UserData.getEmailCode({
      email: email,
      password: password
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.emailCodeHasSendNewEmail' }), 0))
          this.setState({ showCodeInput: true })
          this.countDown()
        } else if (!this.getEmailCodeCheckResponse(data.code)) {
          return false
        }
      })
  }

  countDown () {
    const { intl } = this.props
    this.setState({ codeBtnDisabled: true })

    let time = 60
    this.int = setInterval(() => {
      this.setState({ codeText: intl.formatMessage({ id: 'label.retryAfter_N_seconds' }, { n: time }) })
      if (--time <= 0) {
        clearInterval(this.int)
        this.setState({
          codeText: intl.formatMessage({ id: 'label.getEmailCode' }),
          codeBtnDisabled: false
        })
      }
    }, 1000)
  }

  saveData () {
    const { intl } = this.props
    const { email, password, code } = this.state
    if (!this.saveEmailCheckInput()) {
      return false
    }

    UserData.changeEmail({
      password: password,
      email: email,
      code: code
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.update(() => {
            this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.updated' }), 0))
            setTimeout(() => (window.location.href = '/user/logout'), 3000)
          })
        } else if (this.saveEmailCheckResponse(data.code)) {
          return false
        }
      })
  }

  render () {
    const { classes, intl } = this.props
    const { email, password, code, error, showPassword, showCodeInput } = this.state
    return (<Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.email' }) }</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant='outlined'
            value={email}
            error={!!error.email}
            helperText={error.email}
            placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.email' }) })}
            onChange={e => this.setState({ email: e.target.value })}
            onFocus={() => this.setState({ emailFocus: true, showPassword: true })}
            onBlur={() => setTimeout(() => {
              this.setState({ emailFocus: false })
              !this.state.passwordFocus && this.setState({ showPassword: false })
            }, 150)}
          />
        </Grid>
        { showPassword && !showCodeInput && <React.Fragment>
          <Grid item xs={12} md={8} lg={9}>
            <TextField
              fullWidth
              type='password'
              variant='outlined'
              value={password}
              error={!!error.password}
              helperText={error.password}
              placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.password' }) })}
              onChange={e => this.setState({ password: e.target.value })}
              onFocus={() => this.setState({ passwordFocus: true })}
              onBlur={() => setTimeout(() => {
                this.setState({ passwordFocus: false })
                !this.state.emailFocus && this.setState({ showPassword: false })
              }, 150)}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={3} align='right'>
            <Button variant='contained' color='primary' onClick={() => this.getEmailCode()}>{intl.formatMessage({ id: 'label.getEmailCode' })}</Button>
          </Grid>
        </React.Fragment>
        }
        { showCodeInput && <React.Fragment>
          <Grid item xs={12} md={8} lg={9}>
            <TextField
              fullWidth
              variant='outlined'
              className={classes.pr0}
              value={code}
              error={!!error.code}
              helperText={error.code}
              placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.emailCode' }) })}
              onChange={e => this.setState({ code: e.target.value })}
              InputProps={{
                endAdornment: <Button variant='contained' color='primary' onClick={() => this.getEmailCode()} disabled={this.state.codeBtnDisabled}>
                  {this.state.codeText}
                </Button>
              }}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={3} align='right'>
            <Button variant='contained' color='primary' onClick={() => this.saveData()}>{intl.formatMessage({ id: 'label.save' })}</Button>
          </Grid>
        </React.Fragment>
        }
      </Grid>
    </Grid>
    )
  }
}

SetEmail.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(SetEmail)
  )
)
