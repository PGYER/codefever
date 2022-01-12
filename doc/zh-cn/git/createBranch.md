
# 创建第一个分支

在 CodeFever 新建的仓库没有任何内容，需要在本地创建仓库的第一个分支，并推送到远程仓库。

1、克隆远程仓库到本地（这里使用 **SSH** 的方式克隆，克隆前需要在 **SSH Key** 设置中添加本地 **SSH** 信息），并切换到仓库根目录，例如：

> git clone git@codefever.pgyer.com:group_name/project_name.git

> cd project_name

克隆完成后，工作目录已经切换到默认的 **master** 分支，也可以创建其他的分支，例如：

> git checkout -b branch_name

2、添加内容，创建第一次提交，例如：

> echo 'init' > readme.md

> git add readme.md

> git commit -m 'init commit'

3、推送到远程仓库，例如：

> git push origin branch_name
