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
import CircularProgress from '@material-ui/core/CircularProgress'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { psLog, plEdit, plTrash } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import TableList from 'APPSRC/components/unit/TableList'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import Events from 'APPSRC/config/WebhookEventConfig'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import Tooltip from '@material-ui/core/Tooltip'
import WebhookLog from 'APPSRC/components/view/unit/WebhookLog'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { copyToClipboard } from 'APPSRC/helpers/VaribleHelper'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

const styles = (theme) => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  header: {
    display: 'flex',
    marginBottom: theme.spacing(4),
    justifyContent: 'space-between',
    lineHeight: theme.spacing(5) + 'px',
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px'
  },
  webhookForm: {
    paddingTop: theme.spacing(6),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(6)
  },
  btn: {
    verticalAlign: 'bottom',
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(3)
  },
  icon: {
    color: theme.palette.text.light
  },
  need: {
    color: 'red'
  },
  logs: {
    marginTop: theme.spacing(3)
  },
  dot: {
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main
  },
  close: {
    backgroundColor: theme.palette.error.main
  },
  cursorPointer: {
    cursor: 'pointer'
  }
})

class RepositorySettingWebhook extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      webhooks: null,
      webhook: null,
      pushEvent: 'hook:postReceive',

      edit: false,
      webhookLogs: null,
      isShowWebhookForm: !!window.location.search,
      url: '',
      secret: '',
      trigger: '1',
      active: '1',
      error: {},
      events: JSON.parse(JSON.stringify(Events))
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'url',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.url' }) }
        )
      },
      {
        name: 'url',
        passPattern: /^http(s)?:\/\/.+/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.url' }) }
        )
      },
      {
        name: 'url',
        passPattern: /^\S{0,255}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 255 }
        )
      },
      {
        name: 'secret',
        passPattern: /^\S{0,255}$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error.noMoreThan_N_characters' },
          { n: 255 }
        )
      }
    ])
  }

  componentDidMount () {
    this.getData(this.props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(nextProps.currentRepositoryKey) !== JSON.stringify(this.props.currentRepositoryKey)) {
      this.getData(nextProps)
      return false
    }

    return true
  }

  getData (props) {
    const { currentRepositoryKey } = props
    if (!currentRepositoryKey) {
      return false
    }

    this.setState({ pending: true })
    RepositoryData.webhooks({
      repository: currentRepositoryKey
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          const webhooks = data.data
          webhooks.map((item, index) => {
            item.events = this.getEvents(item.events)
            return true
          })
          this.setState({
            pending: false,
            webhooks: webhooks
          })
        }
      })
  }

  getWebhookLogs (rwKey) {
    if (!rwKey) {
      return false
    }

    RepositoryData.getRepositoryWebhookLogs({ webhook: rwKey })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          this.setState({ webhookLogs: data.data })
        }
      })
  }

  editWebhook () {
    const { intl, currentRepositoryKey } = this.props
    const { pending, isShowWebhookForm, trigger, url, secret, webhook, edit, active } = this.state
    if (pending || !isShowWebhookForm || !this.checkInput()) {
      return false
    }

    const events = trigger === '1' ? this.state.pushEvent : this.getCheckedEvents()
    if (!events) {
      this.props.dispatchEvent(EventGenerator.NewNotification(
        intl.formatMessage({ id: 'message.webhookEventsNeed' })
        , 1)
      )
    }

    this.setState({ pending: true })
    RepositoryData.editWebhook({
      repository: currentRepositoryKey,
      rwKey: webhook ? webhook.id : '',
      url: url,
      secret: secret,
      events: events,
      active: active
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        this.setState({ pending: false })
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            intl.formatMessage({ id: edit ? 'message.updated' : 'message.created' })
            , 0)
          )
          this.initData()
          this.setState({ isShowWebhookForm: false })
          this.getData(this.props)
        }
      })
  }

  updateWebhook (webhook) {
    const { currentRepositoryKey } = this.props

    if (!currentRepositoryKey) {
      return false
    }

    this.setState({ pending: true })
    RepositoryData.getWebhook({
      repository: currentRepositoryKey,
      rwKey: webhook.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (!data.code) {
          const webhook = data.data
          this.setState({
            pending: false,
            edit: true,
            webhook: webhook,
            isShowWebhookForm: true,
            url: webhook.url,
            secret: webhook.secret,
            trigger: webhook.events === this.state.pushEvent ? '1' : '2',
            events: this.getEvents(webhook.events),
            active: webhook.active
          })
        }
      })
  }

  deleteWebhook (webhook) {
    const { currentRepositoryKey, intl } = this.props
    this.props.dispatchEvent(EventGenerator.addComformation('delete_webhook', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.webhook' }) }),
      description: '',
      reject: () => { return true },
      accept: () => {
        RepositoryData.deleteWebhook({
          repository: currentRepositoryKey,
          rwKey: webhook.id
        }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then(data => {
            this.props.dispatchEvent(EventGenerator.cancelComformation())
            if (!data.code) {
              this.props.dispatchEvent(EventGenerator.NewNotification(
                this.props.intl.formatMessage({ id: 'message.deleted' })
                , 0)
              )
              this.getData(this.props)
            }
          })
      }
    }))
  }

  getTableData () {
    const { classes, intl } = this.props
    const { webhooks } = this.state
    const final = []
    webhooks.map((item) => {
      let eventCount = 0
      final.push([
        <Tooltip title={intl.formatMessage({ id: item.active === '1' ? 'label.enable' : 'label.disable' })} placement='top'>
          <div className={[classes.dot, classes.cursorPointer, item.active === '1' ? '' : classes.close].join(' ')}></div>
        </Tooltip>,
        <Typography variant='body1' component='div'>{item.user}</Typography>,
        <Tooltip title={item.url} placement='top'>
          <Typography
            variant='body1'
            component='div'
            className={classes.cursorPointer}
            onClick={e => copyToClipboard(item.url, () => this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'label.copied' }), 0)))}
          >
            {item.url.substr(0, 40)}
          </Typography>
        </Tooltip>,
        <Tooltip title={item.secret} placement='top'>
          <Typography
            variant='body1'
            component='div'
            className={classes.cursorPointer}
            onClick={e => copyToClipboard(item.secret, () => this.props.dispatchEvent(EventGenerator.NewNotification(intl.formatMessage({ id: 'label.copied' }), 0)))}
          >
            {item.secret.substr(0, 20)}
          </Typography>
        </Tooltip>,
        <Typography variant='body1' component='div'>
          {item.events.map((item, index) => {
            if (item.checked) {
              eventCount++
              if (eventCount === 4) {
                return '...'
              } else if (eventCount > 4) {
                return ''
              } else {
                return (typeof item.title === 'string'
                  ? intl.formatMessage({ id: item.title })
                  : intl.formatMessage(
                    { id: item.title[0] },
                    { s: intl.formatMessage({ id: item.title[1] }) }
                  )) + '; '
              }
            }
            return ''
          })}
        </Typography>,
        <Typography variant='body1' component='div'><FormattedTime timestamp={item.updated * 1} /></Typography>,
        <Typography>
          <SquareIconButton label='label.update' icon={plEdit} className={classes.icon} onClick={e => this.updateWebhook(item)} />
          <SquareIconButton label='label.delete' icon={plTrash} className={classes.icon} onClick={e => this.deleteWebhook(item)} />
          <SquareIconButton label='label.log' icon={psLog} className={classes.icon} onClick={e => this.getWebhookLogs(item.id)} />
        </Typography>
      ])
      return true
    })

    return [
      ['10px', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      ['', 'label.creator', 'label.url', 'label.webhookSecret', 'label.webhookTrigger', 'label.updateTime', ''],
      ...final
    ]
  }

  initData () {
    this.setState({
      edit: false,
      webhook: null,
      url: '',
      secret: '',
      trigger: '1',
      events: JSON.parse(JSON.stringify(Events)),
      active: '1'
    })
  }

  getEvents (events) {
    const tmpEvents = JSON.parse(JSON.stringify(Events))
    events = events.split(',')
    tmpEvents.map((item) => {
      if (events.indexOf(item.event) > -1) {
        item.checked = true
      } else {
        item.checked = false
      }
      return true
    })

    return tmpEvents
  }

  changeEvent (e) {
    const { events } = this.state
    let checked = false
    if (e.target.checked) {
      checked = true
    }

    events.map((item) => {
      if (item.event === e.target.value) {
        item.checked = checked
      }
      return true
    })
    this.setState({
      events: events
    })
  }

  getCheckedEvents () {
    const { events } = this.state
    const checkedEvents = []
    events.map((item) => {
      if (item.checked) {
        checkedEvents.push(item.event)
      }
      return true
    })

    return checkedEvents.join(',')
  }

  render () {
    const { classes, intl } = this.props
    const { pending, webhooks, webhookLogs, isShowWebhookForm, url, secret, trigger, events, edit, active, error } = this.state

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.header}>
          {intl.formatMessage({ id: 'label.webhookSetting' })}
          {!isShowWebhookForm && <Button
            color='primary'
            disableElevation
            variant='contained'
            disabled={pending}
            onClick={e => this.setState({ isShowWebhookForm: true })}
          >
            {intl.formatMessage({ id: 'label.createWebhook' })}
          </Button>}
        </Typography>
      </Grid>

      {isShowWebhookForm && <React.Fragment>
        <Grid item xs={12}>
          <Typography variant='h6' component='div'>{intl.formatMessage({ id: edit ? 'label.updateWebhook' : 'label.createWebhook' })}</Typography>
        </Grid>
        <Grid container className={classes.webhookForm}>
          <Grid item xs={3} />
          <Grid item xs={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.url' })} <span className={classes.need}>*</span></Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.url' }) })}
                  value={url}
                  error={!!error.url}
                  helperText={error.url}
                  onChange={e => this.setState({ url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.contentType' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body1' component='div'>application/json</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>
                  {intl.formatMessage({ id: 'label.webhookSecret' })}
                  &nbsp;
                  <ShowHelper type='icon' doc='/repo/webhooks.md' />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder={intl.formatMessage({ id: 'message.error._S_empty' }, { s: intl.formatMessage({ id: 'label.webhookSecret' }) })}
                  value={secret}
                  error={!!error.secret}
                  helperText={error.secret}
                  onChange={e => this.setState({ secret: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.webhookTrigger' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <RadioGroup value={trigger} onChange={e => this.setState({ trigger: e.target.value })}>
                  <FormControlLabel value="1" control={<Radio />} label={intl.formatMessage({ id: 'label.pushTrigger' })} />
                  <FormControlLabel value="2" control={<Radio />} label={
                    <React.Fragment>
                      <Typography variant='body1' component='span'>{intl.formatMessage({ id: 'label.customeTrigger' })}</Typography>
                      &nbsp;
                      <ShowHelper type='icon' doc='/repo/webhooks.md' />
                    </React.Fragment>} />
                </RadioGroup>
              </Grid>
              {trigger === '2' && <Grid item xs={12}>
                {events.map((item, index) => {
                  return <FormControlLabel
                    control={<Checkbox checked={item.checked} onChange={e => this.changeEvent(e)} value={item.event} />}
                    label={
                      typeof item.title === 'string'
                        ? intl.formatMessage({ id: item.title })
                        : intl.formatMessage(
                          { id: item.title[0] },
                          { s: intl.formatMessage({ id: item.title[1] }) }
                        )
                    }
                  />
                })}
              </Grid>}

              <Grid item xs={12}>
                <Typography variant='subtitle1' component='div'>{intl.formatMessage({ id: 'label.status' })}</Typography>
              </Grid>
              <Grid item xs={12}>
                <RadioGroup value={active} onChange={e => { this.setState({ active: e.target.value }) }} row>
                  <FormControlLabel value='1' control={<Radio />} label={intl.formatMessage({ id: 'label.enable' })} />
                  <FormControlLabel value='2' control={<Radio />} label={intl.formatMessage({ id: 'label.disable' })} />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} align='right'>
                <Button
                  color='primary'
                  variant='outlined'
                  disableElevation
                  disabled={pending}
                  onClick={e => {
                    edit && this.initData()
                    this.setState({ isShowWebhookForm: false })
                  }}
                >
                  {intl.formatMessage({ id: 'label.cancel' })}
                </Button>
                <Button
                  color='primary'
                  variant='contained'
                  disableElevation
                  className={classes.btn}
                  disabled={pending}
                  onClick={e => this.editWebhook()}
                >
                  {pending && <CircularProgress size='1rem' color='inherit' />}
                  {intl.formatMessage({ id: edit ? 'label.update' : 'label.create' })}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
      }

      {!isShowWebhookForm && <React.Fragment>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6' component='div'>{intl.formatMessage({ id: 'label.webhookList' })}</Typography>
          </Grid>
          {webhooks
            ? webhooks.length > 0
              ? <Grid item xs={12}>
                <TableList data={this.getTableData()} />
              </Grid>
              : <Grid container spacing={2} className={classes.loading}>
                <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'message.webhookListEmpty' })}</Typography>
              </Grid>
            : <Grid container spacing={2} className={classes.loading}>
              <CircularProgress />
            </Grid>
          }
        </Grid>
        {
          webhookLogs && <Grid container spacing={2} className={classes.logs}>
            <Grid item xs={12}>
              <Typography variant='h5' component='div'>
                {intl.formatMessage({ id: 'label.webhookLog' })}&nbsp;&nbsp;
                <Typography variant='body2' component='span'>({intl.formatMessage({ id: 'message.show_n_record' }, { n: 30 })})</Typography>
              </Typography>
            </Grid>
            <WebhookLog list={webhookLogs} />
          </Grid>
        }
      </React.Fragment>}
    </Grid>)
  }
}

RepositorySettingWebhook.propTypes = {
  currentRepositoryKey: PropTypes.string.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(RepositorySettingWebhook)
  )
)
