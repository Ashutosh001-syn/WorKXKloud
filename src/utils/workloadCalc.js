// Workload aggregation — computed entirely client-side from data the
// backend already exposes (resource_list's shift timing + get_projectList's
// resource_allocations), per the confirmed logic in workload.todo. No
// dedicated /get_workload endpoint is needed or being requested.
//
// Formula: dailyAllocatedHours = (end_time − start_time) × (allocation% / 100)
// e.g. a 09:00–17:00 shift (8h capacity) at 25% allocation = 2h/day on that
// project, applied to each weekday the allocation's own workingDays covers.

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// weekdayHours (the shape WorkLoadTable/ResourceRow expect) is Mon..Fri only.
const MON_TO_FRI = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const RESOURCE_COLOR_PALETTE = [
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
]

function colorForResource(key) {
  let hash = 0
  const str = String(key)
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % RESOURCE_COLOR_PALETTE.length
  return RESOURCE_COLOR_PALETTE[hash]
}

// "09:00:00" -> 9, "17:30:00" -> 17.5
function parseTimeToHours(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  if (Number.isNaN(h)) return null
  return h + (Number.isNaN(m) ? 0 : m / 60)
}

// A resource's own daily shift capacity (end_time − start_time), not
// gated by their global monday..sunday flags — the project-level
// workingDays (from resource_allocations) is what actually gates which
// days this particular allocation counts, per the confirmed logic.
export function getDailyCapacityHours(resource) {
  const start = parseTimeToHours(resource?.start_time)
  const end = parseTimeToHours(resource?.end_time)
  if (start === null || end === null) return null
  const diff = end - start
  return diff > 0 ? diff : null
}

export function computeDailyAllocatedHours(dailyCapacityHours, allocationPercent) {
  if (!dailyCapacityHours) return 0
  const pct = Number(allocationPercent) || 0
  return Math.round(dailyCapacityHours * (pct / 100) * 100) / 100
}

// A resource's own real weekly capacity — dailyCapacityHours × however
// many days resource_list's own monday..sunday flags say they work. This
// is what "100% utilization" should be measured against (a 9h-shift
// resource has 45h/week capacity, not a flat assumed 40h) — used for the
// KPI cards, not the per-project table which already uses per-allocation
// workingDays for its own weekdayHours/monthly figures.
const WEEKLY_DAY_FLAG_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function getWeeklyCapacityHours(resource) {
  const dailyCapacityHours = getDailyCapacityHours(resource)
  if (!dailyCapacityHours) return null
  const workingDaysCount = WEEKLY_DAY_FLAG_KEYS.reduce(
    (count, key) => count + (Number(resource?.[key]) ? 1 : 0),
    0
  )
  // Some resource records have every day-flag at 0 (never configured) —
  // falling back to a standard 5-day week keeps their capacity meaningful
  // instead of silently zeroing out (which would make ANY allocation look
  // like infinite % overcapacity).
  const days = workingDaysCount > 0 ? workingDaysCount : 5
  return Math.round(dailyCapacityHours * days * 100) / 100
}

// [Mon, Tue, Wed, Thu, Fri] hours — 0 for any weekday not in workingDays.
export function buildWeekdayHours(dailyAllocatedHours, workingDays) {
  const days = new Set(workingDays || [])
  return MON_TO_FRI.map((day) => (days.has(day) ? dailyAllocatedHours : 0))
}

// Sum of dailyAllocatedHours over every real calendar day in `year` that
// (a) falls in that month, (b) matches one of workingDays, and (c) isn't
// an org holiday — not the flat weekTotal × 4.33 × seasonal-multiplier
// placeholder math workloadDummyData.js used for the demo.
export function buildMonthlyHours(dailyAllocatedHours, workingDays, year, holidayDateSet = new Set()) {
  const days = new Set(workingDays || [])
  const monthly = new Array(12).fill(0)
  if (!dailyAllocatedHours) return monthly

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dayName = WEEKDAY_NAMES[date.getDay()]
      if (!days.has(dayName)) continue
      const iso = date.toISOString().slice(0, 10)
      if (holidayDateSet.has(iso)) continue
      count += 1
    }
    monthly[month] = Math.round(dailyAllocatedHours * count * 100) / 100
  }
  return monthly
}

// resource_allocations rows join back to resource_list inconsistently
// (id / resource_id / tl_id / name) — try the numeric keys first since
// name-matching is fragile when two resources share a display name.
function findResource(row, resourceList) {
  const candidateIds = [row.resource_id, row.id, row.tl_id].filter(
    (v) => v !== undefined && v !== null
  )
  for (const id of candidateIds) {
    const match = resourceList.find((r) => String(r.id) === String(id))
    if (match) return match
  }
  if (row.resourceName) {
    return resourceList.find(
      (r) => r.name?.toLowerCase().trim() === row.resourceName.toLowerCase().trim()
    )
  }
  return null
}

// Main entry point: projects (get_projectList's raw rows, each with a
// resource_allocations JSON string/array) + resourceList (resource_list's
// raw rows) -> { resources } in the exact shape WorkloadPage/WorkLoadTable
// already render (see workload.todo section 2).
export function aggregateWorkload(projects, resourceList, { year = new Date().getFullYear(), holidayDateSet = new Set() } = {}) {
  const byResourceKey = new Map()

  ;(projects || []).forEach((project) => {
    let groups
    try {
      groups = Array.isArray(project.resource_allocations)
        ? project.resource_allocations
        : JSON.parse(project.resource_allocations || '[]')
    } catch {
      groups = []
    }
    if (!Array.isArray(groups)) return

    groups.forEach((group) => {
      if (group.type === 'Cost') return
      ;(group.rows || []).forEach((row) => {
        if (!row.resourceName) return

        const resource = findResource(row, resourceList || [])
        const dailyCapacityHours = resource ? getDailyCapacityHours(resource) : null
        const dailyAllocatedHours = computeDailyAllocatedHours(dailyCapacityHours, row.allocation)

        const key = resource ? `id:${resource.id}` : `name:${row.resourceName.toLowerCase().trim()}`
        if (!byResourceKey.has(key)) {
          byResourceKey.set(key, {
            id: resource ? String(resource.id) : key,
            name: resource?.name || row.resourceName,
            role: row.role || resource?.role || '',
            color: colorForResource(key),
            weeklyCapacityHours: resource ? getWeeklyCapacityHours(resource) : null,
            projects: [],
          })
        }

        byResourceKey.get(key).projects.push({
          id: String(project.id),
          name: project.project_name || 'Untitled Project',
          weekdayHours: buildWeekdayHours(dailyAllocatedHours, row.workingDays),
          monthly: buildMonthlyHours(dailyAllocatedHours, row.workingDays, year, holidayDateSet),
          exceptions: {},
          // Surfaced so the UI/caller can flag rows where we couldn't
          // resolve a shift and had to show 0h instead of silently
          // guessing a capacity.
          _missingShift: !resource || dailyCapacityHours === null,
        })
      })
    })
  })

  return { resources: [...byResourceKey.values()] }
}
