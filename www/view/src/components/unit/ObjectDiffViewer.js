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
import Constants from 'APPSRC/config/Constants'
import CodeDiffViewer from 'APPSRC/components/unit/CodeDiffViewer'

// helpers
import { formatNumber } from 'APPSRC/helpers/VaribleHelper'

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
    display: 'flex',
    alignItems: 'center'
  },
  editorBg: {
    background: '#1e1e1e'
  },
  detail: {
    overflow: 'hidden',
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
    border: '1px solid ' + theme.palette.error.main,
    padding: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '80%'
  },
  newImage: {
    display: 'block',
    marginTop: theme.spacing(5),
    border: '1px solid ' + theme.palette.success.dark,
    marginLeft: 'auto',
    padding: theme.spacing(2),
    marginRight: 'auto',
    maxWidth: '80%'
  },
  imagelegend: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: theme.spacing(8)
  },
  opacity1: {
    color: theme.palette.text.lighter,
    cursor: 'not-allowed'
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
    minHeight: theme.spacing(16)
  },
  markdown: {
    boxSizing: 'border-box',
    minWidth: '200px',
    maxWidth: '980px',
    margin: '0 auto',
    padding: '45px'
  }
})

class ObjectDiffViewer extends React.Component {
  getDisplayMode (fileDiff) {
    if ((fileDiff.original.object && fileDiff.original.object.oversize) ||
      (fileDiff.modified.object && fileDiff.modified.object.oversize)
    ) {
      return Constants.obejctDiffDisplayType.oversize
    } else if (fileDiff.original.name &&
      fileDiff.modified.name &&
      fileDiff.original.name !== fileDiff.modified.name
    ) {
      return Constants.obejctDiffDisplayType.infoChange
    } else if (
      fileDiff.original.mode &&
      fileDiff.modified.mode &&
      fileDiff.original.mode !== fileDiff.modified.mode
    ) {
      return Constants.obejctDiffDisplayType.infoChange
    } else if (fileDiff.type === 'text') {
      return Constants.obejctDiffDisplayType.textChange
    } else if (fileDiff.type === 'binary' &&
      (
        (fileDiff.original.object && fileDiff.original.object.mime.match(/^image/)) ||
        (fileDiff.modified.object && fileDiff.modified.object.mime.match(/^image/))
      )
    ) {
      return Constants.obejctDiffDisplayType.imageChange
    } else if (fileDiff.type === 'oversize') {
      return Constants.obejctDiffDisplayType.oversize
    } else {
      return Constants.obejctDiffDisplayType.unknown
    }
  }

  render () {
    const { classes, intl, fileDiffInfo, repository, renderSideBySide, layoutUpdateTimeStamp, showFullFile } = this.props

    const displayMode = this.getDisplayMode(fileDiffInfo)

    return (<Grid container>
      <Grid item xs={12} className={classes.detail}>
        {
          displayMode === Constants.obejctDiffDisplayType.imageChange && <Grid container spacing={0} className={classes.file}>
            <Grid item xs={6}>
              { fileDiffInfo.original.object
                ? <React.Fragment>
                  <img src={'data:' + fileDiffInfo.original.object.mime + ';base64,' + fileDiffInfo.original.object.base64Encoded} className={classes.oldImage} />
                  <Typography variant='body2' component='div' align='center' className={classes.imagelegend}>
                    {formatNumber(fileDiffInfo.original.object.size, 'Bytes')} | W: {fileDiffInfo.original.object.width}px | H: {fileDiffInfo.original.object.height}px
                  </Typography>
                </React.Fragment>
                : <Typography variant='body1' className={classes.unknown}>
                  {intl.formatMessage({ id: 'message.fileContentEmpty' })}
                </Typography> }
            </Grid>
            <Grid item xs={6}>
              { fileDiffInfo.modified.object
                ? <React.Fragment>
                  <img src={'data:' + fileDiffInfo.modified.object.mime + ';base64,' + fileDiffInfo.modified.object.base64Encoded} className={classes.newImage} />
                  <Typography variant='body2' component='div' align='center' className={classes.imagelegend}>
                    {formatNumber(fileDiffInfo.modified.object.size, 'Bytes')} | W: {fileDiffInfo.modified.object.width}px | H: {fileDiffInfo.modified.object.height}px
                  </Typography>
                </React.Fragment>
                : <Typography variant='body1' className={classes.unknown}>
                  {intl.formatMessage({ id: 'message.fileContentEmpty' })}
                </Typography> }
            </Grid>
          </Grid>
        }
        { displayMode === Constants.obejctDiffDisplayType.infoChange && <Typography variant='body2' component='div' align='center'>
          { fileDiffInfo.original.name !== fileDiffInfo.modified.name &&
            <Typography variant='body2' component='div' align='center' className={classes.unknown}>
              File name changed from {fileDiffInfo.original.name} to {fileDiffInfo.modified.name}
            </Typography> }
          { fileDiffInfo.original.mode !== fileDiffInfo.modified.mode &&
            <Typography variant='body2' component='div' align='center' className={classes.unknown}>
              File mode changed from {fileDiffInfo.original.mode} to {fileDiffInfo.modified.mode}
            </Typography> }
        </Typography>
        }
        { displayMode === Constants.obejctDiffDisplayType.textChange && <CodeDiffViewer
          fileDiffInfo={fileDiffInfo}
          repository={repository}
          renderSideBySide={renderSideBySide}
          layoutUpdateTimeStamp={layoutUpdateTimeStamp}
          showFullFile={showFullFile}
        /> }
        { displayMode === Constants.obejctDiffDisplayType.unknown && <Typography variant='body1' component='div' className={classes.unknown}>{intl.formatMessage({ id: 'message.fileTypeNotSupport' })}</Typography>}
        { displayMode === Constants.obejctDiffDisplayType.empty && <Typography variant='body1' component='div' className={classes.unknown}>{intl.formatMessage({ id: 'message.fileContentEmpty' })}</Typography>}
        { displayMode === Constants.obejctDiffDisplayType.oversize && <Typography variant='body1' component='div' className={classes.unknown}>{intl.formatMessage({ id: 'message.fileContentOversize' })}</Typography>}
      </Grid>
    </Grid>
    )
  }
}

ObjectDiffViewer.propTypes = {
  fileDiffInfo: PropTypes.object.isRequired,
  repository: PropTypes.string.isRequired,
  layoutUpdateTimeStamp: PropTypes.number,
  renderSideBySide: PropTypes.bool,
  showFullFile: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    expandStatus: state.DrawerStates.expandStatus
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(ObjectDiffViewer)
    )
  )
)
