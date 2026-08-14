import { gantt } from 'dhtmlx-gantt'
import { LINK_FS, LINK_SS, LINK_FF, LINK_SF } from './ganttConstants'
import { calculateStartDateFromEnd } from './dateUtils'

// Given a link and its source/target tasks, computes what the target's
// start/end should become to satisfy that single link's constraint (FS/SS/
// FF/SF + lag), respecting the working-time calendar.
export function computeAutoScheduledDates(link, sourceTask, targetTask) {
  if (!sourceTask || !targetTask) return null

  const srcStart = new Date(sourceTask.start_date)
  const srcEnd = new Date(sourceTask.end_date)

  const duration = typeof targetTask.duration === 'number' ? targetTask.duration : 1

  const linkType = parseInt(link.type, 10)
  const lag = link.lag ? parseInt(link.lag, 10) : 0

  let newStart, newEnd

  switch (linkType) {
    case LINK_FS: {
      newStart = lag ? gantt.date.add(srcEnd, lag, 'day') : new Date(srcEnd)
      if (gantt.config.work_time && !gantt.isWorkTime({ date: newStart, task: targetTask })) {
        newStart = gantt.getClosestWorkTime({ date: newStart, dir: 'future' })
      }
      newEnd = gantt.calculateEndDate({ start_date: newStart, duration })
      break
    }
    case LINK_SS: {
      newStart = lag ? gantt.date.add(srcStart, lag, 'day') : new Date(srcStart)
      if (gantt.config.work_time && !gantt.isWorkTime({ date: newStart, task: targetTask })) {
        newStart = gantt.getClosestWorkTime({ date: newStart, dir: 'future' })
      }
      newEnd = gantt.calculateEndDate({ start_date: newStart, duration })
      break
    }
    case LINK_FF: {
      newEnd = lag ? gantt.date.add(srcEnd, lag, 'day') : new Date(srcEnd)
      if (gantt.config.work_time && !gantt.isWorkTime({ date: newEnd, task: targetTask })) {
        newEnd = gantt.getClosestWorkTime({ date: newEnd, dir: 'past' })
      }
      newStart = calculateStartDateFromEnd(newEnd, duration)
      break
    }
    case LINK_SF: {
      newEnd = lag ? gantt.date.add(srcStart, lag, 'day') : new Date(srcStart)
      if (gantt.config.work_time && !gantt.isWorkTime({ date: newEnd, task: targetTask })) {
        newEnd = gantt.getClosestWorkTime({ date: newEnd, dir: 'past' })
      }
      newStart = calculateStartDateFromEnd(newEnd, duration)
      break
    }
    default:
      return null
  }

  return { start_date: newStart, end_date: newEnd }
}

// A task can have multiple incoming links — this resolves all of them into
// the single latest-wins start/end the task must obey (the most
// restrictive predecessor constraint).
export function computeConstrainedDates(targetId) {
  let targetTask
  try { targetTask = gantt.getTask(targetId) } catch { return null }
  if (!targetTask) return null

  const allLinks = gantt.getLinks()
  const incoming = allLinks.filter(l => String(l.target) === String(targetId))
  if (incoming.length === 0) return null

  const duration = typeof targetTask.duration === 'number' ? targetTask.duration : 1
  let latestStart = null
  let latestEnd = null

  incoming.forEach(link => {
    let sourceTask
    try { sourceTask = gantt.getTask(link.source) } catch { return }
    if (!sourceTask) return

    const dates = computeAutoScheduledDates(link, sourceTask, targetTask)
    if (!dates) return

    if (!latestStart || dates.start_date > latestStart) latestStart = dates.start_date
    if (!latestEnd || dates.end_date > latestEnd) latestEnd = dates.end_date
  })

  if (!latestStart) return null

  if (latestEnd) {
    const startFromEnd = calculateStartDateFromEnd(latestEnd, duration)
    if (startFromEnd > latestStart) latestStart = startFromEnd
  }

  const newEnd = gantt.calculateEndDate({ start_date: latestStart, duration })
  return { start_date: latestStart, end_date: newEnd }
}

export function hasCircularDependency(sourceId, targetId) {
  if (String(sourceId) === String(targetId)) return true
  const visited = new Set()
  const stack = [String(targetId)]
  const sourceStr = String(sourceId)
  while (stack.length > 0) {
    const current = stack.pop()
    if (visited.has(current)) continue
    visited.add(current)
    const outgoing = gantt.getLinks().filter(l => String(l.source) === current)
    for (const link of outgoing) {
      const tgt = String(link.target)
      if (tgt === sourceStr) return true
      stack.push(tgt)
    }
  }
  return false
}

// Cascades a changed task's dates forward through its outgoing links,
// recomputing each downstream task's constrained dates in dependency
// order (BFS via recursion + a visited guard against cycles).
export function propagateScheduling(changedTaskId, visited = new Set()) {
  if (visited.has(String(changedTaskId))) return
  visited.add(String(changedTaskId))

  const allLinks = gantt.getLinks()
  const outgoing = allLinks.filter(l => String(l.source) === String(changedTaskId))
  const targetIds = [...new Set(outgoing.map(l => String(l.target)))]

  targetIds.forEach(targetId => {
    let targetTask
    try { targetTask = gantt.getTask(targetId) } catch { return }
    if (!targetTask) return

    const newDates = computeConstrainedDates(targetId)
    if (!newDates) return

    const startChanged = newDates.start_date.getTime() !== new Date(targetTask.start_date).getTime()
    const endChanged = newDates.end_date.getTime() !== new Date(targetTask.end_date).getTime()

    if (startChanged || endChanged) {
      targetTask.start_date = newDates.start_date
      targetTask.end_date = newDates.end_date
      targetTask.duration = gantt.calculateDuration({
        start_date: newDates.start_date,
        end_date: newDates.end_date,
      })
      gantt.updateTask(targetId)
      propagateScheduling(targetId, visited)
    }
  })
}

// Keeps a parent task's start/end spanning the earliest-start/latest-end
// of its children, walking up the tree so a grandparent also gets updated
// when a leaf task moves.
export function rollUpParentDates(taskId, visited = new Set()) {
  if (visited.has(taskId)) return
  visited.add(taskId)

  let parentId
  try { parentId = gantt.getParent(taskId) } catch { return }
  if (!parentId || !gantt.isTaskExists(parentId)) return

  let parentTask
  try { parentTask = gantt.getTask(parentId) } catch { return }

  const children = gantt.getChildren(parentId)
  if (!children || children.length === 0) return

  let earliestStart = null
  let latestEnd = null

  children.forEach(childId => {
    try {
      const child = gantt.getTask(childId)
      const cs = new Date(child.start_date)
      const ce = new Date(child.end_date)
      if (!earliestStart || cs < earliestStart) earliestStart = cs
      if (!latestEnd || ce > latestEnd) latestEnd = ce
    } catch { /* skip invalid children */ }
  })

  if (!earliestStart || !latestEnd) return

  const startChanged = earliestStart.getTime() !== new Date(parentTask.start_date).getTime()
  const endChanged = latestEnd.getTime() !== new Date(parentTask.end_date).getTime()

  if (startChanged || endChanged) {
    parentTask.start_date = earliestStart
    parentTask.end_date = latestEnd
    parentTask.duration = gantt.calculateDuration({
      start_date: earliestStart,
      end_date: latestEnd,
    })
    gantt.updateTask(parentId)
    rollUpParentDates(parentId, visited)
  }
}

// Resolves every task's constrained dates in dependency order (Kahn's
// algorithm topological sort over the link graph) — used once after
// changing the working-time calendar, since that can shift every
// constrained task's dates at once rather than just one at a time.
export function topologicalSchedule() {
  const allLinks = gantt.getLinks()
  if (!allLinks || allLinks.length === 0) return

  const inDegree = {}
  const successors = {}

  gantt.eachTask(task => {
    const id = String(task.id)
    if (!(id in inDegree)) inDegree[id] = 0
    if (!(id in successors)) successors[id] = new Set()
  })

  allLinks.forEach(link => {
    const src = String(link.source)
    const tgt = String(link.target)
    if (!(src in successors)) successors[src] = new Set()
    successors[src].add(tgt)
    if (!(tgt in inDegree)) inDegree[tgt] = 0
    inDegree[tgt] += 1
  })

  const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0)
  const order = []

  while (queue.length > 0) {
    const current = queue.shift()
    order.push(current)
    if (successors[current]) {
      successors[current].forEach(succ => {
        inDegree[succ] -= 1
        if (inDegree[succ] === 0) queue.push(succ)
      })
    }
  }

  order.forEach(taskId => {
    const newDates = computeConstrainedDates(taskId)
    if (!newDates) return
    try {
      const task = gantt.getTask(taskId)
      task.start_date = newDates.start_date
      task.end_date = newDates.end_date
      task.duration = gantt.calculateDuration({
        start_date: newDates.start_date,
        end_date: newDates.end_date,
      })
    } catch { /* skip */ }
  })
}
