// core
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { injectIntl } from 'react-intl'

// components
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { plMerge, psConfirm } from '@pgyer/icons'
import MergeRequestReviewers from 'APPSRC/components/unit/MergeRequestReviewers'
import FormattedTime from 'APPSRC/components/unit/FormattedTime'
import InlineMarker from 'APPSRC/components/unit/InlineMarker'
import SmartLink from 'APPSRC/components/unit/SmartLink'
import Constants from 'APPSRC/config/Constants'

// helpers
import { makeLink, getUserInfo } from 'APPSRC/helpers/VaribleHelper'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'

// style
const styles = theme => ({
  item: {
    padding: theme.spacing(1.5) + 'px ' + theme.spacing(3) + 'px',
    borderTop: '1px solid ' + theme.palette.border
  },
  oneline: {
    lineHeight: theme.spacing(3.5) + 'px'
  },
  title: {
    '& a': {
      color: theme.palette.text.main + ' !important',
      fontWeight: 600
    }
  },
  textMain: {
    '& a': {
      color: theme.palette.text.main + ' !important'
    }
  },
  reviewers: {
    marginBottom: theme.spacing(0.5)
  }
})

class MergeRequestItem extends React.Component {
  constructor (props) {
    super(props)
    this.dataDeal()
  }

  dataDeal () {
    const { data, repositoryList, history } = this.props
    if (!data && !repositoryList.length) {
      return false
    }

    const targetRepository = repositoryList.filter(FilterGenerator.id(data.targetRepository))
    if (targetRepository.length) {
      const repoData = targetRepository[0]
      data.targetRepository = repoData
      const targetLink = makeLink(repoData.group.name, repoData.name, 'commits', encodeURIComponent(data.targetBranch))
      data.targetLink = <SmartLink to={targetLink} onClick={e => history.push(targetLink)}>{data.targetBranch}</SmartLink>
      const titleLink = makeLink(repoData.group.name, repoData.name, 'mergerequests', data.number)
      data.titleLink = <SmartLink to={titleLink} onClick={e => history.push(titleLink)}>{data.title}</SmartLink>
    } else {
      data.targetLink = data.targetBranch
      data.titleLink = data.targetBranch
    }

    const sourceRepository = repositoryList.filter(FilterGenerator.id(data.sourceRepository))
    if (sourceRepository.length) {
      const repoData = sourceRepository[0]
      data.sourceRepository = repoData
      const sourceLink = makeLink(repoData.group.name, repoData.name, 'commits', encodeURIComponent(data.sourceBranch))
      data.sourceLink = <SmartLink to={sourceLink} onClick={e => history.push(sourceLink)}>{data.sourceBranch}</SmartLink>

      data.updater = getUserInfo(repoData.members, data.commit.email).name
    } else {
      data.sourceLink = data.sourceBranch
      if (targetRepository.length) {
        const repoData = targetRepository[0]
        data.updater = getUserInfo(repoData.members, data.commit.email).name
      } else {
        data.updater = data.commit.email
      }
    }
  }

  render () {
    const { isRepository, data, classes, intl } = this.props
    const mergeRequestStatus = Constants.mergeRequestStatus

    return (<Grid container justifyContent='space-between' alignItems='center' className={classes.item}>
      <Grid item>
        <Typography variant='body1' component='div' className={[classes.oneline, classes.title].join((' '))}>
          {data.titleLink}&nbsp;&nbsp;&nbsp;&nbsp;
          {data.status === mergeRequestStatus.merged && <InlineMarker color='success' icon={psConfirm} text={intl.formatMessage({ id: 'message.merged' })} />}
          {data.status === mergeRequestStatus.closed && <InlineMarker color='error' icon={faTimesCircle} text={intl.formatMessage({ id: 'message.closed' })} />}
        </Typography>
        <Typography variant='body2' component='div' className={classes.oneline}>
          <Typography component='span'>{!isRepository && data.targetRepository.name}</Typography>
          <Typography component='span'>!{data.number}</Typography>&nbsp;·&nbsp;
          <Typography component='span' className={classes.textMain}>
            <FontAwesomeIcon icon={plMerge} />&nbsp;
            {data.sourceLink}&nbsp;
            <FontAwesomeIcon icon={faArrowRight} />&nbsp;
            {data.targetLink}
          </Typography>&nbsp;·&nbsp;
          <Typography variant='body2' component='span'>
            {data.updater}&nbsp;&nbsp;
            {intl.formatMessage({ id: 'label.editIn' })}:&nbsp;&nbsp;
            <FormattedTime timestamp={data.commit.time * 1} />
          </Typography>
        </Typography>
      </Grid>
      <Grid item>
        <Grid item className={classes.reviewers}>
          {data.reviewers.length > 0
            ? <MergeRequestReviewers reviewers={data.reviewers} repositoryInfo={data.targetRepository} />
            : <Grid item>&nbsp;</Grid>
          }
        </Grid>
        <Typography variant='body2' component='div'>
          {intl.formatMessage({ id: 'label.updateTime' })}:&nbsp;&nbsp;
          <FormattedTime timestamp={data.update * 1} />
        </Typography>
      </Grid>
    </Grid>
    )
  }
}

MergeRequestItem.propTypes = {
  repositoryList: PropTypes.array.isRequired,
  isRepository: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default injectIntl(
  withStyles(styles)(
    withRouter(
      connect(mapStateToProps, mapDispatchToProps)(MergeRequestItem)
    )
  )
)
