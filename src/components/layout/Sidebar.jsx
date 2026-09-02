import { useEffect, useState } from 'react'
import {
  ChevronDown,
  Gauge,
  Grid2x2,
  LayoutDashboard,
  Menu,
  SquareChartGantt,
  ReceiptText,
  UserRoundPlus,
  UserCheck,
  X,
  Calendar,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from '../../assets/Logo.png'
import { sidebarMenu } from '../../config/navigation'
import { isResourceRole } from '../../utils/permissions'
import { getLoggedInResourceId, fetchMyTasks, groupTasksByProject } from '../../utils/myTasksData'

const iconMap = {
  allProjects: Grid2x2,
  myProjects: Grid2x2,
  dashboard: LayoutDashboard,
  expense: ReceiptText,
  projectManagement: SquareChartGantt,
  resource: Grid2x2,
  users: UserRoundPlus,
  calendar: Calendar,
  workload: Gauge,
  resourceChange: UserCheck,
  task: ClipboardList,
  risk: AlertTriangle,
  discussions: MessageSquare,
}

const DEFAULT_PROJECT_TREE = [
  { id: '1', name: 'Project 1' },
  { id: '2', name: 'Project 2' },
  { id: '3', name: 'Project 3' },
  { id: '4', name: 'Project 4' },
]

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
    findActiveGroupKey(location.pathname) || 'task',
  )
  const [userRole, setUserRole] = useState('')
  const [myProjects, setMyProjects] = useState(DEFAULT_PROJECT_TREE)

  const activeGroupKey = findActiveGroupKey(location.pathname)

  useEffect(() => {
    if (activeGroupKey) {
      setOpenMenu(activeGroupKey)
    }
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

  useEffect(() => {
    const resourceId = getLoggedInResourceId()
    if (!resourceId) return
    let cancelled = false
    queueMicrotask(async () => {
      try {
        const tasks = await fetchMyTasks(resourceId)
        if (cancelled) return
        const grouped = groupTasksByProject(tasks).map((g) => ({
          id: String(g.projectId),
          name: g.projectName,
        }))
        if (grouped.length > 0) {
          setMyProjects(grouped)
        }
      } catch {
        // Keep default tree for demonstration
      }
    })
    return () => {
      cancelled = true
    }
  }, [userRole])

  const isResource = isResourceRole(userRole) || location.pathname.startsWith('/my-tasks')

  const filteredMenu = sidebarMenu.filter((item) => {
    if (isResource) {
      return false // Handled by resource custom menu below
    }

    if (item.key === 'calendar') return true

    const isPmMenu =
      item.key === 'new-assigned-project' ||
      item.key === 'my-projects'

    if (userRole === 'pm' || userRole === 'project manager') {
      return isPmMenu
    }

    return !isPmMenu && item.key !== 'my-tasks'
  })

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
          'fixed inset-y-0 left-0 z-50 flex h-screen w-[84vw] max-w-[18rem] flex-col bg-[#0b1f3a] text-white transition-transform duration-300 md:sticky md:top-0 md:w-[220px] md:max-w-none md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 pb-6 pt-6 md:pt-5">
          <div className="w-full text-center">
            <img
              src={logo}
              alt="worXkloud logo"
              className="mx-auto h-16 w-auto object-contain"
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

        <nav className="sidebar-scroll flex-1 space-y-2 overflow-y-auto px-3 pb-8 pr-2 scroll-smooth">
          {isResource ? (
            /* Resource / Team Member Sidebar (Exact Image 1 & 2 layout) */
            <>
              {/* Dashboard */}
              <Dropdown
                icon="dashboard"
                isActive={location.pathname === '/my-tasks' || location.pathname === '/'}
                isOpen={false}
                title="Dashboard"
                onClick={() => {
                  setMobileOpen(false)
                  window.location.href = '/my-tasks'
                }}
              />

              {/* Project — dropdown holds project names, not tasks */}
              <Dropdown
                icon="task"
                isActive={location.pathname.startsWith('/my-tasks/')}
                isOpen={openMenu === 'task' || location.pathname.startsWith('/my-tasks')}
                title="Project"
                onClick={() =>
                  setOpenMenu((current) => (current === 'task' ? null : 'task'))
                }
              >
                {myProjects.map((project) => (
                  <SubItem
                    key={project.id}
                    label={project.name}
                    to={`/my-tasks/${project.id}`}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </Dropdown>

              {/* Risk */}
              <Dropdown
                icon="risk"
                isActive={location.pathname === '/risk' || location.pathname.startsWith('/risk/')}
                isOpen={openMenu === 'risk'}
                title="Risk"
                onClick={() => {
                  setOpenMenu((current) => (current === 'risk' ? null : 'risk'))
                }}
              >
                <SubItem
                  label="Risk Register"
                  to="/risk"
                  onNavigate={() => setMobileOpen(false)}
                />
              </Dropdown>

              {/* Discussions */}
              <Dropdown
                icon="discussions"
                isActive={false}
                isOpen={openMenu === 'discussions'}
                title="Discussions"
                onClick={() =>
                  setOpenMenu((current) => (current === 'discussions' ? null : 'discussions'))
                }
              >
                <SubItem
                  label="General Discussion"
                  to="/my-tasks/1?tab=Discussions"
                  onNavigate={() => setMobileOpen(false)}
                />
              </Dropdown>
            </>
          ) : (
            /* PM and Admin / PMO Menu */
            filteredMenu.map((item) => {
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
                    badgeKey={item.badgeKey}
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
            })
          )}
        </nav>
      </aside>
    </>
  )
}

function MenuItem({ icon, label, onNavigate, to, badgeKey }) {
  const Icon = iconMap[icon] || Grid2x2
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

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-all duration-200',
          isActive
            ? 'bg-[#1e4f98] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'text-slate-200 hover:bg-[#143356] hover:text-white',
        ].join(' ')
      }
    >
      <span className="flex h-5 w-5 items-center justify-center text-slate-100">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badgeKey && badgeCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
          {badgeCount}
        </span>
      )}
    </NavLink>
  )
}

function Dropdown({ children, icon, isActive, isOpen, onClick, title, badgeKey }) {
  const Icon = iconMap[icon] || Grid2x2
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

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-[14px] font-medium transition-all duration-200 cursor-pointer',
          isActive
            ? 'bg-[#1e4f98] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'text-slate-200 hover:bg-[#143356] hover:text-white',
        ].join(' ')}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center">
            <Icon size={16} strokeWidth={1.8} />
          </span>
          <span className="truncate">{title}</span>
        </span>

        <span className="flex items-center gap-2">
          {badgeKey && badgeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0052ff] px-1.5 text-[10px] font-bold text-white shadow-sm">
              {badgeCount}
            </span>
          )}
          <ChevronDown
            size={15}
            className={isOpen ? 'rotate-180 transition-transform text-slate-300' : 'transition-transform text-slate-400'}
          />
        </span>
      </button>

      <div
        className={[
          'grid overflow-hidden transition-all duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-5 mt-2 border-l border-slate-600/60 pl-3 space-y-1.5">
            {children}
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
          'relative block rounded-lg py-2 pl-5 pr-3 text-[13px] font-medium transition-colors',
          'before:absolute before:left-1.5 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-slate-400',
          isActive
            ? 'bg-[#1e4f98] text-white font-bold before:bg-white'
            : 'text-slate-300 hover:bg-[#143356] hover:text-white',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default Sidebar