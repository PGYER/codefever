// core
import React from 'react'
import { connect } from 'react-redux'

// components
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import classNames from 'classnames'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { injectIntl } from 'react-intl'
import { Grid } from '@material-ui/core'

const styles = (theme) => ({
  avatarLabel: {
    cursor: 'pointer',
    position: 'relative',
    display: 'inline-block',
    borderRadius: theme.spacing(1) + 'px'
  },
  iconBox: {
    width: '100%',
    position: 'absolute',
    left: '0',
    bottom: '0',
    background: '#2F354D',
    opacity: 0.3
  },
  iconBoxRounded: {
    height: '40%',
    borderBottomLeftRadius: theme.spacing(1) + 'px',
    borderBottomRightRadius: theme.spacing(1) + 'px'
  },
  iconBoxCircle: {
    height: '100%',
    borderRadius: '50%'
  },
  editIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: theme.spacing(2) + 'px',
    color: '#fff'
  },
  uploadInput: {
    display: 'none !important'
  },
  userInfoAvatar: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  },
  circleUserInfoAvatar: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  }
})

class AvatarUploader extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showImgIcon: false
    }
    this.uploadFile = this.uploadFile.bind(this)
    this.instanceID = ''
  }

  componentDidMount () {
    this.instanceID = Math.floor(Math.random() * 1E6)
  }

  uploadFile (e) {
    const { appendData, name, dataProvider } = this.props
    const file = e.target.files[0]
    const data = { ...appendData }
    data[name + '_BINARY'] = file

    dataProvider(data)
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then(this.props.onUpdate)
  }

  render () {
    const { classes, src, variant } = this.props

    return (
      <React.Fragment>
        <label
          htmlFor={'avater-uploader-' + this.instanceID}
          className={classes.avatarLabel}
          onMouseEnter={() => {
            this.setState({
              showImgIcon: true
            })
          }}
          onMouseLeave={() => {
            this.setState({
              showImgIcon: false
            })
          }}
        >
          <Avatar
            variant={variant}
            src={src}
            className={classNames(variant === 'circular' ? classes.circleUserInfoAvatar : classes.userInfoAvatar)}
          />
          {this.state.showImgIcon &&
            <Grid className={[classes.iconBox, variant === 'circular' ? classes.iconBoxCircle : classes.iconBoxRounded].join(' ')}>
              <FontAwesomeIcon icon={faPlus} className={classes.editIcon} />
            </Grid>
          }
        </label>
        <input
          accept='image/*'
          className={classes.uploadInput}
          id={'avater-uploader-' + this.instanceID}
          type='file'
          onChange={this.uploadFile}
        />
      </React.Fragment>
    )
  }
}

AvatarUploader.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  src: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  dataProvider: PropTypes.func.isRequired,
  appendData: PropTypes.object.isRequired,
  variant: PropTypes.string.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(AvatarUploader)
  )
)
