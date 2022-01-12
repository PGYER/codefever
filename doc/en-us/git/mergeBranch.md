# Local branch merge

When merging branches on **CodeFever**, you will encounter conflicting changes. Currently, **CodeFever** does not support online conflict resolution for the time being. You can use the following process to complete branch merging in conflict situations. These processes are not limited to resolving conflicts, but can also be used as normal merging branches.

### Merge branches within the same repository

In the same repository, when merging from the **origin_branch** branch to the **target_branch** branch on **CodeFever**, if you encounter a conflict:

1. Locally, switch the working directory to the branch **target_branch**, for example:

> git checkout target_branch

2. Merge the changes of **origin_branch** to the current branch **target_branch**, for example:

> git merge origin_branch

3. Modify the conflicting files and resolve the conflicts.

4. Create a new commit (git add & git commit).

5. Push the conflict resolution changes to the remote repository, for example:

> git push remote_name target_branch

### Merge branches between different repositories

On **CodeFever**, when merging from the **origin_branch** branch of the **origin_repo** repository to the **target_branch** branch of the **target_repo** repository, if you encounter conflict:

1. In the local **target_repo** repository, switch the working directory to the branch **target_branch**, for example:

> git checkout target_branch

2. Add the remote repository **origin_repo** to the local **target_repo** repository, for example:

> git remote add remote_name url_copied_from_codefever

3. Pull the changes of the remote repository branch **origin_branch**, for example:

> git fetch remote_name origin_branch

4. Merge the changes of **remote_name/origin_branch** to the current branch **target_branch**, for example:

> git merge remote_name/origin_branch

5. Modify conflicting files and resolve merge conflicts.

6. Create a new commit (git add & git commit).

7. Push the conflict resolution changes to the remote repository **target_repo**, for example:

> git push target_remote target_branch

8. Delete the remote branch **origin_repo**, for example:

> git remote remove remote_name
