// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles } from '@material-ui/core/styles'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import GroupCard from 'APPSRC/components/unit/GroupCard'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import UAC from 'APPSRC/config/UAC'

const styles = (theme) => ({
  container: {
    minWidth: theme.spacing(40)
  }
})

class GroupList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTab: 0
    }
  }

  render () {
    const { groupList, currentUserInfo, classes, intl } = this.props
    const tabs = [
      intl.formatMessage({ id: 'label.all' }),
      intl.formatMessage({ id: 'label.IJoined' }),
      intl.formatMessage({ id: 'label.ICreated' })
    ]
    const tabsFilter = [
      () => true,
      FilterGenerator.not(FilterGenerator.creator(currentUserInfo.id)),
      FilterGenerator.creator(currentUserInfo.id)
    ]

    const finalList = groupList
      .filter(FilterGenerator.withPermission(UAC.PermissionCode.REPO_READ))
      .filter(tabsFilter[this.state.currentTab])

    return <Grid container spacing={3}>
      <Grid item xs={12}>
        <TabHeader
          tabs={tabs}
          currentTab={this.state.currentTab}
          onChange={(ev, tab) => {
            this.setState({ currentTab: tab })
          }}
        >
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              this.props.history.push(makeLink('groups', 'new'))
            }}
          >
            { intl.formatMessage({ id: 'label.newGroup' }) }
          </Button>
        </TabHeader>
      </Grid>
      { finalList
        .map((item, key) => <Grid item xs={12} sm={6} md={4} lg={3} key={key} className={classes.container} >
          <GroupCard key={key} groupInfo={item} />
        </Grid>) }
      { finalList.length === 0 && <EmptyListNotice
        imageName={'repositories-empty.png'}
        title={intl.formatMessage(
          { id: 'message._S_listEmpty' },
          { s: intl.formatMessage({ id: 'label.group' }) }
        )}
        notice={intl.formatMessage({ id: 'message.groupListEmptyNotice' })}
      >
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            this.props.history.push(makeLink('groups', 'new'))
          }}
        >
          { intl.formatMessage({ id: 'label.newGroup' }) }
        </Button>
      </EmptyListNotice> }
    </Grid>
  }
}

GroupList.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  groupList: PropTypes.array.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    groupList: state.DataStore.groupList,
    currentUserInfo: state.DataStore.currentUserInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(GroupList)
  )
)
