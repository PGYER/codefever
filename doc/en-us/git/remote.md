# 远程仓库源管理

### 添加远程仓库

如果需要快速推送本地仓库到远端仓库, 则需要手动添加远程仓库:

```shell
> git remote add <remote name> <repo url>
```

添加成功后，可以使用 `git push <remote name> <branch>` 向远程仓库推送新改动, 使用 `git pull <remote name> <branch>` 拉取新的改动。

> 当使用 `clone` 复制仓库时, 仓库的 `remote` 列表中会自动包含一条叫做 `origin` 的记录, 此记录只想 `clone` 仓库时的仓库地址。

### 查看远程仓库列表

可以使用以下命令查看远程仓库列表:

```shell
git remote -v
```

### 删除远程仓库

可以使用以下命令删除远程仓库:

```shell
git remote remove <remote name>
```

参照: [Git 常用命令参考](git_command_reference.md)
