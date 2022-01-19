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
import { faAngleDown, faBox } from '@fortawesome/free-solid-svg-icons'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import UAC from 'APPSRC/config/UAC'
import { injectIntl } from 'react-intl'

// style
const styles = theme => ({})

class RepositoryList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      anchorElement: null
    }
  }

  componentDidMount () {}

  getToProject (repositoryInfo) {
    this.setState({ anchorElement: null })
    this.props.history.push('/' + repositoryInfo.group.name + '/' + repositoryInfo.name + '/')
  }

  render () {
    const { intl, history, currentRepositoryKey, repositoryList, groupList } = this.props
    const list = repositoryList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.REPO_READ))
      .map((item, key) => (
        <MenuItem key={key} onClick={(ev) => { this.getToProject(item) }} >
          <ListItemIcon>
            <FontAwesomeIcon icon={faBox} />
          </ListItemIcon>
          <ListItemText disableTypography primary={item.group.displayName + '/' + item.displayName} />
        </MenuItem>)
      )
    const currentProject = repositoryList
      .filter(FilterGenerator.id(currentRepositoryKey))[0]

    const currentGroup = currentProject ? groupList.filter(FilterGenerator.id(currentProject.group.id))[0] : {}

    return (
      <span>
        { this.props.repositoryList.length
          ? <Button
            color='inherit'
            aria-owns='user-menu'
            aria-haspopup='true'
            onClick={(ev) => { this.setState({ anchorElement: ev.currentTarget }) }}
          >
            { currentGroup
              ? currentProject
                ? currentProject.displayName
                : intl.formatMessage({ id: 'label.repository' })
              : currentProject
                ? currentProject.group.displayName + ' / ' + currentProject.displayName
                : intl.formatMessage({ id: 'label.repository' })
            }
            &nbsp;&nbsp; <FontAwesomeIcon icon={faAngleDown} />
          </Button>
          : <Button
            color='inherit'
            aria-owns='user-menu'
            aria-haspopup='true'
            onClick={(ev) => { history.push('/repositories/new') }}
            disabled
          >
            {intl.formatMessage({ id: 'label.newRepository' })}
          </Button>
        }

        { this.props.repositoryList.length > 0 && <Menu
          id='user-menu'
          anchorEl={this.state.anchorElement}
          transitionDuration={0}
          open={Boolean(this.state.anchorElement)}
          onClose={(ev) => { this.setState({ anchorElement: null }) }}
        >
          { list }
        </Menu> }
      </span>
    )
  }
}

RepositoryList.propTypes = {
  // classes: PropTypes.object.isRequired,
  // dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  currentRepositoryKey: PropTypes.string,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
    groupList: state.DataStore.groupList,
    currentRepositoryKey: state.DataStore.currentRepositoryKey
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
      connect(mapStateToProps, mapDispatchToProps)(RepositoryList)
    )
  )
)
