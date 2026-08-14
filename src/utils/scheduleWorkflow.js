// PM Schedule -> Freeze -> PMO Review -> Approve/Reject workflow.
//
// "Scheduled" is the PM clicking the bottom "Schedule Task to PMO" button —
// that's what reveals the top "Freeze" button. Freeze then locks it and
// sends it to PMO Review. Reject unlocks everything back to Draft, so the
// PM has to hit "Schedule Task to PMO" again before Freeze reappears.
//
// localStorage is still the source of truth for reading UI state — the
// backend has SCHEDULE_STATUS_BY_PM (confirmed live) to *write* a status,
// but no read/GET endpoint yet to fetch it back, so it can't replace
// getWorkflow(). setWorkflow() fires it as a best-effort parallel write.
//
// The endpoint takes two independent shapes depending on who's acting:
//   PM:  { project_id, pm_id,  pm_status,  reason }
//   PMO: { project_id, pmo_id, pmo_status, reason }
// Only send the acting side's own fields — that's what "sometimes a field
// shows null" was: mixing both shapes into one call. Each actor uses their
// own logged-in id (same as getPmId() elsewhere), so PMO doesn't need to
// know the project's PM id at all.

import { API_ENDPOINTS } from '../config/api'

const STORAGE_KEY = 'pmo_schedule_workflow'
const EVENT_NAME = 'schedule-workflow-changed'

export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  FROZEN_PENDING_REVIEW: 'frozen_pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const WORKFLOW_STATUS_META = {
  [WORKFLOW_STATUS.DRAFT]: {
    label: 'Draft',
    description: 'Schedule is editable. Click "Schedule Task to PMO" below when ready.',
    tone: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
  [WORKFLOW_STATUS.SCHEDULED]: {
    label: 'Scheduled — Ready to Freeze',
    description: 'Sent for scheduling. Freeze it to lock and send for PMO review.',
    tone: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  [WORKFLOW_STATUS.FROZEN_PENDING_REVIEW]: {
    label: 'Frozen — Pending PMO Review',
    description: 'Schedule is locked and waiting on PMO approval.',
    tone: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  [WORKFLOW_STATUS.APPROVED]: {
    label: 'Approved — Final Freeze',
    description: 'PMO approved this schedule. It is permanently locked.',
    tone: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  [WORKFLOW_STATUS.REJECTED]: {
    label: 'Rejected — Unfrozen',
    description: 'PMO rejected this schedule. Reschedule, then click "Schedule Task to PMO" again.',
    tone: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
  } catch { /* storage unavailable — workflow just won't persist */ }
}

export function getWorkflow(projectId) {
  const all = readAll()
  return (
    all[String(projectId)] || {
      status: WORKFLOW_STATUS.DRAFT,
      note: '',
      updatedAt: null,
      history: [],
    }
  )
}

export function getAllWorkflows() {
  return readAll()
}

// TODO(backend): there's no "which PMO reviews this project" assignment
// yet, so PM's freeze call can't know a real pmo_id, and PM has no
// pm_id-scoped read endpoint either. Forcing 19 on both the write (below)
// and the read (fetchWorkflowFromBackend) so PM's own GanttChart can reuse
// the same getProjectsStatus(pmo_id) call PMOReviewPage already uses,
// instead of a new endpoint. Replace with the real assigned PMO's id (and a
// real pm_id-scoped read) once that mapping/endpoint exists.
export const FORCED_PMO_ID = 19

// pm_status/pmo_status (as returned by getProjectsStatus) -> WORKFLOW_STATUS.
// Shared by GanttChart (PM side) and PMOReviewPage (PMO side) so the two
// never drift into disagreeing about what a given row means.
export function deriveWorkflowStatus(pmStatus, pmoStatus) {
  if (pmoStatus === 'approved') return WORKFLOW_STATUS.APPROVED
  if (pmoStatus === 'rejected') return WORKFLOW_STATUS.REJECTED
  if (pmStatus === 'frozen') return WORKFLOW_STATUS.FROZEN_PENDING_REVIEW
  return WORKFLOW_STATUS.DRAFT
}

// Real read, reusing getProjectsStatus (no new endpoint) — filters the
// PMO's full list down to this one project client-side, since there's no
// project_id-scoped variant. Returns null if the project has never been
// frozen/reviewed (i.e. still Draft) or the request fails.
export async function fetchWorkflowFromBackend(projectId) {
  try {
    const response = await fetch(API_ENDPOINTS.GET_PROJECTS_STATUS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pmo_id: FORCED_PMO_ID }),
    })
    const data = await response.json()
    if (!response.ok || !data?.success || !Array.isArray(data.data)) return null

    const row = data.data.find((r) => String(r.id) === String(projectId))
    if (!row) return null

    return {
      status: deriveWorkflowStatus(row.pm_status, row.pmo_status),
      note: row.reason || '',
    }
  } catch (err) {
    console.warn('fetchWorkflowFromBackend failed:', err)
    return null
  }
}

// WORKFLOW_STATUS -> which side owns reporting it, and the string that
// side's status field should carry. DRAFT has nothing worth reporting (no
// action taken yet) so it's intentionally left out and skipped.
const BACKEND_STATUS_MAP = {
  [WORKFLOW_STATUS.FROZEN_PENDING_REVIEW]: { actor: 'pm', value: 'frozen' },
  [WORKFLOW_STATUS.APPROVED]: { actor: 'pmo', value: 'approved' },
  [WORKFLOW_STATUS.REJECTED]: { actor: 'pmo', value: 'rejected' },
}

// Best-effort parallel write — localStorage (writeAll above) is what the UI
// actually reads back, so a failure here is logged, not surfaced to the
// user or allowed to block/roll back the local state change. `actorId` is
// whichever side is doing the acting: the PM's own id when status is
// FROZEN_PENDING_REVIEW, the PMO's own id when Approving/Rejecting.
function syncToBackend(projectId, actorId, status, note) {
  const mapped = BACKEND_STATUS_MAP[status]
  if (!mapped || !actorId) return

  // There's one status row per project, not a queue — PMO's last decision
  // (approved/rejected) otherwise stays stuck on the row forever, since a
  // PM freeze only touches pm_status. Resetting pmo_status to "pending" here
  // is what makes a re-submission after a Reject actually show up as
  // pending again instead of still reading as the old decision.
  const body = mapped.actor === 'pm'
    ? { project_id: projectId, pm_id: actorId, pm_status: mapped.value, pmo_id: FORCED_PMO_ID, pmo_status: 'pending', reason: '' }
    : { project_id: projectId, pmo_id: actorId, pmo_status: mapped.value, reason: note || '' }

  fetch(API_ENDPOINTS.SCHEDULE_STATUS_BY_PM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) console.warn('scheduleStatusByPm rejected:', data.message)
    })
    .catch((err) => console.warn('scheduleStatusByPm failed:', err))
}

export function setWorkflow(projectId, status, note = '', actorId = null, snapshot = null) {
  const all = readAll()
  const key = String(projectId)
  const current = all[key] || { history: [] }
  const entry = {
    status,
    note,
    updatedAt: new Date().toISOString(),
    history: [
      ...(current.history || []),
      { status, note, at: new Date().toISOString() },
    ],
    // Full schedule (all tasks/sub-tasks, dates, resources) as of the last
    // time the PM sent it to review — lets PMO see exactly what's being
    // asked to be approved, not just the project summary. Carried forward
    // untouched on statuses that don't include a fresh one (e.g. Approve).
    scheduleData: snapshot || current.scheduleData || null,
  }
  all[key] = entry
  writeAll(all)
  syncToBackend(projectId, actorId, status, note)
  return entry
}

export function subscribeToWorkflowChanges(callback) {
  window.addEventListener(EVENT_NAME, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT_NAME, callback)
    window.removeEventListener('storage', callback)
  }
}
