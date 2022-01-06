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
})

class SetUserInfo extends React.Component {
  constructor (props) {
    super(props)
    this.oldData = props.currentUserInfo[props.comData.field]
    this.state = {
      data: this.oldData,
      showBtn: false,
      error: {}
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'data',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: props.comData.label }) }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'data',
        exceptionCode: 0x0405,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.change_S_Fail' },
          { s: this.props.intl.formatMessage({ id: props.comData.label }) }
        )
      }
    ])
  }

  saveData () {
    const { intl, comData } = this.props
    const { data } = this.state
    if (this.oldData === data || !this.checkInput()) {
      return false
    }

    UserData.setUserData({
      data: data,
      field: comData.field
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((result) => {
        if (!result.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.updated' }), 0))
          this.oldData = data
          this.props.update()
        } else if (!this.checkResponse(result.code)) {
          return false
        }
      })
  }

  render () {
    const { intl, comData } = this.props
    return (<Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: comData.label }) }</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant='outlined'
            value={this.state.data}
            error={!!this.state.error.data}
            helperText={this.state.error.data}
            placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: comData.label }) })}
            onChange={e => this.setState({ data: e.target.value })}
            onFocus={() => this.setState({ showBtn: true })}
          />
        </Grid>
        { this.state.showBtn && <Grid item xs={12} align='right'>
          <Button variant='outlined' color='primary' onClick={e => this.setState({ showBtn: false })}>
            {intl.formatMessage({ id: 'label.cancel' })}
          </Button>&nbsp;&nbsp;
          <Button variant='contained' color='primary' onClick={e => this.saveData()}>
            {intl.formatMessage({ id: 'label.save' })}
          </Button>
        </Grid>
        }
      </Grid>
    </Grid>
    )
  }
}

SetUserInfo.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  comData: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
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
    connect(mapStateToProps, mapDispatchToProps)(SetUserInfo)
  )
)
