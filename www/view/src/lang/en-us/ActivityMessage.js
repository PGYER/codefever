const data = {
  createdGroup: 'Create A Group',
  updateGroup_S_Avator: 'Update Avatar Of Group {s}',
  updateGroup_S_Name: 'Update Name Of Group {s}',
  updateGroup_S_Description: 'Update Description Of Group {s}',

  addGroup_S_Memeber: 'Add New Member To Group {s}',
  changeGroup_S_MemebrRole: 'Update Role Of A Member In Group {s}',
  removeGroup_S_Memebr: 'Remove A Member In Group {s}',
  setGroup_S_Creator: 'Set A Member As Creator Of Group {s}',
  setGroup_S_URL: 'Change URL Of Group {s}',

  createdRepository: 'Create A Repository',
  deleteRepository: 'Delete A Repository',
  forkRepository: 'Frok And Create A Repository',
  updateRepository_S_Avator: 'Update Avatar Of Repository {s}',
  updateRepository_S_Name: 'Update Name Of Repository {s}',
  updateRepository_S_Description: 'Update Description Of Repository {s}',

  pushTo_S_Branch: 'Push Commits To Repository {s}',
  pushTo_S_NewBranch: 'Push Branches To Repository {s}',
  created_S_NewBranch: 'Add Branch In Repository {s}',
  delete_S_Branch: 'Delete Branche In Repository {s}',
  update_S_DefaultBranch: 'Modified The Default Branch Of Repository {s}',
  created_S_ProtectedBranchRule: 'Create Protection Branch Rule in Repository {s}',
  update_S_ProtectedBranchRule: 'Modified The Protection Branch Rule Of Repository {s}',
  delete_S_ProtectedBranchRule: 'Removed Protection Branch Rule For Repository {s}',

  pushTo_S_Tag: 'Push Commits To A Tag Of Repository {s}',
  pushTo_S_NewTag: 'Push Tags To Repository {s}',
  created_S_NewTag: 'Create A Tag In Repository {s}',
  delete_S_Tag: 'Delete A Tag In Repository {s}',

  addRepository_S_Memeber: 'Add A Member To Repository {s}',
  changeRepository_S_MemebrRole: 'Set Role To A Memebre In Repository {s}',
  removeRepository_S_Memebr: 'Remove Members in Repository {s}',
  setRepository_S_Creator: 'Set A Member As Creator Of Repository {s}',
  setRepository_S_URL: 'Change URL Of Repository {s}',

  open_S_MergeRquest: 'Open A Merge Request In Repository {s}',
  close_S_MergeRquest: 'Close A Merge Request In Repository {s}',
  merge_S_MergeRquest: 'Merged A Merge Request In Repository {s}',
  assign_S_Reviewer: 'Assign Reviewer In Repository {s}',
  delete_S_Reviewer: 'Delete Reviewer In Repository {s}',
  review_S_Reviewer: 'Approve Changes In Repository {s}'
}

export default { ...data, __namespace__: 'message.activity' }
