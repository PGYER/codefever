// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

// components
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import AvatarUploader from 'APPSRC/components/unit/AvatarUploader'

import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import Constants from 'APPSRC/config/Constants'
import { injectIntl } from 'react-intl'

const styles = (theme) => ({
  header: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(4),
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px'
  },
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

class RepositorySettingGeneral extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      name: '',
      description: '',
      error: {}
    }

    this.mountedFlag = false

    this.checkInput = ValidatorGenerator.stateValidator(this, [
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
          { s: this.props.intl.formatMessage({ id: 'label.groupName' }) }
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
    if (this.props.currentRepositoryConfig.repository) {
      this.setState({
        name: this.props.currentRepositoryConfig.repository.displayName,
        description: this.props.currentRepositoryConfig.repository.description
      })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(nextProps.currentRepositoryConfig) !== JSON.stringify(this.props.currentRepositoryConfig) &&
      nextProps.currentRepositoryConfig.repository
    ) {
      this.setState({
        name: nextProps.currentRepositoryConfig.repository.displayName,
        description: nextProps.currentRepositoryConfig.repository.description
      })
      return false
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

  updateRepository () {
    if (!this.checkInput()) {
      return true
    }

    const data = {
      repository: this.props.currentRepositoryConfig.repository.id,
      displayName: this.state.name,
      description: this.state.description
    }

    this.setState({ pending: true })
    RepositoryData.update(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({ pending: false })
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.updated' })
            , 0)
          )
          this.reloadRepositoryData()
        } else if (!this.checkResponse(data.code)) {
          this.setState({ pending: false })
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.updateFail' })
            , 2)
          )
          this.setState({ pending: false })
        }
      })

    return true
  }

  avatarUploaded (data) {
    if (!data.code) {
      this.props.dispatchEvent(EventGenerator.NewNotification(
        this.props.intl.formatMessage({ id: 'message.updated' })
        , 0)
      )
      this.reloadRepositoryData()
    }
  }

  reloadRepositoryData () {
    RepositoryData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.repositoryList.update', data: data.data })
        }
      })

    RepositoryData.config({ rKey: this.props.currentRepositoryConfig.repository.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: data.data })
        }
      })
  }

  render () {
    const { currentRepositoryConfig, classes, intl } = this.props

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom className={classes.header}>
          { intl.formatMessage({ id: 'menu.general' }) }
        </Typography>
      </Grid>
      { currentRepositoryConfig.repository
        ? <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='subtitle1' component='div' gutterBottom>
              { intl.formatMessage({ id: 'label.repositoryAvatar' }) }
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <AvatarUploader
              name='avatar'
              appendData={{ repository: currentRepositoryConfig.repository.id }}
              src={currentRepositoryConfig.repository.icon ? (Constants.HOSTS.STATIC_AVATAR_PREFIX + currentRepositoryConfig.repository.icon) : currentRepositoryConfig.repository.name.substr(0, 1).toUpperCase()}
              onUpdate={data => this.avatarUploaded(data)}
              dataProvider={RepositoryData.uploadAvatar}
            />
          </Grid>
          <Grid item xs={3} />
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
                <Typography variant='subtitle1' component='div'>{ intl.formatMessage({ id: 'label.repositoryDescription' }) }</Typography>
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
              <Grid item xs={12} style={{ textAlign: 'right' }}>
                <Button variant='outlined' color='primary' disableElevation
                  disabled={this.state.pending}
                  onClick={e => this.props.history.push('/' + currentRepositoryConfig.group.name + '/' + currentRepositoryConfig.repository.name + '/files')}
                >
                  &nbsp; { intl.formatMessage({ id: 'label.cancel' }) } &nbsp;
                </Button>
                <Button variant='contained' color='primary' disableElevation className={classes.btn}
                  disabled={this.state.pending}
                  onClick={e => this.updateRepository()}
                >
                  { this.state.pending && <CircularProgress size='1rem' color='inherit' /> }
                  &nbsp; { intl.formatMessage({ id: 'label.update' }) } &nbsp;
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4} />
        </Grid>
        : <React.Fragment>
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        </React.Fragment> }
    </Grid>)
  }
}

RepositorySettingGeneral.propTypes = {
  history: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
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
      connect(mapStateToProps, mapDispatchToProps)(RepositorySettingGeneral)
    )
  )
)
