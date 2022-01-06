// vendor package
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { Switch, Route, withRouter } from 'react-router-dom'

// component
import Drawer from '@material-ui/core/Drawer'
import DrawerList from 'APPSRC/components/DrawerList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plMenuCollapse } from '@pgyer/icons'

import DrawerConfig from 'APPSRC/config/DrawerConfig.js'

// style
const styles = theme => ({
  drawerContainer: {
    position: 'relative'
  },
  container: {
    height: '100vh',
    transition: theme.transitions.create('width')
  },
  containerExpanded: {
    width: theme.spacing(40)
  },
  containerCollapsed: {
    width: theme.spacing(11)
  },
  drawerPaper: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%'
  },
  drawerExpandControl: {
    position: 'absolute',
    top: '19px',
    right: '-12px',
    fontSize: '14px',
    color: '#64728C',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: '50%',
    width: theme.spacing(3),
    height: theme.spacing(3),
    zIndex: theme.zIndex.drawer + 1,
    lineHeight: theme.spacing(3) + 'px',
    background: theme.palette.background.light,
    border: '1px solid ' + theme.palette.border
  },
  transform: {
    transform: 'rotate(180deg)'
  },
  toolbar: theme.mixins.toolbar
})

class Side extends React.Component {
  render () {
    const { classes, expandStatus, toggleDrawer, currentGroupConfig, currentRepositoryConfig } = this.props

    return <div className={classes.drawerContainer}>
      <div className={classes.drawerExpandControl} onClick={toggleDrawer}>
        <FontAwesomeIcon icon={plMenuCollapse} className={expandStatus ? '' : classes.transform} />
      </div>
      <Drawer
        open
        variant='permanent'
        classes={{ paper: classes.drawerPaper }}
        className={[classes.container, expandStatus ? classes.containerExpanded : classes.containerCollapsed].join(' ')}
      >
        <Switch>
          <Route path='/(settings|mergerequests)'>
            <DrawerList drawerConfig={DrawerConfig.makeDrawerConfig()} mode='default' />
          </Route>
          <Route path='/admin'>
            <DrawerList drawerConfig={DrawerConfig.makeAdminDrawerConfig()} mode='admin' />
          </Route>
          <Route path='/(repositories|groups)/(new|fork|forklist)'>
            <DrawerList drawerConfig={DrawerConfig.makeDrawerConfig()} mode='default' />
          </Route>
          <Route path='/groups/:groupName([A-Za-z0-9_]{5,})'>
            <DrawerList drawerConfig={DrawerConfig.makeGroupDrawerConfig(currentGroupConfig)} mode='group' />
          </Route>
          <Route path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)'>
            <DrawerList drawerConfig={DrawerConfig.makeRepositoryDrawerConfig(currentRepositoryConfig)} mode='repository' />
          </Route>
          <Route>
            <DrawerList drawerConfig={DrawerConfig.makeDrawerConfig()} mode='default' />
          </Route>
        </Switch>
      </Drawer>
    </div>
  }
}

Side.propTypes = {
  expandStatus: PropTypes.bool.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    expandStatus: state.DrawerStates.expandStatus,
    currentGroupConfig: state.DataStore.currentGroupConfig,
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleDrawer: () => {
      dispatch({ type: 'drawer.expandStatus.toggle' })
    }
  }
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(
    withRouter(Side)
  )
)
