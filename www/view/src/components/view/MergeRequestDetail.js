// core component
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider'
import MenuItem from '@material-ui/core/MenuItem'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plMerge, plCheck, plMerged, plForbid, plConfirm, plAddAlt, plTrash } from '@pgyer/icons'
import MergeRequestDiff from 'APPSRC/components/unit/MergeRequestDiff'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import ActivityItem from 'APPSRC/components/unit/ActivityItem'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'
import CommitItem from 'APPSRC/components/unit/CommitItem'
import TitleList from 'APPSRC/components/unit/TitleList'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import Member from 'APPSRC/components/unit/Member'
import Constants from 'APPSRC/config/Constants'
import UAC from 'APPSRC/config/UAC'

// helper
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = theme => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  createMRTitle: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid ' + theme.palette.border
  },
  activityItem: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    height: theme.spacing(8),
    padding: '0px ' + theme.spacing(2) + 'px',
    '& > svg:first-child': {
      padding: '12px',
      borderRadius: '50%',
      marginRight: theme.spacing(2),
      color: theme.palette.primary.main,
      border: '1px solid ' + theme.palette.border,
      width: theme.spacing(5),
      height: theme.spacing(5),
      boxSizing: 'border-box'
    },
    '& > div:first-child': {
      width: theme.spacing(5),
      height: theme.spacing(5),
      marginRight: theme.spacing(2)
    }
  },
  activityItemLine: {
    top: '-12px',
    position: 'absolute',
    left: theme.spacing(4.5),
    height: theme.spacing(3),
    borderLeft: '1px solid ' + theme.palette.border
  },
  hideInput: {
    display: 'none'
  },
  tab: {
    marginTop: theme.spacing(3)
  },
  tabHeader: {
    position: 'sticky',
    top: theme.spacing(8),
    zIndex: 9,
    borderBottom: '1px solid ' + theme.palette.border
  },
  mergeRequestInfo: {
    border: 0
  },
  description: {
    padding: theme.spacing(2) + 'px'
  },
  button: {
    margin: theme.spacing(2) + 'px 0px'
  },
  icon: {
    color: theme.palette.text.light
  },
  assigned: {
    color: theme.palette.primary.main
  },
  members: {
    overflowY: 'auto',
    borderRadius: '4px',
    boxSizing: 'border-box',
    maxHeight: theme.spacing(27.5),
    border: '1px solid ' + theme.palette.border
  },
  member: {
    cursor: 'pointer',
    borderBottom: '1px solid ' + theme.palette.border,
    padding: theme.spacing(1.5) + 'px ' + theme.spacing(2) + 'px',
    '&:last-child': {
      border: 'none'
    },
    '&:hover': {
      background: theme.palette.background.main
    }
  },
  reviewersTitle: {
    height: theme.spacing(5),
    boxSizing: 'content-box',
    padding: '0px ' + theme.spacing(2) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  activityTitle: {
    marginBottom: theme.spacing(2)
  },
  reviewersMenuItem: {
    justifyContent: 'space-between',
    height: theme.spacing(5)
  },
  divider: {
    margin: theme.spacing(1) + 'px 0px'
  },
  deleteReviewer: {
    color: theme.palette.error.main
  },
  reviewersMember: {
    padding: theme.spacing(3) + 'px ' + theme.spacing(2) + 'px',
    height: theme.spacing(10)
  },
  noReviewers: {
    fontSize: '14px',
    textAlign: 'center',
    lineHeight: theme.spacing(10) + 'px'
  },
  cancel: {
    marginRight: theme.spacing(2)
  }
})

const CommiterAvatar = withStyles(theme => ({
  root: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  }
}))(Avatar)

class MergeRequestDetail extends React.Component {
  constructor (props) {
    super(props)

    const params = props.match.params
    this.state = {
      mid: params.mid ? params.mid : '',
      mergeRequestInfo: {
        id: '',
        sourceRepository: params.sourceRepository ? params.sourceRepository : '',
        sourceBranch: params.sourceBranch ? decodeURIComponent(params.sourceBranch) : '',
        targetRepository: params.targetRepository ? params.targetRepository : '',
        targetBranch: params.targetBranch ? decodeURIComponent(params.targetBranch) : ''
      },
      sourceRepositoryInfo: null,
      targetRepositoryInfo: null,
      requesterInfo: null,
      handlerInfo: null,
      title: params.sourceBranch ? decodeURIComponent(params.sourceBranch) : '',
      description: '',
      tabValue: 0,
      pending: true,
      changedFiles: [],
      fileDiff: [],
      effectFileCount: 0,
      addLine: 0,
      deleteLine: 0,
      commits: [],
      activities: [],
      showCommitInput: false,
      mergeMessage: '',
      usingSquash: false,
      error: {},
      hasMergeConflict: false,
      mergeStatus: 'open',
      versionList: [],
      latestVersion: '',
      baseVersion: '',
      submitMergeRequest: false,
      mergePending: false,

      reviewers: [],
      reviewersMenu: null,
      updateReviewersPending: false
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'message',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.branchName' }) }
        )
      },
      {
        name: 'message',
        passPattern: /^.{1,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 30 }
        )
      }
    ])
    this.getVersionDiff = this.getVersionDiff.bind(this)
  }

  componentDidMount () {
    this.props.closeDrawer()
    this.state.mid ? this.getDetailData(this.props, this.state) : this.getChangeData(this.props, this.state)
    if (this.state.mid) {
      this.getVersionList(this.state)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.repositoryList.length !== nextProps.repositoryList.length) {
      this.state.mid ? this.getDetailData(nextProps, nextState) : this.getChangeData(nextProps, nextState)
      this.getVersionList(nextState)
      return false
    }

    if (JSON.stringify(this.state.mergeRequestInfo) !== JSON.stringify(nextState.mergeRequestInfo)) {
      if (this.state.updateReviewersPending) {
        this.getActivities(this.state.mergeRequestInfo.targetRepository, this.state.mergeRequestInfo.id)
        return false
      }

      this.getChangeData(nextProps, nextState)
      this.getVersionList(nextState)
      return false
    }
    if (this.props.match.params.mid !== nextProps.match.params.mid) {
      this.setState({ mid: nextProps.match.params.mid })
      return false
    }
    if (this.state.mid !== nextState.mid) {
      this.getDetailData(nextProps, nextState)
      this.getVersionList(nextState)
      return false
    }
    if (this.state.mergeStatus !== nextState.mergeStatus) {
      this.getDetailData(nextProps, nextState)
      return false
    }
    if (this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.getDetailData(nextProps, nextState)
      return false
    }
    return true
  }

  getVersionDiff (sourceRepository, targetRepository, original, modified, props) {
    RepositoryData.fileChanges({
      versionCompare: true,
      repository: sourceRepository,
      original: original,
      targetRepository: targetRepository,
      modified: modified
    }).then(NetworkHelper.withEventdispatcher(props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const addtions = data.data.detail.reduce((accumulator, item) => accumulator + item.diff.additions, 0)
          const deletions = data.data.detail.reduce((accumulator, item) => accumulator + item.diff.deletions, 0)
          this.setState({
            pending: false,
            changedFiles: this.getFileTreeInfo(data.data.detail),
            fileDiff: data.data.detail,
            effectFileCount: data.data.count,
            addLine: addtions,
            deleteLine: deletions
          })
        }
      })
  }

  getChangeData (props, state) {
    const { repositoryList } = props
    const { id, sourceRepository, sourceBranch, targetRepository, targetBranch } = state.mergeRequestInfo
    if (!sourceRepository || !sourceBranch || !targetRepository || !targetBranch || !repositoryList.length) {
      return false
    }

    if (id) {
      this.getRepositories(props, state, false)
    } else {
      this.setState({
        submitMergeRequest: true
      })
      this.getRepositories(props, state, true)
    }
    RepositoryData.fileChanges({
      mergeRequest: id,
      repository: sourceRepository,
      original: sourceBranch,
      targetRepository: targetRepository,
      modified: targetBranch
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const addtions = data.data.detail.reduce((accumulator, item) => accumulator + item.diff.additions, 0)
          const deletions = data.data.detail.reduce((accumulator, item) => accumulator + item.diff.deletions, 0)
          this.setState({
            pending: false,
            changedFiles: this.getFileTreeInfo(data.data.detail),
            fileDiff: data.data.detail,
            effectFileCount: data.data.count,
            addLine: addtions,
            deleteLine: deletions
          })
        }

        RepositoryData.mergeRequestCommits({
          mergeRequest: id,
          sourceRepository: sourceRepository,
          sourceBranch: sourceBranch,
          targetRepository: targetRepository,
          targetBranch: targetBranch
        }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.setState({
                commits: data.data
              })
            }
          })

        if (this.state.mid) {
          this.getActivities(targetRepository, id)
        }
      })
  }

  getActivities (targetRepository, id) {
    RepositoryData.activities({
      repository: targetRepository,
      mergeRequest: id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            activities: data.data,
            updateReviewersPending: false
          })
        }
      })
  }

  getFileTreeInfo (data) {
    const fileChangedInfo = []
    for (let key = 0; key < data.length; key++) {
      const item = data[key]
      if (item.modified && item.modified.name) {
        fileChangedInfo.push({
          name: item.modified.name,
          add: item.diff.additions,
          delete: Math.abs(item.diff.deletions),
          hash: item.modified.sha
        })
      }
    }
    return fileChangedInfo
  }

  // if the user is creating the mr, then createMergeRequest = true
  getRepositories (props, state, createMergeRequest = false) {
    const { repositoryList } = props
    const { mergeRequestInfo } = state

    const target = repositoryList.filter(FilterGenerator.id(mergeRequestInfo.targetRepository))[0]
    this.setState({
      sourceRepositoryInfo: createMergeRequest ? repositoryList.filter(FilterGenerator.id(mergeRequestInfo.sourceRepository))[0] : state.mergeRequestInfo.sourceRepoInfo,
      targetRepositoryInfo: target,
      requesterInfo: mergeRequestInfo.submitter,
      handlerInfo: mergeRequestInfo.handler ? target.members.filter(FilterGenerator.id(mergeRequestInfo.handler))[0] : null
    })
  }

  createMergeRequest () {
    const { mergeRequestInfo, title, description, targetRepositoryInfo, reviewers, mergePending } = this.state
    const { history, intl } = this.props
    if (mergePending) {
      return false
    }

    this.setState({ mergePending: true })
    RepositoryData.createMergeRequest({
      sourceRepository: mergeRequestInfo.sourceRepository,
      sourceBranch: mergeRequestInfo.sourceBranch,
      targetRepository: mergeRequestInfo.targetRepository,
      targetBranch: mergeRequestInfo.targetBranch,
      title: title,
      description: description,
      reviewers: reviewers.join(',')
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ mergePending: false })
        if (!data.code) {
          this.setState({
            mid: data.data.id
          })

          history.push(makeLink(targetRepositoryInfo.group.name,
            targetRepositoryInfo.name,
            'mergerequests',
            data.data.id
          ))
        } else if (data.code === 0x0406) {
          this.props.dispatchEvent(
            EventGenerator.NewNotification(
              intl.formatMessage({ id: 'message.error.mergeRequestExists' }), 2
            )
          )
        } else if (data.code === 0x040F) {
          this.props.dispatchEvent(
            EventGenerator.NewNotification(
              intl.formatMessage({ id: 'message.error.branchProteced' }), 2
            )
          )
        } else {
          this.props.dispatchEvent(
            EventGenerator.NewNotification(
              intl.formatMessage({ id: 'message.error.createMergeRequestFail' }), 2
            )
          )
        }
      })
  }

  getDetailData (props, state) {
    const { currentRepositoryKey } = props
    const { mid } = state
    if (!mid || !currentRepositoryKey) {
      return false
    }

    RepositoryData.mergeRequestDetail({
      repository: currentRepositoryKey,
      mid: mid
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            mergeRequestInfo: data.data,
            reviewers: data.data.reviewers.map(item => item.user)
          })
        }
      })
  }

  getVersionList (state) {
    const { mergeRequestInfo } = state
    if (!mergeRequestInfo.id) {
      return false
    }

    RepositoryData.mergeRequestVersionList({
      mergeRequest: mergeRequestInfo.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            versionList: data.data.mergeVersionList || [],
            latestVersion: data.data.mergeVersionList.length > 0 ? data.data.mergeVersionList[0].sha : '',
            baseVersion: data.data.baseVersion,
            baseVersionList: data.data.baseVersionList
          })
        }
      })
  }

  checkMergeType () {
    const { mergeRequestInfo, mergeMessage, usingSquash, showCommitInput } = this.state
    const { intl } = this.props
    if (!mergeRequestInfo.id && (!this.checkInput() && showCommitInput)) {
      return false
    }

    this.setState({ mergePending: true })
    RepositoryData.checkMergeType({
      mergeRequest: mergeRequestInfo.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          if (data.data.canBeFastForward) {
            this.mergeBranch(this.props, this.state, '', false)
          } else {
            this.setState({
              showCommitInput: true
            })
            if (mergeMessage) {
              this.mergeBranch(this.props, this.state, mergeMessage, usingSquash)
            } else {
              this.setState({
                error: {
                  mergeMessage: intl.formatMessage({ id: 'message.error._S_empty' }, { s: this.props.intl.formatMessage({ id: 'label.mergeMessage' }) })
                },
                mergePending: false
              })
              return false
            }
          }
        } else {
          this.setState({ mergePending: false })
        }
      })
  }

  mergeBranch (props, state, message, usingSquash) {
    const { mergeRequestInfo } = state
    const { intl } = this.props
    if (!mergeRequestInfo.id) {
      return false
    }

    RepositoryData.mergeBranch({
      message: message,
      mergeRequest: mergeRequestInfo.id,
      usingSquash: usingSquash
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ mergePending: false })
        if (!data.code) {
          if (data.data.conflict) {
            this.setState({
              hasMergeConflict: true,
              mergeStatus: 'conflict',
              showCommitInput: false
            })
          } else {
            this.setState({
              mergeStatus: 'merged',
              showCommitInput: false
            })
          }
        } else if (data.code === 0x0405) {
          this.props.dispatchEvent(
            EventGenerator.NewNotification(
              intl.formatMessage({ id: 'message.error.userNotReview' }), 2
            )
          )
        } else if (data.code === 0x040F) {
          this.props.dispatchEvent(
            EventGenerator.NewNotification(
              intl.formatMessage({ id: 'message.error.branchProteced' }), 2
            )
          )
        } else {
          this.props.dispatchEvent(
            EventGenerator.NewNotification(
              intl.formatMessage({ id: 'message.error.mergeFail' }), 2
            )
          )
        }
      })
  }

  closeMergeRequest () {
    const { intl } = this.props
    if (!this.state.mergeRequestInfo) {
      return false
    }

    RepositoryData.mergeRequestClose({
      mergeRequest: this.state.mergeRequestInfo.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            mergeStatus: 'closed',
            showCommitInput: false
          })
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.closed' }), 0))
        }
      })
  }

  assignReviewer (isCreateMR, reviewer) {
    const { updateReviewersPending, mergeRequestInfo, reviewers } = this.state
    const { intl } = this.props
    if (updateReviewersPending || !reviewer || (!isCreateMR && !mergeRequestInfo.id)) {
      return false
    }

    if (isCreateMR) {
      reviewers.includes(reviewer) ? this.deleteReviewer(isCreateMR, reviewer) : this.setState({ reviewers: [reviewer] })
    } else {
      if (reviewers.includes(reviewer)) {
        return false
      }

      if (reviewers.length && this.isReview(reviewers[0])) {
        this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.reviewedCanNotAssign' }), 1))
        return false
      }

      this.setState({ updateReviewersPending: true })
      RepositoryData.assignReviewer({
        id: mergeRequestInfo.id,
        reviewer: reviewer
      }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          if (!data.code) {
            this.setState({ reviewers: [reviewer] })
            this.getDetailData(this.props, this.state)
            this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.updated' }), 0))
          } else {
            this.setState({ updateReviewersPending: false })
            data.code === 0x0405 && this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.reviewedCanNotAssign' }), 1))
          }
        })
    }
  }

  deleteReviewer (isCreateMR, reviewer) {
    const { updateReviewersPending, mergeRequestInfo, reviewers } = this.state
    const { intl } = this.props
    if (updateReviewersPending || !reviewer || (!isCreateMR && !mergeRequestInfo.id)) {
      return false
    }

    if (isCreateMR) {
      this.setState({ reviewers: reviewers.filter(item => item !== reviewer) })
    } else {
      if (this.isReview(reviewer)) {
        this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.reviewedCanNotDelete' }), 1))
        return false
      }

      this.setState({ updateReviewersPending: true })
      RepositoryData.deleteReviewer({
        id: mergeRequestInfo.id,
        reviewer: reviewer
      }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          if (!data.code) {
            this.setState({ reviewers: reviewers.filter(item => item !== reviewer) })
            this.getDetailData(this.props, this.state)
            this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.deleted' }), 0))
          } else {
            this.setState({ updateReviewersPending: false })
            data.code === 0x0405 && this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.reviewedCanNotDelete' }), 1))
          }
        })
    }
  }

  mergeRequestReview () {
    const { mergeRequestInfo, updateReviewersPending } = this.state
    const { intl } = this.props
    if (updateReviewersPending || !mergeRequestInfo.id) {
      return false
    }

    this.setState({ updateReviewersPending: true })
    RepositoryData.mergeRequestReview({
      id: mergeRequestInfo.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({ updateReviewersPending: false })
          this.getDetailData(this.props, this.state)
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.approved' }), 0))
        }
      })
  }

  isReview (reviewer) {
    const { mergeRequestInfo } = this.state
    if (!mergeRequestInfo.id) {
      return false
    }

    reviewer = mergeRequestInfo.reviewers.filter(item => item.user === reviewer)
    return reviewer.length ? reviewer[0].isReview : false
  }

  getTabs () {
    const { intl } = this.props
    const { changedFiles, commits, activities } = this.state
    const tabs = []
    tabs.push(intl.formatMessage({ id: 'label.codeDiff' }) + '(' + changedFiles.length + ')')
    tabs.push(intl.formatMessage({ id: 'label.commitActivity' }) + '(' + commits.length + ')')
    if (this.state.mid) {
      tabs.push(intl.formatMessage({ id: 'label.mergeRequestActivity' }) + '(' + activities.length + ')')
    }

    return tabs
  }

  render () {
    const { currentUserInfo, history, classes, intl } = this.props
    const {
      mergeRequestInfo,
      sourceRepositoryInfo,
      targetRepositoryInfo,
      requesterInfo,
      handlerInfo,
      title,
      description,
      tabValue,
      pending,
      changedFiles,
      fileDiff,
      effectFileCount,
      addLine,
      deleteLine,
      commits,
      activities,
      showCommitInput,
      mergeMessage,
      usingSquash,
      hasMergeConflict,
      versionList,
      latestVersion,
      baseVersion,
      baseVersionList,
      submitMergeRequest,
      reviewers,
      reviewersMenu
    } = this.state
    return (<Grid container>
      {
        !this.state.mid && (sourceRepositoryInfo || submitMergeRequest) && <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h6' component='div' className={classes.createMRTitle}>{ intl.formatMessage({ id: 'label.createMergeRequest' }) }</Typography>
            </Grid>
            <Grid item xs={9}>
              {intl.formatMessage(
                { id: 'message.from_S_Merge_S' },
                {
                  s1: sourceRepositoryInfo.group.name + '/' + sourceRepositoryInfo.name + ':' + mergeRequestInfo.sourceBranch,
                  s2: targetRepositoryInfo.group.name + '/' + targetRepositoryInfo.name + ':' + mergeRequestInfo.targetBranch
                }
              )}
            </Grid>
            <Grid item xs={3} align='right'>
              <Button variant='contained' color='primary'
                onClick={e => history.push(makeLink(sourceRepositoryInfo.group.name, sourceRepositoryInfo.name, 'mergerequests', 'new'))}
              >{intl.formatMessage({ id: 'label.modificationBranch' })}</Button>
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}><Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.title' })}</Typography></Grid>
                <Grid item xs={12}>
                  <TextField fullWidth variant='outlined' value={title} onChange={e => this.setState({ title: e.target.value })} />
                </Grid>
                <Grid item xs={12}><Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.description' })}</Typography></Grid>
                <Grid item xs={12}>
                  <TextField fullWidth variant='outlined' multiline rows={5} value={description} onChange={e => this.setState({ description: e.target.value })} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}><Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'message.assignReviewerTitle' })}</Typography></Grid>
                <Grid item xs={12}>
                  <Grid className={classes.members}>
                    {targetRepositoryInfo.members.map((item, index) => {
                      if (item.deleteFlag || item.role < UAC.Role.DEVELOPER) {
                        return false
                      }

                      return <Grid container key={index} justifyContent='space-between' alignItems='center' className={classes.member}
                        onClick={e => this.assignReviewer(true, item.id)}>
                        <Grid item><Member item={item} /></Grid>
                        <Grid item>{reviewers.includes(item.id) && <FontAwesomeIcon icon={plCheck} className={classes.assigned} />}</Grid>
                      </Grid>
                    })
                    }
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} className={classes.button}>
              <Grid container justifyContent='flex-end' alignItems='center'>
                <Grid item>
                  <Button variant='outlined' color='primary' disableElevation className={classes.cancel} onClick={e =>
                    history.push(makeLink(targetRepositoryInfo.group.name, targetRepositoryInfo.name, 'mergerequests'))}>
                    {intl.formatMessage({ id: 'label.cancel' })}
                  </Button>
                  <Button disabled={!title} variant='contained' color='primary' disableElevation onClick={e => this.createMergeRequest()}>
                    {intl.formatMessage({ id: 'label.submit' })}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      }
      {
        this.state.mid && mergeRequestInfo.id && <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant='h6' component='div'>
              {mergeRequestInfo.title}&nbsp;&nbsp;&nbsp;&nbsp;
              {mergeRequestInfo.status === Constants.mergeRequestStatus.open && <React.Fragment><InlineMarker color='success' background={false} icon={plConfirm} text={intl.formatMessage({ id: 'message.opened' })} />&nbsp;&nbsp;&nbsp;&nbsp;</React.Fragment>}
              {mergeRequestInfo.status === Constants.mergeRequestStatus.merged && <React.Fragment><InlineMarker color='info' background={false} icon={plMerged} text={intl.formatMessage({ id: 'message.merged' })} />&nbsp;&nbsp;&nbsp;&nbsp;</React.Fragment>}
              {mergeRequestInfo.status === Constants.mergeRequestStatus.closed && <React.Fragment><InlineMarker color='warning' background={false} icon={plForbid} text={intl.formatMessage({ id: 'message.closed' })} />&nbsp;&nbsp;&nbsp;&nbsp;</React.Fragment>}
            </Typography>
            {mergeRequestInfo.description && <Typography variant='body1' component='div' className={classes.description}>{mergeRequestInfo.description}</Typography>}
          </Grid>
          {mergeRequestInfo.status === Constants.mergeRequestStatus.open && <Grid item xs={6}>
            <Grid container justifyContent='flex-end'>
              <Button variant='outlined' color='primary' onClick={e => this.closeMergeRequest()}>
                {intl.formatMessage({ id: 'label.close' })}
              </Button>&nbsp;&nbsp;&nbsp;&nbsp;
              {reviewers.includes(currentUserInfo.id) && !this.isReview(currentUserInfo.id)
                ? <Button variant='contained' color='primary' onClick={e => this.mergeRequestReview()}>
                  {intl.formatMessage({ id: 'label.approve' })}
                </Button>
                : <Button variant='contained' color='primary' disableElevation onClick={e => this.checkMergeType()} disabled={this.state.mergePending}>
                  {this.state.mergePending && <CircularProgress size='1rem' color='inherit' />}
                  &nbsp; {intl.formatMessage({ id: 'label.merge' })} &nbsp;
                </Button>
              }
            </Grid>
          </Grid>
          }
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  variant='outlined'
                  value={mergeMessage}
                  placeholder={intl.formatMessage({ id: 'message.inputMergeCommit' })}
                  className={showCommitInput ? '' : classes.hideInput}
                  error={!mergeMessage}
                  helperText={!this.state.error.mergeMessage ? this.state.error.mergeMessage : ''}
                  onChange={e => this.setState({ mergeMessage: e.target.value })}
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  className={showCommitInput ? '' : classes.hideInput}
                  control={
                    <Checkbox
                      checked={usingSquash}
                      onChange={(e) => this.setState({ usingSquash: !this.state.usingSquash })}
                      name='usingSquash'
                      color='primary'
                    />
                  }
                  label='使用Squash'
                />
              </Grid>
              {
                hasMergeConflict && <Grid item xs={12}>
                  <Typography variant='h6' component='div' gutterBottom>
                    <Typography component='span'>{intl.formatMessage({ id: 'message.mergeConflictTitle' })}</Typography> &nbsp;
                    <ShowHelper doc='mergeBranch' type='icon' />
                  </Typography>
                  <Typography variant='body2' component='div' gutterBottom>
                    {intl.formatMessage({ id: 'message.mergeConflictTip1' })}
                    <Typography variant='h6' component='div' gutterBottom>
                      git fetch origin
                    </Typography>
                    <Typography variant='h6' component='div' gutterBottom>
                      git checkout -b {mergeRequestInfo.sourceBranch} origin/ {mergeRequestInfo.sourceBranch}
                    </Typography>
                  </Typography>
                  <Typography variant='body2' component='div' gutterBottom>
                    {intl.formatMessage({ id: 'message.mergeConflictTip2' })}
                  </Typography>
                  <Typography variant='body2' component='div' gutterBottom>
                    {intl.formatMessage({ id: 'message.mergeConflictTip3' })}
                    <Typography variant='h6' component='div' gutterBottom>
                      git fetch origin
                    </Typography>
                    <Typography variant='h6' component='div' gutterBottom>
                      git fetch origin
                    </Typography>
                    <Typography variant='h6' component='div' gutterBottom>
                      git checkout origin/{mergeRequestInfo.targetBranch}
                    </Typography>
                    <Typography variant='h6' component='div' gutterBottom>
                      git merge --no-ff {mergeRequestInfo.sourceBranch}
                    </Typography>
                  </Typography>
                  <Typography variant='body2' component='div' gutterBottom>
                    {intl.formatMessage({ id: 'message.mergeConflictTip4' })}
                    <Typography variant='h6' component='div' gutterBottom>
                      git push origin {mergeRequestInfo.targetBranch}
                    </Typography>
                  </Typography>
                </Grid>
              }
            </Grid>
          </Grid>
        </Grid>
      }
      { !pending
        ? <Grid container spacing={3}>
          <Grid item xs={this.state.mid ? 9 : 12}>
            <Grid container className={classes.tabHeader}>
              <TabHeader tabs={this.getTabs()} onChange={(e, newValue) => this.setState({ tabValue: newValue })} currentTab={tabValue}>&nbsp;</TabHeader>
            </Grid>
            <Grid item xs={12} className={classes.tab}>
              {
                tabValue === 0 && <MergeRequestDiff
                  pending={pending}
                  mergeRequestDetail={mergeRequestInfo}
                  changedFilesInfo={changedFiles}
                  fileDiff={fileDiff}
                  effectFileCount={effectFileCount}
                  addLine={addLine}
                  deleteLine={deleteLine}
                  showVersionCompare={this.state.mid ? Boolean(true) : Boolean(false)}
                  versionList={versionList}
                  latestVersion={latestVersion}
                  baseVersion={baseVersion}
                  baseVersionList={baseVersionList}
                  getVersionDiff={this.getVersionDiff}
                  sourceRepository={mergeRequestInfo.sourceRepository}
                  targetRepository={mergeRequestInfo.targetRepository}
                />
              }
              {
                tabValue === 1 && <TitleList title=''>
                  {commits.map((item, index) => <CommitItem
                    key={index}
                    showBorder
                    data={item}
                    linkPathBase={makeLink(
                      sourceRepositoryInfo.group.name,
                      sourceRepositoryInfo.name,
                      'commit'
                    )}
                    currentRepositoryConfig={sourceRepositoryInfo} />)
                  }
                </TitleList>
              }
              {
                tabValue === 2 && activities.map((item, key) => {
                  return <ActivityItem key={key} item={item} />
                })
              }
            </Grid>
          </Grid>
          {this.state.mid && mergeRequestInfo.id && <Grid item xs={3}>
            <Grid container className={[classes.tabHeader, classes.mergeRequestInfo].join(' ')}>
              <Grid item xs={12} container justifyContent='space-between' alignItems='center' className={classes.reviewersTitle}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.reviewer' })}</Typography>
                {mergeRequestInfo.status === Constants.mergeRequestStatus.open && <React.Fragment>
                  <SquareIconButton label='' className={classes.icon} onClick={e => this.setState({ reviewersMenu: e.currentTarget })} icon={plAddAlt} />
                  <Menu
                    anchorEl={reviewersMenu}
                    open={!!reviewersMenu}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    getContentAnchorEl={null}
                    onClose={e => this.setState({ reviewersMenu: null })}
                  >
                    <MenuItem disabled className={classes.reviewersMenuItem}>
                      {intl.formatMessage({ id: 'message.selectReviewer' })}
                    </MenuItem>
                    {targetRepositoryInfo.members && targetRepositoryInfo.members.map((item, index) => {
                      if (item.deleteFlag || item.role < UAC.Role.DEVELOPER) {
                        return false
                      }

                      return <MenuItem key={index} className={classes.reviewersMenuItem} onClick={e => {
                        this.setState({ reviewersMenu: null })
                        this.assignReviewer(false, item.id)
                      }}>
                        <Grid item><Member item={item} /></Grid>&nbsp;&nbsp;
                        <Grid item>{reviewers.includes(item.id) && <FontAwesomeIcon icon={plCheck} className={classes.assigned} />}</Grid>
                      </MenuItem>
                    })
                    }
                    <Divider className={classes.divider} />
                    <MenuItem className={classes.deleteReviewer} onClick={e => {
                      this.setState({ reviewersMenu: null })
                      this.deleteReviewer(false, reviewers[0])
                    }}>
                      <FontAwesomeIcon icon={plTrash} />&nbsp;&nbsp;
                      {intl.formatMessage({ id: 'message.deleteReviewer' })}
                    </MenuItem>
                  </Menu>
                </React.Fragment>
                }
              </Grid>
              <Grid container>
                {reviewers.length > 0
                  ? reviewers.map((item, index) => {
                    const isReview = this.isReview(item)
                    return <Grid container justifyContent='space-between' key={index} className={classes.reviewersMember}>
                      <Grid item><Member key={index} item={targetRepositoryInfo.members.filter(FilterGenerator.id(item))[0]} /></Grid>
                      <Grid><InlineMarker color={isReview ? 'success' : 'error'} text={intl.formatMessage({ id: isReview ? 'message.approved' : 'message.notApprove' })} /></Grid>
                    </Grid>
                  })
                  : <Grid item xs={12}>
                    <Typography className={classes.noReviewers} variant='caption' component='div'>{intl.formatMessage({ id: 'message.notSelectReviewers' })}</Typography>
                  </Grid>
                }
              </Grid>
              <Grid container alignItems='center' className={[classes.reviewersTitle, classes.activityTitle].join(' ')}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.activity' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body2' component='div' className={classes.activityItem}>
                  <FontAwesomeIcon icon={plMerge} />
                  {intl.formatMessage({ id: 'label.requestMerge' })}:&nbsp;&nbsp;
                  {sourceRepositoryInfo.group.displayName}/{sourceRepositoryInfo.displayName}/{mergeRequestInfo.sourceBranch} -> {targetRepositoryInfo.group.displayName}/{targetRepositoryInfo.displayName}/{mergeRequestInfo.targetBranch}
                </Typography>
                <Typography variant='body2' component='div' className={classes.activityItem}>
                  <CommiterAvatar src={Constants.HOSTS.PGYER_AVATAR_HOST + requesterInfo.icon} />
                  {requesterInfo.name}&nbsp;&nbsp;
                  {intl.formatMessage({ id: 'label.requestCreated' })}:&nbsp;&nbsp;
                  <FormattedTime timestamp={mergeRequestInfo.create} />
                  <div className={classes.activityItemLine} />
                </Typography>
                { mergeRequestInfo.status !== Constants.mergeRequestStatus.open && <Typography variant='body2' component='div' className={classes.activityItem}>
                  <CommiterAvatar src={Constants.HOSTS.PGYER_AVATAR_HOST + handlerInfo.icon} />
                  {handlerInfo.name}&nbsp;&nbsp;
                  {intl.formatMessage({ id: mergeRequestInfo.status === Constants.mergeRequestStatus.merged ? 'label.requestMerged' : 'label.requestClosed' })}:&nbsp;&nbsp;
                  <FormattedTime timestamp={(mergeRequestInfo.status === Constants.mergeRequestStatus.merged ? mergeRequestInfo.merge : mergeRequestInfo.close)} />
                  <div className={classes.activityItemLine} />
                </Typography>
                }
              </Grid>
            </Grid>
          </Grid>
          }
        </Grid>
        : <Grid container spacing={2} className={classes.loading}>
          <CircularProgress />
        </Grid>
      }
    </Grid>
    )
  }
}

MergeRequestDetail.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  closeDrawer: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo,
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    repositoryList: state.DataStore.repositoryList
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) },
    closeDrawer: () => dispatch({ type: 'drawer.expandStatus.close' })
  }
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(MergeRequestDetail)
      )
    )
  )
)
