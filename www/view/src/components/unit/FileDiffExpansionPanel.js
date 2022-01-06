import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

// component
import Accordion from '@material-ui/core/Accordion'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import { faImage, faVideo, faCompress } from '@fortawesome/free-solid-svg-icons'
import {
  plFile,
  plCopy,
  plExpand
} from '@pgyer/icons'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'
import ObjectDiffViewer from 'APPSRC/components/unit/ObjectDiffViewer'
import Tooltip from '@material-ui/core/Tooltip'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  add: {
    color: theme.palette.success.main,
    cursor: 'default',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(2)
  },
  delete: {
    color: theme.palette.error.main,
    cursor: 'default',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  viewFileBtn: {
    minWidth: theme.spacing(24)
  },
  viewOldFileBtn: {
    minWidth: theme.spacing(27)
  },
  fileName: {
    cursor: 'default',
    marginTop: theme.spacing(0.5)
  },
  viewFile: {
    marginLeft: theme.spacing(2)
  },
  panelSummary: {
    border: '1px solid ' + theme.palette.border,
    position: 'sticky',
    top: theme.spacing(16),
    zIndex: 7
  },
  panelDetail: {
    zIndex: theme.spacing(1),
    overflow: 'hidden'
  },
  separator: {
    color: theme.palette.border
  },
  icon: {
    color: theme.palette.primary.main
  }
})

class FileDiffExpansionPanel extends Component {
  constructor (props) {
    super(props)
    const { intl } = props
    this.state = {
      panelIsOpen: true,
      showFullFile: false,
      copyPath: 'label.copyPath',
      viewFile: intl.formatMessage({ id: 'label.browserFile' }),
      showFullFileTitle: intl.formatMessage({ id: 'label.expandFullFile' })
    }
    this.fileType = {
      text: 1,
      image: 2,
      video: 3
    }
  }

  viewFileDetail (link) {
    const { history } = this.props
    history.push(link)
  }

  toggleFullFile (e) {
    e.stopPropagation()
    const { intl } = this.props
    this.setState({
      showFullFile: !this.state.showFullFile,
      showFullFileTitle: this.state.showFullFile ? intl.formatMessage({ id: 'label.expandFullFile' }) : intl.formatMessage({ id: 'label.showDiffOnly' })
    })
  }

  copyPath (e, path) {
    e.stopPropagation()
    this.copySomething(path)
    this.setState({ copyPath: 'label.copied' })
  }

  copySomething (data) {
    const dom = window.document.createElement('input')
    dom.setAttribute('value', data)
    dom.setAttribute('type', 'text')
    window.document.body.appendChild(dom)
    dom.select()
    document.execCommand('copy')
    window.document.body.removeChild(dom)
  }

  fileTypeDeal (file) {
    const { unknow, text, image, video } = this.fileType
    if (file.type.indexOf('text') !== -1 ||
      file.type.indexOf('application/xml') !== -1
    ) {
      return text
    } else if (file.type.indexOf('image') !== -1) {
      return image
    } else if (file.type.indexOf('video/mp4') !== -1) {
      return video
    } else {
      return unknow
    }
  }

  fileIconDeal (fileType) {
    const { image, video } = this.fileType
    switch (fileType) {
      case image:
        return faImage
      case video:
        return faVideo
      default:
        return plFile
    }
  }

  togglePanel () {
    this.setState({
      panelIsOpen: !this.state.panelIsOpen
    })
  }

  render () {
    const {
      fileDiffInfo,
      renderSideBySide,
      currentRepositoryKey,
      modifiedRepositoryKey,
      classes,
      intl,
      match,
      layoutUpdateTimeStamp,
      fileTreeIsOpen
    } = this.props
    let { parentHash, hash } = this.props
    const { text, image } = this.fileType
    const { panelIsOpen, copyPath, viewFile, showFullFile, showFullFileTitle } = this.state
    parentHash = parentHash ? parentHash[0].substr(0, 8) : ''
    hash = hash ? hash.substr(0, 8) : ''
    const parentHashFileLink = makeLink(match.params.groupName, match.params.repositoryName, 'files', parentHash, fileDiffInfo.original.name)
    const currentHashFileLink = makeLink(match.params.groupName, match.params.repositoryName, 'files', hash, fileDiffInfo.modified.name)
    const fileType = this.fileTypeDeal(fileDiffInfo)
    return (<Accordion
      expanded={panelIsOpen}
      onChange={e => this.togglePanel(e)}
      square={Boolean(false)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1a-content'
        className={classes.panelSummary}
      >
        <Grid container justifyContent='space-between'>
          <Grid item xs={fileTreeIsOpen ? 8 : 7}>
            <Typography
              onClick={event => event.stopPropagation()}
              onFocus={event => event.stopPropagation()}
              className={classes.fileName}
              component='span'
            >
              <FontAwesomeIcon icon={this.fileIconDeal(fileType)} /> &nbsp;&nbsp;
              {
                fileDiffInfo.original.name === fileDiffInfo.modified.name
                  ? fileDiffInfo.modified.name
                  : fileDiffInfo.original.name + ' -> ' + fileDiffInfo.modified.name
              } &nbsp;&nbsp;
              <Typography
                variant='body2'
                component='span'
              >
                {
                  fileDiffInfo.original.mode === fileDiffInfo.modified.mode
                    ? ''
                    : fileDiffInfo.original.mode + ' -> ' + fileDiffInfo.modified.mode
                } &nbsp;
              </Typography>
            </Typography>
            <SquareIconButton label={copyPath} icon={plCopy} className={classes.icon}
              onClick={(e) => {
                this.copyPath(e, fileDiffInfo.modified.name)
                e.stopPropagation()
              }} onMouseLeave={() => {
                window.setTimeout(() => this.setState({ copyPath: 'label.copyPath' }), 100)
              }}
            />
          </Grid>
          {
            fileType === text && <Grid item>
              <Typography
                variant='body1'
                component='span'
                className={classes.add}
              >
                +{fileDiffInfo.diff.additions}
              </Typography>
              <Typography
                variant='body1'
                component='span'
                className={classes.delete}
              >
                {fileDiffInfo.diff.deletions}
              </Typography>
              <Typography
                variant='body1'
                component='span'
                className={classes.separator}
              >
                |
              </Typography>
              <Tooltip title={showFullFileTitle} disableFocusListener placement='top'>
                <Button onClick={(e) => this.toggleFullFile(e)}>
                  <FontAwesomeIcon icon={showFullFile ? faCompress : plExpand} />
                </Button>
              </Tooltip>
              { currentRepositoryKey === modifiedRepositoryKey && hash &&
                <Tooltip title={viewFile + '@' + hash} disableFocusListener placement='top'>
                  <Button onClick={(e) => this.viewFileDetail(currentHashFileLink)}>
                    <FontAwesomeIcon icon={plFile} />
                  </Button>
                </Tooltip>
              }
            </Grid>
          }
          {
            fileType === image && currentRepositoryKey === modifiedRepositoryKey && parentHash && hash && <Grid item>
              <Tooltip title={viewFile + '@' + parentHash} disableFocusListener placement='top'>
                <Button className={classes.viewOldFileBtn} onClick={(e) => this.viewFileDetail(parentHashFileLink)}>
                  <FontAwesomeIcon icon={plFile} />&nbsp;&nbsp;{intl.formatMessage({ id: 'label.browserUnchangedFIle' })} &nbsp;{'@' + parentHash}
                </Button>
              </Tooltip>
              <Tooltip title={viewFile + '@' + hash} disableFocusListener placement='top'>
                <Button className={classes.viewFileBtn} onClick={(e) => this.viewFileDetail(currentHashFileLink)}>
                  <FontAwesomeIcon icon={plFile} />&nbsp;&nbsp;{intl.formatMessage({ id: 'label.browserFile' })}&nbsp;{'@' + hash}
                </Button>
              </Tooltip>
            </Grid>
          }
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.panelDetail}>
        <ObjectDiffViewer
          fileDiffInfo={fileDiffInfo}
          repository={currentRepositoryKey}
          renderSideBySide={renderSideBySide}
          layoutUpdateTimeStamp={layoutUpdateTimeStamp}
          showFullFile={showFullFile}
        />
      </AccordionDetails>
    </Accordion>)
  }
}

FileDiffExpansionPanel.propTypes = {
  currentRepositoryKey: PropTypes.string.isRequired,
  modifiedRepositoryKey: PropTypes.string.isRequired,
  fileDiffInfo: PropTypes.object.isRequired,
  renderSideBySide: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  hash: PropTypes.string,
  parentHash: PropTypes.array,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  layoutUpdateTimeStamp: PropTypes.number,
  fileTreeIsOpen: PropTypes.bool
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig
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
      connect(mapStateToProps, mapDispatchToProps)(FileDiffExpansionPanel)
    )
  )
)
