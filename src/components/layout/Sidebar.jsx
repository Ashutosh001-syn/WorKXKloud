import { useEffect, useState } from 'react'
import {
  ChevronDown,
  Grid2x2,
  LayoutDashboard,
  Menu,
  SquareChartGantt,
  ReceiptText,
  UserRoundPlus,
  X,
  Calendar,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from '../../assets/Logo.png'
import { sidebarMenu } from '../../config/navigation'

const iconMap = {
  allProjects: Grid2x2,
  myProjects: Grid2x2,
  dashboard: LayoutDashboard,
  expense: ReceiptText,
  projectManagement: SquareChartGantt,
  resource: Grid2x2,
  users: UserRoundPlus,
  calendar: Calendar,
}

function matchesPath(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function findActiveGroupKey(pathname) {
  const activeGroup = sidebarMenu.find(
    (item) =>
      item.type === 'group' &&
      item.children.some((child) => matchesPath(pathname, child.to)),
  )

  return activeGroup?.key ?? null
}

function Sidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(() =>
    findActiveGroupKey(location.pathname),
  )
  const [userRole, setUserRole] = useState('')

  const activeGroupKey = findActiveGroupKey(location.pathname)

  useEffect(() => {
    setOpenMenu(activeGroupKey)
  }, [activeGroupKey])

  useEffect(() => {
    const handler = () => setMobileOpen(true)
    document.addEventListener('open-sidebar', handler)
    return () => document.removeEventListener('open-sidebar', handler)
  }, [])

  useEffect(() => {
    try {
      const profileStr = localStorage.getItem('user_profile')
      if (profileStr) {
        const profile = JSON.parse(profileStr)
        setUserRole(profile.role?.toLowerCase() || '')
      }
    } catch (e) {
      // ignore
    }
  }, [])

 const filteredMenu = sidebarMenu.filter((item) => {
  const isPmMenu =
    item.key === 'new-assigned-project' ||
    item.key === 'my-projects';

  if (userRole === 'pm' || userRole === 'project manager') {
    return isPmMenu;
  }

  return !isPmMenu;
});

  return (
    <>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[84vw] max-w-[18rem] flex-col bg-[#0d2646] text-white transition-transform duration-300 md:sticky md:top-0 md:w-[210px] md:max-w-none md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 pb-8 pt-6 md:pt-4">
          <div className="w-full text-center">
            <img
              src={logo}
              alt="worXkloud logo"
              className="mx-auto h-20 w-auto object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-scroll flex-1 space-y-3 overflow-y-auto px-2.5 pb-8 pr-1 scroll-smooth">
          {filteredMenu.map((item) => {
            if (item.type === 'group') {
              const isOpen = openMenu === item.key || activeGroupKey === item.key
              const isActive = item.children.some((child) =>
                matchesPath(location.pathname, child.to),
              )

              return (
                <Dropdown
                  key={item.key}
                  icon={item.icon}
                  isActive={isActive}
                  isOpen={isOpen}
                  title={item.label}
                  onClick={() =>
                    setOpenMenu((current) =>
                      current === item.key ? null : item.key,
                    )
                  }
                >
                  {item.children.map((child) => (
                    <SubItem
                      key={child.to}
                      label={child.label}
                      to={child.to}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </Dropdown>
              )
            }

            return (
              <MenuItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                to={item.to}
                badgeKey={item.badgeKey}
                onNavigate={() => setMobileOpen(false)}
              />
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function MenuItem({ icon, label, onNavigate, to, badgeKey }) {
  const Icon = iconMap[icon]
  const [badgeCount, setBadgeCount] = useState(0)

  useEffect(() => {
    if (!badgeKey) return
    const update = () => {
      const val = parseInt(localStorage.getItem(badgeKey) || '0', 10)
      setBadgeCount(val)
    }
    update()
    window.addEventListener('badge-update', update)
    return () => window.removeEventListener('badge-update', update)
  }, [badgeKey])

  if (!Icon) {
    return null
  }

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-200',
          isActive
            ? 'bg-[#0052ff] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'text-slate-200 hover:bg-[#143356] hover:text-white',
        ].join(' ')
      }
    >
      <span className="flex h-5 w-5 items-center justify-center text-slate-100">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span className="flex-1">{label}</span>
      {badgeKey && badgeCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
          {badgeCount}
        </span>
      )}
    </NavLink>
  )
}

function Dropdown({ children, icon, isActive, isOpen, onClick, title }) {
  const Icon = iconMap[icon]

  if (!Icon) {
    return null
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-all duration-200',
          isActive
            ? 'bg-[#215497] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'text-slate-200 hover:bg-[#143356] hover:text-white',
        ].join(' ')}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center">
            <Icon size={16} strokeWidth={1.8} />
          </span>
          <span>{title}</span>
        </span>

        <ChevronDown
          size={16}
          className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </button>

      <div
        className={[
          'grid overflow-hidden transition-all duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-4 mt-3 border-l border-[#6e86aa] pl-3">
            <div className="space-y-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubItem({ label, onNavigate, to }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'relative block rounded-xl py-3 pl-6 pr-3 text-[13px] transition-colors',
          'before:absolute before:left-2 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-slate-300/90',
          isActive
            ? 'bg-[#1e4f98] text-white'
            : 'text-slate-300 hover:bg-[#17365d] hover:text-white',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default Sidebar
