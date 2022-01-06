// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plBranch } from '@pgyer/icons'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import CommitItem from 'APPSRC/components/unit/CommitItem'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  title: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(3),
    borderBottom: '1px solid ' + theme.palette.border
  },
  repositorySelect: {
    border: '1px solid ' + theme.palette.border,
    borderRadius: theme.spacing(0.5) + 'px',
    overflow: 'hidden'
  },
  branchTitle: {
    lineHeight: theme.spacing(5) + 'px',
    background: theme.palette.background.main,
    padding: '0px ' + theme.spacing(2) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  branchSelect: {
    padding: theme.spacing(2)
  },
  commit: {
    borderTop: '1px solid ' + theme.palette.border
  },
  icon: {
    color: theme.palette.text.light
  },
  errorInfo: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  },
  hideError: {
    display: 'none'
  }
})

class CreateMergeRequest extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      originRepository: '',
      targetRepository: '',
      originBranch: '',
      targetBranch: '',
      originLastCommit: {},
      targetLastCommit: {},
      targetRepositoryList: [],
      targetRepositoryBranches: [],
      originRepositoryBranches: [],
      originRepositoryInfo: null,
      targetRepositoryInfo: null,
      error: false,
      groupName: props.match.params.groupName ? props.match.params.groupName : '',
      repositoryName: props.match.params.repositoryName ? props.match.params.repositoryName : ''
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.currentRepositoryConfig.repository !== undefined &&
      this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.getTargetRepository()
      return false
    }

    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.getTargetRepository()
      return false
    }

    if (this.props.repositoryList !== nextProps.repositoryList) {
      if (this.state.groupName && !this.state.repositoryName) {
        const groupRepository = nextProps.repositoryList.filter(FilterGenerator.groupName(this.state.groupName))
        if (groupRepository.length > 0) {
          this.getTargetRepository(groupRepository[0].id)
        }
      }
      if (!this.state.groupName && !this.state.repositoryName) {
        if (nextProps.repositoryList.length > 0) {
          this.getInitRepositoryBranches(nextProps.repositoryList[0].id)
          this.getTargetRepository(nextProps.repositoryList[0].id)
        }
      }
      return false
    }

    this.props.history.listen(location => {
      // 最新路由的 location 对象，可以通过比较 pathname 是否相同来判断路由的变化情况
      if (location.pathname === '/mergerequests/new') {
        this.setState({
          groupName: '',
          repositoryName: ''
        })
        return false
      }
    })

    if (this.state.originRepository !== nextState.originRepository && nextProps.repositoryList.length > 0) {
      if (this.state.groupName && !this.state.repositoryName) {
        const groupRepository = nextProps.repositoryList.filter(FilterGenerator.groupName(nextState.groupName))
        this.getInitRepositoryBranches(nextState.originRepository)
        if (groupRepository.length > 0) {
          this.getTargetRepository(nextState.originRepository)
        }
      } else if (!this.state.repositoryName && !this.state.groupName && !this.state.originRepository) {
        this.getInitRepositoryBranches(nextProps.repositoryList[0].id)
        this.getTargetRepository(nextState.originRepository)
      } else {
        this.getInitRepositoryBranches(nextState.originRepository)
        this.getTargetRepository(nextState.originRepository)
      }
      return false
    }

    if (!this.state.originRepository && !this.state.repositoryName && !this.state.groupName && nextProps.repositoryList.length > 0) {
      this.setState({ originRepository: nextProps.repositoryList[0].id })
      return true
    }

    if (!this.state.originRepository && !this.state.repositoryName && this.state.groupName && nextProps.repositoryList.length > 0) {
      const groupRepository = nextProps.repositoryList.filter(FilterGenerator.groupName(nextState.groupName))
      if (groupRepository.length) {
        this.getInitRepositoryBranches(groupRepository[0].id)
      }
      return false
    }

    return true
  }

  componentDidMount () {
    this.getTargetRepository()
  }

  getTargetRepository (repositoryKey = '') {
    const { currentRepositoryKey } = this.props

    if (!currentRepositoryKey && !repositoryKey) {
      return false
    }

    RepositoryData.targetRepository({
      repository: currentRepositoryKey || repositoryKey
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          let targetRepositoryKey = ''
          const targetRepositoryList = data.data
          targetRepositoryList.map((item) => {
            if (item.forkFlag) {
              targetRepositoryKey = item.rKey
            }
            return true
          })
          if (!targetRepositoryKey) {
            targetRepositoryKey = currentRepositoryKey || repositoryKey
          }
          RepositoryData.branchList({
            repository: targetRepositoryKey
          }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
            .then((data) => {
              if (!data.code) {
                this.setState({
                  originRepository: currentRepositoryKey || repositoryKey,
                  targetRepository: targetRepositoryKey,
                  targetRepositoryList: targetRepositoryList,
                  targetRepositoryBranches: data.data
                })
              }
            })
        }
      })
  }

  getInitRepositoryBranches (repositoryKey) {
    RepositoryData.branchList({
      repository: repositoryKey
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            originRepository: repositoryKey,
            originRepositoryBranches: data.data,
            error: false
          })
        }
      })
  }

  getOriginRepositoryBranches (e) {
    RepositoryData.branchList({
      repository: e.target.value
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            originRepository: e.target.value,
            originRepositoryBranches: data.data,
            error: false,
            originLastCommit: false,
            targetLastCommit: false
          })
        }
      })
  }

  getTargetRepositoryBranches (e) {
    RepositoryData.branchList({
      repository: e.target.value
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            targetRepository: e.target.value,
            targetRepositoryBranches: data.data,
            error: false,
            targetLastCommit: false
          })
        }
      })
  }

  selectOriginBranch (e) {
    const { currentRepositoryKey, repositoryList } = this.props
    const { originRepository } = this.state
    RepositoryData.lastCommitLog({
      ref: e.target.value,
      repository: currentRepositoryKey || originRepository
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const originRepositoryInfo = originRepository ? repositoryList.filter(FilterGenerator.id(originRepository)) : null
          this.setState({
            originLastCommit: data.data,
            originBranch: e.target.value,
            originRepositoryInfo: originRepositoryInfo[0],
            error: false
          })
        }
      })
  }

  selectTargetBranch (e) {
    const { repositoryList } = this.props
    const { targetRepository } = this.state
    RepositoryData.lastCommitLog({
      ref: e.target.value,
      repository: targetRepository
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const targetRepositoryInfo = targetRepository ? repositoryList.filter(FilterGenerator.id(targetRepository)) : null
          this.setState({
            targetLastCommit: data.data,
            targetBranch: e.target.value,
            targetRepositoryInfo: targetRepositoryInfo[0],
            error: false
          })
        }
      })
  }

  GoMergeRequestDetail () {
    const { history } = this.props
    const { originRepository, targetRepository, originBranch, targetBranch, targetRepositoryInfo } = this.state
    if (originRepository === targetRepository && originBranch === targetBranch) {
      this.setState({
        error: true
      })
    } else {
      history.push(makeLink(targetRepositoryInfo.group.name,
        targetRepositoryInfo.name,
        'mergerequests',
        'detail',
        originRepository,
        encodeURIComponent(originBranch),
        targetRepository,
        encodeURIComponent(targetBranch)
      ))
    }
  }

  render () {
    const { currentRepositoryConfig, classes, intl, repositoryList } = this.props
    const {
      targetRepositoryList,
      targetRepositoryBranches,
      originLastCommit,
      targetLastCommit,
      originBranch,
      targetBranch,
      originRepository,
      targetRepository,
      error,
      repositoryName,
      groupName,
      originRepositoryBranches,
      originRepositoryInfo,
      targetRepositoryInfo
    } = this.state
    let groupRepository = []
    if (!repositoryName && groupName) {
      groupRepository = repositoryList.filter(FilterGenerator.groupName(groupName))
    }
    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.title}>{ intl.formatMessage({ id: 'label.createMergeRequest' }) }</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Grid className={classes.repositorySelect}>
              <Typography variant='subtitle1' component='div' className={classes.branchTitle}>{intl.formatMessage({ id: 'label.sourceBranch' })}</Typography>
              <Grid container spacing={2} className={classes.branchSelect}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    select
                    value={originRepository.length ? originRepository : 'empty'}
                    onChange={(e) => this.getOriginRepositoryBranches(e)}
                    onClick={e => !originRepository && this.props.history.push(makeLink('repositories/new'))}
                  >
                    { repositoryName && currentRepositoryConfig.repository &&
                      <MenuItem key={currentRepositoryConfig.repository.id} value={currentRepositoryConfig.repository.id}>
                        {currentRepositoryConfig.repository.group.name}/{currentRepositoryConfig.repository.name}
                      </MenuItem>
                    }
                    { !!groupRepository.length && groupName && groupRepository.map((item, index) => {
                      if (item.group.name !== groupName) {
                        return null
                      }

                      return (<MenuItem key={item.id} value={item.id}>
                        {item.group.displayName + '/' + item.displayName}
                      </MenuItem>)
                    })
                    }
                    { groupRepository.length === 0 && originRepository.length === 0 && groupName && <MenuItem value='empty'>{intl.formatMessage({ id: 'label.createRepository' })}</MenuItem> }
                    {
                      !groupName && !repositoryName && !!originRepository.length && !!repositoryList.length && repositoryList.map((item, index) => {
                        return (<MenuItem key={item.id} value={item.id}>
                          {item.group.displayName + '/' + item.displayName}
                        </MenuItem>)
                      })
                    }
                    {(!originRepository.length || !repositoryList.length) && <MenuItem value='empty'>{intl.formatMessage({ id: 'label.createRepository' })}</MenuItem>}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    variant='outlined'
                    value={originBranch}
                    onChange={(e) => this.selectOriginBranch(e)}
                  >
                    <MenuItem disabled>{intl.formatMessage({ id: 'label.branch' })}</MenuItem>
                    { currentRepositoryConfig.branches && currentRepositoryConfig.branches.map((item, index) => {
                      return (<MenuItem key={index} value={item.name}>
                        <FontAwesomeIcon className={classes.icon} icon={plBranch} />&nbsp;&nbsp;
                        {item.name}
                      </MenuItem>)
                    })
                    }
                    {
                      !currentRepositoryConfig.branches && originRepositoryBranches && originRepositoryBranches.map((item, index) => {
                        return (<MenuItem key={index} value={item.name}>
                          <FontAwesomeIcon className={classes.icon} icon={plBranch} />&nbsp;&nbsp;
                          {item.name}
                        </MenuItem>)
                      })
                    }
                  </TextField>
                </Grid>
              </Grid>
              { (originRepositoryInfo || currentRepositoryConfig.repository) && originLastCommit && originBranch && <Grid item xs={12} className={classes.commit}>
                <CommitItem
                  showBorder={Boolean(false)}
                  data={originLastCommit}
                  current={originBranch}
                  currentRefType={'branch'}
                  currentGroup={originRepositoryInfo.group.name || currentRepositoryConfig.repository.group.name}
                  currentRepositoryConfig={currentRepositoryConfig.repository ? currentRepositoryConfig : originRepositoryInfo}
                  currentRepository={currentRepositoryConfig.repository ? currentRepositoryConfig.repository.name : originRepositoryInfo.name}
                  linkPathBase={makeLink(
                    originRepositoryInfo.group.name || currentRepositoryConfig.repository.group.name,
                    currentRepositoryConfig.repository ? currentRepositoryConfig.repository.name : originRepositoryInfo.name,
                    'commit'
                  )} />
              </Grid>
              }
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid className={classes.repositorySelect}>
              <Typography variant='subtitle1' component='div' className={classes.branchTitle}>{intl.formatMessage({ id: 'label.targetBranch' })}</Typography>
              <Grid container spacing={2} className={classes.branchSelect}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    select
                    value={targetRepository.length ? targetRepository : 'empty'}
                    onChange={(e) => this.getTargetRepositoryBranches(e)}
                  >
                    { targetRepositoryList && targetRepositoryList.map((item, index) => {
                      return (<MenuItem key={item.rKey} value={item.rKey}>
                        {item.name}
                      </MenuItem>)
                    })
                    }
                    {
                      targetRepositoryList.length === 0 && <MenuItem value='empty'>{intl.formatMessage({ id: 'label.createRepository' })}</MenuItem>
                    }
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    variant='outlined'
                    value={targetBranch}
                    onChange={(e) => this.selectTargetBranch(e)}
                  >
                    <MenuItem disabled>{intl.formatMessage({ id: 'label.branch' })}</MenuItem>
                    { targetRepositoryBranches && targetRepositoryBranches.map((item, index) => {
                      return (<MenuItem key={index} value={item.name}>
                        <FontAwesomeIcon className={classes.icon} icon={plBranch} />&nbsp;&nbsp;
                        {item.name}
                      </MenuItem>)
                    })
                    }
                  </TextField>
                </Grid>
              </Grid>
              { (targetRepositoryInfo || currentRepositoryConfig.repository) && targetLastCommit && targetBranch && <Grid item xs={12} className={classes.commit}>
                <CommitItem
                  showBorder={Boolean(false)}
                  data={targetLastCommit}
                  current={targetBranch}
                  currentRefType={'branch'}
                  currentGroup={targetRepositoryInfo.group.name || currentRepositoryConfig.repository.group.name}
                  currentRepositoryConfig={currentRepositoryConfig.repository ? currentRepositoryConfig : targetRepositoryInfo}
                  currentRepository={currentRepositoryConfig.repository ? currentRepositoryConfig.repository.name : targetRepositoryInfo.name}
                  linkPathBase={makeLink(
                    targetRepositoryInfo.group.name || currentRepositoryConfig.repository.group.name,
                    currentRepositoryConfig.repository ? currentRepositoryConfig.repository.name : targetRepositoryInfo.name,
                    'commit'
                  )} />
              </Grid>
              }
            </Grid>
          </Grid>
          {error && <React.Fragment>
            <Grid item xs={6} />
            <Grid item xs={6}>
              <Typography
                variant='h6'
                component='div'
                align='center'
                className={error ? classes.errorInfo : classes.hideError}
              >
                {intl.formatMessage({ id: 'message.selectDifferentBranch' })}
              </Typography>
            </Grid>
          </React.Fragment>
          }
          <Grid item xs={12} align='right'>
            <Button
              variant='contained'
              color='primary'
              disabled={!originRepository || !targetRepository || !originBranch || !targetBranch || error}
              onClick={() => this.GoMergeRequestDetail()}
            >
              {intl.formatMessage({ id: 'label.compareBranch' })}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    )
  }
}

CreateMergeRequest.propTypes = {
  repositoryList: PropTypes.array.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
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
      connect(mapStateToProps, mapDispatchToProps)(CreateMergeRequest)
    )
  )
)
