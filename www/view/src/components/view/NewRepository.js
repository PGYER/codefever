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
    marginLeft: theme.spacing(2)
  },
  svg: {
    '& svg': {
      right: theme.spacing(3)
    }
  },
  textRight: {
    textAlign: 'right'
  },
  outRange: {
    color: theme.palette.error.main
  }
})

class newRepository extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true,
      name: '',
      group: '',
      slug: '',
      description: '',
      error: {}
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
        name: 'name',
        passPattern: /^[0-9a-zA-Z\\._-]+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_has_illegal_character' },
          { s: this.props.intl.formatMessage({ id: 'label.repositoryName' }) }
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
          reject: () => {
            nextProps.history.push('/repositories')
          },
          accept: () => {
            nextProps.history.push('/groups/new')
            this.props.dispatchEvent(EventGenerator.cancelComformation())
          }
        }))
        return true
      }
    }

    if (!nextState.group && nextProps.currentGroupKey) {
      this.setState({ group: nextProps.currentGroupKey, pending: false })
    } else if (!nextState.group) {
      const permittedGroups = nextProps.groupList
        .filter(FilterGenerator.withPermission(UAC.PermissionCode.GROUP_CREATE_REPO))

      const personalGroups = permittedGroups
        .filter(FilterGenerator.creator(nextProps.currentUserInfo.id))
        .filter(FilterGenerator.userGroup())

      if (personalGroups[0]) {
        this.setState({ group: personalGroups[0].id, pending: false })
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

  createRepository () {
    if (!this.checkInput()) {
      return true
    }

    const data = {
      group: this.state.group,
      name: this.state.slug,
      displayName: this.state.name,
      description: this.state.description
    }

    this.setState({ pending: true })
    RepositoryData.create(data)
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
            this.props.intl.formatMessage({ id: 'message.error.createRepositoryFail' })
            , 2)
          )
          this.setState({ pending: false })
        }
      })

    return true
  }

  render () {
    const { classes, intl, groupList, currentGroupKey, currentUserInfo } = this.props

    const permittedGroups = groupList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.GROUP_CREATE_REPO))

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom>
          { intl.formatMessage({ id: 'label.newRepository' }) }
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper} >
          <Grid container spacing={2}>
            <Grid item xs={7}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.repositoryName' }) }</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant='outlined'
                    placeholder={intl.formatMessage({ id: 'message.error.input_S_placeholder' }, { s: intl.formatMessage({ id: 'label.repositoryName' }) })}
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
                  <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.repositoryURL' }) }</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    select
                    variant='outlined'
                    value={this.state.group}
                    error={!!this.state.error.group}
                    helperText={this.state.error.group}
                    onChange={e => this.setState({ group: e.target.value })}
                    disabled={!!currentGroupKey.length}
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
                    placeholder={intl.formatMessage({ id: 'label.repositorySlug' })}
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
                    error={!!this.state.error.description}
                    helperText={this.state.error.description}
                    value={this.state.description}
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
                    onClick={e => this.props.history.push('/repositories')}
                  >
                    { intl.formatMessage({ id: 'label.cancel' }) }
                  </Button>
                  <Button variant='contained' color='primary' disableElevation className={classes.btn}
                    disabled={this.state.pending}
                    onClick={e => this.createRepository()}
                  >
                    { intl.formatMessage({ id: 'label.ok' }) }
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>)
  }
}

newRepository.propTypes = {
  history: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  groupList: PropTypes.array.isRequired,
  groupListPending: PropTypes.bool.isRequired,
  currentGroupKey: PropTypes.string,
  classes: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo,
    currentGroupKey: state.DataStore.currentGroupKey,
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
      connect(mapStateToProps, mapDispatchToProps)(newRepository)
    )
  )
)
