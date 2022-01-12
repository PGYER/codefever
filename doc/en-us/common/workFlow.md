# How to choose a workflow when using CodeFever?

Choosing CodeFever is equivalent to choosing a distributed Git workflow. Common distributed workflows include **centralized workflow**, **integrated manager workflow** and **supervisor and deputy supervisor workflow** each Each workflow has its own characteristics, and it needs to be judged according to the characteristics of its own project.

CodeFever provides **Branch**, **Merge Request** and **Fork** functions, so these three workflows can be easily supported.

### Centralized workflow

The single point collaboration model-centralized workflow is usually used in centralized systems. A central hub, or **repository**, can accept code, and everyone will synchronize their work with it. Several developers act as nodes, that is, consumers in the central repository synchronize with the central repository.

This means that if two developers clone the code from the central repository and make some modifications at the same time, only the first developer can smoothly push the data back to the shared server. The second developer must merge the work of the first person before pushing the changes, so as not to overwrite the first person's changes. This is the same concept as in Subversion (or any CVCS), and this pattern can also be applied to Git.

If you are used to using this centralized workflow in a company or team, you can continue to use this simple model. You only need to build a central repository and give everyone in the development team permission to push data, and you can start work. Git will not let users overwrite each other's changes.

Of course this is not limited to small teams. Using Git's branch model, by working on multiple branches at the same time, even a development team of hundreds of people can collaborate well on a single project.

### Integrated manager workflow

Git allows multiple remote repositorys to exist, making such a workflow possible: each developer has the write permission of his own repository and the read permission of everyone else's repository. In this case, there is usually an authoritative repository representing the "official" project. To contribute to this project, you need to clone a public repository of your own from the project, and then push your changes to it. Then you can ask the maintainer of the official repository to pull the update and merge it into the main project. Maintainers can add your repository as a remote repository, test your changes locally, merge them into their branch and push back to the official repository.

This is the most commonly used workflow for hub-based tools such as GitHub and GitLab. People can easily send a project into their own public repository, push their own changes to this repository, and make it visible to everyone. One of the main advantages of this is that you can continue to work, and the maintainer of the main repository can pull your changes at any time. Contributors don't have to wait for the maintainer to finish processing the submitted updates-everyone can work at their own pace.

### Supervisor and deputy supervisor workflow

This is actually a variant of the multi-repository workflow. This way of working is usually used in very large projects with hundreds of co-developers, such as the famous Linux kernel project. Each integration manager called **lieutenant** is responsible for a specific part of the integration project. All these deputy directors also have a general integrated manager called **dictator** responsible for overall planning. The repository maintained by the supervisor serves as a reference repository to provide all collaborators with the project codes they need to pull.

This kind of workflow is not commonly used, and only when the project is extremely complex or requires multiple levels of management, it will show its advantages. In this way, the project chief (ie, the supervisor) can delegate a large amount of scattered integration work to different team leaders to handle them separately, and then coordinate the large code subsets at different times for subsequent integration.

For details, please read the article pointed to by the reference source link

Reference source

Distributed Git-distributed workflow
