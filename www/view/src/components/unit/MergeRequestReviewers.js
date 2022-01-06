// core component
import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

// component
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { psConfirm, psClock } from '@pgyer/icons'
import Constants from 'APPSRC/config/Constants'

// helper
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

const styles = theme => ({
  reviewer: {
    position: 'relative'
  },
  reviewerIcon: {
    marginLeft: '-8px',
    borderRadius: '50%',
    boxSizing: 'border-box',
    width: theme.spacing(4),
    height: theme.spacing(4),
    border: '2px solid ' + theme.palette.background.light + ' !important'
  },
  isReview: {
    right: 0,
    bottom: 0,
    zIndex: '1',
    fontSize: '12px',
    borderRadius: '50%',
    position: 'absolute',
    color: theme.palette.text.light,
    background: theme.palette.background.light,
    border: '2px solid ' + theme.palette.background.light
  },
  reviewed: {
    color: theme.palette.success.main
  }
})

class MergeRequestReviewers extends React.Component {
  render () {
    const { repositoryInfo, reviewers, classes } = this.props

    return (<Grid container justifyContent='flex-end'>
      {reviewers.length > 0 && reviewers.map((item, index) => {
        const reviewer = repositoryInfo.members.filter(FilterGenerator.id(item.user))[0]

        return (<Grid item key={index} className={classes.reviewer}>
          <Avatar
            className={classes.reviewerIcon}
            src={Constants.HOSTS.PGYER_AVATAR_HOST + reviewer.icon}
          />
          <FontAwesomeIcon
            icon={item.isReview ? psConfirm : psClock}
            className={[classes.isReview, item.isReview ? classes.reviewed : ''].join(' ')}
          />
        </Grid>)
      })
      }
    </Grid>)
  }
}

MergeRequestReviewers.propTypes = {
  repositoryInfo: PropTypes.object.isRequired,
  reviewers: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(
  withRouter((MergeRequestReviewers))
)
