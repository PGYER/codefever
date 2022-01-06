// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { plTrash } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import TableList from 'APPSRC/components/unit/TableList'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import Constants from 'APPSRC/config/Constants'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

const styles = (theme) => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  header: {
    display: 'flex',
    marginBottom: theme.spacing(4),
    justifyContent: 'space-between',
    lineHeight: theme.spacing(5) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  jobForm: {
    paddingTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(6),
    borderBottom: '1px solid ' + theme.palette.border
  },
  btn: {
    verticalAlign: 'bottom',
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(3)
  },
  icon: {
    color: theme.palette.text.light
  }
})

class RepositorySettingJob extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      jobTemplates: null,

      isShowJobForm: !!window.location.search,
      name: '',
      tag: '',
      category: Constants.jobCategory.codecheck,
      type: Constants.jobType.mergeRequest,
      mergeRule: '',
      mergeDispatch: Constants.jobMergeDispatch.success,
      timeRule: '',
      error: {}
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'name',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.jobName' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.{1,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.jobName' }) }
        )
      },
      {
        name: 'tag',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.jobTag' }) }
        )
      },
      {
        name: 'tag',
        passPattern: /^.{1,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.jobTag' }) }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'name',
        exceptionCode: 0x0402,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.jobName' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.getData(this.props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(nextProps.currentRepositoryKey) !== JSON.stringify(this.props.currentRepositoryKey)) {
      this.getData(nextProps)
      return false
    }

    return true
  }

  getData (props) {
    const { currentRepositoryKey } = props
    if (!currentRepositoryKey) {
      return false
    }

    this.setState({ pending: true })
    RepositoryData.jobTemplates({
      repository: currentRepositoryKey
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.setState({
            pending: false,
            jobTemplates: data.data
          })
        }
      })
  }

  createJob () {
    const { intl, currentRepositoryKey } = this.props
    const { pending, isShowJobForm, name, tag, category, type, mergeRule, mergeDispatch, timeRule } = this.state
    if (pending || !isShowJobForm || !this.checkInput()) {
      return false
    }

    if (type === Constants.jobType.mergeRequest) {
      if (!/^([0-9a-zA-Z/]{1,30}|\/\^?.{1,30}\$?\/[igm]*)$/.test(mergeRule)) {
        this.setState({
          error: {
            mergeRule: intl.formatMessage(
              { id: 'message.error._S_invalid' },
              { s: intl.formatMessage({ id: 'message.jobTargetBranchRule' }) }
            )
          }
        })
        return false
      }
    } else {
      if (!/^\w{0,30}$/.test(timeRule)) {
        this.setState({
          error: {
            timeRule: intl.formatMessage(
              { id: 'message.error._S_invalid' },
              { s: intl.formatMessage({ id: 'message.jobTimeRule' }) }
            )
          }
        })
        return false
      }
    }

    this.setState({ pending: true })
    RepositoryData.createJobTemplate({
      repository: currentRepositoryKey,
      name: name,
      tag: tag,
      category: category,
      type: type,
      mergeRule: mergeRule,
      mergeDispatch: mergeDispatch,
      timeRule: timeRule
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ pending: false })
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.created' })
            , 0)
          )
          this.setState({ isShowJobForm: false })
          this.getData(this.props)
        } else {
          this.checkResponse(data.code)
        }
      })
  }

  deleteJob (job) {
    const { currentRepositoryKey, intl } = this.props
    this.props.dispatchEvent(EventGenerator.addComformation('delete_job', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.job' }) + ' \'' + job.name + '\' ' }),
      description: '',
      reject: () => { return true },
      accept: () => {
        RepositoryData.deleteJobTemplate({
          repository: currentRepositoryKey,
          job: job.id,
          name: job.name
        }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then(data => {
            this.props.dispatchEvent(EventGenerator.cancelComformation())
            if (!data.code) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.deleted' })
                , 0)
              )
              this.getData(this.props)
            }
          })
      }
    }))
  }

  getTableData () {
    const { classes } = this.props
    const { jobTemplates } = this.state
    const final = []

    jobTemplates.map((item, index) => {
      final.push([
        <Typography variant='body1' component='div'>{item.name}</Typography>,
        <Typography variant='body1' component='div'>{item.tag}</Typography>,
        <Typography variant='body1' component='div'>
          {this.categoryLabel[item.category]}
        </Typography>,
        <Typography variant='body1' component='div'>{this.typeLabel[item.type]}</Typography>,
        <Typography variant='body1' component='div'>
          {item.type === Constants.jobType.mergeRequest ? item.mergeRule : item.timeRule}&nbsp;
          {item.type === Constants.jobType.mergeRequest ? '(' + this.mergeDispatchLabel[item.mergeDispatch] + ')' : ''}
        </Typography>,
        <SquareIconButton label='label.delete' icon={plTrash} className={classes.icon} onClick={e => this.deleteJob(item)} />
      ])
      return true
    })

    return [
      ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      ['label.jobName', 'label.jobTag', 'label.jobCategory', 'label.jobType', 'label.rule', ''],
      ...final
    ]
  }

  render () {
    const { classes, intl } = this.props
    const { pending, jobTemplates, isShowJobForm, name, tag, category, type, mergeRule, mergeDispatch, timeRule, error } = this.state

    this.categoryLabel = []
    this.categoryLabel[Constants.jobCategory.codecheck] = intl.formatMessage({ id: 'message.huaweiCodecheck' })
    this.categoryLabel[Constants.jobCategory.jenkins] = 'Jenkins'
    this.categoryLabel[Constants.jobCategory.travisci] = 'Travis-ci'

    this.typeLabel = []
    this.typeLabel[Constants.jobType.mergeRequest] = intl.formatMessage({ id: 'label.jobMergeRequest' })
    this.typeLabel[Constants.jobType.time] = intl.formatMessage({ id: 'label.jobTime' })

    this.mergeDispatchLabel = []
    this.mergeDispatchLabel[Constants.jobMergeDispatch.success] = intl.formatMessage({ id: 'message.jobSuccessMerge' })
    this.mergeDispatchLabel[Constants.jobMergeDispatch.finish] = intl.formatMessage({ id: 'message.jobFinishMerge' })
    this.mergeDispatchLabel[Constants.jobMergeDispatch.immediately] = intl.formatMessage({ id: 'message.jobImmediatelyMerge' })

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.header}>
          {intl.formatMessage({ id: 'label.jobSetting' })}
          <Button
            color='primary'
            disableElevation
            variant='contained'
            disabled={pending}
            onClick={e => this.setState({ isShowJobForm: true })}
          >
            {intl.formatMessage({ id: 'label.createJob' })}
          </Button>
        </Typography>
      </Grid>

      {isShowJobForm && <React.Fragment>
        <Grid item xs={12}>
          <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'label.createJob' })}</Typography>
        </Grid>
        <Grid container className={classes.jobForm}>
          <Grid item xs={3} />
          <Grid item xs={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.jobName' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.jobName' }) })}
                  value={name}
                  error={!!error.name}
                  helperText={error.name}
                  onChange={e => this.setState({ name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.jobTag' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.jobTag' }) })}
                  value={tag}
                  error={!!error.tag}
                  helperText={error.tag}
                  onChange={e => this.setState({ tag: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.jobCategory' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  variant='outlined'
                  value={category}
                  onChange={e => this.setState({ category: e.target.value })}
                >
                  <MenuItem value={Constants.jobCategory.codecheck}>{this.categoryLabel[Constants.jobCategory.codecheck]}</MenuItem>
                  {/* <MenuItem disabled value={Constants.jobCategory.jenkins}>{this.categoryLabel[Constants.jobCategory.jenkins]} ({intl.formatMessage({ id: 'label.comingSoon' })})</MenuItem> */}
                  {/* <MenuItem disabled value={Constants.jobCategory.travisci}>{this.categoryLabel[Constants.jobCategory.travisci]} ({intl.formatMessage({ id: 'label.comingSoon' })})</MenuItem> */}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.jobType' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  variant='outlined'
                  value={type}
                  onChange={e => this.setState({ type: e.target.value })}
                >
                  <MenuItem value={Constants.jobType.mergeRequest}>{this.typeLabel[Constants.jobType.mergeRequest]}</MenuItem>
                  <MenuItem disabled value={Constants.jobType.time}>{this.typeLabel[Constants.jobType.time]} ({intl.formatMessage({ id: 'label.comingSoon' })})</MenuItem>
                </TextField>
              </Grid>

              {type === Constants.jobType.mergeRequest && <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.jobMergeRequestRule' })}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'message.jobTargetBranchRule' }) })}
                    value={mergeRule}
                    error={!!error.mergeRule}
                    helperText={error.mergeRule}
                    onChange={e => this.setState({ mergeRule: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'message.jobMergeDispatch' })}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    variant='outlined'
                    value={mergeDispatch}
                    onChange={e => this.setState({ mergeDispatch: e.target.value })}
                  >
                    <MenuItem value={Constants.jobMergeDispatch.success}>{this.mergeDispatchLabel[Constants.jobMergeDispatch.success]}</MenuItem>
                    <MenuItem value={Constants.jobMergeDispatch.finish}>{this.mergeDispatchLabel[Constants.jobMergeDispatch.finish]}</MenuItem>
                    <MenuItem value={Constants.jobMergeDispatch.immediately}>{this.mergeDispatchLabel[Constants.jobMergeDispatch.immediately]}</MenuItem>
                  </TextField>
                </Grid>
              </React.Fragment>}

              {type === Constants.jobType.time && <React.Fragment>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.jobTimeRule' })}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.jobTimeRule' }) })}
                    value={timeRule}
                    error={!!error.timeRule}
                    helperText={error.timeRule}
                    onChange={e => this.setState({ timeRule: e.target.value })}
                  />
                </Grid>
              </React.Fragment>}

              <Grid item xs={12} align='right'>
                <Button
                  color='primary'
                  variant='outlined'
                  disableElevation
                  disabled={pending}
                  onClick={e => this.setState({ isShowJobForm: false })}
                >
                  {intl.formatMessage({ id: 'label.cancel' })}
                </Button>
                <Button
                  color='primary'
                  variant='contained'
                  disableElevation
                  className={classes.btn}
                  disabled={pending}
                  onClick={e => this.createJob()}
                >
                  {pending && <CircularProgress size='1rem' color='inherit' />}
                  {intl.formatMessage({ id: 'label.create' })}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
      }

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'label.jobList' })}</Typography>
        </Grid>
        {jobTemplates
          ? jobTemplates.length > 0
            ? <Grid item xs={12}>
              <TableList data={this.getTableData()} />
            </Grid>
            : <Grid container spacing={2} className={classes.loading}>
              <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'message.jobTemplatesEmpty' })}</Typography>
            </Grid>
          : <Grid container spacing={2} className={classes.loading}>
            <CircularProgress />
          </Grid>
        }
      </Grid>
    </Grid>)
  }
}

RepositorySettingJob.propTypes = {
  currentRepositoryKey: PropTypes.string.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(RepositorySettingJob)
  )
)
