# 成员管理

`仓库成员` 管理仓库成员对于仓库的操作权限。当用户操作仓库时, 会优先检查用户是否在 `仓库成员` 中, 如果用户在 `仓库成员` 列表中则按照用户 `仓库角色` 来鉴权; 如果用户不在仓库则会检查用户是否在此仓库的 `仓库组成员` 列表中, 如果用户在 `仓库组成员` 列表中则按照用户的 `仓库组角色` 来鉴权。

### 邀请成员

邀请成员步骤如下:

1. 进入`仓库主页`
1. 在主页菜单中选择 `成员` 选项即可进入 `成员列表` 页面
1. 在 `成员列表` 页面的分支列表右上方输入框输入新成员邮箱后点击 `邀请成员` 即可邀请成员

> - 新邀请的成员角色默认为 `访客`
> - 如果想对成员角色做调整请参照此文档 `管理成员权限` 章节
> - 如果想了解角色具体权限请参照此文档 `角色与权限` 章节

### 管理成员

管理成员步骤如下:

1. 参照此文档 `邀请成员` 章节进入 `成员列表` 页面
1. 在 `成员列表` 页面, 即可通过列表项目最右边的下拉菜单进行管理

> - 如果你是具备 `仓库组管理` 权限，可以再次页面管理 `仓库组成员`
> - 如果 `仓库成员角色` 在此仓库范围内可以覆盖 `仓库组成员角色`

### 角色与权限

在 `CodeFever` 角色分为 `访客`, `监督者`, `开发者`, `维护者` 和 `所有者` 五种。 每种具体权限如下:

| 权限名称 | 访客 | 监督者 | 开发者 | 维护者 | 所有者 |
| -:| :-: | :-: | :-: | :-: | :-: |
| **仓库** | - | - | - | - | - |
| Pull | O | O | O | O | O |
| Push | X | X | O | O | O |
| 删除仓库 | X | X | X | X | O |
| 修改仓库成员 | X | X | X | O | O |
| 修改仓库信息 | X | X | X | O | O |
| 变更所有者 | X | X | X | X | O |
| 修改仓库 URL | X | X | X | X | O |
| 分支操作 | X | X | X | O | O |
| 标签操作 | X | X | X | O | O |
| 保护分支操作 | X | X | X | O | O |
| 默认分支操作 | X | X | X | O | O |
| **合并请求** | - | - | - | - | - |
| 查看 | X | O | O | O | O |
| 提交 | X | X | O | O | O |
| 关闭 | X | X | X | O | O |
| 合并 | X | X | X | X | O |
| **仓库组** | - | - | - | - | - |
| 创建仓库 | X | X | X | O | O |
| 删除仓库 | X | X | X | X | O |
| 修改仓库组成员 | X | X | X | O | O |
| 修改仓库组信息 | X | X | X | O | O |
| 修改仓库组 URL | X | X | X | X | O |
| 修改仓库组所有者 | X | X | X | X | O |

> - `仓库` 和 `仓库组` 的 `创建者` 不受 `成员列表` 约束, 并且拥有 `所有者` 角色。
> - 表格中: `X` 表示 `无权限`; `O` 表示 `有权限`; `-` 表示 `不适用`;