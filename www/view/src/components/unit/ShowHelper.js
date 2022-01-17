// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles, withTheme } from '@material-ui/core/styles'

// components
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plHelp } from '@pgyer/icons'
import { Typography } from '@material-ui/core'

const styles = (theme) => ({
  progress: {
    color: theme.palette.info.main
  }
})

class ShowHelper extends React.Component {
  showDoc () {
    const { doc, currentLanguage } = this.props

    let language = 'cn'
    if (currentLanguage === 'en-us') {
      language = 'en'
    }

    window.open('/doc/' + language + doc, '_blank')
  }

  render () {
    const { tooltip, title, type, intl } = this.props
    if (type === 'button') {
      return <Button variant='contained' color='primary' onClick={() => this.showDoc() }>
        <FontAwesomeIcon icon={plHelp} />&nbsp;&nbsp;
        {title || intl.formatMessage({ id: 'label.learnMore' })}
      </Button>
    } else if (type === 'icon') {
      return <Tooltip title={tooltip || intl.formatMessage({ id: 'label.learnMore' })} placement='top'>
        <Typography variant='body2' component='span'>
          <a style={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => this.showDoc() }>
            <FontAwesomeIcon icon={plHelp} />
          </a>
        </Typography>
      </Tooltip>
    } else {
      return <Tooltip title={tooltip || intl.formatMessage({ id: 'label.learnMore' })} placement='top'>
        <Typography variant='body2' component='span'>
          <a style={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => this.showDoc() }>
            {title || intl.formatMessage({ id: 'label.learnMore' })}&nbsp;
            <FontAwesomeIcon icon={plHelp} />
          </a>
        </Typography>
      </Tooltip>
    }
  }
}

ShowHelper.propTypes = {
  doc: PropTypes.string.isRequired,
  title: PropTypes.string,
  tooltip: PropTypes.string,
  type: PropTypes.string,
  intl: PropTypes.object.isRequired,
  currentLanguage: PropTypes.string.isRequired
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
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(
        ShowHelper
      )
    )
  )
)
