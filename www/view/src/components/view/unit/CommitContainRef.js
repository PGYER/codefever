// core component
import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles, withTheme } from '@material-ui/core/styles'

// component
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import CircularProgress from '@material-ui/core/CircularProgress'
import { injectIntl } from 'react-intl'
import { plTag, plBranch } from '@pgyer/icons'
// helper
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

const styles = theme => ({
  content: {
    maxHeight: '0px',
    marginTop: theme.spacing(3) + 'px',
    overflow: 'hidden',
    transition: 'max-height .3s',
    border: '1px solid ' + theme.palette.border,
    borderBottom: '0px'
  },
  contentShow: {
    maxHeight: '1000px',
    border: '1px solid ' + theme.palette.border,
    borderRadius: theme.spacing(0.5) + 'px'
  },
  parent: {
    padding: theme.spacing(2) + 'px 0px',
    margin: '0px ' + theme.spacing(2) + 'px',
    borderBottom: '1px solid ' + theme.palette.border
  },
  parentA: {
    display: 'inline-block',
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  borderNone: {
    border: '0px'
  },
  versions: {
    marginBottom: theme.spacing(1)
  },
  button: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
})

class CommitContainRef extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true,
      refList: [],
      refTotal: 0
    }
  }

  componentDidMount () {
    this.mountedFlag = true
    this.getData(this.props)
  }

  componentWillUnmount () {
    this.mountedFlag = false
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.getData(nextProps)
      return false
    }
    if (this.props.currentHash !== nextProps.currentHash) {
      this.getData(nextProps)
      return false
    }
    return true
  }

  getData (props) {
    if (!props.currentHash || !props.currentRepositoryKey) {
      return false
    }
    RepositoryData.refListContainSHA({
      repository: props.currentRepositoryKey,
      hash: props.currentHash
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          const refList = []
          refList.branch = data.data.branch
          refList.tag = data.data.tag
          this.setState({
            pending: false,
            refList: refList,
            refTotal: data.data.branch.length + data.data.tag.length
          })
        }
      })
  }

  render () {
    const {
      show,
      classes,
      parentHash,
      currentGroup,
      currentRepository,
      history,
      intl
    } = this.props
    const { refList, refTotal } = this.state
    return (<Grid container className={[classes.content, show ? classes.contentShow : ''].join(' ')}>
      <Grid item xs={12} className={classes.parent}>
        <Typography variant='body1' component='div'>{intl.formatMessage({ id: 'label.parentNode' })}</Typography>
        <Grid>
          {
            parentHash.length > 0
              ? parentHash.map((item, key) => {
                return (
                  <Link className={classes.parentA} key={key} to={makeLink(currentGroup, currentRepository, 'commit', item ? item.substr(0, 8) : '')}>
                    {item ? item.substr(0, 8) : ''}
                  </Link>
                )
              })
              : ''
          }
        </Grid>
      </Grid>
      <Grid item xs={12} className={[classes.parent, classes.borderNone].join(' ')}>
        <Typography variant='body1' component='div' className={classes.versions}>{intl.formatMessage({ id: 'message.someVersion' })}</Typography>
        {
          refTotal > 0
            ? refList.branch.map((item, key) => {
              const branchFilesLink = makeLink(currentGroup, currentRepository, 'files', encodeURIComponent(item))
              return (
                <Button
                  variant='outlined'
                  color='primary'
                  className={classes.button}
                  onClick={() => history.push(branchFilesLink)}
                  key={key}
                >
                  <FontAwesomeIcon icon={plBranch} />
                  &nbsp;{item}
                </Button>
              )
            })
            : <Button color='primary' size='small' disabled disableElevation>
              <CircularProgress size='1rem' color='inherit' /> &nbsp;&nbsp;
            </Button>
        }
        {
          refTotal > 0
            ? refList.tag.map((item, key) => {
              const tagFilesLink = makeLink(currentGroup, currentRepository, 'files', encodeURIComponent(item))
              return (
                <Button
                  variant='outlined'
                  color='primary'
                  className={classes.button}
                  onClick={() => history.push(tagFilesLink)}
                  key={key}
                >
                  <FontAwesomeIcon icon={plTag} />
                  &nbsp;{item}
                </Button>
              )
            })
            : <Button color='primary' size='small' disabled disableElevation>
              <CircularProgress size='1rem' color='inherit' /> &nbsp;&nbsp;
            </Button>
        }
      </Grid>
    </Grid>
    )
  }
}

CommitContainRef.propTypes = {
  show: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  parentHash: PropTypes.array.isRequired,
  currentGroup: PropTypes.string.isRequired,
  currentRepository: PropTypes.string.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  currentHash: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
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
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(CommitContainRef)
      )
    )
  )
)
