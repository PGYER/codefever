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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faFile, faFolder, faFolderOpen } from '@fortawesome/free-solid-svg-icons'

// style
let themeSpacing = 0
const styles = theme => {
  themeSpacing = parseInt(theme.spacing(1))
  return {
    fileBrowserTop: {
      position: 'relative',
      height: '100%'
    },
    fileBrowser: {
      maxHeight: '100%',
      overflow: 'auto',
      overflowX: 'hidden',
      background: theme.palette.background.light
    },
    tree: {
      paddingRight: theme.spacing(1),
      lineHeight: theme.spacing(4.5) + 'px',
      cursor: 'pointer',
      '& > *': { lineHeight: theme.spacing(4.5) + 'px' },
      '&:hover': { background: theme.palette.background.dark }
    },
    listSub: {
      position: 'relative'
    },
    listDir: {
      lineHeight: theme.spacing(5) + 'px',
      paddingLeft: theme.spacing(1),
      background: theme.palette.background.light
    },
    listDir2: {
      position: 'absolute',
      width: '100%',
      left: '0',
      top: '0',
      paddingLeft: theme.spacing(1),
      lineHeight: theme.spacing(5) + 'px',
      boxSizing: 'border-box',
      background: theme.palette.background.light,
      overflowX: 'hidden'
    },
    listFile: {
      lineHeight: theme.spacing(5) + 'px',
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1),
      cursor: 'pointer',
      '& > *': { lineHeight: theme.spacing(5) + 'px' },
      '&:hover': { background: theme.palette.background.dark }
    },
    add: {
      float: 'right',
      color: theme.palette.success.main
    },
    delete: {
      float: 'right',
      color: theme.palette.error.main
    }
  }
}

class FileBrowser extends React.Component {
  constructor (props) {
    super(props)

    this.fileBrowser = {
      changeFilesTmp: null,
      treeFiles: null,
      listFiles: null
    }

    this.state = {
      count: 0
    }

    this.initChangeFiles()
    this.listFilesRef = React.createRef()
  }

  initChangeFiles () {
    const { changeFiles } = this.props
    if (!changeFiles || !changeFiles.length) {
      return false
    }

    changeFiles.map((item, index) => {
      const lastIndex = item.name.lastIndexOf('/')
      item.used = false
      item.dirname = lastIndex !== -1 ? item.name.slice(0, lastIndex) : ''
      item.filename = lastIndex !== -1 ? item.name.slice(lastIndex + 1) : item.name
      return true
    })

    this.initTreeFiles()
    this.initListFiles()
  }

  initTreeFiles () {
    const { changeFiles } = this.props
    if (!changeFiles || !changeFiles.length) {
      return false
    }

    this.fileBrowser.treeFiles = { '/': true, '/open': true }
    this.fileBrowser.changeFilesTmp = [...changeFiles]
    this.fileBrowser.changeFilesTmp.sort((item1, item2) => {
      return (item1.dirname !== item2.dirname && item1.dirname.indexOf(item2.dirname) > -1) ? -1 : 0
    })

    this.fileBrowser.changeFilesTmp.map((item, index) => {
      let tmpDir = this.fileBrowser.treeFiles

      if (item.dirname) {
        const dirs = item.dirname.split('/')
        dirs.map((item, index) => {
          if (!item) {
            return false
          }
          if (tmpDir[item] === undefined) {
            tmpDir[item] = { '/': true, '/open': true }
          }
          tmpDir = tmpDir[item]
          return true
        })
      }

      tmpDir[item.filename] = { '/': false, ...item }
      return true
    })

    return true
  }

  initListFiles () {
    const { changeFiles } = this.props
    if (!changeFiles || !changeFiles.length) {
      return false
    }

    this.fileBrowser.listFiles = []

    changeFiles.map((item, index) => {
      if (item.used) {
        return item
      }
      item.used = true
      const dirTmp = { name: item.dirname, files: [item] }
      changeFiles.map((item, index) => {
        if (item.used) {
          return item
        }
        if (item.dirname === dirTmp.name) {
          item.used = true
          dirTmp.files.push(item)
        }
        return true
      })
      this.fileBrowser.listFiles.push(dirTmp)
      return true
    })

    return true
  }

  treeFiles (path, treeFiles, deep) {
    const { fileClick, classes } = this.props
    const files = Object.keys(treeFiles)
    let filesCount = 0
    if (files.length < 3) {
      return false
    }

    files.map((item, index) => {
      filesCount += (item !== '/' && item !== '/open' && !treeFiles[item]['/']) ? 1 : 0
      return true
    })

    return (<React.Fragment>
      { filesCount > 0 || files.length > 3
        ? <Typography component='div'>
          <Typography component='div' className={classes.tree} style={this.calcPadding(deep, true)} onClick={(e) => {
            treeFiles['/open'] = !treeFiles['/open']
            this.setState({ count: this.state.count + 1 })
          }}>
            <FontAwesomeIcon icon={treeFiles['/open'] ? faFolderOpen : faFolder} />&nbsp;&nbsp;{path}
          </Typography>
          { treeFiles['/open'] && files.map((item, index) => item !== '/' && item !== '/open' && <React.Fragment key={index}>
            { treeFiles[item]['/']
              ? this.treeFiles(item, treeFiles[item], deep + 1)
              : <Typography component='div' className={classes.tree} onClick={(e) => fileClick(treeFiles[item].hash)} style={this.calcPadding(deep, false)}>
                <FontAwesomeIcon icon={faFile} />&nbsp;&nbsp;{treeFiles[item].filename}
                <Typography component='span' className={classes.delete}>-{treeFiles[item].delete}</Typography>
                <Typography component='span' className={classes.add}>+{treeFiles[item].add}&nbsp;</Typography>
              </Typography>
            }
          </React.Fragment>)}
        </Typography>
        : files.map((item, index) => item !== '/' && item !== '/open' && <React.Fragment key={index}>
          {this.treeFiles((path !== '/' ? (path + '/') : '') + item, treeFiles[item], deep)}
        </React.Fragment>)}
    </React.Fragment>)
  }

  calcPadding (deep, isDir) {
    return {
      paddingLeft: (2 * deep + (isDir ? 1 : 3)) * themeSpacing + 'px'
    }
  }

  listFiles () {
    const { fileClick, classes } = this.props
    const { listFiles } = this.fileBrowser
    if (!listFiles || !listFiles.length) {
      return false
    }

    return (<Typography component='div' ref={this.listFilesRef}>
      {listFiles.map((item, index) => {
        return (<Typography component='div' key={index} className={classes.listSub}>
          <Typography component='div' className={classes.listDir2}>{this.calcDir(item.name)}/</Typography>
          <Typography component='div' className={classes.listDir}>{item.name}/</Typography>
          {item.files && item.files.map((item, index) => {
            return (<Typography key={index} component='div' className={classes.listFile} onClick={(e) => fileClick(item.hash)}>
              <FontAwesomeIcon icon={faSquare} />&nbsp;&nbsp;{item.filename}
              <Typography component='span' className={classes.delete}>-{item.delete}</Typography>
              <Typography component='span' className={classes.add}>+{item.add}&nbsp;</Typography>
            </Typography>)
          })}
        </Typography>)
      })
      }
    </Typography>)
  }

  calcDir (dir) {
    if (!dir) {
      return ''
    }

    const dirs = dir.split('/')
    let index = dirs.length - 2
    while (dirs.join('/').length > 32 && index > 0) {
      dirs[index--] = '..'
    }

    return dirs.join('/')
  }

  listFilesScroll (e) {
    if (this.props.treeView) {
      return false
    }

    const scrollTop = e.target.scrollTop
    let offsetTop = 0
    let offsetBottom = 0
    const offset = 5 * themeSpacing
    const children = this.listFilesRef.current.children
    for (let i = 0; i < children.length; i++) {
      offsetBottom += children[i].clientHeight
      if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
        if (scrollTop > offsetBottom - offset) {
          children[i].style = 'position: relative'
          children[i].children[0].style = 'top: ' + (children[i].clientHeight - offset) + 'px'
        } else {
          children[i].style = 'position: static'
          children[i].children[0].style = 'top: 0; width: ' + children[i].clientWidth + 'px'
        }
      } else {
        children[i].style = 'position: relative'
        children[i].children[0].style = 'top: 0'
      }

      offsetTop += children[i].clientHeight
    }
  }

  render () {
    const { treeView, classes } = this.props
    this.initChangeFiles()
    return (<Grid container className={classes.fileBrowserTop}>
      <Grid item xs={12} className={classes.fileBrowser} onScroll={(e) => this.listFilesScroll(e)}>
        {treeView ? this.treeFiles('/', this.fileBrowser.treeFiles, 0) : this.listFiles()}
      </Grid>
    </Grid>
    )
  }
}

FileBrowser.propTypes = {
  changeFiles: PropTypes.array.isRequired,
  treeView: PropTypes.bool.isRequired,
  fileClick: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(FileBrowser)
    )
  )
)
