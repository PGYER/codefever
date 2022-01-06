// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

// components
import MainRoutes from 'APPSRC/routes/MainRoutes'
import UserData from 'APPSRC/data_providers/UserData'
import GroupData from 'APPSRC/data_providers/GroupData'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'

// helpers
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'

const styles = theme => ({
  container: {
    backgroundColor: theme.palette.background.light
  },
  content: {
    padding: 0
  },
  toolbar: theme.mixins.toolbar,
  mainContainer: {
    padding: theme.spacing(3) + 'px ' + theme.spacing(6) + 'px'
  }
})

class Main extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      groupListLoaded: false,
      repositoryListLoaded: false
    }
  }

  componentDidMount () {
    UserData.getUserInfo()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentUserInfo.update', data: data.data })
        }
      })

    RepositoryData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.repositoryList.update', data: data.data })
          this.setState({ repositoryListLoaded: true })
        }
      })

    GroupData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.groupList.update', data: data.data })
          this.setState({ groupListLoaded: true })
        }
      })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // load group config
    if (
      (nextState.groupListLoaded && this.state.groupListLoaded !== nextState.groupListLoaded) ||
      (this.props.match.params.groupName !== nextProps.match.params.groupName ||
        (this.props.match.params.repositoryName !== nextProps.match.params.repositoryName &&
          !nextProps.match.params.repositoryName
        )
      )
    ) {
      const currentGroup = nextProps.groupList.filter(FilterGenerator.name(nextProps.match.params.groupName))[0]

      if (currentGroup && currentGroup.id) {
        this.props.dispatchEvent({ type: 'data.currentGroupKey.update', data: currentGroup.id })
        this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: {} })
        if (nextProps.history.location.pathname.match(/^\/groups/i)) {
          GroupData.config({ gKey: currentGroup.id })
            .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
            .then((data) => {
              if (!data.code) {
                this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: data.data })
              } else {
                this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: {} })
              }
            })
        }
      } else {
        this.props.dispatchEvent({ type: 'data.currentGroupKey.update', data: '' })
        this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: {} })
      }
    } else if (!nextProps.match.params.groupName) {
      this.props.dispatchEvent({ type: 'data.currentGroupKey.update', data: '' })
      this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: {} })
    }

    // load repository config
    if ((nextState.repositoryListLoaded && this.state.repositoryListLoaded !== nextState.repositoryListLoaded) ||
      (this.props.match.params.groupName !== nextProps.match.params.groupName ||
        this.props.match.params.repositoryName !== nextProps.match.params.repositoryName
      )
    ) {
      const currentRepository = nextProps.repositoryList.filter(
        item =>
          item.group.name === nextProps.match.params.groupName &&
          item.name === nextProps.match.params.repositoryName
      )[0]

      if (currentRepository && currentRepository.id) {
        this.props.dispatchEvent({ type: 'data.currentRepositoryKey.update', data: currentRepository.id })
        RepositoryData.config({ rKey: currentRepository.id })
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: data.data })
              this.setState({ repositoryListLoaded: true })
            } else {
              this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: {} })
            }
          })
        this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: {} })
        this.props.dispatchEvent({ type: 'data.currentRepositoryError.update', data: false })
      } else {
        this.props.dispatchEvent({ type: 'data.currentRepositoryKey.update', data: '' })
        this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: {} })
        this.props.dispatchEvent({ type: 'data.currentRepositoryError.update', data: true })
      }
    }

    return true
  }

  render () {
    const { classes } = this.props
    return <div className={classes.container}>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div className={classes.mainContainer}>
          <MainRoutes />
        </div>
      </main>
    </div>
  }
}

Main.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  dispatchEvent: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
    groupList: state.DataStore.groupList
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default withStyles(styles)(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Main)
  )
)
