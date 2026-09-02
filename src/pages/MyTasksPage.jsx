import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  Rocket,
  Share2,
  RotateCw,
  Layers,
} from 'lucide-react'
import {
  getLoggedInResourceId,
  getLoggedInResourceName,
  fetchMyTasks,
  formatDate,
  groupTasksByProject,
  getProjectDateRange,
} from '../utils/myTasksData'

// Helpers to get user initials & color
function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-cyan-600',
]

function getAvatarColor(str) {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function MyTasksPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toastMessage, setToastMessage] = useState('')

  const resourceId = getLoggedInResourceId()
  const loggedInName = getLoggedInResourceName() || 'You'

  const load = async () => {
    if (!resourceId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await fetchMyTasks(resourceId)
      setTasks(data)
    } catch (err) {
      setError(err.message || 'Unable to reach server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => load())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Group dynamic tasks by project — no fake template when a resource has
  // no assigned tasks yet; the empty state below is what shows instead.
  const groupedProjects = useMemo(() => {
    return groupTasksByProject(tasks).map((g) => {
      const { start, end } = getProjectDateRange(g.items)
      // Extract distinct assignees actually present on this resource's own
      // task rows — never invented placeholder names.
      const assigneeSet = new Set()
      g.items.forEach((it) => {
        if (it.resource_name) assigneeSet.add(it.resource_name)
        if (it.user_name) assigneeSet.add(it.user_name)
      })
      if (assigneeSet.size === 0) {
        assigneeSet.add(loggedInName)
      }

      const teamList = Array.from(assigneeSet).map((name) => ({
        name,
        initials: getInitials(name),
        color: getAvatarColor(name),
      }))

      // get_userProjectList has no priority/category field — shown honestly
      // rather than defaulting to a specific fake value (see todo.user).
      const priority = g.items[0]?.priority || 'Not set'
      const category = g.items[0]?.category || g.items[0]?.domain || null

      const dueDateRaw = end || start || null

      return {
        projectId: String(g.projectId),
        projectName: g.projectName || 'Untitled Project',
        category,
        dueDate: dueDateRaw ? formatDate(dueDateRaw) : null,
        dueDateRaw,
        priority,
        items: g.items,
        team: teamList,
      }
    })
  }, [tasks, loggedInName])

  const filteredProjects = useMemo(() => {
    return groupedProjects.filter((proj) => {
      if (search && !proj.projectName.toLowerCase().includes(search.toLowerCase())) return false
      if (priorityFilter !== 'All' && proj.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false
      if (dateFilter) {
        if (!proj.dueDateRaw) return false
        const picked = new Date(dateFilter)
        if (
          proj.dueDateRaw.getFullYear() !== picked.getFullYear() ||
          proj.dueDateRaw.getMonth() !== picked.getMonth() ||
          proj.dueDateRaw.getDate() !== picked.getDate()
        ) return false
      }
      return true
    })
  }, [groupedProjects, search, dateFilter, priorityFilter])

  return (
    <div className="min-h-full bg-[#0b1f3a] p-4 md:p-6 lg:p-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl transition-all">
          {toastMessage}
        </div>
      )}

      {/* Main White Rounded Card */}
      <section className="rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-[0_20px_50px_rgba(2,12,28,0.25)] min-h-[85vh]">
        {/* Header inside Card */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0f172a]">
            For You
          </h1>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Real clipboard copy (was a fake toast before). Edit was
                removed — no "dashboard preferences" feature/endpoint
                actually exists yet. */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  showToast('Link copied to clipboard')
                } catch {
                  showToast('Could not copy link')
                }
              }}
              title="Copy link"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                load()
                showToast('Refreshed projects data')
              }}
              title="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Filters Bar — Clean single inputs without double borders */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex items-center w-full sm:w-64 md:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Projects name"
              className="!w-full !h-10 !pl-9 !pr-4 !rounded-xl !border !border-slate-200 !bg-white !text-sm !text-slate-800 !outline-none !shadow-xs hover:!border-slate-300 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-100 placeholder:!text-slate-400"
            />
          </div>

          {/* Date Picker */}
          <div className="relative flex items-center">
            <Calendar
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="!h-10 !pl-9 !pr-3 !rounded-xl !border !border-slate-200 !bg-white !text-xs sm:!text-sm !text-slate-600 !outline-none !shadow-xs hover:!border-slate-300 focus:!border-blue-500 cursor-pointer"
            />
          </div>

          {/* "All" Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="!appearance-none !h-10 !rounded-xl !border !border-slate-200 !bg-white !pl-3.5 !pr-8 !text-xs sm:!text-sm !font-medium !text-slate-600 !outline-none hover:!border-slate-300 focus:!border-blue-500 cursor-pointer !shadow-xs"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* "All Priorities" Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="!appearance-none !h-10 !rounded-xl !border !border-slate-200 !bg-white !pl-3.5 !pr-8 !text-xs sm:!text-sm !font-medium !text-slate-600 !outline-none hover:!border-slate-300 focus:!border-blue-500 cursor-pointer !shadow-xs"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-20 flex flex-col items-center justify-center py-20 text-center">
            <Loader2 size={36} className="text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading your projects...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && tasks.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle size={30} className="text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
          </div>
        )}

        {/* Empty State — no tasks assigned yet vs. filters hiding everything
            are shown as distinct, honest messages (no fake sample project). */}
        {!loading && !error && groupedProjects.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center py-20 text-center">
            <Layers size={44} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No projects assigned to you yet.</p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs">
              Once your PM assigns you tasks on a project, it'll show up here.
            </p>
          </div>
        )}

        {!loading && groupedProjects.length > 0 && filteredProjects.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center py-20 text-center">
            <Layers size={44} className="text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No projects match your filter.</p>
            <button
              onClick={() => {
                setSearch('')
                setDateFilter('')
                setPriorityFilter('All')
                setStatusFilter('All')
              }}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Project Cards Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                onClick={() => navigate(`/my-tasks/${project.projectId}`)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300 cursor-pointer"
              >
                {/* Top Dark Navy Graphic Banner */}
                <div className="relative h-24 w-full bg-[#0c2340] overflow-hidden">
                  {/* Stylized geometric background art matching Image 1 */}
                  <svg
                    className="absolute inset-0 h-full w-full opacity-90"
                    viewBox="0 0 260 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Orange accent polygon/triangle on top-left */}
                    <polygon
                      points="10,0 65,0 35,45 0,25"
                      fill="#e05738"
                      opacity="0.9"
                    />
                    {/* Darker geometric shape */}
                    <polygon
                      points="20,10 85,0 45,55"
                      fill="#b93b22"
                      opacity="0.4"
                    />
                    {/* Golden/Yellow hexagon on top-right */}
                    <polygon
                      points="200,10 216,2 232,10 232,26 216,34 200,26"
                      fill="#e5a919"
                      opacity="0.95"
                    />
                    {/* Subtle circle line and grid lines */}
                    <circle cx="216" cy="18" r="28" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                    <line x1="0" y1="50" x2="260" y2="50" stroke="#ffffff" strokeWidth="0.5" opacity="0.08" />
                  </svg>

                  {/* Top-Right Arrow Action Circle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/my-tasks/${project.projectId}`)
                    }}
                    className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shadow-md transition-transform duration-200 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white"
                    aria-label="Open project"
                  >
                    <ArrowUpRight size={17} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Card Body with Overlapping Project Icon */}
                <div className="relative px-5 pb-5 pt-3">
                  {/* Floating Circular Rocket Icon */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f1fd] text-[#0062ff] shadow-sm ring-4 ring-white">
                      <Rocket size={19} strokeWidth={2.2} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-[15px] font-bold text-[#0f172a] truncate group-hover:text-blue-600 transition-colors">
                        {project.projectName}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {project.category || `${project.items.length} task${project.items.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </div>

                  {/* Meta: Due Date & Priority — "Not set"/"Not available"
                      are honest, not fabricated defaults (see todo.user). */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="text-slate-500 font-medium">
                      Due: <strong className="font-semibold text-slate-800">{project.dueDate || 'Not available'}</strong>
                    </span>
                    <span className="text-slate-500 font-medium">
                      Priority: <strong className="font-semibold text-slate-400 italic">{project.priority}</strong>
                    </span>
                  </div>

                  {/* Bottom Footer: Dynamic Team Avatars Stack + Chevron */}
                  <div className="mt-3.5 flex items-center justify-center pt-1">
                    <div className="flex items-center gap-1.5 cursor-pointer">
                      <div className="flex -space-x-2 overflow-hidden items-center py-0.5">
                        {project.team.map((member, i) => (
                          <div
                            key={i}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${member.color} text-white ring-2 ring-white text-[10px] font-bold shadow-xs tracking-tight`}
                            title={member.name}
                          >
                            {member.initials}
                          </div>
                        ))}
                      </div>
                      <ChevronDown size={14} className="text-slate-400 ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyTasksPage
