// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import RefFilter from 'APPSRC/components/unit/RefFilter'
import RefList from 'APPSRC/components/unit/RefList'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

// style
const styles = theme => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  }
})

class BranchList extends Component {
  constructor (props) {
    super(props)
    this.observed = {
      keyword: this.props.match.params.branch ? this.props.match.params.branch : '',
      tabValue: 0,
      data: null
    }

    this.state = {
      refTitles: [],
      branchLists: null,
      pending: true,
      repage: 0,
      sortDesc: true
    }
  }

  componentDidMount () {
    this.getData(this.props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.getData(nextProps)
      return false
    }
    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.getData(nextProps)
      return false
    }
    if (this.state.sortDesc !== nextState.sortDesc) {
      this.dataSort(nextState.sortDesc)
      return false
    }
    return true
  }

  getData (props) {
    if (!props.currentRepositoryKey || !props.currentRepositoryConfig.repository) {
      return false
    }

    RepositoryData.branchList({
      repository: props.currentRepositoryKey
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ pending: false })
        if (!data.code) {
          this.observed.data = data.data
          this.dataSort(this.state.sortDesc)
        }
      })
  }

  dataSort (sortDesc) {
    if (this.observed.data) {
      this.observed.data.sort((item1, item2) => {
        return sortDesc ? (item2.commit.time - item1.commit.time) : (item1.commit.time - item2.commit.time)
      })
      this.dataFilter(this.observed.tabValue)
    }
  }

  dataFilter (tabValue) {
    const { data, keyword } = this.observed

    this.observed.tabValue = tabValue
    let branchList = null
    if (data === null || !data.length) {
      branchList = []
    } else if (!keyword) {
      branchList = data
    } else {
      branchList = data.filter(FilterGenerator.nameLikes(keyword))
    }

    const activeData = []
    const inactiveData = []
    const nowTimestamp = Math.floor((new Date()).getTime() / 1000)
    const threeMonth = 7776000
    branchList.map((item, index) => {
      if ((nowTimestamp - item.commit.time <= threeMonth) && (tabValue === 0 || tabValue === 1)) {
        activeData.push(item)
      } else if ((nowTimestamp - item.commit.time > threeMonth) && (tabValue === 0 || tabValue === 2)) {
        inactiveData.push(item)
      }
      return true
    })

    const refTitles = []
    const refLists = []
    if (tabValue === 0) {
      refTitles.push('active', 'inactive')
      refLists.push(activeData, inactiveData)
    } else if (tabValue === 1) {
      refTitles.push('active')
      refLists.push(activeData)
    } else if (tabValue === 2) {
      refTitles.push('inactive')
      refLists.push(inactiveData)
    }

    this.setState({
      refTitles: refTitles,
      branchLists: refLists,
      repage: this.state.repage + 1
    })
  }

  filterBranch (keyword) {
    this.observed.keyword = keyword
    this.dataFilter(this.observed.tabValue)
  }

  deleteBranch (branch) {
    const { currentRepositoryKey, intl } = this.props
    if (!currentRepositoryKey || !branch) {
      return false
    }

    RepositoryData.deleteBranch({
      repository: currentRepositoryKey,
      branch: branch
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.observed.data = this.observed.data.filter((item, index) => {
            return item.name !== branch
          })
          this.props.dispatchEvent(EventGenerator.NewNotification(
            intl.formatMessage({ id: 'message.deleted' }),
            0)
          )
          this.dataFilter(this.observed.tabValue)
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            intl.formatMessage({ id: 'message.error.deleteFail' }),
            2)
          )
        }
        this.props.dispatchEvent(EventGenerator.cancelComformation())
      })
  }

  deleteConfirm (branch) {
    const { intl } = this.props
    this.props.dispatchEvent(EventGenerator.addComformation('branch_remove', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.branch' }) + ' \'' + branch + '\' ' }),
      description: '',
      reject: () => { return true },
      accept: () => {
        this.deleteBranch(branch)
      }
    }))
  }

  render () {
    const { refTitles, branchLists, pending, repage, sortDesc } = this.state
    return (<Grid container spacing={3}>
      <RefFilter
        refType='branch'
        pending={pending}
        tabValue={this.observed.tabValue}
        tabChange={value => this.dataFilter(value)}
        searchRef={(keyword) => this.filterBranch(keyword)}
        sortDesc={sortDesc}
        sortSwitch={() => this.setState({ sortDesc: !sortDesc })}>
        { branchLists
          ? <RefList
            refType='branch'
            count={this.observed.data ? this.observed.data.length : 0}
            refTitles={refTitles}
            refLists={branchLists}
            deleteRef={(branch) => this.deleteConfirm(branch)}
            repage={repage}
            pending={pending}
            tabValue={this.observed.tabValue} />
          : <Grid container spacing={2} className={this.props.classes.loading}>
            <CircularProgress />
          </Grid>
        }
      </RefFilter>
    </Grid>
    )
  }
}

BranchList.propTypes = {
  currentRepositoryKey: PropTypes.string.isRequired,
  currentRepositoryConfig: PropTypes.object,
  match: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
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
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(BranchList)
    )
  )
)
