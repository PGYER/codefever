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
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plSearch, plSortDesc } from '@pgyer/icons'
import TabHeader from 'APPSRC/components/unit/TabHeader'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'

// helpers
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  input: {
    width: theme.spacing(30),
    maxWidth: '100%'
  },
  button: {
    marginLeft: theme.spacing(4)
  },
  icon: {
    color: theme.palette.text.light
  },
  transform: {
    transform: 'rotateX(180deg)'
  }
})

class RefFilter extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      keyword: props.match.params.tag ? props.match.params.tag : (props.match.params.branch ? props.match.params.branch : '')
    }
  }

  render () {
    const { refType, pending, searchRef, sortDesc, sortSwitch, children, tabValue, tabChange, currentRepositoryConfig, history, classes, intl } = this.props

    return (<Grid item xs={12}>
      <TabHeader
        currentTab={tabValue}
        onChange={(e, value) => tabChange(value)}
        tabs={refType === 'branch' ? [intl.formatMessage({ id: 'label.all' }), intl.formatMessage({ id: 'label.active' }), intl.formatMessage({ id: 'label.inactive' })] : []}
      >
        <TextField
          variant='outlined'
          className={classes.input}
          placeholder={intl.formatMessage({ id: 'message.input_S_name' }, { s: intl.formatMessage({ id: 'label.' + refType }) })}
          defaultValue={this.state.keyword}
          onChange={(e) => searchRef(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position='start'><FontAwesomeIcon icon={plSearch} /></InputAdornment>
          }}
        />&nbsp;
        <SquareIconButton label='label.sort' onClick={sortSwitch} className={[classes.icon, sortDesc ? '' : classes.transform].join(' ')} icon={plSortDesc} />
        {currentRepositoryConfig.branches && currentRepositoryConfig.branches.length > 0 && <Button variant='contained' color='primary' className={classes.button}
          disabled={pending}
          onClick={() => history.push(makeLink(
            currentRepositoryConfig.repository.group.name,
            currentRepositoryConfig.repository.name,
            refType === 'tag' ? 'tags' : 'branches', 'new'))}>
          {intl.formatMessage({ id: refType === 'tag' ? 'label.newTag' : 'label.newBranch' })}
        </Button>}
      </TabHeader>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {children}
        </Grid>
      </Grid>
    </Grid>
    )
  }
}

RefFilter.propTypes = {
  refType: PropTypes.string.isRequired,
  pending: PropTypes.bool.isRequired,
  searchRef: PropTypes.func.isRequired,
  sortDesc: PropTypes.bool.isRequired,
  sortSwitch: PropTypes.func.isRequired,
  tabValue: PropTypes.number,
  tabChange: PropTypes.func,
  children: PropTypes.object.isRequired,
  currentRepositoryConfig: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
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
      connect(mapStateToProps, mapDispatchToProps)(RefFilter)
    )
  )
)
