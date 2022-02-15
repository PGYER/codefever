import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

// components
import UserInfo from 'APPSRC/components/view/UserInfo'

import UserSettingSSHKey from 'APPSRC/components/view/UserSettingSSHKey'
import UserSettingEmail from 'APPSRC/components/view/UserSettingEmail'
import UserSettingGeneral from 'APPSRC/components/view/UserSettingGeneral'
import UserSettingNotification from 'APPSRC/components/view/UserSettingNotification'

import AdminDashboard from 'APPSRC/components/view/admin/Dashboard'
import AdminUsers from 'APPSRC/components/view/admin/Users'
import AdminGroups from 'APPSRC/components/view/admin/Groups'
import AdminRepositories from 'APPSRC/components/view/admin/Repositories'
import AdminSettings from 'APPSRC/components/view/admin/Settings'

import RepositoryList from 'APPSRC/components/view/RepositoryList'
import NewRepository from 'APPSRC/components/view/NewRepository'
import NewRepositoryFork from 'APPSRC/components/view/NewRepositoryFork'
import RepositorySettingGeneral from 'APPSRC/components/view/RepositorySettingGeneral'
import RepositorySettingBranch from 'APPSRC/components/view/RepositorySettingBranch'
import RepositorySettingWebhook from 'APPSRC/components/view/RepositorySettingWebhook'
import RepositorySettingMembers from 'APPSRC/components/view/RepositorySettingMembers'
import RepositorySettingAdvanced from 'APPSRC/components/view/RepositorySettingAdvanced'

import GroupList from 'APPSRC/components/view/GroupList'
import NewGroup from 'APPSRC/components/view/NewGroup'
import GroupSettingGeneral from 'APPSRC/components/view/GroupSettingGeneral'
import GroupSettingMembers from 'APPSRC/components/view/GroupSettingMembers'
import GroupSettingAdvanced from 'APPSRC/components/view/GroupSettingAdvanced'

import ActivityList from 'APPSRC/components/view/ActivityList'

import FileTree from 'APPSRC/components/view/FileTree'
import CommitList from 'APPSRC/components/view/CommitList'
import BranchList from 'APPSRC/components/view/BranchList'
import TagList from 'APPSRC/components/view/TagList'
import CreateTag from 'APPSRC/components/view/CreateTag'
import CreateBranch from 'APPSRC/components/view/CreateBranch'
import CommitDetail from 'APPSRC/components/view/CommitDetail'
import MergeRequest from 'APPSRC/components/view/MergeRequest'
import CreateMergeRequest from 'APPSRC/components/view/CreateMergeRequest'
import MergeRequestDetail from 'APPSRC/components/view/MergeRequestDetail'

class MainRoutes extends React.Component {
  render () {
    return <Switch>
      <Route path='/userInfo' component={UserInfo} />

      <Route path='/settings'>
        <Switch>
          <Route exact path='/settings/profile' component={UserSettingGeneral} />
          <Route exact path='/settings/sshkey' component={UserSettingSSHKey} />
          <Route exact path='/settings/notification' component={UserSettingNotification} />
          <Route exact path='/settings/email' component={UserSettingEmail} />
          <Route path='/settings' component={UserSettingGeneral} />
        </Switch>
      </Route>

      <Route path='/admin'>
        <Switch>
          <Route exact path='/admin/users' component={AdminUsers} />
          <Route exact path='/admin/groups' component={AdminGroups} />
          <Route exact path='/admin/repositories' component={AdminRepositories} />
          <Route exact path='/admin/settings' component={AdminSettings} />
          <Route path='/admin' component={AdminDashboard} />
        </Switch>
      </Route>

      <Route path='/mergerequests'>
        <Switch>
          <Route exact path='/mergerequests' component={MergeRequest} />
          <Route exact path='/mergerequests/new' component={CreateMergeRequest} />
        </Switch>
      </Route>

      <Route path='/repositories'>
        <Switch>
          <Route exact path='/repositories/new' component={NewRepository} />
          <Route exact path='/repositories/fork/:repositoryID([0-9a-f]+)' component={NewRepositoryFork} />
          <Route exact path='/repositories/forklist/:repositoryID([0-9a-f]+)' component={RepositoryList} />
          <Route path='/repositories' component={RepositoryList} />
        </Switch>
      </Route>
      <Route path='/groups'>
        <Switch>
          <Route path='/groups/new' component={NewGroup} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})' component={RepositoryList} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/repositories' component={RepositoryList} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/members' component={GroupSettingMembers} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/activities' component={ActivityList} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/repositories/new' component={NewRepository} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/mergerequests' component={MergeRequest} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/mergerequests/new' component={CreateMergeRequest} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/settings' component={GroupSettingGeneral} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/settings/general' component={GroupSettingGeneral} />
          <Route exact path='/groups/:groupName([A-Za-z0-9_]{5,})/settings/advanced' component={GroupSettingAdvanced} />
          <Route path='/groups' component={GroupList} />
        </Switch>
      </Route>
      <Route path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)'>
        <Switch>
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/files' component={FileTree} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/files/:rev([\w\-\.%]+)' component={FileTree} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/:type(files|blame)/:rev([\w\-\.%]+):path(/.*)' component={FileTree} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/commit/:hash([0-9a-f]{8})' component={CommitDetail} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/commits' component={CommitList} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/commits/:rev([\w\-\.%]+)' component={CommitList} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/commits/:rev([\w\-\.%]+):path(/.*)' component={CommitList} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/mergerequests' component={MergeRequest} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/mergerequests/new' component={CreateMergeRequest} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/mergerequests/detail/:sourceRepository([0-9a-f]{32})/:sourceBranch([\w\-\.%]+)/:targetRepository([0-9a-f]{32})/:targetBranch([\w\-\.%]+)' component={MergeRequestDetail} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/mergerequests/:mid(\d+)' component={MergeRequestDetail} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/branches' component={BranchList} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/branches/new' component={CreateBranch} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/tags' component={TagList} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/tags/new' component={CreateTag} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/members' component={RepositorySettingMembers} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/activities' component={ActivityList} />

          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/settings' component={RepositorySettingGeneral} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/settings/general' component={RepositorySettingGeneral} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/settings/branch' component={RepositorySettingBranch} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/settings/webhook' component={RepositorySettingWebhook} />
          <Route exact path='/:groupName([A-Za-z0-9_]{5,})/:repositoryName([A-Za-z0-9_]+)/settings/advanced' component={RepositorySettingAdvanced} />

          <Route component={FileTree} />
        </Switch>
      </Route>
    </Switch>
  }
}

export default withRouter(MainRoutes)
