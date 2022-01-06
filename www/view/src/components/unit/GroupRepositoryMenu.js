// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// components
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { psRepository, psRepositoryGroup } from '@pgyer/icons'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import UAC from 'APPSRC/config/UAC'
import { injectIntl } from 'react-intl'

// style
const styles = theme => ({
  menu: {
    top: theme.spacing(7) + 'px !important',
    left: theme.spacing(3) + 'px !important',
    width: theme.spacing(34) + 'px !important'
  },
  button: {
    position: 'relative',
    maxWidth: '100%',
    paddingRight: theme.spacing(3),
    '& > span': {
      display: 'list-item',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    '& svg': {
      position: 'absolute',
      right: theme.spacing(1),
      top: '10px'
    }
  },
  icon: {
    fontSize: theme.spacing(2) + 'px'
  }
})

class GroupRepositoryMenu extends Component {
  constructor (props) {
    super(props)
    this.state = {
      anchorElement: null
    }
  }

  componentDidMount () {}

  getToRepository (repositoryInfo) {
    this.setState({ anchorElement: null })
    this.props.history.push('/' + repositoryInfo.group.name + '/' + repositoryInfo.name + '/')
  }

  getToGroup (groupInfo) {
    this.setState({ anchorElement: null })
    this.props.history.push('/groups/' + groupInfo.name + '/')
  }

  render () {
    const { classes, intl, history, match, currentRepositoryKey, currentGroupKey, repositoryList, groupList } = this.props
    const repositoryItems = repositoryList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.REPO_READ))
      .map((item, key) => (
        <MenuItem key={'r' + key} onClick={(ev) => { this.getToRepository(item) }} >
          <ListItemIcon>
            <FontAwesomeIcon icon={psRepository} className={classes.icon} />
          </ListItemIcon>
          <ListItemText disableTypography primary={item.group.displayName + '/' + item.displayName} />
        </MenuItem>)
      )

    const GroupItems = groupList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.REPO_READ))
      .map((item, key) => (
        <MenuItem key={'g' + key} onClick={(ev) => { this.getToGroup(item) }} >
          <ListItemIcon>
            <FontAwesomeIcon icon={psRepositoryGroup} className={classes.icon} />
          </ListItemIcon>
          <ListItemText disableTypography primary={item.displayName + ' /'} />
        </MenuItem>)
      )

    const currentProject = repositoryList
      .filter(FilterGenerator.id(currentRepositoryKey))[0]

    const currentGroup = groupList
      .filter(FilterGenerator.id(currentGroupKey))[0]

    return (
      <span>
        {this.props.repositoryList.length + this.props.groupList.length
          ? <Button
            color='inherit'
            aria-owns='user-menu'
            aria-haspopup='true'
            className={classes.button}
            onClick={(ev) => { this.setState({ anchorElement: ev.currentTarget }) }}
          >
            { currentProject
              ? currentProject.displayName
              : currentGroup
                ? currentGroup.displayName + ' /'
                : intl.formatMessage({ id: 'menu.repository_pl' })
            }
            <FontAwesomeIcon icon={faAngleDown} />
          </Button>
          : <Button
            color='inherit'
            aria-owns='user-menu'
            aria-haspopup='true'
            onClick={(ev) => { history.push('/repositories/new') }}
            disabled
          >
            {intl.formatMessage({ id: 'label.newRepository' })}
          </Button>}

        { (this.props.repositoryList.length + this.props.groupList.length) > 0 &&
        <Menu
          id='user-menu'
          anchorEl={this.state.anchorElement}
          open={Boolean(this.state.anchorElement)}
          onClose={(ev) => { this.setState({ anchorElement: null }) }}
          classes={{ paper: classes.menu }}
        >
          { match.params.repositoryName && repositoryItems }
          { match.params.groupName && !match.params.repositoryName && GroupItems }
        </Menu> }
      </span>
    )
  }
}

GroupRepositoryMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  // dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  currentRepositoryKey: PropTypes.string,
  currentGroupKey: PropTypes.string,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
    groupList: state.DataStore.groupList,
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    currentGroupKey: state.DataStore.currentGroupKey
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(GroupRepositoryMenu)
    )
  )
)
