// core component
import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { psCaretDown } from '@pgyer/icons'
import CommitContainRef from 'APPSRC/components/view/unit/CommitContainRef'
import FileDiffDetail from 'APPSRC/components/view/FileDiffDetail'
import CommitHashChip from 'APPSRC/components/unit/CommitHashChip'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import Constants from 'APPSRC/config/Constants'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { makeLink, getUserInfo } from 'APPSRC/helpers/VaribleHelper'

const styles = theme => ({
  oneline: {
    display: 'flex',
    alignItems: 'center'
  },
  ml16: {
    marginLeft: theme.spacing(2)
  },
  icon: {
    marginLeft: theme.spacing(1),
    fontSize: theme.spacing(1),
    color: theme.palette.text.main
  },
  transform: {
    transform: 'rotate(180deg)'
  }
})

const CommiterAvatar = withStyles(theme => ({
  root: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  }
}))(Avatar)

class CommitDetail extends React.Component {
  constructor (props) {
    super(props)
    this.mountedFlag = false
    this.state = {
      currentGroup: props.match.params.groupName ? props.match.params.groupName : '',
      currentRepository: props.match.params.repositoryName ? props.match.params.repositoryName : '',
      commitDetail: {},
      commiterInfo: {
        name: ''
      },
      optionAnchorEl: null,
      parentHash: [],
      parentHashShow: false
    }

    this.mountedFlag = false
  }

  openOptionPopover (e) {
    this.setState({ optionAnchorEl: e.currentTarget })
  }

  closeOptionPopover () {
    this.setState({ optionAnchorEl: null })
  }

  componentDidMount () {
    this.mountedFlag = true
    const { closeDrawer } = this.props
    closeDrawer()
    this.getData(this.props, this.state)
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    // watch current hash
    if (this.props.match.params.hash !== nextProps.match.params.hash) {
      this.getData(nextProps, nextState)
      return false
    }
    // watch repository id
    if (this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.getData(nextProps, nextState)
      return false
    }

    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.getData(nextProps, nextState)
      return false
    }

    return true
  }

  copyHash (hash) {
    const { intl } = this.props
    this.copySomething(hash)
    this.setState({ copyHash: intl.formatMessage({ id: 'label.copied' }) })
  }

  copySomething (data) {
    const dom = window.document.createElement('input')
    dom.setAttribute('value', data)
    dom.setAttribute('type', 'text')
    window.document.body.appendChild(dom)
    dom.select()
    document.execCommand('copy')
    window.document.body.removeChild(dom)
  }

  getData (props, state) {
    if (!props.match.params.hash || !props.currentRepositoryKey || !props.currentRepositoryConfig.repository) {
      return false
    }

    RepositoryData.commitDetail({
      repository: props.currentRepositoryKey,
      commitSHA: props.match.params.hash
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        const result = data.data
        if (!result) {
          return false
        }
        if (props.currentRepositoryConfig) {
          const commiterInfo = getUserInfo(props.currentRepositoryConfig.members, result.email)
          const parentHash = result.parent.split(' ')
          this.setState({
            commitDetail: result,
            commiterInfo: commiterInfo,
            parentHash: parentHash
          })
        }
      })
  }

  render () {
    const {
      commitDetail,
      commiterInfo,
      currentRepository,
      currentGroup,
      parentHash,
      parentHashShow
    } = this.state

    const { classes, currentRepositoryKey, history, intl, match } = this.props
    return (<React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1}>
            <Grid container justifyContent='space-between'>
              <Grid item>
                <Typography variant='h6' component='div' gutterBottom>{commitDetail.commit}</Typography>
                <Typography variant='body1' component='div' className={classes.oneline}>
                  <CommiterAvatar src={commiterInfo.icon ? Constants.HOSTS.PGYER_AVATAR_HOST + commiterInfo.icon : '/static/images/default_avatar.png'} />&nbsp;&nbsp;
                  <Typography component='span' variant='body2'>
                    {commiterInfo.name}&nbsp;&nbsp;{intl.formatMessage({ id: 'label.editIn' })}&nbsp;
                  </Typography>
                  { commitDetail.time && <Typography component='span' variant='body2'>
                    <FormattedTime timestamp={commitDetail.time} />
                  </Typography>
                  }
                </Typography>
              </Grid>
              <Grid item className={classes.oneline}>
                <Button variant='outlined' color='primary'
                  onClick={e => this.setState({ parentHashShow: !parentHashShow })}
                >
                  {intl.formatMessage({ id: 'label.detail' })}
                  <FontAwesomeIcon icon={psCaretDown} className={[classes.icon, parentHashShow ? classes.transform : ''].join(' ')} />
                </Button>
                {commitDetail.sha && <Grid className={classes.ml16}><CommitHashChip hash={commitDetail.sha.substr(0, 8)} /></Grid>}
                <Button
                  variant='contained'
                  color='primary'
                  className={classes.ml16}
                  onClick={() => history.push(makeLink(currentGroup, currentRepository, 'files', match.params.hash, ''))}
                >
                  {intl.formatMessage({ id: 'label.browserFile' })}
                </Button>
              </Grid>
            </Grid>
            <CommitContainRef
              show={parentHashShow}
              parentHash={parentHash}
              currentHash={match.params.hash}
              currentGroup={currentGroup}
              currentRepository={currentRepository}
              currentRepositoryKey={currentRepositoryKey}
            />
            <Grid container spacing={2} justifyContent='space-between'>
              <Grid item xs={12}>
                <FileDiffDetail id='FileDiffDetail' parentHash={parentHash} childHash={match.params.hash} rKey={currentRepositoryKey} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
    )
  }
}

CommitDetail.propTypes = {
  match: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  closeDrawer: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    closeDrawer: () => {
      dispatch({ type: 'drawer.expandStatus.close' })
    },
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(CommitDetail)
      )
    )
  )
)
