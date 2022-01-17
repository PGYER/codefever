// core component
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles, withTheme } from '@material-ui/core/styles'

// component
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import SmartLink from 'APPSRC/components/unit/SmartLink'
import CommitHashChip from 'APPSRC/components/unit/CommitHashChip'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'
import Constants from 'APPSRC/config/Constants'
import { injectIntl } from 'react-intl'

// helpers

import { getUserInfo } from 'APPSRC/helpers/VaribleHelper'

const styles = theme => ({
  listItem: {
    borderTop: '1px solid ' + theme.palette.border,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  secondaryWrap: {
    padding: theme.spacing(1),
    paddingLeft: 0,
    paddingBottom: 0
  }
})

class CommitItem extends Component {
  render () {
    const {
      intl,
      classes,
      data,
      linkPathBase,
      currentRepositoryConfig,
      showBorder,
      blameMode,
      path
    } = this.props
    const commitInfo = data || {}
    let commitFullInfo = {}
    if (currentRepositoryConfig) {
      const commiterInfo = getUserInfo(currentRepositoryConfig.members, commitInfo.email)
      if (commiterInfo) {
        commitFullInfo = commiterInfo
        commitFullInfo.hash = commitInfo.sha
        commitFullInfo.commitContent = commitInfo.commit
        commitFullInfo.commitTime = commitInfo.time
      }
    }

    return <ListItem key={commitFullInfo.hash} className={showBorder ? classes.listItem : ''}>
      <ListItemText
        primary={
          <React.Fragment>
            <Typography
              component='span'
              variant='body2'
              color='textPrimary'
            >
              <SmartLink to={linkPathBase + '/' + commitFullInfo.hash.substr(0, 8) + (!path ? '' : path)}>
                {commitFullInfo.commitContent ? commitFullInfo.commitContent : ''}
              </SmartLink>
              {blameMode && <SmartLink style={{ display: 'inline-block', float: 'right' }} to={linkPathBase + '/' + commitFullInfo.hash.substr(0, 8)}>
                {commitFullInfo.hash.substr(0, 8)}
              </SmartLink>}
            </Typography>
          </React.Fragment>
        }
        secondary={
          <React.Fragment>
            <Grid container spacing={1} className={classes.secondaryWrap} component='span'>
              <Grid item component='span'>
                <Avatar src={commitFullInfo.icon ? Constants.HOSTS.PGYER_AVATAR_HOST + commitFullInfo.icon : '/static/images/default_avatar.png'} className={classes.avatar} component='span' />
              </Grid>
              <Grid item component='span'>
                <Typography
                  component='span'
                  variant='body2'
                >
                  {commitFullInfo.name ? commitFullInfo.name : ''}
                  { commitFullInfo.temporary && <React.Fragment>
                    &nbsp;
                    <ShowHelper
                      type='icon'
                      doc='/common/multiEmail.md'
                      tooltip={intl.formatMessage({ id: 'message.itsMyEmail' })}
                    />
                  </React.Fragment> }
                </Typography>
              </Grid>
              <Grid item component='span'>
                <Typography
                  component='span'
                  variant='body2'
                >
                  {intl.formatMessage({ id: 'label.editIn' })}:
                  <FormattedTime timestamp={Number(commitFullInfo.commitTime)} />
                </Typography>
              </Grid>
            </Grid>
          </React.Fragment>
        }
      />
      {!blameMode && <CommitHashChip hash={commitFullInfo.hash.substr(0, 8)} />}
    </ListItem>
  }
}

CommitItem.propTypes = {
  data: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  linkPathBase: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  showBorder: PropTypes.bool,
  blameMode: PropTypes.bool,
  path: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(CommitItem)
      )
    )
  )
)
