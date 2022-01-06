// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

// component
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

// style
const styles = theme => ({
  list: {
    border: '1px solid ' + theme.palette.border,
    borderRadius: theme.spacing(0.5) + 'px '
  },
  title: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    background: theme.palette.background.main,
    borderRadius: theme.spacing(0.5) + 'px ' + theme.spacing(0.5) + 'px 0px 0px',
    '& > div': {
      lineHeight: theme.spacing(5) + 'px'
    }
  },
  list2: {
    '& div:nth-child(1), & li:nth-child(1)': {
      border: '0px'
    }
  }
})

class TitleList extends React.Component {
  render () {
    const { title, children, classes } = this.props

    return (<Grid container className={classes.list}>
      { title && <Grid item xs={12} className={classes.title}>
        <Typography variant='body1' component='div'>{title}</Typography>
      </Grid>
      }
      <Grid item xs={12} className={title ? '' : classes.list2}>
        {children}
      </Grid>
    </Grid>
    )
  }
}

TitleList.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default withStyles(styles)(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(TitleList)
  )
)
