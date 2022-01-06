// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plBranch, plTag, plSearch, plTrash } from '@pgyer/icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import SmartLink from 'APPSRC/components/unit/SmartLink'

// helpers
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  ref: {
    display: 'flex',
    alignItems: 'center'
  },
  textMain: {
    '& > a, & > span': {
      color: theme.palette.text.main + ' !important'
    }
  },
  textLight: {
    '& > a, & > span': {
      color: theme.palette.text.light + ' !important'
    }
  },
  pointer: {
    color: theme.palette.text.light,
    height: theme.spacing(4),
    paddingRight: theme.spacing(1),
    cursor: 'pointer'
  },
  icon: {
    color: theme.palette.text.light
  }
})

class RefSelector extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      keyword: ''
    }
  }

  changeRef (refInfo) {
    const { refChange, currentRepositoryConfig, history } = this.props
    if (!refInfo || !currentRepositoryConfig.repository) {
      return false
    }

    if (refInfo === 'new_repo') {
      history.push(makeLink('repositories', 'new'))
    } else if (refInfo === 'delete_repo') {
      history.push(makeLink(currentRepositoryConfig.repository.group.name,
        currentRepositoryConfig.repository.name, 'settings', 'advanced'))
    } else {
      refInfo = this.parseRefs(refInfo)
      refChange(refInfo[0], refInfo[1])
    }
  }

  toRefs (refType, ref) {
    return refType + ':' + ref
  }

  parseRefs (refInfo) {
    return refInfo.split(':')
  }

  createDirLink (path) {
    let pathes = []
    if (path !== '/') {
      pathes = path.split('/')
      path = ''
    }

    return (<Typography variant='body2' component='div'>
      {this.createSmartLink('', '', -1, false)}
      {pathes.map((item, index) => {
        if (!item) {
          return false
        }

        const link = this.createSmartLink(path, item, index, index === pathes.length - 1)
        path = path + item + '/'
        return link
      })}
    </Typography>)
  }

  createSmartLink (prepath, dirname, key, last) {
    const { currentRepositoryConfig, currentRefType, currentRef, isFile, history, classes } = this.props
    if (!currentRepositoryConfig.repository || !currentRef || !currentRefType) {
      return false
    }

    const link = makeLink(
      currentRepositoryConfig.repository.group.name, currentRepositoryConfig.repository.name,
      'files', currentRefType, encodeURIComponent(currentRef), prepath + dirname
    )

    return (<Typography component='span' key={key} className={last ? classes.textMain : classes.textLight}>
      <SmartLink to={link} onClick={() => history.push(link)}>
        {dirname !== '' ? dirname : currentRepositoryConfig.repository.name}
      </SmartLink>
      {!(isFile && last) && <Typography component='span'>&nbsp; / &nbsp;</Typography>}
    </Typography>)
  }

  render () {
    const { currentRef, currentRefType, currentPath, refs, filter, classes, intl } = this.props
    let isCommitRef = true

    return (<Paper>
      { (refs.branches || refs.tags) && <Grid container>
        <Grid item xs={10} className={classes.ref}>
          <TextField
            select
            value={this.toRefs(currentRefType, currentRef)}
            variant='outlined'
            onChange={e => this.changeRef(e.target.value)}
          >
            <MenuItem disabled>{intl.formatMessage({ id: 'label.branch' })}</MenuItem>
            { refs.branches.map((item, index) => {
              if (item.name === currentRef) {
                isCommitRef = false
              }
              return (<MenuItem key={index} value={this.toRefs('branch', item.name)}>
                <FontAwesomeIcon icon={plBranch} className={classes.icon} />&nbsp;&nbsp;{item.name}
              </MenuItem>)
            })
            }
            <Divider />
            <MenuItem disabled>{intl.formatMessage({ id: 'label.tag' })}</MenuItem>
            { refs.tags.map((item, index) => {
              if (item.name === currentRef) {
                isCommitRef = false
              }
              return (<MenuItem key={index} value={this.toRefs('tag', item.name)}>
                <FontAwesomeIcon icon={plTag} className={classes.icon} />&nbsp;&nbsp;{item.name}
              </MenuItem>)
            })
            }
            <Divider />
            { isCommitRef && <MenuItem disabled>{intl.formatMessage({ id: 'label.commit' })}</MenuItem> }
            { isCommitRef && <MenuItem value={this.toRefs(currentRefType, currentRef)}>{currentRef}</MenuItem>}
            { isCommitRef && <Divider /> }
            <MenuItem value='new_repo'>
              <Typography variant='subtitle1' color='primary'>
                <FontAwesomeIcon icon={faPlus} />&nbsp;&nbsp;{intl.formatMessage({ id: 'label.newRepository' })}
              </Typography>
            </MenuItem>
            <MenuItem value='delete_repo'>
              <Typography variant='subtitle1' color='error'>
                <FontAwesomeIcon icon={plTrash} />&nbsp;&nbsp;{intl.formatMessage({ id: 'label.deleteRepository' })}
              </Typography>
            </MenuItem>
          </TextField>&nbsp;&nbsp;
          {currentPath && this.createDirLink(currentPath)}
        </Grid>
        { filter && <Grid item xs={2}>
          <TextField
            fullWidth
            variant='outlined'
            value={this.state.keyword}
            onChange={(e) => this.setState({ keyword: e.target.value })}
            InputProps={{
              startAdornment: <FontAwesomeIcon icon={plSearch} onClick={e => filter(this.state.keyword)} className={classes.pointer} />
            }}
          />
        </Grid>
        }
      </Grid>
      }
      {this.props.children}
    </Paper>
    )
  }
}

RefSelector.propTypes = {
  currentRef: PropTypes.string.isRequired,
  currentRefType: PropTypes.string.isRequired,
  refs: PropTypes.object.isRequired,
  refChange: PropTypes.func.isRequired,
  isFile: PropTypes.bool,
  currentRepositoryConfig: PropTypes.object.isRequired,
  currentPath: PropTypes.string,
  children: PropTypes.object.isRequired,
  filter: PropTypes.func,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
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
      connect(mapStateToProps, mapDispatchToProps)(RefSelector)
    )
  )
)
