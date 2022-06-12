// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plCopy, plClock, plClose, psConfirm, psError, psMore } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import TitleList from 'APPSRC/components/unit/TitleList'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { copyToClipboard } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  webhook: {
    borderTop: '1px solid ' + theme.palette.border
  },
  subline: {
    display: 'flex',
    alignItems: 'center',
    height: theme.spacing(6),
    padding: '0px ' + theme.spacing(3) + 'px'
  },
  date: {
    justifyContent: 'flex-end'
  },
  success: {
    color: theme.palette.success.main
  },
  error: {
    color: theme.palette.error.main
  },
  webhookid: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    background: theme.palette.background.dark,
    padding: theme.spacing(0.5) + 'px ' + theme.spacing(1) + 'px'
  },
  more: {
    marginLeft: theme.spacing(2)
  },
  detail: {
    padding: theme.spacing(3),
    paddingTop: 0
  },
  time: {
    lineHeight: theme.spacing(5) + 'px'
  },
  code: {
    overflowX: 'auto',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    background: theme.palette.background.main,
    border: '1px solid ' + theme.palette.border
  }
})

class BranchList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      webhookTab: 0,
      webhookId: '',
      logData: null
    }
  }

  componentDidMount () {
  }

  getData (id) {
    if (!id) {
      return false
    }

    this.setState({ webhookTab: 0, webhookId: id, logData: null })
    RepositoryData.getRepositoryWebhookLogData({ id: id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({ logData: data.data })
        }
      })
  }

  getTime (start, end) {
    return Math.floor((end - start) * 100) / 100
  }

  render () {
    const { list, classes, intl } = this.props
    const { webhookTab, webhookId, logData } = this.state

    return <Grid item xs={12}>
      <TitleList title=''>
        {
          list.map(item => <Grid container key={item.id} className={classes.webhook}>
            <Grid item xs={8} className={classes.subline}>
              <FontAwesomeIcon icon={item.success ? psConfirm : psError} className={item.success ? classes.success : classes.error} />
              <Typography variant='body1' component='span' className={classes.webhookid}>{item.id}</Typography>
              <SquareIconButton label='label.copy' onClick={e => copyToClipboard(item.id)} icon={plCopy} />
            </Grid>
            <Grid item xs={4} className={[classes.subline, classes.date].join(' ')}>
              <Typography variant='body1' component='span'>{item.created}</Typography>
              {
                webhookId === item.id
                  ? <SquareIconButton label='label.close' onClick={e => this.setState({ webhookId: '' })} icon={plClose} className={classes.more} />
                  : <SquareIconButton label='label.detail' onClick={e => this.getData(item.id)} icon={psMore} className={classes.more} />
              }
            </Grid>
            {
              webhookId && webhookId === item.id && logData && <Grid item xs={12} className={classes.detail}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TabHeader
                      tabs={[intl.formatMessage({ id: 'label.request' }), <Grid>{intl.formatMessage({ id: 'label.response' })}&emsp;<InlineMarker color={item.success ? 'success' : 'error'} text={item.status + ''} /></Grid>]}
                      currentTab={webhookTab}
                      onChange={(e, newValue) => this.setState({ webhookTab: newValue })}
                    >
                      <Typography variant='body1' component='div' className={classes.time}>
                        <FontAwesomeIcon icon={plClock} />&nbsp;
                        {intl.formatMessage({ id: 'message.useTime_n' }, { n: this.getTime(item.start, item.end) })}
                      </Typography>
                    </TabHeader>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='h5' component='div'>{intl.formatMessage({ id: 'label.httpHeaders' })}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid className={classes.code}>
                      {
                        webhookTab === 0
                          ? Object.keys(logData.request.headers).map(key => <Grid key={key}>
                            <Typography variant='subtitle1' component='span'>{key}:</Typography>&emsp;
                            <Typography variant='body1' component='span'>{logData.request.headers[key]}</Typography>
                          </Grid>)
                          : Object.keys(logData.response.headers).map(key => <Grid key={key}>
                            <Typography variant='subtitle1' component='span'>{key}:</Typography>&emsp;
                            <Typography variant='body1' component='span'>{logData.response.headers[key]}</Typography>
                          </Grid>)
                      }
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='h5' component='div'>
                      {webhookTab === 0 ? intl.formatMessage({ id: 'label.httpPayload' }) : intl.formatMessage({ id: 'label.httpBody' })}
                      &nbsp;
                      {webhookTab === 0 && <ShowHelper type='icon' doc='/repo/webhooks.md' />}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid className={classes.code}>
                      <pre>
                        <Typography variant='body1' component='div'>
                          {webhookTab === 0 ? JSON.stringify(JSON.parse(logData.request.body), null, 4) : logData.response.body}
                        </Typography>
                      </pre>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            }
          </Grid>)
        }
      </TitleList>
    </Grid>
  }
}

BranchList.propTypes = {
  list: PropTypes.array.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
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
    connect(mapStateToProps, mapDispatchToProps)(BranchList)
  )
)
