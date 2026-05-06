import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import Sidebar from './Sidebar'

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="md:flex">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]">
          <AppHeader />
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
