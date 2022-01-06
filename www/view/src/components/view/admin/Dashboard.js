// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import AdminData from 'APPSRC/data_providers/AdminData'
// import Constants from 'APPSRC/config/Constants'
import NumbericDashboard from 'APPSRC/components/unit/NumbericDashboard'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'

// icons
import {
  psRepository,
  psRepositoryGroup,
  psMembers,
  psFolder,
  psNewFeature,
  psMeter
} from '@pgyer/icons'

const styles = (theme) => ({})

class Dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.mountedFlag = false
    this.state = {
      pending: true,
      data: null
    }
  }

  componentDidMount () {
    this.mountedFlag = true
    this.getData()
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state) !== JSON.stringify(this.nextState)) {
      return true
    }
    return false
  }

  getData () {
    this.setState({ pending: true })
    AdminData.systemStatus()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(data => {
        if (data && !data.code && data.data) {
          this.setState({ pending: false, data: data.data })
        }
      })
  }

  render () {
    const { intl } = this.props
    const { pending } = this.state
    return (<Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom> { intl.formatMessage({ id: 'label.statistic' }) } </Typography>
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard label='label.user_pl' paletteName='info' icon={psMembers} numbericValue={pending ? null : this.state.data.usage.user} to='/admin/users' />
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard label='label.group_pl' paletteName='info' icon={psRepositoryGroup} numbericValue={pending ? null : this.state.data.usage.group} to='/admin/groups' />
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard label='label.repository_pl' paletteName='info' icon={psRepository} numbericValue={pending ? null : this.state.data.usage.repository} to='/admin/repositories' />
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom> { intl.formatMessage({ id: 'label.systemResources' }) } </Typography>
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard title='CPU' paletteName='fromValue' icon={psMeter} numbericValue={pending ? null : this.state.data.vm.cpu} unit="%" />
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard title='RAM' paletteName='fromValue' icon={psMeter} numbericValue={pending ? null : this.state.data.vm.memory} unit="%" />
      </Grid>
      {!pending && this.state.data.vm.disk.length > 0 && <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom> { intl.formatMessage({ id: 'label.diskUsgae' }) } </Typography>
      </Grid>}
      {!pending && this.state.data.vm.disk.map(
        (item, key) => <Grid key={key} item sm={6} md={3}>
          <NumbericDashboard title={item.name} paletteName='fromValue' icon={psFolder} numbericValue={item.usage} unit="%" />
        </Grid>)
      }
      <Grid item xs={12}>
        <Typography variant='h6' component='div' gutterBottom> { intl.formatMessage({ id: 'label.serviceStatus' }) } </Typography>
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard title='CodeFever' paletteName='fromValue' icon={psNewFeature} numbericValue={pending ? null : this.state.data.service.codefever ? 'Running' : 'Stopped'} />
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard title='Nginx' paletteName='fromValue' icon={psNewFeature} numbericValue={pending ? null : this.state.data.service.nginx ? 'Running' : 'Stopped'} />
      </Grid>
      <Grid item sm={6} md={3}>
        <NumbericDashboard title='PHP-FPM' paletteName='fromValue' icon={psNewFeature} numbericValue={pending ? null : this.state.data.service.php ? 'Running' : 'Stopped'} />
      </Grid>
    </Grid>)
  }
}

Dashboard.propTypes = {
  dispatchEvent: PropTypes.func.isRequired,
  // classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(Dashboard)
    )
  )
)
