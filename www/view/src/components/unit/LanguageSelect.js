// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'
// assets

// components
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'
import { plLocalization } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'

// style
const styles = theme => ({
  menu: {
    marginTop: theme.spacing(1),
    padding: 0
  }
})

class LanguageSelect extends Component {
  constructor (props) {
    super(props)
    this.state = {
      anchorEl: null,
      userInfoLoadingStatus: false
    }

    this.handleUserMenuClick = this.handleUserMenuClick.bind(this)
    this.handleUserMenuClose = this.handleUserMenuClose.bind(this)
  }

  componentDidMount () {
    this.setState({ userInfoLoadingStatus: true })
  }

  handleUserMenuClick (event) {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleUserMenuClose () {
    this.setState({ anchorEl: null })
  }

  changeLanguage (lang) {
    this.props.dispatchEvent({ type: 'data.currentLanguage.update', data: lang })
    this.setState({ anchorEl: null })
  }

  render () {
    const { anchorEl } = this.state
    const { intl, classes, currentLanguage } = this.props

    return (
      <React.Fragment>
        <SquareIconButton label='label.language' onClick={this.handleUserMenuClick} icon={plLocalization} className={this.props.className} />
        <Menu
          id='language-menu'
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          PaperProps={{ className: classes.menu }}
          getContentAnchorEl={null}
          transitionDuration={0}
          open={Boolean(anchorEl)}
          onClose={this.handleUserMenuClose}
        >
          <MenuItem selected={currentLanguage === 'zh-cn'} onClick={(ev) => this.changeLanguage('zh-cn')}>
            <ListItemText disableTypography primary={intl.formatMessage({ id: 'lang.chinese' })} />
          </MenuItem>
          <MenuItem selected={currentLanguage === 'en-us'} onClick={(ev) => this.changeLanguage('en-us')}>
            <ListItemText disableTypography primary={intl.formatMessage({ id: 'lang.english' })} />
          </MenuItem>
        </Menu>
      </React.Fragment>
    )
  }
}

LanguageSelect.propTypes = {
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  dispatchEvent: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentLanguage: state.DataStore.currentLanguage
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
      connect(mapStateToProps, mapDispatchToProps)(LanguageSelect)
    )
  )
)
