import { Bell, Search, UserCircle2 } from 'lucide-react'

function HeaderIconButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-100 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0d2646]">
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6 lg:px-8">
        <div>
          <h1 className="text-[1.55rem] font-semibold tracking-[-0.04em] text-white">
            Hello, Admin
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <HeaderIconButton label="Search">
            <Search size={16} strokeWidth={1.9} />
          </HeaderIconButton>
          <HeaderIconButton label="Notifications">
            <Bell size={16} strokeWidth={1.9} />
          </HeaderIconButton>
          <HeaderIconButton label="Profile">
            <UserCircle2 size={17} strokeWidth={1.9} />
          </HeaderIconButton>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
