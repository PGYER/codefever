// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

// components
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faUndo
} from '@fortawesome/free-solid-svg-icons'
import Button from '@material-ui/core/Button'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import UAC from 'APPSRC/config/UAC'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import { injectIntl } from 'react-intl'

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2)
  },
  btn: {
    marginRight: theme.spacing(2)
  },
  svg: {
    '& svg': {
      right: theme.spacing(3)
    }
  }
})

class newRepositoryFork extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true,
      forkID: '',
      name: '',
      group: '',
      slug: '',
      description: '',
      error: {}
    }

    this.observed = {
      forkRepositoryInfo: ''
    }

    this.mountedFlag = false

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'group',
        passPattern: /^[0-9a-f]{32}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_notChoose' },
          { s: this.props.intl.formatMessage({ id: 'label.group' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.repositoryName' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.{0,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 30 }
        )
      },
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
      },
      {
        name: 'name',
        exceptionCode: 0x0402,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.repositoryName' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!nextProps.groupListPending && nextProps.currentUserInfo.id) {
      const personalGroups = nextProps.groupList
        .filter(FilterGenerator.creator(nextProps.currentUserInfo.id))
        .filter(FilterGenerator.userGroup())

      if (!personalGroups.length && !nextProps.history.location.pathname.match(/^\/groups\/new/i)) {
        nextProps.dispatchEvent(EventGenerator.cancelComformation())
        nextProps.dispatchEvent(EventGenerator.addComformation('default_group_create_confirm', {
          title: this.props.intl.formatMessage({ id: 'message.defaultGroupReqiured' }),
          description: this.props.intl.formatMessage({ id: 'message.defaultGroupReqiuredDescription' }),
          reject: () => { nextProps.history.push('/repositories') },
          accept: () => { nextProps.history.push('/groups/new') }
        }))
        return true
      }
    }

    const forkRepositoryID = nextProps.match.params.repositoryID
    const matchedRepository = (nextProps.repositoryList || [])
      .filter(FilterGenerator.id(forkRepositoryID))[0]

    if (this.observed.forkRepositoryInfo !== JSON.stringify(matchedRepository)) {
      this.observed.forkRepositoryInfo = JSON.stringify(matchedRepository)
      if (matchedRepository) {
        this.setState({
          forkID: forkRepositoryID,
          name: matchedRepository.displayName,
          slug: matchedRepository.name,
          description: matchedRepository.description
        })
      }
    }

    const permittedGroups = nextProps.groupList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.GROUP_CREATE_REPO))

    if (!nextState.group) {
      const personalGroups = permittedGroups
        .filter(FilterGenerator.creator(nextProps.currentUserInfo.id))
        .filter(FilterGenerator.userGroup())

      if (personalGroups && personalGroups[0] && personalGroups[0].id) {
        this.setState({ group: personalGroups[0].id, pending: false })
      }
    }

    return true
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  forkRepository () {
    if (!this.checkInput()) {
      return true
    }

    const data = {
      forkID: this.state.forkID,
      group: this.state.group,
      name: this.state.slug,
      displayName: this.state.name,
      description: this.state.description
    }

    this.setState({ pending: true })
    RepositoryData.fork(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const repositoryData = data.data
          RepositoryData.list()
            .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
            .then((data) => {
              if (!data.code) {
                this.setState({ pending: false })
                this.props.dispatchEvent({ type: 'data.repositoryList.update', data: data.data })
                this.props.history.push(makeLink(repositoryData.group.name, repositoryData.name))
              }
            })
        } else if (!this.checkResponse(data.code)) {
          this.setState({ pending: false })
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.forkRepositoryFail' })
            , 2)
          )
          this.setState({ pending: false })
        }
      })

    return true
  }

  render () {
    const { classes, intl, match, repositoryList, groupList, currentUserInfo } = this.props

    const permittedGroups = groupList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.GROUP_CREATE_REPO))

    const forkRepositoryID = match.params.repositoryID
    const matchedRepository = repositoryList
      .filter(FilterGenerator.id(forkRepositoryID))[0]

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom>
          { intl.formatMessage({ id: 'label.forkRepository' }) }
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper} >
          <Grid container spacing={2}>
            <Grid item xs={7}>
              { matchedRepository
                ? <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant='body1' component='div' gutterBottom>
                      { intl.formatMessage({ id: 'label.forkFrom_S' }, {
                        s: NetworkHelper.getHost(currentUserInfo) +
                        makeLink(matchedRepository.group.name, matchedRepository.name) +
                        ' (' + matchedRepository.group.displayName + '/' + matchedRepository.displayName + ')'
                      }) }
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.repositoryName' }) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      value={this.state.name}
                      error={!!this.state.error.name}
                      helperText={this.state.error.name}
                      onChange={(e) => {
                        const name = e.target.value
                        const slug = NetworkHelper.makeSlug(name)
                        this.setState({ name, slug })
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.repositoryURL' }) }</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      select
                      value={this.state.group}
                      error={!!this.state.error.group}
                      helperText={this.state.error.group}
                      onChange={e => this.setState({ group: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>{NetworkHelper.getHost(currentUserInfo)}/</InputAdornment>,
                        endAdornment: <InputAdornment position='end'>/</InputAdornment>
                      }}
                      className={classes.svg}
                    >
                      {permittedGroups.map(option => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      value={this.state.slug}
                      error={!!this.state.error.slug}
                      helperText={this.state.error.slug}
                      onChange={(e) => {
                        const slug = NetworkHelper.makeSlug(e.target.value)
                        this.setState({ slug })
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.repositoryDescription' }) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      multiline
                      rows={5}
                      value={this.state.description}
                      onChange={e => this.setState({ description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} align='right'>
                    <Button variant='outlined' color='primary' disableElevation className={classes.btn}
                      disabled={this.state.pending}
                      onClick={e => this.props.history.push('/repositories')}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      &nbsp; { intl.formatMessage({ id: 'label.cancel' }) } &nbsp;
                    </Button>
                    <Button variant='contained' color='primary' disableElevation className={classes.btn}
                      disabled={this.state.pending}
                      onClick={e => this.forkRepository()}
                    >
                      { this.state.pending
                        ? <CircularProgress size='1rem' color='inherit' />
                        : <FontAwesomeIcon icon={faPlus} />
                      }
                      &nbsp; { intl.formatMessage({ id: 'label.fork' }) } &nbsp;
                    </Button>
                  </Grid>
                </Grid>
                : <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CircularProgress />
                  </Grid>
                </Grid>
              }
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>)
  }
}

newRepositoryFork.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  groupListPending: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo,
    repositoryList: state.DataStore.repositoryList,
    groupListPending: state.DataStore.groupListPending,
    groupList: state.DataStore.groupList
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
      connect(mapStateToProps, mapDispatchToProps)(newRepositoryFork)
    )
  )
)
