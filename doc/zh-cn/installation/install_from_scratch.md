# 从零开始安装

## 此文档适用条件

> 如果你的情况符合以下条件, 你可以使用 `从零开始安装` 的方式安装 `CodeFever` 否则请使用 [Docker 镜像安装](install_via_docker.md) 方式安装。

- 学习和技术交流
- 需要做定制化修改
- `Docker 镜像安装` 不能满足处理 `Bug` 和提交 `PR` 的需求
- Docker 镜像不能在当前 `操作系统` 或 `硬件架构` 上使用

## 安装步骤

### 0. 安装前的说明

此安装步骤是推荐的 `从头开始安装` 步骤, 举例的脚本适用于大部分 `Linux` 操作系统。

此安装步骤详细指导均以 `CentOS 7.x Linux` 操作系统为例，不同操作系统可能会有不同差别，需要用户自行对应到相应操作。

整个安装过程需要使用 `root` 操作系统用户来完成。

> `步骤1` - `步骤8` 均为软件环境安装步骤。如果你的操作已经具备当前步骤的软件或环境，此步骤可以跳过。

### 1. 准备操作系统环境

选择合适的 `Linux` 发行版本，推荐使用 `CentOS 7.x`。

* 执行编译安装时需要保证机器至少有 `1800 MB` 内存，如果内存不足 `1800 MB` 请临时添加交换分区使可用内存到达 `1800 MB`。

```shell
# 临时增加 1000 MB Swap 空间
dd if=/dev/zero of=/root/swap bs=1024 count=1000000
mkswap /root/swap
swapon /root/swap
```

为了顺利的设置必要的软件环境，以下的软件包必须安装到系统上。

```shell
# 安装基础软件包
yum install -y sudo tcl tk gettext autoconf gcc cmake3 wget initscripts openssh-server crontabs mailx pcre pcre-devel libcurl libcurl-devel libxml2 libxml2-devel openssl openssl-devel sqlite sqlite-devel libpng libpng-devel libwebp libwebp-devel libjpeg libjpeg-devel libXpm libXpm-devel freetype freetype-devel oniguruma oniguruma-devel libyaml libyaml-devel
```

除此之外，你还需要安装 `libzip 1.7+` 库，需要去官网下载源码包解压后安装。

下载地址: [https://libzip.org/download/](https://libzip.org/download/)

```shell
# 编译安装 libzip
cd libzip-1.x.x
mkdir build
cd build
cmake3 ../
make && make install
export PKG_CONFIG_PATH="/usr/local/lib64/pkgconfig/:/usr/local/lib/pkgconfig/"
```

### 2. 安装 nginx
	
访问 [http://nginx.org/en/download.html](http://nginx.org/en/download.html) 下载 `Nginx` 源码解压后编译并安装安装到 `/usr/local/nginx` 目录下:

```shell
# 安装 nginx 到 /usr/local/nginx 目录
cd nginx-1.x.x
./configure --prefix=/usr/local/nginx
make && make install
```

###	3. 安装 PHP

访问 [https://www.php.net/downloads](https://www.php.net/downloads) 下载 `PHP` 源码 (推荐 `7.4` 版本)，解压后编译并安装到 `/usr/local/php` 目录下

> 配置检查过程可能会提示缺少某些软件包，需要根据配置检查过程提示自行安装后再重复配置检查过程

```shell
# 安装 php 到 /usr/local/php 目录
cd php-7.4.x
./configure --prefix=/usr/local/php --with-config-file-path=/usr/local/php/etc --enable-fpm --enable-bcmath=shared --with-pdo_sqlite --with-gettext=shared --with-iconv --enable-ftp=shared --with-sqlite3 --enable-mbstring=shared --enable-sockets=shared --enable-soap=shared --with-openssl --with-zlib --with-curl=shared --enable-gd --with-freetype --with-jpeg --with-xpm --with-webp --with-mhash --enable-opcache --with-mysqli --without-pear --with-libdir=lib64 --with-zip --enable-mbstring --enable-pcntl
make && make install
```
		
> `Codefever` 还需要以下 `PHP 扩展` 才能良好工作，按照下面地址下载并安装
		
- yaml : https://pecl.php.net/package/yaml

```shell
# 安装 php yaml 扩展
cd yaml-2.x.x
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config
make && make install
```
	
###	4. 安装 Git

访问 [https://mirrors.edge.kernel.org/pub/software/scm/git/](https://mirrors.edge.kernel.org/pub/software/scm/git/) 下载 `Git v2` 的源码，解压后编译并安装到 `/usr/local/git` 目录下

```shell
# 安装 git v2 到 /usr/local/git 目录下
cd git-2.x.x
./configure --prefix=/usr/local/git
make && make install
```

连接可执行二进制文件到 `/usr/local/bin` 目录下
		
```shell
# 链接可执行文件
ln -s /usr/local/git/bin/git /usr/local/bin/
```

### 5. 安装 Go (无需编译, 二进制安装)

访问 [https://golang.google.cn/dl/](https://golang.google.cn/dl/) 下载 1.16 版本以上的二进制安装包解压后复制到 `/usr/local/go` 目录下

```shell
# 复制到 /usr/local	目录下
cp -R go /usr/local
```

连接可执行二进制文件到 `/usr/local/bin` 目录下
		
```shell
# 链接可执行文件
ln -s /usr/local/go/bin/go /usr/local/bin/go
ln -s /usr/local/go/bin/gofmt /usr/local/bin/gofmt
```

### 6. 安装 NodeJS (无需编译, 二进制安装, 开发或修改前端页面时使用)

访问 [https://nodejs.org/en/download/](https://nodejs.org/en/download/) 下载 `16.10` 以上 `LTS` 版本二进制安装包解压后复制到 `/usr/local/node` 目录下

```shell
# 复制到 /usr/local	目录下
cp -R node-v16.x.x-os-arch /usr/local/node
```

连接可执行二进制文件到 `/usr/local/bin/` 目录下

```shell
# 链接可执行文件
ln -s /usr/local/node/bin/node /usr/local/bin/node
ln -s /usr/local/node/bin/npm /usr/local/bin/npm
ln -s /usr/local/node/bin/npx /usr/local/bin/npx
ln -s /usr/local/node/bin/corepack /usr/local/bin/corepack
```
		
### 7. 安装 Yarn

访问 [https://yarnpkg.com/getting-started/install](https://yarnpkg.com/getting-started/install) 按照页面指导安装 `Yarn`

```shell
# NodeJS v16.10 以上打开 corepack 即可使用 Yarn
corepack enable
```
		
### 8. 安装 MySQL/MariaDB (无需编译, 镜像源安装)

MySQL 不需要单独安装，直接使用系统自带软件工具安装软件包即可。需要安装于 `MySQL 5.7` 以上的相当版本。

去官网按照指导使用镜像源安装二进制版本 (https://mariadb.org/download/?t=repo-config 选择 `xTom GmbH - San Jose` 镜像)，如果你使用使用云数据库，你可以跳过此步骤。

运行 `service mariadb start` 或 `service mysql start` 启动服务后使用 `mysql_secure_installation` 或 `mariadb-secure-installation` 初始化数据库

*当设置 `root` 密码为 `123456` 时，不需要在下一步中修改 `env.yaml` 中的数据库设置。

如果你使用 `MySQL 5.7` 版本数据，需要修改 `SQL MODE` 变量，否则创建数据库时会报错，如果使用 `MariaDB` 可以忽略此选项。

```SQL		
set global sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
```

### 9. 下载源码并安装

去 `Github` 上下载源码并安装 `/data/www/codefever-comminuty` 目录下

```shell
mkdir -p /data/www
cd /data/www
git clone https://github.com/PGYER/codefever.git codefever-community
cd codefever-community
```

* 如果 `Github` 的 `HTTP` 服务访问速度较慢，可以尝试使用 `SSH` 服务（需要提前设置 `SSH Key`）

```shell
git clone ssh://git@github.com:PGYER/codefever.git codefever-community
```

编译 `HTTP` 网关服务

```shell	
cd /data/www/codefever-community/http-gateway
export GO111MODULE=off
export GOPROXY=https://mirrors.aliyun.com/goproxy
go get gopkg.in/yaml.v2
go build main.go
```
		
编译 `SSH` 网关服务
		
```shell
cd /data/www/codefever-community/ssh-gateway/shell
export GO111MODULE=off
export GOPROXY=https://mirrors.aliyun.com/goproxy
go get gopkg.in/yaml.v2
go build main.go
```

执行安装脚本

```shell
cd /data/www/codefever-community/misc
sh ./install.sh
```
		
按照 `install.sh` 运行后提示修改 `env.yaml` 文件设置参数
		
运行数据库迁移脚本

```shell
cd /data/www/codefever-community/misc
sh ./create_db.sh
```

如果你不需要对 CodeFever 进行代码上的修改, 或者将来不计划运行单元测试, 可以删除测试数据

```shell
cd /data/www/codefever-community/misc
sh ./remove_test_data.sh
```

为服务开启 `chkconfig` 以开机自动运行

```shell
chkconfig mariadb on # 或 chkconfig mysql on (根据安装的数据库类型, 如果使用云服务忽略此项目)
chkconfig nginx on
chkconfig php-fpm on
chkconfig codefever on
chkconfig crond on
```

尝试访问 `http://127.0.0.1` 或 `http://<server ip>` 来登录

默认管理员用户: `root@codefever.cn`, 密码: `123456`。登录后请修改密码并绑定 MFA 设备。

### 10. 服务维护

服务维护请参见 [管理员设置/概览和系统服务](../admin/dashboard.md) 中的 `系统服务状态及维护` 一节
