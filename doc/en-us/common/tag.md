# What is a tag? What is the difference with branch (Branch)?

In Git, **tag** and **branch** are essentially references to a **commit node**. The difference is that **label** is a fixed reference, while **branch** is a dynamic reference.

The way Git manages files is closer to an incremental management model. When a file is changed and submitted, a new **submit node** will be generated. When we generate a new **submit node**, the current **branch** will become a reference to the current **submit node**. Because the reference of the **branch** to the **submit node** changes with each submission, the branch cannot be used to fix the state of the files in the repository at a certain time.

At this point, if you want to have a mark to fix the state of the files in the repository at a certain time, then the **label** is the most suitable. When the label is generated, the label points to a reference to a fixed **submit node**. At this time, **label** can be used to indicate the status of the files in the repository.

Generally, **tags** are used to mark the version of the file.
