# Docker 镜像安装

## 安装步骤

### Docker 镜像说明

`CodeFever Community 版本` 的 `Docker 镜像` 是从 `dockerhub` 上的 `centos:centos7.9.2009` 镜像开始按照 [从零开始安装](install_from_scratch.md) 中的步骤进行构建, 构建架构是 `x86_64 (amd64)` 如果有其他需求请自行构建镜像。

### 拉取镜像并启动

启动 `CodeFever Communiy 版本` 的 `Docker 镜像`

```shell
docker run -d --privileged=true --name codefever -p 80:80 -p 22:22 -it pgyer/codefever-community:latest /usr/sbin/init
```

1. 服务启动后尝试访问 `http://127.0.0.1` 或 `http://<server ip>` 登录
2. 如果你希望使用 `22` 端口作为 `Git` 的 `SSH 协议`端口，你需要在启动镜像前将宿主系统的 `SSH 服务` `端口` 先修改成其他端口
3. 如果服务异常你可以登录 Shell 去人工维护, 也可以直接重启容器重启服务。
4. 默认管理员用户: `root@codefever.cn`, 密码: `123456`。登录后请修改密码并绑定 MFA 设备。

### 服务维护

服务维护请参见 [管理员设置/概览和系统服务](../admin/dashboard.md) 中的 `系统服务状态及维护` 一节

## 此文档适用条件

如果你的情况符合以下条件，你需要使用 [从零开始安装](install_from_scratch.md) 的方式安装 `CodeFever` 否则请跳过本章节继续使用 `Docker 镜像安装` 方式安装。

- 学习和技术交流
- 需要做定制化修改
- `Docker 镜像安装` 不能满足处理 `Bug` 和提交 `PR` 的需求
- Docker 镜像不能在当前 `操作系统` 或 `硬件架构` 上使用

参见: [从零开始安装](install_from_scratch.md)
