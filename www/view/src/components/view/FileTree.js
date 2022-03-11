// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import CircularProgress from '@material-ui/core/CircularProgress'
import RepositoryDashboard from 'APPSRC/components/unit/RepositoryDashboard'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import RevisionSelector from 'APPSRC/components/unit/RevisionSelector'
import TableList from 'APPSRC/components/unit/TableList'
import ObjectViewer from 'APPSRC/components/unit/ObjectViewer'
import CommitItem from 'APPSRC/components/unit/CommitItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plFile, psFolder, plSearch } from '@pgyer/icons'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import RepositoryEmpty from 'APPSRC/components/unit/RepositoryEmpty'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import { makeLink, getDefaultBranch } from 'APPSRC/helpers/VaribleHelper'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

// style
const styles = theme => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  linkObjectName: {
    color: theme.palette.text.main + ' !important'
  },
  linkCommitMessage: {
    color: theme.palette.text.light + ' !important'
  },
  commit: {
    '& > li': {
      border: '1px solid ' + theme.palette.border,
      borderRadius: theme.spacing(0.5) + 'px'
    }
  }
})

class FileTree extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true,
      pathStack: [],
      search: '',
      objectData: {},
      blameData: null,
      readmeFile: {}
    }
  }

  componentDidMount () {
    this.getPathStack(this.props, this.state)
  }

  shouldComponentUpdate (nextProps, nextState) {
    // watch router change
    if (JSON.stringify(this.props.match.params) !== JSON.stringify(nextProps.match.params)) {
      if (this.props.match.params.type !== nextProps.match.params.type &&
        this.props.match.params.rev === nextProps.match.params.rev &&
        this.props.match.params.path === nextProps.match.params.path) {
        this.getObject(nextProps, nextState)
        return false
      }
      this.getPathStack(nextProps, nextState)
      return false
    }

    // watch repository config
    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.getPathStack(nextProps, nextState)
      return false
    }

    if (JSON.stringify(this.state.pathStack) !== JSON.stringify(nextState.pathStack)) {
      this.getObject(nextProps, nextState)
      return false
    }

    return true
  }

  getPathStack (props, state) {
    if (!props.currentRepositoryKey || !props.currentRepositoryConfig.repository) {
      return true
    }

    if ((!props.match.params.path || props.match.params.path === '/') && state.pathStack.length === 0) {
      this.getObject(props, state)
      return true
    }

    this.setState({ objectData: {}, pending: true })
    RepositoryData.pathStack({
      repository: props.currentRepositoryKey,
      revision: (props.match.params.rev && decodeURIComponent(props.match.params.rev)) || getDefaultBranch(props.currentRepositoryConfig),
      path: props.match.params.path || '/'
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            pending: false,
            pathStack: data.data
          })
        }
      })
    return true
  }

  getObject (props, state) {
    if (!props.currentRepositoryConfig.branches || !props.currentRepositoryConfig.branches.length) {
      this.setState({ blameData: null, objectData: {}, pending: false })
      return true
    }

    if (state.pathStack.length > 0 &&
      state.pathStack[state.pathStack.length - 1].type === 'blob' &&
      props.match.params.type === 'blame'
    ) {
      this.getBlame(props, state)
    }

    const calculatedPath = state.pathStack.reduce((path, item) => (path ? path + '/' : '') + item.name, '')
    this.setState({ blameData: null, objectData: {}, pending: true })
    RepositoryData.object({
      repository: props.currentRepositoryKey,
      parent: (state.pathStack.length && state.pathStack[state.pathStack.length - 1].object) ||
        (props.match.params.rev && decodeURIComponent(props.match.params.rev)) ||
        getDefaultBranch(props.currentRepositoryConfig),
      revision: (props.match.params.rev && decodeURIComponent(props.match.params.rev)) || getDefaultBranch(props.currentRepositoryConfig),
      path: calculatedPath || '/'
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            pending: false,
            search: '',
            objectData: data.data
          })
          this.getReadmeFile(data.data)
        } else {
          this.setState({ pending: false })
        }
      })
  }

  getBlame (props, state) {
    this.setState({ blameData: null })
    const calculatedPath = state.pathStack.reduce((path, item) => (path ? path + '/' : '') + item.name, '')
    RepositoryData.getBlameInfo({
      repository: props.currentRepositoryKey,
      revision: (props.match.params.rev && decodeURIComponent(props.match.params.rev)) || getDefaultBranch(props.currentRepositoryConfig),
      path: calculatedPath || '/'
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.setState({
            search: '',
            blameData: data.data.blame
          })
        }
      })
  }

  getReadmeFile (object) {
    if (object.type !== 'blob') {
      const readmeObject = object.object.filter((item) => item.name.toLowerCase() === 'readme.md')

      if (readmeObject[0]) {
        RepositoryData.object({
          repository: this.props.currentRepositoryKey,
          parent: readmeObject[0].object,
          revision: (this.props.match.params.rev && decodeURIComponent(this.props.match.params.rev)) || getDefaultBranch(this.props.currentRepositoryConfig),
          path: object.path + '/' + readmeObject[0].name
        }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
          .then((data) => {
            if (!data.code) {
              this.setState({ readmeFile: data.data })
            }
          })
      }
    }
    this.setState({ readmeFile: {} })
  }

  makeFileListData (data) {
    const currentPath = this.state.pathStack.reduce((path, item) => (path ? path + '/' : '') + item.name, '')
    const final = data
      .sort((item0, item1) => {
        if (item0.type === item1.type) {
          return 0
        } else if (item0.type === 'blob') {
          return 1
        } else {
          return -1
        }
      })
      .map((item) => {
        return [
          <Typography variant='body1'>
            <FontAwesomeIcon icon={item.type === 'blob' ? plFile : psFolder} /> &nbsp;&nbsp;
            <Link className={this.props.classes.linkObjectName} to={
              makeLink(
                this.props.currentRepositoryConfig.group.name,
                this.props.currentRepositoryConfig.repository.name,
                'files',
                encodeURIComponent(this.props.match.params.rev || getDefaultBranch(this.props.currentRepositoryConfig)),
                currentPath ? currentPath + '/' + item.name : item.name
              )}>{item.name}</Link>
          </Typography>,
          item.commit && item.commit.sha && <Link className={this.props.classes.linkCommitMessage} to={
            makeLink(
              this.props.currentRepositoryConfig.group.name,
              this.props.currentRepositoryConfig.repository.name,
              'commit',
              item.commit.sha.slice(0, 8)
            )}>{item.commit.commit}</Link>,
          <FormattedTime timestamp={item.commit.time} />
        ]
      })

    return [
      ['30%', 'auto', 'auto'],
      ['label.name', 'label.lastCommit', 'label.lastUpdate'],
      ...final
    ]
  }

  composePathBreadCrumb () {
    const basePathStack = [
      this.props.currentRepositoryConfig.group.name,
      this.props.currentRepositoryConfig.repository.name,
      'files',
      encodeURIComponent(this.props.match.params.rev || getDefaultBranch(this.props.currentRepositoryConfig))
    ]

    const components = [<Typography key='p' variant='body2' component='div'>
      <Link to={makeLink(...basePathStack)} className={this.props.classes.linkCommitMessage}>
        {this.props.currentRepositoryConfig.repository.name}
      </Link>
    </Typography>]
    for (let index = 0; index < this.state.pathStack.length; index++) {
      basePathStack.push(this.state.pathStack[index].name)
      components.push(<Typography key={'p' + index} variant='body2' component='div'>
        &nbsp;&nbsp;/&nbsp;&nbsp;
        <Link to={makeLink(...basePathStack)} className={
          (index === this.state.pathStack.length - 1) ? this.props.classes.linkObjectName : this.props.classes.linkCommitMessage
        }>
          {this.state.pathStack[index].name}
        </Link>
      </Typography>)
    }

    return components
  }

  render () {
    const { currentRepositoryError, currentRepositoryConfig, history, match, intl, classes } = this.props
    if (currentRepositoryError) {
      return <Grid container spacing={2}>
        <Grid item xs={12}>
          <EmptyListNotice
            imageName={'commits-empty.png'}
            notice={intl.formatMessage({ id: 'message.noRepositoryFind' })}
          />
        </Grid>
      </Grid>
    }

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <RepositoryDashboard repositoryConfig={currentRepositoryConfig} />
      </Grid>

      {getDefaultBranch(currentRepositoryConfig) && <Grid item xs={12}>
        <Grid container justifyContent='space-between'>
          <Grid item>
            <Grid container spacing={2} alignItems='center' className='width-auto'>
              <Grid item>
                <RevisionSelector
                  currentRevision={(this.props.match.params.rev && decodeURIComponent(this.props.match.params.rev)) || getDefaultBranch(currentRepositoryConfig)}
                  revisionList={{ branches: currentRepositoryConfig.branches, tags: currentRepositoryConfig.tags }}
                  onChange={(revision) => history.push(makeLink(
                    currentRepositoryConfig.group.name,
                    currentRepositoryConfig.repository.name,
                    'files',
                    encodeURIComponent(revision)
                  ))}
                />
              </Grid>
              <Grid item><Grid container>{ this.composePathBreadCrumb() }</Grid></Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              variant='outlined'
              value={this.state.search}
              onChange={(e) => this.setState({ search: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={plSearch} /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
      </Grid>}

      {!this.state.pending && getDefaultBranch(currentRepositoryConfig) && this.state.objectData.commit && <Grid item xs={12} className={classes.commit}>
        <CommitItem
          showBorder={Boolean(false)}
          data={this.state.objectData.commit}
          linkPathBase={makeLink(
            match.params.groupName,
            match.params.repositoryName,
            'commit'
          )}
          currentRepositoryConfig={currentRepositoryConfig}
        />
      </Grid>}

      {!this.state.pending && getDefaultBranch(currentRepositoryConfig) && this.state.objectData.commit && <Grid item xs={12}>
        { this.state.objectData.type === 'blob'
          ? <ObjectViewer object={this.state.objectData} blame={this.state.blameData} />
          : <TableList data={this.makeFileListData(
            this.state.objectData.object.filter(
              FilterGenerator.search(this.state.search, ['name'])
            )
          )} />
        }
      </Grid>}

      {!this.state.pending && getDefaultBranch(currentRepositoryConfig) && this.state.objectData.type !== 'blob' && this.state.readmeFile.object && <Grid item xs={12}>
        <ObjectViewer object={this.state.readmeFile} />
      </Grid>}

      {this.state.pending && <Grid item xs={12}>
        <Grid container className={classes.loading}><CircularProgress /></Grid>
      </Grid>}

      {!this.state.pending && (!this.state.objectData.object || this.state.objectData.object.length === 0) && <RepositoryEmpty />}
    </Grid>
  }
}

FileTree.propTypes = {
  currentRepositoryError: PropTypes.bool.isRequired,
  currentRepositoryKey: PropTypes.string.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
    currentRepositoryError: state.DataStore.currentRepositoryError,
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
      connect(mapStateToProps, mapDispatchToProps)(FileTree)
    )
  )
)
