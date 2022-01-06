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
import UserData from 'APPSRC/data_providers/UserData'
import Typography from '@material-ui/core/Typography'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = (theme) => ({
  btn: {
    marginLeft: theme.spacing(0.5),
    minWidth: theme.spacing(8),
    padding: 0
  },
  editBtn: {
    color: theme.palette.primary.main
  },
  flexRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  flexRowCenter: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    padding: theme.spacing(1.5) + 'px ' + theme.spacing(1) + 'px',
    marginLeft: theme.spacing(4)
  },
  breakWord: {
    wordBreak: 'break-word'
  }
})

class SetBaseInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      [props.name]: (this.props.currentUserInfo && this.props.currentUserInfo[props.infoName]) ? this.props.currentUserInfo[props.infoName] : '',
      error: {},
      showInput: false
    }

    this.unmounted = false
    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'data',
        exceptionCode: 0x0405,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.basicInfoChangeFail' }
        )
      }
    ])
  }

  checkBaseInfo () {
    const { name } = this.props
    const validateArr = []
    switch (name) {
      case 'name':
        validateArr.push({
          name: 'name',
          passPattern: /^\S+$/,
          errorMessage: this.props.intl.formatMessage(
            { id: 'message.error._S_empty' },
            { s: this.props.intl.formatMessage({ id: 'label.userName' }) }
          )
        },
        {
          name: 'name',
          passPattern: /^.{2,50}$/,
          errorMessage: this.props.intl.formatMessage(
            { id: 'message.error.within_N1_to_N2_characters' },
            { n1: 2, n2: 50 }
          )
        })
        break
      case 'email':
        validateArr.push({
          name: 'email',
          passPattern: /^.+$/,
          errorMessage: this.props.intl.formatMessage(
            { id: 'message.error._S_empty' },
            { s: this.props.intl.formatMessage({ id: 'label.email' }) }
          )
        },
        {
          name: 'email',
          passPattern: /^[^@]+@[^@]+\.[^@]+$/,
          errorMessage: this.props.intl.formatMessage(
            { id: 'message.error._S_invalid' },
            { s: this.props.intl.formatMessage({ id: 'label.email' }) }
          )
        })
        break
      case 'team':
        validateArr.push({
          name: 'team',
          passPattern: /^.{0,50}$/,
          errorMessage: this.props.intl.formatMessage(
            { id: 'message.error.noMoreThan_N_characters' },
            { n: 50 }
          )
        })
        break
      case 'role':
        validateArr.push({
          name: 'role',
          passPattern: /^.{0,50}$/,
          errorMessage: this.props.intl.formatMessage(
            { id: 'message.error.noMoreThan_N_characters' },
            { n: 50 }
          )
        })
        break
    }
    return ValidatorGenerator.stateValidator(this, validateArr)()
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  basicInfoUpdate () {
    if (!this.checkBaseInfo()) {
      return false
    }

    UserData.updateBasicInfo({
      field: this.props.name,
      value: this.state[this.props.name]
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((result) => {
        if (!result.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(this.props.intl.formatMessage({ id: 'message.updated' }), 0))
          this.setState({ showInput: false })
          this.props.update()
        } else if (!this.checkResponse(result.code)) {
          return false
        }
      })
  }

  render () {
    const { error, showInput } = this.state
    const { classes, intl, name, label, currentUserInfo, infoName } = this.props
    return (<Grid item xs={12}>
      <Grid container className={classes.flexRowCenter}>
        <Grid item xs={2}>
          <Typography variant='body2' component='div'>{ intl.formatMessage({ id: label }) }</Typography>
        </Grid>
        <Grid item xs={5} className={classes.flexRow}>
          { !showInput && <Typography className={classes.breakWord} variant={currentUserInfo && currentUserInfo[infoName] ? 'subtitle1' : 'body2'} component='div'>{ currentUserInfo && currentUserInfo[infoName] ? currentUserInfo[infoName] : intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: label }) }) }</Typography> }
          { showInput && <Grid container>
            <Grid item xs={11}>
              <TextField
                fullWidth
                variant='outlined'
                error={!!error[name]}
                helperText={error[name]}
                placeholder={currentUserInfo && currentUserInfo[infoName] ? currentUserInfo[infoName] : intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: label }) })}
                value={this.state[name]}
                onChange={(e) => {
                  error[name] = ''
                  this.setState({
                    [name]: e.target.value,
                    error: error
                  })
                }}
              />
            </Grid>
          </Grid>}
        </Grid>
        <Grid item xs={5}>
          {!showInput && <Button variant='outlined' color='primary' className={[classes.btn, classes.editBtn].join(' ')}
            onClick={(e) => this.setState({ showInput: true })}
          >
            { intl.formatMessage({ id: 'label.edit' }) }
          </Button>}
          {showInput && <Grid className={classes.flexRow}>
            <Button variant='contained' color='primary' className={classes.btn}
              onClick={e => this.basicInfoUpdate()}
            >
              { intl.formatMessage({ id: 'label.save' }) }
            </Button>
            <Button variant='outlined' color='primary' className={classes.btn}
              onClick={() => this.setState({ showInput: false })}
            >
              { intl.formatMessage({ id: 'label.cancel' }) }
            </Button>
          </Grid>}
        </Grid>
      </Grid>
    </Grid>
    )
  }
}

SetBaseInfo.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  infoName: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
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
    connect(mapStateToProps, mapDispatchToProps)(SetBaseInfo)
  )
)
