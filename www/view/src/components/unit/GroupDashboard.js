// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import CircularProgress from '@material-ui/core/CircularProgress'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  plRepository,
  plMerge,
  plMember
} from '@pgyer/icons'

import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
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
  }
})

class GroupDashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      popoverAnchor: null,
      popoverTab: 0
    }
  }

  render () {
    const { classes, groupConfig, repositoryList, intl, history } = this.props

    return (
      <Paper elevation={1} className={classes.content}>
        { groupConfig && groupConfig.group && groupConfig.group.id
          ? <Grid container spacing={3} justifyContent='space-between'>
            <Grid item>
              <Grid container spacing={3} className='width-auto'>
                <Grid item>
                  { groupConfig.group.icon
                    ? <Avatar variant='square' className={classes.icon} src={Constants.HOSTS.STATIC_AVATAR_PREFIX + groupConfig.group.icon} />
                    : <Avatar variant='square' className={classes.icon}>{groupConfig.group.name.substr(0, 1).toUpperCase()}</Avatar>
                  }
                </Grid>
                <Grid item>
                  <Typography variant='h6' className={classes.text}>
                    {groupConfig.group.displayName} &nbsp;&nbsp;
                  </Typography>
                  <Typography variant='caption' component='div' className={classes.subtext}>
                    {intl.formatMessage({ id: 'label.groupID' }) }: {groupConfig.group.id}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={2} justifyContent='flex-end'>
                <Grid item>
                  <Button variant='contained' color='primary'
                    onClick={e => history.push(makeLink('groups', groupConfig.group.name, 'repositories', 'new'))}
                  >{ intl.formatMessage({ id: 'label.newRepository' }) }</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' className={classes.iconBar}>
                <FontAwesomeIcon icon={plRepository} />
                &nbsp; { intl.formatMessage({ id: 'label._N_repository' }, {
                  n: repositoryList
                    .filter(FilterGenerator.group(groupConfig.group.id))
                    .length
                }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plMerge} />
                &nbsp;
                { intl.formatMessage({ id: 'label._N_mergeRequest' }, {
                  n: repositoryList
                    .filter(FilterGenerator.group(groupConfig.group.id))
                    .reduce((accmulator, item) => accmulator + item.mergeRequestCount.open, 0)
                }) } &nbsp;&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon icon={plMember} />
                &nbsp; { intl.formatMessage({ id: 'label._N_member' }, { n: groupConfig.count.member }) }
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

GroupDashboard.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  groupConfig: PropTypes.object,
  repositoryList: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(GroupDashboard)
      )
    )
  )
)
