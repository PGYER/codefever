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
import GroupData from 'APPSRC/data_providers/GroupData'
import GroupConfig from 'APPSRC/config/Group'
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
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import { injectIntl } from 'react-intl'

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2)
  },
  btn: {
    marginLeft: theme.spacing(2)
  },
  textRight: {
    textAlign: 'right'
  },
  outRange: {
    color: theme.palette.error.main
  }
})

class newRepositoryFork extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true,
      personalGroupCreateFlag: false,
      groupList: null,
      groupListChecked: false,
      name: '',
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
        name: 'name',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.groupName' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.{5,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 5, n2: 30 }
        )
      },
      {
        name: 'name',
        passPattern: /^[0-9a-zA-Z\\._-]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_has_illegal_character' },
          { s: this.props.intl.formatMessage({ id: 'label.groupName' }) }
        )
      },
      {
        name: 'slug',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.groupURL' }) }
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
        passPattern: /^.{5,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 5, n2: 30 }
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
        name: 'description',
        passPattern: /^.{0,200}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 200 }
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
        name: 'name',
        exceptionCode: 0x0404,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.groupName' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true

    GroupData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.groupList.update', data: data.data })
          this.setState({ groupList: data.data })
        }
      })
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.currentUserInfo && nextProps.currentUserInfo.id && nextState.groupList !== null && !nextState.groupListChecked) {
      const personalGroups = nextState.groupList
        .filter(FilterGenerator.creator(nextProps.currentUserInfo.id))
        .filter(FilterGenerator.userGroup())

      if (personalGroups.length) {
        this.setState({
          groupListChecked: true,
          personalGroupCreateFlag: false,
          pending: false
        })
      } else {
        const userData = nextProps.currentUserInfo.email.split('@')
        this.setState({
          groupListChecked: true,
          personalGroupCreateFlag: true,
          pending: false,
          name: userData[0],
          slug: NetworkHelper.makeSlug(userData[0])
        })
      }
    }

    if (this.state.description !== nextState.description && nextState.description.length < 201) {
      this.setState({
        error: {}
      })
      return false
    }

    return true
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  createGroup () {
    if (!this.checkInput()) {
      return true
    }

    const data = {
      name: this.state.slug,
      type: this.state.personalGroupCreateFlag ? GroupConfig.Type.USER : GroupConfig.Type.NORMAL,
      displayName: this.state.name,
      description: this.state.description
    }

    this.setState({ pending: true })
    GroupData.create(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const groupData = data.data
          GroupData.list()
            .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
            .then((data) => {
              if (!data.code) {
                this.setState({ pending: false })
                this.props.dispatchEvent({ type: 'data.groupList.update', data: data.data })
                this.props.history.push(makeLink('groups', groupData.name))
              }
            })
        } else if (!this.checkResponse(data.code)) {
          this.setState({ pending: false })
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.createGroupFail' })
            , 2)
          )
          this.setState({ pending: false })
        }
      })

    return true
  }

  render () {
    const { classes, intl, currentUserInfo } = this.props

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom>
          { intl.formatMessage({ id: 'label.newGroup' }) }
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper} >
          { this.state.groupList !== null
            ? <Grid container spacing={2}>
              <Grid item xs={7}>
                <Grid container spacing={2}>
                  { this.state.personalGroupCreateFlag && <Grid item xs={12}>
                    <Typography variant='body1' component='div' gutterBottom>
                      {intl.formatMessage({ id: 'message.createPersonalGroupNotice' })}
                    </Typography>
                  </Grid> }
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.groupName' }) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      placeholder={intl.formatMessage({ id: 'message.error.input_S_placeholder' }, { s: intl.formatMessage({ id: 'label.groupName' }) })}
                      value={this.state.name}
                      error={!!this.state.error.name}
                      helperText={this.state.error.name}
                      onChange={(e) => {
                        const name = e.target.value
                        const slug = NetworkHelper.makeSlug(name)
                        const error = {}
                        this.setState({ name, slug, error })
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.groupURL' }) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      placeholder={intl.formatMessage({ id: 'message._S_empty' }, { s: intl.formatMessage({ id: 'label.path' }) })}
                      value={this.state.slug}
                      error={!!this.state.error.slug}
                      helperText={this.state.error.slug}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>{NetworkHelper.getHost(currentUserInfo)}/</InputAdornment>
                      }}
                      onChange={(e) => {
                        const slug = NetworkHelper.makeSlug(e.target.value)
                        this.setState({ slug })
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.groupDescription' }) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      multiline
                      rows={5}
                      value={this.state.description}
                      error={!!this.state.error.description}
                      helperText={this.state.error.description}
                      onChange={e => this.setState({ description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container justifyContent='flex-end'>
                      <Grid item xs={3} className={classes.textRight}>
                        <Typography
                          variant='subtitle1'
                          component='div'
                          className={this.state.description.length > 200 ? classes.outRange : ''}
                        >
                          {this.state.description.length}/200
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} align='right'>
                    <Button variant='outlined' color='primary' disableElevation className={classes.btn}
                      disabled={this.state.pending}
                      onClick={e => this.props.history.push('/groups')}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      &nbsp; { intl.formatMessage({ id: 'label.cancel' }) } &nbsp;
                    </Button>
                    <Button variant='contained' color='primary' disableElevation className={classes.btn}
                      disabled={this.state.pending}
                      onClick={e => this.createGroup()}
                    >
                      { this.state.pending
                        ? <CircularProgress size='1rem' color='inherit' />
                        : <FontAwesomeIcon icon={faPlus} />
                      }
                      &nbsp; { intl.formatMessage({ id: 'label.ok' }) } &nbsp;
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3} />
            </Grid>
            : <Grid container spacing={2}>
              <Grid item xs={12}>
                <CircularProgress />
              </Grid>
            </Grid> }
        </Paper>
      </Grid>
    </Grid>)
  }
}

newRepositoryFork.propTypes = {
  history: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
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
      connect(mapStateToProps, mapDispatchToProps)(newRepositoryFork)
    )
  )
)
