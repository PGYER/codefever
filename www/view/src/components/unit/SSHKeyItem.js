// core
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { injectIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plTrash } from '@pgyer/icons'

import Button from '@material-ui/core/Button'

// style
const styles = theme => ({
  line: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5)
  },
  line2: {
    marginBottom: theme.spacing(1)
  },
  center: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    color: theme.palette.text.light
  }
})

class SSHKeyItem extends React.Component {
  render () {
    const { item, onDelete, classes } = this.props

    return (<Grid container justifyContent='space-between'>
      <Grid item>
        <Typography variant='body1' className={classes.line}>
          {item.name} &nbsp;
        </Typography>
        <Typography variant='body2' className={classes.line2}>
          { item.hash.replace(/([a-f0-9]{2})/ig, '$1:').slice(0, -1) }
        </Typography>
      </Grid>
      <Grid item className={classes.center}>
        <Button onClick={(e) => { onDelete && onDelete(item.id) }}>
          <FontAwesomeIcon icon={plTrash} className={classes.icon} />
        </Button>
      </Grid>
    </Grid>)
  }
}

SSHKeyItem.propTypes = {
  item: PropTypes.object,
  onDelete: PropTypes.func,
  classes: PropTypes.object.isRequired
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
        connect(mapStateToProps, mapDispatchToProps)(SSHKeyItem)
      )
    )
  )
)
