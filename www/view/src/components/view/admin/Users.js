// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles } from '@material-ui/core/styles'

// components
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import Avatar from '@material-ui/core/Avatar'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Pagination from '@material-ui/lab/Pagination'
import Typography from '@material-ui/core/Typography'
import DialogTitle from '@material-ui/core/DialogTitle'
import ListItemText from '@material-ui/core/ListItemText'
import DialogContent from '@material-ui/core/DialogContent'
import CircularProgress from '@material-ui/core/CircularProgress'
import { psSetting, plCopy } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import TableList from 'APPSRC/components/unit/TableList'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import AdminData from 'APPSRC/data_providers/AdminData'
import Constants from 'APPSRC/config/Constants'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import { copyToClipboard } from 'APPSRC/helpers/VaribleHelper'

const styles = (theme) => ({
  search: {
    display: 'flex'
  },
  keyword: {
    flexGrow: 1
  },
  sortLabel: {
    lineHeight: theme.spacing(4) + 'px',
    padding: '0px ' + theme.spacing(2) + 'px'
  },
  name: {
    display: 'flex',
    textAlign: 'left',
    alignItems: 'center',
    margin: theme.spacing(1) + 'px 0px'
  },
  icon: {
    margin: theme.spacing(1)
  },
  tag: {
    '& > *': {
      marginRight: theme.spacing(1)
    }
  },
  page: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
})

class Users extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      pending: true,
      count: 0,
      list: [],
      category: 0,
      keyword: '',
      sort: 'name',
      page: 1,
      pagesize: 20,

      settingAnchor: null,
      settingUser: null,

      password1: '',
      password2: '',
      resetPassword: false,
      error: {},

      settingAdmin: false,
      password: '',

      addUser: false,
      name: '',
      email: '',
      newPassword: ''
    }

    this.mountedFlag = false
    this.timeout = null

    this.checkPasswordInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'password1',
        passPattern: /^.{6,50}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 6, n2: 50 }
        )
      }
    ])

    this.checkEmailInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'name',
        passPattern: /^.{1,15}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 1, n2: 15 }
        )
      },
      {
        name: 'email',
        passPattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      }
    ])

    this.checkEmailResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'email',
        exceptionCode: 0x0406,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.email' }) }
        )
      },
      {
        name: 'email',
        exceptionCode: 0x0405,
        errorMessage: this.props.intl.formatMessage({ id: 'message.error.AddFail' })
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
    this.getData(this.state)
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.category !== nextState.category ||
        this.state.keyword !== nextState.keyword ||
        this.state.sort !== nextState.sort ||
        this.state.page !== nextState.page) {
      this.state.page === nextState.page && this.setState({ page: 1 })
      this.timeout && clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.getData(nextState), 200)
    }

    return true
  }

  getData (state) {
    const { category, keyword, sort, page, pagesize } = state

    this.setState({ pending: true })
    AdminData.userList({
      category: category,
      keyword: keyword,
      sort: sort,
      page: page,
      pagesize: pagesize
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ pending: false })
        !data.code && this.setState({
          count: data.data.count,
          list: data.data.list
        })
      })
  }

  getTableData () {
    const { classes, intl } = this.props
    const { list } = this.state
    const final = []

    list.map(item => {
      final.push([
        <Grid className={classes.name}>
          <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + item.avatar} className={classes.icon} />
          <Grid>
            <Typography variant='h6' component='div'>{item.name}</Typography>
            <Typography variant='body1' component='div'>{item.email}</Typography>
          </Grid>
        </Grid>,
        <Typography variant='body1' component='div'>{item.projects}</Typography>,
        <Typography variant='body1' component='div'>{item.created}</Typography>,
        <Grid className={classes.tag}>
          {item.mfaEnabled && <InlineMarker color='success' text='2FA' />}
          {item.admin && <InlineMarker color='info' text={intl.formatMessage({ id: 'label.administrator' })} />}
          {!item.status && <InlineMarker color='error' text={intl.formatMessage({ id: 'message.disabled' })} />}
        </Grid>,
        <SquareIconButton label='label.setting' onClick={e => this.setState({ settingAnchor: e.target, settingUser: item })} icon={psSetting} />
      ])

      return true
    })

    return [
      ['auto', 'auto', 'auto', 'auto', 'auto'],
      ['label.name', 'label.repository', 'label.requestCreated', '', ''],
      ...final
    ]
  }

  updateUserStatusConfirm () {
    const { intl } = this.props
    const { settingUser } = this.state

    this.setState({ settingAnchor: null })

    if (!settingUser) {
      return false
    }

    this.props.dispatchEvent(EventGenerator.addComformation('setting_user_status', {
      title: intl.formatMessage({ id: settingUser.status ? 'message.userStatusDisabled' : 'message.userStatusEnabled' }),
      description: intl.formatMessage(
        { id: settingUser.status ? 'message.userStatusDisabled_N' : 'message.userStatusEnabled_N' },
        { n: settingUser.name }
      ),
      reject: () => { return true },
      accept: () => this.updateUserStatus()
    }))
  }

  updateUserStatus () {
    const { intl } = this.props
    const { settingUser } = this.state

    AdminData.updateUserStatus({
      user: settingUser.id,
      status: settingUser.status ? Constants.commonStatus.delete : Constants.commonStatus.normal
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.props.dispatchEvent(EventGenerator.cancelComformation())
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: settingUser.status ? 'message.disabled' : 'message.enabled' }), 0))
          this.getData(this.state)
        }
      })
  }

  closeUserMFAConfirm () {
    const { intl } = this.props
    const { settingUser } = this.state

    this.setState({ settingAnchor: null })

    if (!settingUser) {
      return false
    }

    this.props.dispatchEvent(EventGenerator.addComformation('disable_user_mfa', {
      title: intl.formatMessage({ id: 'message.closeMFA' }),
      description: intl.formatMessage({ id: 'message.closeMFA_N' }, { n: settingUser.name }),
      reject: () => { return true },
      accept: () => this.closeUserMFA()
    }))
  }

  closeUserMFA () {
    const { intl } = this.props
    const { settingUser } = this.state

    AdminData.closeUserMFA({ user: settingUser.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.props.dispatchEvent(EventGenerator.cancelComformation())
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.closed' }), 0))
          this.getData(this.state)
        }
      })
  }

  resetPassword () {
    const { intl } = this.props
    const { settingUser, password1, password2 } = this.state
    if (!this.checkPasswordInput()) {
      return false
    }

    if (password2 !== password1) {
      this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.inputNotSame' }), 2))
      return false
    }

    AdminData.resetPassword({
      user: settingUser.id,
      password: password1
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ resetPassword: false })
        this.props.dispatchEvent(EventGenerator.cancelComformation())
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.reseted' }), 0))
        }
      })
  }

  checkPassword () {
    const { intl } = this.props
    const { password } = this.state

    AdminData.checkPassword({ password: password })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.setAdministrator()
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error._S_invalid' }, { s: intl.formatMessage({ id: 'label.password' }) }), 2))
        }
      })
  }

  setAdministrator () {
    const { intl } = this.props
    const { settingUser } = this.state

    this.setState({ settingAdmin: false })

    AdminData.setAdministrator({
      user: settingUser.id,
      admin: settingUser.admin ? 0 : 1
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.updated' }), 0))
          this.getData(this.state)
        }
      })
  }

  addUser () {
    const { name, email } = this.state
    if (!this.checkEmailInput()) {
      return false
    }

    AdminData.addUser({
      name: name,
      email: email
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.setState({ addUser: false, newPassword: data.data.password })
          this.getData(this.state)
        } else if (!this.checkEmailResponse(data.code)) {
          return false
        }
      })
  }

  render () {
    const { classes, intl } = this.props
    const {
      pending, count, category, keyword, sort, page, pagesize,
      settingAnchor, settingUser,
      resetPassword, password1, password2, error,
      settingAdmin, password,
      addUser, name, email, newPassword
    } = this.state

    return <Grid container spacing={3}>
      <Grid item xs={8}>
        <TabHeader
          currentTab={category}
          onChange={(e, value) => !pending && this.setState({ category: value })}
          tabs={[
            intl.formatMessage({ id: 'label.all' }),
            intl.formatMessage({ id: 'label.enabledMFA' }),
            intl.formatMessage({ id: 'label.disabledMFA' }),
            intl.formatMessage({ id: 'label.blocked' })
          ]}
        />
      </Grid>
      <Grid item xs={4} align='right'>
        <Button variant='contained' color='primary' onClick={e => this.setState({ addUser: true, name: '', email: '', error: {} })}>{intl.formatMessage({ id: 'label.addUser' })}</Button>
      </Grid>
      <Grid item xs={12}>
        <Grid className={classes.search}>
          <TextField
            className={classes.keyword}
            variant='outlined'
            placeholder={intl.formatMessage({ id: 'message.searchByName' })}
            value={keyword}
            onChange={e => this.setState({ keyword: e.target.value })}
          />
          <Typography variant='h6' component='span' className={classes.sortLabel}>{intl.formatMessage({ id: 'label.sort' })}</Typography>
          <TextField
            select
            variant='outlined'
            value={sort}
            onChange={e => this.setState({ sort: e.target.value })}
          >
            <MenuItem value="name">{intl.formatMessage({ id: 'label.name' })}</MenuItem>
            <MenuItem value="email">{intl.formatMessage({ id: 'label.email' })}</MenuItem>
            <MenuItem value="created">{intl.formatMessage({ id: 'label.createTime' })}</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      {
        pending
          ? <Grid item xs={12} align='center'><CircularProgress /></Grid>
          : count
            ? <>
              <Grid item xs={12}><TableList data={this.getTableData()} /></Grid>
              <Grid item xs={12} className={classes.page}>
                <Pagination count={Math.ceil(count / pagesize)} page={page} onChange={(e, p) => this.setState({ page: p })} shape='rounded' color='primary' />
              </Grid>
            </>
            : <Grid item xs={12} align='center'><Typography variant='caption' component='span'>{intl.formatMessage({ id: 'label.noMore' })}</Typography></Grid>
      }

      {
        settingUser && <>
          <Menu
            anchorEl={settingAnchor}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            PaperProps={{ className: classes.menu }}
            getContentAnchorEl={null}
            open={Boolean(settingAnchor)}
            onClose={e => this.setState({ settingAnchor: null })}
          >
            <MenuItem onClick={e => this.updateUserStatusConfirm()}>
              <ListItemText disableTypography primary={intl.formatMessage({ id: settingUser.status ? 'label.disable' : 'label.enable' })} />
            </MenuItem>
            {
              settingUser.status && <MenuItem onClick={e => this.setState({ resetPassword: true, settingAnchor: null })}>
                <ListItemText disableTypography primary={intl.formatMessage({ id: 'message.resetPassword' })} />
              </MenuItem>
            }
            {
              settingUser.status && settingUser.mfaEnabled && <MenuItem onClick={e => this.closeUserMFAConfirm()}>
                <ListItemText disableTypography primary={intl.formatMessage({ id: 'message.closeMFA' })} />
              </MenuItem>
            }
            {
              settingUser.status && <MenuItem onClick={e => this.setState({ settingAdmin: true, settingAnchor: null, password: '' })}>
                <ListItemText disableTypography primary={intl.formatMessage({ id: settingUser.admin ? 'message.cancelAdministrator' : 'message.setAdministrator' })} />
              </MenuItem>
            }
          </Menu>

          <Dialog
            maxWidth='sm'
            open={resetPassword}
            fullWidth={Boolean(true)}
            onClose={e => this.setState({ resetPassword: false })}
          >
            <DialogTitle>
              <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'message.reset_N_Password' }, { n: settingUser.name })}</Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='password'
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.newPassword' }) })}
                    value={password1}
                    error={!!error.password1}
                    helperText={error.password1}
                    onChange={e => this.setState({ password1: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='password'
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_retype' }, { s: intl.formatMessage({ id: 'label.newPassword' }) })}
                    value={password2}
                    onChange={e => this.setState({ password2: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} align='right'>
                  <Button variant='outlined' color='primary' onClick={e => this.setState({ resetPassword: false })}>{intl.formatMessage({ id: 'label.cancel' })}</Button>&emsp;
                  <Button variant='contained' color='primary' onClick={e => this.resetPassword()}>{intl.formatMessage({ id: 'label.ok' })}</Button>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>

          <Dialog
            maxWidth='sm'
            open={settingAdmin}
            fullWidth={Boolean(true)}
            onClose={e => this.setState({ settingAdmin: false })}
          >
            <DialogTitle>
              <Typography variant='h6' component='div'>{intl.formatMessage({ id: settingUser.admin ? 'message.cancelAdministrator' : 'message.setAdministrator' })}</Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='password'
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.password' }) })}
                    value={password}
                    onChange={e => this.setState({ password: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} align='right'>
                  <Button variant='outlined' color='primary' onClick={e => this.setState({ settingAdmin: false })}>{intl.formatMessage({ id: 'label.cancel' })}</Button>&emsp;
                  <Button variant='contained' color='primary' onClick={e => this.checkPassword()}>{intl.formatMessage({ id: 'label.ok' })}</Button>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        </>
      }
      <Dialog
        maxWidth='sm'
        open={addUser}
        fullWidth={Boolean(true)}
        onClose={e => this.setState({ addUser: false })}
      >
        <DialogTitle>
          <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'label.addUser' })}</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant='outlined'
                placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.name' }) })}
                value={name}
                error={!!error.name}
                helperText={error.name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant='outlined'
                placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.email' }) })}
                value={email}
                error={!!error.email}
                helperText={error.email}
                onChange={e => this.setState({ email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} align='right'>
              <Button variant='outlined' color='primary' onClick={e => this.setState({ addUser: false })}>{intl.formatMessage({ id: 'label.cancel' })}</Button>&emsp;
              <Button variant='contained' color='primary' onClick={e => this.addUser()}>{intl.formatMessage({ id: 'label.ok' })}</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        maxWidth='sm'
        open={!!newPassword}
        fullWidth={Boolean(true)}
        onClose={e => this.setState({ newPassword: '' })}
      >
        <DialogTitle>
          <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'message.successAddUser' })}</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='body1' component='div'>{intl.formatMessage({ id: 'label.name' })}:&emsp;{name}&emsp;</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' component='div'>{intl.formatMessage({ id: 'label.email' })}:&emsp;{email}&emsp;</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' component='div'>
                {intl.formatMessage({ id: 'label.newPassword' })}:&emsp;{newPassword}&emsp;
                <SquareIconButton label='label.copy' onClick={e => copyToClipboard(newPassword, () => this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.copied' }), 0)), e.target.parentElement)} icon={plCopy} />
              </Typography>
            </Grid>
            <Grid item xs={12} align='right'>
              <Button variant='contained' color='primary' onClick={e => this.setState({ newPassword: '' })}>{intl.formatMessage({ id: 'label.ok' })}</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Grid>
  }
}

Users.propTypes = {
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
    connect(mapStateToProps, mapDispatchToProps)(Users)
  )
)
