// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles } from '@material-ui/core/styles'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { plSearch } from '@pgyer/icons'
import ActivityItem from 'APPSRC/components/unit/ActivityItem'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import GroupData from 'APPSRC/data_providers/GroupData'
import Constants from 'APPSRC/config/Constants'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'

const styles = (theme) => ({
  input: {
    width: theme.spacing(30),
    maxWidth: '100%'
  },
  icon: {
    color: theme.palette.text.light
  },
  marginTop3: {
    marginTop: theme.spacing(3)
  }
})

class ActivityList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activityList: [],
      page: 1,
      listFinshed: false,
      pending: true,
      category: 0,
      keyword: ''
    }

    this.observed = {
      keyword: ''
    }

    this.mountedFlag = false
  }

  componentDidMount () {
    this.setState({ page: 1, listFinshed: false, pending: true, activityList: [] })
    this.getData(this.props, this.state)
    this.mountedFlag = true
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    // watch currentAppKey
    if (JSON.stringify(this.props.currentGroupConfig) !== JSON.stringify(nextProps.currentGroupConfig)) {
      this.setState({ page: 1, listFinshed: false, pending: true, activityList: [] })
      this.getData(nextProps, nextState)
      return false
    }

    // watch project list
    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.setState({ page: 1, listFinshed: false, pending: true, activityList: [] })
      this.getData(nextProps, nextState)
      return false
    }

    if (this.state.page !== nextState.page && !nextState.pending) {
      this.setState({ pending: true })
      this.getData(nextProps, nextState)
      return false
    }

    if (this.state.category !== nextState.category) {
      this.setState({ pending: true, page: 1, activityList: [] })
      this.getData(nextProps, nextState)
      return false
    }

    return true
  }

  getData (props, state) {
    this.observed.keyword = state.keyword
    if (props.currentRepositoryConfig.repository) {
      // load repository activities
      RepositoryData.activities({ repository: props.currentRepositoryKey, category: state.category, keyword: state.keyword, page: state.page, pagesize: 20 })
        .then(NetworkHelper.withEventdispatcher(props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          if (!data.code) {
            const listFinshed = data.data.length < 20
            this.setState({ pending: false, activityList: [...this.state.activityList, ...data.data], listFinshed })
          }
        })
    } else if (props.currentGroupConfig.group) {
      // load group activities
      GroupData.activities({ group: props.currentGroupKey, category: state.category, keyword: state.keyword, page: state.page, pagesize: 20 })
        .then(NetworkHelper.withEventdispatcher(props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          if (!data.code) {
            const listFinshed = data.data.length < 20
            this.setState({ pending: false, activityList: [...this.state.activityList, ...data.data], listFinshed })
          }
        })
    }
  }

  searchActivity () {
    if (this.observed.keyword !== this.state.keyword) {
      this.setState({ activityList: [] })
      this.getData(this.props, this.state)
    }
  }

  render () {
    const { intl, classes } = this.props
    const activityCategory = Constants.activityCategory
    const tabs = []
    tabs[activityCategory.all] = intl.formatMessage({ id: 'label.all' })
    tabs[activityCategory.commit] = intl.formatMessage({ id: 'label.commitActivity' })
    tabs[activityCategory.mergeRequest] = intl.formatMessage({ id: 'label.mergeRequestActivity' })
    tabs[activityCategory.member] = intl.formatMessage({ id: 'label.memberActivity' })

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TabHeader
            tabs={tabs}
            currentTab={this.state.category}
            onChange={(e, newValue) => this.setState({ category: newValue })}
          >
            <TextField
              variant='outlined'
              className={classes.input}
              placeholder=''
              defaultValue={this.state.keyword}
              onChange={(e) => this.setState({ keyword: e.target.value })}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  this.searchActivity()
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={plSearch} /></InputAdornment>
              }}
            />
          </TabHeader>
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            { this.state.activityList.length > 0 && this.state.activityList
              .map((item, key) => {
                return <ActivityItem key={key} item={item} />
              })
            }
          </Grid>
          <Grid container justifyContent='center' className={classes.marginTop3}>
            <Grid item>
              { this.state.pending
                ? <CircularProgress />
                : this.state.listFinshed
                  ? <Button size='small' disabled>
                    { intl.formatMessage({ id: 'label.noMore' }) }
                  </Button>
                  : <Button variant='contained' color='primary' size='small' disableElevation
                    onClick={e => this.setState({ page: this.state.page + 1 })}
                  >
                    { intl.formatMessage({ id: 'label.more' }) } &nbsp;&nbsp;
                    <FontAwesomeIcon icon={faAngleDown} />
                  </Button>
              }
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

ActivityList.propTypes = {
  // match: PropTypes.object.isRequired,
  // dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  // currentGroupKey: PropTypes.string.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  // currentRepositoryKey: PropTypes.string.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentGroupKey: state.DataStore.currentGroupKey,
    currentGroupConfig: state.DataStore.currentGroupConfig,
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(ActivityList)
  )
)
