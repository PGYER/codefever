// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles } from '@material-ui/core/styles'

// components
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'
import SSHKeyItem from 'APPSRC/components/unit/SSHKeyItem'
import TableList from 'APPSRC/components/unit/TableList'
import UserData from 'APPSRC/data_providers/UserData'

// helpers
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'

const styles = (theme) => ({
  header: {
    lineHeight: theme.spacing(5) + 'px',
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px'
  },
  paper: {
    padding: theme.spacing(2)
  },
  btn: {
    margin: theme.spacing(2) + 'px 0px'
  },
  table: {
    '& th, & td': {
      textAlign: 'left !important'
    }
  }
})

class UserSettingSSHKey extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      keyList: [],
      name: '',
      key: '',
      error: {}
    }

    this.mountedFlag = false

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'key',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.SSHKey' }) }
        )
      },
      {
        name: 'key',
        passPattern: /^((?:ssh|ecdsa)-[\w\d]+)\s+(\S)+(?:\s+(\S+))?\s*$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.SSHKey' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.name' }) }
        )
      },
      {
        name: 'name',
        passPattern: /^.{5,30}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.within_N1_to_N2_characters' },
          { n1: 5, n2: 30 }
        )
      }
    ])

    this.checkResponse = ValidatorGenerator.codeValidator(this, [
      {
        name: 'key',
        exceptionCode: 0x040D,
        errorMessage: this.props.intl.formatMessage({ id: 'message.error.sshKeyDuplicate' })
      }
    ])
  }

  componentDidMount () {
    this.mountedFlag = true
    this.getData()
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  addKey () {
    if (!this.checkInput()) {
      return false
    }

    const { intl, dispatchEvent } = this.props
    const { key, name } = this.state
    const parsedKey = key.match(/^((?:ssh|ecdsa)-[\w\d]+)\s+(\S+)(?:\s+(\S+))?\s*$/)

    this.setState({ pending: true })
    UserData.addSSHKey({
      name: name,
      key: parsedKey[2]
    }).then(NetworkHelper.withEventdispatcher(dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ pending: false })
        if (!data.code) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.Added' }), 0))
          this.setState({ name: '', key: '' })
          this.getData()
        } else if (!this.checkResponse(data.code)) {
          return false
        } else if (data.code > 0x0400) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.AddFail' }), 2))
        }
      })

    return true
  }

  removeKey (id) {
    const { intl, dispatchEvent } = this.props
    UserData.removeSSHKey({ id: id })
      .then(NetworkHelper.withEventdispatcher(dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.removed' }), 0))
          this.getData()
        } else if (data.code > 0x0400) {
          dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'message.error.removeFail' }), 2))
        }
      })
  }

  getData () {
    UserData.getKeyList()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({ keyList: data.data })
        }
      })
  }

  render () {
    const { currentUserInfo, classes, intl } = this.props

    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.header}>
          { intl.formatMessage({ id: 'label.SSHKey_pl' }) }
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper>
          { currentUserInfo.id
            ? <Grid container spacing={2}>
              <Grid item xs={7}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom>
                      { intl.formatMessage({ id: 'label.addSSHKey' }) } &nbsp;
                      <ShowHelper type='icon' doc='/common/sshKey.md' />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      multiline
                      rows={7}
                      value={this.state.key}
                      error={!!this.state.error.key}
                      helperText={this.state.error.key}
                      placeholder={intl.formatMessage({ id: 'message.inputSSHKEYContent' })}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        const matches = inputValue.match(/^((?:ssh|ecdsa)-[\w\d]+)\s+(\S)+(?:\s+(\S+))?\s*$/)
                        const setObject = { key: inputValue, name: '' }
                        if (matches && matches[3]) {
                          setObject.name = matches[3]
                        }
                        this.setState(setObject)
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' component='div' gutterBottom>{ intl.formatMessage({ id: 'label.name' }) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant='outlined'
                      value={this.state.name}
                      error={!!this.state.error.name}
                      helperText={this.state.error.name}
                      onChange={e => this.setState({ name: e.target.value })}
                      placeholder={intl.formatMessage({ id: 'message.inputSSHKEYName' })}
                    />
                  </Grid>
                  <Grid item xs={12} align='right'>
                    <Button
                      color='primary'
                      variant='contained'
                      disableElevation
                      onClick={e => this.addKey()}
                      disabled={this.state.pending}
                      className={classes.btn}
                    >
                      {intl.formatMessage({ id: 'label.addSSHKey' })}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3} />
              <Grid item xs={7} className={classes.table}>
                <TableList data={[
                  ['100%'],
                  ['label.SSHKeyManage'],
                  ...this.state.keyList
                    .filter(FilterGenerator.notDeleted())
                    .map((item, key) => {
                      return [<SSHKeyItem key={key} item={item} onDelete={(id) => this.removeKey(id)} />]
                    })
                ]} />
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

UserSettingSSHKey.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
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
    connect(mapStateToProps, mapDispatchToProps)(UserSettingSSHKey)
  )
)
