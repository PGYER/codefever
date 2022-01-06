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
import Constants from 'APPSRC/config/Constants'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'

// style
const styles = theme => ({
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  },
  userName: {
    lineHeight: theme.spacing(4) + 'px'
  }
})

class Member extends React.Component {
  render () {
    const { currentUserInfo, item, classes, intl } = this.props

    return (<Grid container spacing={2}>
      <Grid item>
        <Avatar src={Constants.HOSTS.PGYER_AVATAR_HOST + item.icon} className={classes.avatar} />
      </Grid>
      <Grid item>
        <Typography variant='body1' component='div' className={classes.userName}>
          {item.name} &nbsp;
          {currentUserInfo.id === item.id && <InlineMarker text={intl.formatMessage({ id: 'label.yourself' })} />}
        </Typography>
      </Grid>
    </Grid>)
  }
}

Member.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  item: PropTypes.object,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
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
        connect(mapStateToProps, mapDispatchToProps)(Member)
      )
    )
  )
)
