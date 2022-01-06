// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import UserData from 'APPSRC/data_providers/UserData'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = (theme) => ({
  flexRowCenter: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  flexRowCenterEnd: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  flexRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  container: {
    padding: theme.spacing(1),
    marginLeft: theme.spacing(4)
  },
  btn: {
    marginLeft: theme.spacing(0.5),
    minWidth: theme.spacing(8),
    padding: 0,
    color: theme.palette.primary.main
  },
  cancel: {
    marginLeft: theme.spacing(1)
  },
  pr0: {
    '& > div': {
      paddingRight: '0px !important'
    },
    '& button': {
      minWidth: theme.spacing(18)
    }
  }
})

class SetPassword extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPassword: '',
      againPassword: '',
      oldPassword: '',
      password: '',
      error: {}
    }

    this.unmounted = false
    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'oldPassword',
        exceptionCode: 0x0410,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.password' }) }
        )
      }
    ])
  }

  savePasswordCheckInput () {
    const validateArr = [
      {
        name: 'oldPassword',
        passPattern: /^.{6,}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.oldPassword' }) }
        )
      },
      {
        name: 'newPassword',
        passPattern: /^.{6,50}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 6, n2: 50 }
        )
      },
      {
        name: 'againPassword',
        passPattern: new RegExp('^' + this.state.newPassword + '$'),
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_retype' },
          { s: this.props.intl.formatMessage({ id: 'label.newPassword' }) }
        )
      }
    ]
    return ValidatorGenerator.stateValidator(this, validateArr)()
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  saveData () {
    const { oldPassword, newPassword } = this.state
    if (!this.savePasswordCheckInput()) {
      return false
    }

    UserData.updatePassword({
      current: oldPassword,
      new: newPassword
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.updated' }), 0))
          this.props.update()
          this.cancel()
        } else if (!this.checkResponse(data.code)) {
          return false
        } else if (data.code > 0x0400) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.error.updateFail' }), 2))
        }
      })
  }

  cancel () {
    this.setState({
      showInput: false,
      newPassword: '',
      againPassword: '',
      oldPassword: '',
      password: '',
      error: {}
    })
  }

  render () {
    const { intl, classes } = this.props
    const { error, oldPassword, newPassword, againPassword } = this.state
    return (<Grid item xs={12}>
      <Grid container className={[classes.flexRowCenter, classes.container].join(' ')}>
        <Grid item xs={2}>
          <Typography variant='body2' component='div'>{ intl.formatMessage({ id: 'label.password' }) }</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography variant='subtitle1' component='div'>******</Typography>
        </Grid>
        { !this.state.showInput && <Grid item xs={5}>
          <Button variant='outlined' color='primary' className={classes.btn}
            onClick={e => this.setState({ showInput: true })}
          >
            { intl.formatMessage({ id: 'label.edit' }) }
          </Button>
        </Grid>
        }
      </Grid>
      { this.state.showInput && <React.Fragment>
        <Grid container className={[classes.flexRowCenter, classes.container].join(' ')}>
          <Grid item xs={2} />
          <Grid item xs={5}>
            <TextField
              fullWidth
              variant='outlined'
              type='password'
              value={oldPassword}
              error={!!error.oldPassword}
              helperText={error.oldPassword}
              placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.oldPassword' }) })}
              onChange={e => this.setState({ oldPassword: e.target.value })}
            />
          </Grid>
        </Grid>
        <Grid container className={[classes.flexRowCenter, classes.container].join(' ')}>
          <Grid item xs={2} />
          <Grid item xs={5}>
            <TextField
              fullWidth
              variant='outlined'
              type='password'
              value={newPassword}
              error={!!error.newPassword}
              helperText={error.newPassword}
              placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.newPassword' }) })}
              onChange={e => this.setState({ newPassword: e.target.value })}
            />
          </Grid>
        </Grid>
        <Grid container className={[classes.flexRowCenter, classes.container].join(' ')}>
          <Grid item xs={2} />
          <Grid item xs={5}>
            <TextField
              fullWidth
              variant='outlined'
              type='password'
              value={againPassword}
              error={!!error.againPassword}
              helperText={error.againPassword}
              placeholder={intl.formatMessage({ id: 'message.error._S_retype' }, { s: intl.formatMessage({ id: 'label.newPassword' }) })}
              onChange={e => this.setState({ againPassword: e.target.value })}
            />
          </Grid>
        </Grid>
        <Grid container className={[classes.flexRowCenter, classes.container].join(' ')}>
          <Grid item xs={2} />
          <Grid item xs={5}>
            <Button variant='contained' color='primary' onClick={() => this.saveData()}>{intl.formatMessage({ id: 'label.save' })}</Button>
            <Button variant='outlined' color='primary' className={classes.cancel} onClick={() => this.cancel()}>{intl.formatMessage({ id: 'label.cancel' })}</Button>
          </Grid>
        </Grid>
      </React.Fragment>
      }
    </Grid>
    )
  }
}

SetPassword.propTypes = {
  update: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(SetPassword)
  )
)
