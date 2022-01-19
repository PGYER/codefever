// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

// component
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Collapse from '@material-ui/core/Collapse'
import Typography from '@material-ui/core/Typography'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ListItemText from '@material-ui/core/ListItemText'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { psHome } from '@pgyer/icons'
import Constants from 'APPSRC/config/Constants'

import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

const styles = (theme) => ({
  list: {
    marginTop: theme.spacing(3)
  },
  listItem: {
    overflow: 'hidden',
    width: theme.spacing(34),
    height: theme.spacing(5),
    borderRadius: theme.spacing(0.5),
    transition: [theme.transitions.create('width'), theme.transitions.create('padding')].join(','),
    cursor: 'pointer',
    '& svg, & span': {
      color: theme.palette.text.light
    },
    '&:hover': {
      '& > div > svg': {
        color: theme.palette.primary.main
      },
      '& span': {
        color: theme.palette.text.main
      }
    }
  },
  listItemExpand: {
    padding: '0px ' + theme.spacing(4) + 'px'
  },
  listItemCollapsed: {
    width: theme.spacing(5),
    minWidth: theme.spacing(5),
    padding: '0px ' + theme.spacing(1.5) + 'px'
  },
  listItemText: {
    margin: 0,
    overflow: 'hidden',
    transition: theme.transitions.create('height'),
    '& > span': {
      lineHeight: theme.spacing(5) + 'px'
    }
  },
  listItemTextExpand: {
    height: theme.spacing(5) + 'px'
  },
  listItemTextCollapsed: {
    height: 0
  },
  drawerHeader: {
    display: 'flex',
    overflow: 'hidden',
    alignItems: 'center',
    height: theme.spacing(4),
    width: theme.spacing(28),
    background: theme.palette.background.main,
    padding: theme.spacing(1) + 'px ' + theme.spacing(3) + 'px',
    transition: [theme.transitions.create('width'), theme.transitions.create('padding')].join(',')
  },
  drawerHeaderExpand: {
    width: theme.spacing(28),
    padding: theme.spacing(1) + 'px ' + theme.spacing(3) + 'px'
  },
  drawerHeaderCollapsed: {
    width: theme.spacing(4),
    padding: theme.spacing(1) + 'px ' + theme.spacing(0.5) + 'px'
  },
  active: {
    backgroundColor: theme.palette.background.light,
    '& span': {
      color: theme.palette.text.main
    }
  },
  secondCollapse: {
    backgroundColor: theme.palette.background.light
  },
  morePadding: {
    width: theme.spacing(34),
    borderRadius: theme.spacing(0.5),
    paddingBottom: theme.spacing(2) + 'px',
    backgroundColor: theme.palette.background.light
  },
  secondActive: {
    borderRadius: theme.spacing(0.5),
    backgroundColor: theme.palette.background.main,
    '& span': {
      color: theme.palette.text.main
    }
  },
  home: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main
  },
  iconActive: {
    color: theme.palette.primary.main + ' !important'
  },
  avatar: {
    cursor: 'pointer',
    width: theme.spacing(4),
    height: theme.spacing(4)
  },
  title: {
    fontSize: '18px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    height: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    lineHeight: theme.spacing(4) + 'px',
    transition: theme.transitions.create('height')
  },
  titleExpand: {
    height: theme.spacing(4)
  },
  titleCollapsed: {
    height: 0
  },
  button: {
    '&:hover': {
      background: theme.palette.primary.main
    }
  }
})

class DrawerList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: {},
      itemSwitch: false,
      itemName: null,
      avatarHover: false
    }
  }

  openChildren (key) {
    const newOpen = { ...this.state.open }
    newOpen[key] = !newOpen[key]
    this.setState({ open: newOpen })
  }

  render () {
    const {
      classes, drawerExpandStatus, drawerConfig, location, intl, mode,
      repositoryList, currentRepositoryKey, groupList, currentGroupKey
    } = this.props

    const listItems = drawerConfig.map((item, key) => {
      let activeFlag = false
      item.activePattern.map((pattern) => {
        if (location.pathname && location.pathname.match(pattern)) {
          activeFlag = true
        }
        return true
      })
      const firstLevel = (
        <ListItem
          className={[
            classes.listItem,
            activeFlag ? classes.active : '',
            drawerExpandStatus ? classes.listItemExpand : classes.listItemCollapsed
          ].join(' ')}
          onClick={() => {
            this.props.history.push(item.path)
            item.children && this.openChildren(key)
          }}
        >
          <ListItemIcon>
            <FontAwesomeIcon icon={item.icon} className={[
              classes.listIcon,
              activeFlag ? classes.iconActive : ''
            ].join(' ')} />
          </ListItemIcon>
          <ListItemText className={[
            classes.listItemText,
            drawerExpandStatus ? classes.listItemTextExpand : classes.listItemTextCollapsed
          ].join(' ')} primary={intl.formatMessage({ id: item.name })} />
          <Typography variant='caption'>{item.count}</Typography>
          {item.children ? (this.state.open[key] ? <ExpandLess /> : <ExpandMore />) : ''}
        </ListItem>
      )

      const secondLevel = item.children
        ? item.children.map((sitem, skey) => {
          let secondActiveFlag = false
          sitem.activePattern.map((pattern) => {
            if (location.pathname && location.pathname.match(pattern)) {
              secondActiveFlag = true
            }
            return true
          })
          const sListItem = (
            <Collapse
              in={this.state.open[key] && drawerExpandStatus}
              timeout='auto'
              unmountOnExit
              onClick={() => this.props.history.push(sitem.path)}
              className={activeFlag ? classes.secondCollapse : ''}
              key={skey}
            >
              <List component='div' disablePadding>
                <ListItem className={classes.listItem}>
                  <ListItemText
                    className={[
                      classes.listItemText,
                      secondActiveFlag ? classes.secondActive : '',
                      drawerExpandStatus ? classes.listItemTextExpand : classes.listItemTextCollapsed
                    ].join(' ')}
                    inset
                    primary={intl.formatMessage({ id: sitem.name })}
                  />
                </ListItem>
              </List>
            </Collapse>
          )
          return sListItem
        })
        : ''

      return (
        <div key={key} className={(item.children && activeFlag && this.state.open[key] && drawerExpandStatus) ? classes.morePadding : ''}>
          {firstLevel}
          {secondLevel}
        </div>
      )
    })

    const avatarProps = {}
    const currentProject = repositoryList.filter(FilterGenerator.id(currentRepositoryKey))[0]
    const currentGroup = groupList.filter(FilterGenerator.id(currentGroupKey))[0]
    if (['repository', 'group'].includes(mode)) {
      const icon = (currentProject && currentProject.icon) || (currentGroup && currentGroup.icon)
      const name = (currentProject && currentProject.name) || (currentGroup && currentGroup.name)
      if (icon) {
        avatarProps.src = Constants.HOSTS.STATIC_AVATAR_PREFIX + icon
      } else if (name) {
        avatarProps.children = name[0].toUpperCase()
      }

      if (mode === 'repository') {
        avatarProps.onClick = () => { this.props.history.push('/' + currentProject.group.name + '/' + currentProject.name + '/') }
      } else if (mode === 'group') {
        avatarProps.onClick = () => { this.props.history.push('/groups/' + currentGroup.name) }
      }

      avatarProps.onMouseEnter = () => { this.setState({ avatarHover: true }) }
      avatarProps.onMouseLeave = () => { this.setState({ avatarHover: false }) }

      if (this.state.avatarHover) {
        avatarProps.src = ''
        avatarProps.children = <Tooltip title={intl.formatMessage({ id: 'message.backHome' })} placement='top'>
          <Button variant='contained' color='primary' className={classes.button}><FontAwesomeIcon icon={psHome} style={{ width: 16 }} /></Button>
        </Tooltip>
        avatarProps.onClick = () => {
          this.props.history.push('/repositories')
          this.setState({ avatarHover: false })
        }
      }
    } else {
      avatarProps.src = '/static/00000000000000/images/logo-ico.png'
      avatarProps.onClick = () => {
        this.props.history.push('/repositories')
        this.setState({ avatarHover: false })
      }
    }

    return (
      <React.Fragment>
        <div className={[
          classes.drawerHeader,
          drawerExpandStatus ? classes.drawerHeaderExpand : classes.drawerHeaderCollapsed
        ].join(' ')}>
          <Avatar variant='square' className={[classes.avatar, this.state.avatarHover && classes.home].join(' ')} {...avatarProps} />
          <Typography variant='subtitle1' component='div' className={[
            classes.title,
            drawerExpandStatus ? classes.titleExpand : classes.titleCollapsed
          ].join(' ')}>
            {mode === 'default' && 'CodeFever'}
            {mode === 'admin' && 'CodeFever Admin'}
          </Typography>
        </div>
        <List className={classes.list} component='nav'>{listItems}</List>
      </React.Fragment>
    )
  }
}

DrawerList.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  drawerExpandStatus: PropTypes.bool.isRequired,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  currentRepositoryKey: PropTypes.string,
  currentGroupKey: PropTypes.string,
  drawerConfig: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    drawerExpandStatus: state.DrawerStates.expandStatus,
    repositoryList: state.DataStore.repositoryList,
    groupList: state.DataStore.groupList,
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    currentGroupKey: state.DataStore.currentGroupKey
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(
      withRouter(DrawerList)
    )
  )
)
