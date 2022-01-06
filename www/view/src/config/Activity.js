import React from 'react'
import { Link } from 'react-router-dom'
import FilterGenerator from 'APPSRC/helpers/FilterGenerator'
import { makeLink } from 'APPSRC/helpers/VaribleHelper'

function parser (config) {
  const code = config.item.type
  let members = []
  let user = {}

  if (config.currentGroupConfig.group) {
    members = config.currentGroupConfig.members
  } else if (config.currentRepositoryConfig.repository) {
    members = config.currentRepositoryConfig.members
  }

  user = members.filter(FilterGenerator.id(config.item.creator))[0]
  config.relatedGroup = config.groupList.filter(FilterGenerator.id(config.item.group))[0]
  config.relatedRepository = config.repositoryList.filter(FilterGenerator.id(config.item.repository))[0]

  if (!user) {
    user = {
      icon: null,
      id: config.item.creator,
      name: 'userID_' + config.item.creator.slice(0, 8)
    }
  }

  if (!config.relatedGroup) {
    config.relatedGroup = {
      id: config.item.group,
      displayName: 'groupID_' + config.item.group.slice(0, 8),
      name: null
    }
  }

  if (!config.relatedRepository) {
    config.relatedRepository = {
      id: config.item.repository,
      displayName: 'repositoryID_' + config.item.repository.slice(0, 8),
      name: null,
      group: config.relatedGroup
    }
  }

  if (code === 0x0201) {
    // group create
    const detail = config.relatedGroup.name
      ? <Link to={makeLink('groups', config.relatedGroup.name)}>
        {config.relatedGroup.displayName}
      </Link>
      : config.item.content.name

    return { user, action: config.formatter({ id: 'message.activity.createdGroup' }), detail }
  } else if (code === 0x0202) {
    // update group avatar
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.updateGroup_S_Avator' },
        { s: config.relatedGroup.displayName }
      ),
      detail: ''
    }
  } else if (code === 0x0203) {
    // update repository name
    const detail = <React.Fragment>
      { config.formatter(
        { id: 'label.updateFrom_S1_To_S2' },
        { s1: config.item.content.from, s2: config.item.content.to }
      ) }
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.updateGroup_S_Name' },
        { s: config.relatedGroup.displayName }
      ),
      detail
    }
  } else if (code === 0x0204) {
    // update repository description
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.updateGroup_S_Description' },
        { s: config.relatedGroup.displayName }
      ),
      detail: ''
    }
  } else if (code === 0x0205) {
    // add a new member
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.addGroup_S_Memeber' },
        { s: config.relatedGroup.displayName }
      ),
      detail: memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')
    }
  } else if (code === 0x0206) {
    // add a new member
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]
    const roleName = config.formatter({ id: 'label.roleID_' + config.item.content.to })

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.changeGroup_S_MemebrRole' },
        { s: config.relatedGroup.displayName }
      ),
      detail: (memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')) + ': ' + roleName
    }
  } else if (code === 0x0207) {
    // remove a member
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.removeGroup_S_Memebr' },
        { s: config.relatedGroup.displayName }
      ),
      detail: memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')
    }
  } else if (code === 0x0208) {
    // set a member as creator
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.setGroup_S_Creator' },
        { s: config.relatedGroup.displayName }
      ),
      detail: memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')
    }
  } else if (code === 0x0209) {
    // change group url
    const detail = <React.Fragment>
      { config.formatter(
        { id: 'label.updateFrom_S1_To_S2' },
        {
          s1: makeLink('groups', config.item.content.from),
          s2: makeLink('groups', config.item.content.to)
        }
      ) }
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.setGroup_S_URL' },
        { s: config.relatedGroup.displayName }
      ),
      detail
    }
  } else if (code === 0x0301) {
    // create repository
    const detail = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name)}>
        {config.relatedGroup.displayName}/{config.relatedRepository.displayName}
      </Link>
      : config.item.content.name

    return { user, action: config.formatter({ id: 'message.activity.createdRepository' }), detail }
  } else if (code === 0x0302) {
    // create repository via fork
    const repositoryLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name)}>
        {config.relatedGroup.displayName}/{config.relatedRepository.displayName}
      </Link>
      : config.item.content.name

    const detail = <React.Fragment>
      {repositoryLink} {config.formatter({ id: 'label.forkFrom_S' }, { s: config.item.content.sourceName })}
    </React.Fragment>

    return { user, action: config.formatter({ id: 'message.activity.forkRepository' }), detail }
  } else if (code === 0x0303) {
    // update repository avatar
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.updateRepository_S_Avator' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: ''
    }
  } else if (code === 0x0304) {
    // update repository name
    const detail = <React.Fragment>
      { config.formatter(
        { id: 'label.updateFrom_S1_To_S2' },
        { s1: config.item.content.from, s2: config.item.content.to }
      ) }
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.updateRepository_S_Name' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0305) {
    // update repository description
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.updateRepository_S_Description' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: ''
    }
  } else if (code === 0x0306) {
    // add a new member
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.addRepository_S_Memeber' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')
    }
  } else if (code === 0x0307) {
    // add a new member
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]
    const roleName = config.formatter({ id: 'label.roleID_' + config.item.content.to })

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.changeRepository_S_MemebrRole' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: (memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')) + ': ' + roleName
    }
  } else if (code === 0x0308) {
    // remove a member
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.removeRepository_S_Memebr' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')
    }
  } else if (code === 0x0309) {
    // set a member as creator
    const memberInfo = members.filter(FilterGenerator.id(config.item.content.uid))[0]

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.setRepository_S_Creator' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: memberInfo ? (memberInfo.name + ' <' + memberInfo.email + '>') : (config.item.content.name + ' <' + config.item.content.email + '>')
    }
  } else if (code === 0x030A) {
    // change repository url
    const detail = <React.Fragment>
      { config.formatter(
        { id: 'label.updateFrom_S1_To_S2' },
        {
          s1: makeLink(config.relatedGroup.name, config.item.content.from),
          s2: makeLink(config.relatedGroup.name, config.item.content.to)
        }
      ) }
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.setRepository_S_URL' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x030B) {
    // delete repository
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.deleteRepository' }
      ),
      detail: config.item.content.name
    }
  } else if (code === 0x0401) {
    // push to branch
    const branchLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', config.item.content.name)}>
        { config.item.content.name }
      </Link>
      : config.item.content.name

    const startHash = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'commit', config.item.content.from.slice(0, 8))}>
        { config.item.content.from.slice(0, 8) }
      </Link>
      : config.item.content.from.slice(0, 8)

    const endHash = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'commit', config.item.content.to.slice(0, 8))}>
        { config.item.content.to.slice(0, 8) }
      </Link>
      : config.item.content.to.slice(0, 8)

    const detail = <React.Fragment>
      {startHash} .. {endHash} -&gt; {branchLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.pushTo_S_Branch' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0402) {
    // push to new branch
    const branchLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', config.item.content.name)}>
        { config.item.content.name }
      </Link>
      : config.item.content.name

    const endHash = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'commit', config.item.content.to.slice(0, 8))}>
        { config.item.content.to.slice(0, 8) }
      </Link>
      : config.item.content.to.slice(0, 8)

    const detail = <React.Fragment>
      {endHash} -&gt; {branchLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.pushTo_S_NewBranch' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0403) {
    // create new branch
    const branchLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', encodeURIComponent(config.item.content.name), '')}>
        { config.item.content.name }
      </Link>
      : config.item.content.name

    const detail = <React.Fragment>
      {config.formatter({ id: 'label.newBranch' })} {branchLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.created_S_NewBranch' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0404) {
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.delete_S_Branch' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: config.formatter({ id: 'label.deleteBranch' }) + ' ' + config.item.content.name
    }
  } else if (code === 0x0405) {
    // update default branch
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.update_S_DefaultBranch' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: <React.Fragment>
        {config.formatter({ id: 'message.updateDefaultBranch' })}&nbsp;
        {config.item.content.from && <React.Fragment>
          <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', encodeURIComponent(config.item.content.from))}>
            { config.item.content.from }
          </Link> -&gt;&nbsp;
        </React.Fragment>
        }
        <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', encodeURIComponent(config.item.content.to))}>
          { config.item.content.to }
        </Link>
      </React.Fragment>
    }
  } else if (code === 0x0406) {
    // create protected branch rule
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.created_S_ProtectedBranchRule' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: <React.Fragment>
        {config.formatter({ id: 'message.createProtectedBranchRule' })}&nbsp;
        <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'settings/branch')}>
          {config.item.content.name}
        </Link>
      </React.Fragment>
    }
  } else if (code === 0x0407) {
    // update protected branch rule
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.update_S_ProtectedBranchRule' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: <React.Fragment>
        {config.formatter({ id: 'message.updateProtectedBranchRule' })}&nbsp;
        <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'settings/branch')}>
          {config.item.content.name}
        </Link>
      </React.Fragment>
    }
  } else if (code === 0x0408) {
    // delete protected branch rule
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.delete_S_ProtectedBranchRule' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: <React.Fragment>
        {config.formatter({ id: 'message.deleteProtectedBranchRule' })}&nbsp;
        {config.item.content.name}
      </React.Fragment>
    }
  } else if (code === 0x0501) {
    // push to a tag
    const tagLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', config.item.content.name)}>
        { config.item.content.name }
      </Link>
      : config.item.content.name

    const startHash = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'commit', config.item.content.from.slice(0, 8))}>
        { config.item.content.from.slice(0, 8) }
      </Link>
      : config.item.content.from.slice(0, 8)

    const endHash = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'commit', config.item.content.to.slice(0, 8))}>
        { config.item.content.to.slice(0, 8) }
      </Link>
      : config.item.content.to.slice(0, 8)

    const detail = <React.Fragment>
      {startHash} .. {endHash} -&gt; {tagLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.pushTo_S_Tag' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0502) {
    // push to a new tag
    const tagLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', config.item.content.name)}>
        { config.item.content.name }
      </Link>
      : config.item.content.name

    const endHash = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'commit', config.item.content.to.slice(0, 8))}>
        { config.item.content.to.slice(0, 8) }
      </Link>
      : config.item.content.to.slice(0, 8)

    const detail = <React.Fragment>
      {endHash} -&gt; {tagLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.pushTo_S_NewTag' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0503) {
    // create a new tag
    const tagLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'files', config.item.content.name, '')}>
        { config.item.content.name }
      </Link>
      : config.item.content.name

    const detail = <React.Fragment>
      {config.formatter({ id: 'label.newTag' })} {tagLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.created_S_NewTag' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail
    }
  } else if (code === 0x0504) {
    return {
      user,
      action: config.formatter(
        { id: 'message.activity.delete_S_Tag' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: config.formatter({ id: 'label.deleteTag' }) + ' ' + config.item.content.name
    }
  } else if (code === 0x0701) {
    const mergeRequestLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'mergerequests', config.item.content.id)}>
        !{ config.item.content.id }
      </Link>
      : config.item.content.id

    const detail = <React.Fragment>
      {config.formatter({ id: 'label.openMergeRequest' })} {mergeRequestLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.open_S_MergeRquest' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: detail
    }
  } else if (code === 0x0702) {
    const mergeRequestLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'mergerequests', config.item.content.id)}>
        !{ config.item.content.id }
      </Link>
      : config.item.content.id

    const detail = <React.Fragment>
      {config.formatter({ id: 'label.closeMergeRequest' })} {mergeRequestLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.close_S_MergeRquest' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: detail
    }
  } else if (code === 0x0703) {
    const mergeRequestLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'mergerequests', config.item.content.id)}>
        !{ config.item.content.id }
      </Link>
      : config.item.content.id

    const detail = <React.Fragment>
      {config.formatter({ id: 'label.mergeRequest' })} {mergeRequestLink}
    </React.Fragment>

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.merge_S_MergeRquest' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: detail
    }
  } else if (code === 0x0704) {
    const reviewer = members.filter(FilterGenerator.id(config.item.content.reviewer))[0]
    const mergeRequestLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'mergerequests', config.item.content.id)}>
        !{ config.item.content.id }
      </Link>
      : config.item.content.id

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.assign_S_Reviewer' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: config.formatter({ id: 'message.assign_N_M_Reviewer' }, { n: reviewer.name, m: mergeRequestLink })
    }
  } else if (code === 0x0705) {
    const reviewer = members.filter(FilterGenerator.id(config.item.content.reviewer))[0]
    const mergeRequestLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'mergerequests', config.item.content.id)}>
        !{ config.item.content.id }
      </Link>
      : config.item.content.id

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.delete_S_Reviewer' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: config.formatter({ id: 'message.delete_M_N_Reviewer' }, { n: reviewer.name, m: mergeRequestLink })
    }
  } else if (code === 0x0706) {
    const mergeRequestLink = config.relatedRepository.name && config.relatedGroup.name
      ? <Link to={makeLink(config.relatedGroup.name, config.relatedRepository.name, 'mergerequests', config.item.content.id)}>
        !{ config.item.content.id }
      </Link>
      : config.item.content.id

    return {
      user,
      action: config.formatter(
        { id: 'message.activity.review_S_Reviewer' },
        { s: config.relatedGroup.displayName + '/' + config.relatedRepository.displayName }
      ),
      detail: config.formatter({ id: 'message.review_M_Reviewer' }, { m: mergeRequestLink })
    }
  }

  return {
    user,
    action: '',
    detail: ''
  }
}

export default { parser }
