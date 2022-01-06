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
import { faFile, faTrash } from '@fortawesome/free-solid-svg-icons'

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
    marginBottom: theme.spacing(1),
    borderBottom: '1px solid ' + theme.palette.border
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

class GroupSettingAdvanced extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
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
          { s: this.props.intl.formatMessage({ id: 'label.groupSlug' }) }
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
        exceptionCode: 0x0403,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.groupURL' }) }
        )
      },
      {
        exceptionCode: 0x0409,
        errorMessage: this.props.intl.formatMessage({ id: 'message.error.canNotDeleteUserGroup' })
      },
      {
        exceptionCode: 0x040A,
        errorMessage: this.props.intl.formatMessage({ id: 'message.error.canNotDeleteNonEmptyGroup' })
      },
      {
        exceptionCode: 0x040B,
        errorMessage: this.props.intl.formatMessage({ id: 'message.error.canNotChangeOwnerOfUserGroup' })
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.slug === '' && nextProps.currentGroupConfig.group) {
      this.setState({ slug: nextProps.currentGroupConfig.group.name })
      return false
    }
    return true
  }

  componentWillUnmount () {
    this.mountedFlag = false
    this.setState({ slug: '' })
  }

  deleteGroup () {
    this.props.dispatchEvent(EventGenerator.addComformation('group_delete_group', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperation' }),
      description: this.props.intl.formatMessage({ id: 'message.groupDeleteRepositoryNotice' }),
      reject: () => { return true },
      accept: () => {
        this.deleteGroupConfirmed()
        this.props.dispatchEvent(EventGenerator.cancelComformation())
      }
    }))
  }

  deleteGroupConfirmed () {
    this.props.dispatchEvent(EventGenerator.addComformation('group_delete_group_confirm', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperationConfirm' }),
      description: this.props.intl.formatMessage({ id: 'message.groupDeleteRepositoryConfirmNotice' }),
      reject: () => { return true },
      accept: () => {
        const data = {
          group: this.props.currentGroupConfig.group.id
        }
        this.setState({ pending: true })
        GroupData.deleteGroup(data)
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.reloadRepositoryGroupList()
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.deleted' })
                , 0)
              )
              this.props.history.push(makeLink('groups'))
            } else if (!this.checkResponse(data.code)) {
              // do nothing
            } else if (data.code > 0x0400) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.error.deleteFail' })
                , 2)
              )
            }
            this.setState({ pending: false })
            this.props.dispatchEvent(EventGenerator.cancelComformation())
          })
      }
    }))
  }

  changeSlug () {
    if (!this.checkInput()) {
      return false
    }

    this.props.dispatchEvent(EventGenerator.addComformation('group_change_slug', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperation' }),
      description: this.props.intl.formatMessage({ id: 'message.groupChangeURLNotice' }),
      reject: () => { return true },
      accept: () => {
        const data = {
          group: this.props.currentGroupConfig.group.id,
          name: this.state.slug
        }
        this.setState({ pending: true })
        GroupData.updateName(data)
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.reloadGroupData()
              this.reloadRepositoryGroupList()
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.updated' })
                , 0)
              )
              this.props.history.push(makeLink('groups'))
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
    this.props.dispatchEvent(EventGenerator.addComformation('group_change_creator', {
      title: this.props.intl.formatMessage({ id: 'label.dangerOperation' }),
      description: this.props.intl.formatMessage({ id: 'message.groupChangeCreatorNotice' }),
      reject: () => { return true },
      accept: () => {
        const data = {
          group: this.props.currentGroupConfig.group.id,
          userID
        }
        this.setState({ pending: true })
        GroupData.changeOwner(data)
          .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.reloadGroupData()
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.updated' })
                , 0)
              )
            } else if (!this.checkResponse(data.code)) {
              // do nothing
            } else if (data.code > 0x0400) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.error.updateFail' })
                , 2)
              )
            }
            this.props.dispatchEvent(EventGenerator.cancelComformation())
            this.setState({ pending: false })
          })
      }
    }))
  }

  reloadGroupData () {
    GroupData.config({ gKey: this.props.currentGroupConfig.group.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentGroupConfig.update', data: data.data })
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
    const { currentGroupConfig, currentUserInfo, classes, intl } = this.props

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom className={classes.header}>
          { intl.formatMessage({ id: 'label.groupAdvancedSetting' }) }
        </Typography>
      </Grid>
      <Grid item xs={12}>
        { currentGroupConfig.group
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
                value={currentGroupConfig.group.owner}
                onChange={e => this.changeOwner(e.target.value)}
              >
                { currentGroupConfig.members.map((item, key) => {
                  return (<StyledMenuItem key={key} value={item.id}>
                    <Member item={item} />
                  </StyledMenuItem>)
                }) }
              </TextField>
            </Grid>
            <Grid item xs={12} className={classes.section}>
              <Typography variant='subtitle1' component='div'>
                { intl.formatMessage({ id: 'label.updateGroupURL' }) }
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
                        {NetworkHelper.getHost(currentUserInfo)}/
                      </InputAdornment>
                    }}
                    onChange={(e) => {
                      const slug = NetworkHelper.makeSlug(e.target.value)
                      const error = {}
                      this.setState({
                        slug, error
                      })
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
              </Grid>
            </Grid>
            <Grid item xs={12} className={classes.section}>
              <Typography variant='subtitle1' component='div'>
                { intl.formatMessage({ id: 'label.deleteGroup' }) }
              </Typography>
            </Grid>
            <Grid item xs={7}>
              <Button
                color='secondary'
                variant='contained'
                disableElevation
                onClick={e => this.deleteGroup()}
                className={classes.warning}
                disabled={this.state.pending}
              >
                { this.state.pending
                  ? <CircularProgress size='1rem' color='inherit' />
                  : <FontAwesomeIcon icon={faTrash} />
                }
                &nbsp; {intl.formatMessage({ id: 'label.deleteGroup' })}
              </Button>
            </Grid>
          </Grid>
          : <Grid container spacing={2}>
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          </Grid> }
      </Grid>
    </Grid>)
  }
}

GroupSettingAdvanced.propTypes = {
  dispatchEvent: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentGroupConfig: state.DataStore.currentGroupConfig,
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
      connect(mapStateToProps, mapDispatchToProps)(GroupSettingAdvanced)
    )
  )
)
