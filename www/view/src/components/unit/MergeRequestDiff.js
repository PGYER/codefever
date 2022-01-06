// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import FileDiffExpansionPanel from 'APPSRC/components/unit/FileDiffExpansionPanel'
import FileBrowser from 'APPSRC/components/unit/FileBrowser'

// style
const styles = theme => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  copyHash: {
    minWidth: theme.spacing(1),
    height: theme.spacing(4),
    width: theme.spacing(4),
    padding: theme.spacing(0),
    marginBottom: theme.spacing(0.5)
  },
  commitLog: {
    paddingRight: 0
  },
  changedFileList: {
    width: '100%',
    backgroundColor: theme.palette.background.paper
  },
  commitAvatar: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  },
  commiterName: {
    paddingTop: theme.spacing(0.5)
  },
  add: {
    color: theme.palette.success.main,
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(2)
  },
  delete: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  changedFile: {
    color: theme.palette.primary.main,
    paddingBottom: theme.spacing(1),
    backgroundColor: 'transparent',
    fontSize: '1.25rem',
    '&:hover': {
      backgroundColor: 'transparent',
      boxShadow: 'none'
    }
  },
  typography: {
    padding: theme.spacing(2)
  },
  paper: {
    minWidth: theme.spacing(38),
    width: '100%'
  },
  expansionMargin0: {
    margin: 0
  },
  content: {
    zIndex: theme.spacing(1),
    backgroundColor: theme.palette.background.light
  },
  stickyPosition: {
    position: 'sticky',
    top: theme.spacing(8),
    zIndex: theme.spacing(1),
    backgroundColor: theme.palette.background.light
  },
  diffInfoSticky: {
    top: '105px',
    position: 'sticky',
    marginTop: '-24px',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    height: theme.spacing(10) + 1 + 'px',
    zIndex: theme.spacing(1),
    backgroundColor: theme.palette.background.light
  },
  and: {
    lineHeight: theme.spacing(4) + 'px'
  },
  fileTreeHide: {
    display: 'none'
  },
  fileTreeSticky: {
    position: 'sticky',
    top: '174px',
    maxHeight: (window.innerHeight - 174) + 'px'
  },
  fileDiffPanel: {
    marginBottom: theme.spacing(3),
    '& > div > div:first-child': {
      top: '186px'
    }
  }
})

class MergeRequestDiff extends React.Component {
  constructor (props) {
    super(props)
    const { latestVersion, baseVersion } = this.props
    this.state = {
      diffViwerLayoutUpdateTimestamp: 0,
      renderSideBySide: true,
      fileTreeIsOpen: false,
      fileTreeGridNumber: 3,
      startHash: latestVersion,
      endHash: baseVersion
    }
  }

  toggleDiffShow () {
    this.setState({
      renderSideBySide: !this.state.renderSideBySide,
      diffViwerLayoutUpdateTimestamp: new Date().getTime()
    })
  }

  componentDidMount () {
    const { latestVersion, baseVersion } = this.props
    this.setState({
      startHash: latestVersion,
      endHash: baseVersion
    })
  }

  toggleFileTree () {
    this.setState({
      fileTreeIsOpen: !this.state.fileTreeIsOpen,
      renderSideBySide: this.state.fileTreeIsOpen,
      diffViwerLayoutUpdateTimestamp: new Date().getTime()
    })
  }

  jumpToAnchor (hash) {
    window.location.href = window.location.href.split('#')[0] + '#' + hash
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.startHash !== nextState.startHash) {
      this.props.getVersionDiff(nextProps.sourceRepository, nextProps.targetRepository, nextState.startHash, this.state.endHash, nextProps)
      return false
    }

    if (this.state.endHash !== nextState.endHash) {
      this.props.getVersionDiff(nextProps.sourceRepository, nextProps.targetRepository, this.state.startHash, nextState.endHash, nextProps)
      return false
    }

    return true
  }

  changeHash (e, position) {
    const val = e.target.value
    if (position === 'start') {
      this.setState({
        startHash: val
      })
    } else {
      this.setState({
        endHash: val
      })
    }
  }

  render () {
    const {
      classes,
      intl,
      changedFilesInfo,
      fileDiff,
      pending,
      effectFileCount,
      addLine,
      deleteLine,
      showVersionCompare,
      versionList,
      baseVersionList,
      baseVersion,
      sourceRepository,
      latestVersion
    } = this.props
    const {
      renderSideBySide,
      fileTreeIsOpen,
      fileTreeGridNumber,
      diffViwerLayoutUpdateTimestamp,
      startHash,
      endHash
    } = this.state
    return (<React.Fragment>
      <Grid container justifyContent={showVersionCompare ? 'space-between' : 'flex-end'} alignItems='center' className={classes.diffInfoSticky}>
        {showVersionCompare && <Grid item>
          <Grid container spacing={2}>
            <Grid item>
              <FormControl className={classes.margin}>
                <Select
                  variant='outlined'
                  value={startHash || latestVersion}
                  onChange={(e) => this.changeHash(e, 'start')}
                >
                  { versionList && versionList.map((item, index) => {
                    return (<MenuItem key={index} value={item.sha}>
                      <Typography
                        variant='body2'
                        component='span'
                      >
                        {index === 0
                          ? intl.formatMessage({ id: 'label.lastModified' })
                          : intl.formatMessage(
                            { id: 'label.lastModified_N' },
                            { n: versionList.length - index }
                          )
                        }
                      </Typography>
                      <Typography
                        variant='body2'
                        component='span'
                      >
                        {'-' + item.sha.substr(0, 8)}
                      </Typography>
                    </MenuItem>)
                  })
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item className={classes.and}>{intl.formatMessage({ id: 'label.and' })}</Grid>
            <Grid item>
              <FormControl className={classes.margin}>
                <Select
                  variant='outlined'
                  value={endHash || baseVersion}
                  onChange={(e) => this.changeHash(e, 'end')}
                >
                  { baseVersionList && baseVersionList.map((item, index) => {
                    return (<MenuItem key={index} value={item.sha}>
                      <Typography
                        variant='body2'
                        component='span'
                      >
                        {index === 0
                          ? 'Base Line'
                          : intl.formatMessage(
                            { id: 'label.lastModified_N' },
                            { n: baseVersionList.length - index }
                          )
                        }
                      </Typography>
                      <Typography
                        variant='body2'
                        component='span'
                      >
                        {'-' + item.sha.substr(0, 8)}
                      </Typography>
                    </MenuItem>)
                  })
                  }
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        }
        <Grid item className={classes.content}>
          <Typography
            variant='body1'
            component='span'
          >
            {intl.formatMessage({ id: 'label.allFiles' })} : &nbsp;
            { !pending
              ? effectFileCount
              : <CircularProgress size='12px' color='inherit' />
            }
          </Typography>
          <Typography
            variant='body1'
            component='span'
            className={classes.add}
          >
            { !pending
              ? '+' + addLine
              : <CircularProgress size='12px' color='inherit' />
            }
          </Typography>
          <Typography
            variant='body1'
            component='span'
            className={classes.delete}
          >
            { !pending
              ? deleteLine
              : <CircularProgress size='12px' color='inherit' />
            }
          </Typography>
          <ButtonGroup variant='outlined' color='primary' size='small'>
            <Button
              onClick={e => this.toggleDiffShow(e)}
            >
              {renderSideBySide ? 'inline' : 'side-by-side'}
            </Button>
            <Button
              onClick={e => this.toggleFileTree(e)}
            >
              {fileTreeIsOpen ? intl.formatMessage({ id: 'label.closeFileTree' }) : intl.formatMessage({ id: 'label.openFileTree' })}
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={fileTreeIsOpen ? fileTreeGridNumber : 12} className={fileTreeIsOpen ? classes.fileTreeSticky : classes.fileTreeHide}>
          <FileBrowser changeFiles={changedFilesInfo} treeView={Boolean(false)} fileClick={(e) => this.jumpToAnchor(e)} />
        </Grid>
        <Grid item xs={fileTreeIsOpen ? 12 - fileTreeGridNumber : 12}>
          <Grid container>
            {!pending && fileDiff
              ? fileDiff.map((item, index) => <Grid key={index} item xs={12} id={item.modified.sha} className={classes.fileDiffPanel}>
                <FileDiffExpansionPanel
                  key={index}
                  modifiedRepositoryKey={sourceRepository}
                  fileDiffInfo={item}
                  renderSideBySide={renderSideBySide}
                  layoutUpdateTimeStamp={diffViwerLayoutUpdateTimestamp}
                  fileTreeIsOpen={fileTreeIsOpen}
                /></Grid>
              )
              : <Grid container spacing={2} className={classes.loading}>
                <CircularProgress />
              </Grid>}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
    )
  }
}

MergeRequestDiff.propTypes = {
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  changedFilesInfo: PropTypes.array.isRequired,
  fileDiff: PropTypes.array.isRequired,
  pending: PropTypes.bool.isRequired,
  effectFileCount: PropTypes.number.isRequired,
  addLine: PropTypes.number.isRequired,
  deleteLine: PropTypes.number.isRequired,
  showVersionCompare: PropTypes.bool.isRequired,
  versionList: PropTypes.array,
  latestVersion: PropTypes.string,
  baseVersion: PropTypes.string,
  baseVersionList: PropTypes.array,
  getVersionDiff: PropTypes.func,
  sourceRepository: PropTypes.string,
  targetRepository: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  return {
    // repositoryList: state.DataStore.repositoryList
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
      connect(mapStateToProps, mapDispatchToProps)(MergeRequestDiff)
    )
  )
)
