import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import Login from './Login'
import { isAuthenticated } from './auth'
import { workspaceRoutes } from './navigation'
import CreateProjectPage from './pages/CreateProjectPage'
import CreateUserPage from './pages/CreateUserPage'
import Dashboard from './pages/Dashboard'
import WorkspacePage from './pages/WorkspacePage'

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
        />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          {workspaceRoutes.map((route) => (
            <Route
              key={route.to}
              path={route.to}
              element={
                route.to === '/create-user' ? (
                  <CreateUserPage />
                ) : route.to === '/project-management/create-project' ? (
                  <CreateProjectPage />
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
