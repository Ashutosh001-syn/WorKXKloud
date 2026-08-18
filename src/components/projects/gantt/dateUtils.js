import { gantt } from 'dhtmlx-gantt'

export function toGanttDateOnly(value) {
  if (!value) return null
  return String(value).slice(0, 10)
}

export function formatDateShort(date) {
  if (!date) return '-'
  let d = date
  if (typeof date === 'string') d = new Date(date)
  try {
    const day = d.getDate().toString().padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[d.getMonth()]
    const year = d.getFullYear().toString().slice(-2)
    return `${day} ${month} '${year}`
  } catch {
    return '-'
  }
}


export function getInclusiveEndDate(date) {
  if (!date) return null
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d
}

export function formatToAPI(date, isEnd = false) {
  if (!date) return null
  const d = new Date(date)
  const pad = n => n.toString().padStart(2, '0')
  let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds()
  if (h === 0 && m === 0 && s === 0) { h = isEnd ? 18 : 10 }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`
}

export function formatToAPIDateOnly(date) {
  if (!date) return null
  const d = new Date(date)
  const pad = n => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDateOnlyLocal(dateOnlyStr) {
  if (!dateOnlyStr) return null
  const [y, m, d] = dateOnlyStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function calculateStartDateFromEnd(endDate, duration) {
  if (!duration || duration <= 0) return new Date(endDate)
  let current = new Date(endDate)
  let remaining = duration
  const workTimeEnabled = gantt.config.work_time
  let guard = 0
  while (remaining > 0 && guard < 3650) {
    current = gantt.date.add(current, -1, 'day')
    if (!workTimeEnabled || gantt.isWorkTime(current)) {
      remaining -= 1
    }
    guard += 1
  }
  return current
}
