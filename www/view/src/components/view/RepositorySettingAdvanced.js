// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// components
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import GroupData from 'APPSRC/data_providers/GroupData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { plTrash } from '@pgyer/icons'

import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Member from 'APPSRC/components/unit/Member'

const styles = (theme) => ({
  header: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(4),
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px'
  },
  section: {
    marginTop: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(2)
  },
  btn: {
    marginRight: theme.spacing(2)
  },
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  warning: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText
  }
})

const StyledMenuItem = withStyles(theme => ({
  root: {
    minHeight: theme.spacing(6)
  }
}))(MenuItem)

class RepositorySettingAdvanced extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      groupConfig: {},
      slug: '',
      error: {}
    }

    this.mountedFlag = false

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'slug',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.repositorySlug' }) }
        )
      },
      {
        name: 'slug',
        passPattern: /^[0-9a-zA-z_]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.requireCombinationOfCharactersNumbersAndUnderscore' }
        )
      },
      {
        name: 'slug',
        passPattern: /^.{0,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 30 }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'slug',
        exceptionCode: 0x0401,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.repositorySlug' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.slug === '' && nextProps.currentRepositoryConfig.repository) {
      this.setState({ slug: nextProps.currentRepositoryConfig.repository.name })
      return false
    }
    return true
  }

  componentWillUnmount () {
    this.mountedFlag = false
    this.setState({ slug: '' })
  }

  deleteRepository () {
    this.props.dispatchEvent(EventGenerator.addComformation('repository_delete_repository', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperation' }),
      description: this.props.intl.formatMessage({ id: 'message.repositoryDeleteRepositoryNotice' }),
      reject: () => { return true },
      accept: () => {
        this.deleteRepositoryConfirmed()
        this.props.dispatchEvent(EventGenerator.cancelComformation())
      }
    }))
  }

  deleteRepositoryConfirmed () {
    this.props.dispatchEvent(EventGenerator.addComformation('repository_delete_repository_confirm', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperationConfirm' }),
      description: this.props.intl.formatMessage({ id: 'message.repositoryDeleteRepositoryConfirmNotice' }),
      reject: () => { return true },
      accept: () => {
        const data = {
          repository: this.props.currentRepositoryConfig.repository.id
        }
        this.setState({ pending: true })
        RepositoryData.deleteRepository(data)
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.reloadRepositoryGroupList()
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.deleted' })
                , 0)
              )
              this.props.history.push(makeLink('repositories'))
            } else if (data.code > 0x0400) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.error.deleteFail' })
                , 0)
              )
            }
            this.props.dispatchEvent(EventGenerator.cancelComformation())
            this.setState({ pending: false })
          })
      }
    }))
  }

  changeSlug () {
    if (!this.checkInput()) {
      return false
    }

    this.props.dispatchEvent(EventGenerator.addComformation('repository_change_slug', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperation' }),
      description: this.props.intl.formatMessage({ id: 'message.repositoryChangeURLNotice' }),
      reject: () => { return true },
      accept: () => {
        const data = {
          repository: this.props.currentRepositoryConfig.repository.id,
          name: this.state.slug
        }
        this.setState({ pending: true })
        RepositoryData.updateName(data)
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.reloadRepositoryData()
              this.reloadRepositoryGroupList()
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.updated' })
                , 0)
              )
              this.props.history.push(makeLink('repositories'))
            } else if (!this.checkResponse(data.code)) {
              // do nothing
            } else if (data.code > 0x0400) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.error.updateFail' })
                , 2)
              )
            }
            this.setState({ pending: false })
            this.props.dispatchEvent(EventGenerator.cancelComformation())
          })
      }
    }))
  }

  changeOwner (userID) {
    this.props.dispatchEvent(EventGenerator.addComformation('repository_change_creator', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperation' }),
      description: this.props.intl.formatMessage({ id: 'message.repositoryChangeCreatorNotice' }),
      reject: () => { return true },
      accept: () => {
        const data = {
          repository: this.props.currentRepositoryConfig.repository.id,
          userID
        }
        this.setState({ pending: true })
        RepositoryData.changeOwner(data)
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.reloadRepositoryData()
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.updated' })
                , 0)
              )
            } else if (data.code > 0x0400) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.updateFail' })
                , 2)
              )
            }
            this.props.dispatchEvent(EventGenerator.cancelComformation())
            this.setState({ pending: false })
          })
      }
    }))
  }

  reloadRepositoryData () {
    RepositoryData.config({ rKey: this.props.currentRepositoryConfig.repository.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: data.data })
        }
      })
  }

  reloadRepositoryGroupList () {
    RepositoryData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.repositoryList.update', data: data.data })
        }
      })

    GroupData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.groupList.update', data: data.data })
        }
      })
  }

  render () {
    const { currentRepositoryConfig, currentUserInfo, classes, intl } = this.props

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom className={classes.header}>
          { intl.formatMessage({ id: 'label.repositoryAdvancedSetting' }) }
        </Typography>
      </Grid>
      { currentRepositoryConfig.repository
        ? <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='subtitle1' component='div'>
              { intl.formatMessage({ id: 'label.updateCreator' }) }
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <TextField
              fullWidth
              variant='outlined'
              select
              value={currentRepositoryConfig.repository.owner}
              onChange={e => this.changeOwner(e.target.value)}
            >
              { currentRepositoryConfig.members.map((item, key) => {
                return (<StyledMenuItem key={key} value={item.id}>
                  <Member item={item} />
                </StyledMenuItem>)
              }) }
            </TextField>
          </Grid>
          <Grid item xs={12} className={classes.section}>
            <Typography variant='subtitle1' component='div'>
              { intl.formatMessage({ id: 'label.updateRepositoryURL' }) }
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant='outlined'
                  value={this.state.slug}
                  error={!!this.state.error.slug}
                  helperText={this.state.error.slug}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>
                      {NetworkHelper.getHost(currentUserInfo)}/{currentRepositoryConfig.group.name}/
                    </InputAdornment>
                  }}
                  onChange={(e) => {
                    const slug = NetworkHelper.makeSlug(e.target.value)
                    this.setState({ slug })
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  color='primary'
                  variant='contained'
                  disableElevation
                  onClick={e => this.changeSlug()}
                  disabled={this.state.pending}
                >
                  { this.state.pending
                    ? <CircularProgress size='1rem' color='inherit' />
                    : <FontAwesomeIcon icon={faFile} />
                  }
                  &nbsp; {intl.formatMessage({ id: 'label.save' })}
                </Button>
              </Grid>
              <Grid item xs={12} className={classes.section}>
                <Typography variant='subtitle1' component='div'>
                  { intl.formatMessage({ id: 'label.deleteRepository' }) }
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body2'>
                  { intl.formatMessage({ id: 'message.repositoryDeleteTipFirst' }) }
                </Typography>
                <Typography variant='body2'>
                  { intl.formatMessage({ id: 'message.repositoryDeleteTipSecond' }) }
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Button
                  variant='contained'
                  disableElevation
                  onClick={e => this.deleteRepository()}
                  className={classes.warning}
                  disabled={this.state.pending}
                >
                  { this.state.pending
                    ? <CircularProgress size='1rem' color='inherit' />
                    : <FontAwesomeIcon icon={plTrash} />
                  }
                  &nbsp; {intl.formatMessage({ id: 'label.deleteRepository' })}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        : <Grid container spacing={2} className={classes.loading}>
          <CircularProgress />
        </Grid> }
    </Grid>)
  }
}

RepositorySettingAdvanced.propTypes = {
  dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig,
    currentUserInfo: state.DataStore.currentUserInfo
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
      connect(mapStateToProps, mapDispatchToProps)(RepositorySettingAdvanced)
    )
  )
)
