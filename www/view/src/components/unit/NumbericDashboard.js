// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// components
import { formatNumber, formatUnit } from 'APPSRC/helpers/VaribleHelper'
import { withStyles, withTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

// style
const styles = theme => ({
  card: {
    minWidth: theme.spacing(22),
    height: theme.spacing(14)
  },
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  icon: {
    textAlign: 'right',
    marginTop: theme.spacing(1)
  },
  clickable: {
    cursor: 'pointer'
  }
})

class NumbericDashboard extends Component {
  render () {
    const { classes, paletteName, theme, title, icon, label, unit, numbericValue, to, intl, history } = this.props
    let palette = (paletteName && theme.palette[paletteName]) ? theme.palette[paletteName] : {}
    let displayValue = numbericValue
    let displayUnit = unit

    if (paletteName === 'fromValue') {
      if (typeof numbericValue === 'number') {
        if (numbericValue >= 85) {
          // Excellent
          palette = theme.palette.error
        } else if (numbericValue >= 70) {
          // Good
          palette = theme.palette.warning
        } else {
          // Fair
          palette = theme.palette.success
        }
      } else {
        if (numbericValue === 'Running') {
          palette = theme.palette.success
        } else {
          palette = theme.palette.error
        }
      }
    }

    if (displayValue) {
      displayValue = ((numbericValue === parseFloat(numbericValue)) ? formatNumber(numbericValue) : numbericValue) || 'NaN'
    }

    if (displayUnit) {
      [displayValue, displayUnit] = formatUnit(displayValue, displayUnit)
    }

    return (
      <Card
        className={[classes.card, to && classes.clickable].join(' ')}
        style={{ backgroundColor: palette && palette.main }}
        onClick={() => { to && history.push(to) }}
      >
        <CardContent className={classes.content} style={{ paddingBottom: theme.spacing(2) }} component='div'>
          <Grid container spacing={0}>
            <Grid item xs={8}>
              <Typography className={classes.title} variant='subtitle1' component='h1' style={{ color: palette && palette.contrastText, fontSize: 16 }}>
                { title || (label ? intl.formatMessage({ id: label }) : '-') }
              </Typography>
              <Typography variant='h5' component='h1' style={{ color: palette && palette.contrastText, fontSize: 24 }}>
                {(numbericValue || numbericValue === 0)
                  ? <React.Fragment>
                    {displayValue} { displayUnit || '' }
                  </React.Fragment>
                  : <CircularProgress size={24} style={{ color: palette && palette.light }} />}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.icon} variant='h4' component='div'>
                <FontAwesomeIcon icon={icon} style={{ color: palette && palette.dark, fontSize: 32 }} />
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }
}

NumbericDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  paletteName: PropTypes.string,
  to: PropTypes.string,
  label: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.object,
  unit: PropTypes.string,
  numbericValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  intl: PropTypes.object.isRequired
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
        connect(mapStateToProps, mapDispatchToProps)(NumbericDashboard)
      )
    )
  )
)
