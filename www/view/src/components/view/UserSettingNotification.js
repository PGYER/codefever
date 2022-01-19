// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { plAngleDown } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import TableList from 'APPSRC/components/unit/TableList'
import UserData from 'APPSRC/data_providers/UserData'
import Constants from 'APPSRC/config/Constants'
import UAC from 'APPSRC/config/UAC'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

const IOSSwitch = withStyles((theme) => ({
  root: {
    padding: 0,
    width: theme.spacing(6),
    height: theme.spacing(3),
    margin: theme.spacing(1),
    marginRight: theme.spacing(4.5)
  },
  disabled: {
    '& + $track': {
      cursor: 'not-allowed !important'
    }
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(24px)',
      color: theme.palette.primary.contrastText,
      '& + $track': {
        opacity: 1,
        border: 'none'
      }
    },
    '&$focusVisible $thumb': {
      color: theme.palette.primary.light,
      border: '6px solid ' + theme.palette.border
    }
  },
  thumb: {
    width: '22px',
    height: '22px'
  },
  track: {
    opacity: 1,
    borderRadius: '12px',
    boxSizing: 'border-box',
    backgroundColor: theme.palette.text.lighter,
    transition: theme.transitions.create(['background-color', 'border'])
  },
  checked: {},
  focusVisible: {}
}))(({ classes, ...props }) => {
  return (
    <Switch
      color='primary'
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        disabled: classes.disabled,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  )
})

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
  content: {
    paddingBottom: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderBottom: '1px solid ' + theme.palette.border
  },
  subtitle: {
    marginBottom: '14px'
  },
  desc: {
    fontSize: '14px'
  },
  title: {
    marginBottom: theme.spacing(3),
    '&:last-child': {
      marginBottom: 0
    },
    '& table tr th:nth-of-type(2), & table tr td:nth-of-type(2)': {
      textAlign: 'right'
    }
  },
  tableFold: {
    '& table th': {
      border: '0px'
    },
    '& table tbody': {
      display: 'none'
    }
  },
  switch: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: theme.spacing(12.5)
  },
  icon: {
    '& svg': {
      height: '12px !important',
      color: theme.palette.text.light,
      transform: 'rotate(180deg)',
      transition: 'transform .3s'
    }
  },
  span: {
    marginLeft: theme.spacing(2)
  },
  fold: {
    '& svg': {
      transform: 'rotate(0deg)'
    }
  },
  otherRepository: {
    '& table thead': {
      display: 'none'
    },
    '& table tr td:last-child': {
      width: '50px'
    }
  }
})

class UserSettingNotification extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      refusedList: null,
      openSet: {},
      groupFold: {},
      otherRepository: false
    }
  }

  componentDidMount () {
    this.getData()
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.props.currentUserInfo) !== JSON.stringify(nextProps.currentUserInfo) ||
        JSON.stringify(this.props.groupList) !== JSON.stringify(nextProps.groupList) ||
        JSON.stringify(this.props.repositoryList) !== JSON.stringify(nextProps.repositoryList) ||
        JSON.stringify(this.state.refusedList) !== JSON.stringify(nextState.refusedList)) {
      this.changeOpenSet(nextProps, nextState)
      return false
    }

    return true
  }

  changeOpenSet (props, state) {
    const { currentUserInfo, groupList, repositoryList } = props
    const { refusedList, openSet } = state
    let otherRepository = false
    if (currentUserInfo.id) {
      openSet[Constants.notificationStatus.mr] = this.isUserNotificationOpen(Constants.notificationStatus.mr, currentUserInfo.notification)
      openSet[Constants.notificationStatus.email] = this.isUserNotificationOpen(Constants.notificationStatus.email, currentUserInfo.notification)
    }

    if (refusedList) {
      repositoryList.length && repositoryList.map((item, index) => {
        openSet[item.id] = this.isTargetOpen(state, item.id)

        // not in group, just in repository
        if (groupList.length && groupList.filter(FilterGenerator.id(item.group.id)).length === 0) {
          otherRepository = true
        }
        return true
      })
      groupList.length && groupList.map((item, index) => {
        openSet[item.id] = this.isTargetOpen(state, item.id)

        // if all repo refuse, group display refuse
        if (openSet[item.id] && repositoryList.length) {
          const repo = repositoryList.filter(FilterGenerator.group(item.id))
          if (repo.length) {
            const refusedRepo = repo.filter((repoItem, index) => {
              return !openSet[repoItem.id] || repoItem.role < UAC.Role.DEVELOPER
            })
            openSet[item.id] = !(repo.length === refusedRepo.length)
          }
        }
        return true
      })
    }

    this.setState({
      openSet: openSet,
      otherRepository: otherRepository
    })
  }

  isUserNotificationOpen (offset, status) {
    return !(status >> (offset - 1) & 1)
  }

  isTargetOpen (state, target) {
    return !(state.refusedList.filter(FilterGenerator.target(target)).length)
  }

  getData () {
    this.setState({ pending: true })
    UserData.notificationRefused({})
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({
          pending: false,
          refusedList: data.code ? [] : data.data
        })
      })
  }

  reloadUserInfo () {
    UserData.getUserInfo()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentUserInfo.update', data: data.data })
        }
      })
  }

  updated (open, data, isUser) {
    const { dispatchEvent, intl } = this.props
    this.setState({ pending: false })
    if (!data.code) {
      isUser ? this.reloadUserInfo() : this.getData()
    } else {
      dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.updateFail' }), 2))
    }
  }

  userNotificationSetting (offset) {
    const { pending, openSet } = this.state
    if (pending || !offset) {
      return false
    }

    const open = openSet[offset] = !openSet[offset]
    this.setState({
      pending: true,
      openSet: openSet
    })
    UserData.userNotificationSetting({
      offset: offset
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.updated(open, data, true)
      })
  }

  setGroupOrRepoNotification (target, type) {
    const { pending, openSet } = this.state
    if (pending || !type || !target) {
      return false
    }

    const open = openSet[target] = !openSet[target]
    this.setState({
      pending: true,
      openSet: openSet
    })
    UserData.setGroupOrRepoNotification({
      type: type,
      target: target,
      open: open ? 1 : 0
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.updated(open, data, false)
      })
  }

  tableFold (group) {
    const { groupFold } = this.state
    groupFold[group] = !groupFold[group]
    this.setState({ groupFold: groupFold })
  }

  getTableRow (item, className) {
    const { classes, intl } = this.props
    const { openSet, groupFold } = this.state
    const isRepository = !!item.group
    const disabled = item.role < UAC.Role.DEVELOPER
    return [
      <Typography variant='body1' component='div'>
        {isRepository && <span className={className}>{item.group.displayName + '/'}</span>}{item.displayName} &nbsp;&nbsp;
        <InlineMarker color={item.role === UAC.Role.OWNER ? 'containedInfo' : 'info'} text={intl.formatMessage({ id: 'label.roleID_' + item.role })} />
      </Typography>,
      <IOSSwitch checked={disabled ? false : openSet[item.id]}
        disabled={disabled}
        onChange={e => this.setGroupOrRepoNotification(
          item.id,
          isRepository ? Constants.notificationRefuseType.repository : Constants.notificationRefuseType.group
        )
        }
      />,
      !isRepository
        ? <SquareIconButton icon={plAngleDown} onClick={e => this.tableFold(item.id)}
        className={[classes.icon, groupFold[item.id] ? classes.fold : ''].join(' ')} />
        : ''
    ]
  }

  getRepositoryTable () {
    const { repositoryList, groupList } = this.props
    const repositoryTableData = [
      ['auto', 'auto', '50px'],
      ['label.repository', 'label.notificationReceiveStatus', '']
    ]

    repositoryList.map((item, index) => {
      groupList.filter(FilterGenerator.id(item.group.id)).length === 0 && repositoryTableData.push(this.getTableRow(item, ''))
      return true
    })

    return repositoryTableData
  }

  render () {
    const { currentUserInfo, groupList, repositoryList, classes, intl } = this.props
    const { refusedList, openSet, groupFold, otherRepository } = this.state

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.header}>{intl.formatMessage({ id: 'label.notification' })}</Typography>
      </Grid>
      {refusedList
        ? <React.Fragment>
          {currentUserInfo.id && <React.Fragment>
            <Grid container className={classes.content}>
              <Grid item xs={5}>
                <Typography variant='subtitle1' component='div' className={classes.subtitle}>{intl.formatMessage({ id: 'message.mergeRequestNotification' })}</Typography>
                <Typography variant='body2' component='span' className={classes.desc}>{intl.formatMessage({ id: 'message.mergeRequestNotificationDesc' })}</Typography>
              </Grid>
              <Grid item xs={2} className={classes.switch}>
                <IOSSwitch
                  checked={openSet[Constants.notificationStatus.mr]}
                  onChange={e => this.userNotificationSetting(Constants.notificationStatus.mr)}
                />
              </Grid>
            </Grid>
            <Grid container className={classes.content}>
              <Grid item xs={5}>
                <Typography variant='subtitle1' component='div' className={classes.subtitle}>{intl.formatMessage({ id: 'message.emailNotification' })}</Typography>
                <Typography variant='body2' component='span' className={classes.desc}>{intl.formatMessage({ id: 'message.emailNotificationDesc' })}</Typography>
              </Grid>
              <Grid item xs={2} className={classes.switch}>
                <IOSSwitch
                  checked={openSet[Constants.notificationStatus.email]}
                  onChange={e => this.userNotificationSetting(Constants.notificationStatus.email)}
                />
              </Grid>
            </Grid>
          </React.Fragment>
          }
          <Grid item xs={12}>
            <Typography variant='subtitle1' component='div' className={classes.title}>{intl.formatMessage({ id: 'label.repository' })}</Typography>
          </Grid>
          {groupList.length > 0 && repositoryList.length > 0 && groupList.map((item, index) => {
            const final = [
              ['auto', 'auto', '50px'],
              this.getTableRow(item, '')
            ]
            repositoryList.filter(FilterGenerator.group(item.id)).map((repo, repoIndex) => {
              final.push(this.getTableRow(repo, classes.span))
              return true
            })
            return <Grid item key={index} xs={7} className={[classes.title, groupFold[item.id] || final.length === 2 ? classes.tableFold : ''].join(' ')}><TableList data={final} /></Grid>
          })
          }
          {otherRepository && <Grid item xs={7} className={[classes.title, classes.otherRepository].join(' ')}><TableList data={this.getRepositoryTable()} /></Grid>}
        </React.Fragment>
        : <Grid container className={classes.loading}>
          <CircularProgress />
        </Grid>
      }
    </Grid>)
  }
}

UserSettingNotification.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo,
    repositoryList: state.DataStore.repositoryList,
    groupList: state.DataStore.groupList
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
      connect(mapStateToProps, mapDispatchToProps)(UserSettingNotification)
    )
  )
)
