# 克隆仓库到本地

当仓库在 `CodeFever` 上创建完成后，需要 `克隆` 到本地才能继续操作。

### 如何 clone 一个仓库

空仓库具体操作如下: 

1. 进入 `仓库首页`
1. 在 `仓库首页` 右上角点击 `克隆` 按钮
1. 根据你需要的方式来复制仓库地址，默认为 `HTTP`
1. 使用如下操作来完成 `克隆`

  ```shell
  git clone <repository url> <target path>
  ```

> - 关于 HTTP 和 SSH 两种形式如何选择，参见 [常见问题/HTTP 和 SSH 的选择](../common/clone_method.md)
> - 如果需要使用 SSH 方式 克隆, 需要提前设置 SSH Key 。 参见 [常见问题/获取并设置 SSH Key](../common/ssh_key.md)

