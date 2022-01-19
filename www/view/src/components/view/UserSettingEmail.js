// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { plTrash, plCheck, plEdit, plClose } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'
import TableList from 'APPSRC/components/unit/TableList'
import UserData from 'APPSRC/data_providers/UserData'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

const styles = (theme) => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  header: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(4),
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px'
  },
  title: {
    lineHeight: theme.spacing(3) + 'px',
    paddingBottom: theme.spacing(2)
  },
  content: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
    borderBottom: '1px solid ' + theme.palette.border,
    marginBottom: theme.spacing(3)
  },
  create: {
    marginTop: theme.spacing(1)
  },
  size: {
    fontSize: '12px'
  },
  btn: {
    textDecoration: 'none !important',
    marginLeft: theme.spacing(3)
  },
  icon: {
    color: theme.palette.text.light
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  ok: {
    '& svg': {
      color: theme.palette.success.main + ' !important'
    }
  },
  cancel: {
    marginLeft: theme.spacing(3),
    '& svg': {
      width: '14px !important',
      height: '14px !important',
      padding: '2px',
      color: theme.palette.error.main + ' !important'
    }
  },
  table: {
    marginTop: theme.spacing(3),
    '& tbody tr': {
      '&:hover': {
        background: theme.palette.background.light + ' !important'
      }
    },
    '& td': {
      height: theme.spacing(6) + 'px',
      '& > div': {
        verticalAlign: 'middle'
      }
    }
  }
})

class UserSettingEmail extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      primaryEmail: props.currentUserInfo.id ? props.currentUserInfo.email : '',
      emails: props.currentUserInfo.id ? props.currentUserInfo.emails : null,
      email: '',
      error: {},
      validationEmail: null,
      code: '',
      codeDisabled: false,
      count: 61
    }

    const { intl } = props
    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'email',
        passPattern: /^.+$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'email',
        passPattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.email' }) }
        )
      }
    ])

    this.codeCheckInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'code',
        passPattern: /^\d+$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: intl.formatMessage({ id: 'label.emailCode' }) }
        )
      },
      {
        name: 'code',
        passPattern: /^\d{6}$/,
        errorMessage: intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.emailCode' }) }
        )
      }
    ])

    this.codeCheckResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'code',
        exceptionCode: 0x040C,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: intl.formatMessage({ id: 'label.emailCode' }) }
        )
      }
    ])
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(nextProps.currentUserInfo) !== JSON.stringify(this.props.currentUserInfo)) {
      this.setState({
        primaryEmail: nextProps.currentUserInfo.email,
        emails: nextProps.currentUserInfo.emails
      })
      return false
    }
    return true
  }

  reloadUserData (cancel) {
    cancel && this.cancelForm()
    UserData.getUserInfo()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentUserInfo.update', data: data.data })
        }
      })
  }

  addCommitEmail () {
    const { emails, email } = this.state
    const { intl } = this.props
    if (!emails || !this.checkInput()) {
      return false
    }

    if (emails.filter(FilterGenerator.email(email)).length > 0) {
      this.setState({
        error: {
          email: intl.formatMessage(
            { id: 'message.error._S_duplicate' },
            { s: intl.formatMessage({ id: 'label.email' }) }
          )
        }
      })
      return false
    }

    this.setState({ pending: true })
    UserData.addCommitEmail({
      email: email
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ pending: false })
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.emailCodeHasSendNewEmail' }), 0))
          this.createValidationForm(email)
          this.reloadUserData(false)
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.AddFail' }), 2))
        }
      })
  }

  resentCommitEmailCode (email) {
    const { intl } = this.props
    const { codeDisabled } = this.state
    if (codeDisabled) {
      return false
    }

    this.cancelForm()
    UserData.resentCommitEmailCode({
      email: email
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.emailCodeHasSendNewEmail' }), 0))
          this.countDown()
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.getEmailCodeFail' }), 2))
        }
      })
  }

  countDown () {
    let { count } = this.state
    if (count) {
      this.setState({ codeDisabled: true, count: --count })
      window.setTimeout(() => this.countDown(), 1000)
    } else {
      this.setState({ codeDisabled: false, count: 61 })
    }
  }

  validationCommitEmailCode (item) {
    const { intl } = this.props
    const { code } = this.state
    if (!item || !this.codeCheckInput()) {
      return false
    }

    this.setState({ pending: true })
    UserData.validationCommitEmailCode({
      id: item.id,
      email: item.email,
      code: code
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ pending: false })
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.verified' }), 0))
          this.reloadUserData(true)
        } else if (!this.codeCheckResponse(data.code)) {
          return false
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.verifyFail' }), 2))
        }
      })
  }

  deleteConfirm (id, email) {
    const { intl } = this.props
    this.cancelForm()
    this.props.dispatchEvent(EventGenerator.addComformation('delete_my_email', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.email' }) + ' \'' + email + '\' ' }),
      description: '',
      reject: () => { return true },
      accept: () => this.deleteCommitEmail(id)
    }))
  }

  deleteCommitEmail (id) {
    const { intl } = this.props
    if (!id) {
      return false
    }

    this.setState({ pending: true })
    UserData.deleteCommitEmail({
      id: id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ pending: false })
        this.props.dispatchEvent(EventGenerator.cancelComformation())
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.deleted' }), 0))
          this.reloadUserData(true)
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.deleteFail' }), 2))
        }
      })
  }

  getTableData () {
    const { classes, intl } = this.props
    const { primaryEmail, emails, validationEmail, codeDisabled, count } = this.state
    const final = []
    if (!emails) {
      return false
    }

    emails.map((item, index) => {
      if (item === 'create') {
        final.push(this.createForm())
      } else if (validationEmail === item.email) {
        final.push(this.validationForm(item))
      } else {
        final.push([
          <Typography variant='body1' component='div'>{item.email}</Typography>,
          item.email === primaryEmail
            ? <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'label.primaryEmail' })}</Typography>
            : item.isCheck
              ? <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'message.contactedEmail' })}</Typography>
              : <Typography variant='body2' component='div'>
                {intl.formatMessage({ id: 'message.shouldValidation' })}
                <a href='#' disabled={codeDisabled}
                  className={[classes.btn, codeDisabled ? classes.disabled : ''].join(' ')}
                  onClick={e => this.resentCommitEmailCode(item.email)}
                >
                  {intl.formatMessage({ id: 'message.resendEmail' })}?
                  {codeDisabled && '(' + count + ')'}
                </a>
              </Typography>,
          item.email !== primaryEmail && <React.Fragment>
            {!item.isCheck && <SquareIconButton label='message.shouldValidation' className={classes.icon} onClick={e => this.createValidationForm(item.email)} icon={plEdit} />}
            <SquareIconButton label='label.delete' className={[classes.icon, classes.btn].join(' ')} onClick={e => this.deleteConfirm(item.id, item.email)} icon={plTrash} />
          </React.Fragment>
        ])
      }
      return true
    })

    return [
      ['30%', 'auto', 'auto'],
      ['label.contactEmail', 'label.status', ''],
      ...final
    ]
  }

  createForm () {
    const { classes, intl } = this.props
    return [
      <TextField
        fullWidth
        variant='outlined'
        value={this.state.email}
        placeholder={intl.formatMessage({ id: 'message._S_empty' }, { s: intl.formatMessage({ id: 'label.email' }) })}
        error={!!this.state.error.email}
        helperText={this.state.error.email}
        onChange={(e) => this.setState({ email: e.target.value })}
      />,
      '',
      <React.Fragment>
        <SquareIconButton label='label.ok' icon={plCheck} onClick={e => this.addCommitEmail()} className={classes.ok} />
        <SquareIconButton label='label.cancel' icon={plClose} onClick={e => this.cancelForm()} className={classes.cancel} />
      </React.Fragment>
    ]
  }

  validationForm (item) {
    const { classes, intl } = this.props
    return [
      <Typography variant='body1' component='div'>{item.email}</Typography>,
      <TextField
        fullWidth
        variant='outlined'
        value={this.state.code}
        placeholder={intl.formatMessage({ id: 'message._S_empty' }, { s: intl.formatMessage({ id: 'label.emailCode' }) })}
        error={!!this.state.error.code}
        helperText={this.state.error.code}
        onChange={(e) => this.setState({ code: e.target.value })}
      />,
      <React.Fragment>
        <SquareIconButton label='label.ok' icon={plCheck} onClick={e => this.validationCommitEmailCode(item)} className={classes.ok} />
        <SquareIconButton label='label.cancel' icon={plClose} onClick={e => this.cancelForm()} className={classes.cancel} />
      </React.Fragment>
    ]
  }

  cancelForm () {
    let { emails } = this.state
    if (emails[emails.length - 1] === 'create') {
      emails = emails.slice(0, emails.length - 1)
    }

    this.setState({
      emails: emails,
      email: '',
      error: {},
      validationEmail: null,
      code: ''
    })
  }

  createCommitEmailForm () {
    const { emails } = this.state
    if (emails[emails.length - 1] !== 'create') {
      this.cancelForm()
      this.setState({ emails: [...emails, 'create'] })
    }
  }

  createValidationForm (email) {
    this.cancelForm()
    this.setState({ validationEmail: email })
  }

  render () {
    const { history, classes, intl } = this.props
    const { pending, primaryEmail, emails } = this.state

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.header}>{ intl.formatMessage({ id: 'label.emailManage' }) }</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='subtitle1' component='div' className={classes.title}>{intl.formatMessage({ id: 'message.primaryEmail' })}</Typography>
        <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'message.primaryEmailDescription' })}</Typography>
        <Grid container className={classes.content}>
          <Grid item xs={3}>
            <Typography variant='body1' component='div'>{primaryEmail}</Typography>
          </Grid>
          <Grid item xs={8}>
            <Button variant='contained' color='primary' onClick={e => history.push(makeLink('settings', 'profile'))}>{intl.formatMessage({ id: 'message.updatePrimaryEmail' })}</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant='subtitle1' component='div' className={classes.title}>{intl.formatMessage({ id: 'message.myEmail' })}</Typography>
          <Typography variant='body2' component='div'>
            {intl.formatMessage({ id: 'message.myEmailDescription' })} &nbsp;
            <ShowHelper type='icon' doc='/common/multiEmail.md' />
          </Typography>
        </Grid>
        <Grid item xs={2} align='right'>
          <Button variant='contained' color='primary' className={classes.create} disabled={pending} onClick={e => this.createCommitEmailForm()}>{intl.formatMessage({ id: 'message.addEmail' })}</Button>
        </Grid>
        <Grid item xs={8} className={classes.table}>
          { emails !== null
            ? <TableList data={this.getTableData()} />
            : <Grid container className={classes.loading}>
              <CircularProgress />
            </Grid>
          }
        </Grid>
      </Grid>
    </Grid>)
  }
}

UserSettingEmail.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
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
      connect(mapStateToProps, mapDispatchToProps)(UserSettingEmail)
    )
  )
)
