import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  Share2,
  RotateCw,
  MoreHorizontal,
  FileText,
  List as ListIcon,
  TrendingUp,
  Kanban,
  MessageSquare,
  CheckSquare,
  History,
  PencilLine,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Link2,
} from 'lucide-react'
import {
  getLoggedInResourceId,
  getLoggedInResourceName,
  getLoggedInResourceRole,
  fetchMyTasks,
  formatDate,
  getTaskStatus,
  getProjectDateRange,
  isWithinNextDays,
  isWithinLastDays,
} from '../utils/myTasksData'
import ProjectBoardSection from '../components/projects/ProjectBoardSection'
import ProjectDiscussionSection from '../components/projects/ProjectDiscussionSection'

// No separate Backlog tab — ProjectBoardSection's own Board/Backlog/Split
// toggle (inside the Board tab) is the single Backlog view now, so it isn't
// shown twice.
const TABS = [
  { id: 'Summary', label: 'Summary', icon: FileText },
  { id: 'List', label: 'List', icon: ListIcon },
  { id: 'Project Status', label: 'Project Status', icon: TrendingUp },
  { id: 'Board', label: 'Board', icon: Kanban },
  { id: 'Discussions', label: 'Discussions', icon: MessageSquare },
]

// Dynamic Status Donut Chart
function StatusOverviewDonut({ segments, total }) {
  const size = 160
  const stroke = 18
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  let currentOffset = 0
  const safeTotal = total > 0 ? total : 1

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={stroke}
            />
          ) : (
            segments.map((seg) => {
              if (seg.value <= 0) return null
              const length = (seg.value / safeTotal) * circumference
              const dashArray = `${length} ${circumference - length}`
              const offset = currentOffset
              currentOffset += length

              return (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={dashArray}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  strokeLinecap="butt"
                />
              )
            })
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            {total}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 max-w-[70px] leading-tight">
            Today's work update
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-xs"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-slate-600 font-medium whitespace-nowrap">
              {seg.label} {seg.value > 0 ? `(${seg.value})` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyTaskProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Summary')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastMessage, setToastMessage] = useState('')
  const [listSearch, setListSearch] = useState('')
  const [listPage, setListPage] = useState(1)

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

  const items = useMemo(
    () => tasks.filter((t) => String(t.project_id) === String(projectId)),
    [tasks, projectId]
  )

  const projectName = items[0]?.project_name || `Project ${projectId || '1'}`
  // No domain/category field exists on get_userProjectList — falls back to
  // the resource's own role rather than a made-up job title.
  const projectSubtitle = items[0]?.domain || items[0]?.category || getLoggedInResourceRole() || 'Team Member'
  const dateRange = useMemo(() => getProjectDateRange(items), [items])

  // Compute dynamic stats — get_userProjectList has no status/completion
  // field, so "Completed"/"Updated" aren't knowable and are shown as "Not
  // tracked" in the UI rather than a fabricated number. created_at and
  // planned_end are real fields, so "Created" and "Due Soon" are genuine.
  const stats = useMemo(() => {
    let created = 0
    let dueSoon = 0
    let overdue = 0
    let inProgress = 0
    let upcoming = 0

    items.forEach((item) => {
      const st = getTaskStatus(item)
      if (st.key === 'overdue') overdue += 1
      else if (st.key === 'inProgress') inProgress += 1
      else upcoming += 1

      if (isWithinLastDays(item.created_at || item.planned_start, 7)) {
        created += 1
      }
      if (isWithinNextDays(item.planned_end, 7)) {
        dueSoon += 1
      }
    })

    return { created, dueSoon, overdue, inProgress, upcoming, total: items.length }
  }, [items])

  // Donut chart segments — get_userProjectList has no status field of its
  // own (see getTaskStatus in myTasksData.js), so these are the only three
  // honest buckets available: overdue/in-progress/upcoming, derived purely
  // from planned_start/planned_end vs today.
  const donutSegments = useMemo(() => [
    { key: 'overdue', label: 'Overdue', value: stats.overdue, color: '#f43f5e' },
    { key: 'inProgress', label: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { key: 'upcoming', label: 'Upcoming', value: stats.upcoming, color: '#94a3b8' },
  ], [stats])

  const workloadList = useMemo(() => {
    const map = new Map()
    items.forEach((it) => {
      const name = it.resource_name || it.user_name || loggedInName
      map.set(name, (map.get(name) || 0) + 1)
    })

    if (map.size === 0) {
      map.set(loggedInName, 1)
    }

    const totalCount = items.length || 1
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-[#0070f3]' },
      { bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-[#e15241]' },
      { bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-[#eab308]' },
      { bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-[#22c55e]' },
    ]

    return Array.from(map.entries()).map(([name, count], idx) => {
      const pct = Math.round((count / totalCount) * 100)
      const c = colors[idx % colors.length]
      return {
        name,
        percentage: pct,
        ...c,
      }
    })
  }, [items, loggedInName])

  // Types of work — get_userProjectList only distinguishes "project" (task)
  // vs "subproject" (subtask) rows; there's no Bug/Epic/Story field, so
  // those categories are left out entirely instead of being invented.
  const typeBreakdown = useMemo(() => {
    const total = items.length || 1
    const subtaskCount = items.filter((it) => it.type === 'subproject').length
    const taskCount = items.length - subtaskCount
    return {
      taskCount,
      subtaskCount,
      taskPct: Math.round((taskCount / total) * 100),
      subtaskPct: Math.round((subtaskCount / total) * 100),
    }
  }, [items])

  // Progress Bar % — same real overdue/in-progress/upcoming split as the
  // donut chart (no "Done" bucket exists in the data).
  const progressBreakdown = useMemo(() => {
    const total = items.length || 1
    const overduePct = Math.round((stats.overdue / total) * 100)
    const inProgPct = Math.round((stats.inProgress / total) * 100)
    const upcomingPct = Math.max(0, 100 - overduePct - inProgPct)
    return { overduePct, inProgPct, upcomingPct }
  }, [items, stats])

  const pageSize = 5
  const totalPages = Math.ceil(Math.max(items.length, 1) / pageSize)
  const paginatedItems = useMemo(() => {
    if (items.length === 0) return []
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage])

  // List tab — separate search + pagination from the Summary tab's table.
  const listFiltered = useMemo(() => {
    if (!listSearch.trim()) return items
    const q = listSearch.trim().toLowerCase()
    return items.filter((it) => {
      const name = it.type === 'subproject' ? it.sub_project_name : it.project_name
      return (name || '').toLowerCase().includes(q)
    })
  }, [items, listSearch])
  const listPageSize = 8
  const listTotalPages = Math.max(1, Math.ceil(listFiltered.length / listPageSize))
  const listPaginated = useMemo(() => {
    const start = (listPage - 1) * listPageSize
    return listFiltered.slice(start, start + listPageSize)
  }, [listFiltered, listPage])

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
        {/* Top Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0f172a]">
              {projectName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {projectSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Real clipboard copy — was a fake toast with no actual share
                action before. Edit was removed: there's no backend endpoint
                for a resource/team-member to edit project details, and this
                page is read-only for that role (see MyTaskProjectDetailPage
                Backlog-tab gate above). */}
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
                showToast('Refreshed project data')
              }}
              title="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-2 flex items-center justify-between border-b border-slate-200 overflow-x-auto">
          <div className="flex gap-6 sm:gap-8">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* SUMMARY TAB VIEW */}
        {activeTab === 'Summary' && (
          <div className="mt-6 space-y-6">
            {/* Top 4 KPI Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Completed — no completion field exists on
                  get_userProjectList, so this is honestly "Not tracked"
                  rather than a fabricated count. */}
              <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-[#f0f7ff] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 shadow-2xs">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Completed</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Not tracked by backend yet</p>
                </div>
              </div>

              {/* Card 2: Updated — same gap, no last-updated field exists. */}
              <div className="flex items-center gap-4 rounded-xl border border-purple-100 bg-[#fbf7ff] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-white text-purple-600 shadow-2xs">
                  <History size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Updated</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Not tracked by backend yet</p>
                </div>
              </div>

              {/* Card 3: Created */}
              <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-[#f0fdf4] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600 shadow-2xs">
                  <PencilLine size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{stats.created} Created</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">in the last 7 days</p>
                </div>
              </div>

              {/* Card 4: Due Soon */}
              <div className="flex items-center gap-4 rounded-xl border border-amber-100 bg-[#fffdf0] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-600 shadow-2xs">
                  <CalendarClock size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{stats.dueSoon} Due Soon</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">in the last 7 days</p>
                </div>
              </div>
            </div>

            {/* Grid Row 1: Status Overview & Project Overview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Card: Status Overview */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Status Overview</h3>
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                  Get a snapshot of the status of your work items.{' '}
                  <button
                    onClick={() => setActiveTab('List')}
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View all work items.
                  </button>
                </p>

                <div className="mt-4">
                  <StatusOverviewDonut
                    segments={donutSegments}
                    total={items.length}
                  />
                </div>
              </div>

              {/* Card: Project Overview */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Project Overview</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
                      Active
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-y-6 text-xs">
                  {/* Manager/client/priority aren't returned by
                      get_userProjectList — shown honestly as unavailable
                      instead of inventing a name/value (see todo.user). */}
                  <div>
                    <p className="text-slate-500 font-medium">• Manager</p>
                    <p className="mt-1 font-bold text-slate-400 text-sm italic">Not available</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">• Client name</p>
                    <p className="mt-1 font-bold text-slate-400 text-sm italic">
                      {items[0]?.client_name || 'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium">• Planned Start</p>
                    <p className="mt-1 font-bold text-slate-800 text-sm">
                      {dateRange.start ? formatDate(dateRange.start) : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">• Deadline</p>
                    <p className="mt-1 font-bold text-slate-800 text-sm">
                      {dateRange.end ? formatDate(dateRange.end) : 'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 font-medium">• Assigned To</p>
                    <p className="mt-1 font-bold text-slate-800 text-sm truncate">{loggedInName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">• Priority</p>
                    <p className="mt-1 font-bold text-slate-400 text-sm italic">{items[0]?.priority || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Row 2: Team Workload & Progress */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Card: Team Workload */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Team Workload</h3>
                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                  Get a snapshot of the status of your work items.{' '}
                  <button
                    onClick={() => setActiveTab('List')}
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View all work items.
                  </button>
                </p>

                <div className="mt-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-1 border-b border-slate-100">
                    <span>Assignee</span>
                    <span className="pr-12">Work Distribution</span>
                  </div>

                  {workloadList.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs font-medium">
                      <span className="w-20 truncate text-slate-700 font-semibold" title={w.name}>
                        {w.name}
                      </span>
                      <div className={`flex-1 h-6 rounded-md ${w.bg} border ${w.border} overflow-hidden relative flex items-center`}>
                        <div
                          className={`h-full ${w.bar} rounded-sm flex items-center justify-end pr-2 text-white font-bold text-[10px]`}
                          style={{ width: `${Math.max(w.percentage, 10)}%` }}
                        >
                          {w.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Progess */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Progess</h3>
                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                  Get a snapshot of the status of your work items.{' '}
                  <button
                    onClick={() => setActiveTab('List')}
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View all work items.
                  </button>
                </p>

                {/* Progress Legend — same real overdue/in-progress/upcoming
                    split as the donut (no "Done" field exists). */}
                <div className="mt-6 flex items-center gap-6 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-xs bg-[#f43f5e]" />
                    <span className="font-semibold text-slate-700">Overdue ({progressBreakdown.overduePct}%)</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-xs bg-[#3b82f6]" />
                    <span className="font-semibold text-slate-700">In Progress ({progressBreakdown.inProgPct}%)</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-xs bg-[#94a3b8]" />
                    <span className="font-semibold text-slate-700">Upcoming ({progressBreakdown.upcomingPct}%)</span>
                  </span>
                </div>

                {/* Multi-segment Bar */}
                <div className="mt-6 flex h-8 w-full overflow-hidden rounded-md bg-slate-100 text-white text-xs font-bold shadow-2xs">
                  {progressBreakdown.overduePct > 0 && (
                    <div
                      className="flex items-center justify-center bg-[#f43f5e] text-[11px]"
                      style={{ width: `${progressBreakdown.overduePct}%` }}
                    >
                      {progressBreakdown.overduePct}%
                    </div>
                  )}
                  {progressBreakdown.inProgPct > 0 && (
                    <div
                      className="flex items-center justify-center bg-[#3b82f6] text-[11px]"
                      style={{ width: `${progressBreakdown.inProgPct}%` }}
                    >
                      {progressBreakdown.inProgPct}%
                    </div>
                  )}
                  {progressBreakdown.upcomingPct > 0 && (
                    <div
                      className="flex items-center justify-center bg-[#94a3b8] text-[10px]"
                      style={{ width: `${progressBreakdown.upcomingPct}%` }}
                    >
                      {progressBreakdown.upcomingPct}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Row 3: Priority Breakdown & Types of work */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Card: Priority breakdown — no priority field exists on
                  get_userProjectList (see todo.user), so this is an honest
                  "not available" notice instead of a fake static chart. */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Priority breakdown</h3>
                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                  Get a holistic view of how work is being prioritized.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center text-center py-6">
                  <ChevronsUp size={28} className="text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-500">Priority data isn't available yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    The backend doesn't return a priority field for your tasks yet.
                  </p>
                </div>
              </div>

              {/* Card: Types of work */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">Types of work</h3>
                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                  Get a breakdown of work items by their types.{' '}
                  <button
                    onClick={() => setActiveTab('List')}
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View all items
                  </button>
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1">
                    <span>Type</span>
                    <span className="pr-12">Distribution</span>
                  </div>

                  {/* Task */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex w-20 items-center gap-2 font-semibold text-slate-700">
                      <CheckSquare size={14} className="text-blue-500" />
                      <span>Task</span>
                    </div>
                    <div className="flex-1 h-5 rounded-sm bg-slate-200 overflow-hidden relative">
                      <div
                        className="h-full bg-[#3b82f6] flex items-center pl-2 text-white font-bold text-[10px]"
                        style={{ width: `${Math.max(typeBreakdown.taskPct, 4)}%` }}
                      >
                        {typeBreakdown.taskPct}%
                      </div>
                    </div>
                  </div>

                  {/* Subtask */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex w-20 items-center gap-2 font-semibold text-slate-700">
                      <Link2 size={14} className="text-purple-500" />
                      <span>Subtask</span>
                    </div>
                    <div className="flex-1 h-5 rounded-sm bg-slate-200 overflow-hidden relative">
                      <div
                        className="h-full bg-[#a855f7] flex items-center pl-2 text-white font-bold text-[10px]"
                        style={{ width: `${Math.max(typeBreakdown.subtaskPct, 4)}%` }}
                      >
                        {typeBreakdown.subtaskPct}%
                      </div>
                    </div>
                  </div>

                  {/* Bug/Epic/Story have no backing field on
                      get_userProjectList — noted rather than invented. */}
                  <p className="pt-1 text-[11px] text-slate-400">
                    Bug / Epic / Story categorization isn't tracked by the backend yet.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4: Recent Activity Table (Full Width & Fully Dynamic) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-600 font-bold bg-slate-50/60">
                      <th className="py-2.5 px-4 font-bold">Sr.no</th>
                      <th className="py-2.5 px-4 font-bold">Task Name</th>
                      <th className="py-2.5 px-4 font-bold">Assigned to</th>
                      <th className="py-2.5 px-4 font-bold">Due to</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((item, idx) => {
                        const status = getTaskStatus(item)
                        const isSubtask = item.type === 'subproject'
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {(currentPage - 1) * pageSize + idx + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {isSubtask
                                ? item.sub_project_name || 'Subtask'
                                : item.project_name || 'Task'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {item.resource_name || loggedInName}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">
                              {formatDate(item.planned_end)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 italic font-medium">
                              {item.priority || 'Not set'}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          No recent task activity in this project yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-slate-500">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-6 w-6 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-6 w-6 rounded flex items-center justify-center font-medium ${
                        currentPage === i + 1 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-6 w-6 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIST TAB VIEW — Key/Updated/Comment/Reporter have no backing
            field on get_userProjectList (see todo.user), shown honestly as
            "Not available" rather than invented. Assignee is genuinely
            accurate here (not a fake fallback): every row in `items` is
            already scoped to the logged-in resource's own tasks. */}
        {activeTab === 'List' && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">Task List</h3>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center w-full sm:w-56">
                  <FileText size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={listSearch}
                    onChange={(e) => { setListSearch(e.target.value); setListPage(1) }}
                    placeholder="Search"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  {listFiltered.length} task{listFiltered.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-600 font-bold bg-slate-50/60">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Comment</th>
                    <th className="py-3 px-4">Reporter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {listPaginated.length > 0 ? (
                    listPaginated.map((item, idx) => {
                      const status = getTaskStatus(item)
                      const isSubtask = item.type === 'subproject'
                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            {isSubtask
                              ? <Link2 size={14} className="text-purple-500" />
                              : <CheckSquare size={14} className="text-blue-500" />}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 italic">Not available</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {isSubtask ? item.sub_project_name || 'Untitled Subtask' : item.project_name || 'Untitled Task'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {item.created_at ? formatDate(item.created_at) : 'Not available'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {formatDate(item.planned_end)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 italic">Not available</td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{loggedInName}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${status.badge}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 italic">Not available</td>
                          <td className="py-3.5 px-4 text-slate-400 italic">Not available</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-slate-400">
                        No tasks in this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {listTotalPages > 1 && (
              <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 p-3 text-xs text-slate-500">
                <button
                  onClick={() => setListPage((p) => Math.max(p - 1, 1))}
                  disabled={listPage === 1}
                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft size={12} />
                </button>
                {Array.from({ length: listTotalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setListPage(i + 1)}
                    className={`h-6 w-6 rounded flex items-center justify-center font-medium ${
                      listPage === i + 1 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setListPage((p) => Math.min(p + 1, listTotalPages))}
                  disabled={listPage === listTotalPages}
                  className="h-6 w-6 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOARD TAB VIEW */}
        {activeTab === 'Board' && (
          <div className="mt-6">
            <ProjectBoardSection projectId={projectId} readOnly />
          </div>
        )}


        {/* DISCUSSIONS TAB VIEW */}
        {activeTab === 'Discussions' && (
          <div className="mt-6">
            <ProjectDiscussionSection selectedProjectId={projectId} />
          </div>
        )}

        {/* PROJECT STATUS TAB VIEW */}
        {activeTab === 'Project Status' && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-bold text-slate-900">Project Status & Timeline</h3>
            <p className="text-xs text-slate-500 mt-1">
              Overall milestone progression and health index.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Planned Start</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {dateRange.start ? formatDate(dateRange.start) : 'Not available'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Target Deadline</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {dateRange.end ? formatDate(dateRange.end) : 'Not available'}
                </p>
              </div>
              {/* No health-index/milestone field exists yet (see
                  todo.user) — shown honestly rather than a fake constant. */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Health Index</span>
                <p className="text-sm font-bold text-slate-400 italic mt-1">Not available</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default MyTaskProjectDetailPage
