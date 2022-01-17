// core
import React from 'react'
import PropTypes from 'prop-types'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const styles = (theme) => ({
  root: {
    padding: '0 ' + theme.spacing(0.5) + 'px',
    lineHeight: 1.5,
    fontSize: theme.spacing(1.5) + 'px',
    fontWeight: 'normal',
    display: 'inline',
    borderRadius: theme.spacing(0.5)
  },
  iconPadding: {
    paddingLeft: theme.spacing(1) + 'px'
  },
  icon: {
    width: 0,
    left: '-14px',
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'middle'
  }
})

class InlineMarker extends React.Component {
  render () {
    const { classes, theme, icon, text, color, background } = this.props
    const extraColor = {
      containedInfo: {
        main: theme.palette.primary.contrastText,
        lighter: theme.palette.secondary.main
      }
    }

    const bg = background === undefined ? true : background
    const palette = color
      ? (theme.palette[color] ? theme.palette : extraColor)[color]
      : theme.palette.primary
    return icon
      ? <span className={[classes.root, classes.iconPadding].join(' ')} style={{ backgroundColor: bg ? palette.lighter : '', color: palette.main }}>
        <div className={classes.icon}><FontAwesomeIcon icon={icon} /></div>
        {text}
      </span>
      : <span className={[classes.root, 'text-overflow'].join(' ')} style={{ backgroundColor: bg ? palette.lighter : '', color: palette.main }}>
        {text}
      </span>
  }
}

InlineMarker.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  icon: PropTypes.object,
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  background: PropTypes.bool
}

export default withTheme(
  withStyles(styles)(InlineMarker)
)
