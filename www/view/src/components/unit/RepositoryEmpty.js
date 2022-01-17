// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import { plCopy } from '@pgyer/icons'

// helpers
import { copyToClipboard } from 'APPSRC/helpers/VaribleHelper'

// style
const styles = theme => ({
  setup: {
    padding: theme.spacing(3) + 'px',
    borderRadius: '4px 4px 0px 0px',
    border: '1px solid ' + theme.palette.border
  },
  noBorder: {
    borderTop: 0,
    borderRadius: '0px 0px 4px 4px'
  },
  code: {
    position: 'relative',
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5) + 'px',
    borderRadius: theme.spacing(0.5) + 'px',
    background: theme.palette.background.main
  },
  icon: {
    top: theme.spacing(1.5) + 'px',
    right: theme.spacing(1.5) + 'px',
    position: 'absolute'
  }
})

class RepositoryEmpty extends React.Component {
  render () {
    const { currentRepositoryConfig, currentUserInfo, classes, intl } = this.props
    const createCode = [
      'echo "# ' + currentRepositoryConfig.repository.name + '" >> README.md',
      'git init',
      'git add README.md',
      'git commit -m "first commit"',
      'git branch -M main',
      'git remote add origin ' + currentUserInfo.host + currentRepositoryConfig.group.name + '/' + currentRepositoryConfig.repository.name + '.git',
      'git push -u origin main'
    ]
    const pushCode = [
      'git remote add origin ' + currentUserInfo.host + currentRepositoryConfig.group.name + '/' + currentRepositoryConfig.repository.name + '.git',
      'git branch -M main',
      'git push -u origin main'
    ]

    return <Grid item xs={12}>
      <Grid className={classes.setup}>
        <Typography variant='h1' component='div'>{intl.formatMessage({ id: 'message.createNewRepository' })}</Typography>
        <Grid className={classes.code}>
          <SquareIconButton className={classes.icon} label='label.copy' onClick={e => copyToClipboard(createCode.join('\n'))} icon={plCopy} />
          {createCode.map((item, index) => <Typography key={index} variant='body1' component='div'><code>{item}</code></Typography>)}
        </Grid>
      </Grid>
      <Grid className={[classes.setup, classes.noBorder].join(' ')}>
        <Typography variant='h1' component='div'>{intl.formatMessage({ id: 'message.pushRepository' })}</Typography>
        <Grid className={classes.code}>
          <SquareIconButton className={classes.icon} label='label.copy' onClick={e => copyToClipboard(pushCode.join('\n'))} icon={plCopy} />
          {pushCode.map((item, index) => <Typography key={index} variant='body1' component='div'><code>{item}</code></Typography>)}
        </Grid>
      </Grid>
    </Grid>
  }
}

RepositoryEmpty.propTypes = {
  currentRepositoryConfig: PropTypes.object.isRequired,
  currentUserInfo: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRepositoryConfig: state.DataStore.currentRepositoryConfig,
    currentUserInfo: state.DataStore.currentUserInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(RepositoryEmpty)
  )
)
