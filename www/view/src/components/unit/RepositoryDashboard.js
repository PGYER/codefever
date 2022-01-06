// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import CircularProgress from '@material-ui/core/CircularProgress'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Popover from '@material-ui/core/Popover'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  plFork,
  plFile,
  plCommit,
  plBranch,
  plMerge,
  plMember,
  plTag,
  plCopy
} from '@pgyer/icons'

import TabHeader from 'APPSRC/components/unit/TabHeader'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import ShowHelper from '@pgyer/essential-component/ShowHelper'

import { formatNumber, makeLink } from 'APPSRC/helpers/VaribleHelper'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import Constants from 'APPSRC/config/Constants'

// style
const styles = theme => ({
  content: {
    height: theme.spacing(15.5),
    boxSizing: 'border-box',
    borderBottom: '1px solid ' + theme.palette.border,
    borderRadius: 0
  },
  icon: {
    height: theme.spacing(5),
    width: theme.spacing(5)
  },
  text: {
    height: theme.spacing(3),
    lineHeight: theme.spacing(3) + 'px',
    overflow: 'hidden'
  },
  subtext: {
    paddingTop: theme.spacing(0.5),
    height: theme.spacing(1.5),
    lineHeight: theme.spacing(1.5) + 'px'
  },
  iconBar: {
    height: theme.spacing(3),
    lineHeight: theme.spacing(3) + 'px'
  },
  clonePopvoer: {
    width: theme.spacing(50) + 'px'
  },
  cloneContent: {
    padding: theme.spacing(2)
  },
  cloneHeader: {
    padding: '0px ' + theme.spacing(2) + 'px'
  },
  border: {
    '& button': {
      borderColor: theme.palette.border,
      padding: '2px ' + theme.spacing(2) + 'px'
    }
  },
  copy: {
    marginLeft: '2px',
    '& button': {
      position: 'relative',
      right: '-14px',
      borderLeft: '1px solid ' + theme.palette.border,
      borderRadius: '0px 4px 4px 0px'
    }
  }
})

class RepositoryDashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      popoverAnchor: null,
      popoverTab: 0
    }
  }

  render () {
    const { classes, repositoryConfig, intl, history, repositoryList, currentUserInfo } = this.props

    const forkRepositoryInfo = repositoryList
      .filter(FilterGenerator.id((repositoryConfig && repositoryConfig.repository && repositoryConfig.repository.forkFrom) || ''))[0]

    return (
      <Paper elevation={1} className={classes.content}>
        { repositoryConfig && repositoryConfig.repository && repositoryConfig.repository.id
          ? <Grid container spacing={3} justifyContent='space-between'>
            <Grid item>
              <Grid container spacing={3} className='width-auto'>
                <Grid item>
                  { repositoryConfig.repository.icon
                    ? <Avatar variant='square' className={classes.icon} src={Constants.HOSTS.STATIC_AVATAR_PREFIX + repositoryConfig.repository.icon} />
                    : <Avatar variant='square' className={classes.icon}>{repositoryConfig.repository.name.substr(0, 1).toUpperCase()}</Avatar>
                  }
                </Grid>
                <Grid item>
                  <Typography variant='h6' className={classes.text}>
                    {repositoryConfig.group.displayName}/{repositoryConfig.repository.displayName} &nbsp;&nbsp;
                    { forkRepositoryInfo
                      ? <Typography variant='body2' component='span' className={classes.text}>
                        <Link to={makeLink(forkRepositoryInfo.group.name, forkRepositoryInfo.name)} >
                          { intl.formatMessage({ id: 'label.forkFrom_S' }, {
                            s: forkRepositoryInfo.group.displayName + '/' + forkRepositoryInfo.displayName
                          }) }
                        </Link>
                      </Typography>
                      : '' }
                  </Typography>
                  <Typography variant='caption' component='div' className={classes.subtext}>
                    {intl.formatMessage({ id: 'label.repositoryID' }) }: {repositoryConfig.repository.id}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={2} justifyContent='flex-end' className='width-auto'>
                <Grid item>
                  <ButtonGroup variant='outlined' className={classes.border}>
                    <Button
                      onClick={
                        e => history.push(makeLink('repositories/fork', repositoryConfig.repository.id))
                      }
                    >
                      <FontAwesomeIcon icon={plFork} />
                      &nbsp; { intl.formatMessage({ id: 'label.fork' }) }
                    </Button>
                    <Button
                      disabled={!repositoryConfig.repository.forkCount}
                      onClick={
                        e => history.push(makeLink('repositories/forklist', repositoryConfig.repository.id))
                      }
                    >
                      { repositoryConfig.repository.forkCount }
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Button variant='contained' color='primary'
                    onClick={(e) => {
                      this.state.popoverAnchor
                        ? this.setState({ popoverAnchor: null })
                        : this.setState({ popoverAnchor: e.currentTarget })
                    }}
                  >{ intl.formatMessage({ id: 'label.clone' }) }</Button>
                  <Popover
                    elevation={2}
                    open={!!this.state.popoverAnchor}
                    anchorEl={this.state.popoverAnchor}
                    TransitionProps={{ timeout: 0 }}
                    onClose={(e) => {
                      this.state.popoverAnchor
                        ? this.setState({ popoverAnchor: null })
                        : this.setState({ popoverAnchor: e.currentTarget })
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                  >
                    <Paper className={classes.clonePopvoer}>
                      <Paper className={classes.cloneHeader}>
                        <TabHeader
                          tabs={['HTTPS', 'SSH']}
                          currentTab={this.state.popoverTab}
                          onChange={(ev, tab) => {
                            this.setState({ popoverTab: tab })
                          }}
                        />
                      </Paper>
                      { this.state.popoverTab === 0 && <Paper className={classes.cloneContent}>
                        <Typography variant='body2' gutterBottom>
                          {intl.formatMessage({ id: 'message.differenceBetweenHTTPSAndSSH' })} &nbsp;
                          <ShowHelper docID='a5dda647043d0cb1c4047dd1de84ca57' />
                        </Typography>
                        <TextField
                          fullWidth
                          variant='outlined'
                          value={
                            NetworkHelper.getHost(currentUserInfo) +
                            makeLink(repositoryConfig.group.name, repositoryConfig.repository.name) +
                            '.git'
                          }
                          InputProps={{
                            id: 'repsoditory-http-url-text',
                            readOnly: true,
                            endAdornment: <InputAdornment position='end' className={classes.copy}>
                              <SquareIconButton
                                label='label.copy'
                                icon={plCopy}
                                onClick={e => {
                                  const dom = document.getElementById('repsoditory-http-url-text')
                                  dom.select()
                                  document.execCommand('Copy')
                                  dom.blur()
                                }}
                              />
                            </InputAdornment>
                          }}
                        />
                      </Paper>}
                      { this.state.popoverTab === 1 && <Paper className={classes.cloneContent}>
                        <Typography variant='body2' gutterBottom>
                          {intl.formatMessage({ id: 'message.generateAndSetSSHKey' })} &nbsp;
                          <ShowHelper docID='211cfb16bc8460bc44068f3b34ee2a63' />
                        </Typography>
                        <TextField
                          fullWidth
                          variant='outlined'
                          value={
                            NetworkHelper.getSSHHost(currentUserInfo) + ':' +
                            [repositoryConfig.group.name, repositoryConfig.repository.name].join('/') +
                            '.git'
                          }
                          InputProps={{
                            id: 'repsoditory-ssh-url-text',
                            readOnly: true,
                            endAdornment: <InputAdornment position='end' className={classes.copy}>
                              <SquareIconButton
                                label='label.copy'
                                icon={plCopy}
                                onClick={e => {
                                  const dom = document.getElementById('repsoditory-ssh-url-text')
                                  dom.select()
                                  document.execCommand('Copy')
                                  dom.blur()
                                }}
                              />
                            </InputAdornment>
                          }}
                        />
                      </Paper>}
                    </Paper>
                  </Popover>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className={classes.iconBar}>
                <FontAwesomeIcon icon={plCommit} />
                &nbsp; { intl.formatMessage({ id: 'label._N_commit' }, { n: repositoryConfig.count.commit }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plBranch} />
                &nbsp; { intl.formatMessage({ id: 'label._N_branch' }, { n: repositoryConfig.count.branch }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plTag} />
                &nbsp; { intl.formatMessage({ id: 'label._N_tag' }, { n: repositoryConfig.count.tag }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plFile} />
                &nbsp; { intl.formatMessage({ id: 'label._N_byte' }, { n: formatNumber(repositoryConfig.count.file) }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plMerge} />
                &nbsp; { intl.formatMessage({ id: 'label._N_mergeRequest' }, { n: repositoryConfig.repository.mergeRequestCount.open }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plMember} />
                &nbsp; { intl.formatMessage({ id: 'label._N_member' }, { n: repositoryConfig.members.length }) }
              </Typography>
            </Grid>
          </Grid>
          : <Grid container spacing={2} justifyContent='space-between'>
            <CircularProgress />
          </Grid>
        }
      </Paper>
    )
  }
}

RepositoryDashboard.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  repositoryConfig: PropTypes.object,
  repositoryList: PropTypes.array.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
    currentUserInfo: state.DataStore.currentUserInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(RepositoryDashboard)
      )
    )
  )
)
