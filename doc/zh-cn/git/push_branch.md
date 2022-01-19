# 推送一个新分支

### 推送新分支

如果推送的分支在远端仓库中不存在，则会被认定为一个新分支。  

此时，推送的命令需要添加 `-u` 的参数来完成新分支的推送

```shell
git push -u <remote name>/<new branch>
```

参照: [Git 常用命令参考](git_command_reference.md)
