// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plTag, plBranch, psConfirm, plTrash, plCommit, psMore, plSafe } from '@pgyer/icons'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import SmartLink from 'APPSRC/components/unit/SmartLink'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import TitleList from 'APPSRC/components/unit/TitleList'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'

// helpers
import { makeLink, getUserInfo, getDefaultBranch } from 'APPSRC/helpers/VaribleHelper'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import ShowHelper from '@pgyer/essential-component/ShowHelper'

// style
const styles = theme => ({
  refListItem: {
    marginTop: theme.spacing(3)
  },
  oneline: {
    display: 'flex',
    height: theme.spacing(3),
    alignItems: 'center'
  },
  refItem: {
    padding: theme.spacing(1.5) + 'px ' + theme.spacing(3) + 'px',
    borderTop: '1px solid ' + theme.palette.border
  },
  refName: {
    '& a': {
      color: theme.palette.text.main + ' !important',
      fontWeight: 600
    }
  },
  refLog: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '35%',
    '& a': {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: theme.palette.text.main + ' !important'
    }
  },
  refUpdate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  refSha: {
    '& a': {
      color: theme.palette.secondary.main + ' !important'
    }
  },
  delete: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  more: {
    paddingTop: theme.spacing(2)
  },
  icon: {
    color: theme.palette.text.light
  },
  icon2: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(2.5)
  }
})

class RefList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 1,
      perpage: 10,
      anchor: []
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.repage !== nextProps.repage) {
      this.setState({ page: 1 })
    }
    return true
  }

  refListsDeal (refLists) {
    const { currentRepositoryConfig, history } = this.props

    refLists.map((refList) => {
      refList.map((item, index) => {
        const filesLink = makeLink(
          currentRepositoryConfig.repository.group.name,
          currentRepositoryConfig.repository.name,
          'files', encodeURIComponent(item.name), ''
        )
        item.nameA = <SmartLink to={filesLink} onClick={() => history.push(filesLink)}>{item.name}</SmartLink>
        if (item.commit.sha) {
          const commitsLink = makeLink(
            currentRepositoryConfig.repository.group.name,
            currentRepositoryConfig.repository.name,
            'commit', item.commit.sha.substring(0, 8)
          )
          item.shaA = <SmartLink to={commitsLink} onClick={() => history.push(commitsLink)}>{item.commit.sha.substring(0, 8)}</SmartLink>
          item.logA = <SmartLink to={commitsLink} onClick={() => history.push(commitsLink)}>{item.commit.commit}</SmartLink>
        }
        if (item.commit.email) {
          item.updater = getUserInfo(currentRepositoryConfig.members, item.commit.email)
        }
        return true
      })
      return true
    })
  }

  openRefItemMenu (index, e) {
    const anchor = this.state.anchor
    anchor[index] = e.target
    this.setState({ anchor: anchor })
  }

  closeRefItemMenu (index) {
    const anchor = this.state.anchor
    anchor[index] = null
    this.setState({ anchor: anchor })
  }

  refListItem (refTitle, refList, index) {
    const { currentRepositoryConfig, refType, deleteRef, tabValue, classes, intl } = this.props
    const { page, perpage } = this.state
    const defaultBranch = getDefaultBranch(currentRepositoryConfig)
    if (tabValue === 0 && !refList.length) {
      return false
    }

    return (<Grid container key={index} className={classes.refListItem}>
      { refList.length > 0 && <Grid item xs={12}>
        <TitleList title={refTitle ? intl.formatMessage({ id: 'label.' + refTitle }) : ''}>
          { refList.slice(0, page * perpage).map((item, index) => (<Grid key={index} container className={classes.refItem}>
            <Grid item xs={11}>
              <Typography variant='body1' component='div' className={classes.oneline}>
                <FontAwesomeIcon className={classes.icon} icon={refType === 'tag' ? plTag : plBranch} />&nbsp;&nbsp;&nbsp;
                <Typography component='span' className={classes.refName}>{item.nameA}</Typography>&nbsp;&nbsp;
                <Typography component='span' className={classes.refLog}>{item.detail}</Typography>&nbsp;&nbsp;
                { refType === 'branch' && item.protected && <FontAwesomeIcon className={classes.icon2} icon={plSafe} /> }
                { refType === 'branch' && item.name === defaultBranch && <React.Fragment><InlineMarker color='secondary' text={intl.formatMessage({ id: 'label.default' })} /> &nbsp;&nbsp;&nbsp;</React.Fragment> }
                { refType === 'branch' && item.name !== defaultBranch && !!item.isMerge && <InlineMarker color='success' icon={psConfirm} text={intl.formatMessage({ id: 'message.merged' })} /> }
              </Typography>
              <Typography variant='body1' component='div' className={classes.oneline}>
                <FontAwesomeIcon className={classes.icon} icon={plCommit} />&nbsp;·&nbsp;
                <Typography component='span' className={classes.refSha}>{item.shaA}</Typography>&nbsp;·&nbsp;
                <Typography component='span' className={classes.refLog}>{item.logA}</Typography>&nbsp;·&nbsp;
                <Typography variant='body2' component='span' className={classes.refUpdate}>
                  {item.updater.name}&nbsp;
                  {intl.formatMessage({ id: 'label.updatedIn' })}&nbsp;
                </Typography>
                <FormattedTime timestamp={item.commit.time * 1} />
              </Typography>
            </Grid>
            <Grid item xs={1} className={classes.delete}>
              { refType === 'branch' && item.name !== defaultBranch && <React.Fragment>
                <SquareIconButton label='label.more' onClick={e => this.openRefItemMenu(refTitle + index, e)} icon={psMore} />
                <Menu
                  anchorEl={this.state.anchor[refTitle + index]}
                  open={!!this.state.anchor[refTitle + index]}
                  onClose={e => this.closeRefItemMenu(refTitle + index)}
                >
                  <MenuItem onClick={() => {
                    this.closeRefItemMenu(refTitle + index)
                    deleteRef(item.name)
                  }}>
                    <FontAwesomeIcon className={classes.icon} icon={plTrash} />&nbsp;&nbsp;{intl.formatMessage({ id: 'label.delete' })}
                  </MenuItem>
                </Menu>
              </React.Fragment>
              }
              {refType === 'tag' && <SquareIconButton label='label.delete' className={classes.icon} onClick={() => deleteRef(item.name)} icon={plTrash} />}
            </Grid>
          </Grid>))
          }
        </TitleList>
      </Grid>
      }
      { tabValue !== 0 && <Grid item xs={12}>
        <Grid container className={classes.more} justifyContent='center'>
          <Grid item>
            { page * perpage >= refList.length
              ? <Button size='small' disabled>
                { intl.formatMessage({ id: 'label.noMore' }) }
              </Button>
              : <Button variant='contained' color='primary' size='small' disableElevation
                onClick={e => this.setState({ page: this.state.page + 1 })}
              >
                { intl.formatMessage({ id: 'label.more' }) } &nbsp;&nbsp;
                <FontAwesomeIcon icon={faAngleDown} />
              </Button>
            }
          </Grid>
        </Grid>
      </Grid>
      }
    </Grid>
    )
  }

  render () {
    const { refType, count, refTitles, refLists, pending, currentRepositoryConfig, classes, history, intl } = this.props
    this.refListsDeal(refLists)

    let listCount = 0
    refLists && refLists.map((item, index) => {
      listCount += item.length
      return true
    })

    return (<React.Fragment>
      { count
        ? listCount
          ? refLists.map((item, index) => this.refListItem(refTitles[index], item, index))
          : <Grid item xs={12}>
            <Grid container className={classes.more} justifyContent='center'>
              <Grid item>
                <Button disabled>{ intl.formatMessage({ id: 'label.noMore' }) }</Button>
              </Grid>
            </Grid>
          </Grid>
        : <Grid item>
          <EmptyListNotice
            imageName={refType === 'tag' ? 'branches-empty.png' : 'tags-empty.png'}
            title={intl.formatMessage({ id: 'message.repository_S_empty' }, { s: intl.formatMessage({ id: 'label.' + refType }) })}
            notice={intl.formatMessage({ id: refType === 'tag' ? 'message.repositoryTagEmpty' : 'message.repositoryBranchEmpty' })}
          >
            {refType === 'tag'
              ? currentRepositoryConfig.branches && currentRepositoryConfig.branches.length > 0 && <Button variant='contained' color='primary'
                disabled={pending}
                onClick={() => history.push(makeLink(
                  currentRepositoryConfig.repository.group.name,
                  currentRepositoryConfig.repository.name,
                  'tags', 'new'))}>
                {intl.formatMessage({ id: 'label.newTag' })}
              </Button>
              : <ShowHelper
                type='button'
                docID='b0f4a4af6bf1407537f0ae71e167c395'
                title={intl.formatMessage({ id: 'label.newBranch' })}
              />
            }
          </EmptyListNotice>
        </Grid>
      }
    </React.Fragment>
    )
  }
}

RefList.propTypes = {
  refType: PropTypes.string.isRequired,
  count: PropTypes.number,
  refTitles: PropTypes.array.isRequired,
  refLists: PropTypes.array.isRequired,
  deleteRef: PropTypes.func.isRequired,
  repage: PropTypes.number.isRequired,
  pending: PropTypes.bool.isRequired,
  tabValue: PropTypes.number,
  currentRepositoryConfig: PropTypes.object.isRequired,
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
  return {}
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(RefList)
    )
  )
)
