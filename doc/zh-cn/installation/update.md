# 更新

`CodeFever Community 版本` 会根据 `CodeFever` 功能更新以及社区反馈不定期进行版本更新，对于 [从零开始安装](install_from_scratch.md) 和 [Docker 镜像安装](install_via_docker.md) 两种方式安装的用户来说，更新方式可能有所差异。

## 保留历史数据更新

> - 如果您使用 `Docker 方式安装`, 请在执行下面步骤前需要先执行 `docker container exec -it codefever /bin/bash` 登录到 `codefever` 容器的 `shell` 上

> - 执行此更新步骤后, 配置文件 `config.yaml` 和 `env.yaml` 中的内容可能会被重置。 如果你对这两个文件做过修改，更新前请备份您的修改。

按照以下步骤进行 `CodeFever` 的更新

- 运行 `cd /data/www/codefever-community` 进入指定目录
- 运行 `git pull origin master`
- 运行 `cd misc` 进入配置脚本目录
- 运行 `sh ./update.sh` 执行更新操作

## 不保留历史数据更新

直接选择你喜欢的安装方式，参照 [从零开始安装](install_from_scratch.md) 和 [Docker 镜像安装](install_via_docker.md) 文档重新安装即可。