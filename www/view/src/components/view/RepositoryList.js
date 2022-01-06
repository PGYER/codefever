// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withStyles } from '@material-ui/core/styles'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import RepositoryListItem from 'APPSRC/components/unit/RepositoryListItem'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import GroupDashboard from 'APPSRC/components/unit/GroupDashboard'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import UAC from 'APPSRC/config/UAC'

const styles = (theme) => ({})

class RepositoryList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTab: 0
    }
  }

  render () {
    const { currentUserInfo, currentGroupKey, currentGroupConfig, repositoryList, repositoryListPending, match, intl } = this.props

    let finalList = repositoryList.filter(FilterGenerator.withPermission(UAC.PermissionCode.REPO_READ))
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

    if (currentGroupKey) {
      tabs[0] = intl.formatMessage({ id: 'label.repository' })
      finalList = finalList.filter(FilterGenerator.group(currentGroupKey))
    } else if (match.params.repositoryID) {
      const forkedRepository = repositoryList.filter(FilterGenerator.id(match.params.repositoryID))[0]
      finalList = finalList.filter(FilterGenerator.fork(match.params.repositoryID))
      if (forkedRepository) {
        tabs[0] = intl.formatMessage(
          { id: 'label.forkFrom_S' },
          { s: [forkedRepository.group.displayName, forkedRepository.displayName].join('/') }
        )
      } else {
        tabs[0] = intl.formatMessage(
          { id: 'label.forkFrom_S' },
          { s: intl.formatMessage({ id: 'label.unknownRepository' }) }
        )
      }
    }

    finalList = finalList.filter(tabsFilter[this.state.currentTab])

    return (<Grid container spacing={currentGroupConfig.group ? 0 : 3}>
      { currentGroupConfig.group && <Grid item xs={12}>
        <GroupDashboard groupConfig={currentGroupConfig} />
      </Grid> }
      <Grid item xs={12}>
        <TabHeader
          tabs={tabs}
          currentTab={this.state.currentTab}
          onChange={(ev, tab) => {
            this.setState({ currentTab: tab })
          }}
        >
          {(!currentGroupConfig.group && !match.params.repositoryID) && <Button
            variant='contained'
            color='primary'
            onClick={() => {
              this.props.history.push(
                currentGroupConfig.group
                  ? makeLink('groups', currentGroupConfig.group.name, 'repositories', 'new')
                  : makeLink('repositories', 'new')
              )
            }}
          >
            { intl.formatMessage({ id: 'label.newRepository' }) }
          </Button>}
        </TabHeader>
      </Grid>
      <Grid item xs={12}>
        { finalList.map((item, key) => <RepositoryListItem key={key} repositoryInfo={item} />) }
        { finalList.length === 0 && <EmptyListNotice
          imageName={'repositories-empty.png'}
          title={intl.formatMessage(
            { id: 'message._S_listEmpty' },
            { s: intl.formatMessage({ id: 'label.repository' }) }
          )}
          pending={repositoryListPending}
          notice={intl.formatMessage({ id: 'message.repositoryListEmptyNotice' })}
        >
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              this.props.history.push(
                currentGroupConfig.group
                  ? makeLink('groups', currentGroupConfig.group.name, 'repositories', 'new')
                  : makeLink('repositories', 'new')
              )
            }}
          >
            { intl.formatMessage({ id: 'label.newRepository' }) }
          </Button>
        </EmptyListNotice> }
      </Grid>
    </Grid>)
  }
}

RepositoryList.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  repositoryList: PropTypes.array.isRequired,
  repositoryListPending: PropTypes.bool.isRequired,
  currentGroupKey: PropTypes.string.isRequired,
  currentGroupConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentUserInfo: state.DataStore.currentUserInfo,
    currentGroupKey: state.DataStore.currentGroupKey,
    currentGroupConfig: state.DataStore.currentGroupConfig,
    repositoryList: state.DataStore.repositoryList,
    repositoryListPending: state.DataStore.repositoryListPending
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(RepositoryList)
  )
)
