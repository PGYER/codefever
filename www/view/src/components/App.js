// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles'

// components
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import localeCN from 'date-fns/locale/zh-CN'
import localTheme from 'APPSRC/config/colors/theme1'

import Main from 'APPSRC/components/Main'
import Header from 'APPSRC/components/Header'
import Drawer from 'APPSRC/components/Drawer'
import Comformation from 'APPSRC/components/Comformation'
import Notification from 'APPSRC/components/Notification'
import NotificationBars from 'APPSRC/components/NotificationBars'

// helpers
import { localeSelector } from 'APPSRC/helpers/LocaleSelector'

class App extends React.Component {
  render () {
    const { currentLanguage } = this.props
    const originTheme = createTheme({})
    const theme = createTheme(localTheme(originTheme))

    return <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={localeCN}>
        <IntlProvider locale={currentLanguage} messages={localeSelector(currentLanguage)}>
          <div className='app-root'>
            <Drawer />
            <div className='app-content' ref={this.appContent}>
              <Header />
              <Main />
              <Notification />
              <NotificationBars />
              <Comformation />
            </div>
          </div>
        </IntlProvider>
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  }
}

App.propTypes = {
  currentLanguage: PropTypes.string.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentLanguage: state.DataStore.currentLanguage
  }
}

export default connect(mapStateToProps)(App)
