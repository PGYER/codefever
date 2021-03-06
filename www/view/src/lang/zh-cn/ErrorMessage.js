const data = {
  _S_empty: '请输入{s}',
  _S_retype: '请再次输入{s}',
  _S_has_illegal_character: '{s}含有非法字符(只支持字母、数字、下划线(_)、中划线(-)和点(.)的组合)',
  _S_notChoose: '请选择{s}',
  _S_duplicate: '{s}重复',
  _S_invalid: '{s}不正确',
  _S_notFound: '没有找到此{s}',
  noMoreThan_N_characters: '不能超过{n}个字符',
  within_N1_to_N2_characters: '需要在{n1}至{n2}个字符之间',
  only_N1_or_N2_characters: '只能包含{n1}或{n2}个字符',
  requireCombinationOfCharactersNumbersAndUnderscore: '只能是字母、数字和下划线的组合',
  input_S_placeholder: '请输入{s}，只支持字母、数字、下划线(_)、中划线(-)和点(.)的组合',
  inputNotSame: '两次输入不一致',
  inputSame: '两次输入一致',
  canNotAddCreatorAsMember: '创建者不能当作成员添加',

  createRepositoryFail: '创建仓库失败，请稍后重试',
  createGroupFail: '创建仓库组失败，请稍后重试',
  createBranchFail: '创建分支失败，请稍后重试',
  createTagFail: '创建标签失败，请稍后重试',
  createMergeRequestFail: '创建合并请求失败，请稍后重试',
  createProtectedBrancheRuleFail: '创建保护分支规则失败，请稍后重试',
  AddFail: '添加失败，请稍后重试',
  updateFail: '更新失败，请稍后重试',
  removeFail: '移除失败，请稍后重试',
  deleteFail: '删除失败，请稍后重试',
  verifyFail: '验证失败，请稍后重试',
  forkRepositoryFail: 'Fork仓库失败，请稍后重试',
  getFileFail: '获取完整文件失败，请稍后重试',
  getEmailCodeFail: '获取邮箱验证码失败，请稍后重试',
  getPhoneCodeFail: '获取手机验证码失败，请稍后重试',
  change_S_Fail: '修改{s}失败，请稍后重试',
  waitToRetry: '网络错误，请稍后重试',

  canNotChangeOwnerOfUserGroup: '不能更改个人默认仓库组的创建者',
  canNotDeleteUserGroup: '不能删除个人默认仓库组',
  canNotDeleteNonEmptyGroup: '仓库组内含有未删除的仓库, 请手动删除组内仓库后再试',
  mergeRequestExists: '存在已打开的合并请求',
  mergeFail: '合并失败，请稍后再试',
  reviewedCanNotAssign: '不能替换评审过的评审员',
  reviewedCanNotDelete: '不能删除评审过的评审员',
  branchProteced: '不能在保护分支上合并',
  userNotReview: '不能合并，还有评审员未评审',

  inputNewEmail: '请输入新的邮箱',
  bindEmailFirst: '你需要绑定邮箱才可以绑定第三方平台',
  wechatHasbound: '该微信号已经被绑定，请扫码登录后解绑重试',
  sshKeyDuplicate: '此 SSH Key 已经添加, 或在其他用户中'
}

export default { ...data, __namespace__: 'message.error' }
