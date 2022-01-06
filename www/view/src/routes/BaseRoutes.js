import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import App from 'APPSRC/components/App'

class BaseRoutes extends React.Component {
  render () {
    return (
      <Switch>
        <Route exact path='/' component={App} />
        <Route exact path='/userInfo' component={App} />
        <Route exact path='/createApp' component={App} />

        <Route path='/groups/:groupName([A-Za-z0-9_]{5,})' component={App} />
        <Route path='/groups' component={App} />
        <Route path='/repositories' component={App} />
        <Route path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)' component={App} />
        <Route path='/mergerequests' component={App} />
        <Route path='/settings' component={App} />
        <Route path='/admin' component={App} />
      </Switch>
    )
  }
}

export default withRouter(BaseRoutes)
