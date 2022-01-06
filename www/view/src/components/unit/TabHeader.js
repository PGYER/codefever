// core
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { injectIntl } from 'react-intl'

// style
const styles = theme => ({
  background: {
    backgroundColor: theme.palette.background.light
  }
})

class TabHeader extends React.Component {
  render () {
    const { tabs, onChange, currentTab, children, classes } = this.props

    return (<Grid container className={classes.background} justifyContent='space-between'>
      <Grid item>
        <Tabs
          value={currentTab || 0}
          indicatorColor='primary'
          textColor='primary'
          onChange={onChange}
        >
          { tabs.map((label, key) => <Tab key={key} value={key} label={label} />) }
        </Tabs>
      </Grid>
      <Grid item>
        {children}
      </Grid>
    </Grid>)
  }
}

TabHeader.propTypes = {
  children: PropTypes.node,
  currentTab: PropTypes.number,
  tabs: PropTypes.array.isRequired,
  onChange: PropTypes.func,
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
        connect(mapStateToProps, mapDispatchToProps)(TabHeader)
      )
    )
  )
)
