# 本地的分支合并

在 `CodeFever` 上合并分支时，会遇到合并冲突的情况，目前 `CodeFever` 暂时不支持在线解决冲突，可以使用下面的流程完成冲突情况下的分支合并。这些流程不局限于解决冲突，也可以作为正常合并分支的流程。

### 同仓库内的分支合并

在同一个仓库内，在 `CodeFever` 上从 `<source branch>` 分支往 `<target branch>` 分支合并时需要在本地进行同仓库内的分支合并

同仓库内的分支合并操作步骤: 

1. 在本地，先切换工作目录到分支 `<target branch>`，例如：

    ```shell
    git checkout <target branch>
    ```

1. 合并 `<source branch>` 的改动到当前分支 `<target branch>`，例如：

    ```shell
    git merge <source branch>
    ```

1. 修改有冲突的文件，解决冲突
1. 创建新提交

    ```shell
    git add <changed files>
    git commit -m 'memo'
    ```

1. 将解决冲突的改动推送到远程仓库

    ```shell
    git push <remote name> <target branch>
    ```

### 不同仓库间进行分支合并

在 `CodeFever` 上，从 `<source repo>` 仓库的 `<source branch>` 分支往 `<target repo>` 仓库的 `<target branch>` 分支合并时，如果遇到冲突需要在本地进行不同仓库间进行分支合并

本地解决不同分支合并步骤: 

1. 在 `<target repo>` 的本地仓库内，切换工作目录到分支 `<target branch>`

    ```shell
    git checkout <target branch>
    ```

1. 为本地的 `<target repo>` 仓库添加远程仓库 `<source repo>`

    ```shell
    > git remote add  <source repo name> <source repo>
    ```

1. 拉取远程仓库分支 `<source repo>` 的改动

    ```shell
    git fetch <source repo name> <source branch>
    ```

1. 合并 `<source repo name>/<source branch>` 的改动到当前分支 `<target branch>`

    ```shell
    git fetch <source repo name>/<source branch>
    ```

1. 修改有冲突的文件，解决合并冲突

1. 创建新提交

    ```shell
    git add <changed files>
    git commit -m 'memo'
    ```

1. 将解决冲突的改动推送到远程仓库 `<target branch>`

    ```shell
    git push <target remote name> <target branch>
    ```

1. 删除远程仓库 (可选)

    ```shell
    git remote remove <source remote name>
    ```

参照: [Git 常用命令参考](git_command_reference.md)