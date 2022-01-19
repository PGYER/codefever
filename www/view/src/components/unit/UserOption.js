// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// assets

// components
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plMemberAlt, plKey, plExit, psCaretDown, plDraft } from '@pgyer/icons'
import { withStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Constants from 'APPSRC/config/Constants'

import { injectIntl } from 'react-intl'

// style
const styles = theme => ({
  settings: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  menu: {
    width: theme.spacing(30),
    marginTop: theme.spacing(1),
    padding: 0
  },
  list: {
    '& > li': {
      height: theme.spacing(5)
    },
    '& > hr': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  },
  name: {
    opacity: '1 !important',
    display: 'block',
    height: 'auto !important'
  },
  icon: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  },
  down: {
    marginLeft: theme.spacing(2),
    fontSize: theme.spacing(1)
  }
})

class UserOption extends Component {
  constructor (props) {
    super(props)
    this.state = {
      anchorEl: null
    }

    this.handleUserMenuClick = this.handleUserMenuClick.bind(this)
    this.handleUserMenuClose = this.handleUserMenuClose.bind(this)
    this.logout = this.logout.bind(this)
  }

  handleUserMenuClick (event) {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleUserMenuClose () {
    this.setState({ anchorEl: null })
  }

  logout () {
    this.setState({ anchorEl: null })
    window.location.href = '/user/logout'
  }

  goView (path) {
    this.setState({ anchorEl: null })
    this.props.history.push(path)
  }

  render () {
    const { currentUserInfo, classes, className, intl } = this.props

    return (
      <React.Fragment>
        <div className={[classes.settings, className].join(' ')} onClick={this.handleUserMenuClick}>
          <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + currentUserInfo.icon} className={classes.icon} />
          <FontAwesomeIcon icon={psCaretDown} className={classes.down} />
        </div>
        <Menu
          id='user-menu'
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleUserMenuClose}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          PaperProps={{ className: classes.menu }}
          MenuListProps={{ className: classes.list }}
          getContentAnchorEl={null}
        >
          <MenuItem disabled className={classes.name}>
            <Typography variant='h6' component='div'>
              { currentUserInfo.name }
            </Typography>
            <Typography variant='caption' component='div'>
              { currentUserInfo.email }
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={(ev) => { this.goView('/settings/profile') }}>
            <ListItemIcon>
              <FontAwesomeIcon icon={plMemberAlt} />
            </ListItemIcon>
            <ListItemText disableTypography primary={intl.formatMessage({ id: 'menu.profile' })} />
          </MenuItem>
          <MenuItem onClick={(ev) => { this.goView('/settings/email') }}>
            <ListItemIcon>
              <FontAwesomeIcon icon={plDraft} />
            </ListItemIcon>
            <ListItemText disableTypography primary={intl.formatMessage({ id: 'menu.mail' })} />
          </MenuItem>
          <MenuItem onClick={(ev) => { this.goView('/settings/sshkey') }}>
            <ListItemIcon>
              <FontAwesomeIcon icon={plKey} />
            </ListItemIcon>
            <ListItemText disableTypography primary={intl.formatMessage({ id: 'menu.SSHKey_pl' })} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={this.logout}>
            <ListItemIcon>
              <FontAwesomeIcon icon={plExit} />
            </ListItemIcon>
            <ListItemText disableTypography primary={intl.formatMessage({ id: 'menu.logout' })} />
          </MenuItem>
        </Menu>
      </React.Fragment>
    )
  }
}

UserOption.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  currentUserInfo: PropTypes.object.isRequired,
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
      connect(mapStateToProps, mapDispatchToProps)(
        UserOption
      )
    )
  )
)
