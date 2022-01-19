# 获取并设置 SSH Key

`SSH Key` 用于 Git 客户端通过 `SSH` 协议与远端仓库通信的身份认证。当在 `CodeFever` 中设置 `SSH Key` 之后，使用 `SSH` 方式连接位于 `CodeFever` 上的仓库时不需要再输入用户和密码进行认证。

### 获取 SSH Key

当使用 `Linux` 或 `MacOS` 系统时，系统会默认安装 `ssh` 相关组件。此时, `SSH Key` 存在于家目录下的 `.ssh` 目录下。当使用 `Windows` 操作系统时，需要安装 `Git Bash`, 文中提到的所有命令需要在 `Git Bash` 中输入。

获取 `SSH Key` 的步骤如下:

1. 在终端输入以下命令即可查看该目录

    ```shell
    ls -al ~/.ssh
    ```

1. 如果目录中包含 `id_rsa.pub` 或 `id_dsa.pub` 文件时, 则不需要新产生 `SSH Key`; 否则, 需要手动生成 `SSH Key`。在终端输入以下命令可以生成 SSH Key

    ```shell
    ssh-keygen -t rsa -C ”<name or comment>“
    ```

    > 注意： 参数 `-C` 后面可以输入任何你希望标识该 SSH Key 的名称

1. 此时, `~/.ssh` 目录下应该会新增一个名为 `id_rsa.pub` 的文件, 这个文件里面存储的就是 `SSH Key`。在终端输入以下命令可以查看 `SSH Key` 内容。

    ```shell
    cat ~/.ssh/id_rsa.pub
    ```

### 设置 SSH Key

当获取到 SSH Key 之后, 需要将 SSH Key 设置到 CodeFever 上。

具体设置步骤如下:

1. 在 `导航栏` 右侧找到自己的 `头像` 并点击
1. 在展开的菜单中点击 `SSH Key` 选项打开 `SSH Key 设置页面`
1. 在 `SSH Key 设置页面` 输入 `SSH Key` 点击 `新增 SSH Key` 按钮即可

> - 由于 `SSH Key` 用于鉴别用户身份, 因此每个 `SSH Key` 只能添加到一个账号里, 否则会提示 `SSH Key` 已经添加
