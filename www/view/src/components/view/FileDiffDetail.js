// core component
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { withStyles, withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import FileDiffExpansionPanel from 'APPSRC/components/unit/FileDiffExpansionPanel'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import FileBrowser from 'APPSRC/components/unit/FileBrowser'
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { injectIntl } from 'react-intl'

const styles = theme => ({
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
  changedFileList: {
    width: '100%',
    maxWidth: theme.spacing(113),
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    minWidth: theme.spacing(38),
    width: '100%'
  },
  expansionMargin0: {
    margin: 0
  },
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  content: {
    zIndex: theme.spacing(1),
    backgroundColor: theme.palette.background.light
  },
  stickyPosition: {
    position: 'sticky',
    top: theme.spacing(8),
    zIndex: theme.spacing(1),
    padding: theme.spacing(2) + 'px 0px',
    backgroundColor: theme.palette.background.light
  },
  fileTreeHide: {
    display: 'none'
  },
  fileTreeSticky: {
    position: 'sticky',
    top: theme.spacing(14.5),
    maxHeight: (window.innerHeight - 116) + 'px'
  },
  diffTitle: {
    lineHeight: theme.spacing(4) + 'px'
  },
  fileDiffPanel: {
    marginBottom: theme.spacing(3)
  }
})

class FileDiffDetail extends Component {
  constructor (props) {
    super(props)
    this.mountedFlag = false
    this.observed = {
      currentRepositoryKey: null
    }
    this.state = {
      changedFilesInfo: [],
      diffViwerLayoutUpdateTimestamp: 0,
      fileTreeIsOpen: false,
      fileTreeGridNumber: 3,
      effectFileCount: 0,
      fileDiff: [],
      renderSideBySide: true,
      addLine: 0,
      deleteLine: 0,
      pending: true,
      large: false
    }
  }

  toggleDiffShow () {
    this.setState({
      renderSideBySide: !this.state.renderSideBySide,
      diffViwerLayoutUpdateTimestamp: new Date().getTime()
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

  componentDidMount () {
    this.mountedFlag = true
    this.observed.currentRepositoryKey = this.props.currentRepositoryKey
    this.setState({ pending: true })
    this.getData(this.props)
  }

  getFileTreeInfo (data) {
    const fileChangedInfo = []
    for (let key = 0; key < data.length; key++) {
      const item = data[key]
      if (item.modified && item.modified.name) {
        fileChangedInfo.push({
          name: item.modified.name,
          add: item.diff.additions,
          delete: Math.abs(item.diff.deletions),
          hash: item.modified.sha
        })
      }
    }
    return fileChangedInfo
  }

  getData (props) {
    if (!props.currentRepositoryKey || !props.childHash || !props.parentHash.length) {
      return false
    }

    RepositoryData.fileChanges({
      repository: props.currentRepositoryKey,
      original: props.parentHash[0],
      modified: props.parentHash.length > 1 ? props.parentHash[1] : props.childHash
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (data.data.large) {
          this.setState({
            effectFileCount: data.data.count,
            large: true,
            pending: false
          })
          return false
        }

        const addtions = data.data.detail.reduce((accumulator, item) => accumulator + item.diff.additions, 0)
        const deletions = data.data.detail.reduce((accumulator, item) => accumulator + item.diff.deletions, 0)

        const changedFilesInfo = this.getFileTreeInfo(data.data.detail)

        this.setState({
          changedFilesInfo: changedFilesInfo,
          effectFileCount: data.data.count,
          fileDiff: data.data.detail,
          addLine: addtions,
          deleteLine: deletions,
          pending: false
        })
      })
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.setState({ pending: true })
      this.getData(nextProps)
      return false
    }
    if (this.props.childHash !== nextProps.childHash) {
      this.setState({ pending: true })
      this.getData(nextProps)
      return false
    }
    if (this.props.parentHash[0] !== nextProps.parentHash[0]) {
      this.setState({ pending: true })
      this.getData(nextProps)
      return false
    }
    return true
  }

  render () {
    const {
      effectFileCount,
      addLine,
      deleteLine,
      fileDiff,
      renderSideBySide,
      pending,
      fileTreeIsOpen,
      fileTreeGridNumber,
      changedFilesInfo,
      diffViwerLayoutUpdateTimestamp,
      large
    } = this.state
    const { classes, intl, childHash, parentHash, currentRepositoryKey } = this.props
    return (<React.Fragment>
      <Grid container justifyContent='space-between' className={classes.stickyPosition}>
        <Grid item xs={6}>
          <Typography variant='body1' className={classes.diffTitle}>
            {intl.formatMessage({ id: 'label.fileModification' })} &nbsp;
            {pending ? '' : '(' + effectFileCount + ')'}
          </Typography>
        </Grid>
        <Grid item xs={6} container justifyContent='flex-end' alignItems='center'>
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
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={fileTreeIsOpen ? fileTreeGridNumber : 12} className={fileTreeIsOpen ? classes.fileTreeSticky : classes.fileTreeHide}>
          <FileBrowser changeFiles={changedFilesInfo} treeView={Boolean(false)} fileClick={(e) => this.jumpToAnchor(e)} />
        </Grid>
        <Grid item xs={fileTreeIsOpen ? 12 - fileTreeGridNumber : 12}>
          {!pending && fileDiff && fileDiff.length > 0 && <Grid container>
            {fileDiff.map((item, index) => <Grid key={index} item xs={12} id={item.modified.sha} className={classes.fileDiffPanel}>
              <FileDiffExpansionPanel
                key={index}
                modifiedRepositoryKey={currentRepositoryKey}
                fileDiffInfo={item}
                renderSideBySide={renderSideBySide}
                hash={childHash}
                parentHash={parentHash}
                layoutUpdateTimeStamp={diffViwerLayoutUpdateTimestamp}
                fileTreeIsOpen={fileTreeIsOpen}
              /></Grid>)}
          </Grid>}
          {!large && (pending || !fileDiff || !fileDiff.length) && <Grid container>
            <EmptyListNotice
              imageName={'branches-empty.png'}
              title={intl.formatMessage({ id: 'message._S_listEmpty' }, { s: intl.formatMessage({ id: 'label.file' }) })}
              pending={pending}
            />
          </Grid>}
          {large && <Grid container className={classes.loading}>
            <Typography variant='body1' component='span'>{intl.formatMessage({ id: 'message.diffFileToMany' })}</Typography>
          </Grid>}
        </Grid>
      </Grid>
    </React.Fragment>
    )
  }
}

FileDiffDetail.propTypes = {
  dispatchEvent: PropTypes.func.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  parentHash: PropTypes.array.isRequired,
  childHash: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey
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
        connect(mapStateToProps, mapDispatchToProps)(FileDiffDetail)
      )
    )
  )
)
