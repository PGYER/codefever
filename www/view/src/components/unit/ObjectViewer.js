// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import MenuItem from '@material-ui/core/MenuItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plFile, plCodeFile, plCopy } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeViewer from 'APPSRC/components/unit/CodeViewer'
import Constants from 'APPSRC/config/Constants'

// helpers
import { makeLink, formatNumber } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  icon: {
    color: theme.palette.text.lighter
  },
  icon2: {
    color: theme.palette.primary.main
  },
  fileInfo: {
    lineHeight: theme.spacing(5) + 'px',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    background: theme.palette.background.main,
    border: '1px solid ' + theme.palette.border,
    borderRadius: theme.spacing(0.5) + 'px ' + theme.spacing(0.5) + 'px 0 0',
    '& > div': {
      display: 'flex',
      alignItems: 'center'
    }
  },
  blame: {
    justifyContent: 'flex-end',
    '& button': {
      background: theme.palette.background.light,
      borderColor: theme.palette.border
    }
  },
  editorBg: {
    background: theme.palette.background.light
  },
  detail: {
    overflowX: 'hidden',
    border: '1px solid ' + theme.palette.border,
    borderRadius: '0 0 ' + theme.spacing(0.5) + 'px ' + theme.spacing(0.5) + 'px',
    borderTop: '0px'
  },
  mediaFile: {
    display: 'block',
    margin: 'auto',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    maxWidth: '80%'
  },
  oldImage: {
    display: 'block',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    border: '1px solid ' + theme.palette.error.main,
    padding: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '80%'
  },
  newImage: {
    display: 'block',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    border: '1px solid ' + theme.palette.success.dark,
    marginLeft: 'auto',
    padding: theme.spacing(2),
    marginRight: 'auto',
    maxWidth: '80%'
  },
  height0: {
    height: '0px',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
    overflow: 'hidden'
  },
  unknown: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: theme.spacing(32)
  },
  markdown: {
    boxSizing: 'border-box',
    minWidth: '200px',
    maxWidth: '980px',
    margin: '0 auto',
    padding: '45px'
  }
})

class ObjectViewer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mdSourceShow: false,
      copyAnchor: null
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  copySomething (data) {
    this.setState({ copyAnchor: null })
    window.setTimeout(() => {
      const dom = window.document.createElement('textarea')
      dom.innerHTML = data
      window.document.body.appendChild(dom)
      dom.select()
      document.execCommand('copy')
      window.document.body.removeChild(dom)
    }, 0)
  }

  getDisplayMode (object) {
    if (object.object.oversize) {
      return Constants.obejctDisplayType.oversize
    } else if (object.object.size <= 0) {
      return Constants.obejctDisplayType.empty
    } else if (object.object.mime && (object.object.mime.match(/^text/) || object.object.mime === 'application/xml')) {
      if (object.path && object.path.match(/.*\.md$/i)) {
        return Constants.obejctDisplayType.markdown
      }
      return Constants.obejctDisplayType.text
    } else if (object.object.mime && object.object.mime.match(/^image/)) {
      return Constants.obejctDisplayType.image
    } else if (object.object.mime === 'video/mp4') {
      return Constants.obejctDisplayType.video
    }
    return Constants.obejctDisplayType.unknown
  }

  getObjectIcon (mime) {
    return plFile
  }

  render () {
    const { currentRepositoryConfig, object, blame, classes, match, history, intl } = this.props
    const { mdSourceShow } = this.state

    const displayMode = this.getDisplayMode(object)
    return (<Grid container>
      <Grid item xs={12} container className={classes.fileInfo}>
        <Grid item xs={8}>
          <FontAwesomeIcon icon={this.getObjectIcon(object.object.mime)} className={classes.icon} />&nbsp;&nbsp;
          <Typography variant='body1' component='div'>{object.path}</Typography>&nbsp;
          <Typography variant='body2' component='div'> &nbsp;|&nbsp; {formatNumber(object.object.size, 'Bytes')}</Typography>&nbsp;&nbsp;
          <SquareIconButton label='label.copy' icon={plCopy} onClick={e => this.setState({ copyAnchor: e.target })} className={classes.icon2} />
          <Menu
            anchorEl={this.state.copyAnchor}
            transitionDuration={0}
            open={!!this.state.copyAnchor}
            onClose={e => this.setState({ copyAnchor: null })}
          >
            <MenuItem value='0' onClick={e => this.copySomething(object.path)}>{intl.formatMessage({ id: 'label.copyPath' })}</MenuItem>
            { (displayMode === Constants.obejctDisplayType.text || displayMode === Constants.obejctDisplayType.markdown) &&
              <MenuItem value='1' onClick={e => this.copySomething(object.object.raw)}>{intl.formatMessage({ id: 'label.copyCode' })}</MenuItem>
            }
          </Menu>
          { displayMode === Constants.obejctDisplayType.markdown && <React.Fragment>
            { mdSourceShow
              ? <SquareIconButton label='message.displayRendereFile' icon={plFile} onClick={() => this.setState({ mdSourceShow: false })} />
              : <SquareIconButton label='message.displaySource' icon={plCodeFile} onClick={() => this.setState({ mdSourceShow: true })} />
            }
          </React.Fragment>
          }
        </Grid>
        { match.params.path && <Grid item xs={4} className={classes.blame}>
          <ButtonGroup size='small' aria-label='small outlined button group'>
            <Button
              onClick={e => history.push(makeLink(
                currentRepositoryConfig.group.name,
                currentRepositoryConfig.repository.name,
                'commits',
                encodeURIComponent(match.params.rev) + match.params.path
              ))}
            >{intl.formatMessage({ id: 'label.history' })}</Button>
            {(displayMode === Constants.obejctDisplayType.text || displayMode === Constants.obejctDisplayType.markdown) && <Button
              onClick={e => history.push(makeLink(
                currentRepositoryConfig.group.name,
                currentRepositoryConfig.repository.name,
                match.params.type === 'blame' ? 'files' : 'blame',
                encodeURIComponent(match.params.rev) + match.params.path
              ))}
            >{match.params.type === 'blame' ? 'Normal' : 'Blame'}</Button>
            }
          </ButtonGroup>
        </Grid>
        }
      </Grid>
      <Grid item xs={12} className={[classes.detail, (displayMode === Constants.obejctDisplayType.text || mdSourceShow) ? classes.editorBg : ''].join(' ')}>
        { displayMode === Constants.obejctDisplayType.text && <CodeViewer object={object} blame={blame} /> }
        { displayMode === Constants.obejctDisplayType.markdown && <Grid container>
          <Grid item xs={12} className={mdSourceShow ? '' : classes.height0}>
            <CodeViewer object={object} blame={blame} />
          </Grid>
          <Grid item xs={12} className={[mdSourceShow ? classes.height0 : classes.markdown, 'markdown-body'].join(' ')}>
            <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css' />
            <ReactMarkdown children={object.object.raw} remarkPlugins={[remarkGfm]} />
          </Grid>
        </Grid>
        }
        { displayMode === Constants.obejctDisplayType.image && <img src={'data:' + object.object.mime + ';base64,' + object.object.base64Encoded} className={classes.mediaFile} />}
        { displayMode === Constants.obejctDisplayType.video && <div className={classes.mediaFile}>
          <video width='100%' controls>
            <source src={'data:' + object.object.mime + ';base64,' + object.object.base64Encoded} type={object.object.mime} />
          </video>
        </div>
        }
        { displayMode === Constants.obejctDisplayType.unknown && <Typography variant='body1' component='div' className={classes.unknown}>{intl.formatMessage({ id: 'message.fileTypeNotSupport' })}</Typography>}
        { displayMode === Constants.obejctDisplayType.empty && <Typography variant='body1' component='div' className={classes.unknown}>{intl.formatMessage({ id: 'message.fileContentEmpty' })}</Typography>}
        { displayMode === Constants.obejctDisplayType.oversize && <Typography variant='body1' component='div' className={classes.unknown}>{intl.formatMessage({ id: 'message.fileContentOversize' })}</Typography>}
      </Grid>
    </Grid>
    )
  }
}

ObjectViewer.propTypes = {
  currentRepositoryConfig: PropTypes.object.isRequired,
  object: PropTypes.object.isRequired,
  blame: PropTypes.array,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(ObjectViewer)
    )
  )
)
