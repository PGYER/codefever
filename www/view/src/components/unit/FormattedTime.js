// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// components
import Typography from '@material-ui/core/Typography'

// utils
import { format, formatRelative } from 'date-fns'
import localeCN from 'date-fns/locale/zh-CN'
import localeEN from 'date-fns/locale/en-US'

class FormattedTime extends Component {
  render () {
    let { currentLanguage, timestamp, absolute, relative } = this.props
    const localObject = currentLanguage === 'zh-cn' ? localeCN : localeEN

    // 31536000000 = Date('1971/01/01')
    timestamp *= timestamp < 31536E6 ? 1E3 : 1
    const current = (new Date()).getTime()

    if (!absolute && !relative) {
      if (Math.abs(timestamp - current) < 6048E5) {
        // diff less than 7 days
        relative = true
      } else {
        absolute = true
      }
    }

    return (<Typography variant='body2' component='span'>
      { absolute && timestamp > 0 && format(timestamp, 'yyyy-MM-dd HH:mm:ss', { locale: localObject }) }
      { relative && !absolute && timestamp > 0 && formatRelative(timestamp, current, { locale: localObject }) }
    </Typography>)
  }
}

FormattedTime.propTypes = {
  timestamp: PropTypes.number.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  absolute: PropTypes.bool,
  relative: PropTypes.bool
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentLanguage: state.DataStore.currentLanguage
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(FormattedTime)
  )
)
