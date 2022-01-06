// core
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

class SmartLink extends React.Component {
  render () {
    const { to, children } = this.props
    return <Link {...this.props} key='origin_child' to={to}>{children}</Link>
  }
}

SmartLink.propTypes = {
  to: PropTypes.string,
  children: PropTypes.node.isRequired
}

export default SmartLink
