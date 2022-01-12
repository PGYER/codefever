# Revert the committed changes

Sometimes it is necessary to revert the changes of a commit, which can be achieved by using the **git revert** command, for example:

> git revert commit_hash

After the command is executed successfully, the changes whose commit hash is **commit_hash** are restored. If there is no conflict, a new commit will be automatically created. Add the **-n** option if you do not want the commit to be created automatically.

You can also restore a previous commit based on the current **HEAD**, for example:

> git revert HEAD~num

After the command is executed successfully, the latest **num+1** commit changes are restored. If there is no conflict, a new commit will be created automatically.

You can also specify a range to revert the changes of several commits, for example:

> git revert -n master~num1.. master~num2

After the command is executed successfully, the changes from the most recent **num1** (inclusive) commit to the most recent **num2+1** (inclusive) commit are reverted.

Because the **-n** option is used, the restored result is saved in the staging area, and a new commit needs to be created manually.

When the **-n** option is used, if the result of the revert operation is not as expected, the revert operation can be undone before creating a new commit, for example:

> git revert --abort
