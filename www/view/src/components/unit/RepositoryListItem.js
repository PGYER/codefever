// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Hidden from '@material-ui/core/Hidden'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plFork, plMember, plMerge, plSetting } from '@pgyer/icons'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import Constants from 'APPSRC/config/Constants'
import UAC from 'APPSRC/config/UAC'

// style
const styles = theme => ({
  container: {
    height: theme.spacing(9),
    padding: theme.spacing(2) + 'px ' + theme.spacing(3) + 'px',
    border: '1px solid ' + theme.palette.border,
    marginBottom: '-1px',
    borderLeft: 'none',
    borderRight: 'none',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.background.dark
    }
  },
  item: {
    height: theme.spacing(5)
  },
  icon: {
    width: theme.spacing(5),
    height: theme.spacing(5)
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: '-' + theme.spacing(1) + 'px',
    border: '1px solid ' + theme.palette.border
  }
})

class RepositoryCard extends Component {
  render () {
    const { classes, history, repositoryInfo, intl } = this.props

    return <Grid
      container
      spacing={0}
      alignContent='center'
      className={classes.container}
      onClick={(ev) => { history.push(makeLink(repositoryInfo.group.name, repositoryInfo.name)) }}
    >
      <Grid item xs={6} md={4}>
        <Grid container spacing={2}>
          <Grid item>
            { repositoryInfo.icon
              ? <Avatar variant='square' className={classes.icon} src={Constants.HOSTS.STATIC_AVATAR_PREFIX + repositoryInfo.icon} />
              : <Avatar variant='square' className={classes.icon}>{repositoryInfo.name.substr(0, 1).toUpperCase()}</Avatar>
            }
          </Grid>
          <Grid item xs={8}>
            <Typography variant='body1' component='div' className='text-overflow' style={{ lineHeight: '22px', height: '22px' }}>
              { repositoryInfo.group.displayName + '/' }
              <Typography variant='subtitle1' component='span'>
                { repositoryInfo.displayName }
                &nbsp;&nbsp;&nbsp;&nbsp;
                <InlineMarker color={repositoryInfo.role === UAC.Role.OWNER ? 'containedInfo' : 'info'} text={intl.formatMessage({ id: 'label.roleID_' + repositoryInfo.role })} />
              </Typography>
            </Typography>
            <Typography variant='caption' component='div' className='text-overflow' style={{ lineHeight: '20px', height: '18px' }}>
              { repositoryInfo.description }
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={5} md={3} container alignItems='center' justifyContent='space-around'>
        <Grid item>
          <Typography variant='body2' component='span' style={{ lineHeight: 1 }}>
            <FontAwesomeIcon icon={plFork} />&nbsp;&nbsp;
            {repositoryInfo.forkCount}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='body2' component='span' style={{ lineHeight: 1 }}>
            <FontAwesomeIcon icon={plMerge} />&nbsp;&nbsp;
            {repositoryInfo.mergeRequestCount.open}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='body2' component='span' style={{ lineHeight: 1 }}>
            <FontAwesomeIcon icon={plMember} />&nbsp;&nbsp;
            {repositoryInfo.members.length}
          </Typography>
        </Grid>
        <Grid item />
      </Grid>
      <Hidden mdDown>
        <Grid item md={4} container alignItems='center'>
          { repositoryInfo.members.map((item, key) => {
            return <Grid key={key} item>
              <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + item.icon} className={classes.avatar}>
                { item.name && item.name[0].toUpperCase() }
              </Avatar>
            </Grid>
          }) }
        </Grid>
      </Hidden>
      <Grid item xs={1} style={{ alignSelf: 'center' }}>
        <SquareIconButton
          label='label.setting'
          icon={plSetting}
          onClick={(ev) => {
            ev.stopPropagation()
            history.push(makeLink(repositoryInfo.group.name, repositoryInfo.name, 'settings'))
          }}
        />
      </Grid>
    </Grid>
  }
}

RepositoryCard.propTypes = {
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  repositoryInfo: PropTypes.object
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentGroupConfig: state.DataStore.currentGroupConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(RepositoryCard)
      )
    )
  )
)
