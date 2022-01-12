# Roll back the file to the specified version

Roll back a file to the specified version, for example:

> git checkout commit_hash file...

After the command is executed successfully, the file content in the working directory is rolled back to the file content of the specified version, and has been saved to the temporary storage area.

You can also specify the number of rollback versions to perform the rollback operation, for example:

> git checkout master~num file...

After the command is executed successfully, the content of the file in the working directory is rolled back to the content of the latest **num+1** commit of **master** and saved to the temporary storage area.
