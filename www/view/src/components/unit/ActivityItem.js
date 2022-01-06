// core
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import { injectIntl } from 'react-intl'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import Activity from 'APPSRC/config/Activity'
import Constants from 'APPSRC/config/Constants'

// style
const styles = theme => ({
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  item: {
    border: '1px solid ' + theme.palette.border,
    marginBottom: '-1px',
    padding: theme.spacing(2) + 'px ' + theme.spacing(3) + 'px',
    '&:first-child': {
      borderRadius: '4px 4px 0px 0px'
    },
    '&:last-child': {
      borderRadius: '0px 0px 4px 4px'
    }
  },
  action: {
    lineHeight: theme.spacing(3) + 'px'
  },
  paddingRight2: {
    paddingRight: theme.spacing(2),
    lineHeight: theme.spacing(3) + 'px'
  }
})

class ActivityItem extends React.Component {
  render () {
    const { item, groupList, currentGroupConfig, repositoryList, currentRepositoryConfig, intl, classes } = this.props

    const config = { item, groupList, repositoryList, currentGroupConfig, currentRepositoryConfig, formatter: intl.formatMessage }
    const parsedData = Activity.parser(config)

    return (<Grid item xs={12} className={classes.item}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Grid item>
          <Grid container spacing={2} className='width-auto'>
            <Grid item>
              <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + parsedData.user.icon} className={classes.avatar} />
            </Grid>
            <Grid item>
              <Typography variant='body1' className={classes.action}> {parsedData.user.name} {parsedData.action}</Typography>
              <Typography variant='body2' className={classes.paddingRight2}> {parsedData.detail} </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant='body2'>
            {intl.formatMessage({ id: 'label.editIn' })}:&nbsp;<FormattedTime timestamp={item.time} />
          </Typography>
        </Grid>
      </Grid>
    </Grid>)
  }
}

ActivityItem.propTypes = {
  item: PropTypes.object,
  repositoryList: PropTypes.array.isRequired,
  groupList: PropTypes.array.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList,
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig,
    groupList: state.DataStore.groupList,
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
        connect(mapStateToProps, mapDispatchToProps)(ActivityItem)
      )
    )
  )
)
