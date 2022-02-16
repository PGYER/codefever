const Events = [
  {
    event: 'hook:postReceive',
    title: 'label.pushEvent',
    checked: true
  },
  {
    event: 'repo:fork',
    title: 'label.forkRepository',
    checked: false
  },
  {
    event: 'repo:updateAvator',
    title: ['label.update_S_', 'label.repositoryAvatar'],
    checked: false
  },
  {
    event: 'repo:updateName',
    title: ['label.update_S_', 'label.repositoryName'],
    checked: false
  },
  {
    event: 'repo:updateDescription',
    title: ['label.update_S_', 'label.repositoryDescription'],
    checked: false
  },
  {
    event: 'repo:addMember',
    title: 'label.inviteMember',
    checked: false
  },
  {
    event: 'repo:changeMemberRole',
    title: 'label.changeMemberRole',
    checked: false
  },
  {
    event: 'repo:removeMember',
    title: 'label.removeMember',
    checked: false
  },
  {
    event: 'repo:changeOwner',
    title: ['label.update_S_', 'label.owner'],
    checked: false
  },
  {
    event: 'repo:changeURL',
    title: ['label.update_S_', 'label.repositoryURL'],
    checked: false
  },
  {
    event: 'repo:remove',
    title: 'label.deleteRepository',
    checked: false
  },
  {
    event: 'branch:create',
    title: 'label.newBranch',
    checked: false
  },
  {
    event: 'branch:remove',
    title: 'label.deleteBranch',
    checked: false
  },
  {
    event: 'branch:changeDefaultBranch',
    title: ['label.update_S_', 'label.defaultBranch'],
    checked: false
  },
  {
    event: 'branch:createProtectedBranchRule',
    title: 'label.createProtectedBranchRule',
    checked: false
  },
  {
    event: 'branch:changeProtectedBranchRule',
    title: 'label.changeProtectedBranchRule',
    checked: false
  },
  {
    event: 'branch:removeProtectedBranchRule',
    title: 'label.removeProtectedBranchRule',
    checked: false
  },
  {
    event: 'tag:create',
    title: 'label.newTag',
    checked: false
  },
  {
    event: 'tag:remove',
    title: 'label.deleteTag',
    checked: false
  },
  {
    event: 'mergeRequest:create',
    title: 'label.createMergeRequest',
    checked: false
  },
  {
    event: 'mergeRequest:close',
    title: 'label.closeMergeRequest',
    checked: false
  },
  {
    event: 'mergeRequest:merge',
    title: 'label.mergeRequest',
    checked: false
  },
  {
    event: 'mergeRequestReviewer:create',
    title: 'message.selectReviewer',
    checked: false
  },
  {
    event: 'mergeRequestReviewer:delete',
    title: 'message.deleteReviewer',
    checked: false
  },
  {
    event: 'mergeRequestReviewer:review',
    title: 'label.reviewReviewer',
    checked: false
  }
]

export default Events
