import { gantt } from 'dhtmlx-gantt'
import { SCHEDULE_BAR_CLASSES, SCHEDULE_BORDER_CLASSES } from './ganttConstants'
import { toGanttDateOnly } from './dateUtils'

export function isSubTask(task, projectId) {
  if (!task.parent) return false
  if (String(task.parent) === `project_${projectId}`) return false
  if (task.type === 'project') return false
  if (task.type === 'milestone') return false
  return true
}

export function getAssigneeLabel(task) {
  const value = task.assignees
  if (!value || value === 'undefined' || value === 'null') return ''
  return String(value)
}

export function cleanResourceValue(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

// API schedule response (tasks with nested sub_tasks) -> flat dhtmlx-gantt
// {data, links} shape. Predecessor text on each item is resolved against
// task/sub-task names first, falling back to a 1-based row index if the
// name doesn't match anything (some older records reference by position).
export function transformScheduleToGanttData(scheduleItems) {
  const data = []
  const nameToGanttId = new Map()

  scheduleItems.forEach((task, index) => {
    const ganttId = `task_${task.id}`
    const colorIndex = index % SCHEDULE_BAR_CLASSES.length
    data.push({
      id: ganttId,
      text: task.task_name || 'Untitled Task',
      start_date: toGanttDateOnly(task.planned_start),
      duration: Number(task.duration) || 1,
      progress: 0,
      open: true,
      assignees: cleanResourceValue(task.resource),
      barClass: SCHEDULE_BAR_CLASSES[colorIndex],
      borderClass: SCHEDULE_BORDER_CLASSES[colorIndex],
      apiId: task.id,
      isApiTask: true,
      apiPredecessorRaw: task.predecessor,
    })
    if (task.task_name) nameToGanttId.set(task.task_name, ganttId)

    const subTasks = task.sub_tasks || []
    subTasks.forEach((sub, subIndex) => {
      const subGanttId = `subtask_${sub.id}`
      const subColorIndex = (index + subIndex + 1) % SCHEDULE_BAR_CLASSES.length
      data.push({
        id: subGanttId,
        text: sub.sub_task_name || 'Untitled Sub-task',
        start_date: toGanttDateOnly(sub.planned_start),
        duration: Number(sub.duration) || 1,
        progress: 0,
        parent: ganttId,
        assignees: cleanResourceValue(sub.resource),
        barClass: SCHEDULE_BAR_CLASSES[subColorIndex],
        borderClass: SCHEDULE_BORDER_CLASSES[subColorIndex],
        apiId: sub.id,
        isApiTask: true,
        apiPredecessorRaw: sub.predecessor,
      })
      if (sub.sub_task_name) nameToGanttId.set(sub.sub_task_name, subGanttId)
    })
  })

  const links = []
  let linkCounter = 1
  data.forEach((item) => {
    const raw = item.apiPredecessorRaw
    if (!raw) return
    const trimmed = String(raw).trim()
    if (!trimmed) return

    let sourceId = nameToGanttId.get(trimmed)
    if (!sourceId && /^\d+$/.test(trimmed)) {
      const candidate = scheduleItems[Number(trimmed) - 1]
      if (candidate) sourceId = `task_${candidate.id}`
    }
    if (sourceId && sourceId !== item.id) {
      links.push({ id: `link_${linkCounter++}`, source: sourceId, target: item.id, type: '0' })
    }
  })

  return { data, links }
}

export function getApiTaskId(ganttId) {
  if (!ganttId || !gantt.isTaskExists(ganttId)) return null
  const task = gantt.getTask(ganttId)
  return task?.isApiTask ? task.apiId : null
}
