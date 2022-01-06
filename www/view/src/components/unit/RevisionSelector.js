// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// component
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import ListSubheader from '@material-ui/core/ListSubheader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import { plBranch, plTag, plCommit } from '@pgyer/icons'

// style
const styles = theme => ({
  select: {
    '& > div > svg': {
      width: theme.spacing(3),
      height: theme.spacing(3)
    }
  },
  icon: {
    color: theme.palette.text.light
  }
})

class RefSelector extends React.Component {
  composeOptions (revisionList, currentRevision) {
    let options = []
    if (revisionList && (revisionList.branches || revisionList.tags)) {
      if (revisionList.branches && revisionList.branches.length) {
        options.push(<ListSubheader disableSticky key='b'>{this.props.intl.formatMessage({ id: 'label.branch' })}</ListSubheader>)
        options = options.concat(revisionList.branches.map(
          (item, key) => <MenuItem key={'b' + key} value={item.id}>
            <FontAwesomeIcon icon={plBranch} className={this.props.classes.icon} />&nbsp;&nbsp;{item.name}
          </MenuItem>
        ))
      }

      if (revisionList.tags && revisionList.tags.length) {
        options.push(<ListSubheader disableSticky key='t' disabled>{this.props.intl.formatMessage({ id: 'label.tag' })}</ListSubheader>)
        options = options.concat(revisionList.tags.map(
          (item, key) => <MenuItem key={'t' + key} value={item.id}>
            <FontAwesomeIcon icon={plTag} className={this.props.classes.icon} />&nbsp;&nbsp;{item.name}
          </MenuItem>
        ))
      }

      if (!revisionList.branches.filter(FilterGenerator.id(currentRevision)).length &&
        !revisionList.tags.filter(FilterGenerator.id(currentRevision)).length
      ) {
        options.push(<ListSubheader disableSticky key='c' disabled>{this.props.intl.formatMessage({ id: 'label.commit' })}</ListSubheader>)
        options.push(<MenuItem key='c0' value={currentRevision}>
          <FontAwesomeIcon icon={plCommit} className={this.props.classes.icon} />&nbsp;&nbsp;{currentRevision}
        </MenuItem>)
      }
    }
    return options
  }

  render () {
    const { currentRevision, revisionList, onChange, classes } = this.props

    return <TextField
      select
      value={currentRevision}
      variant='outlined'
      onChange={e => e.target.value && onChange(e.target.value)}
      className={classes.select}
    >
      {this.composeOptions(revisionList, currentRevision)}
    </TextField>
  }
}

RefSelector.propTypes = {
  currentRevision: PropTypes.string.isRequired,
  revisionList: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
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
