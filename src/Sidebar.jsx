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
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from './assets/Logo.png'
import { sidebarMenu } from './navigation'

const iconMap = {
  allProjects: Grid2x2,
  dashboard: LayoutDashboard,
  expense: ReceiptText,
  projectManagement: SquareChartGantt,
  resource: Grid2x2,
  users: UserRoundPlus,
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

  const activeGroupKey = findActiveGroupKey(location.pathname)

  useEffect(() => {
    setOpenMenu(activeGroupKey)
  }, [activeGroupKey])

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0d2646] px-4 py-4 text-white shadow-lg md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-3">
          <img src={logo} alt="XPM.ai logo" className="h-10 w-auto object-contain mx-auto" />

        </div>
      </div>

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
          {sidebarMenu.map((item) => {
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
                onNavigate={() => setMobileOpen(false)}
              />
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function MenuItem({ icon, label, onNavigate, to }) {
  const Icon = iconMap[icon]

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
            ? 'bg-[#18498a] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
            : 'text-slate-200 hover:bg-[#143356] hover:text-white',
        ].join(' ')
      }
    >
      <span className="flex h-5 w-5 items-center justify-center text-slate-100">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span>{label}</span>
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
