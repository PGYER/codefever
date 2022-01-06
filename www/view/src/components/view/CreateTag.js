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
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plBranch, plTag } from '@pgyer/icons'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'

// helpers
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

// style
const styles = theme => ({
  title: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(3),
    borderBottom: '1px solid ' + theme.palette.border
  },
  icon: {
    color: theme.palette.text.light
  },
  textRight: {
    textAlign: 'right'
  },
  outRange: {
    color: theme.palette.error.main
  },
  mr16: {
    marginRight: theme.spacing(2)
  }
})

class CreateTag extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      pending: true,
      name: '',
      origin: '',
      description: '',
      error: {
      }
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'name',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.tagName' }) }
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
        passPattern: /^\w+(\.\w+)*$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.tagName' }) }
        )
      },
      {
        name: 'origin',
        passPattern: /^.{0,40}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 40 }
        )
      },
      {
        name: 'description',
        passPattern: /^[\S\n]{0,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 30 }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'name',
        exceptionCode: 0x0403,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.tagName' }) }
        )
      },
      {
        name: 'name',
        exceptionCode: 0x0406,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_duplicate' },
          { s: this.props.intl.formatMessage({ id: 'label.tagName' }) }
        )
      },
      {
        name: 'origin',
        exceptionCode: 0x040C,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_notFound' },
          { s: this.props.intl.formatMessage({ id: 'label.createOrigin' }) }
        )
      }
    ])
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.pending &&
      this.props.currentRepositoryKey &&
      this.props.currentRepositoryConfig.repository !== undefined) {
      this.setState({ pending: false })
    }

    if (this.state.pending &&
      this.props.currentRepositoryConfig.repository !== undefined &&
      this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.setState({ pending: false })
    }

    if (this.state.pending &&
      this.props.currentRepositoryKey &&
      JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.setState({ pending: false })
    }

    return true
  }

  createTag () {
    const { currentRepositoryKey, currentRepositoryConfig, history, intl } = this.props
    const { name, origin, description } = this.state
    if (!currentRepositoryKey || !currentRepositoryConfig.repository || !this.checkInput()) {
      return false
    }

    if (name === 'new' || name.slice(name.length - 4) === '.git') {
      this.setState({
        error: {
          name: intl.formatMessage({ id: 'message.error._S_invalid' }, { s: this.props.intl.formatMessage({ id: 'label.tagName' }) })
        }
      })
      return false
    }

    for (const item of currentRepositoryConfig.branches) {
      if (name === item.name) {
        this.setState({
          error: {
            name: intl.formatMessage({ id: 'message.error._S_duplicate' }, { s: this.props.intl.formatMessage({ id: 'label.tagName' }) })
          }
        })
        return false
      }
    }

    for (const item of currentRepositoryConfig.tags) {
      if (name === item.name) {
        this.setState({
          error: {
            name: intl.formatMessage({ id: 'message.error._S_duplicate' }, { s: this.props.intl.formatMessage({ id: 'label.tagName' }) })
          }
        })
        return false
      }
    }

    this.setState({ pending: true })
    RepositoryData.createTag({
      repository: currentRepositoryKey,
      name: name,
      origin: origin,
      description: description
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          currentRepositoryConfig.tags.push({ id: name, name: name })
          ++currentRepositoryConfig.count.tag
          history.push(makeLink(
            currentRepositoryConfig.repository.group.name,
            currentRepositoryConfig.repository.name,
            'tags'))
        } else if (!this.checkResponse(data.code)) {
          this.setState({ pending: false })
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.createTagFail' }),
            2)
          )
          this.setState({ pending: false })
        }
      })
  }

  render () {
    const { currentRepositoryConfig, history, classes, intl } = this.props

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.title}>{ intl.formatMessage({ id: 'label.newTag' }) }</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.tagName' }) }</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error.input_S_placeholder' }, { s: intl.formatMessage({ id: 'label.tagName' }) })}
                  value={this.state.name}
                  error={!!this.state.error.name}
                  helperText={this.state.error.name}
                  onChange={(e) => {
                    this.setState({ name: e.target.value, error: {} })
                  }}
                />
              </Grid>
              {/* <Grid item xs={8}>
                <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.createOrigin' }) }</Typography>
              </Grid> */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.choseCreateOrigin' }) }</Typography>
              </Grid>
              {/* <Grid item xs={8}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message._S_empty' }, { s: intl.formatMessage({ id: 'label.createOrigin' }) })}
                  value={this.state.origin}
                  error={!!this.state.error.origin}
                  helperText={this.state.error.origin}
                  onChange={(e) => this.setState({ origin: e.target.value })}
                />
              </Grid> */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  variant='outlined'
                  value={this.state.origin}
                  error={!!this.state.error.origin}
                  helperText={this.state.error.origin}
                  onChange={(e) => this.setState({ origin: e.target.value })}
                >
                  <MenuItem disabled>{intl.formatMessage({ id: 'label.branch' })}</MenuItem>
                  { currentRepositoryConfig.branches && currentRepositoryConfig.branches.map((item, index) => {
                    return (<MenuItem key={index} value={item.name}>
                      <FontAwesomeIcon className={classes.icon} icon={plBranch} />&nbsp;&nbsp;
                      {item.name}
                    </MenuItem>)
                  })
                  }
                  <MenuItem disabled>{intl.formatMessage({ id: 'label.tag' })}</MenuItem>
                  { currentRepositoryConfig.tags && currentRepositoryConfig.tags.map((item, index) => {
                    return (<MenuItem key={index} value={item.name}>
                      <FontAwesomeIcon className={classes.icon} icon={plTag} />&nbsp;&nbsp;
                      {item.name}
                    </MenuItem>)
                  })
                  }
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.tagDescription' }) }</Typography>
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
                  onChange={(e) => {
                    this.setState({ description: e.target.value })
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent='flex-end'>
                  <Grid item xs={3} className={classes.textRight}>
                    <Typography
                      variant='subtitle1'
                      component='div'
                      className={this.state.description.length > 30 ? classes.outRange : ''}
                    >
                      {this.state.description.length}/30
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} align='right'>
                <Button
                  variant='outlined'
                  color='primary'
                  className={classes.mr16}
                  disabled={this.state.pending}
                  onClick={() => history.push(makeLink(
                    currentRepositoryConfig.repository.group.name,
                    currentRepositoryConfig.repository.name,
                    'tags'
                  ))}
                >
                  {intl.formatMessage({ id: 'label.cancel' })}
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={this.state.pending}
                  onClick={() => this.createTag()}
                >
                  { this.state.pending ? <CircularProgress size='1rem' color='inherit' className={classes.mr16} /> : ''}
                  {intl.formatMessage({ id: 'label.ok' })}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>&nbsp;</Grid>
        </Grid>
      </Grid>
    </Grid>
    )
  }
}

CreateTag.propTypes = {
  currentRepositoryKey: PropTypes.string,
  currentRepositoryConfig: PropTypes.object,
  dispatchEvent: PropTypes.func.isRequired,
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
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(CreateTag)
    )
  )
)
