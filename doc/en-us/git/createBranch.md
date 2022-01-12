# Create the first branch

The newly created repository in CodeFever has no content. You need to create the first branch of the repository locally and push it to the remote repository.

1. Clone the remote repository to the local (here, use **SSH** to clone, you need to add local **SSH** information in the **SSH Key** setting before cloning), and switch to the root directory of the repository, for example:

> git clone git@codefever.pgyer.com:group_name/project_name.git

> cd project_name

After cloning is complete, the working directory has been switched to the default **master** branch, and other branches can also be created, for example:

> git checkout -b branch_name

2. Add content, create the first commit, for example:

> echo 'init' > readme.md

> git add readme.md

> git commit -m 'init commit'

3. Push to the remote repository, for example:

> git push origin branch_name
