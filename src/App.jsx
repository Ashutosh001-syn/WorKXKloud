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

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

function App() {
  const allWorkspaceRoutes = [...workspaceRoutes, ...hiddenWorkspaceRoutes]

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <ForgotPassword />}
        />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          {allWorkspaceRoutes.map((route) => (
            <Route
              key={route.to}
              path={route.to}
              element={
                route.to === '/create-user' ? (
                  <CreateUserPage />
                ) : route.to === '/all-project' ? (
                  <AllProjectPage />
                ) : route.to === '/new-assigned-project' ? (
                  <NewAssignedProjectPage />
                ) : route.to === '/project-management/create-project' ? (
                  <CreateProjectPage />
                ) : route.to === '/resource/resource-master' ? (
                  <ResourceMasterPage />
                ) : route.to === '/resource/resource-allocation' ? (
                  <ResourceAllocationPage />
                ) : route.to === '/calendar' ? (
                  <CalendarPage />
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
          ))}
        </Route>

        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated() ? '/' : '/login'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
