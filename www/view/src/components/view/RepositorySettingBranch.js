// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { plEdit, plTrash, plCheck, plClose } from '@pgyer/icons'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import EmptyListNotice from 'APPSRC/components/unit/EmptyListNotice'
import TableList from 'APPSRC/components/unit/TableList'
import RepositoryData from 'APPSRC/data_providers/RepositoryData'
import UAC from 'APPSRC/config/UAC'

// helpers
import NetworkHelper from 'APPSRC/helpers/NetworkHelper'
import ValidatorGenerator from 'APPSRC/helpers/ValidatorGenerator'
import EventGenerator from 'APPSRC/helpers/EventGenerator'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

const styles = (theme) => ({
  loading: {
    paddingTop: theme.spacing(16),
    paddingBottom: theme.spacing(16),
    justifyContent: 'center'
  },
  header: {
    lineHeight: theme.spacing(5) + 'px',
    marginBottom: theme.spacing(4),
    borderBottom: '1px solid ' + theme.palette.border,
    fontSize: '18px'
  },
  title: {
    lineHeight: theme.spacing(3) + 'px',
    paddingBottom: theme.spacing(2)
  },
  content: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5)
  },
  create: {
    marginTop: theme.spacing(1)
  },
  size: {
    fontSize: '12px'
  },
  btn: {
    marginLeft: theme.spacing(3)
  },
  border: {
    borderBottom: '1px solid ' + theme.palette.border,
    marginBottom: theme.spacing(3)
  },
  icon: {
    color: theme.palette.text.light
  },
  ok: {
    '& svg': {
      color: theme.palette.success.main + ' !important'
    }
  },
  cancel: {
    marginLeft: theme.spacing(3),
    '& svg': {
      width: '14px !important',
      height: '14px !important',
      padding: '2px',
      color: theme.palette.error.main + ' !important'
    }
  },
  table: {
    marginTop: theme.spacing(3),
    '& tbody tr': {
      '&:hover': {
        background: theme.palette.background.light + ' !important'
      }
    },
    '& td': {
      lineHeight: theme.spacing(6) + 'px',
      '& > div': {
        verticalAlign: 'middle'
      }
    }
  }
})

class RepositorySettingBranch extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      branch: props.currentRepositoryConfig.repository ? props.currentRepositoryConfig.repository.defaultBranch : '',
      rules: null,
      updateRuleId: null,
      rule: '',
      rolePush: UAC.Role.OWNER,
      roleMerge: UAC.Role.OWNER,
      error: {}
    }

    this.checkInput = ValidatorGenerator.stateValidator(this, [
      {
        name: 'rule',
        passPattern: /^.+$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_empty' },
          { s: this.props.intl.formatMessage({ id: 'label.rule' }) }
        )
      },
      {
        name: 'rule',
        passPattern: /^([0-9a-zA-Z/]{1,30}|\/\^?.{1,30}\$?\/[igm]*)$/,
        errorMessage: this.props.intl.formatMessage(
          { id: 'message.error._S_invalid' },
          { s: this.props.intl.formatMessage({ id: 'label.rule' }) }
        )
      }
    ])
  }

  componentDidMount () {
    this.getData(this.props)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(nextProps.currentRepositoryConfig) !== JSON.stringify(this.props.currentRepositoryConfig) &&
      !this.props.currentRepositoryConfig.repository) {
      this.setState({ branch: nextProps.currentRepositoryConfig.repository.defaultBranch })
      this.getData(nextProps)
      return false
    }

    return true
  }

  getData (props) {
    const { currentRepositoryConfig } = props
    if (!currentRepositoryConfig.repository) {
      return false
    }

    this.setState({ pending: true })
    RepositoryData.protectedBranchRules({
      repository: currentRepositoryConfig.repository.id
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        this.cancelForm()
        if (!data.code) {
          this.setState({
            pending: false,
            rules: data.data
          })
        }
      })
  }

  getTableData () {
    const { classes } = this.props
    const { rules, updateRuleId } = this.state
    const final = []
    if (!rules) {
      return false
    }

    rules.map((item, index) => {
      if (item === 'create' || item.id === updateRuleId) {
        final.push(this.createForm())
      } else {
        final.push([
          <Typography variant='body1' component='div'>{item.rule}</Typography>,
          <Typography variant='body1' component='div'>{this.getAllowRoler(item.rolePush)}</Typography>,
          <Typography variant='body1' component='div'>{this.getAllowRoler(item.roleMerge)}</Typography>,
          <React.Fragment>
            <SquareIconButton label='label.modification' icon={plEdit} className={classes.icon} onClick={e => this.editRule(item)} />
            <SquareIconButton label='label.delete' className={[classes.btn, classes.icon].join(' ')} onClick={e => this.deleteConfirm(item.id, item.rule)} icon={plTrash} />
          </React.Fragment>
        ])
      }
      return true
    })

    return [
      ['30%', '200px', '200px', 'auto'],
      ['label.branchRule', 'label.allowPush', 'label.allowMerge', 'label.operating'],
      ...final
    ]
  }

  getAllowRoler (roleId) {
    const { intl } = this.props
    const roleIds = [
      intl.formatMessage({ id: 'message.noBodyAllow' }),
      intl.formatMessage({ id: 'label.owner' }),
      intl.formatMessage({ id: 'label.maintianer' }),
      intl.formatMessage({ id: 'label.developer' })
    ]

    return roleIds.slice(roleId === UAC.Role.NOBODY ? 0 : 1, UAC.Role.NOBODY - roleId + 1).join(' + ')
  }

  createForm () {
    const { classes, intl } = this.props
    return [
      <TextField
        fullWidth
        variant='outlined'
        value={this.state.rule}
        placeholder={intl.formatMessage({ id: 'message.inputBranchOrRegexp' })}
        error={!!this.state.error.rule}
        helperText={this.state.error.rule}
        onChange={(e) => this.setState({ rule: e.target.value })}
      />,
      <TextField
        fullWidth
        select
        variant='outlined'
        value={this.state.rolePush}
        error={!!this.state.error.rolePush}
        helperText={this.state.error.rolePush}
        onChange={(e) => this.setState({ rolePush: e.target.value })}
      >
        <MenuItem value={UAC.Role.OWNER}>{this.getAllowRoler(UAC.Role.OWNER)}</MenuItem>
        <MenuItem value={UAC.Role.MAINTAINER}>{this.getAllowRoler(UAC.Role.MAINTAINER)}</MenuItem>
        <MenuItem value={UAC.Role.DEVELOPER}>{this.getAllowRoler(UAC.Role.DEVELOPER)}</MenuItem>
        <MenuItem value={UAC.Role.NOBODY}>{this.getAllowRoler(UAC.Role.NOBODY)}</MenuItem>
      </TextField>,
      <TextField
        fullWidth
        select
        variant='outlined'
        value={this.state.roleMerge}
        error={!!this.state.error.roleMerge}
        helperText={this.state.error.roleMerge}
        onChange={(e) => this.setState({ roleMerge: e.target.value })}
      >
        <MenuItem value={UAC.Role.OWNER}>{this.getAllowRoler(UAC.Role.OWNER)}</MenuItem>
        <MenuItem value={UAC.Role.MAINTAINER}>{this.getAllowRoler(UAC.Role.MAINTAINER)}</MenuItem>
        <MenuItem value={UAC.Role.NOBODY}>{this.getAllowRoler(UAC.Role.NOBODY)}</MenuItem>
      </TextField>,
      <React.Fragment>
        <SquareIconButton label='label.ok' icon={plCheck} onClick={e => this.createProtectedBranchRule()} className={classes.ok} />
        <SquareIconButton label='label.cancel' icon={plClose} onClick={e => this.cancelForm()} className={classes.cancel} />
      </React.Fragment>
    ]
  }

  settingDefaultBranch () {
    const { currentRepositoryConfig } = this.props
    const { branch } = this.state
    if (!currentRepositoryConfig.repository || branch === currentRepositoryConfig.repository.defaultBranch) {
      return false
    }

    this.setState({ pending: true })
    RepositoryData.defaultBranch({
      repository: currentRepositoryConfig.repository.id,
      old: currentRepositoryConfig.repository.defaultBranch,
      branch: branch
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.updated' })
            , 0)
          )
          this.reloadRepositoryData()
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.updateFail' })
            , 2)
          )
        }
        this.setState({ pending: false })
      })
  }

  reloadRepositoryData () {
    RepositoryData.list()
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.repositoryList.update', data: data.data })
        }
      })

    RepositoryData.config({ rKey: this.props.currentRepositoryConfig.repository.id })
      .then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent({ type: 'data.currentRepositoryConfig.update', data: data.data })
        }
      })
  }

  cancelForm () {
    let { rules } = this.state
    if (rules && rules.length && rules[rules.length - 1] === 'create') {
      rules = rules.slice(0, rules.length - 1)
    }

    this.setState({
      rules: rules,
      updateRuleId: null,
      rule: '',
      rolePush: UAC.Role.OWNER,
      roleMerge: UAC.Role.OWNER,
      error: {}
    })
  }

  createRule () {
    const { rules } = this.state
    if (!rules.length || rules[rules.length - 1] !== 'create') {
      this.cancelForm()
      this.setState({ rules: [...rules, 'create'] })
    }
  }

  editRule (item) {
    this.cancelForm()
    this.setState({
      updateRuleId: item.id,
      rule: item.rule,
      rolePush: item.rolePush,
      roleMerge: item.roleMerge
    })
  }

  deleteConfirm (id, rule) {
    const { intl } = this.props
    this.cancelForm()
    this.props.dispatchEvent(EventGenerator.addComformation('delete_protected_branch_rule', {
      title: intl.formatMessage(
        { id: 'message.confirmDelete' },
        { s: intl.formatMessage({ id: 'label.rule' }) + ' \'' + rule + '\' ' }),
      description: '',
      reject: () => { return true },
      accept: () => {
        this.deleteRule(id, rule)
      }
    }))
  }

  createProtectedBranchRule () {
    const { currentRepositoryConfig, intl } = this.props
    const { rules, rule, rolePush, roleMerge, updateRuleId } = this.state

    if (!currentRepositoryConfig.repository || !this.checkInput()) {
      return false
    }

    const sameRule = rules.filter(FilterGenerator.rule(rule))
    if (sameRule.length > 0) {
      if (!updateRuleId || (updateRuleId && updateRuleId !== sameRule[0].id)) {
        this.setState({
          error: {
            rule: intl.formatMessage(
              { id: 'message.error._S_duplicate' },
              { s: intl.formatMessage({ id: 'label.rule' }) }
            )
          }
        })
        return false
      }
    }

    const requestData = {
      repository: currentRepositoryConfig.repository.id,
      rule: rule,
      rolePush: rolePush,
      roleMerge: roleMerge
    }

    this.setState({ pending: true })
    if (!updateRuleId) {
      RepositoryData.createProtectedBranchRule({
        ...requestData
      }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          if (!data.code) {
            this.props.dispatchEvent(EventGenerator.NewNotification(
              this.props.intl.formatMessage({ id: 'message.created' })
              , 0)
            )
            this.getData(this.props)
          } else {
            this.props.dispatchEvent(EventGenerator.NewNotification(
              this.props.intl.formatMessage({ id: 'message.error.createProtectedBrancheRuleFail' })
              , 2)
            )
          }
          this.setState({ pending: false })
        })
    } else {
      RepositoryData.updateProtectedBranchRule({
        ...requestData,
        id: updateRuleId
      }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
        .then((data) => {
          if (!data.code) {
            this.props.dispatchEvent(EventGenerator.NewNotification(
              this.props.intl.formatMessage({ id: 'message.updated' })
              , 0)
            )
            this.getData(this.props)
          } else {
            this.props.dispatchEvent(EventGenerator.NewNotification(
              this.props.intl.formatMessage({ id: 'message.error.updateFail' })
              , 2)
            )
          }
          this.setState({ pending: false })
        })
    }
  }

  deleteRule (id, rule) {
    const { currentRepositoryConfig } = this.props
    if (!currentRepositoryConfig.repository || !id || !rule) {
      return false
    }

    this.setState({ pending: true })
    RepositoryData.deleteProtectedBranchRule({
      repository: currentRepositoryConfig.repository.id,
      id: id,
      rule: rule
    }).then(NetworkHelper.withEventdispatcher(this.props.dispatchEvent)(NetworkHelper.getJSONData))
      .then((data) => {
        if (!data.code) {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.deleted' })
            , 0)
          )
          this.getData(this.props)
        } else {
          this.props.dispatchEvent(EventGenerator.NewNotification(
            this.props.intl.formatMessage({ id: 'message.error.deleteFail' })
            , 2)
          )
        }
        this.props.dispatchEvent(EventGenerator.cancelComformation())
        this.setState({ pending: false })
      })
  }

  render () {
    const { currentRepositoryConfig, classes, intl } = this.props
    const { pending, branch, rules } = this.state

    return (<Grid container>
      <Grid item xs={12}>
        <Typography variant='h6' component='div' className={classes.header}>{ intl.formatMessage({ id: 'label.branchSetting' }) }</Typography>
      </Grid>
      <Grid item xs={12} className={classes.border}>
        <Typography variant='subtitle1' component='div' className={classes.title}>{intl.formatMessage({ id: 'label.defaultBranch' })}</Typography>
        <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'message.defaultBranchDescription' })}</Typography>
        <Grid className={classes.content}>
          { currentRepositoryConfig.repository && <Grid container>
            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                variant='outlined'
                value={branch !== null ? branch : '0'}
                onChange={e => this.setState({ branch: e.target.value })}
              >
                {!currentRepositoryConfig.repository.defaultBranch && branch === null && <MenuItem value={0}>{intl.formatMessage({ id: 'message.settingDefaultBranch' })}</MenuItem>}
                {currentRepositoryConfig.branches.map((item, index) => {
                  return <MenuItem key={index} value={item.name}>{item.name}</MenuItem>
                })}
              </TextField>
            </Grid>
            <Grid item xs={9}>
              <Button
                variant='contained'
                color='primary'
                onClick={e => this.settingDefaultBranch()}
                className={classes.btn}
                disabled={pending}
              >
                {intl.formatMessage({ id: 'message.settingToDefaultBranch' })}
              </Button>
            </Grid>
          </Grid>
          }
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={8}>
            <Typography variant='subtitle1' component='div' className={classes.title}>{intl.formatMessage({ id: 'label.protectedBranch' })}</Typography>
            <Typography variant='body2' component='div'>{intl.formatMessage({ id: 'message.protectedBranchDescription' })}</Typography>
          </Grid>
          <Grid item xs={4} align='right'>
            <Button
              variant='contained'
              color='primary'
              onClick={e => this.createRule()}
              disabled={pending}
              className={classes.create}
            >
              {intl.formatMessage({ id: 'message.createProtectedBranchRule' })}
            </Button>
          </Grid>
          <Grid item xs={12} className={classes.table}>
            { rules !== null
              ? rules.length !== 0
                ? <TableList data={this.getTableData()} />
                : <EmptyListNotice imageName='branch-rules-empty.png' title={intl.formatMessage({ id: 'message.protectedBranchRuleEmpty' })} notice='' />
              : <Grid container spacing={2} className={classes.loading}>
                <CircularProgress />
              </Grid>
            }
          </Grid>
        </Grid>
      </Grid>
    </Grid>)
  }
}

RepositorySettingBranch.propTypes = {
  currentRepositoryConfig: PropTypes.object.isRequired,
  dispatchEvent: PropTypes.func.isRequired,
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
    dispatchEvent: (event) => { dispatch(event) }
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(RepositorySettingBranch)
    )
  )
)
