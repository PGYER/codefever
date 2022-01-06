// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { plSearch, plSortDesc } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import TitleList from 'APPSRC/components/unit/TitleList'
import MergeRequestItem from 'APPSRC/components/unit/MergeRequestItem'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import GroupData from 'APPSRC/data_providers/GroupData'
import Constants from 'APPSRC/config/Constants'

// helpers
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'

// style
const styles = theme => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  list: {
    marginTop: theme.spacing(3)
  },
  button: {
    marginLeft: theme.spacing(4)
  },
  input: {
    width: theme.spacing(30),
    maxWidth: '100%'
  },
  icon: {
    color: theme.palette.text.light
  },
  transform: {
    transform: 'rotateX(180deg)'
  },
  more: {
    paddingTop: theme.spacing(2)
  }
})

class MergeRequest extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true,
      isGlobal: !props.match.params.groupName,
      isRepository: null,
      tabValue: 0,
      keyword: '',
      sortDesc: true,
      page: 1,
      pagesize: 10,
      noMore: false,
      mrList: null,
      relatedRepository: []
    }

    this.observed = {
      keyword: ''
    }
  }

  componentDidMount () {
    this.getData(this.props, this.state, false)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.props.currentGroupConfig) !== JSON.stringify(nextProps.currentGroupConfig)) {
      this.getData(nextProps, nextState, false)
      return false
    }

    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.getData(nextProps, nextState, false)
      return false
    }

    if (this.state.page !== nextState.page && !nextState.pending) {
      this.setState({ pending: true })
      this.getData(nextProps, nextState, false)
      return false
    }

    if (this.state.sortDesc !== nextState.sortDesc) {
      this.getData(nextProps, nextState, true)
      return false
    }

    if (this.state.tabValue !== nextState.tabValue) {
      this.getData(nextProps, nextState, true)
      return false
    }

    return true
  }

  getData (props, state, reset) {
    if (reset) {
      this.observed.keyword = state.keyword
      this.setState({ pending: true, page: 1, mrList: null })
    }

    const data = {
      status: state.tabValue,
      keyword: state.keyword,
      sort: state.sortDesc ? 'desc' : 'asc',
      page: reset ? 1 : state.page,
      pagesize: state.pagesize
    }

    if (props.currentRepositoryConfig.repository) {
      data.repository = props.currentRepositoryConfig.repository.id
      RepositoryData.mergeRequests(data)
        .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          this.getDataDeal(data, true)
        })
    } else if (props.currentGroupConfig.group) {
      data.group = props.currentGroupConfig.group.id
      GroupData.mergeRequests(data)
        .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          this.getDataDeal(data, false)
        })
    } else if (state.isGlobal) {
      RepositoryData.relatedMergeRequests(data)
        .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          this.getDataDeal(data, false)
        })
    }
  }

  getDataDeal (data, isRepository) {
    if (!data.code) {
      this.setState({
        pending: false,
        isRepository: isRepository,
        mrList: [...(this.state.mrList ? this.state.mrList : []), ...(this.state.isGlobal ? data.data.mergeRequests : data.data)],
        noMore: (this.state.isGlobal ? data.data.mergeRequests.length : data.data.length) < this.state.pagesize,
        relatedRepository: data.data.relatedRepository
      })
    } else {
      this.setState({ mrList: [] })
    }
  }

  searchMergeRequests () {
    if (this.observed.keyword !== this.state.keyword) {
      this.getData(this.props, this.state, true)
    }
  }

  getTabs () {
    const { isRepository, isGlobal, relatedRepository } = this.state
    const { repositoryList, currentGroupConfig, currentRepositoryConfig, intl } = this.props
    const status = Constants.mergeRequestStatus
    const tabs = []
    tabs[0] = intl.formatMessage({ id: 'label.all' })
    tabs[status.open] = intl.formatMessage({ id: 'message.opened' })
    tabs[status.merged] = intl.formatMessage({ id: 'message.merged' })
    tabs[status.closed] = intl.formatMessage({ id: 'message.closed' })

    if (this.observed.keyword) {
      return tabs
    }

    const counts = []
    counts[0] = 0
    counts[status.open] = 0
    counts[status.merged] = 0
    counts[status.closed] = 0
    if (isRepository !== null) {
      if (isRepository) {
        counts[status.open] = currentRepositoryConfig.repository.mergeRequestCount.open
        counts[status.merged] = currentRepositoryConfig.repository.mergeRequestCount.merged
        counts[status.closed] = currentRepositoryConfig.repository.mergeRequestCount.closed
      } else {
        if (isGlobal) {
          repositoryList.map((item, index) => {
            relatedRepository.map((repositoryId) => {
              if (item.id === repositoryId) {
                counts[status.open] += item.mergeRequestCount.open
                counts[status.merged] += item.mergeRequestCount.merged
                counts[status.closed] += item.mergeRequestCount.closed
              }
              return true
            })
            return true
          })
        } else {
          repositoryList.map((item, index) => {
            if (item.group && currentGroupConfig.group && item.group.id === currentGroupConfig.group.id) {
              counts[status.open] += item.mergeRequestCount.open
              counts[status.merged] += item.mergeRequestCount.merged
              counts[status.closed] += item.mergeRequestCount.closed
            }
            return true
          })
        }
      }
      counts[0] = counts[status.open] + counts[status.merged] + counts[status.closed]
    }

    tabs[0] += '(' + counts[0] + ')'
    tabs[status.open] += '(' + counts[status.open] + ')'
    tabs[status.merged] += '(' + counts[status.merged] + ')'
    tabs[status.closed] += '(' + counts[status.closed] + ')'
    return tabs
  }

  render () {
    const { repositoryList, classes, history, intl } = this.props
    const { pending, isRepository, tabValue, sortDesc, page, noMore, mrList } = this.state

    return (<Grid item xs={12}>
      <TabHeader
        tabs={this.getTabs()}
        onChange={(e, newValue) => !pending && this.setState({ tabValue: newValue })}
        currentTab={tabValue}
      >
        <TextField
          variant='outlined'
          className={classes.input}
          placeholder=''
          defaultValue={this.state.keyword}
          onChange={e => this.setState({ keyword: e.target.value })}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              this.searchMergeRequests()
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={plSearch} /></InputAdornment>
          }}
        />&nbsp;
        <SquareIconButton label='label.sort' onClick={e => !pending && this.setState({ sortDesc: !sortDesc })} className={[classes.icon, sortDesc ? '' : classes.transform].join(' ')} icon={plSortDesc} />
        <Button variant='contained' color='primary' className={classes.button}
          disabled={pending}
          onClick={() => history.push(makeLink(history.location.pathname.substr(1), 'new'))}
        >
          {intl.formatMessage({ id: 'label.createMergeRequest' })}
        </Button>
      </TabHeader>
      <Grid container>
        <Grid item xs={12} className={classes.list}>
          { mrList
            ? mrList && mrList.length
              ? <React.Fragment>
                <TitleList title=''>{mrList.map((item, index) => {
                  return (<MergeRequestItem repositoryList={repositoryList} isRepository={isRepository} data={item} key={index} />)
                })}
                </TitleList>
                <Grid container className={classes.more} justifyContent='center'>
                  <Grid item>
                    { noMore
                      ? <Button size='small' disabled>
                        { intl.formatMessage({ id: 'label.noMore' }) }
                      </Button>
                      : pending
                        ? <Grid container>
                          <CircularProgress />
                        </Grid>
                        : <Button variant='contained' color='primary' size='small' disableElevation
                          onClick={e => this.setState({ page: page + 1 })}
                        >
                          { intl.formatMessage({ id: 'label.more' }) } &nbsp;&nbsp;
                          <FontAwesomeIcon icon={faAngleDown} />
                        </Button>
                    }
                  </Grid>
                </Grid>
              </React.Fragment>
              : <EmptyListNotice
                imageName='mergerequests-empty.png'
                title={intl.formatMessage({ id: 'message.mergeRequestEmpty' })}
              />
            : <Grid container spacing={2} className={classes.loading}>
              <CircularProgress />
            </Grid>
          }
        </Grid>
      </Grid>
    </Grid>
    )
  }
}

MergeRequest.propTypes = {
  repositoryList: PropTypes.array.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
    currentGroupConfig: state.DataStore.currentGroupConfig,
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
      connect(mapStateToProps, mapDispatchToProps)(MergeRequest)
    )
  )
)
