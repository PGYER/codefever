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
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import MemberItem from 'APPSRC/components/unit/MemberItem'
import ShowHelper from 'APPSRC/components/unit/ShowHelper'
import UAC from 'APPSRC/config/UAC'

// helpers
import EventGenerator from 'APPSRC/helpers/EventGenerator'

// style
const styles = theme => ({
  textMain: {
    '& a': {
      color: theme.palette.text.main + ' !important'
    }
  },
  textLight: {
    '& a': {
      color: theme.palette.text.light + ' !important'
    }
  },
  empty: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  tableRow: {
    height: theme.spacing(7)
  }
})

class MemberList extends React.Component {
  deleteConfirm (data, name) {
    const { intl, removeMember, isRepository, currentConfig } = this.props
    this.props.dispatchEvent(EventGenerator.addComformation('branch_remove', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.member' }) + ' \'' + name + '\' ' }),
      description: '',
      reject: () => { return true },
      accept: () => {
        removeMember(
          isRepository ? currentConfig.repository.id : currentConfig.group.id,
          data
        )
        this.props.dispatchEvent(EventGenerator.cancelComformation())
      }
    }))
  }

  render () {
    const {
      intl,
      classes,
      currentConfig,
      changeMemberRole,
      isRepository,
      groupMember,
      currentUserInfo
    } = this.props
    const members = groupMember
      ? currentConfig.members.filter(FilterGenerator.notDeleted()).filter(FilterGenerator.groupMember())
      : currentConfig.members.filter(FilterGenerator.notDeleted()).filter(FilterGenerator.notGroupMember())
    const yourself = currentConfig.members.filter(FilterGenerator.id(currentUserInfo.id))[0]
    return (<React.Fragment>
      { currentConfig
        ? <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className={classes.textMain}>
                <TableCell width='40%'>{ groupMember ? intl.formatMessage({ id: 'label.groupMember' }) : intl.formatMessage({ id: 'label.repositoryMember' })}</TableCell>
                <TableCell width='40%'>{intl.formatMessage({ id: 'label.email' })}</TableCell>
                <TableCell width='20%' align='right'>{intl.formatMessage({ id: 'label.role' })} <ShowHelper doc='/common/memberRole.md' type='icon' /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { members
                .map((item, key) => {
                  return <TableRow key={key} className={classes.tableRow}><MemberItem key={key} item={item}
                    disabled={yourself.role < UAC.Role.MAINTAINER}
                    onUpdate={data => changeMemberRole(
                      isRepository ? currentConfig.repository.id : currentConfig.group.id,
                      item.id,
                      data
                    )}
                    onRemove={data => this.deleteConfirm(data, item.name)}
                  /></TableRow>
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
        : <Grid container spacing={2} className={classes.empty}>
          {intl.formatMessage({ id: 'message.repositoryEmpty' })}
        </Grid>
      }
    </React.Fragment>
    )
  }
}

MemberList.propTypes = {
  currentUserInfo: PropTypes.object.isRequired,
  currentConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  changeMemberRole: PropTypes.func.isRequired,
  removeMember: PropTypes.func.isRequired,
  isRepository: PropTypes.bool.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  groupMember: PropTypes.bool.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo
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
      connect(mapStateToProps, mapDispatchToProps)(MemberList)
    )
  )
)
