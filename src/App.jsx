import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import Login from './Login'
import { isAuthenticated } from './auth'
import { hiddenWorkspaceRoutes, workspaceRoutes } from './navigation'
import AllProjectPage from './pages/AllProjectPage'
import CreateProjectPage from './pages/CreateProjectPage'
import CreateUserPage from './pages/CreateUserPage'
import Dashboard from './pages/Dashboard'
import ResourceAllocationPage from './pages/ResourceAllocationPage'
import ResourceMasterPage from './pages/ResourceMasterPage'
import WorkspacePage from './pages/WorkspacePage'
import ProfilePage from './pages/ProfilePage'

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
                ) : route.to === '/project-management/create-project' ? (
                  <CreateProjectPage />
                ) : route.to === '/resource/resource-master' ? (
                  <ResourceMasterPage />
                ) : route.to === '/resource/resource-allocation' ? (
                  <ResourceAllocationPage />
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
