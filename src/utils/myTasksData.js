import { API_ENDPOINTS } from '../config/api'

export function getLoggedInResourceId() {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user.id || user.user_id || null
  } catch {
    return null
  }
}

export function getLoggedInResourceName() {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return ''
  try {
    const user = JSON.parse(userStr)
    return user.name || ''
  } catch {
    return ''
  }
}

export function getLoggedInResourceRole() {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return ''
  try {
    const user = JSON.parse(userStr)
    return (user.role || '').toLowerCase()
  } catch {
    return ''
  }
}

export async function fetchMyTasks(resourceId) {
  const response = await fetch(API_ENDPOINTS.GET_USER_PROJECT_LIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource: String(resourceId) }),
  })
  const data = await response.json()
  if (!response.ok || !data?.success) {
    throw new Error(data?.message || 'Failed to load your tasks')
  }
  return Array.isArray(data.data) ? data.data : []
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Derived purely from planned_start/planned_end vs today — the API this
// whole page runs on (get_userProjectList) has no status field of its own,
// so this is the only honest way to bucket tasks by urgency. These three
// buckets stand in for the Figma design's Done/In Progress/To Do — those
// specific labels aren't backed by real data, so we don't fabricate them.
export function getTaskStatus(item) {
  const now = new Date()
  const start = item.planned_start ? new Date(item.planned_start) : null
  const end = item.planned_end ? new Date(item.planned_end) : null

  if (end && end < now) return { key: 'overdue', label: 'Overdue', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-600 border border-rose-100', bar: 'bg-rose-500' }
  if (start && start > now) return { key: 'upcoming', label: 'Upcoming', dot: 'bg-slate-300', badge: 'bg-slate-50 text-slate-500 border border-slate-200', bar: 'bg-slate-400' }
  return { key: 'inProgress', label: 'In Progress', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600 border border-blue-100', bar: 'bg-blue-500' }
}

export function cleanPredecessor(raw) {
  const trimmed = (raw || '').trim()
  if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed === '-') return null
  return trimmed
}

export function isWithinNextDays(dateStr, days) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + days)
  return d >= now && d <= future
}

export function isWithinLastDays(dateStr, days) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  const past = new Date()
  past.setDate(now.getDate() - days)
  return d >= past && d <= now
}

// Groups the flat get_userProjectList rows by project_id — every other
// list in this app groups a project with its own sub-project rows the
// same way.
export function groupTasksByProject(tasks) {
  const byProject = new Map()
  tasks.forEach((row) => {
    const key = row.project_id
    if (!byProject.has(key)) {
      byProject.set(key, { projectId: key, projectName: row.project_name || 'Untitled Project', items: [] })
    }
    byProject.get(key).items.push(row)
  })
  return [...byProject.values()]
}

// A project's own planned_start/planned_end aren't in this API — approximate
// with the earliest child start and latest child end, same convention the
// PM-side Gantt uses for a parent/summary row spanning its children.
export function getProjectDateRange(items) {
  let earliestStart = null
  let latestEnd = null
  items.forEach((item) => {
    const s = item.planned_start ? new Date(item.planned_start) : null
    const e = item.planned_end ? new Date(item.planned_end) : null
    if (s && !Number.isNaN(s.getTime()) && (!earliestStart || s < earliestStart)) earliestStart = s
    if (e && !Number.isNaN(e.getTime()) && (!latestEnd || e > latestEnd)) latestEnd = e
  })
  return { start: earliestStart, end: latestEnd }
}
