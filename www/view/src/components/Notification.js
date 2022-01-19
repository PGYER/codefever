// vendor package
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { psSetting, plClose, psMore, plCheck, psTrash } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import UserData from 'APPSRC/data_providers/UserData'
import Constants from 'APPSRC/config/Constants'

// helpers
import { makeLink, notificationParser } from 'APPSRC/helpers/VaribleHelper'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

// style
const styles = theme => ({
  notification: {
    '& > div:first-child': {
      background: 'transparent'
    }
  },
  paper: {
    padding: 0,
    top: theme.spacing(8),
    boxSizing: 'border-box',
    width: theme.spacing(50),
    height: 'calc(100% - 64px)',
    background: theme.palette.background.light,
    border: '1px solid ' + theme.palette.border
  },
  header: {
    top: 0,
    zIndex: 1,
    position: 'sticky',
    background: theme.palette.background.light
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    height: theme.spacing(6) + 'px',
    padding: '0px ' + theme.spacing(3) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  close: {
    '& svg': {
      width: '14px !important',
      height: '14px !important',
      padding: '2px'
    }
  },
  icon: {
    color: theme.palette.text.light
  },
  more: {
    marginTop: theme.spacing(0.5)
  },
  menu: {
    padding: '0px ' + theme.spacing(3) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  notifySetting: {
    display: 'none'
  },
  notify: {
    '&:hover': {
      background: theme.palette.background.main,
      '& > div:first-child > div:nth-of-type(2)': {
        display: 'block'
      }
    },
    padding: theme.spacing(2) + 'px ' + theme.spacing(3) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  notifiTitle: {
    lineHeight: theme.spacing(4) + 'px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '& > span': {
      fontSize: '12px'
    }
  },
  readed: {
    '& div, & span': {
      color: theme.palette.text.lighter + '!important'
    }
  },
  notifiContent: {
    cursor: 'pointer',
    lineHeight: theme.spacing(2.5) + 'px',
    maxHeight: theme.spacing(5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical'
  },
  loading: {
    justifyContent: 'center',
    padding: theme.spacing(4) + 'px'
  }
})

class Notification extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      pending: false,
      menuAnchor: null,
      category: Constants.notificationCategory.unRead,
      list: [],
      pagesize: 20,
      page: 1,
      loadMore: true
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.notificationOpenStatus !== nextProps.notificationOpenStatus &&
        nextProps.notificationOpenStatus === true) {
      this.getData(nextState, true)
      return false
    }

    if (this.state.category !== nextState.category) {
      this.getData(nextState, true)
      return false
    }

    if (this.state.page !== nextState.page) {
      this.getData(nextState, false)
      return false
    }

    return true
  }

  getData (state, reset) {
    const { pending, category, list, pagesize, page, loadMore } = state
    if (pending) {
      return false
    }

    this.setState({
      pending: true,
      list: reset ? [] : list,
      page: reset ? 1 : page,
      loadMore: reset ? true : loadMore
    })

    UserData.notifications({
      category: category,
      page: reset ? 1 : page
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          data.data.map(item => notificationParser(item, this.props.intl))

          this.setState({
            pending: false,
            list: [...this.state.list, ...data.data],
            loadMore: data.data.length === pagesize
          })
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

  setNotificationRead (id) {
    const { dispatchEvent, intl } = this.props
    const { list } = this.state
    if (this.state.pending) {
      return false
    }

    this.setState({
      menuAnchor: null,
      pending: true
    })
    UserData.setNotificationRead({
      id: id,
      all: id ? '' : '1'
    }).then(NetworkHelper.withEventdispatcher(dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        list.map((item, index) => {
          if (!id) {
            item.isRead = true
          } else if (id && item.id === id) {
            item.isRead = true
          }
          return true
        })
        this.setState({
          pending: false,
          list: list
        })
        this.reloadUserData()
        data.code && dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.updateFail' }), 2))
      })
  }

  deleteNotification (id) {
    const { dispatchEvent, intl } = this.props
    let { list } = this.state
    if (this.state.pending) {
      return false
    }

    this.setState({
      menuAnchor: null,
      pending: true
    })
    UserData.deleteNotification({
      id: id,
      all: id ? '' : '1'
    }).then(NetworkHelper.withEventdispatcher(dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        list = list.filter((item, index) => {
          if (!id) {
            return !item.isRead
          } else {
            item.id === id && !item.isRead && this.reloadUserData()
            return item.id !== id
          }
        })
        this.setState({
          pending: false,
          list: list
        })
        data.code && dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.deleteFail' }), 2))
      })
  }

  aLink (item) {
    const { history } = this.props
    this.props.notificationOpenStatusClose()
    !item.isRead && this.setNotificationRead(item.id)

    history.push(makeLink(item.url))
  }

  notificationSetting () {
    this.props.notificationOpenStatusClose()
    this.props.history.push(makeLink('settings/notification'))
  }

  render () {
    const { notificationOpenStatus, notificationOpenStatusClose, classes, intl } = this.props
    const { pending, menuAnchor, category, list, page, loadMore } = this.state

    const notificationCategory = []
    notificationCategory[Constants.notificationCategory.all] = intl.formatMessage({ id: 'label.all' })
    notificationCategory[Constants.notificationCategory.unRead] = intl.formatMessage({ id: 'label.unread' })

    return (<Drawer
      anchor='right'
      open={notificationOpenStatus}
      onClose={e => !pending && notificationOpenStatusClose()}
      className={classes.notification}
      elevation={8}
      PaperProps={{
        className: classes.paper,
        onScroll: e => !pending && loadMore && ((e.target.offsetHeight - 2 + e.target.scrollTop) === e.target.scrollHeight) && this.setState({ page: page + 1 })
      }}
    >
      <Grid container className={classes.header}>
        <Grid container className={classes.headerTitle}>
          <Grid item xs={8}>
            <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'label.notificationCenter' })}</Typography>
          </Grid>
          <Grid item xs={4} align='right'>
            <SquareIconButton label='label.setting' icon={psSetting} className={classes.icon}
              onClick={e => this.notificationSetting()} />
            <SquareIconButton label='label.close' icon={plClose} className={[classes.icon, classes.close].join(' ')}
              onClick={e => !pending && notificationOpenStatusClose()} />
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.menu}>
          <TabHeader
            currentTab={category}
            onChange={(e, value) => !pending && this.setState({ category: value })}
            tabs={notificationCategory}
          >
            <SquareIconButton label='label.more' icon={psMore} className={[classes.icon, classes.more].join(' ')}
              onClick={e => this.setState({ menuAnchor: e.target })} />
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={e => this.setState({ menuAnchor: null })}
              transitionDuration={0}
            >
              <MenuItem onClick={e => this.setNotificationRead('')}>{intl.formatMessage({ id: 'message.tagAllRead' })}</MenuItem>
              <MenuItem onClick={e => this.deleteNotification('')}>{intl.formatMessage({ id: 'message.deleteAllReaded' })}</MenuItem>
            </Menu>
          </TabHeader>
        </Grid>
      </Grid>
      <Grid container>
        {list.map((item, index) => {
          return (<Grid item key={index} xs={12}
            className={[classes.notify, item.isRead ? classes.readed : ''].join(' ')}
            onClick={e => !item.isRead && this.setNotificationRead(item.id)}
          >
            <Grid container>
              <Grid item xs={8}>
                <Typography variant='body2' component='div' className={classes.notifiTitle}>
                  &nbsp;·&nbsp;{item.data.group && item.data.group + ' / '}{item.data.repository}
                </Typography>
              </Grid>
              <Grid item xs={4} className={classes.notifySetting} align='right'>
                {!item.isRead && <SquareIconButton label='message.tagRead' icon={plCheck} className={classes.icon} />}
                <SquareIconButton label='label.delete' icon={psTrash} className={classes.icon}
                  onClick={e => {
                    this.deleteNotification(item.id)
                    e.stopPropagation()
                  }}
                />
              </Grid>
            </Grid>
            <Typography variant={item.isRead ? 'body2' : 'subtitle2'} component='div' className={classes.notifiContent}
              onClick={e => {
                this.aLink(item)
                e.stopPropagation()
              }}
            >{item.text}</Typography>
            <Typography component='div' className={classes.notifiTitle}><FormattedTime timestamp={item.created * 1} /></Typography>
          </Grid>)
        })}
        { loadMore
          ? <Grid container className={classes.loading}>
            {pending && <CircularProgress size={30} />}
          </Grid>
          : <Grid item xs={12} align='center' className={classes.loading}>
            <Button size='small' disabled>{intl.formatMessage({ id: 'label.noMore' })}</Button>
          </Grid>
        }
      </Grid>
    </Drawer>
    )
  }
}

Notification.propTypes = {
  notificationOpenStatus: PropTypes.bool.isRequired,
  notificationOpenStatusClose: PropTypes.func.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    notificationOpenStatus: state.NotificationStates.notificationOpenStatus
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) },
    notificationOpenStatusClose: () => dispatch({ type: 'notification.notificationOpenStatus.close' })
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(
      withRouter(Notification)
    )
  )
)
