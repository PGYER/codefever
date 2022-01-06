// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import RefFilter from 'APPSRC/components/unit/RefFilter'
import RefList from 'APPSRC/components/unit/RefList'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import EventGenerator from 'APPSRC/helpers/EventGenerator'

// style
const styles = theme => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  }
})

class TagList extends React.Component {
  constructor (props) {
    super(props)
    this.observed = {
      keyword: this.props.match.params.tag ? this.props.match.params.tag : '',
      data: null
    }

    this.state = {
      tagList: null,
      pending: true,
      repage: 0,
      sortDesc: true
    }
  }

  componentDidMount () {
    this.getData(this.props)
  }

  getData (props) {
    if (!props.currentRepositoryKey || !props.currentRepositoryConfig.repository) {
      return false
    }

    RepositoryData.tagList({
      repository: props.currentRepositoryKey
    }).then(NetworkHelper.withEventdispatcher(props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.setState({ pending: false })
        if (!data.code) {
          this.observed.data = data.data
          this.dataSort(this.state.sortDesc)
        }
      })
  }

  dataSort (sortDesc) {
    if (this.observed.data) {
      this.observed.data.sort((item1, item2) => {
        return sortDesc ? (item2.commit.time - item1.commit.time) : (item1.commit.time - item2.commit.time)
      })
      this.dataFilter()
    }
  }

  dataFilter () {
    const { data, keyword } = this.observed

    let tagList = null
    if (data === null || !data.length) {
      tagList = []
    } else if (!keyword) {
      tagList = data
    } else {
      tagList = data.filter(FilterGenerator.nameLikes(keyword))
    }

    this.setState({ tagList: [tagList], repage: this.state.repage + 1 })
  }

  filterTag (keyword) {
    this.observed.keyword = keyword
    this.dataFilter()
  }

  deleteTag (tag) {
    const { currentRepositoryKey, intl } = this.props
    if (!currentRepositoryKey || !tag) {
      return false
    }

    RepositoryData.deleteTag({
      repository: currentRepositoryKey,
      tag: tag
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.observed.data = this.observed.data.filter((item, index) => {
            return item.name !== tag
          })
          this.props.dispatchEvent(EventGenerator.NewNotification(
            intl.formatMessage({ id: 'message.deleted' }),
            0)
          )
          this.dataFilter()
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            intl.formatMessage({ id: 'message.error.deleteFail' }),
            2)
          )
        }
        this.props.dispatchEvent(EventGenerator.cancelComformation())
      })
  }

  deleteConfirm (tag) {
    const { intl } = this.props
    this.props.dispatchEvent(EventGenerator.addComformation('tag_remove', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.tag' }) + ' \'' + tag + '\' ' }),
      description: '',
      reject: () => { return true },
      accept: () => {
        this.deleteTag(tag)
      }
    }))
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.currentRepositoryKey !== nextProps.currentRepositoryKey) {
      this.getData(nextProps)
      return false
    }
    if (JSON.stringify(this.props.currentRepositoryConfig) !== JSON.stringify(nextProps.currentRepositoryConfig)) {
      this.getData(nextProps)
      return false
    }
    if (this.state.sortDesc !== nextState.sortDesc) {
      this.dataSort(nextState.sortDesc)
      return false
    }
    return true
  }

  render () {
    const { tagList, pending, repage, sortDesc } = this.state
    return (<Grid container spacing={3}>
      <RefFilter
        refType='tag'
        pending={pending}
        searchRef={(keyword) => this.filterTag(keyword)}
        sortDesc={sortDesc}
        sortSwitch={() => this.setState({ sortDesc: !sortDesc })}>
        { tagList !== null
          ? <RefList
            refType='tag'
            count={this.observed.data ? this.observed.data.length : 0}
            refTitles={['']}
            refLists={tagList}
            deleteRef={(tag) => this.deleteConfirm(tag)}
            repage={repage}
            pending={pending} />
          : <Grid container spacing={2} className={this.props.classes.loading}>
            <CircularProgress />
          </Grid>
        }
      </RefFilter>
    </Grid>
    )
  }
}

TagList.propTypes = {
  currentRepositoryKey: PropTypes.string,
  currentRepositoryConfig: PropTypes.object,
  match: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryKey: state.DataStore.currentRepositoryKey,
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
      connect(mapStateToProps, mapDispatchToProps)(TagList)
    )
  )
)
