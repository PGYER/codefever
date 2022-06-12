const Events = [
  {
    event: null,
    title: 'menu.file_pl',
    checked: false,
    divider: true
  },
  {
    event: 'hook:postReceive',
    title: 'label.pushEvent',
    checked: true,
    divider: false
  },
  {
    event: 'repo:fork',
    title: 'label.forkRepository',
    checked: false,
    divider: false
  },
  {
    event: 'branch:create',
    title: 'label.newBranch',
    checked: false,
    divider: false
  },
  {
    event: 'branch:remove',
    title: 'label.deleteBranch',
    checked: false,
    divider: false
  },
  {
    event: 'branch:changeDefaultBranch',
    title: ['label.update_S_', 'label.defaultBranch'],
    checked: false,
    divider: false
  },
  {
    event: 'tag:create',
    title: 'label.newTag',
    checked: false,
    divider: false
  },
  {
    event: 'tag:remove',
    title: 'label.deleteTag',
    checked: false,
    divider: false
  },
  {
    event: 'mergeRequest:create',
    title: 'label.createMergeRequest',
    checked: false,
    divider: false
  },
  {
    event: 'mergeRequest:close',
    title: 'label.closeMergeRequest',
    checked: false,
    divider: false
  },
  {
    event: 'mergeRequest:merge',
    title: 'label.mergeRequest',
    checked: false,
    divider: false
  },
  {
    event: 'mergeRequestReviewer:create',
    title: 'message.selectReviewer',
    checked: false,
    divider: false
  },
  {
    event: 'mergeRequestReviewer:delete',
    title: 'message.deleteReviewer',
    checked: false,
    divider: false
  },
  {
    event: 'mergeRequestReviewer:review',
    title: 'label.reviewReviewer',
    checked: false,
    divider: false
  },
  {
    event: null,
    title: 'label.member_pl',
    checked: false,
    divider: true
  },
  {
    event: 'repo:addMember',
    title: 'label.inviteMember',
    checked: false,
    divider: false
  },
  {
    event: 'repo:changeMemberRole',
    title: 'label.changeMemberRole',
    checked: false,
    divider: false
  },
  {
    event: 'repo:removeMember',
    title: 'label.removeMember',
    checked: false,
    divider: false
  },
  {
    event: null,
    title: 'menu.setting_pl',
    checked: false,
    divider: true
  },
  {
    event: 'repo:updateAvator',
    title: ['label.update_S_', 'label.repositoryAvatar'],
    checked: false,
    divider: false
  },
  {
    event: 'repo:updateName',
    title: ['label.update_S_', 'label.repositoryName'],
    checked: false,
    divider: false
  },
  {
    event: 'repo:updateDescription',
    title: ['label.update_S_', 'label.repositoryDescription'],
    checked: false,
    divider: false
  },
  {
    event: 'repo:changeOwner',
    title: ['label.update_S_', 'label.owner'],
    checked: false,
    divider: false
  },
  {
    event: 'repo:changeURL',
    title: ['label.update_S_', 'label.repositoryURL'],
    checked: false,
    divider: false
  },
  {
    event: 'repo:remove',
    title: 'label.deleteRepository',
    checked: false,
    divider: false
  },
  {
    event: 'branch:createProtectedBranchRule',
    title: 'label.createProtectedBranchRule',
    checked: false,
    divider: false
  },
  {
    event: 'branch:changeProtectedBranchRule',
    title: 'label.changeProtectedBranchRule',
    checked: false,
    divider: false
  },
  {
    event: 'branch:removeProtectedBranchRule',
    title: 'label.removeProtectedBranchRule',
    checked: false,
    divider: false
  }
]

export default Events
