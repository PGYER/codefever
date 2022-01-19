# 回退文件到指定版本

### 回退文件到指定版本

如果需要回退某个文件到指定版本，则需要:

```shell
git checkout <commit hash> <file path>
```

命令执行成功后, 工作目录的文件内容回退到指定版本的文件内容, 同时已保存至暂存区。

还可以指定回退的版本数来进行回退操作，例如：

```shell
git checkout master~<num> <file path>
```

命令执行成功后, 工作目录中的文件内容回退到 `master` 分支最近的第 `<num> + 1` 次提交的内容, 并保存至暂存区。

参照: [Git 常用命令参考](git_command_reference.md)
