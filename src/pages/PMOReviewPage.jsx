import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`font-semibold mt-0.5 ${valueClassName}`}>{value || '-'}</p>
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
      const response = await fetch(API_ENDPOINTS.GET_PROJECTS_STATUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pmo_id: pmoId }),
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to fetch projects')
      }
      // The API can return duplicate rows per project (join artifacts from
      // milestones/contacts) — dedupe by id, keeping the first (latest).
      const seen = new Set()
      const deduped = (Array.isArray(data.data) ? data.data : []).filter((row) => {
        if (seen.has(row.id)) return false
        seen.add(row.id)
        return true
      })
      setProjects(deduped)
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
      workflow: {
        status: deriveWorkflowStatus(p.pm_status, p.pmo_status),
        note: p.reason || '',
      },
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
    setRejectNote('')
  }

  // The real, full Gantt schedule (same data PM sees/edits) — read-only
  // here, no edit UI. get_project_schedule only needs project_id (pm_id is
  // an optional extra filter), so PMO can fetch it directly without needing
  // the project's PM id. Fetched for every listed project so "View Full
  // Details" has it ready whether the project is pending or already decided.
  const [scheduleByProject, setScheduleByProject] = useState({})
  const allIds = rows.map((r) => r.id).join(',')

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
    if (!window.confirm(`Approve "${project.projectName}"'s schedule? This is a final freeze.`)) return
    setWorkflow(project.id, WORKFLOW_STATUS.APPROVED, '', getPmoId())
    await fetchProjects()
  }

  const handleRejectSubmit = async (project) => {
    if (!rejectNote.trim()) return
    setWorkflow(project.id, WORKFLOW_STATUS.REJECTED, rejectNote.trim(), getPmoId())
    setRejectingId(null)
    setRejectNote('')
    await fetchProjects()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1f3d] to-[#0d2646] p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white mb-6 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-[28px] bg-white p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(3,10,24,0.14)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
                <ClipboardList size={22} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900 tracking-tight leading-tight">
                  PMO Review
                </h1>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  Approve or reject schedules PMs have frozen for review.
                </p>
              </div>
            </div>

            {!loading && !error && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 border border-amber-100">
                  <Clock3 size={13} /> {pendingReview.length} Pending
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-100">
                  <CheckCircle2 size={13} /> {decided.length} Decided
                </span>
              </div>
            )}
          </div>

          {loading && (
            <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-600">Loading projects...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 mb-4">
                <AlertCircle size={32} className="text-rose-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="mt-8">
                <h2 className="text-sm font-bold text-slate-800 mb-3">
                  Pending Review <span className="text-slate-400 font-medium">({pendingReview.length})</span>
                </h2>

                {pendingReview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Inbox size={40} className="text-slate-300 mb-3" />
                    <p className="text-xs font-bold text-slate-500">No schedules waiting on review right now.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pendingReview.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setViewingId(project.id)}
                        className="group text-left rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-amber-300 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-[15px] truncate">{project.projectName}</h3>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{project.projectCode}</p>
                          </div>
                          <StatusBadge status={project.workflow.status} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-y-3 text-xs">
                          <InfoField label="PM" value={project.pm} />
                          <InfoField label="Client" value={project.clientName} />
                          <InfoField label="Deadline" value={formatDate(project.deadline)} />
                          <InfoField label="Priority" value={project.priority} />
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white text-amber-700 text-xs font-bold py-2 group-hover:bg-amber-50 transition">
                          <Eye size={13} />
                          View Full Details
                          <ChevronRight size={13} className="transition group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {decided.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-sm font-bold text-slate-800 mb-3">
                    Recently Decided <span className="text-slate-400 font-medium">({decided.length})</span>
                  </h2>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500">
                          <th className="px-4 py-2.5 font-semibold">Project</th>
                          <th className="px-4 py-2.5 font-semibold">PM</th>
                          <th className="px-4 py-2.5 font-semibold">Status</th>
                          <th className="px-4 py-2.5 font-semibold">Note</th>
                          <th className="px-4 py-2.5 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {decided.map((project) => (
                          <tr key={project.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition">
                            <td className="px-4 py-2.5 font-semibold text-slate-700">{project.projectName}</td>
                            <td className="px-4 py-2.5 text-slate-500">{project.pm || '-'}</td>
                            <td className="px-4 py-2.5"><StatusBadge status={project.workflow.status} /></td>
                            <td className="px-4 py-2.5 text-slate-400 max-w-[220px] truncate">{project.workflow.note || '-'}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => setViewingId(project.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                              >
                                <Eye size={12} /> View
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

      {viewingProject && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 backdrop-blur-sm px-4 py-8 animate-in fade-in duration-150"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 truncate">{viewingProject.projectName}</h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{viewingProject.projectCode}</p>
              </div>
              <button onClick={closeModal} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <StatusBadge status={viewingProject.workflow.status} size="lg" />
                {viewingProject.workflow.note && (
                  <span className="text-[11px] text-slate-500">— {viewingProject.workflow.note}</span>
                )}
              </div>

              <div>
                <SectionLabel icon={Building2}>Overview</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs rounded-xl bg-slate-50/70 p-4">
                  <InfoField label="PM" value={viewingProject.pm} />
                  <InfoField label="Client" value={viewingProject.clientName} />
                  <InfoField label="Location" value={viewingProject.location} />
                  <InfoField label="Start" value={formatDate(viewingProject.startDate)} />
                  <InfoField label="Deadline" value={formatDate(viewingProject.deadline)} />
                  <InfoField label="Duration" value={viewingProject.duration ? `${viewingProject.duration} days` : null} />
                  <InfoField label="Priority" value={viewingProject.priority} />
                  <InfoField label="Type" value={viewingProject.projectType} />
                  <InfoField label="Methodology" value={viewingProject.methodology} />
                  <InfoField
                    label="Budget"
                    value={viewingProject.budget ? `₹${Number(viewingProject.budget).toLocaleString('en-IN')}` : null}
                    valueClassName="text-emerald-600"
                  />
                  <InfoField label="Billing" value={viewingProject.noBilling} />
                  <InfoField label="Technology" value={viewingProject.technology} />
                </div>
              </div>

              {viewingProject.projectScope && (
                <div>
                  <SectionLabel icon={FileText}>Scope</SectionLabel>
                  <p className="text-xs text-slate-600 leading-relaxed rounded-xl bg-slate-50/70 p-4">{viewingProject.projectScope}</p>
                </div>
              )}

              {/* Staffing plan the PM requested — real data (resource_allocations
                  from getProjectsStatus, parsed from its JSON-string form). */}
              {viewingProject.resourceAllocations.length > 0 && (
                <div>
                  <SectionLabel icon={Users}>Resources</SectionLabel>
                  <div className="space-y-3">
                    {viewingProject.resourceAllocations.map((group, gIdx) => (
                      <div key={gIdx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{group.type}</p>
                        <div className="space-y-1.5">
                          {(group.rows || []).map((row, rIdx) => (
                            <div key={rIdx} className="flex items-center justify-between gap-2 text-[11px] bg-white rounded-lg px-3 py-2 border border-slate-100">
                              {row.role ? (
                                <>
                                  <span className="font-semibold text-slate-700">{row.resourceName || 'Unassigned'} <span className="font-normal text-slate-400">({row.role})</span></span>
                                  <span className="shrink-0 text-slate-500">{row.allocation ? `${row.allocation}%` : '-'}</span>
                                </>
                              ) : (
                                <>
                                  <span className="font-semibold text-slate-700">{row.name}</span>
                                  <span className="shrink-0 text-slate-500">{row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : '-'}</span>
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

              {viewingProject.contacts.length > 0 && (
                <div>
                  <SectionLabel icon={User}>Contacts</SectionLabel>
                  <div className="space-y-1.5">
                    {viewingProject.contacts.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs rounded-lg bg-slate-50/70 px-3 py-2">
                        <span className="font-semibold text-slate-700">{c.person_name} <span className="font-normal text-slate-400">({c.role})</span></span>
                        <span className="text-slate-400">{c.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real, full Gantt schedule — same data the PM sees in
                  GanttChart, fetched via get_project_schedule (works with
                  just project_id, no new API). Read-only here. Falls back
                  to milestones while the schedule is loading or empty. */}
              <div>
                <SectionLabel icon={Layers}>
                  {scheduleByProject[String(viewingProject.id)]?.length > 0
                    ? `Schedule (${scheduleByProject[String(viewingProject.id)].length} tasks) — read only`
                    : `Milestones (${viewingProject.milestones.length})`}
                </SectionLabel>
                {scheduleByProject[String(viewingProject.id)]?.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    {scheduleByProject[String(viewingProject.id)].map((task) => (
                      <div key={task.id}>
                        <div className="flex items-center justify-between gap-2 text-[11px] bg-white rounded-lg px-3 py-2 border border-slate-100">
                          <span className="truncate font-semibold text-slate-700">{task.task_name || 'Untitled Task'}</span>
                          <span className="shrink-0 text-slate-400">{formatDate(task.planned_start)} → {formatDate(task.planned_end)}</span>
                        </div>
                        {(task.sub_tasks || []).map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between gap-2 pl-4 mt-1 text-[10px] text-slate-500">
                            <span className="truncate">↳ {sub.sub_task_name}</span>
                            <span className="shrink-0 text-slate-400">{formatDate(sub.planned_start)} → {formatDate(sub.planned_end)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : viewingProject.milestones.length > 0 ? (
                  <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    {viewingProject.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-[11px] bg-white rounded-lg px-3 py-2 border border-slate-100">
                        <span className="truncate text-slate-700">{m.milestone} ({m.percentage}%)</span>
                        <span className="shrink-0 text-slate-400">{formatDate(m.milestone_date)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No schedule data available.</p>
                )}
              </div>

              {rejectingId === viewingProject.id && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    Reason for rejection <span>*</span>
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain what needs to change before this can be approved…"
                    rows={2}
                    autoFocus
                    className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400"
                  />
                </div>
              )}
            </div>

            {viewingProject.workflow.status === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW && (
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-3.5">
                {rejectingId === viewingProject.id ? (
                  <>
                    <button
                      onClick={() => { setRejectingId(null); setRejectNote('') }}
                      className="rounded-lg border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectSubmit(viewingProject)}
                      disabled={!rejectNote.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-rose-200 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 transition cursor-pointer"
                    >
                      <XCircle size={13} /> Confirm Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setRejectingId(viewingProject.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 transition cursor-pointer"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                    <button
                      onClick={() => { handleApprove(viewingProject); closeModal() }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 transition cursor-pointer"
                    >
                      <CheckCircle2 size={13} /> Approve
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
