# 本地的分支合并

在 **CodeFever** 上合并分支时，会遇到改动冲突的情况，目前 **CodeFever** 暂时不支持在线解决冲突，可以使用下面的流程完成冲突情况下的分支合并。这些流程不局限于解决冲突，也可以作为正常合并分支的流程。

### 同一个仓库内的分支合并

在同一个仓库内，在 **CodeFever** 上从 **origin_branch** 分支往 **target_branch** 分支合并时，如果遇到冲突：

1、在本地，先切换工作目录到分支 **target_branch**，例如：

> git checkout target_branch

2、合并 **origin_branch** 的改动到当前分支 **target_branch**，例如：

> git merge origin_branch

3、修改有冲突的文件，解决冲突。

4、创建新提交（git add & git commit）。

5、将解决冲突的改动推送到远程仓库，例如：

> git push remote_name target_branch

### 在不同仓库间进行分支合并

在 **CodeFever** 上，从 **origin_repo** 仓库的 **origin_branch** 分支往 **target_repo** 仓库的 **target_branch** 分支合并时，如果遇到冲突：

1、在 **target_repo** 仓库的本地，切换工作目录到分支 **target_branch**，例如：

> git checkout target_branch

2、为本地的 **target_repo** 仓库添加远程仓库 **origin_repo**，例如：

> git remote add remote_name url_copied_from_codefever

3、拉取远程仓库分支 **origin_branch** 的改动，例如：

> git fetch remote_name origin_branch

4、合并 **remote_name/origin_branch** 的改动到当前分支 **target_branch**，例如：

> git merge remote_name/origin_branch

5、修改有冲突的文件，解决合并冲突。

6、创建新提交（git add & git commit）。

7、将解决冲突的改动推送到远程仓库 **target_repo**，例如：

> git push target_remote target_branch

8、删除远程分支 **origin_repo**，例如：

> git remote remove remote_name
