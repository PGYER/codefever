# 如何获取并设置 SSH Key ？

SSH Key 用于 Git 客户端通过 SSH 协议与远端仓库通信的身份认证。当在 CodeFever 中设置 SSH Key 之后，使用 SSH 方式连接位于 CodeFever 上的仓库时不需要再输入用户和密码进行认证。

### 获取 SSH Key

当使用 Linux 或 MacOS 系统时，系统会默认安装 ssh 相关组件。此时，SSH Key 存在于家目录下的 .ssh 目录下。当使用 Windows 操作系统时，需要安装 Git Bash，文中提到的所有命令需要在 Git Bash 中输入。

在终端输入以下命令即可查看该目录。

> ls -al ~/.ssh

如果目录中包含 **id_rsa.pub** 或 **id_dsa.pub** 文件时，则不需要新产生 SSH Key，否则，需要手动生成 SSH Key。在终端输入以下命令可以生成 SSH Key。

> ssh-keygen -t rsa -C “name_of_id_or_any_comment”

注意： 参数 **-C** 后面可以输入任何你希望标识该 SSH Key 的名称

此时，~/.ssh 目录下应该会新增一个名为 id_rsa.pub 的文件，这个文件里面存储的就是 SSH Key。在终端输入以下命令可以查看 SSH Key 内容。

> cat ~/.ssh/id_rsa.pub

### 设置 SSH Key

将上一过程中显示的 SSH Key 内容复制后，到 CodeFever 中 **个人设置** -> **SSH Keys** 中，新增 SSH Key 即可。
