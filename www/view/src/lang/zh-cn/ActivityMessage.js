const data = {
  createdGroup: '创建仓库组',
  updateGroup_S_Avator: '更新了仓库组 {s} 的头像',
  updateGroup_S_Name: '更新了仓库组 {s} 的名称',
  updateGroup_S_Description: '更新了仓库组 {s} 的描述',

  addGroup_S_Memeber: '向仓库组 {s} 添加了成员',
  changeGroup_S_MemebrRole: '设置了仓库组 {s} 内成员角色',
  removeGroup_S_Memebr: '移除了仓库组 {s} 的成员',
  setGroup_S_Creator: '设置了仓库组 {s} 的创建者',
  setGroup_S_URL: '修改了仓库组 {s} 的访问地址',

  createdRepository: '创建仓库',
  deleteRepository: '删除仓库',
  forkRepository: 'fork 并创建仓库',
  updateRepository_S_Avator: '更新了仓库 {s} 的头像',
  updateRepository_S_Name: '更新了仓库 {s} 的名称',
  updateRepository_S_Description: '更新了仓库 {s} 的描述',

  pushTo_S_Branch: '推送提交到仓库 {s} 的分支',
  pushTo_S_NewBranch: '推送分支到仓库 {s}',
  created_S_NewBranch: '在仓库 {s} 创建新分支',
  delete_S_Branch: '在仓库 {s} 删除了分支',
  update_S_DefaultBranch: '修改了仓库 {s} 的默认分支',
  created_S_ProtectedBranchRule: '在仓库 {s} 创建保护分支规则',
  update_S_ProtectedBranchRule: '修改了仓库 {s} 的保护分支规则',
  delete_S_ProtectedBranchRule: '删除了仓库 {s} 的保护分支规则',

  pushTo_S_Tag: '推送提交到仓库 {s} 的标签',
  pushTo_S_NewTag: '推送标签到仓库 {s}',
  created_S_NewTag: '在仓库 {s} 创建新标签',
  delete_S_Tag: '在仓库 {s} 删除了标签',

  addRepository_S_Memeber: '向仓库 {s} 添加了成员',
  changeRepository_S_MemebrRole: '设置了仓库 {s} 内成员角色',
  removeRepository_S_Memebr: '移除了仓库 {s} 的成员',
  setRepository_S_Creator: '设置了仓库 {s} 的创建者',
  setRepository_S_URL: '修改了仓库 {s} 的访问地址',

  open_S_MergeRquest: '在仓库 {s} 打开合并请求',
  close_S_MergeRquest: '在仓库 {s} 关闭合并请求',
  merge_S_MergeRquest: '在仓库 {s} 合并请求',
  assign_S_Reviewer: '在仓库 {s} 指定评审员',
  delete_S_Reviewer: '在仓库 {s} 删除评审员',
  review_S_Reviewer: '在仓库 {s} 评审了代码',

  create_S_Webhook: '在仓库 {s} 创建了webhook',
  update_S_Webhook: '在仓库 {s} 更新了webhook',
  delete_S_Webhook: '在仓库 {s} 删除了webhook'
}

export default { ...data, __namespace__: 'message.activity' }
