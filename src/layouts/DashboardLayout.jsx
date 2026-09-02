import { Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import Sidebar from '../components/layout/Sidebar'

function DashboardLayout() {
  return (
    <div className="h-screen overflow-hidden bg-[#0b1f3a] text-slate-900">
      <div className="flex h-full flex-col md:flex-row">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0b1f3a]">
          <AppHeader />
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout