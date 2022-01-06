// dynamic path settings
import './env'

// core
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

// import assets
import 'APPSRC/assets/styles/App.styl'

// import pollyfile
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill'

// import Components
import BaseRoutes from 'APPSRC/routes/BaseRoutes'
import Reducer from 'APPSRC/reducers/main'

const Store = createStore(Reducer)
const routeBaseName = '/'

// render app with router
ReactDOM.render((
  <Provider store={Store}>
    <BrowserRouter basename={routeBaseName}>
      <BaseRoutes />
    </BrowserRouter>
  </Provider>
), document.getElementById('root'))
