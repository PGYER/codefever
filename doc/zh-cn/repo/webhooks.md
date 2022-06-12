# Webhook

当某个第三方系统需要由 `CodeFever` 的某个动作来触发的时候, 可以使用 `Webhook` 来完成触发数据源的角色。

通过一下步骤即可进入到 `Webhook 列表` 页面:

- 进入 `仓库主页`
- 在左侧菜单选择 `设置`
- 选择 `Webhooks` 即可进入 `Webhook 列表` 页面


### 创建 Webhook

首先需要创建 `Webhook` ，创建过程如下:

1. 进入 `Webhook 列表` 页面
1. 在页面右上角 点击 `创建 Webhook` 按钮
1. 按照要求填写 `URL`、`校验秘钥`、`触发事件` 后点击 `创建` 按钮即可

> 第三步骤选项如何填写请参照 [配置项](#配置项) 章节


### 配置项

`Webhook` 在创建过程中有配置项选项。需要进行详细的配置：

- `URL`: 用于接收 Webhook 通知的的 URL
- `数据格式`: 目前仅支持 `application/json` 方式。事件信息会以 `application/json` 格式作为 `Request Body (Payload)` 投递到接收通知的服务器
- `校检密钥`: 用于验证数据的真实性，具体参照 [内容验证](#内容验证) 章节
- `触发事件`: 用于订阅发送 `Webhook` 通知的触发事件，你可以仅订阅 Push 事件，也可以自己组合其他事件，具体数据格式参照 [事件数据结构说明](#事件数据结构说明) 章节
- `状态`: 可以选择 `Webhook` 启用禁用状态


### 内容验证

`CodeFever` 在发送 `Webhook` 时会在 `Request Header` 中包含一个 `X-CodeFever-Signature` 字段，此字段的值的内容格式为:

``` javascript
/md5=([0-9a-f]{32})/i
```

其中第一个分组部分结果算法为：

``` code
md5({$payload} + {$secret});
```

> 其中 `payload` 表示请求中 `Request Body` 中所有的内容， `secret` 表示配置项中的 校检密钥。


### 事件数据结构说明

`CodeFever` 的 `Webhook` 调用时 `Request Body` 为固定的数据格式。具体数据格式如下:

- Request Header:

``` http
User-Agent: CodeFever-Webhook
X-CodeFever-Id: RequestID :String
X-CodeFever-Event: EventName :String
X-CodeFever-Signature: ContentHash :String
```

> - `X-CodeFever-Id`: 请求 ID, 这事事件唯一 ID，可以用来判断事件是否重复发送。
> - `X-CodeFever-Event`: 事件名称, 和 `Request Body` 中 `event` 一致
> - `X-CodeFever-Signature`: 内容验证字段，详细参照 [内容验证](#内容验证) 章节


- Request Body:

``` json
{
    "event": EventName :String,
    "data":  EventData: Object,
    "repository": {
        "id":  RepositoryID :String(32),
        "url": RepositoryURL :String
    },
    "sender": {
        "id": UserID: String(32),
        "name": UserName: String
    }
}
```

> - `EventName`: 事件名称 详见: [事件名称对照](#事件名称对照) 章节
> - `EventData`: 事件数据 详见: [事件数据格式](#事件数据格式) 章节
> - `RepositoryID`: 仓库的 ID，用于识别仓库的唯一标识
> - `RepositoryURL`: 仓库的 URL
> - `UserID`: 触发事件的用户的 ID，用户识别用户的唯一标识
> - `UserName`: 触发事件的用户名


### 事件名称对照

| EventName | 事件名称 |
| -: | :- |
| hook:postReceive | 推送事件|
| repo:fork | Fork仓库|
| repo:updateAvator | 修改仓库头像|
| repo:updateName | 修改仓库名称|
| repo:updateDescription | 修改仓库描述|
| repo:addMember | 邀请成员|
| repo:changeMemberRole | 修改成员角色|
| repo:removeMember | 移除成员|
| repo:changeOwner | 修改所有者|
| repo:changeURL | 修改仓库URL|
| repo:remove | 删除仓库|
| branch:create | 新建分支|
| branch:remove | 删除分支|
| branch:changeDefaultBranch | 修改默认分支|
| branch:createProtectedBranchRule | 创建受保护分支规则|
| branch:changeProtectedBranchRule | 修改受保护分支规则|
| branch:removeProtectedBranchRule | 删除受保护分支规则|
| tag:create | 新建标签|
| tag:remove | 删除标签|
| mergeRequest:create | 创建合并请求|
| mergeRequest:close | 关闭合并请求|
| mergeRequest:merge | 合并请求|
| mergeRequestReviewer:create | 选择评审员|
| mergeRequestReviewer:delete | 清除评审员|
| mergeRequestReviewer:review | 评审代码|

### 事件数据格式
`CodeFever` 不同事件数据格式也有所不同，以下是不同事件的数据格式说明:

- 事件：`hook:postReceive`

``` json
{
  repositoryId : String(32),  // 仓库唯一标识
  name: String, // push 的目标分支的名字 （ref-name）
  from: String, // 起始 commit hash
  to: String // 结束 commit hash
}
```


- 事件： `repo:fork`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  forkFrom: String(32), // 仓库来源标识
  name: String, // 仓库名称
  sourceName: String //	来源仓库名称
}
```

- 事件：`repo:updateAvator`, `repo:updateName`, `repo:changeURL`, `branch:changeDefaultBranch`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  from: String, // 变更前数据
  to: String // 变更后数据
}
```

- 事件：`repo:updateDescription`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32) // 仓库唯一标识
}
```

- 事件：`repo:addMember`, `repo:removeMember`, `repo:changeOwner`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  uid: String(32), // 被操作用户 ID
  name: String, // 被操作用户名
  email: String // 被操作用户邮箱
}
```

- 事件：`repo:changeMemberRole`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  uid: String(32), // 被操作用户 ID
  name: String, // 被操作用户名
  email: String, // 被操作用户邮箱
  to: Int // 新的角色 ID： 0=无权限，1=访客， 2=报告者， 3=开发者， 4=维护者， 5=所有者， 6=无权限
}
```

- 事件：`branch:create`, `branch:remove`, `branch:createProtectedBranchRule`, `branch:changeProtectedBranchRule`, `branch:removeProtectedBranchRule`, `tag:create`, `tag:create`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  name: String, // 目标的名字 （ref-name）
}
```

- 事件：`mergeRequest:create`, `mergeRequest:close`, `mergeRequest:merge`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  id: Int, // MR 编号
  mergerequestId: String(32), // MR 唯一标识
  sourceBranch: String, // 来源分支
  targetBranch: String, // 目标分支
  sourceGKey:  String(32), // 来源仓库组唯一标识
  sourceRepositoryId: String(32) // 来源仓库唯一标识
}
```

- 事件：`mergeRequestReviewer:create`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  id: Int, // MR 编号
  mergerequestId: String(32), // MR 唯一标识
  reviewer: String(32), // 评审员唯一标识
  reviewId: String(32) // 评审唯一标识
}
```

- 事件：`mergeRequestReviewer:delete`, `mergeRequestReviewer:review`

``` json
{
  groupId: String(32),  // 仓库组唯一标识
  repositoryId: String(32), // 仓库唯一标识
  id: Int, // MR 编号
  mergerequestId: String(32), // MR 唯一标识
  reviewer: String(32), // 评审员唯一标识
}
```


### 响应 Webhook

被调用服务应该在 `Webhook` 请求中响应 `200` 状态码来表示消息已收到。否则 `CodeFever` 会在下一个发送周期重新发送此消息。


### 查阅调用记录

点击 `Webhook` 列表项目右侧 `查阅调用记录` 按钮，可以查阅近 30 次 `Webhook` 调用记录。 当调用服务器返回 `200` 状态码时则视为调用成功，否则为调用失败。如果 `Webhook` `通知发送失败，CodeFever` 会在下一发送周期重新发送，直到调用成功为止。













