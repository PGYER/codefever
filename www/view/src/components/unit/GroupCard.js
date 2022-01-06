// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { plRepository, plMember, plSetting } from '@pgyer/icons'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import SquareIconButton from 'APPSRC/components/unit/SquareIconButton'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import Constants from 'APPSRC/config/Constants'
import UAC from 'APPSRC/config/UAC'

// style
const styles = theme => ({
  card: {
    cursor: 'pointer',
    transition: theme.transitions.create('box-shadow'),
    boxShadow: theme.boxShadow.card,
    '&:hover': {
      boxShadow: theme.boxShadow.cardHover
    }
  },
  content: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2)
  },
  icon: {
    width: theme.spacing(6),
    height: theme.spacing(6)
  },
  title: {
    maxWidth: theme.spacing(16),
    overflow: 'hidden'
  },
  ownerMarker: {
    lineHeight: theme.spacing(3) + 'px'
  },
  description: {
    height: theme.spacing(1.5),
    lineHeight: theme.spacing(1.5) + 'px'
  },
  avatar: {
    marginRight: theme.spacing(1),
    width: theme.spacing(3),
    height: theme.spacing(3)
  }
})

class GroupCard extends Component {
  render () {
    const { classes, theme, history, groupInfo, repositoryList, intl } = this.props
    return <Card
      className={classes.card}
      onClick={() => { history.push(makeLink('groups', groupInfo.name)) }}
    >
      <CardContent className={classes.content} style={{ paddingBottom: theme.spacing(2) }} component='div'>
        <Grid container spacing={2} justifyContent='space-between'>
          <Grid item>
            <Grid container spacing={3} className='width-auto'>
              <Grid item>
                { groupInfo.icon
                  ? <Avatar variant='square' className={classes.icon} src={Constants.HOSTS.STATIC_AVATAR_PREFIX + groupInfo.icon} />
                  : <Avatar variant='square' className={classes.icon}>{groupInfo.name.substr(0, 1).toUpperCase()}</Avatar>
                }
              </Grid>
              <Grid item className={classes.title}>
                <Typography variant='subtitle1' component='div' className={'text-overflow'}>
                  {groupInfo.displayName}
                </Typography>
                <Typography variant='body1' className={classes.ownerMarker}>
                  <InlineMarker color={groupInfo.role === UAC.Role.OWNER ? 'containedInfo' : 'info'} text={intl.formatMessage({ id: 'label.roleID_' + groupInfo.role })} />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <SquareIconButton
              label='label.setting'
              icon={plSetting}
              onClick={(ev) => {
                ev.stopPropagation()
                history.push(makeLink('groups', groupInfo.name, 'settings'))
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant='caption' component='div' className={[classes.description, 'text-overflow'].join(' ')}>
              { groupInfo.description || '...' }
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body2' component='span'>
              <FontAwesomeIcon icon={plRepository} className={classes.listIcon} /> &nbsp;
              { repositoryList.filter(FilterGenerator.group(groupInfo.id)).length } &nbsp;&nbsp;&nbsp;&nbsp;
              <FontAwesomeIcon icon={plMember} className={classes.listIcon} /> &nbsp;
              { groupInfo.members.length }
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid container item xs={12}>
            { groupInfo.members.map((item, key) => {
              return item.icon
                ? <Avatar key={key} className={classes.avatar} src={Constants.HOSTS.PGYER_AVATAR_HOST + item.icon} />
                : <Avatar key={key} className={classes.avatar}>{item.name.substr(0, 1).toUpperCase()}</Avatar>
            }) }
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  }
}

GroupCard.propTypes = {
  intl: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  groupInfo: PropTypes.object,
  repositoryList: PropTypes.array.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    repositoryList: state.DataStore.repositoryList
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(GroupCard)
      )
    )
  )
)
