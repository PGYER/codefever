// core
import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { withStyles, withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'

// component
import CommitItem from 'APPSRC/components/unit/CommitItem'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import RevisionSelector from 'APPSRC/components/unit/RevisionSelector'
import TitleList from 'APPSRC/components/unit/TitleList'
import CircularProgress from '@material-ui/core/CircularProgress'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import DateFnsUtils from '@date-io/date-fns'
import Button from '@material-ui/core/Button'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { plSearch } from '@pgyer/icons'

import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { makeLink, getDefaultBranch } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  path: {
    lineHeight: theme.spacing(4) + 'px'
  }
})

class CommitList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      commitList: [],
      page: 1,
      pending: false,
      listFinshed: false,
      searchInput: '',
      search: ''
    }

    this.pageSize = 20
    this.mountedFlag = false
  }

  componentDidMount () {
    this.mountedFlag = true
    this.setState({ page: 1, listFinshed: false, commitList: [], searchInput: '', search: '' })
    this.getData(this.props, this.state)
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    // change any change that is nned to reload commit to a page number change
    if (
      this.props.currentRepositoryKey !== nextProps.currentRepositoryKey ||
      this.props.match.params.rev !== nextProps.match.params.rev ||
      JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)
    ) {
      this.setState({ page: 1, listFinshed: false, commitList: [], searchInput: '', search: '' })
      if (nextState.page === 1 && nextState.search === '') {
        this.getData(nextProps, nextState)
      }
      return false
    }

    if (this.state.search !== nextState.search) {
      this.setState({ page: 1, listFinshed: false, commitList: [] })
      if (nextState.page === 1) {
        this.getData(nextProps, nextState)
      }
      return false
    }

    if (this.state.page !== nextState.page) {
      this.getData(nextProps, nextState)
      return false
    }

    return true
  }

  getData (props, state) {
    if (!props.currentRepositoryConfig.repository || state.pending || !this.mountedFlag) {
      return false
    }

    if (!props.currentRepositoryConfig.branches || !props.currentRepositoryConfig.branches.length) {
      return false
    }

    const { intl } = props
    this.setState({ pending: true })
    RepositoryData.commitList({
      repository: props.currentRepositoryKey,
      revision: (props.match.params.rev && decodeURIComponent(props.match.params.rev)) || getDefaultBranch(props.currentRepositoryConfig),
      path: props.match.params.path ? decodeURIComponent(props.match.params.path) : '',
      page: state.page,
      pagesize: this.pageSize,
      keyword: state.search
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const result = data.data
          const list = []
          let index = 0
          let currentDate = ''
          list[index] = { date: '', list: [] }
          if (result.length) {
            result.map((item, key) => {
              if (!currentDate) {
                currentDate = new DateFnsUtils().format((Number(item.time) * 1000), 'yyyy-MM-dd')
                list[index].date = currentDate
                list[index].list.push(item)
              } else {
                if (new DateFnsUtils().format((Number(item.time) * 1000), 'yyyy-MM-dd') === currentDate) {
                  list[index].date = currentDate
                  list[index].list.push(item)
                } else {
                  index = index + 1
                  list[index] = { date: '', list: [] }
                  currentDate = new DateFnsUtils().format((Number(item.time) * 1000), 'yyyy-MM-dd')
                  list[index].date = currentDate
                  list[index].list.push(item)
                }
              }
              return true
            })
            const listFinshed = result.length < this.pageSize

            list.map((tempItem, key) => {
              if (state.commitList.length > 0) {
                let dateExist = false
                state.commitList.map((originItem, key) => {
                  if (originItem.date === tempItem.date) {
                    dateExist = true
                    originItem.list = [...originItem.list, ...tempItem.list]
                    return originItem
                  }
                  if (!dateExist && key === state.commitList.length - 1) {
                    state.commitList.push(tempItem)
                  }
                  return true
                })
              }
              return true
            })
            if (!state.commitList.length || state.page === 1) {
              this.setState({
                pending: false,
                commitList: [...list],
                listFinshed
              })
            } else {
              this.setState({
                pending: false,
                commitList: [...this.state.commitList],
                listFinshed
              })
            }
          } else {
            this.setState({
              pending: false,
              listFinshed: true,
              commitList: []
            })
          }
        } else {
          props.dispatchEvent(EventGenerator.NewNotification(
            intl.formatMessage({ id: 'message.error.showCommitListFailed' }),
            2)
          )
        }
      })
  }

  pageReload (reload, refType, ref) {
    if (!refType || !ref) {
      refType = this.state.refType
      ref = this.state.ref
    }

    const { currentRepositoryConfig, history } = this.props
    const link = makeLink(
      currentRepositoryConfig.repository.group.name,
      currentRepositoryConfig.repository.name,
      'commits', refType, encodeURIComponent(ref)
    )

    return reload ? history.push(link) : link
  }

  filterCommits (keyword) {
    if (keyword) {
      this.observed.keyword = keyword
      this.setState({ page: 1 })
      this.getData(this.props, this.state)
    } else {
      this.observed.keyword = ''
      this.setState({ page: 1 })
    }
  }

  render () {
    const {
      commitList
    } = this.state
    const {
      currentRepositoryConfig,
      match,
      history,
      classes,
      intl
    } = this.props
    return <Grid container spacing={3}>
      {currentRepositoryConfig.branches && currentRepositoryConfig.branches.length !== 0 && <Grid item xs={12}>
        <Grid container justifyContent='space-between'>
          <Grid item>
            <RevisionSelector
              currentRevision={(match.params.rev && decodeURIComponent(match.params.rev)) || getDefaultBranch(currentRepositoryConfig)}
              revisionList={{ branches: currentRepositoryConfig.branches, tags: currentRepositoryConfig.tags }}
              onChange={(revision) => history.push(makeLink(
                currentRepositoryConfig.group.name,
                currentRepositoryConfig.repository.name,
                'commits',
                encodeURIComponent(revision)
              ))}
            />&nbsp;&nbsp;
            <Typography variant='body1' component='span' className={classes.path}>{!match.params.path ? '' : match.params.path.substr(1)}</Typography>
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              variant='outlined'
              disabled={this.state.pending}
              value={this.state.searchInput}
              onChange={(e) => this.setState({ searchInput: e.target.value })}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  this.setState({ search: e.target.value })
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={plSearch} /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
      </Grid>}

      {this.state.commitList.length > 0 && <Grid item xs={12}>
        <Grid container spacing={3}>
          {commitList.map((item, key) => {
            const title = item.date + ' [' + intl.formatMessage({ id: 'label._N_commit' }, { n: item.list.length }) + ']'
            return (<Grid item xs={12} key={key}>
              <TitleList title={title}>
                {item.list.map((listItem, key) => {
                  return (
                    <CommitItem key={key}
                      showBorder
                      path={match.params.path}
                      data={listItem}
                      linkPathBase={makeLink(
                        match.params.groupName,
                        match.params.repositoryName,
                        match.params.path ? 'files' : 'commit'
                      )}
                      currentRepositoryConfig={currentRepositoryConfig}
                    />
                  )
                })}
              </TitleList>
            </Grid>
            )
          })
          }
        </Grid>
      </Grid>}

      {!this.state.pending && this.state.commitList.length > 0 && <Grid item xs={12}>
        <Grid container spacing={2} justifyContent='center'>
          { this.state.pending
            ? <Button color='primary' size='small' disabled disableElevation>
              <CircularProgress size='1rem' color='inherit' /> &nbsp;&nbsp;
              { intl.formatMessage({ id: 'label.processing' }) }
            </Button>
            : this.state.listFinshed
              ? commitList.length > 0
                ? <Button size='small' disabled>
                  { intl.formatMessage({ id: 'label.noMore' }) }
                </Button>
                : ''
              : <Button variant='contained' color='primary' size='small' disableElevation
                onClick={e => this.setState({ page: this.state.page + 1 })}
              >
                { intl.formatMessage({ id: 'label.more' }) } &nbsp;&nbsp;
                <FontAwesomeIcon icon={faAngleDown} />
              </Button>
          }
        </Grid>
      </Grid>}

      {this.state.commitList.length === 0 && <Grid item xs={12}>
        <EmptyListNotice
          imageName={'commits-empty.png'}
          notice={intl.formatMessage({ id: 'message.noCommitRecord' })}
          pending={this.state.pending}
        />
      </Grid>}

    </Grid>
  }
}

CommitList.propTypes = {
  match: PropTypes.object.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
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
  withRouter(
    withTheme(
      withStyles(styles)(
        connect(mapStateToProps, mapDispatchToProps)(
          CommitList
        )
      )
    )
  )
)
