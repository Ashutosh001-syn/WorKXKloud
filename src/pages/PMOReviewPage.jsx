import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import {
  ArrowLeft,
  Snowflake,
  CheckCircle2,
  XCircle,
  Clock3,
  Inbox,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
  ClipboardList,
  Building2,
  MapPin,
  Calendar,
  Wallet,
  Code2,
  FileText,
  Users,
  Layers,
  ChevronRight,
  User,
} from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'
import {
  WORKFLOW_STATUS,
  WORKFLOW_STATUS_META,
  FORCED_PMO_ID,
  deriveWorkflowStatus,
  getEffectiveWorkflow,
  getWorkflow,
  setWorkflow,
} from '../utils/scheduleWorkflow'

// The PMO's own id — same pattern as getPmId() elsewhere (localStorage
// auth_user). PMO doesn't need the project's PM id for scheduleStatusByPm,
// only their own.
//
// TODO(backend): there's no "which PMO reviews this project" assignment yet,
// so this is forced to the same FORCED_PMO_ID as the PM side's write
// (scheduleWorkflow.js) for now, regardless of who's logged in — otherwise
// PM's freeze call and this page's read never match. Swap both back to the
// real logged-in id once PMO assignment exists.
const getPmoId = () => FORCED_PMO_ID

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Computes the actual scheduled timeline (earliest task start and latest task end)
// from the PM's schedule and calculates variance against the planned deadline.
function getTimelineStats(project, tasks = []) {
  if (!project) return {}

  let allStarts = []
  let allEnds = []

  // Check backend schedule tasks and subtasks
  if (Array.isArray(tasks)) {
    tasks.forEach((t) => {
      if (t.planned_start) allStarts.push(new Date(t.planned_start).getTime())
      if (t.start_date) allStarts.push(new Date(t.start_date).getTime())
      if (t.planned_end) allEnds.push(new Date(t.planned_end).getTime())
      if (t.end_date) allEnds.push(new Date(t.end_date).getTime())

      if (Array.isArray(t.sub_tasks)) {
        t.sub_tasks.forEach((st) => {
          if (st.planned_start) allStarts.push(new Date(st.planned_start).getTime())
          if (st.planned_end) allEnds.push(new Date(st.planned_end).getTime())
        })
      }
    })
  }

  // Also check local workflow snapshot if available
  try {
    const localWf = getWorkflow(project.id)
    if (localWf?.scheduleData?.data && Array.isArray(localWf.scheduleData.data)) {
      localWf.scheduleData.data.forEach((item) => {
        if (item.start_date) allStarts.push(new Date(item.start_date).getTime())
        if (item.end_date) allEnds.push(new Date(item.end_date).getTime())
      })
    }
  } catch {}

  // Filter valid timestamps
  allStarts = allStarts.filter((ts) => !isNaN(ts) && ts > 0)
  allEnds = allEnds.filter((ts) => !isNaN(ts) && ts > 0)

  const actualStartMs = allStarts.length > 0 ? Math.min(...allStarts) : null
  const actualEndMs = allEnds.length > 0 ? Math.max(...allEnds) : null

  const actualStartDate = actualStartMs
    ? new Date(actualStartMs).toISOString().split('T')[0]
    : project.startDate || null
  const actualEndDate = actualEndMs
    ? new Date(actualEndMs).toISOString().split('T')[0]
    : project.deadline || null

  let actualDuration = null
  if (actualStartMs && actualEndMs) {
    actualDuration = Math.max(1, Math.round((actualEndMs - actualStartMs) / (1000 * 60 * 60 * 24)) + 1)
  } else if (project.duration) {
    actualDuration = Number(project.duration)
  }

  // Variance calculation vs Planned Deadline
  let varianceStatus = null
  let varianceTone = 'bg-slate-100 text-slate-700'
  let varianceLabel = 'Timeline Aligned'
  let varianceDetails = ''
  let varianceIcon = CheckCircle2

  if (project.deadline && actualEndDate) {
    const plannedEndMs = new Date(project.deadline).getTime()
    const scheduledEndMs = new Date(actualEndDate).getTime()
    if (!isNaN(plannedEndMs) && !isNaN(scheduledEndMs)) {
      const diffDays = Math.round((scheduledEndMs - plannedEndMs) / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        varianceStatus = 'delayed'
        varianceTone = 'bg-rose-50 border border-rose-200/80 text-rose-700'
        varianceLabel = `Schedule extends ${diffDays} day${diffDays > 1 ? 's' : ''} past planned deadline`
        varianceDetails = `+${diffDays} Days Variance`
        varianceIcon = AlertCircle
      } else if (diffDays < 0) {
        varianceStatus = 'ahead'
        varianceTone = 'bg-emerald-50 border border-emerald-200/80 text-emerald-700'
        varianceLabel = `Schedule finishes ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ahead of deadline`
        varianceDetails = `${diffDays} Days Ahead`
        varianceIcon = CheckCircle2
      } else {
        varianceStatus = 'on_time'
        varianceTone = 'bg-blue-50 border border-blue-200/80 text-blue-700'
        varianceLabel = 'Actual schedule matches planned deadline'
        varianceDetails = 'On Schedule'
        varianceIcon = CheckCircle2
      }
    }
  }

  return {
    actualStartDate,
    actualEndDate,
    actualDuration,
    hasTasks: allStarts.length > 0,
    varianceStatus,
    varianceTone,
    varianceLabel,
    varianceDetails,
    varianceIcon,
  }
}

const STATUS_ICON = {
  [WORKFLOW_STATUS.FROZEN_PENDING_REVIEW]: Clock3,
  [WORKFLOW_STATUS.APPROVED]: CheckCircle2,
  [WORKFLOW_STATUS.REJECTED]: XCircle,
  [WORKFLOW_STATUS.DRAFT]: Snowflake,
}

function StatusBadge({ status, size = 'sm' }) {
  const meta = WORKFLOW_STATUS_META[status]
  const Icon = STATUS_ICON[status] || Snowflake
  const sizeClass = size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-3 py-1 text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm ${sizeClass} ${meta.tone}`}>
      <Icon size={size === 'lg' ? 13 : 12} />
      {meta.label}
    </span>
  )
}

function SectionLabel({ icon, children }) {
  const SectionIcon = icon
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
      <SectionIcon size={13} />
      {children}
    </div>
  )
}

function InfoField({ label, value, valueClassName = 'text-slate-700' }) {
  const cleanVal =
    value === 'null' || value === null || value === undefined || value === '' ? '-' : value
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`font-semibold mt-0.5 ${valueClassName}`}>{cleanVal}</p>
    </div>
  )
}

function PMOReviewPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const pmoId = getPmoId()
      if (!pmoId) {
        setError('Unable to determine your PMO ID. Please log in again.')
        return
      }

      const [statusRes, listRes] = await Promise.all([
        fetch(API_ENDPOINTS.GET_PROJECTS_STATUS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pmo_id: pmoId }),
        })
          .then((r) => r.json())
          .catch(() => ({ success: false })),
        fetch(API_ENDPOINTS.GET_PROJECT_LIST)
          .then((r) => r.json())
          .catch(() => ({ success: false })),
      ])

      const statusProjects = statusRes?.success && Array.isArray(statusRes.data) ? statusRes.data : []
      const allProjects = listRes?.success && Array.isArray(listRes.data) ? listRes.data : []

      const mergedMap = new Map()

      // 1. Add all projects from full project register
      allProjects.forEach((p) => {
        mergedMap.set(String(p.id), {
          ...p,
          pm_status: p.pm_status || 'draft',
          pmo_status: p.pmo_status || '',
        })
      })

      // 2. Overlay specific PMO status records
      statusProjects.forEach((p) => {
        const existing = mergedMap.get(String(p.id)) || {}
        mergedMap.set(String(p.id), {
          ...existing,
          ...p,
        })
      })

      const combined = Array.from(mergedMap.values())
      setProjects(combined)
    } catch (err) {
      setError(err.message || 'Unable to reach server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { queueMicrotask(() => fetchProjects()) }, [])

  const rows = useMemo(() => {
    return projects.map((p) => ({
      id: p.id,
      projectName: p.project_name,
      projectCode: p.project_code,
      pm: p.project_manager,
      clientName: p.company_name,
      deadline: p.end_date,
      priority: p.priority,
      // Extra fields only the detail modal needs — kept off the card itself
      // to keep the list scannable.
      startDate: p.start_date,
      duration: p.duration,
      projectType: p.project_type,
      methodology: p.methodology,
      projectScope: p.project_scope,
      location: p.location,
      budget: p.budget,
      noBilling: p.no_billing,
      technology: p.technology,
      contacts: Array.isArray(p.contacts) ? p.contacts : [],
      // resource_allocations comes back as a JSON *string*, not an array —
      // parse defensively, project genuinely has none, or the JSON is malformed.
      resourceAllocations: (() => {
        if (Array.isArray(p.resource_allocations)) return p.resource_allocations
        try {
          const parsed = JSON.parse(p.resource_allocations || '[]')
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })(),
      // Real backend milestones (name/%/date) from getProjectsStatus — used
      // as a fallback while the full Gantt schedule (fetched separately
      // below via get_project_schedule) is loading or genuinely empty.
      milestones: Array.isArray(p.milestones) ? p.milestones : [],
      workflow: getEffectiveWorkflow(p),
    }))
  }, [projects])

  const pendingReview = rows.filter((r) => r.workflow.status === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW)
  const decided = rows.filter((r) =>
    r.workflow.status === WORKFLOW_STATUS.APPROVED || r.workflow.status === WORKFLOW_STATUS.REJECTED
  )
  const viewingProject = rows.find((r) => r.id === viewingId) || null

  const closeModal = () => {
    setViewingId(null)
    setRejectingId(null)
    setApprovingId(null)
    setRejectNote('')
  }

  // The real, full Gantt schedule (same data PM sees/edits) — read-only
  // here, no edit UI. get_project_schedule only needs project_id (pm_id is
  // an optional extra filter), so PMO can fetch it directly without needing
  // the project's PM id. Fetched for every listed project so "View Full
  // Details" has it ready whether the project is pending or already decided.
  const [scheduleByProject, setScheduleByProject] = useState({})
  const allIds = rows.map((r) => r.id).join(',')

  const viewingTimelineStats = useMemo(() => {
    if (!viewingProject) return {}
    const tasks = scheduleByProject[String(viewingProject.id)] || []
    return getTimelineStats(viewingProject, tasks)
  }, [viewingProject, scheduleByProject])

  useEffect(() => {
    if (!allIds) return
    const ids = allIds.split(',')
    queueMicrotask(async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await fetch(API_ENDPOINTS.GET_PROJECT_SCHEDULE, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ project_id: id }),
            })
            const data = await response.json()
            return [id, data?.success ? (data.data || []) : []]
          } catch {
            return [id, []]
          }
        })
      )
      setScheduleByProject(Object.fromEntries(entries))
    })
  }, [allIds])

  const handleApprove = async (project) => {
    // 1. Optimistic local update
    setProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(project.id)
          ? { ...p, pmo_status: 'approved', reason: '' }
          : p
      )
    )
    closeModal()

    // 2. Persist to storage & backend
    await setWorkflow(project.id, WORKFLOW_STATUS.APPROVED, '', getPmoId())
    await fetchProjects()
  }

  const handleRejectSubmit = async (project) => {
    const note = rejectNote.trim()
    if (!note) return

    // 1. Optimistic local update
    setProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(project.id)
          ? { ...p, pmo_status: 'rejected', reason: note }
          : p
      )
    )
    setRejectingId(null)
    setRejectNote('')
    closeModal()

    // 2. Persist to storage & backend
    await setWorkflow(project.id, WORKFLOW_STATUS.REJECTED, note, getPmoId())
    await fetchProjects()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071126] via-[#0b1b3d] to-[#060c1d] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1320px]">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white mb-6 bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>

        {/* Main Glassmorphic Container */}
        <div className="rounded-[32px] bg-white p-6 sm:p-8 md:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-slate-100">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-100 pb-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
                <ClipboardList size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  PMO Review
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Review, approve, or reject project schedules frozen by Project Managers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BackButton fallbackUrl="/dashboard" label="Back to Dashboard" />

              {!loading && !error && (
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/90 px-4 py-1.5 text-xs font-bold text-amber-800 shadow-2xs">
                    <Clock3 size={14} className="text-amber-600" /> {pendingReview.length} Pending Review
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                    <CheckCircle2 size={14} className="text-emerald-600" /> {decided.length} Decided
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
              <Loader2 size={42} className="text-blue-600 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-700">Loading project schedules...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 mb-4 shadow-sm">
                <AlertCircle size={32} className="text-rose-500" />
              </div>
              <p className="text-sm font-bold text-slate-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-600/20"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Pending Review Section */}
              <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Pending Review</span>
                    <span className="rounded-full bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 font-bold">
                      {pendingReview.length}
                    </span>
                  </h2>
                </div>

                {pendingReview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <Inbox size={26} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No schedules waiting on review</p>
                    <p className="text-xs text-slate-400 mt-0.5">All frozen schedules have been processed.</p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {pendingReview.map((project) => (
                      <div
                        key={project.id}
                        className="group text-left rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-white p-6 shadow-[0_6px_24px_rgba(245,158,11,0.09)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.18)] hover:-translate-y-1 hover:border-amber-400 transition-all duration-300 relative flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-extrabold text-slate-900 text-base truncate group-hover:text-blue-600 transition">
                                {project.projectName}
                              </h3>
                              <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                {project.projectCode}
                              </p>
                            </div>
                            <StatusBadge status={project.workflow.status} />
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-y-3.5 gap-x-3 text-xs bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                            <InfoField label="PM" value={project.pm} />
                            <InfoField label="Client" value={project.clientName} />
                            <InfoField label="Deadline" value={formatDate(project.deadline)} />
                            <InfoField label="Priority" value={project.priority} />
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setViewingId(project.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
                          >
                            <Eye size={14} />
                            Review & Decision
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recently Decided Section */}
              {decided.length > 0 && (
                <section className="mt-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Recently Decided</span>
                      <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 font-bold">
                        {decided.length}
                      </span>
                    </h2>
                  </div>

                  <div className="overflow-x-auto rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/90 text-slate-500 border-b border-slate-200/80">
                          <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px]">Project</th>
                          <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px]">PM</th>
                          <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px]">Decision Status</th>
                          <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px]">PMO Note</th>
                          <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {decided.map((project) => (
                          <tr key={project.id} className="hover:bg-blue-50/30 transition">
                            <td className="px-5 py-4 font-bold text-slate-900">
                              {project.projectName}
                              <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{project.projectCode}</span>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-600">{project.pm || '-'}</td>
                            <td className="px-5 py-4">
                              <StatusBadge status={project.workflow.status} />
                            </td>
                            <td className="px-5 py-4 text-slate-500 max-w-[260px] truncate font-medium">
                              {project.workflow.note || '-'}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => setViewingId(project.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 px-3 py-1.5 text-xs font-bold text-blue-600 transition cursor-pointer shadow-2xs"
                              >
                                <Eye size={13} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {/* Production-Ready Review Modal */}
      {viewingProject && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-md px-4 py-8 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-3xl rounded-[32px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-7 py-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-extrabold text-white truncate">{viewingProject.projectName}</h3>
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-200">
                    {viewingProject.projectCode}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  PM: <span className="text-white font-semibold">{viewingProject.pm || '-'}</span> &bull; Client:{' '}
                  <span className="text-white font-semibold">{viewingProject.clientName || '-'}</span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[72vh] overflow-y-auto px-7 py-6 flex flex-col gap-6">
              {/* Status Header Badge */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={viewingProject.workflow.status} size="lg" />
                  {viewingProject.workflow.note && (
                    <span className="text-xs text-slate-600 font-medium">— {viewingProject.workflow.note}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {viewingProject.priority} Priority
                </span>
              </div>

              {/* Overview Section */}
              <div>
                <SectionLabel icon={Building2}>Project Overview</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 text-xs rounded-2xl bg-slate-50/80 border border-slate-100 p-5 shadow-2xs">
                  <InfoField label="PM" value={viewingProject.pm} />
                  <InfoField label="Client" value={viewingProject.clientName} />
                  <InfoField label="Location" value={viewingProject.location} />
                  <InfoField label="Planned Start" value={formatDate(viewingProject.startDate)} />
                  <InfoField label="Planned End (Deadline)" value={formatDate(viewingProject.deadline)} />
                  <InfoField label="Planned Duration" value={viewingProject.duration ? `${viewingProject.duration} days` : null} />
                  <InfoField
                    label="Actual Project Start"
                    value={formatDate(viewingTimelineStats.actualStartDate)}
                    valueClassName="font-bold text-blue-700"
                  />
                  <InfoField
                    label="Actual Project End"
                    value={formatDate(viewingTimelineStats.actualEndDate)}
                    valueClassName="font-bold text-blue-700"
                  />
                  <InfoField
                    label="Actual Duration"
                    value={viewingTimelineStats.actualDuration ? `${viewingTimelineStats.actualDuration} days` : null}
                    valueClassName="font-bold text-blue-700"
                  />
                  <InfoField label="Priority" value={viewingProject.priority} />
                  <InfoField label="Type" value={viewingProject.projectType} />
                  <InfoField label="Methodology" value={viewingProject.methodology} />
                  <InfoField
                    label="Budget"
                    value={viewingProject.budget ? `₹${Number(viewingProject.budget).toLocaleString('en-IN')}` : null}
                    valueClassName="text-emerald-600 font-bold"
                  />
                  <InfoField label="Billing" value={viewingProject.noBilling} />
                  <InfoField label="Technology" value={viewingProject.technology} />
                </div>
              </div>

              {/* Timeline & Schedule Tracking (Planned vs Actual from Schedule) */}
              <div>
                <SectionLabel icon={Calendar}>Timeline & Schedule Tracking</SectionLabel>
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/40 p-5 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Planned / Baseline Dates */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Clock3 size={14} className="text-slate-400" />
                            Planned Baseline
                          </span>
                          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                            Project Register
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planned Start</p>
                            <p className="font-extrabold text-slate-800 mt-1">{formatDate(viewingProject.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planned End</p>
                            <p className="font-extrabold text-slate-800 mt-1">{formatDate(viewingProject.deadline)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Planned Duration:</span>
                        <span className="font-extrabold text-slate-800">{viewingProject.duration ? `${viewingProject.duration} days` : '-'}</span>
                      </div>
                    </div>

                    {/* Actual / Scheduled Dates */}
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                            <Layers size={14} className="text-blue-600" />
                            Actual Scheduled
                          </span>
                          <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            {viewingTimelineStats.hasTasks ? 'Live Schedule' : 'Initial Freeze'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[10px] font-bold text-blue-700/80 uppercase tracking-wider">Actual Start</p>
                            <p className="font-extrabold text-slate-900 mt-1">{formatDate(viewingTimelineStats.actualStartDate)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-blue-700/80 uppercase tracking-wider">Actual End</p>
                            <p className="font-extrabold text-slate-900 mt-1">{formatDate(viewingTimelineStats.actualEndDate)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-between text-xs">
                        <span className="text-blue-900 font-medium">Actual Duration:</span>
                        <span className="font-extrabold text-blue-950">{viewingTimelineStats.actualDuration ? `${viewingTimelineStats.actualDuration} days` : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variance / Health Banner */}
                  {viewingTimelineStats.varianceStatus && (
                    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold shadow-2xs ${viewingTimelineStats.varianceTone}`}>
                      <div className="flex items-center gap-2">
                        <viewingTimelineStats.varianceIcon size={16} className="shrink-0" />
                        <span>{viewingTimelineStats.varianceLabel}</span>
                      </div>
                      <span className="font-mono text-xs font-extrabold">{viewingTimelineStats.varianceDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scope Section */}
              {viewingProject.projectScope && viewingProject.projectScope !== 'null' && (
                <div>
                  <SectionLabel icon={FileText}>Scope</SectionLabel>
                  <p className="text-xs text-slate-700 leading-relaxed rounded-2xl bg-slate-50/80 border border-slate-100 p-4 shadow-2xs">
                    {viewingProject.projectScope}
                  </p>
                </div>
              )}

              {/* Staffing Plan */}
              {viewingProject.resourceAllocations.length > 0 && (
                <div>
                  <SectionLabel icon={Users}>Assigned In-House Resources</SectionLabel>
                  <div className="space-y-3">
                    {viewingProject.resourceAllocations.map((group, gIdx) => (
                      <div key={gIdx} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                          {group.type}
                        </p>
                        <div className="space-y-2">
                          {(group.rows || []).map((row, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center justify-between gap-3 text-xs bg-white rounded-xl px-4 py-2.5 border border-slate-200/80 shadow-2xs"
                            >
                              {row.role ? (
                                <>
                                  <span className="font-bold text-slate-800 truncate">
                                    {row.resourceName || 'Unassigned'}{' '}
                                    <span className="font-normal text-slate-400">({row.role})</span>
                                  </span>
                                  <span className="shrink-0 font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                    {row.allocation ? `${row.allocation}%` : '-'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="font-bold text-slate-800">{row.name}</span>
                                  <span className="shrink-0 font-bold text-emerald-700">
                                    {row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : '-'}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {viewingProject.contacts.length > 0 && (
                <div>
                  <SectionLabel icon={User}>Key Contacts</SectionLabel>
                  <div className="space-y-2">
                    {viewingProject.contacts.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs rounded-xl bg-slate-50/80 border border-slate-100 px-4 py-2.5"
                      >
                        <span className="font-bold text-slate-800">
                          {c.person_name} <span className="font-normal text-slate-400">({c.role})</span>
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">{c.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule / Tasks View */}
              <div>
                <SectionLabel icon={Layers}>
                  {scheduleByProject[String(viewingProject.id)]?.length > 0
                    ? `Live Schedule (${scheduleByProject[String(viewingProject.id)].length} tasks) — Read Only`
                    : `Milestones (${viewingProject.milestones.length})`}
                </SectionLabel>
                {scheduleByProject[String(viewingProject.id)]?.length > 0 ? (
                  <div className="space-y-2.5 rounded-3xl border border-slate-200/90 bg-slate-50/60 p-4 shadow-2xs">
                    {scheduleByProject[String(viewingProject.id)].map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-slate-900 truncate">
                              {task.task_name || 'Untitled Task'}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {task.duration && (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                  ⏱️ {task.duration} d
                                </span>
                              )}
                              {task.resource ? (
                                <span className="rounded-md bg-blue-50 border border-blue-200/90 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  👥 {task.resource}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">No resource assigned</span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="inline-block rounded-xl bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200/80">
                              {formatDate(task.planned_start)} &rarr; {formatDate(task.planned_end)}
                            </span>
                          </div>
                        </div>
                        {(task.sub_tasks || []).map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-2 pl-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-slate-400 text-xs">↳</span>
                              <span className="font-bold text-slate-800 truncate">{sub.sub_task_name}</span>
                              {sub.resource && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                                  {sub.resource}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                              {formatDate(sub.planned_start)} &rarr; {formatDate(sub.planned_end)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : viewingProject.milestones.length > 0 ? (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    {viewingProject.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 text-xs bg-white rounded-xl px-4 py-2.5 border border-slate-200/80 shadow-2xs"
                      >
                        <span className="truncate font-bold text-slate-800">
                          {m.milestone} ({m.percentage}%)
                        </span>
                        <span className="shrink-0 text-slate-400 font-medium">{formatDate(m.milestone_date)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No schedule data available.</p>
                )}
              </div>

              {/* Rejection Form Box */}
              {rejectingId === viewingProject.id && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50/70 p-4 flex flex-col gap-2.5 shadow-sm animate-in fade-in duration-150">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">
                    Reason for rejection <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain why this schedule is rejected and what the PM must fix before resubmission…"
                    rows={3}
                    autoFocus
                    className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs font-medium text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition"
                  />
                </div>
              )}

              {/* Approval Confirm Banner */}
              {approvingId === viewingProject.id && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 flex items-center gap-3 shadow-sm animate-in fade-in duration-150">
                  <CheckCircle2 size={22} className="text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold text-emerald-950">Confirm Final Schedule Approval?</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      This schedule will be permanently approved and locked for project execution.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            {viewingProject.workflow.status === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 backdrop-blur px-7 py-4">
                {rejectingId === viewingProject.id ? (
                  <>
                    <button
                      onClick={() => {
                        setRejectingId(null)
                        setRejectNote('')
                      }}
                      className="rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold px-5 py-2.5 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectSubmit(viewingProject)}
                      disabled={!rejectNote.trim()}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 shadow-md shadow-rose-500/20 transition cursor-pointer"
                    >
                      <XCircle size={14} /> Confirm Rejection
                    </button>
                  </>
                ) : approvingId === viewingProject.id ? (
                  <>
                    <button
                      onClick={() => setApprovingId(null)}
                      className="rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold px-5 py-2.5 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApprove(viewingProject)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-6 py-2.5 shadow-md shadow-emerald-500/25 transition cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> Confirm Approval
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setApprovingId(null)
                        setRejectingId(viewingProject.id)
                      }}
                      className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 shadow-sm shadow-rose-600/20 transition cursor-pointer"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null)
                        setApprovingId(viewingProject.id)
                      }}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 shadow-sm shadow-emerald-600/25 transition cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PMOReviewPage
