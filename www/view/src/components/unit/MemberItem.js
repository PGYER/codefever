// core
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import ListSubheader from '@material-ui/core/ListSubheader'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plTrash } from '@pgyer/icons'
import { injectIntl } from 'react-intl'
import Member from 'APPSRC/components/unit/Member'
import UAC from 'APPSRC/config/UAC'
import TableCell from '@material-ui/core/TableCell'

// style
const styles = theme => ({
  padding: {
    paddingRight: theme.spacing(1)
  },
  underline: {
    '&&&:before': {
      borderBottom: 'none'
    },
    '&&:after': {
      borderBottom: 'none'
    }
  },
  backgroundColor: {
    '&&&:focus': {
      backgroundColor: 'none'
    }
  },
  deleteMember: {
    color: theme.palette.error.main
  },
  split: {
    margin: theme.spacing(1) + 'px 0px'
  },
  disabled: {
    '& svg': {
      opacity: 0
    }
  }
})

class MemberItem extends React.Component {
  update (data) {
    if (typeof data === 'number') {
      this.props.onUpdate(data)
    } else {
      this.props.onRemove(data)
    }
  }

  render () {
    let { item, intl, disabled, classes } = this.props
    disabled = disabled || item.creatorFlag || item.deleteFlag

    return (<React.Fragment>
      <TableCell>
        <Member item={item} />
      </TableCell>
      <TableCell>
        {item.email}
      </TableCell>
      <TableCell className={classes.padding} align='right'>
        <TextField
          select
          disabled={disabled}
          className={disabled ? classes.disabled : ''}
          value={item.role}
          onChange={e => e.target.value && this.update(e.target.value)}
          align='right'
          InputProps={{ classes: { underline: classes.underline } }}
        >
          <ListSubheader disableSticky>{intl.formatMessage({ id: 'label.role' })}</ListSubheader>
          <MenuItem key={UAC.Role.GUEST} value={UAC.Role.GUEST}>{intl.formatMessage({ id: 'label.guest' })}</MenuItem>
          <MenuItem key={UAC.Role.REPORTER} value={UAC.Role.REPORTER}>{intl.formatMessage({ id: 'label.reporter' })}</MenuItem>
          <MenuItem key={UAC.Role.DEVELOPER} value={UAC.Role.DEVELOPER}>{intl.formatMessage({ id: 'label.developer' })}</MenuItem>
          <MenuItem key={UAC.Role.MAINTAINER} value={UAC.Role.MAINTAINER}>{intl.formatMessage({ id: 'label.maintianer' })}</MenuItem>
          <MenuItem key={UAC.Role.OWNER} value={UAC.Role.OWNER}>{intl.formatMessage({ id: 'label.owner' })}</MenuItem>
          <Divider className={classes.split} />
          <MenuItem key={item.id} value={item.id} className={classes.deleteMember}>
            <FontAwesomeIcon icon={plTrash} />
            &nbsp;&nbsp;{intl.formatMessage({ id: 'label.removeMember' })}
          </MenuItem>
        </TextField>
      </TableCell>
    </React.Fragment>)
  }
}

MemberItem.propTypes = {
  item: PropTypes.object,
  disabled: PropTypes.bool,
  onUpdate: PropTypes.func,
  onRemove: PropTypes.func,
  intl: PropTypes.object.isRequired,
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
        connect(mapStateToProps, mapDispatchToProps)(MemberItem)
      )
    )
  )
)
