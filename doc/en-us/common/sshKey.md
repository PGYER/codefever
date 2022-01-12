# How to obtain and set SSH Key?

SSH Key is used for identity authentication for Git client to communicate with remote repository through SSH protocol. After setting the SSH Key in CodeFever, you do not need to enter the user and password for authentication when using SSH to connect to the repository located on CodeFever.

### Get SSH Key

When using a Linux or MacOS system, the system will install ssh related components by default. At this time, the SSH Key exists in the .ssh directory under the home directory. When using the Windows operating system, you need to install Git Bash, and all the commands mentioned in the article need to be entered in Git Bash.

Enter the following command in the terminal to view the directory.

> ls -al ~/.ssh

If the directory contains **id_rsa.pub** or **id_dsa.pub** files, you do not need to generate a new SSH Key, otherwise, you need to manually generate an SSH Key. Enter the following command in the terminal to generate an SSH Key.

> ssh-keygen -t rsa -C "name_of_id_or_any_comment"

Note: After the parameter **-C**, you can enter any name you want to identify the SSH Key

At this point, a new file named id_rsa.pub should be added to the ~/.ssh directory, and the SSH Key is stored in this file. Enter the following command in the terminal to view the contents of the SSH Key.

> cat ~/.ssh/id_rsa.pub

### Set SSH Key

After copying the SSH Key content displayed in the previous process, go to **Personal Settings** -> **SSH Keys** in CodeFever, and add SSH Key.
