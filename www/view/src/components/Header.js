// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import { withStyles } from '@material-ui/core/styles'

// components
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Divider from '@material-ui/core/Divider'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'

// self components
import UserOption from 'APPSRC/components/unit/UserOption'
import withScrollTrigger from 'APPSRC/helpers/withScrollTrigger'
import LanguageSelect from 'APPSRC/components/unit/LanguageSelect'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import { psAddAlt, plMerge, plSetting, plBell, plHelp, plRepair } from '@pgyer/icons'
import GroupRepositoryMenu from 'APPSRC/components/unit/GroupRepositoryMenu'

// style
const styles = theme => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer,
    borderBottom: '1px solid ' + theme.palette.border
  },
  img: {
    height: theme.spacing(4),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(6),
    cursor: 'pointer'
  },
  placeholder: {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
    transition: theme.transitions.create('width')
  },
  placeholderExpanded: {
    width: theme.spacing(37)
  },
  placeholderCollapsed: {
    width: theme.spacing(8)
  },
  options: {
    display: 'flex'
  },
  split: {
    marginTop: theme.spacing(1),
    height: theme.spacing(2)
  },
  optionItem: {
    marginRight: theme.spacing(2)
  },
  menu: {
    marginTop: theme.spacing(1),
    padding: 0
  }
})

const scrollTriggerOptions = {
  threshold: 0,
  watching: '.app-content'
}

class Header extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newMenuAnchor: null
    }
  }

  render () {
    const { classes, currentUserInfo, scrollTrigger, history, intl, notificationOpenStatusToggle, currentLanguage } = this.props
    return (
      <AppBar position='fixed' color='default' className={classes.appBar} elevation={scrollTrigger ? 2 : 0}>
        <Toolbar>
          <Grid container justifyContent='space-between' alignItems='center'>
            <Grid item className={classes.options}>
              <img
                className={classes.img}
                src='/static/00000000000000/images/logo-community.png'
                onClick={() => history.push('/repositories')}
              />
              <Grid item className={classes.optionItem}>
                <GroupRepositoryMenu type='repository' />
              </Grid>
              <Grid item className={classes.optionItem}>
                <GroupRepositoryMenu type='group' />
              </Grid>
              <SquareIconButton label='label.mergeRequest' onClick={() => {
                history.push('/mergerequests')
              }} icon={plMerge} className={classes.optionItem} />
              <SquareIconButton label='label.setting' onClick={() => {
                history.push('/settings')
              }} icon={plSetting} className={classes.optionItem} />
            </Grid>
            <Grid item className={classes.options}>
              <SquareIconButton label='label.create' color='primary' onClick={e => this.setState({ newMenuAnchor: e.currentTarget })} icon={psAddAlt} className={classes.optionItem} />
              <Divider orientation='vertical' className={[classes.split, classes.optionItem].join(' ')} />
              <Menu
                id='new-menu'
                anchorEl={this.state.newMenuAnchor}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                PaperProps={{ className: classes.menu }}
                getContentAnchorEl={null}
                open={Boolean(this.state.newMenuAnchor)}
                onClose={e => this.setState({ newMenuAnchor: null })}
              >
                <MenuItem onClick={e => {
                  history.push('/repositories/new')
                  this.setState({ newMenuAnchor: null })
                }}>
                  <ListItemText disableTypography primary={intl.formatMessage({ id: 'label.newRepository' })} />
                </MenuItem>
                <MenuItem onClick={e => {
                  history.push('/groups/new')
                  this.setState({ newMenuAnchor: null })
                }}>
                  <ListItemText disableTypography primary={intl.formatMessage({ id: 'label.newGroup' })} />
                </MenuItem>
                <MenuItem onClick={e => {
                  history.push('/mergerequests/new')
                  this.setState({ newMenuAnchor: null })
                }}>
                  <ListItemText disableTypography primary={intl.formatMessage({ id: 'label.createMergeRequest' })} />
                </MenuItem>
              </Menu>
              <SquareIconButton label='label.notification' icon={plBell} badge={currentUserInfo.unReadNotification} className={classes.optionItem} onClick={e => notificationOpenStatusToggle()} />
              <LanguageSelect className={classes.optionItem} />
              <SquareIconButton label='label.doc' onClick={e => window.open('/doc/' + (currentLanguage === 'en-us' ? 'en' : 'cn'), '_blank')} icon={plHelp} className={classes.optionItem} />
              {currentUserInfo.admin && <SquareIconButton label='label.adminArea' onClick={() => { history.push('/admin') }} icon={plRepair} className={classes.optionItem} />}
              <UserOption className={classes.optionItem} />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    )
  }
}

Header.propTypes = {
  intl: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  scrollTrigger: PropTypes.bool.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  notificationOpenStatusToggle: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo,
    currentLanguage: state.DataStore.currentLanguage
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    notificationOpenStatusToggle: () => dispatch({ type: 'notification.notificationOpenStatus.toggle' })
  }
}

export default injectIntl(
  withRouter(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(
        withScrollTrigger(scrollTriggerOptions)(Header)
      )
    )
  )
)
