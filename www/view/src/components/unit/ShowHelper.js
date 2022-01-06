// core
import React from 'react'
import PropTypes from 'prop-types'
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
  render () {
    const { docID, tooltip, title, type, intl } = this.props
    if (type === 'button') {
      return <Button variant='contained' color='primary' onClick={() => { window.getDoc(docID) }}>
        <FontAwesomeIcon icon={plHelp} />&nbsp;&nbsp;
        {title || intl.formatMessage({ id: 'label.learnMore' })}
      </Button>
    } else if (type === 'icon') {
      return <Tooltip title={tooltip || intl.formatMessage({ id: 'label.learnMore' })} placement='top'>
        <Typography variant='body2' component='span'>
          <a style={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => { window.getDoc(docID) }}>
            <FontAwesomeIcon icon={plHelp} />
          </a>
        </Typography>
      </Tooltip>
    } else {
      return <Tooltip title={tooltip || intl.formatMessage({ id: 'label.learnMore' })} placement='top'>
        <Typography variant='body2' component='span'>
          <a style={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => { window.getDoc(docID) }}>
            {title || intl.formatMessage({ id: 'label.learnMore' })}&nbsp;
            <FontAwesomeIcon icon={plHelp} />
          </a>
        </Typography>
      </Tooltip>
    }
  }
}

ShowHelper.propTypes = {
  docID: PropTypes.string,
  title: PropTypes.string,
  tooltip: PropTypes.string,
  type: PropTypes.string,
  intl: PropTypes.object.isRequired
}

export default injectIntl(
  withTheme(
    withStyles(styles)(ShowHelper)
  )
)
