import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import { isAuthenticated } from './utils/auth'
import { hiddenWorkspaceRoutes, workspaceRoutes } from './config/navigation'
import AllProjectPage from './pages/AllProjectPage'
import CreateProjectPage from './pages/CreateProjectPage'
import CreateUserPage from './pages/CreateUserPage'
import Dashboard from './pages/Dashboard'
import ResourceAllocationPage from './pages/ResourceAllocationPage'
import ResourceMasterPage from './pages/ResourceMasterPage'
import WorkspacePage from './pages/WorkspacePage'
import ProfilePage from './pages/ProfilePage'
import CalendarPage from './pages/CalendarPage'
import NewAssignedProjectPage from './pages/NewAssignedProjectPage'
import MyProjectsPage from './pages/MyProjectsPage'
import PMOReviewPage from './pages/PMOReviewPage'
import WorkloadPage from './pages/Workload/WorkloadPage'
import ResourceChangeRequestDetailPage from './pages/ResourceChangeRequestDetailPage'
import ResourceChangeRequestsListPage from './pages/ResourceChangeRequestsListPage'
import ResourceApprovalQueuePage from './pages/ResourceApprovalQueuePage'
import MyTasksPage from './pages/MyTasksPage'
import MyTaskProjectDetailPage from './pages/MyTaskProjectDetailPage'
import RiskPage from './pages/RiskPage'
import { hasPermission, isResourceRole } from './utils/permissions'

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

function RoleProtectedRoute({ element, allowedRoles }) {
  let role = ''

  try {
    const userProfileStr = localStorage.getItem('user_profile')

    if (userProfileStr) {
      const profile = JSON.parse(userProfileStr)
      role = profile.role?.toLowerCase() || ''
    }
  } catch (e) { }

  if (!hasPermission(role, allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return element
}

function RoleBasedHome() {
  let role = ''

  try {
    const userProfileStr = localStorage.getItem('user_profile')

    if (userProfileStr) {
      const profile = JSON.parse(userProfileStr)
      role = profile.role?.toLowerCase() || ''
    }
  } catch (e) { }

  if (role === 'pm' || role === 'project manager') {
    return <Navigate to="/new-assigned-project" replace />
  }

  if (isResourceRole(role)) {
    return <Navigate to="/my-tasks" replace />
  }

  return <Dashboard />
}

function App() {
  const allWorkspaceRoutes = [
    ...workspaceRoutes,
    ...hiddenWorkspaceRoutes,
  ]

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated()
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        <Route
          path="/forgot-password"
          element={
            isAuthenticated()
              ? <Navigate to="/" replace />
              : <ForgotPassword />
          }
        />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<RoleBasedHome />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/my-tasks/:projectId" element={<MyTaskProjectDetailPage />} />
          <Route path="/risk" element={<RiskPage />} />

          <Route path="/pmo/resource-requests/:requestId" element={<ResourceChangeRequestDetailPage />} />
          <Route path="/pmo/resource-change-request" element={<ResourceChangeRequestDetailPage />} />
          <Route path="/resource-change-request" element={<ResourceChangeRequestDetailPage />} />

          {allWorkspaceRoutes.map((route) => {
            let allowedRoles = []

            // ONLY PM can access these routes
            if (
              route.to === '/new-assigned-project' ||
              route.to === '/my-projects'
            ) {
              allowedRoles = ['pm', 'project manager']
            }

            return (
              <Route
                key={route.to}
                path={route.to}
                element={
                  <RoleProtectedRoute
                    allowedRoles={allowedRoles}
                    element={
                      route.to === '/create-user' ? (
                        <CreateUserPage />
                      ) : route.to === '/all-project' ? (
                        <AllProjectPage />
                      ) : route.to === '/new-assigned-project' ? (
                        <NewAssignedProjectPage />
                      ) : route.to === '/my-projects' ? (
                        <MyProjectsPage />
                      ) : route.to === '/pmo-review' ? (
                        <PMOReviewPage />
                      ) : route.to === '/pmo/resource-requests' ? (
                        <ResourceChangeRequestsListPage />
                      ) : route.to === '/pmo/resource-approval-queue' ? (
                        <ResourceApprovalQueuePage />
                      ) : route.to === '/project-management/create-project' ? (
                        <CreateProjectPage />
                      ) : route.to === '/resource/resource-master' ? (
                        <ResourceMasterPage />
                      ) : route.to === '/resource/resource-allocation' ? (
                        <ResourceAllocationPage />
                      ) : route.to === '/calendar' ? (
                        <CalendarPage />
                      ) : route.to === '/workload' ? (
                        <WorkloadPage />
                      ) : (
                        <WorkspacePage
                          eyebrow={route.eyebrow}
                          title={route.title}
                          description={route.description}
                          highlights={route.highlights}
                        />
                      )
                    }
                  />
                }
              />
            )
          })}
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated() ? '/' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App