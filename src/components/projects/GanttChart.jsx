import React, { useEffect, useRef, useState, useCallback } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import {
  Plus,
  Settings,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  FileText,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import { API_ENDPOINTS } from '../../config/api'

const customStyles = `
  .gantt_container {
    border: 1px solid #e2e8f0 !important;
    border-radius: 0px !important;
    background-color: #ffffff !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  }

  .gantt_grid_scale {
    background-color: #f8fafc !important;
    border-bottom: 1px solid #cbd5e1 !important;
    color: #475569 !important;
    font-weight: 700 !important;
    font-size: 12px !important;
  }

  .gantt_task_scale {
    background-color: #f8fafc !important;
    border-bottom: 1px solid #cbd5e1 !important;
    color: #475569 !important;
    font-weight: 700 !important;
  }

  .gantt_scale_cell {
    border-right: 1px solid #e2e8f0 !important;
    color: #64748b !important;
    font-size: 11px !important;
    font-weight: 600 !important;
  }

  .gantt_scale_row:last-child .gantt_scale_cell {
    font-size: 10px !important;
    font-weight: 600 !important;
    color: #475569 !important;
  }

  .gantt_grid_head_cell {
    color: #374151 !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    border-right: 1px solid #cbd5e1 !important;
    text-align: center !important;
  }

  .gantt_grid_head_cell_search {
    padding: 2px 8px 6px 8px !important;
  }

  .search-container-wrapper {
    position: relative !important;
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    padding: 2px 0px !important;
  }

  .search-container-wrapper:before {
    content: "🔍" !important;
    position: absolute !important;
    left: 8px !important;
    font-size: 11px !important;
    color: #94a3b8 !important;
    pointer-events: none !important;
  }

  .gantt-search-input {
    width: 100% !important;
    height: 28px !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    padding: 2px 8px 2px 26px !important;
    font-size: 12px !important;
    outline: none !important;
    background-color: #ffffff !important;
    color: #1e293b !important;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05) !important;
  }

  .gantt-search-input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
  }

  .border-left-green  { border-left: 5px solid #52b788 !important; }
  .border-left-blue   { border-left: 5px solid #42a5f5 !important; }
  .border-left-purple { border-left: 5px solid #bb96ff !important; }
  .border-left-pink   { border-left: 5px solid #ff85a1 !important; }
  .border-left-none   { border-left: 5px solid transparent !important; }

  .gantt-index-cell {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    font-weight: 500 !important;
    color: #64748b !important;
    width: 100%;
    height: 100%;
  }

  .gantt_grid_data .gantt_row {
    border-bottom: 1px solid #e2e8f0 !important;
    background-color: #ffffff;
  }

  .gantt_grid_data .gantt_row.gantt_selected,
  .gantt_grid_data .gantt_row:hover,
  .gantt_task_row.gantt_selected,
  .gantt_task_row:hover {
    background-color: #fff1f2 !important;
  }

  .gantt_task_row       { border-bottom: 1px solid #e2e8f0 !important; }
  .gantt_task_cell      { border-right: 1px solid #f1f5f9 !important; }
  .gantt_grid_wraper    { border-right: 1px solid #cbd5e1 !important; }

  .weekend-cell { background-color: #f8fafc !important; }

  .gantt_tree_icon.gantt_folder_open,
  .gantt_tree_icon.gantt_folder_closed,
  .gantt_tree_icon.gantt_file { display: none !important; }

  .gantt_tree_icon.gantt_close {
    background-image: none !important; background: none !important;
    text-align: center; line-height: inherit;
    display: inline-flex !important; align-items: center; justify-content: center; cursor: pointer;
  }
  .gantt_tree_icon.gantt_close:before {
    content: "▶" !important; color: #2563eb !important; font-size: 9px !important; display: inline-block;
  }
  .gantt_tree_icon.gantt_open {
    background-image: none !important; background: none !important;
    text-align: center; line-height: inherit;
    display: inline-flex !important; align-items: center; justify-content: center; cursor: pointer;
  }
  .gantt_tree_icon.gantt_open:before {
    content: "▼" !important; color: #2563eb !important; font-size: 9px !important; display: inline-block;
  }

  .gantt_task_line {
    border: none !important; border-radius: 4px !important;
    height: 22px !important; line-height: 22px !important;
  }

  .gantt-bar-dark-green  { background-color: #2d6a4f !important; border-radius: 4px !important; }
  .gantt-bar-dark-green .gantt_task_progress { background-color: #1b4332 !important; }
  .gantt-bar-green       { background-color: #52b788 !important; border-radius: 4px !important; }
  .gantt-bar-green .gantt_task_progress { background-color: #40916c !important; }
  .gantt-bar-dark-blue   { background-color: #1565c0 !important; border-radius: 4px !important; }
  .gantt-bar-dark-blue .gantt_task_progress { background-color: #0d47a1 !important; }
  .gantt-bar-blue        { background-color: #42a5f5 !important; border-radius: 4px !important; }
  .gantt-bar-blue .gantt_task_progress { background-color: #1e88e5 !important; }
  .gantt-bar-dark-purple { background-color: #6a0dad !important; border-radius: 4px !important; }
  .gantt-bar-dark-purple .gantt_task_progress { background-color: #4a0e4e !important; }
  .gantt-bar-purple      { background-color: #bb96ff !important; border-radius: 4px !important; }
  .gantt-bar-purple .gantt_task_progress { background-color: #9d4edd !important; }
  .gantt-bar-dark-pink   { background-color: #d81b60 !important; border-radius: 4px !important; }
  .gantt-bar-dark-pink .gantt_task_progress { background-color: #880e4f !important; }
  .gantt-bar-pink        { background-color: #ff85a1 !important; border-radius: 4px !important; }
  .gantt-bar-pink .gantt_task_progress { background-color: #f72585 !important; }

  .gantt-assignees-label {
    color: #64748b !important; font-size: 11px !important; font-weight: 500 !important;
    padding-left: 8px; white-space: nowrap;
  }

  .gantt_task_link.gantt_link_regular { stroke: #94a3b8 !important; stroke-width: 1.2px !important; }
  .gantt_task_link .gantt_line_wrapper { stroke: #94a3b8 !important; }
  .gantt_task_link .gantt_link_line { background-color: #94a3b8 !important; stroke: #94a3b8 !important; }
  .gantt_link_arrow { border-color: transparent transparent transparent #94a3b8 !important; border-left-color: #94a3b8 !important; }

  .gantt_critical_task {
    background-color: #f87171 !important;
    border: 1.5px solid #ef4444 !important;
    box-shadow: 0 0 8px rgba(239,68,68,0.4) !important;
  }
  .gantt_critical_task .gantt_task_progress { background-color: #ef4444 !important; }
  .gantt_critical_link .gantt_line_wrapper { stroke: #ef4444 !important; stroke-width: 2px !important; }
  .gantt_critical_link .gantt_link_arrow { border-left-color: #ef4444 !important; }

  .critical-row           { background-color: #fef2f2 !important; }
  .critical-row:hover     { background-color: #fee2e2 !important; }

  /* ── Resource cell: dim if not a sub-task ── */
  .resource-disabled-cell {
    color: #cbd5e1 !important;
    font-style: italic !important;
    font-size: 11px !important;
  }

  /* ── Duration cell: dim if parent/project (auto roll-up, not manually editable) ── */
  .duration-disabled-cell {
    color: #cbd5e1 !important;
    font-style: italic !important;
    font-size: 11px !important;
  }

  /* ── Predecessor type badge (color-coded) ── */
  .pred-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
    margin-left: 3px;
    line-height: 16px;
    vertical-align: middle;
  }
  .pred-badge-fs { background: #dbeafe; color: #1d4ed8; }
  .pred-badge-ss { background: #dcfce7; color: #15803d; }
  .pred-badge-ff { background: #fef3c7; color: #b45309; }
  .pred-badge-sf { background: #f3e8ff; color: #7c3aed; }

  /* ── Predecessor editor inline styles ── */
  @keyframes predDropdownIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pred-editor-wbs-input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.15) !important;
  }
  .pred-type-dropdown-panel {
    animation: predDropdownIn 0.15s ease-out;
  }
  .pred-type-opt:hover {
    background: #f1f5f9 !important;
  }

  .gantt_cal_light {
    border-radius: 12px !important;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important;
    border: 1px solid #e2e8f0 !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
  }
  .gantt_cal_header {
    background-color: #f8fafc !important;
    border-bottom: 1px solid #e2e8f0 !important;
    font-weight: bold !important;
    color: #1e293b !important;
  }
  .gantt_btn_set         { border-radius: 6px !important; font-weight: bold !important; }
  .gantt_save_btn_set    { background-color: #2563eb !important; color: white !important; }
  .gantt_modal_cover {
    background-color: rgba(15, 23, 42, 0.4) !important;
    opacity: 1 !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
  }

  /* ── Inline-editor override: resource column shows "—" hint for non-subtasks ── */
  .gantt_grid_editor_placeholder {
    color: #94a3b8 !important;
    font-style: italic !important;
  }

  /* ── Custom native resizer handle ── */
  .gantt_resizer {
    background-color: transparent !important;
    border-left: 1px solid #e2e8f0 !important;
    border-right: 1px solid #e2e8f0 !important;
    width: 6px !important;
    cursor: col-resize !important;
    position: relative !important;
    transition: background-color 0.2s;
  }
  .gantt_resizer:hover {
    background-color: rgba(37,99,235,0.05) !important;
  }
  .gantt_resizer::after {
    content: "⋮";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    width: 14px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    color: #64748b;
    font-size: 11px;
    font-weight: bold;
    line-height: 24px;
    pointer-events: none;
    z-index: 10;
  }
  .gantt_resizer_x {
    display: none !important; /* Hide horizontal resizer */
  }
`

// ── Inline style helpers ─────────────────────────────────────────────────────
const btnBase = {
  display: 'flex', alignItems: 'center', gap: 6,
  height: 34, borderRadius: 8, fontSize: 12,
  fontWeight: 600, cursor: 'pointer',
  border: '1px solid #e2e8f0',
  background: '#ffffff', color: '#374151',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  transition: 'background 0.15s',
  padding: '0 12px',
}
const iconBtnBase = {
  width: 34, height: 34,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#ffffff', border: '1px solid #e2e8f0',
  borderRadius: 8, cursor: 'pointer', color: '#64748b',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}
const dropdownMenu = {
  position: 'absolute', top: '100%', left: 0, marginTop: 6,
  background: '#ffffff', border: '1px solid #e2e8f0',
  borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
  zIndex: 200, padding: '4px 0', fontSize: 12, minWidth: 160,
}
const dropdownItem = {
  width: '100%', textAlign: 'left',
  padding: '8px 16px', background: 'none',
  border: 'none', cursor: 'pointer',
  color: '#374151', fontWeight: 600, fontSize: 12,
}

// ── Link type constants ───────────────────────────────────────────────────────
// dhtmlx-gantt: 0 = FS, 1 = SS, 2 = FF, 3 = SF
const LINK_FS = 0
const LINK_SS = 1
const LINK_FF = 2
const LINK_SF = 3

// ── Calendar-aware "add N work days backward" helper ──────────────────────────
// dhtmlx-gantt ships gantt.calculateEndDate() (forward, work-time aware) but has
// no built-in reverse equivalent. This walks backward one day at a time and
// skips non-work days when gantt.config.work_time is enabled, so FF/SF stay
// aligned with the same calendar gantt uses for everything else.
function calculateStartDateFromEnd(endDate, duration) {
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

// ── Auto-scheduling helper ────────────────────────────────────────────────────
/**
 * Given a link connecting sourceTask → targetTask, compute the new
 * start_date (and end_date) for targetTask based on the link type.
 *
 * Rules:
 *  FS  – target starts when source finishes       → target.start = source.end
 *  SS  – target starts when source starts          → target.start = source.start
 *  FF  – target finishes when source finishes      → target.end = source.end
 *  SF  – target must finish before source starts    → target.end = source.start
 *
 * All date math is delegated to gantt's own calendar (gantt.calculateEndDate
 * for forward calculation, calculateStartDateFromEnd for backward), instead of
 * raw millisecond arithmetic. Raw ms math ignores gantt's own duration/work-time
 * rules and is what was causing the "end date off by a day" and "imprecise SF
 * dates" issues.
 *
 * Returns { start_date, end_date } or null if nothing should change.
 */
function computeAutoScheduledDates(link, sourceTask, targetTask) {
  if (!sourceTask || !targetTask) return null

  const srcStart = new Date(sourceTask.start_date)
  const srcEnd = new Date(sourceTask.end_date)

  // NOTE: `targetTask.duration || 1` previously turned a legitimate 0-day
  // milestone duration into 1 (since 0 is falsy), silently making linked
  // milestones spawn a 1-day bar. Use an explicit numeric check instead.
  const duration = typeof targetTask.duration === 'number' ? targetTask.duration : 1

  const linkType = parseInt(link.type, 10)
  const lag = link.lag ? parseInt(link.lag, 10) : 0

  let newStart, newEnd

  switch (linkType) {
    case LINK_FS: {
      // Target starts when source finishes (+ optional lag)
      newStart = lag ? gantt.date.add(srcEnd, lag, 'day') : new Date(srcEnd)
      newEnd = gantt.calculateEndDate({ start_date: newStart, duration })
      break
    }
    case LINK_SS: {
      // Target starts when source starts (+ optional lag)
      newStart = lag ? gantt.date.add(srcStart, lag, 'day') : new Date(srcStart)
      newEnd = gantt.calculateEndDate({ start_date: newStart, duration })
      break
    }
    case LINK_FF: {
      // Target finishes when source finishes (+ optional lag)
      newEnd = lag ? gantt.date.add(srcEnd, lag, 'day') : new Date(srcEnd)
      newStart = calculateStartDateFromEnd(newEnd, duration)
      break
    }
    case LINK_SF: {
      // Target must finish before source starts → target.end = source.start
      newEnd = lag ? gantt.date.add(srcStart, lag, 'day') : new Date(srcStart)
      newStart = calculateStartDateFromEnd(newEnd, duration)
      break
    }
    default:
      return null
  }

  return { start_date: newStart, end_date: newEnd }
}

/**
 * Propagate scheduling changes from a single updated task through all
 * downstream links, using BFS so cascades work correctly.
 *
 * visited set prevents infinite loops on circular references.
 */
function propagateScheduling(changedTaskId, visited = new Set()) {
  if (visited.has(changedTaskId)) return
  visited.add(changedTaskId)

  let sourceTask
  try { sourceTask = gantt.getTask(changedTaskId) } catch { return }
  if (!sourceTask) return

  const allLinks = gantt.getLinks()
  const outgoing = allLinks.filter(l => String(l.source) === String(changedTaskId))

  outgoing.forEach(link => {
    const targetId = link.target
    let targetTask
    try { targetTask = gantt.getTask(targetId) } catch { return }
    if (!targetTask) return

    const newDates = computeAutoScheduledDates(link, sourceTask, targetTask)
    if (!newDates) return

    const startChanged = newDates.start_date.getTime() !== new Date(targetTask.start_date).getTime()
    const endChanged = newDates.end_date.getTime() !== new Date(targetTask.end_date).getTime()

    if (startChanged || endChanged) {
      targetTask.start_date = newDates.start_date
      targetTask.end_date = newDates.end_date
      // Keep gantt's own duration field consistent with the dates we just set,
      // so the Duration column and the grid's internal editor validation agree.
      targetTask.duration = gantt.calculateDuration({
        start_date: newDates.start_date,
        end_date: newDates.end_date,
      })
      gantt.updateTask(targetId)
      // Cascade further
      propagateScheduling(targetId, visited)
    }
  })
}

/**
 * Roll up dates from children to parent (and ancestors).
 * Parent start_date = earliest child start, end_date = latest child end,
 * duration = calculated from those dates via gantt's calendar.
 * Walks up the tree so grandparents also update.
 */
function rollUpParentDates(taskId, visited = new Set()) {
  if (visited.has(taskId)) return
  visited.add(taskId)

  let parentId
  try { parentId = gantt.getParent(taskId) } catch { return }
  if (!parentId || !gantt.isTaskExists(parentId)) return

  let parentTask
  try { parentTask = gantt.getTask(parentId) } catch { return }

  // Roll up for any task that has children (not just 'project' type)
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
    // Continue rolling up to grandparent
    rollUpParentDates(parentId, visited)
  }
}

// ── isSubTask helper: checks if a task's parent is NOT the root project task ──
function isSubTask(task, projectId) {
  if (!task.parent) return false
  if (String(task.parent) === `project_${projectId}`) return false
  if (task.type === 'project') return false
  if (task.type === 'milestone') return false
  return true
}

// ── Component ─────────────────────────────────────────────────────────────────
function GanttChart({ tasks, projectName, onClose, pmId, projectId }) {
  const containerRef = useRef(null)
  const syncingTasksRef = useRef(new Set())
  // Guard: prevent re-entrant onAfterTaskUpdate loops from propagateScheduling
  const schedulingRef = useRef(false)

  const [zoomLevel, setZoomLevel] = useState('day')
  const [criticalPath, setCriticalPath] = useState(false)
  const [showGantt, setShowGantt] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [baselineOpen, setBaselineOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deleteText, setDeleteText] = useState('')

  const [activeBaseline, setActiveBaseline] = useState('Baseline 1')

  useEffect(() => {
    const h = () => { setAddOpen(false); setBaselineOpen(false); setMoreOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.innerHTML = customStyles
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  // ── Formatting helpers ───────────────────────────────────────────────────────
  const getLinkTypeLabel = (type) => {
    const t = parseInt(type, 10)
    return t === LINK_SS ? 'SS' : t === LINK_FF ? 'FF' : t === LINK_SF ? 'SF' : 'FS'
  }

  const getPredecessorsText = useCallback((task) => {
    try {
      const links = gantt.getLinks() || []
      const taskLinks = links.filter(l => String(l.target) === String(task.id))
      if (!taskLinks.length) return '-'
      return taskLinks.map(link => {
        if (!gantt.isTaskExists(link.source)) return ''
        const src = gantt.getTask(link.source)
        const wbs = gantt.getWBSCode(src) || ''
        const label = getLinkTypeLabel(link.type)
        const lag = link.lag ? (link.lag > 0 ? `+${link.lag}d` : `${link.lag}d`) : ''
        return `${wbs}${label !== 'FS' ? label : ''}${lag}`
      }).filter(Boolean).join(', ') || '-'
    } catch { return '-' }
  }, [])

  const formatDateShort = (date) => {
    if (!date) return '-'
    let d = date
    if (typeof date === 'string') d = new Date(date)
    try {
      const day = d.getDate().toString().padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[d.getMonth()]
      const year = d.getFullYear().toString().slice(-2)
      return `${day} ${month} '${year}`
    } catch { return '-' }
  }

  // dhtmlx-gantt end_date is exclusive (1d task Jul 1→Jul 2).
  // This returns the inclusive last day so "1d" shows same start & end date.
  const getInclusiveEndDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    return d
  }

  const formatToAPI = (date, isEnd = false) => {
    if (!date) return null
    const d = new Date(date)
    const pad = n => n.toString().padStart(2, '0')
    let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds()
    if (h === 0 && m === 0 && s === 0) { h = isEnd ? 18 : 10 }
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`
  }
  const formatToAPIDateOnly = (date) => {
    if (!date) return null
    const d = new Date(date)
    const pad = n => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const syncTaskWithAPI = async (task, isSubTaskOverride = null) => {
    // API logic removed to use dummy data locally
    console.log("Mock syncTaskWithAPI called for task:", task.id);
  }


  // ── Main gantt setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    try {
      gantt.plugins({ critical_path: true, tooltip: true, auto_scheduling: true, inline_editors: true })
    } catch {
      gantt.plugins({ critical_path: true, tooltip: true, inline_editors: true })
    }

    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.row_height = 42
    gantt.config.task_height = 22
    gantt.config.link_line_width = 1.5
    gantt.config.show_chart = showGantt
    gantt.config.highlight_critical_path = criticalPath
    gantt.config.work_time = true
    gantt.config.start_on_monday = false
    gantt.config.inline_editors_date_format = '%Y-%m-%d'
    gantt.config.details_on_dblclick = false

    gantt.config.grid_width = 640
    gantt.config.grid_resize = true

    // Auto-scheduling: keep native plugin OFF so our custom propagation handles it
    // (avoids conflicts with custom predecessor editor)
    gantt.config.auto_scheduling = false

    // ── Inline editors ──────────────────────────────────────────────────────────
    const textEditor = { type: 'text', map_to: 'text' }
    const dateEditor = { type: 'date', map_to: 'start_date' }
    const endEditor = { type: 'date', map_to: 'end_date' }
    const durationEditor = { type: 'number', map_to: 'duration', min: 0, max: 1000 }
    const resourceEditor = { type: 'text', map_to: 'assignees' }

    // ── Custom predecessor inline editor with FS/SS/FF/SF selection ──────────
    // Register the custom editor type once
    if (!gantt._predecessorEditorRegistered) {
      gantt.config.editor_types.custom_predecessor = {
        show: function (id, column, config, placeholder) {
          const task = gantt.getTask(id)
          const links = gantt.getLinks() || []
          const existingLink = links.find(l => String(l.target) === String(id))
          let currentWbs = ''
          let currentType = LINK_FS

          if (existingLink && gantt.isTaskExists(existingLink.source)) {
            const srcTask = gantt.getTask(existingLink.source)
            currentWbs = gantt.getWBSCode(srcTask) || ''
            currentType = parseInt(existingLink.type, 10)
          }

          // ── Color scheme per link type ────────────────────────────
          const TYPE_COLORS = {
            [LINK_FS]: { bg: '#dbeafe', color: '#1d4ed8', activeBg: '#2563eb' },
            [LINK_SS]: { bg: '#dcfce7', color: '#15803d', activeBg: '#16a34a' },
            [LINK_FF]: { bg: '#fef3c7', color: '#b45309', activeBg: '#d97706' },
            [LINK_SF]: { bg: '#f3e8ff', color: '#7c3aed', activeBg: '#8b5cf6' },
          }
          const getTypeColor = (v) => TYPE_COLORS[v] || TYPE_COLORS[LINK_FS]

          // ── Container ────────────────────────────────────────────
          const container = document.createElement('div')
          container.style.cssText = 'display:flex;align-items:center;gap:3px;width:100%;height:100%;padding:2px 4px;box-sizing:border-box;'

          // ── WBS input ────────────────────────────────────────────
          const input = document.createElement('input')
          input.className = 'pred-editor-wbs-input'
          input.type = 'text'
          input.value = currentWbs
          input.placeholder = '#'
          input.style.cssText = 'width:36px;height:28px;border:1.5px solid #e2e8f0;border-radius:6px;padding:0 4px;font-size:11px;text-align:center;outline:none;background:#fff;color:#0f172a;font-weight:700;font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;'

          // ── Type selector wrapper ────────────────────────────────
          const typeWrapper = document.createElement('div')
          typeWrapper.style.cssText = 'position:relative;flex:1;min-width:0;'

          // ── Type button ──────────────────────────────────────────
          const typeBtn = document.createElement('button')
          typeBtn.type = 'button'
          const typeLabels = { [LINK_FS]: 'FS', [LINK_SS]: 'SS', [LINK_FF]: 'FF', [LINK_SF]: 'SF' }
          typeBtn.dataset.value = String(currentType)

          const renderBtnContent = (typeVal) => {
            const tc = getTypeColor(typeVal)
            const lbl = typeLabels[typeVal] || 'FS'
            typeBtn.style.cssText = `width:100%;height:28px;border:1.5px solid ${tc.bg};border-radius:6px;background:${tc.bg};color:${tc.color};font-weight:700;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 8px;transition:all 0.15s;font-family:inherit;letter-spacing:0.3px;`
            typeBtn.innerHTML = `<span>${lbl}</span><svg width="8" height="8" viewBox="0 0 12 12" fill="none" style="opacity:0.6;"><path d="M3 5L6 8L9 5" stroke="${tc.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          }
          renderBtnContent(currentType)

          // ── Dropdown panel (appended to body to escape overflow) ──
          const dropdown = document.createElement('div')
          dropdown.className = 'pred-type-dropdown-panel'
          dropdown.style.cssText = 'display:none;position:fixed;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.08);z-index:99999;padding:5px;width:235px;box-sizing:border-box;'

          // Header
          const header = document.createElement('div')
          header.style.cssText = 'padding:6px 10px 5px;font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid #f1f5f9;margin-bottom:3px;'
          header.textContent = 'Link Type'
          dropdown.appendChild(header)

          const linkTypes = [
            { value: LINK_FS, label: 'FS', desc: 'Finish → Start' },
            { value: LINK_SS, label: 'SS', desc: 'Start → Start' },
            { value: LINK_FF, label: 'FF', desc: 'Finish → Finish' },
            { value: LINK_SF, label: 'SF', desc: 'Start → Finish' },
          ]

          const renderOptions = () => {
            dropdown.querySelectorAll('.pred-type-opt').forEach(el => el.remove())
            linkTypes.forEach(lt => {
              const tc = getTypeColor(lt.value)
              const isActive = parseInt(typeBtn.dataset.value, 10) === lt.value
              const opt = document.createElement('button')
              opt.type = 'button'
              opt.className = 'pred-type-opt'
              opt.style.cssText = `display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;transition:background 0.1s;background:${isActive ? tc.bg : 'transparent'};font-family:inherit;outline:none;box-sizing:border-box;text-align:left;`
              opt.innerHTML = `
                <span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;border-radius:4px;font-weight:700;font-size:10px;letter-spacing:0.4px;background:${isActive ? tc.activeBg : '#f1f5f9'};color:${isActive ? '#fff' : tc.color};">${lt.label}</span>
                <span style="color:${isActive ? '#0f172a' : '#64748b'};font-weight:${isActive ? '600' : '500'};flex:1;text-align:left;white-space:nowrap;">${lt.desc}</span>
                ${isActive ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${tc.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
              `
              opt.addEventListener('click', (e) => {
                e.stopPropagation()
                e.preventDefault()
                typeBtn.dataset.value = String(lt.value)
                renderBtnContent(lt.value)
                hideDropdown()
                renderOptions()
                input.focus()
              })
              dropdown.appendChild(opt)
            })
          }
          renderOptions()

          // Position dropdown below the type button using fixed positioning
          const positionDropdown = () => {
            const btnRect = typeBtn.getBoundingClientRect()
            const dropW = 235
            // Right-align to button's right edge (predecessor column is near the right)
            let left = btnRect.right - dropW
            // If it would go off the left edge, push it right
            if (left < 8) left = 8
            // If it would go off the right edge, clamp using clientWidth (excludes scrollbar width)
            const viewportWidth = document.documentElement.clientWidth
            if (left + dropW > viewportWidth - 12) {
              left = viewportWidth - dropW - 12
            }
            dropdown.style.top = (btnRect.bottom + 4) + 'px'
            dropdown.style.left = left + 'px'
          }

          const showDropdown = () => {
            dropdown.style.display = 'block'
            positionDropdown()
          }
          const hideDropdown = () => {
            dropdown.style.display = 'none'
          }

          typeBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            e.preventDefault()
            if (dropdown.style.display !== 'none') {
              hideDropdown()
            } else {
              showDropdown()
            }
          })

          // Keyboard: Tab on WBS input opens the type dropdown
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
              if (dropdown.style.display !== 'none') hideDropdown()
              else showDropdown()
            }
          })

          // Close dropdown on outside click (don't interfere with other elements)
          const closeHandler = (e) => {
            if (!typeWrapper.contains(e.target) && !dropdown.contains(e.target)) {
              hideDropdown()
            }
          }
          document.addEventListener('mousedown', closeHandler, true)

          // Reposition on scroll (gantt area scrolls)
          const scrollHandler = () => {
            if (dropdown.style.display !== 'none') positionDropdown()
          }
          window.addEventListener('scroll', scrollHandler, true)

          container._closeHandler = closeHandler
          container._scrollHandler = scrollHandler

          typeWrapper.appendChild(typeBtn)
          // Append dropdown to body so it's never clipped
          document.body.appendChild(dropdown)

          container.appendChild(input)
          container.appendChild(typeWrapper)

          placeholder.innerHTML = ''
          placeholder.appendChild(container)

          this._container = container
          this._dropdown = dropdown
          this._input = input
          this._typeBtn = typeBtn

          requestAnimationFrame(() => { input.focus(); input.select() })
        },

        hide: function () {
          if (this._container && this._container._closeHandler) {
            document.removeEventListener('mousedown', this._container._closeHandler, true)
          }
          if (this._container && this._container._scrollHandler) {
            window.removeEventListener('scroll', this._container._scrollHandler, true)
          }
          // Remove dropdown from body
          if (this._dropdown && this._dropdown.parentNode) {
            this._dropdown.parentNode.removeChild(this._dropdown)
          }
          this._container = null
          this._dropdown = null
          this._input = null
          this._typeBtn = null
        },

        set_value: function (value, id, column, node) {
          // Already handled in show()
        },

        get_value: function (id, column, node) {
          const wbs = this._input ? this._input.value.trim() : ''
          const linkType = this._typeBtn ? parseInt(this._typeBtn.dataset.value, 10) : LINK_FS
          return { wbs, linkType }
        },

        is_changed: function (value, id, column, node) {
          return true // Always treat as changed to allow save
        },

        is_valid: function (value, id, column, node) {
          return true
        },

        save: function (id, column, node) {
          const val = this.get_value(id, column, node)
          if (!val.wbs) {
            // Empty WBS → remove any existing link targeting this task
            const links = gantt.getLinks() || []
            links.filter(l => String(l.target) === String(id)).forEach(l => {
              gantt.deleteLink(l.id)
            })
            return
          }
          // Find the source task by WBS code
          let sourceTask = null
          gantt.eachTask(t => {
            if (gantt.getWBSCode(t) === val.wbs) {
              sourceTask = t
            }
          })
          if (!sourceTask) {
            alert(`No task found with WBS code "${val.wbs}"`)
            return
          }
          if (String(sourceTask.id) === String(id)) {
            alert('A task cannot be its own predecessor.')
            return
          }

          // Remove existing links targeting this task
          const links = gantt.getLinks() || []
          links.filter(l => String(l.target) === String(id)).forEach(l => {
            gantt.deleteLink(l.id)
          })

          // Add the new link
          gantt.addLink({
            id: `link_${Date.now()}`,
            source: sourceTask.id,
            target: id,
            type: String(val.linkType),
          })
        },

        focus: function (node) {
          if (this._input) this._input.focus()
        },
      }
      gantt._predecessorEditorRegistered = true
    }

    const predecessorEditor = { type: 'custom_predecessor', map_to: 'auto' }

    // ── Columns ────────────────────────────────────────────────────────────────
    gantt.config.columns = [
      {
        name: 'wbs_code', label: '#', width: 50, align: 'center', resize: true,
        header: [{ text: '#', align: 'center' }],
        template: (task) => {
          try {
            const index = gantt.getWBSCode(task) || ''
            const warn = task.userWarning
              ? '<span style="color:#ef4444;font-size:11px;margin-right:4px;">👤</span>'
              : ''
            return `<div class="gantt-index-cell" style="justify-content:center;font-weight:700;">${warn}${index}</div>`
          } catch { return '' }
        },
      },
      {
        name: 'text', label: 'Task Name', tree: true, width: 220, resize: true,
        editor: textEditor,
        header: [{ text: 'Task Name', align: 'center' }],
        template: (task) => {
          const isProj = task.type === 'project'
          return `<span style="font-weight:${isProj ? 'bold' : 'normal'};color:${isProj ? '#1e293b' : '#475569'};">${task.text}</span>`
        },
      },
      {
        name: 'start_date', label: 'Planned Start', width: 95, align: 'center', resize: true,
        editor: dateEditor,
        header: [{ text: 'Planned Start', align: 'center' }],
        template: (task) => formatDateShort(task.start_date),
      },
      {
        name: 'end_date', label: 'Planned End', width: 95, align: 'center', resize: true,
        editor: endEditor,
        header: [{ text: 'Planned End', align: 'center' }],
        template: (task) => formatDateShort(getInclusiveEndDate(task.end_date)),
      },
      {
        // ── DURATION column: dim + non-editable when task has children (auto rolled up) ──
        name: 'duration', label: 'Duration', width: 70, align: 'center', resize: true,
        editor: durationEditor,
        header: [{ text: 'Duration', align: 'center' }],
        template: (task) => {
          const dur = task.duration || 0
          const hasChildren = (gantt.getChildren(task.id) || []).length > 0
          if (task.type === 'project' || hasChildren) {
            return `<span class="duration-disabled-cell">${dur} d</span>`
          }
          return `<span style="color:#475569;font-weight:500;">${dur} d</span>`
        },
        onrender: (task, node) => {
          const hasChildren = (gantt.getChildren(task.id) || []).length > 0
          if (task.type === 'project' || hasChildren) {
            node.style.background = 'rgba(148,163,184,0.08)'
          } else {
            node.style.background = ''
          }
        },
      },
      {
        // ── RESOURCE column: editable only for sub-tasks ──────────────────────
        name: 'assignees', label: 'Resource', width: 120, align: 'center', resize: true,
        editor: resourceEditor,
        header: [{ text: 'Resource', align: 'center' }],
        template: (task) => {
          const sub = isSubTask(task, projectId)
          if (!sub) {
            // Not a sub-task → show a dim placeholder, no real value
            return '<span class="resource-disabled-cell">—</span>'
          }
          return task.assignees
            ? `<span style="color:#1e293b;font-weight:500;">${task.assignees}</span>`
            : '<span style="color:#94a3b8;">—</span>'
        },
        onrender: (task, node) => {
          // Visual hint: sub-tasks get a light blue tint in the resource cell
          if (isSubTask(task, projectId)) {
            node.style.background = 'rgba(219,234,254,0.25)'
          }
        },
      },
      {
        // ── PREDECESSOR column: shows WBS + link-type badge ───────────────────
        name: 'predecessors', label: 'Predecessor', width: 100, align: 'center', resize: true,
        editor: predecessorEditor,
        header: [{ text: 'Predecessor', align: 'center' }],
        template: (task) => {
          try {
            const links = gantt.getLinks() || []
            const taskLinks = links.filter(l => String(l.target) === String(task.id))
            if (!taskLinks.length) return '<span style="color:#cbd5e1;">—</span>'
            const badgeClass = { 0: 'pred-badge-fs', 1: 'pred-badge-ss', 2: 'pred-badge-ff', 3: 'pred-badge-sf' }
            return taskLinks.map(link => {
              if (!gantt.isTaskExists(link.source)) return ''
              const src = gantt.getTask(link.source)
              const wbs = gantt.getWBSCode(src) || ''
              const label = getLinkTypeLabel(link.type)
              const cls = badgeClass[parseInt(link.type, 10)] || 'pred-badge-fs'
              const lag = link.lag
                ? `<span style="color:#64748b;font-size:9px;margin-left:1px;font-weight:500;">${link.lag > 0 ? '+' : ''}${link.lag}d</span>`
                : ''
              return `<span style="font-weight:600;color:#334155;font-size:11px;">${wbs}</span><span class="pred-badge ${cls}">${label}</span>${lag}`
            }).filter(Boolean).join('<br/>') || '<span style="color:#cbd5e1;">—</span>'
          } catch { return '<span style="color:#cbd5e1;">—</span>' }
        },
      },
    ]

    gantt.config.scale_height = 50

    const zoomConfig = {
      levels: [
        {
          name: 'day', scale_height: 50, min_column_width: 30,
          scales: [
            { unit: 'week', step: 1, format: (d) => d.getDate() <= 7 ? gantt.date.date_to_str('%M %Y')(d) : gantt.date.date_to_str('%D %d %M %Y')(d) },
            { unit: 'day', step: 1, format: (d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] },
          ],
        },
        {
          name: 'week', scale_height: 50, min_column_width: 70,
          scales: [
            { unit: 'month', step: 1, format: '%F, %Y' },
            { unit: 'week', step: 1, format: 'Week #%W' },
          ],
        },
        {
          name: 'month', scale_height: 50, min_column_width: 120,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            { unit: 'month', step: 1, format: '%F' },
          ],
        },
        {
          name: 'year', scale_height: 50, min_column_width: 150,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            { unit: 'quarter', step: 1, format: 'Q%q' },
          ],
        },
      ],
    }

    gantt.ext.zoom.init(zoomConfig)
    gantt.ext.zoom.setLevel(zoomLevel)

    gantt.templates.task_class = (s, e, task) => {
      const classes = []
      if (task.barClass) classes.push(task.barClass)
      if (criticalPath && gantt.isCriticalTask?.(task)) classes.push('gantt_critical_task')
      return classes.join(' ')
    }
    gantt.templates.grid_row_class = (s, e, task) => {
      if (criticalPath && gantt.isCriticalTask?.(task)) return 'critical-row'
      return ''
    }
    gantt.templates.grid_cell_class = (col, task) =>
      col.name === 'wbs_code' ? (task.borderClass || 'border-left-none') : ''

    gantt.templates.rightside_text = (s, e, task) =>
      task.assignees && isSubTask(task, projectId)
        ? `<span class="gantt-assignees-label">${task.assignees}</span>`
        : ''

    gantt.templates.timeline_cell_class = (item, date) =>
      (date.getDay() === 0 || date.getDay() === 6) ? 'weekend-cell' : ''

    // ── Tooltip ────────────────────────────────────────────────────────────────
    gantt.templates.tooltip_text = (start, end, task) => {
      const links = gantt.getLinks() || []
      const taskLinks = links.filter(l => String(l.target) === String(task.id))
      const predStr = taskLinks.map(link => {
        if (!gantt.isTaskExists(link.source)) return ''
        const src = gantt.getTask(link.source)
        const wbs = gantt.getWBSCode(src) || ''
        const label = getLinkTypeLabel(link.type)
        return `${wbs} (${label})`
      }).filter(Boolean).join(', ')

      const resourceLine = isSubTask(task, projectId) && task.assignees
        ? `<br/><b>Resource:</b> ${task.assignees}`
        : ''

      return `<b>${task.text}</b>
              <br/><b>Start:</b> ${formatDateShort(task.start_date)}
              <br/><b>End:</b> ${formatDateShort(getInclusiveEndDate(task.end_date))}
              <br/><b>Duration:</b> ${task.duration || 0} days
              ${resourceLine}
              ${predStr ? `<br/><b>Predecessors:</b> ${predStr}` : ''}`
    }

    gantt.init(containerRef.current)
    gantt.clearAll()
    
    const dummyTasks = {
      data: [
        { id: '1', text: 'Project Kickoff', start_date: '2026-07-01', duration: 3, progress: 1, open: true, type: 'project' },
        { id: '2', text: 'Requirement Analysis', start_date: '2026-07-04', duration: 5, progress: 0.8, parent: '1', barClass: 'gantt-bar-blue', borderClass: 'border-left-blue' },
        { id: '3', text: 'Design Phase', start_date: '2026-07-09', duration: 7, progress: 0.5, parent: '1', barClass: 'gantt-bar-purple', borderClass: 'border-left-purple' },
        { id: '4', text: 'Development', start_date: '2026-07-16', duration: 14, progress: 0.2, parent: '1', barClass: 'gantt-bar-green', borderClass: 'border-left-green' },
        { id: '5', text: 'Testing', start_date: '2026-07-30', duration: 7, progress: 0, parent: '1', barClass: 'gantt-bar-pink', borderClass: 'border-left-pink' },
        { id: '6', text: 'Deployment', start_date: '2026-08-06', duration: 2, progress: 0, parent: '1', barClass: 'gantt-bar-dark-green', borderClass: 'border-left-green' }
      ],
      links: [
        { id: '1', source: '1', target: '2', type: '0' },
        { id: '2', source: '2', target: '3', type: '0' },
        { id: '3', source: '3', target: '4', type: '0' },
        { id: '4', source: '4', target: '5', type: '0' },
        { id: '5', source: '5', target: '6', type: '0' }
      ]
    };
    
    gantt.parse(dummyTasks)

    // ── Initial roll-up: recalculate parent dates/duration from children on load ─
    gantt.eachTask(task => {
      const children = gantt.getChildren(task.id)
      if (children && children.length > 0) {
        let earliestStart = null
        let latestEnd = null
        children.forEach(childId => {
          try {
            const child = gantt.getTask(childId)
            const cs = new Date(child.start_date)
            const ce = new Date(child.end_date)
            if (!earliestStart || cs < earliestStart) earliestStart = cs
            if (!latestEnd || ce > latestEnd) latestEnd = ce
          } catch { /* skip */ }
        })
        if (earliestStart && latestEnd) {
          task.start_date = earliestStart
          task.end_date = latestEnd
          task.duration = gantt.calculateDuration({
            start_date: earliestStart,
            end_date: latestEnd,
          })
        }
      }
    })
    gantt.refreshData()

    const events = []

    // ── Block lightbox ─────────────────────────────────────────────────────────
    events.push(gantt.attachEvent('onLightbox', () => {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return true
    }))
    events.push(gantt.attachEvent('onAfterLightbox', () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }))
    events.push(gantt.attachEvent('onTaskDblClick', () => false))

    // ── Guard resource edits on non-sub-tasks + validate FF completion order ──
    events.push(gantt.attachEvent('onBeforeTaskChanged', (id, mode, originalTask) => {
      try {
        const task = gantt.getTask(id)

        // Resource guard: parent/milestone rows never carry a resource
        if (!isSubTask(task, projectId)) {
          if (task.assignees !== originalTask.assignees) {
            task.assignees = originalTask.assignees
          }
        }

        // FF completion guard: a task on the target end of a Finish-to-Finish
        // link cannot be marked 100% complete until its FF predecessor is
        // also complete. This is a business rule dhtmlx doesn't enforce on
        // its own — it only fixes the *dates*, not the *completion order*.
        if (mode === 'update' && (task.progress || 0) >= 1 && (originalTask.progress || 0) < 1) {
          const ffLinks = gantt.getLinks().filter(
            l => String(l.target) === String(id) && parseInt(l.type, 10) === LINK_FF
          )
          for (const link of ffLinks) {
            if (gantt.isTaskExists(link.source)) {
              const pred = gantt.getTask(link.source)
              if ((pred.progress || 0) < 1) {
                alert(`Cannot mark "${task.text}" complete: its Finish-to-Finish predecessor "${pred.text}" is not finished yet.`)
                task.progress = originalTask.progress || 0
                break
              }
            }
          }
        }
      } catch { /* ignore */ }
      return true
    }))

    // ── Intercept inline editor: block resource editing for non-sub-tasks
    //    and block manual duration editing on parent/project rows (their
    //    duration is a roll-up of children, not a directly editable field) ──
    events.push(gantt.attachEvent('onBeforeEditorOpen', (taskId, columnName) => {
      try {
        const task = gantt.getTask(taskId)
        if (columnName === 'assignees' && !isSubTask(task, projectId)) {
          // Silently block the editor from opening
          return false
        }
        // Block duration/start/end editing on any task that has children (auto roll-up)
        const hasChildren = (gantt.getChildren(taskId) || []).length > 0
        if ((task.type === 'project' || hasChildren) && (columnName === 'duration' || columnName === 'start_date' || columnName === 'end_date')) {
          return false
        }
      } catch { /* allow */ }
      return true
    }))

    // ── After task update: auto-schedule downstream + roll up parent + sync API ─
    events.push(gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
      // Prevent re-entrant loops triggered by propagateScheduling/rollUp calling updateTask
      if (schedulingRef.current) return
      schedulingRef.current = true

      try {
        gantt.refreshData()
        // Propagate scheduling changes to linked tasks
        propagateScheduling(id)
        // Roll up dates to parent (and ancestors)
        rollUpParentDates(id)
      } finally {
        schedulingRef.current = false
      }

      syncTaskWithAPI(task)
    }))

    // ── After drag (move/resize bar): same propagation ─────────────────────────
    events.push(gantt.attachEvent('onAfterTaskDrag', (id, mode) => {
      if (schedulingRef.current) return
      if (mode === 'move' || mode === 'resize') {
        schedulingRef.current = true
        try {
          propagateScheduling(id)
          rollUpParentDates(id)
          gantt.refreshData()
        } finally {
          schedulingRef.current = false
        }
        try { syncTaskWithAPI(gantt.getTask(id)) } catch { /* ignore */ }
      }
    }))

    // ── After task add: roll up parent dates so parent duration auto-calculates ─
    events.push(gantt.attachEvent('onAfterTaskAdd', (id, task) => {
      if (schedulingRef.current) return
      schedulingRef.current = true
      try {
        rollUpParentDates(id)
        gantt.refreshData()
      } finally {
        schedulingRef.current = false
      }
      syncTaskWithAPI(task)
    }))

    // ── After task delete: re-roll-up parent so duration updates ───────────────
    events.push(gantt.attachEvent('onAfterTaskDelete', (id, task) => {
      if (schedulingRef.current) return
      if (task.parent && gantt.isTaskExists(task.parent)) {
        schedulingRef.current = true
        try {
          // Re-roll-up from any remaining sibling
          const siblings = gantt.getChildren(task.parent)
          if (siblings && siblings.length > 0) {
            rollUpParentDates(siblings[0])
          }
          gantt.refreshData()
        } finally {
          schedulingRef.current = false
        }
      }
    }))

    // ── After link add: immediately apply scheduling ───────────────────────────
    events.push(gantt.attachEvent('onAfterLinkAdd', (id, link) => {
      if (schedulingRef.current) return
      schedulingRef.current = true
      try {
        const srcTask = gantt.isTaskExists(link.source) ? gantt.getTask(link.source) : null
        const targetTask = gantt.isTaskExists(link.target) ? gantt.getTask(link.target) : null
        if (srcTask && targetTask) {
          const newDates = computeAutoScheduledDates(link, srcTask, targetTask)
          if (newDates) {
            targetTask.start_date = newDates.start_date
            targetTask.end_date = newDates.end_date
            targetTask.duration = gantt.calculateDuration({
              start_date: newDates.start_date,
              end_date: newDates.end_date,
            })
            gantt.updateTask(link.target)
            propagateScheduling(link.target)
            gantt.refreshData()
          }
        }
      } finally {
        schedulingRef.current = false
      }
    }))

    // ── After link update (type change e.g. FS→SS): re-apply scheduling ────────
    events.push(gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
      if (schedulingRef.current) return
      schedulingRef.current = true
      try {
        const srcTask = gantt.isTaskExists(link.source) ? gantt.getTask(link.source) : null
        const targetTask = gantt.isTaskExists(link.target) ? gantt.getTask(link.target) : null
        if (srcTask && targetTask) {
          const newDates = computeAutoScheduledDates(link, srcTask, targetTask)
          if (newDates) {
            targetTask.start_date = newDates.start_date
            targetTask.end_date = newDates.end_date
            targetTask.duration = gantt.calculateDuration({
              start_date: newDates.start_date,
              end_date: newDates.end_date,
            })
            gantt.updateTask(link.target)
            propagateScheduling(link.target)
            gantt.refreshData()
          }
        }
      } finally {
        schedulingRef.current = false
      }
    }))

    events.push(gantt.attachEvent('onTaskSelect', (id) => {
      setSelectedTaskId(id)
      return true
    }))
    events.push(gantt.attachEvent('onTaskUnselect', () => {
      setSelectedTaskId(null)
      return true
    }))

    return () => {
      gantt.clearAll()
      events.forEach(ev => gantt.detachEvent(ev))
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [tasks, zoomLevel, criticalPath, showGantt])

  // ── Add task handler ──────────────────────────────────────────────────────────
  const handleAddTask = async (type, isSubTaskFlag = false) => {
    setAddOpen(false)
    const activeId = gantt.getSelectedId()
    let parentId

    if (activeId) {
      if (isSubTaskFlag) { parentId = activeId; gantt.open(activeId) }
      else parentId = gantt.getParent(activeId) || undefined
    } else if (isSubTaskFlag) {
      alert('Please select a task first to add a sub-task.')
      return
    }

    const newTask = {
      id: `task_${Date.now()}`,
      api_id: null,
      text: type === 'project' ? 'New Category' : type === 'milestone' ? 'Milestone' : 'New Task',
      start_date: new Date(),
      duration: type === 'milestone' ? 0 : 5,
      progress: 0,
      parent: parentId,
      type,
      barClass: type === 'project' ? 'gantt-bar-dark-blue' : type === 'milestone' ? 'gantt-bar-green' : 'gantt-bar-blue',
      borderClass: type === 'project' ? 'border-left-none' : 'border-left-blue',
      // Sub-tasks get an empty resource; parent tasks never have one
      assignees: isSubTaskFlag ? '' : null,
    }

    gantt.addTask(newTask)
    gantt.selectTask(newTask.id)

    try { gantt.ext.inlineEditors.startEdit(newTask.id, 'text') } catch { /* fallback */ }
  }

  const handleDeleteClick = () => {
    const selectedId = gantt.getSelectedId() || selectedTaskId
    if (!selectedId) {
      alert('Please select a task or sub-task to delete.')
      return
    }
    if (selectedId === `project_${projectId}`) {
      alert('The project root task cannot be deleted.')
      return
    }
    try {
      const task = gantt.getTask(selectedId)
      if (task) {
        setTaskToDelete(task)
        setDeleteText('')
        setDeleteConfirmOpen(true)
      }
    } catch (err) {
      alert('Error finding the selected task.')
    }
  }

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return
    if (deleteText.trim().toLowerCase() === 'delete') {
      gantt.deleteTask(taskToDelete.id)
      setDeleteConfirmOpen(false)
      setTaskToDelete(null)
      setSelectedTaskId(null)
      setDeleteText('')
    }
  }

  const handleScrollToday = () => gantt.showDate(new Date())
  const handleScrollLeft = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x - 250, null) }
  const handleScrollRight = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x + 250, null) }
  const handleExport = (fmt) => { setMoreOpen(false); alert(`Exporting Gantt Chart to ${fmt.toUpperCase()}...`) }
  const handleClearAll = () => { setMoreOpen(false); if (confirm('Clear all tasks?')) gantt.clearAll() }

  const stopProp = (e) => e.stopPropagation()

  const totalTasks = tasks?.data?.length || 0
  const totalMilestones = tasks?.data?.filter(t => t.duration === 0).length || 0

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100%', height: 700,
      background: '#ffffff',
      borderRadius: 20, border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      overflow: 'hidden', marginTop: 24,
      userSelect: 'none', position: 'relative',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      resize: 'vertical', minHeight: 400, maxHeight: 1200,
    }}>

      {/* ══ ROW 1 — Title + Zoom ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, padding: '14px 24px',
        background: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
              {projectName ? `${projectName} Timeline` : 'Project Management Workplan'}
            </span>
            {projectName && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Schedule overview for {projectName}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #e2e8f0', borderRadius: 8,
            overflow: 'hidden', background: '#f8fafc',
          }}>
            {['Day', 'Month', 'Year'].map((label, i, arr) => {
              const val = label.toLowerCase()
              const active = zoomLevel === val
              return (
                <button key={val} onClick={() => setZoomLevel(val)} style={{
                  padding: '6px 18px', fontSize: 12, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', color: active ? '#2563eb' : '#64748b',
                  background: active ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                  outline: active ? '2px solid #2563eb' : 'none', outlineOffset: -2,
                  borderRadius: active ? 6 : 0,
                  boxShadow: active ? '0 1px 4px rgba(37,99,235,0.15)' : 'none',
                  position: 'relative', zIndex: active ? 1 : 0,
                  transition: 'all 0.12s',
                }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══ ROW 2 — Actions + Nav + Toggles ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, padding: '10px 24px',
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Add */}
          <div style={{ position: 'relative' }} onMouseDown={stopProp}>
            <button onClick={() => { setAddOpen(o => !o); setBaselineOpen(false); setMoreOpen(false) }}
              style={{
                ...btnBase, padding: '0 14px',
                background: '#2563eb', color: '#ffffff',
                border: 'none', fontWeight: 700,
                boxShadow: '0 1px 4px rgba(37,99,235,0.30)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
            >
              <Plus size={14} strokeWidth={2.5} />
              Add
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
            {addOpen && (
              <div style={dropdownMenu}>
                {[
                  ['Add Task', () => handleAddTask('task')],
                  ['Add Sub-task', () => handleAddTask('task', true)],
                  ['Add Work Stream', () => handleAddTask('project')],
                  ['Add Milestone', () => handleAddTask('milestone')],
                ].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={dropdownItem}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={handleDeleteClick}
            style={{
              ...btnBase,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 1px 4px rgba(239,68,68,0.30)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
          >
            <Trash2 size={14} strokeWidth={2.5} />
            Delete
          </button>

          {/* Baseline */}
          <div style={{ position: 'relative' }} onMouseDown={stopProp}>
            <button onClick={() => { setBaselineOpen(o => !o); setAddOpen(false); setMoreOpen(false) }}
              style={btnBase}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <FileText size={14} color="#94a3b8" />
              <span>Baseline:&nbsp;<span style={{ color: '#2563eb', fontWeight: 700 }}>{activeBaseline}</span></span>
              <ChevronDown size={12} color="#94a3b8" />
            </button>
            {baselineOpen && (
              <div style={{ ...dropdownMenu, minWidth: 180 }}>
                {['Baseline 1', 'Baseline 2 (Proposed)', 'Baseline 3'].map(item => (
                  <button key={item}
                    onClick={() => { setActiveBaseline(item); setBaselineOpen(false) }}
                    style={{ ...dropdownItem, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {item}
                    {activeBaseline === item && <Check size={12} color="#2563eb" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More */}
          <div style={{ position: 'relative' }} onMouseDown={stopProp}>
            <button onClick={() => { setMoreOpen(o => !o); setAddOpen(false); setBaselineOpen(false) }}
              style={btnBase}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <MoreHorizontal size={14} color="#94a3b8" />
              More
              <ChevronDown size={12} color="#94a3b8" />
            </button>
            {moreOpen && (
              <div style={dropdownMenu}>
                {[['Export to PDF', () => handleExport('pdf')], ['Export to PNG', () => handleExport('png')]].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={dropdownItem}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{label}</button>
                ))}
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                <button onClick={handleClearAll} style={{ ...dropdownItem, color: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >Clear All Tasks</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Nav */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #e2e8f0', borderRadius: 8,
            overflow: 'hidden', background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <button onClick={handleScrollLeft} style={{ ...iconBtnBase, borderRadius: 0, border: 'none', borderRight: '1px solid #e2e8f0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            ><ChevronLeft size={14} /></button>

            <button onClick={handleScrollToday} style={{
              height: 34, padding: '0 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#ffffff', border: 'none', borderRight: '1px solid #e2e8f0',
              cursor: 'pointer', color: '#374151', fontSize: 12, fontWeight: 700,
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <Calendar size={13} color="#94a3b8" />
              Today
            </button>

            <button onClick={handleScrollRight} style={{ ...iconBtnBase, borderRadius: 0, border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            ><ChevronRight size={14} /></button>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={criticalPath}
                onChange={e => setCriticalPath(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
              />
              Critical path
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#1e293b', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={showGantt}
                onChange={e => setShowGantt(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
              />
              Gantt
            </label>
          </div>

          {/* Settings + Print */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 16, borderLeft: '1px solid #e2e8f0', height: 34 }}>
            <button onClick={() => alert('Opening settings...')} title="Settings" style={iconBtnBase}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b' }}
            ><Settings size={15} /></button>
            <button onClick={() => window.print()} title="Print" style={iconBtnBase}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b' }}
            ><Printer size={15} /></button>
          </div>
        </div>
      </div>

      {/* ══ Gantt area ══ */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>

      {/* ══ Footer ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        fontSize: 11, color: '#64748b', fontWeight: 600, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#3b82f6' }} />
            <span>Task</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, transform: 'rotate(45deg)', background: '#10b981' }} />
            <span>Milestone</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#94a3b8', letterSpacing: '1px', fontSize: 13, fontWeight: 'bold' }}>- - -</span>
            <span>Baseline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 16, height: 2, background: '#ef4444' }} />
            <span>Critical Path</span>
          </div>
          {/* Predecessor type legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
            {[
              { label: 'FS', desc: 'Finish→Start', bg: '#dbeafe', color: '#1d4ed8' },
              { label: 'SS', desc: 'Start→Start', bg: '#dcfce7', color: '#15803d' },
              { label: 'FF', desc: 'Finish→Finish', bg: '#fef3c7', color: '#b45309' },
              { label: 'SF', desc: 'Start→Finish', bg: '#f3e8ff', color: '#7c3aed' },
            ].map(t => (
              <span key={t.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: '#64748b',
              }}>
                <span style={{
                  background: t.bg, color: t.color,
                  fontWeight: 700, fontSize: 9, padding: '1px 5px',
                  borderRadius: 4, letterSpacing: '0.3px', lineHeight: '16px',
                }}>{t.label}</span>
                <span>{t.desc}</span>
              </span>
            ))}
          </div>
        </div>

        <div>
          {totalTasks > 0
            ? `Showing 1 – ${totalTasks} of ${totalTasks} tasks (${totalMilestones} milestones)`
            : 'No schedule data available for this project.'}
        </div>
      </div>

      {deleteConfirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: 400,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Delete Task
              </h3>
              <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{taskToDelete?.text}</strong>? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                Type <span style={{ color: '#ef4444', fontWeight: 700 }}>delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                placeholder="delete"
                style={{
                  height: 38,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  padding: '0 12px',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#ef4444'
                  e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setTaskToDelete(null)
                  setDeleteText('')
                }}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '0 16px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTask}
                disabled={deleteText.trim().toLowerCase() !== 'delete'}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  background: deleteText.trim().toLowerCase() === 'delete' ? '#ef4444' : '#fca5a5',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: deleteText.trim().toLowerCase() === 'delete' ? 'pointer' : 'not-allowed',
                  padding: '0 16px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (deleteText.trim().toLowerCase() === 'delete') {
                    e.currentTarget.style.background = '#dc2626'
                  }
                }}
                onMouseLeave={e => {
                  if (deleteText.trim().toLowerCase() === 'delete') {
                    e.currentTarget.style.background = '#ef4444'
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GanttChart