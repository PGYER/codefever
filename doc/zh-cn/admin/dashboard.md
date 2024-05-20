# 概览和系统服务

此页面没有管理功能, 仅用于监视 `系统资源使用量` 和 `服务状态`。

### 进入概览页面

能查看 `概览页面` 需要满足以下条件

- `CodeFever` 系统 `管理员`

进入 `概览页面` 的步骤:

1. 在 `CodeFever` 导航栏右侧找到 `管理后台` 按钮
1. 点击 `管理后台` 按钮进入 `管理后台`
1. 点击左侧菜单栏 `概览` 选项

### 统计

统计部分用于展示 `CodeFever` 使用量

> `CodeFever` 对于使用量没有限制

### 系统资源

统计部分用于展示 `系统资源` 使用量

> 当出现性能问题时, 需要查看此面板确定有足够的 `系统资源` 可以使用

### 磁盘使用量

统计部分用于展示 `磁盘` 使用量

> CodeFever 的 Git 仓库均保存在 `/data/www/codefever-community/git-storage` 目录下, 如果磁盘空间剩余不足，请考 `扩容磁盘` 或 将 Git 仓库目录链接保存到其他磁盘上。

### 系统服务状态及维护

`CodeFever` 有五个主要的系统服务, 分别是 `PHP` , `Nginx` , `CodeFever` , `Crond` 和 `Sendmail` 。如果某个服务异常需要手动重新启动。

具体服务启动方式如下:

#### PHP

说明: 脚本引擎, 用于程序运行

支持的维护命令: 

```shell
service php-fpm start  # 启动
service php-fpm stop # 停止
service php-fpm restart # 重新启动
service php-fpm reload # 重新启动
service php-fpm status # 查看状态
```

#### Nginx

说明: 服务器软件, 用于 HTTP 反向代理服务 

支持的维护命令: 

```shell
service nginx start  # 启动
service nginx stop # 停止
service nginx restart # 重新启动
service nginx reload # 重新启动
```

#### CodeFever

说明: 基础服务, 用于 Git 客户端 `HTTP` 连接和 `SSH` 连接相关服务

支持的维护命令: 

```shell
service codefever start  # 启动
service codefever stop # 停止
service codefever restart # 重新启动
service codefever status # 查看状态
```

#### Crond

说明: 基础服务, 用于 `CodeFever` 的定时任务时钟事件源

支持的维护命令: 

```shell
service crond start  # 启动
service crond stop # 停止
service crond restart # 重新启动
service crond status # 查看状态
```

#### Sendmail

说明: 基础服务, 用于 `CodeFever` 的邮件发送队列管理和代理

支持的维护命令: 

```shell
service sendmail start  # 启动
service sendmail stop # 停止
service sendmail restart # 重新启动
service sendmail status # 查看状态
```
