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
import WorkloadPage from './pages/Workload/WorkloadPage'
import { hasPermission } from './utils/permissions'
import GanttChart from './components/projects/GanttChart'
import Sidebar from './components/layout/Sidebar'
import AppHeader from './components/layout/AppHeader'

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
          path="/__preview-gantt"
          element={
            <div className="h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
              <div className="flex h-full flex-col md:flex-row">
                <Sidebar />
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8fafc]">
                  <AppHeader />
                  <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
                    <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8">
                      <div className="mx-auto max-w-[1280px]">
                        <div className="rounded-[28px] bg-white p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(3,10,24,0.14)]">
                          <GanttChart tasks={{ data: [], links: [] }} projectName="Preview" onClose={() => {}} pmId="preview" projectId="preview" />
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          }
        />

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