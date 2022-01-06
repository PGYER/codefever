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
import { psMemberAlt, psSetting, plTrash } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import TableList from 'APPSRC/components/unit/TableList'
import AdminData from 'APPSRC/data_providers/AdminData'
import Constants from 'APPSRC/config/Constants'
import UAC from 'APPSRC/config/UAC'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

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
  page: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  tag: {
    '& > *': {
      marginLeft: theme.spacing(1)
    }
  }
})

class Groups extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      pending: true,
      count: 0,
      list: [],
      keyword: '',
      sort: 'name',
      page: 1,
      pagesize: 20,

      settingAnchor: null,
      settingGroup: null,

      members: [],
      memberManage: false,
      email: '',
      error: {}
    }

    this.mountedFlag = false
    this.timeout = null

    this.checkAddResponse = ValidatorGenerator.codeValidator(this, [
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
    this.getData(this.state)
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.keyword !== nextState.keyword ||
        this.state.sort !== nextState.sort ||
        this.state.page !== nextState.page) {
      this.state.page === nextState.page && this.setState({ page: 1 })
      this.timeout && clearTimeout(this.timeout)
      this.timeout = setTimeout(() => this.getData(nextState), 200)
    }

    return true
  }

  getData (state) {
    const { keyword, sort, page, pagesize } = state

    this.setState({ pending: true })
    AdminData.groupList({
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
        <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + item.icon} className={classes.icon} />,
        <Typography variant='body1' component='div'>{item.displayName}</Typography>,
        <FormattedTime timestamp={item.created} />,
        item.status === Constants.commonStatus.normal
          ? <SquareIconButton label='label.setting' onClick={e => this.setState({ settingAnchor: e.target, settingGroup: item })} icon={psSetting} />
          : <InlineMarker color='error' text={intl.formatMessage({ id: 'message.deleted' })} />
      ])

      return true
    })

    return [
      ['auto', 'auto', 'auto', 'auto'],
      ['', 'label.group', 'label.requestCreated', ''],
      ...final
    ]
  }

  openMemberManage () {
    const { settingGroup } = this.state

    this.setState({ memberManage: true, settingAnchor: null })

    if (!settingGroup) {
      return false
    }

    AdminData.groupMembers({ group: settingGroup.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => this.setState({ members: data.data }))
  }

  getMembersTable () {
    const { classes, intl } = this.props
    const { members } = this.state
    const final = []
    const roles = {
      [UAC.Role.GUEST]: 'label.guest',
      [UAC.Role.REPORTER]: 'label.reporter',
      [UAC.Role.DEVELOPER]: 'label.developer',
      [UAC.Role.MAINTAINER]: 'label.maintianer',
      [UAC.Role.OWNER]: 'label.owner'
    }

    members.map(item => {
      final.push([
        <Grid className={classes.name}>
          <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + item.icon} className={classes.icon} />
          <Grid>
            <Typography variant='h6' component='div'>{item.name}</Typography>
            <Typography variant='body1' component='div'>{item.email}</Typography>
          </Grid>
        </Grid>,
        <InlineMarker color='info' text={intl.formatMessage({ id: roles[item.role] })} />,
        item.creatorFlag && <InlineMarker color='success' text={intl.formatMessage({ id: 'label.creator' })} />,
        <FormattedTime timestamp={item.joined} />,
        <Grid className={classes.tag}>
          {
            item.deleteFlag || item.status === Constants.commonStatus.delete
              ? <InlineMarker color='error' text={intl.formatMessage({ id: 'message.deleted' })} />
              : !item.creatorFlag && item.role < UAC.Role.OWNER && <>
                <SquareIconButton label='message.roleToOwner' onClick={e => this.setRoleConfirm(item)} icon={psMemberAlt} />
                <SquareIconButton label='label.delete' onClick={e => this.removeMemberConfirm(item)} icon={plTrash} />
              </>
          }
        </Grid>
      ])

      return true
    })

    return [
      ['auto', 'auto', 'auto', 'auto', 'auto'],
      ['label.name', 'label.role', '', 'label.joinedAt', ''],
      ...final
    ]
  }

  addMember () {
    const { intl } = this.props
    const { settingGroup, email } = this.state

    if (!settingGroup || !email) {
      return false
    }

    AdminData.groupAddMember({
      email: email,
      group: settingGroup.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.Added' }), 0))
          this.openMemberManage()
        } else if (!this.checkAddResponse(data.code)) {
          return false
        }
      })
  }

  removeMemberConfirm (member) {
    const { intl } = this.props

    if (!member) {
      return false
    }

    this.props.dispatchEvent(EventGenerator.addComformation('remove_group_member', {
      title: intl.formatMessage({ id: 'message.memberRemoveConfirm' }),
      description: intl.formatMessage({ id: 'message.confirmDelete' }, { s: ' \'' + member.name + '\'' }),
      reject: () => { return true },
      accept: () => this.removeMember(member)
    }))
  }

  removeMember (member) {
    const { intl, dispatchEvent } = this.props
    const { settingGroup } = this.state

    AdminData.groupRemoveMember({
      group: settingGroup.id,
      user: member.id
    }).then(NetworkHelper.withEventdispatcher(dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        dispatchEvent(EventGenerator.cancelComformation())
        if (!data.code) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.removed' }), 0))
          this.openMemberManage()
        } else if (data.code > 0x0400) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.removeFail' }), 2))
        }
      })
  }

  setRoleConfirm (member) {
    const { intl } = this.props

    if (!member) {
      return false
    }

    this.props.dispatchEvent(EventGenerator.addComformation('set_group_member_role', {
      title: intl.formatMessage({ id: 'message.setGroupOwner_S' }, { s: ' \'' + member.name + '\'' }),
      description: '',
      reject: () => { return true },
      accept: () => this.setGroupOwner(member)
    }))
  }

  setGroupOwner (member) {
    const { intl, dispatchEvent } = this.props
    const { settingGroup } = this.state

    AdminData.setGroupOwner({
      group: settingGroup.id,
      user: member.id
    }).then(NetworkHelper.withEventdispatcher(dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        dispatchEvent(EventGenerator.cancelComformation())
        if (!data.code) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.updated' }), 0))
          this.openMemberManage()
        } else if (data.code > 0x0400) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.updateFail' }), 2))
        }
      })
  }

  render () {
    const { classes, intl } = this.props
    const { pending, count, keyword, sort, page, pagesize, settingAnchor, memberManage, email, error } = this.state

    return <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid className={classes.search}>
          <TextField
            className={classes.keyword}
            variant='outlined'
            placeholder={intl.formatMessage({ id: 'message.searchGroup' })}
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
      <Menu
        anchorEl={settingAnchor}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{ className: classes.menu }}
        getContentAnchorEl={null}
        open={Boolean(settingAnchor)}
        onClose={e => this.setState({ settingAnchor: null })}
      >
        <MenuItem onClick={e => this.openMemberManage()}>
          <ListItemText disableTypography primary={intl.formatMessage({ id: 'label.memberManage' })} />
        </MenuItem>
      </Menu>
      <Dialog
        maxWidth='md'
        open={memberManage}
        fullWidth={Boolean(true)}
        onClose={e => this.setState({ memberManage: false })}
      >
        <DialogTitle>
          <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'label.memberManage' })}</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} className={classes.search}>
              <TextField
                className={classes.keyword}
                variant='outlined'
                placeholder={intl.formatMessage({ id: 'message.plsInputInvitedEmail' })}
                value={email}
                error={!!error.email}
                helperText={error.email}
                onChange={e => this.setState({ email: e.target.value })}
              />&emsp;
              <Button variant='contained' color='primary' onClick={e => this.addMember()}>{intl.formatMessage({ id: 'label.invite' })}</Button>
            </Grid>
            <Grid item xs={12}><TableList data={this.getMembersTable()} /></Grid>
            <Grid item xs={12} align='right'>
              <Button variant='outlined' color='primary' onClick={e => this.setState({ memberManage: false })}>{intl.formatMessage({ id: 'label.cancel' })}</Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Grid>
  }
}

Groups.propTypes = {
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
    connect(mapStateToProps, mapDispatchToProps)(Groups)
  )
)
