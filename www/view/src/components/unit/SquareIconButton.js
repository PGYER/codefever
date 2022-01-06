// core
import React from 'react'
import PropTypes from 'prop-types'

// components
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl } from 'react-intl'

const styles = (theme) => ({
  button: {
    minWidth: theme.spacing(3) + 'px !important',
    padding: '7px 8px !important'
  },
  icon: {
    width: '18px !important',
    height: '18px !important'
  },
  badge: {
    right: 0,
    top: '-5px',
    zIndex: '1',
    fontSize: '12px',
    position: 'absolute',
    borderRadius: '10px',
    background: '#FF3F35',
    height: theme.spacing(2),
    minWidth: theme.spacing(2),
    lineHeight: theme.spacing(2) + 'px',
    color: theme.palette.primary.contrastText,
    border: '2px solid ' + theme.palette.background.light
  }
})

class SquareIconButton extends React.Component {
  render () {
    const { icon, className, label, badge, intl, classes, ...copyProps } = this.props
    const button = (<Button {...copyProps} className={[classes.button, className].join(' ')}>
      <FontAwesomeIcon icon={icon} className={classes.icon} />
      {badge > 0 && <div align='center' className={classes.badge}>{badge > 99 ? '' : badge}</div>}
    </Button>)
    return (label
      ? <Tooltip title={intl.formatMessage({ id: label })} placement='top' disableFocusListener>
        {button}
      </Tooltip>
      : button
    )
  }
}

SquareIconButton.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  badge: PropTypes.number,
  icon: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  label: PropTypes.string
}

export default injectIntl(
  withStyles(styles)(
    SquareIconButton
  )
)
