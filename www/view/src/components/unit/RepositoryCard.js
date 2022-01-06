// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// components
import { withStyles, withTheme } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faSquare, faBox } from '@fortawesome/free-solid-svg-icons'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'
import { injectIntl } from 'react-intl'

// style
const styles = theme => ({
  card: {
    minWidth: 250,
    cursor: 'pointer',
    background: 'linear-gradient(to bottom, #fff 95%,' + theme.palette.primary.main + ' 95%)',
    transition: theme.transitions.create(['transform', 'box-shadow'], { duration: 100, easing: 'ease-in-out' }),
    transform: 'scale(1, 1)',
    '&:hover': {
      transform: 'scale(1.03, 1.03)',
      boxShadow: '0px 4px 5px 0px rgba(92, 92, 92, 0.28)'
    }
  },
  content: {
    padding: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(5)
  },
  cardNewApp: {
    minWidth: 250,
    cursor: 'pointer',
    // background: theme.palette.grey[200],
    background: '#e9e9e9',
    boxShadow: 'none',
    '&:hover': {
      background: '#efefef'
      // background: theme.palette.grey[100]
    }
  },
  cardNewAppIcon: {
    textAlign: 'center',
    color: theme.palette.grey[400],
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  cardNewAppText: {
    textAlign: 'center'
  }
})

class RepositoryCard extends Component {
  render () {
    const { classes, theme, history, repositoryInfo, currentGroupConfig, type, intl } = this.props

    return (
      type === 'item'
        ? <Card
          className={classes.card}
          onClick={() => { history.push(makeLink(repositoryInfo.group.name, repositoryInfo.name)) }}
        >
          <CardContent className={classes.content} style={{ paddingBottom: theme.spacing(2) }} component='div'>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Typography className={classes.title} variant='subtitle1' component='h1'>
                  <FontAwesomeIcon icon={faBox} /> &nbsp;
                  {repositoryInfo.group.displayName + '/' + repositoryInfo.displayName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body2' component='span'>
                  <FontAwesomeIcon icon={faSquare} className={classes.listIcon} />
                  &nbsp; {repositoryInfo.forkCount} { intl.formatMessage({ id: 'label.fork' }) } &nbsp;&nbsp;
                  <FontAwesomeIcon icon={faSquare} className={classes.listIcon} />
                  &nbsp; {repositoryInfo.mergeRequestCount.open} { intl.formatMessage({ id: 'label.mergeRequest' }) }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        : <Card
          className={classes.cardNewApp}
          onClick={() => {
            currentGroupConfig && currentGroupConfig.group
              ? history.push('/groups/' + currentGroupConfig.group.name + '/repositories/new')
              : history.push('/repositories/new')
          }}
        >
          <CardContent className={classes.content} style={{ paddingBottom: theme.spacing(2) }} component='div'>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Typography className={classes.cardNewAppIcon} variant='h3' component='h1'>
                  <FontAwesomeIcon icon={faPlusCircle} />
                </Typography>
                <Typography className={classes.cardNewAppText} variant='body2' component='div'>
                  { intl.formatMessage({ id: 'label.newRepository' }) }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
    )
  }
}

RepositoryCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  type: PropTypes.string,
  repositoryInfo: PropTypes.object,
  currentGroupConfig: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentGroupConfig: state.DataStore.currentGroupConfig
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(RepositoryCard)
      )
    )
  )
)
