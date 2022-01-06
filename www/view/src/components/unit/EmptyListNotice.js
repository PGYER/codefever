// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Constants from 'APPSRC/config/Constants'

// style
const styles = theme => ({
  container: {
    marginTop: '10vh'
  },
  alignBlock: {
    textAlign: 'center',
    margin: '0 auto',
    display: 'block'
  },
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  img: {
    width: theme.spacing(20)
  },
  text: {
    maxWidth: theme.spacing(60)
  },
  lighter: {
    color: theme.palette.text.lighter
  }
})

class EmptyListNotice extends Component {
  render () {
    const { classes, imageName, title, notice, children, pending } = this.props
    return <Grid container spacing={4} className={classes.container}>
      {pending && <Grid item xs={12}>
        <Grid container className={classes.loading}><CircularProgress /></Grid>
      </Grid>}
      {!pending && <React.Fragment>
        <Grid item xs={12}>
          <img
            className={[classes.img, classes.alignBlock].join(' ')}
            src={
              Constants.HOSTS.STATIC_HOST +
              'static/' +
              Constants.STATIC_VERSION +
              '/images/' +
              imageName
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Typography
            className={[classes.text, classes.alignBlock].join(' ')}
            variant='body2'
          >
            {title}
          </Typography>
          <br />
          <Typography
            className={[classes.text, classes.alignBlock, classes.lighter].join(' ')}
            variant='body2'
          >
            {notice}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.alignBlock}>
            {children}
          </div>
        </Grid>
      </React.Fragment>}
    </Grid>
  }
}

EmptyListNotice.propTypes = {
  classes: PropTypes.object.isRequired,
  imageName: PropTypes.string,
  pending: PropTypes.bool,
  title: PropTypes.string,
  notice: PropTypes.string,
  children: PropTypes.node
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(EmptyListNotice)
      )
    )
  )
)
