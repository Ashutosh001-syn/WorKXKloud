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

  /* Today Marker Line */
  .today {
    background-color: #3b82f6 !important;
    width: 2px !important;
    box-shadow: 0 0 5px rgba(59,130,246,0.6);
  }
  .gantt_marker.today .gantt_marker_content {
    background-color: #3b82f6 !important;
    color: white !important;
    font-weight: 600 !important;
    border-radius: 4px;
    padding: 2px 8px;
    margin-left: -15px;
  }

  .resource-disabled-cell {
    color: #cbd5e1 !important;
    font-style: italic !important;
    font-size: 11px !important;
  }

  .duration-disabled-cell {
    color: #cbd5e1 !important;
    font-style: italic !important;
    font-size: 11px !important;
  }

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

  /* Adjustable divider between the Type dropdown and the Lag number input */
  .pred-editor-divider {
    width: 8px !important;
    align-self: stretch;
    cursor: col-resize !important;
    position: relative;
    flex: 0 0 auto;
    -webkit-user-select: none !important;
    user-select: none !important;
    touch-action: none !important;
  }
  .pred-editor-divider::after {
    content: "";
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    border-radius: 2px;
    background: #cbd5e1;
    transition: background 0.15s;
  }
  .pred-editor-divider:hover::after,
  .pred-editor-divider.dragging::after {
    background: #3b82f6;
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

  .gantt_grid_editor_placeholder {
    color: #94a3b8 !important;
    font-style: italic !important;
  }



  body.gantt_row_resize,
  .gantt_container.gantt_grid_resizing {
    cursor: col-resize !important;
    -webkit-user-select: none !important;
    user-select: none !important;
  }

  .gantt_task_line .gantt_link_control {
    transition: opacity 0.2s ease !important;
  }
  .gantt_link_point {
    width: 14px !important;
    height: 14px !important;
    border: 2.5px solid #3b82f6 !important;
    border-radius: 50% !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 4px rgba(0,0,0,0.1) !important;
    cursor: crosshair !important;
    transition: all 0.2s ease !important;
  }
  .gantt_link_point:hover {
    background: #3b82f6 !important;
    border-color: #1d4ed8 !important;
    transform: scale(1.25) !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(37, 99, 235, 0.3) !important;
  }
  @keyframes nodePulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 4px rgba(0,0,0,0.1); }
    50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(37, 99, 235, 0.3); }
  }
  .gantt_link_point.gantt_link_source {
    animation: nodePulse 1.5s ease-in-out infinite !important;
    background: #3b82f6 !important;
    border-color: #1d4ed8 !important;
  }

  @keyframes linkMenuIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`

// Inline style helpers
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

// Link type constants
// dhtmlx-gantt: 0 = FS, 1 = SS, 2 = FF, 3 = SF
const LINK_FS = 0
const LINK_SS = 1
const LINK_FF = 2
const LINK_SF = 3

// Every grid column's width, fixed — not screen-size dependent. Previous
// versions recomputed the grid pane's target width on every window/
// container resize and asked dhtmlx to reconcile that against each
// column's min_width on the fly; that recalculation raced with dhtmlx's
// own layout pass and would intermittently leave columns rendered blank
// or clipped. A single fixed width removes the race entirely: the grid
// always has exactly enough room for all 8 columns, every time, and never
// silently drops or blanks any of them. On screens too narrow for
// GRID_WIDTH + CHART_MIN_WIDTH, the whole widget scrolls horizontally
// instead (see containerRef's overflow-x: auto) — one predictable
// mechanism instead of several competing ones.
const COLUMN_WIDTHS = {
  wbs_code: 46,
  text: 200,
  start_date: 90,
  end_date: 90,
  duration: 64,
  assignees: 110,
  predecessors: 90,
  dependency_type: 90,
}
const GRID_WIDTH = Object.values(COLUMN_WIDTHS).reduce((sum, w) => sum + w, 0)

// Smallest the timeline pane can be while still showing a usable slice of
// dates + task bars, once the grid has already claimed GRID_WIDTH.
const CHART_MIN_WIDTH = 320

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

function computeAutoScheduledDates(link, sourceTask, targetTask) {
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

function computeConstrainedDates(targetId) {
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

function hasCircularDependency(sourceId, targetId) {
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

function parsePredecessorEntries(text) {
  if (!text || !text.trim()) return []
  return text.split(',').map(entry => {
    entry = entry.trim()
    if (!entry) return null
    const match = entry.match(/^([\d.]+)\s*(FS|SS|FF|SF)?\s*([+-]\d+)\s*d?$/i)
    if (match) {
      const wbs = match[1]
      const typeStr = match[2] ? match[2].toUpperCase() : 'FS'
      const lag = parseInt(match[3], 10)
      const typeMap = { 'FS': LINK_FS, 'SS': LINK_SS, 'FF': LINK_FF, 'SF': LINK_SF }
      return { wbs, linkType: typeMap[typeStr] || LINK_FS, lag }
    }
    const match2 = entry.match(/^([\d.]+)\s*(FS|SS|FF|SF)?$/i)
    if (match2) {
      const wbs = match2[1]
      const typeStr = match2[2] ? match2[2].toUpperCase() : 'FS'
      const typeMap = { 'FS': LINK_FS, 'SS': LINK_SS, 'FF': LINK_FF, 'SF': LINK_SF }
      return { wbs, linkType: typeMap[typeStr] || LINK_FS, lag: 0 }
    }
    return null
  }).filter(Boolean)
}

function propagateScheduling(changedTaskId, visited = new Set()) {
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

function rollUpParentDates(taskId, visited = new Set()) {
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

function isSubTask(task, projectId) {
  if (!task.parent) return false
  if (String(task.parent) === `project_${projectId}`) return false
  if (task.type === 'project') return false
  if (task.type === 'milestone') return false
  return true
}

function getAssigneeLabel(task) {
  const value = task.assignees
  if (!value || value === 'undefined' || value === 'null') return ''
  return String(value)
}

function toGanttDateOnly(value) {
  if (!value) return null
  return String(value).slice(0, 10)
}

function cleanResourceValue(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const SCHEDULE_BAR_CLASSES = [
  'gantt-bar-blue', 'gantt-bar-purple', 'gantt-bar-green', 'gantt-bar-pink',
  'gantt-bar-dark-blue', 'gantt-bar-dark-purple', 'gantt-bar-dark-green', 'gantt-bar-dark-pink',
]
const SCHEDULE_BORDER_CLASSES = [
  'border-left-blue', 'border-left-purple', 'border-left-green', 'border-left-pink',
  'border-left-blue', 'border-left-purple', 'border-left-green', 'border-left-pink',
]

function transformScheduleToGanttData(scheduleItems) {
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

function getApiTaskId(ganttId) {
  if (!ganttId || !gantt.isTaskExists(ganttId)) return null
  const task = gantt.getTask(ganttId)
  return task?.isApiTask ? task.apiId : null
}

function topologicalSchedule() {
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

// Component
function GanttChart({ tasks, projectName, onClose, pmId, projectId }) {
  const containerRef = useRef(null)
  const wrapperRef = useRef(null)
  const syncingTasksRef = useRef(new Set())
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
  const [linkMenu, setLinkMenu] = useState(null)

  const [activeBaseline, setActiveBaseline] = useState('Baseline 1')

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalData, setTaskModalData] = useState(null)

  const [alertMessage, setAlertMessage] = useState('')

  const [calendarType, setCalendarType] = useState('standard')
  const [customWorkingDays, setCustomWorkingDays] = useState([1, 2, 3, 4, 5])
  const [includeHolidays, setIncludeHolidays] = useState(true)
  const [customDropdownOpen, setCustomDropdownOpen] = useState(false)

  // containerWidth only drives cosmetic breakpoints (compact toolbar, row
  // height, etc.) — it no longer feeds into the grid's width. See
  // GRID_WIDTH's comment above for why that split matters.
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )
  const isMobile = containerWidth < 640
  const isTablet = containerWidth >= 640 && containerWidth < 900

  const [gridWidth, setGridWidth] = useState(GRID_WIDTH)
  const userResizedGridRef = useRef(false)

  const [dragPreviewWidth, setDragPreviewWidth] = useState(null)
  const dragPreviewWidthRef = useRef(null)
  const isResizing = useRef(false)
  const [holidaysData, setHolidaysData] = useState([])
  const [ganttError, setGanttError] = useState(null)

  const [scheduleTasks, setScheduleTasks] = useState(null)
  const [scheduleLoadError, setScheduleLoadError] = useState(null)
  const [scheduleReloadKey, setScheduleReloadKey] = useState(0)
  const [isSavingTask, setIsSavingTask] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setContainerWidth(el.getBoundingClientRect().width)

    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSchedule() {
      if (!projectId || !pmId) {
        setScheduleTasks({ data: [], links: [] })
        setScheduleLoadError(null)
        return
      }
      setScheduleTasks(null)
      setScheduleLoadError(null)
      try {

        const response = await fetch(API_ENDPOINTS.GET_PROJECT_SCHEDULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, pm_id: pmId }),

        })

        const result = await response.json()
        if (!result.success) throw new Error(result.message || 'Failed to fetch project schedule')
        if (cancelled) return
        setScheduleTasks(transformScheduleToGanttData(result.data || []))
      } catch (err) {
        console.error('Failed to load project schedule:', err)
        if (cancelled) return
        setScheduleLoadError(err.message || 'Failed to load project schedule.')
        setScheduleTasks({ data: [], links: [] })
      }
    }

    loadSchedule()
    return () => { cancelled = true }
  }, [projectId, pmId, scheduleReloadKey])

  const reloadSchedule = useCallback(() => {
    setScheduleReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HOLIDAYS)
        const data = await res.json()
        if (data.success) {
          setHolidaysData(data.data || [])
        }
      } catch (err) {
        console.error('Failed to load holidays:', err)
      }
    }
    fetchHolidays()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    if (calendarType === 'alldays') {
      gantt.config.work_time = false
    } else if (calendarType === 'standard') {
      gantt.config.work_time = true
      gantt.setWorkTime({ day: 0, hours: false }) // Sun
      gantt.setWorkTime({ day: 6, hours: false }) // Sat
      gantt.setWorkTime({ day: 1, hours: true })
      gantt.setWorkTime({ day: 2, hours: true })
      gantt.setWorkTime({ day: 3, hours: true })
      gantt.setWorkTime({ day: 4, hours: true })
      gantt.setWorkTime({ day: 5, hours: true })

      holidaysData.forEach(h => {
        if (h.holiday_date) {
          try {
            const d = new Date(h.holiday_date)
            gantt.setWorkTime({ date: d, hours: false })
          } catch (e) { }
        }
      })
    } else if (calendarType === 'custom') {
      gantt.config.work_time = true
      for (let i = 0; i <= 6; i++) {
        gantt.setWorkTime({ day: i, hours: customWorkingDays.includes(i) })
      }

      if (includeHolidays) {
        holidaysData.forEach(h => {
          if (h.holiday_date) {
            try {
              const d = new Date(h.holiday_date)
              gantt.setWorkTime({ date: d, hours: false })
            } catch (e) { }
          }
        })
      }
    }

    try {
      topologicalSchedule()
      gantt.render()
    } catch (e) { }
  }, [calendarType, holidaysData, customWorkingDays, includeHolidays])

  useEffect(() => {
    const h = () => { setAddOpen(false); setBaselineOpen(false); setMoreOpen(false); setLinkMenu(null); setCustomDropdownOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const MIN_GRID_WIDTH = 220
    const MIN_TIMELINE_WIDTH = 220

    const clampGridWidth = (raw, totalWidth) => {
      const maxWidth = Math.max(MIN_GRID_WIDTH, totalWidth - MIN_TIMELINE_WIDTH)
      return Math.min(maxWidth, Math.max(MIN_GRID_WIDTH, raw))
    }

    const handleMouseMove = (e) => {
      if (!isResizing.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = clampGridWidth(e.clientX - rect.left, rect.width)
      dragPreviewWidthRef.current = newWidth
      setDragPreviewWidth(newWidth)
    }
    const handleTouchMove = (e) => {
      if (!isResizing.current || !containerRef.current || !e.touches?.[0]) return
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = clampGridWidth(e.touches[0].clientX - rect.left, rect.width)
      dragPreviewWidthRef.current = newWidth
      setDragPreviewWidth(newWidth)
    }
    const commitResize = () => {
      if (isResizing.current) {
        isResizing.current = false
        document.body.style.cursor = 'default'
        if (dragPreviewWidthRef.current !== null) {
          userResizedGridRef.current = true
          setGridWidth(dragPreviewWidthRef.current)
        }
        dragPreviewWidthRef.current = null
        setDragPreviewWidth(null)
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', commitResize)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', commitResize)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', commitResize)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', commitResize)
    }
  }, [])

  // Fires on mount (before gantt.init() has run — the guard below makes
  // that a no-op) and again whenever the user commits a drag-resize. When
  // the committed width is narrower than the columns' own total (dragging
  // the grid smaller than its natural size), dhtmlx needs a second
  // resetLayout() one frame later to actually enforce each column's
  // min_width — a single call left columns rendered with no content
  // instead of the grid picking up its own horizontal scrollbar. This only
  // fires once per completed drag (gridWidth is the committed value, not
  // updated live while dragging), so it's cheap and doesn't reintroduce
  // the "many resetLayout calls during a fast drag" issue.
  useEffect(() => {
    if (window.gantt && containerRef.current && gantt.config.layout?.cols?.[0]) {
      gantt.config.grid_width = gridWidth
      gantt.config.layout.cols[0].width = gridWidth
      try { gantt.resetLayout() } catch (e) { }
      try { gantt.render() } catch (e) { }
      const raf = requestAnimationFrame(() => {
        try { gantt.resetLayout() } catch (e) { }
        try { gantt.render() } catch (e) { }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [gridWidth])

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.innerHTML = customStyles
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  // Formatting helpers
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


  const parseDateOnlyLocal = (dateOnlyStr) => {
    if (!dateOnlyStr) return null
    const [y, m, d] = dateOnlyStr.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  // TODO(backend): no update endpoint exists yet (only create — see
  // schedule_project / subTask_schedule) so edits/reschedules stay local
  // for now. Wire the real PUT/POST call here once it's available.
  const syncTaskWithAPI = async (task, isSubTaskOverride = null) => {
    try {
      const isSubTask =
        isSubTaskOverride !== null
          ? isSubTaskOverride
          : String(task.id).startsWith("subtask_");

      if (isSubTask) {
        const parentTask = gantt.getTask(task.parent);

        const payload = {
          sub_task_id: task.apiId,
          pm_id: pmId,
          project_id: projectId,
          task_id: parentTask.apiId,
          sub_task_name: task.text,
          planned_start: formatToAPIDateOnly(task.start_date),
          planned_end: formatToAPIDateOnly(getInclusiveEndDate(task.end_date)),
          duration: Number(task.duration),
          resource: task.assignees || "",
          predecessor: getPredecessorsText(task),
        };

        console.log("UPDATE SUBTASK:", payload);

        const response = await fetch(API_ENDPOINTS.UPDATE_SUBTASK_SCHEDULE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to update sub task.");
        }
      } else {
        const payload = {
          task_id: task.apiId,
          pm_id: pmId,
          project_id: projectId,
          task_name: task.text,
          planned_start: formatToAPIDateOnly(task.start_date),
          planned_end: formatToAPIDateOnly(getInclusiveEndDate(task.end_date)),
          duration: Number(task.duration),
          resource: task.assignees || "",
          predecessor: getPredecessorsText(task),
        };

        console.log("UPDATE TASK:", payload);

        const response = await fetch(API_ENDPOINTS.UPDATE_TASK_SCHEDULE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to update task.");
        }
      }

      reloadSchedule();
    } catch (err) {
      console.error("Schedule Update Error:", err);
      setAlertMessage(err.message || "Failed to update schedule.");
    }
  };
  // Main gantt setup
  useEffect(() => {
    if (!containerRef.current) return
    if (scheduleTasks === null) return

    try {
      gantt.plugins({ critical_path: true, tooltip: true, auto_scheduling: true, inline_editors: true, marker: true, drag_timeline: true })
    } catch {
      try {
        gantt.plugins({ critical_path: true, tooltip: true, inline_editors: true, marker: true, drag_timeline: true })
      } catch (e) {
        console.warn('Gantt plugins error', e)
      }
    }

    gantt.config.drag_timeline = {
      ignore: ".gantt_task_line, .gantt_task_link",
      useKey: false
    }

    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.row_height = isMobile ? 38 : 42
    gantt.config.task_height = isMobile ? 20 : 22
    gantt.config.link_line_width = 1.5
    gantt.config.show_chart = showGantt
    gantt.config.highlight_critical_path = criticalPath
    gantt.config.start_on_monday = false
    gantt.config.inline_editors_date_format = '%Y-%m-%d'
    gantt.config.details_on_dblclick = false

    gantt.config.grid_width = gridWidth
    gantt.config.grid_resize = false
    gantt.config.keep_grid_width = true

    if (gantt.addMarker) {
      const today = new Date()
      try {
        gantt.addMarker({
          id: "today_marker",
          start_date: today,
          css: "today",
          text: "Today",
          title: `Today: ${today.toLocaleDateString()}`
        })
      } catch (e) { /* ignore */ }
    }

    gantt.config.auto_scheduling = false

    // Inline editors
    const textEditor = { type: 'text', map_to: 'text' }
    const dateEditor = { type: 'date', map_to: 'start_date' }
    const endEditor = { type: 'date', map_to: 'end_date' }
    const durationEditor = { type: 'number', map_to: 'duration', min: 0, max: 1000 }
    const resourceEditor = { type: 'text', map_to: 'assignees' }

    gantt.config.editor_types.custom_predecessor = {
      show: function (id, column, config, placeholder) {
        const task = gantt.getTask(id)
        const links = gantt.getLinks() || []
        const existingLink = links.find(l => String(l.target) === String(id))

        let currentWbs = ''
        let currentType = LINK_FS
        let currentLag = 0

        if (existingLink && gantt.isTaskExists(existingLink.source)) {
          const srcTask = gantt.getTask(existingLink.source)
          currentWbs = gantt.getWBSCode(srcTask) || ''
          currentType = parseInt(existingLink.type, 10)
          currentLag = existingLink.lag ? parseInt(existingLink.lag, 10) : 0
        }

        const TYPE_COLORS = {
          [LINK_FS]: { bg: '#dbeafe', color: '#1d4ed8', activeBg: '#2563eb' },
          [LINK_SS]: { bg: '#dcfce7', color: '#15803d', activeBg: '#16a34a' },
          [LINK_FF]: { bg: '#fef3c7', color: '#b45309', activeBg: '#d97706' },
          [LINK_SF]: { bg: '#f3e8ff', color: '#7c3aed', activeBg: '#8b5cf6' },
        }
        const getTypeColor = (v) => TYPE_COLORS[v] || TYPE_COLORS[LINK_FS]
        const typeLabels = { [LINK_FS]: 'FS', [LINK_SS]: 'SS', [LINK_FF]: 'FF', [LINK_SF]: 'SF' }

        const container = document.createElement('div')
        container.style.cssText = 'display:flex;align-items:stretch;gap:3px;width:100%;height:100%;padding:2px 4px;box-sizing:border-box;'

        const nodeInput = document.createElement('input')
        nodeInput.className = 'pred-editor-wbs-input'
        nodeInput.type = 'text'
        nodeInput.value = currentWbs
        nodeInput.placeholder = 'Node'
        nodeInput.title = 'Predecessor task number (WBS)'
        nodeInput.style.cssText = 'width:34px;flex:0 0 34px;height:28px;border:1.5px solid #e2e8f0;border-radius:6px;padding:0 4px;font-size:11px;text-align:center;outline:none;background:#fff;color:#0f172a;font-weight:700;font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;align-self:center;'

        const typeWrapper = document.createElement('div')
        typeWrapper.style.cssText = 'position:relative;flex:1 1 0;min-width:44px;align-self:center;'

        const typeBtn = document.createElement('button')
        typeBtn.type = 'button'
        typeBtn.dataset.value = String(currentType)

        const renderBtnContent = (typeVal) => {
          const tc = getTypeColor(typeVal)
          const lbl = typeLabels[typeVal] || 'FS'
          typeBtn.style.cssText = `width:100%;height:28px;border:1.5px solid ${tc.bg};border-radius:6px;background:${tc.bg};color:${tc.color};font-weight:700;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 6px;transition:all 0.15s;font-family:inherit;letter-spacing:0.3px;`
          typeBtn.innerHTML = `<span>${lbl}</span><svg width="8" height="8" viewBox="0 0 12 12" fill="none" style="opacity:0.6;flex-shrink:0;"><path d="M3 5L6 8L9 5" stroke="${tc.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        }
        renderBtnContent(currentType)

        const dropdown = document.createElement('div')
        dropdown.className = 'pred-type-dropdown-panel'
        dropdown.style.cssText = 'display:none;position:fixed;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.08);z-index:99999;padding:5px;width:235px;box-sizing:border-box;'

        const header = document.createElement('div')
        header.style.cssText = 'padding:6px 10px 5px;font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid #f1f5f9;margin-bottom:3px;'
        header.textContent = 'When Start'
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
              nodeInput.focus()
            })
            dropdown.appendChild(opt)
          })
        }
        renderOptions()

        const positionDropdown = () => {
          const btnRect = typeBtn.getBoundingClientRect()
          const dropW = 235
          let left = btnRect.right - dropW
          if (left < 8) left = 8
          const viewportWidth = document.documentElement.clientWidth
          if (left + dropW > viewportWidth - 12) {
            left = viewportWidth - dropW - 12
          }
          dropdown.style.top = (btnRect.bottom + 4) + 'px'
          dropdown.style.left = left + 'px'
        }

        const showDropdown = () => { dropdown.style.display = 'block'; positionDropdown() }
        const hideDropdown = () => { dropdown.style.display = 'none' }

        typeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          if (dropdown.style.display !== 'none') hideDropdown()
          else showDropdown()
        })

        nodeInput.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            if (dropdown.style.display !== 'none') hideDropdown()
            else showDropdown()
          }
        })

        const closeHandler = (e) => {
          if (!typeWrapper.contains(e.target) && !dropdown.contains(e.target)) hideDropdown()
        }
        document.addEventListener('mousedown', closeHandler, true)

        const scrollHandler = () => { if (dropdown.style.display !== 'none') positionDropdown() }
        window.addEventListener('scroll', scrollHandler, true)

        typeWrapper.appendChild(typeBtn)
        document.body.appendChild(dropdown)

        const divider = document.createElement('div')
        divider.className = 'pred-editor-divider'

        const lagWrapper = document.createElement('div')
        lagWrapper.style.cssText = 'flex:1 1 0;min-width:34px;align-self:center;'
        const lagInput = document.createElement('input')
        lagInput.type = 'text'
        lagInput.inputMode = 'numeric'
        lagInput.value = currentLag ? String(currentLag) : ''
        lagInput.placeholder = '±d'
        lagInput.title = 'Lag in days, e.g. -2 or 3'
        lagInput.style.cssText = 'width:100%;height:28px;border:1.5px solid #e2e8f0;border-radius:6px;padding:0 4px;font-size:11px;text-align:center;outline:none;background:#fff;color:#0f172a;font-weight:700;font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;box-sizing:border-box;'
        lagInput.addEventListener('input', () => {
          lagInput.value = lagInput.value.replace(/[^\d+-]/g, '').replace(/(?!^)[+-]/g, '')
        })
        lagWrapper.appendChild(lagInput)

        let dragging = false
        let startX = 0
        let startTypeWidth = 0
        let startLagWidth = 0

        const onPointerMove = (e) => {
          if (!dragging) return
          const dx = e.clientX - startX
          const totalWidth = startTypeWidth + startLagWidth
          let newTypeWidth = startTypeWidth + dx
          const minWidth = 30
          newTypeWidth = Math.max(minWidth, Math.min(totalWidth - minWidth, newTypeWidth))
          const newLagWidth = totalWidth - newTypeWidth
          typeWrapper.style.flex = `0 0 ${newTypeWidth}px`
          lagWrapper.style.flex = `0 0 ${newLagWidth}px`
        }
        const onPointerUp = () => {
          dragging = false
          divider.classList.remove('dragging')
          document.removeEventListener('mousemove', onPointerMove)
          document.removeEventListener('mouseup', onPointerUp)
        }
        divider.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          dragging = true
          divider.classList.add('dragging')
          startX = e.clientX
          startTypeWidth = typeWrapper.getBoundingClientRect().width
          startLagWidth = lagWrapper.getBoundingClientRect().width
          document.addEventListener('mousemove', onPointerMove)
          document.addEventListener('mouseup', onPointerUp)
        })

        container.appendChild(nodeInput)
        container.appendChild(typeWrapper)
        container.appendChild(divider)
        container.appendChild(lagWrapper)

        placeholder.innerHTML = ''
        placeholder.appendChild(container)

        this._container = container
        this._dropdown = dropdown
        this._nodeInput = nodeInput
        this._typeBtn = typeBtn
        this._lagInput = lagInput
        this._closeHandler = closeHandler
        this._scrollHandler = scrollHandler

        requestAnimationFrame(() => { nodeInput.focus(); nodeInput.select() })
      },

      hide: function () {
        if (this._closeHandler) document.removeEventListener('mousedown', this._closeHandler, true)
        if (this._scrollHandler) window.removeEventListener('scroll', this._scrollHandler, true)
        if (this._dropdown && this._dropdown.parentNode) this._dropdown.parentNode.removeChild(this._dropdown)
        this._container = null
        this._dropdown = null
        this._nodeInput = null
        this._typeBtn = null
        this._lagInput = null
      },

      set_value: function () { /* handled in show() */ },

      get_value: function () {
        const wbs = this._nodeInput ? this._nodeInput.value.trim() : ''
        const linkType = this._typeBtn ? parseInt(this._typeBtn.dataset.value, 10) : LINK_FS
        const lagRaw = this._lagInput ? this._lagInput.value.trim() : ''
        const lag = lagRaw ? parseInt(lagRaw, 10) || 0 : 0
        return { wbs, linkType, lag }
      },

      is_changed: function () { return true },
      is_valid: function () { return true },

      save: function (id) {
        const val = this.get_value()

        const links = gantt.getLinks() || []
        links.filter(l => String(l.target) === String(id)).forEach(l => gantt.deleteLink(l.id))

        if (!val.wbs) return

        let sourceTask = null
        gantt.eachTask(t => {
          if (gantt.getWBSCode(t) === val.wbs) sourceTask = t
        })
        if (!sourceTask) {
          setAlertMessage(`No task found with node "${val.wbs}"`)
          return
        }
        if (String(sourceTask.id) === String(id)) {
          setAlertMessage('A task cannot be its own predecessor.')
          return
        }
        if (hasCircularDependency(sourceTask.id, id)) {
          setAlertMessage(`Node "${val.wbs}" would create a circular dependency.`)
          return
        }

        gantt.addLink({
          id: `link_${Date.now()}`,
          source: sourceTask.id,
          target: id,
          type: String(val.linkType),
          lag: val.lag || 0,
        })
      },

      focus: function () { if (this._nodeInput) this._nodeInput.focus() },
    }

    const predecessorEditor = { type: 'custom_predecessor', map_to: 'auto' }

    const allColumns = [
      {
        name: 'wbs_code', label: '#', width: COLUMN_WIDTHS.wbs_code, min_width: COLUMN_WIDTHS.wbs_code, align: 'center', resize: true,
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
        name: 'text', label: 'Task Name', tree: true, width: COLUMN_WIDTHS.text, min_width: COLUMN_WIDTHS.text, resize: true,
        editor: textEditor,
        header: [{ text: 'Task Name', align: 'center' }],
        template: (task) => {
          const isProj = task.type === 'project'
          return `<span style="font-weight:${isProj ? 'bold' : 'normal'};color:${isProj ? '#1e293b' : '#475569'};">${task.text}</span>`
        },
      },
      {
        name: 'start_date', label: 'Start', width: COLUMN_WIDTHS.start_date, min_width: COLUMN_WIDTHS.start_date, align: 'center', resize: true,
        editor: dateEditor,
        header: [{ text: isMobile ? 'Start' : 'Planned Start', align: 'center' }],
        template: (task) => formatDateShort(task.start_date),
      },
      {
        name: 'end_date', label: 'End', width: COLUMN_WIDTHS.end_date, min_width: COLUMN_WIDTHS.end_date, align: 'center', resize: true,
        editor: endEditor,
        header: [{ text: isMobile ? 'End' : 'Planned End', align: 'center' }],
        template: (task) => formatDateShort(getInclusiveEndDate(task.end_date)),
      },
      {
        name: 'duration', label: 'Dur', width: COLUMN_WIDTHS.duration, min_width: COLUMN_WIDTHS.duration, align: 'center', resize: true,
        editor: durationEditor,
        header: [{ text: isMobile ? 'Dur' : 'Duration', align: 'center' }],
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
        name: 'assignees', label: 'Resource', width: COLUMN_WIDTHS.assignees, min_width: COLUMN_WIDTHS.assignees, align: 'center', resize: true,
        editor: resourceEditor,
        header: [{ text: 'Resource', align: 'center' }],
        template: (task) => {
          const assignee = getAssigneeLabel(task)
          return assignee
            ? `<span style="color:#1e293b;font-weight:500;">${assignee}</span>`
            : '<span style="color:#94a3b8;">—</span>'
        },
        onrender: (task, node) => {
          if (isSubTask(task, projectId)) {
            node.style.background = 'rgba(219,234,254,0.25)'
          }
        },
      },
      {
        name: 'predecessors', label: 'Pred', width: COLUMN_WIDTHS.predecessors, min_width: COLUMN_WIDTHS.predecessors, align: 'center', resize: true,
        editor: predecessorEditor,
        header: [{ text: 'Predecessor', align: 'center' }],
        template: (task) => {
          try {
            const links = gantt.getLinks() || []
            const taskLinks = links.filter(l => String(l.target) === String(task.id))
            if (!taskLinks.length) return '<span style="color:#cbd5e1;">—</span>'
            return taskLinks.map(link => {
              if (!gantt.isTaskExists(link.source)) return ''
              const src = gantt.getTask(link.source)
              const wbs = gantt.getWBSCode(src) || ''
              return `<span style="font-weight:600;color:#334155;font-size:11px;">${wbs}</span>`
            }).filter(Boolean).join(', ') || '<span style="color:#cbd5e1;">—</span>'
          } catch { return '<span style="color:#cbd5e1;">—</span>' }
        },
      },
      {
        name: 'dependency_type', label: 'Dep', width: COLUMN_WIDTHS.dependency_type, min_width: COLUMN_WIDTHS.dependency_type, align: 'center', resize: true,
        header: [{ text: 'Dependency', align: 'center' }],
        template: (task) => {
          try {
            const links = gantt.getLinks() || []
            const taskLinks = links.filter(l => String(l.target) === String(task.id))
            if (!taskLinks.length) return '<span style="color:#cbd5e1;">—</span>'
            const badgeClass = { 0: 'pred-badge-fs', 1: 'pred-badge-ss', 2: 'pred-badge-ff', 3: 'pred-badge-sf' }
            return taskLinks.map(link => {
              const label = getLinkTypeLabel(link.type)
              const cls = badgeClass[parseInt(link.type, 10)] || 'pred-badge-fs'
              const lag = link.lag
                ? `<span style="color:#64748b;font-size:9px;margin-left:1px;font-weight:500;">${link.lag > 0 ? '+' : ''}${link.lag}d</span>`
                : ''
              return `<span class="pred-badge ${cls}" data-link-id="${link.id}" style="cursor:pointer;" title="Click to change link type">${label}</span>${lag}`
            }).filter(Boolean).join(' ') || '<span style="color:#cbd5e1;">—</span>'
          } catch { return '<span style="color:#cbd5e1;">—</span>' }
        },
      },
    ]

    gantt.config.columns = allColumns

    gantt.config.scale_height = isMobile ? 40 : 50

    const zoomConfig = {
      levels: [
        {
          name: 'day', scale_height: isMobile ? 40 : 50, min_column_width: isMobile ? 24 : 30,
          scales: [
            { unit: 'week', step: 1, format: (d) => d.getDate() <= 7 ? gantt.date.date_to_str('%M %Y')(d) : gantt.date.date_to_str('%D %d %M %Y')(d) },
            { unit: 'day', step: 1, format: (d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] },
          ],
        },
        {
          name: 'week', scale_height: isMobile ? 40 : 50, min_column_width: isMobile ? 54 : 70,
          scales: [
            { unit: 'month', step: 1, format: '%F, %Y' },
            { unit: 'week', step: 1, format: 'Week #%W' },
          ],
        },
        {
          name: 'month', scale_height: isMobile ? 40 : 50, min_column_width: isMobile ? 90 : 120,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            { unit: 'month', step: 1, format: '%F' },
          ],
        },
        {
          name: 'year', scale_height: isMobile ? 40 : 50, min_column_width: isMobile ? 110 : 150,
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

    gantt.templates.rightside_text = (s, e, task) => {
      if (isMobile) return ''
      const assignee = getAssigneeLabel(task)
      return assignee
        ? `<span class="gantt-assignees-label">${assignee}</span>`
        : ''
    }

    gantt.templates.timeline_cell_class = (item, date) =>
      (date.getDay() === 0 || date.getDay() === 6) ? 'weekend-cell' : ''

    // Tooltip — also surfaces Resource/Predecessor info that's hidden
    // from the grid columns on mobile, so nothing is actually lost, just
    // moved off the always-visible grid.
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

      const taskAssignee = getAssigneeLabel(task)
      const resourceLine = taskAssignee
        ? `<br/><b>Resource:</b> ${taskAssignee}`
        : ''

      return `<b>${task.text}</b>
              <br/><b>Start:</b> ${formatDateShort(task.start_date)}
              <br/><b>End:</b> ${formatDateShort(getInclusiveEndDate(task.end_date))}
              <br/><b>Duration:</b> ${task.duration || 0} days
              ${resourceLine}
              ${predStr ? `<br/><b>Predecessors:</b> ${predStr}` : ''}`
    }

    // Explicit two-pane layout: grid and timeline each get their own
    // horizontal scrollbar, sharing one vertical scrollbar so rows stay
    // aligned. This is what lets long task names / many columns scroll
    // horizontally *inside* the grid pane instead of being clipped.
    gantt.config.layout = {
      css: 'gantt_container',
      cols: [
        {
          // Kept at the small, screen-responsive value (not floored to
          // GRID_COLUMNS_MIN_WIDTH) so the timeline stays visible on phone
          // widths too — each column's own min_width (below) still stops
          // them from being squeezed unreadable; the grid just gets its own
          // horizontal scrollbar to reach whichever ones don't fit yet.
          width: gridWidth,
          rows: [
            { view: 'grid', scrollX: 'gridHorScroll', scrollY: 'gridVerScroll' },
            { view: 'scrollbar', id: 'gridHorScroll', height: 15 },
          ],
        },
        {
          rows: [
            { view: 'timeline', scrollX: 'timelineHorScroll', scrollY: 'gridVerScroll' },
            { view: 'scrollbar', id: 'timelineHorScroll', height: 15 },
          ],
        },
        { view: 'scrollbar', id: 'gridVerScroll', width: 15 },
      ],
    }

    try {
      gantt.init(containerRef.current)
      gantt.clearAll()
      gantt.parse(scheduleTasks)
      // dhtmlx's own root element clips its panes down to whatever box its
      // parent gives it instead of growing to fit content — forcing its
      // true minimum here makes it genuinely overflow containerRef (which
      // has its own overflow-x: auto), so the timeline always keeps at
      // least a usable sliver of visible width, even on a phone, and the
      // grid never has less room than GRID_WIDTH.
      if (gantt.$container) {
        gantt.$container.style.minWidth = `${gridWidth + CHART_MIN_WIDTH}px`
      }
      setGanttError(null)
    } catch (e) {
      console.error('Gantt Init Error:', e)
      setGanttError(e.message || String(e))
    }

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

    events.push(gantt.attachEvent('onBeforeLinkAdd', (id, link) => {
      if (String(link.source) === String(link.target)) {
        setAlertMessage('A task cannot link to itself.')
        return false
      }
      if (hasCircularDependency(link.source, link.target)) {
        setAlertMessage('Cannot create this link: it would create a circular dependency.')
        return false
      }
      return true
    }))

    events.push(gantt.attachEvent('onBeforeTaskChanged', (id, mode, originalTask) => {
      try {
        const task = gantt.getTask(id)

        if (mode === 'update' && (task.progress || 0) >= 1 && (originalTask.progress || 0) < 1) {
          const ffLinks = gantt.getLinks().filter(
            l => String(l.target) === String(id) && parseInt(l.type, 10) === LINK_FF
          )
          for (const link of ffLinks) {
            if (gantt.isTaskExists(link.source)) {
              const pred = gantt.getTask(link.source)
              if ((pred.progress || 0) < 1) {
                setAlertMessage(`Cannot mark "${task.text}" complete: its Finish-to-Finish predecessor "${pred.text}" is not finished yet.`)
                task.progress = originalTask.progress || 0
                break
              }
            }
          }
        }
      } catch { /* ignore */ }
      return true
    }))

    events.push(gantt.attachEvent('onBeforeEditorOpen', (taskId, columnName) => {
      try {
        const task = gantt.getTask(taskId)
        const hasChildren = (gantt.getChildren(taskId) || []).length > 0
        if ((task.type === 'project' || hasChildren) && (columnName === 'duration' || columnName === 'start_date' || columnName === 'end_date')) {
          return false
        }
      } catch { /* allow */ }
      return true
    }))

    events.push(gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
      if (schedulingRef.current) return
      schedulingRef.current = true

      try {
        gantt.refreshData()
        propagateScheduling(id)
        rollUpParentDates(id)
      } finally {
        schedulingRef.current = false
      }

      syncTaskWithAPI(task)
    }))

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

    events.push(gantt.attachEvent('onAfterTaskDelete', (id, task) => {
      if (schedulingRef.current) return
      if (task.parent && gantt.isTaskExists(task.parent)) {
        schedulingRef.current = true
        try {
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

    events.push(gantt.attachEvent('onAfterLinkAdd', (id, link) => {
      if (schedulingRef.current) return
      schedulingRef.current = true
      try {
        if (gantt.isTaskExists(link.target)) {
          const targetTask = gantt.getTask(link.target)
          const newDates = computeConstrainedDates(link.target)
          if (newDates) {
            targetTask.start_date = newDates.start_date
            targetTask.end_date = newDates.end_date
            targetTask.duration = gantt.calculateDuration({
              start_date: newDates.start_date,
              end_date: newDates.end_date,
            })
            gantt.updateTask(link.target)
            propagateScheduling(link.target)
            rollUpParentDates(link.target)
          }
        }
        gantt.refreshData()
      } finally {
        schedulingRef.current = false
      }
    }))

    events.push(gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
      if (schedulingRef.current) return
      schedulingRef.current = true
      try {
        if (gantt.isTaskExists(link.target)) {
          const targetTask = gantt.getTask(link.target)
          const newDates = computeConstrainedDates(link.target)
          if (newDates) {
            targetTask.start_date = newDates.start_date
            targetTask.end_date = newDates.end_date
            targetTask.duration = gantt.calculateDuration({
              start_date: newDates.start_date,
              end_date: newDates.end_date,
            })
            gantt.updateTask(link.target)
            propagateScheduling(link.target)
            rollUpParentDates(link.target)
          }
        }
        gantt.refreshData()
      } finally {
        schedulingRef.current = false
      }
    }))

    events.push(gantt.attachEvent('onTaskClick', (id, e) => {
      const target = e.target || e.srcElement
      if (target && target.classList && target.classList.contains('pred-badge')) {
        const linkId = target.getAttribute('data-link-id')
        if (linkId) {
          try {
            const link = gantt.getLink(linkId)
            if (link) {
              setLinkMenu({
                x: e.clientX,
                y: e.clientY,
                linkId: linkId,
                currentType: parseInt(link.type, 10),
                sourceId: link.source,
                targetId: link.target,
              })
            }
          } catch { /* ignore */ }
          return false
        }
      }
      return true
    }))

    events.push(gantt.attachEvent('onLinkClick', (id, e) => {
      try {
        const link = gantt.getLink(id)
        if (!link) return false
        setLinkMenu({
          x: e.clientX,
          y: e.clientY,
          linkId: id,
          currentType: parseInt(link.type, 10),
          sourceId: link.source,
          targetId: link.target,
        })
      } catch { /* ignore */ }
      return false
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
  }, [tasks, zoomLevel, criticalPath, showGantt, scheduleTasks, isMobile])

  // Add task handler
  const handleOpenAddTaskModal = (type, isSubTaskFlag = false) => {
    setAddOpen(false)
    const activeId = gantt.getSelectedId()
    let parentId

    if (activeId) {
      if (isSubTaskFlag) { parentId = activeId; gantt.open(activeId) }
      else parentId = gantt.getParent(activeId) || undefined
    } else if (isSubTaskFlag) {
      setAlertMessage('Please select a task first to add a sub-task.')
      return
    }

    // subTask_schedule needs a real, backend-saved task_id to attach to —
    // a sub-task can't itself be a parent (the API only nests one level).
    if (isSubTaskFlag && type === 'task' && getApiTaskId(parentId) === null) {
      setAlertMessage('Sub-tasks can only be added to a top-level task, not to another sub-task or a local Work Stream/Milestone.')
      return
    }

    setTaskModalData({
      type,
      isSubTaskFlag,
      parentId,
      text: '',
      start_date: formatToAPIDateOnly(new Date()),
      duration: type === 'milestone' ? 0 : 5,
      assignees: '',
      predecessor: '',
    })
    setTaskModalOpen(true)
  }

  const handleSubmitTaskModal = async (e) => {
    e.preventDefault()

    const { type, isSubTaskFlag, parentId, text, start_date, duration, assignees, predecessor } = taskModalData

    // Only "Add Task" and "Add Sub-task" have a matching backend endpoint
    // (schedule_project / subTask_schedule). Work Streams and Milestones
    // stay local-only, same as before — nothing to save them to yet.
    if (type !== 'task') {
      const newTask = {
        id: `local_${Date.now()}`,
        text: text || (type === 'project' ? 'New Category' : 'Milestone'),
        start_date: parseDateOnlyLocal(start_date) || new Date(),
        duration: type === 'milestone' ? 0 : Number(duration),
        progress: 0,
        parent: parentId,
        type,
        barClass: type === 'project' ? 'gantt-bar-dark-blue' : 'gantt-bar-green',
        borderClass: type === 'project' ? 'border-left-none' : 'border-left-blue',
        assignees: null,
      }
      gantt.addTask(newTask)
      gantt.selectTask(newTask.id)
      setTaskModalOpen(false)
      setTaskModalData(null)
      setAlertMessage(`"${newTask.text}" was added, but Work Streams/Milestones aren't saved to the server yet — it will disappear on reload.`)
      return
    }

    setIsSavingTask(true)
    try {
      const startDateObj = parseDateOnlyLocal(start_date) || new Date()
      const durationNum = Math.max(1, Number(duration) || 1)
      const endDateObj = gantt.calculateEndDate({ start_date: startDateObj, duration: durationNum })

      const payload = {
        pm_id: pmId,
        project_id: projectId,
        planned_start: formatToAPI(startDateObj, false),
        planned_end: formatToAPI(endDateObj, true),
        duration: durationNum,
        resource: assignees || '',
        predecessor: predecessor || '',
      }

      let response
      if (isSubTaskFlag) {
        const taskId = getApiTaskId(parentId)
        if (!taskId) {
          setAlertMessage('Could not find the parent task to attach this sub-task to.')
          setIsSavingTask(false)
          return
        }
        response = await fetch(API_ENDPOINTS.CREATE_SUBTASK_SCHEDULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, task_id: taskId, sub_task_name: text }),
        })
      } else {
        response = await fetch(API_ENDPOINTS.SCHEDULE_PROJECT_TASK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, task_name: text }),
        })
      }

      const result = await response.json()
      if (!result.success) throw new Error(result.message || 'Failed to save task')

      setTaskModalOpen(false)
      setTaskModalData(null)
      reloadSchedule()
    } catch (err) {
      console.error('Error creating task:', err)
      setAlertMessage(err.message || 'Could not save the task. Please try again.')
    } finally {
      setIsSavingTask(false)
    }
  }

  const handleDeleteClick = () => {
    const selectedId = gantt.getSelectedId() || selectedTaskId;

    if (!selectedId) {
      setAlertMessage("Please select a task or sub-task to delete.");
      return;
    }

    if (selectedId === `project_${projectId}`) {
      setAlertMessage("The project root task cannot be deleted.");
      return;
    }

    try {
      const task = gantt.getTask(selectedId);

      if (!task) {
        setAlertMessage("Task not found.");
        return;
      }

      setTaskToDelete(task);
      setDeleteText("");
      setDeleteConfirmOpen(true);
    } catch (err) {
      console.error(err);
      setAlertMessage("Error finding the selected task.");
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;

    if (deleteText.trim().toLowerCase() !== "delete") return;

    try {
      const isSubTask = String(taskToDelete.id).startsWith("subtask_");

      let payload;

      if (isSubTask) {
        const parentTask = gantt.getTask(taskToDelete.parent);

        payload = {
          task_id: parentTask.apiId,
          sub_task_id: taskToDelete.apiId,
        };
      } else {
        payload = {
          task_id: taskToDelete.apiId,
        };
      }

      console.log("Delete Payload:", payload);
      console.log("Task To Delete:", taskToDelete);

      const response = await fetch(API_ENDPOINTS.DELETE_TASK_SUBTASK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAlertMessage(result.message || "Failed to delete.");
        return;
      }

      gantt.deleteTask(taskToDelete.id);

      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      setSelectedTaskId(null);
      setDeleteText("");
    } catch (err) {
      console.error("Delete Error:", err);
      setAlertMessage("Something went wrong while deleting.");
    }
  };

  const handleScrollToday = () => gantt.showDate(new Date())
  const handleScrollLeft = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x - 250, null) }
  const handleScrollRight = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x + 250, null) }
  const handleExport = (fmt) => { setMoreOpen(false); setAlertMessage(`Exporting Gantt Chart to ${fmt.toUpperCase()}...`) }
  const handleClearAll = () => { setMoreOpen(false); if (confirm('Clear all tasks?')) gantt.clearAll() }

  // Indent / Outdent handlers
  const handleIndent = () => {
    const selectedId = gantt.getSelectedId()
    if (!selectedId) { setAlertMessage('Select a task first.'); return }
    const prevSibling = gantt.getPrevSibling(selectedId)
    if (!prevSibling) { setAlertMessage('Cannot indent: no sibling above.'); return }
    gantt.moveTask(selectedId, gantt.getChildren(prevSibling).length, prevSibling)
    gantt.open(prevSibling)
    schedulingRef.current = true
    try {
      rollUpParentDates(selectedId)
      gantt.refreshData()
    } finally { schedulingRef.current = false }
  }

  const handleOutdent = () => {
    const selectedId = gantt.getSelectedId()
    if (!selectedId) { setAlertMessage('Select a task first.'); return }
    const parentId = gantt.getParent(selectedId)
    if (!parentId || !gantt.isTaskExists(parentId)) { setAlertMessage('Cannot outdent: no parent.'); return }
    const grandParentId = gantt.getParent(parentId)
    const parentIndex = gantt.getTaskIndex(parentId)
    gantt.moveTask(selectedId, parentIndex + 1, grandParentId || 0)
    schedulingRef.current = true
    try {
      rollUpParentDates(selectedId)
      const siblings = gantt.getChildren(parentId)
      if (siblings && siblings.length > 0) rollUpParentDates(siblings[0])
      gantt.refreshData()
    } finally { schedulingRef.current = false }
  }

  const stopProp = (e) => e.stopPropagation()

  const totalTasks = tasks?.data?.length || 0
  const totalMilestones = tasks?.data?.filter(t => t.duration === 0).length || 0

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex', flexDirection: 'column',
        width: '100%', maxWidth: '100%', boxSizing: 'border-box',
        // Height now scales with viewport instead of a hard 700px, so it
        // never grows taller than the visible area on short/mobile
        // screens (which was contributing to the "cut off" feeling since
        // the toolbar rows would get pushed out of view).
        height: 'clamp(420px, 82vh, 760px)',
        background: '#ffffff',
        borderRadius: isMobile ? 12 : 20, border: '1px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden', marginTop: 24,
        userSelect: 'none', position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        resize: 'vertical', minHeight: 360, maxHeight: '92vh',
      }}>

      {/* ROW 1 — Title + Zoom */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: isMobile ? 8 : 12, padding: isMobile ? '10px 12px' : '14px 24px',
        background: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, minWidth: 0 }}>
          <div style={{
            width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: 10,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', flexShrink: 0,
          }}>
            <svg width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <polyline points="9 16 11 18 15 14" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{
              fontSize: isMobile ? 14 : 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px',
              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {projectName ? `${projectName} Timeline` : 'Project Management Workplan'}
            </span>
            {projectName && !isMobile && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Schedule overview for {projectName}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, flexWrap: 'wrap' }}>
          {!isMobile && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Calendar:</span>
                <select
                  value={calendarType}
                  onChange={(e) => setCalendarType(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                    fontSize: 12, fontWeight: 500, color: '#1e293b', outline: 'none',
                    background: '#f8fafc', cursor: 'pointer'
                  }}
                >
                  <option value="alldays">All Days (24/7)</option>
                  <option value="standard">Standard (Mon-Fri + Holidays)</option>
                  <option value="custom">Custom...</option>
                </select>
              </div>

              {calendarType === 'custom' && (
                <div style={{ position: 'relative' }} onMouseDown={stopProp}>
                  <button
                    onClick={() => { setCustomDropdownOpen(!customDropdownOpen); setMoreOpen(false); setAddOpen(false); setBaselineOpen(false) }}
                    style={{ ...btnBase, padding: '4px 10px', height: 28, fontSize: 12, background: '#f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                  >
                    Select Days <ChevronDown size={12} color="#94a3b8" />
                  </button>
                  {customDropdownOpen && (
                    <div style={{ ...dropdownMenu, padding: '8px', minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', paddingBottom: 4, borderBottom: '1px solid #f1f5f9' }}>
                        WORKING DAYS
                      </div>
                      {[
                        { label: 'Monday', val: 1 }, { label: 'Tuesday', val: 2 }, { label: 'Wednesday', val: 3 },
                        { label: 'Thursday', val: 4 }, { label: 'Friday', val: 5 }, { label: 'Saturday', val: 6 }, { label: 'Sunday', val: 0 }
                      ].map(day => {
                        const isChecked = customWorkingDays.includes(day.val)
                        return (
                          <label key={day.val} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                            <input type="checkbox" checked={isChecked} onChange={(e) => {
                              if (e.target.checked) setCustomWorkingDays([...customWorkingDays, day.val])
                              else setCustomWorkingDays(customWorkingDays.filter(d => d !== day.val))
                            }} style={{ width: 14, height: 14, accentColor: '#3b82f6' }} />
                            {day.label}
                          </label>
                        )
                      })}
                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                          <input type="checkbox" checked={includeHolidays} onChange={e => setIncludeHolidays(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#3b82f6' }} />
                          Include Holidays
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                  padding: isMobile ? '6px 10px' : '6px 18px', fontSize: 12, fontWeight: active ? 700 : 500,
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

      {/* ROW 2 — Actions + Nav + Toggles */}
      {/* On mobile this row scrolls horizontally as one strip instead of
          wrapping into 3-4 lines and pushing the gantt area down/out of
          view — that vertical squeeze was the other big contributor to
          the "everything gets cut off" complaint. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'space-between',
        flexWrap: isMobile ? 'nowrap' : 'wrap', gap: isMobile ? 8 : 12,
        padding: isMobile ? '8px 12px' : '10px 24px',
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

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
              {!isMobile && 'Add'}
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
            {addOpen && (
              <div style={dropdownMenu}>
                {[
                  ['Add Task', () => handleOpenAddTaskModal('task')],
                  ['Add Sub-task', () => handleOpenAddTaskModal('task', true)],
                  ['Add Work Stream', () => handleOpenAddTaskModal('project')],
                  ['Add Milestone', () => handleOpenAddTaskModal('milestone')],
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
            {!isMobile && 'Delete'}
          </button>

          {/* Indent / Outdent */}
          <button onClick={handleOutdent} title="Outdent (move task up in hierarchy)"
            style={btnBase}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 8 3 12 7 16" /><line x1="21" y1="12" x2="3" y2="12" /></svg>
          </button>
          <button onClick={handleIndent} title="Indent (make child of task above)"
            style={btnBase}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 8 21 12 17 16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>
          </button>

          {/* Baseline */}
          {!isMobile && (
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
          )}

          {/* More */}
          <div style={{ position: 'relative' }} onMouseDown={stopProp}>
            <button onClick={() => { setMoreOpen(o => !o); setAddOpen(false); setBaselineOpen(false) }}
              style={btnBase}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <MoreHorizontal size={14} color="#94a3b8" />
              {!isMobile && 'More'}
              <ChevronDown size={12} color="#94a3b8" />
            </button>
            {moreOpen && (
              <div style={dropdownMenu}>
                {isMobile && (
                  <>
                    <div style={{ padding: '6px 16px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Calendar</div>
                    <div style={{ padding: '2px 16px 8px' }}>
                      <select
                        value={calendarType}
                        onChange={(e) => setCalendarType(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 500, color: '#1e293b', outline: 'none', background: '#f8fafc' }}
                      >
                        <option value="alldays">All Days (24/7)</option>
                        <option value="standard">Standard (Mon-Fri + Holidays)</option>
                        <option value="custom">Custom...</option>
                      </select>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                  </>
                )}
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

          {/* Nav (moved into the scrollable strip on mobile so it's never dropped) */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #e2e8f0', borderRadius: 8,
            overflow: 'hidden', background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexShrink: 0,
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
              whiteSpace: 'nowrap',
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

          {!isMobile && (
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
          )}

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 16, borderLeft: '1px solid #e2e8f0', height: 34 }}>
              <button onClick={() => setAlertMessage('Opening settings...')} title="Settings" style={iconBtnBase}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b' }}
              ><Settings size={15} /></button>
              <button onClick={() => window.print()} title="Print" style={iconBtnBase}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b' }}
              ><Printer size={15} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Gantt area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0 }}>
        {ganttError ? (
          <div style={{ padding: 20, color: 'red', fontWeight: 'bold' }}>
            Failed to initialize Gantt: {ganttError}
          </div>
        ) : (
          <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden' }} />
        )}


        <div
          onMouseDown={() => { isResizing.current = true; document.body.style.cursor = 'col-resize' }}
          onTouchStart={() => { isResizing.current = true }}
          style={{
            position: 'absolute',
            left: `calc(max(0px, min(${dragPreviewWidth ?? gridWidth}px - 4px, 100% - 8px)))`,
            top: 0,
            bottom: 0,
            width: isMobile ? 16 : 8,
            cursor: 'col-resize',
            zIndex: 10,
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37,99,235,0.1)' }}
          onMouseLeave={(e) => { if (!isResizing.current) e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <div style={{
            width: 14, height: 26, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)', color: '#64748b', fontSize: 12, fontWeight: 'bold', pointerEvents: 'none'
          }}>⋮</div>
        </div>
      </div>

      {/* Footer — legend items scroll horizontally as a strip on mobile
          instead of wrapping into several lines and eating into the
          gantt area's vertical space. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'space-between',
        padding: isMobile ? '8px 12px' : '12px 24px', background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        fontSize: 11, color: '#64748b', fontWeight: 600, flexShrink: 0,
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#3b82f6' }} />
            <span>Task</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, transform: 'rotate(45deg)', background: '#10b981' }} />
            <span>Milestone</span>
          </div>
          {!isMobile && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#94a3b8', letterSpacing: '1px', fontSize: 13, fontWeight: 'bold' }}>- - -</span>
                <span>Baseline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 16, height: 2, background: '#ef4444' }} />
                <span>Critical Path</span>
              </div>
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
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          {totalTasks > 0
            ? isMobile
              ? `${totalTasks} tasks`
              : `Showing 1 – ${totalTasks} of ${totalTasks} tasks (${totalMilestones} milestones)`
            : 'No schedule data available for this project.'}
        </div>
      </div>

      {taskModalOpen && taskModalData && (
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
          padding: 16,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: 400,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                Add {taskModalData.type === 'project' ? 'Work Stream' : taskModalData.type === 'task' && taskModalData.isSubTaskFlag ? 'Sub-task' : taskModalData.type}
              </h3>
            </div>

            <form onSubmit={handleSubmitTaskModal} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Name</label>
                <input
                  type="text"
                  required
                  value={taskModalData.text}
                  onChange={e => setTaskModalData({ ...taskModalData, text: e.target.value })}
                  style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Start Date</label>
                <input
                  type="date"
                  required
                  value={taskModalData.start_date}
                  onChange={e => setTaskModalData({ ...taskModalData, start_date: e.target.value })}
                  style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
                />
              </div>

              {taskModalData.type !== 'milestone' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={taskModalData.duration}
                    onChange={e => setTaskModalData({ ...taskModalData, duration: e.target.value })}
                    style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
                  />
                </div>
              )}

              {taskModalData.type !== 'milestone' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Resource</label>
                  <input
                    type="text"
                    value={taskModalData.assignees}
                    onChange={e => setTaskModalData({ ...taskModalData, assignees: e.target.value })}
                    style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
                  />
                </div>
              )}

              {taskModalData.type === 'task' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Predecessor (optional)</label>
                  <input
                    type="text"
                    placeholder="Task # or name it depends on"
                    value={taskModalData.predecessor}
                    onChange={e => setTaskModalData({ ...taskModalData, predecessor: e.target.value })}
                    style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  disabled={isSavingTask}
                  style={{
                    height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff',
                    color: '#475569', fontWeight: 600, fontSize: 13, cursor: isSavingTask ? 'not-allowed' : 'pointer',
                    padding: '0 16px', opacity: isSavingTask ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  style={{
                    height: 36, borderRadius: 8, border: 'none', background: '#2563eb',
                    color: '#ffffff', fontWeight: 600, fontSize: 13, cursor: isSavingTask ? 'not-allowed' : 'pointer',
                    padding: '0 16px', opacity: isSavingTask ? 0.7 : 1,
                  }}
                >
                  {isSavingTask ? 'Saving…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {alertMessage && (
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
          padding: 16,
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
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Notice
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: '1.5' }}>
              {alertMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={() => setAlertMessage('')}
                style={{
                  height: 36, borderRadius: 8, border: 'none', background: '#2563eb',
                  color: '#ffffff', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '0 16px',
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
          padding: 16,
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

      {/* Link context menu */}
      {linkMenu && (
        <div onMouseDown={stopProp} style={{
          position: 'fixed', top: linkMenu.y, left: linkMenu.x,
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 99999, padding: 5, minWidth: 220,
          animation: 'linkMenuIn 0.15s ease-out',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{ padding: '6px 10px 5px', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #f1f5f9', marginBottom: 3 }}>
            Change Link Type
          </div>
          {[
            { value: LINK_FS, label: 'FS', desc: 'Finish → Start', bg: '#dbeafe', color: '#1d4ed8', activeBg: '#2563eb' },
            { value: LINK_SS, label: 'SS', desc: 'Start → Start', bg: '#dcfce7', color: '#15803d', activeBg: '#16a34a' },
            { value: LINK_FF, label: 'FF', desc: 'Finish → Finish', bg: '#fef3c7', color: '#b45309', activeBg: '#d97706' },
            { value: LINK_SF, label: 'SF', desc: 'Start → Finish', bg: '#f3e8ff', color: '#7c3aed', activeBg: '#8b5cf6' },
          ].map(lt => {
            const isActive = linkMenu.currentType === lt.value
            return (
              <button key={lt.value} onClick={() => {
                try {
                  const link = gantt.getLink(linkMenu.linkId)
                  if (link) {
                    link.type = String(lt.value)
                    gantt.updateLink(linkMenu.linkId)
                  }
                } catch { /* ignore */ }
                setLinkMenu(null)
              }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 10px', border: 'none',
                borderRadius: 6, cursor: 'pointer', fontSize: 12,
                background: isActive ? lt.bg : 'transparent',
                fontFamily: 'inherit', textAlign: 'left', outline: 'none',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 30, height: 20, borderRadius: 4, fontWeight: 700,
                  fontSize: 10, letterSpacing: '0.4px',
                  background: isActive ? lt.activeBg : '#f1f5f9',
                  color: isActive ? '#fff' : lt.color,
                }}>{lt.label}</span>
                <span style={{ color: isActive ? '#0f172a' : '#64748b', fontWeight: isActive ? 600 : 500, flex: 1 }}>{lt.desc}</span>
                {isActive && <Check size={14} color={lt.color} />}
              </button>
            )
          })}
          <div style={{ borderTop: '1px solid #f1f5f9', margin: '3px 0' }} />
          <button onClick={() => {
            try { gantt.deleteLink(linkMenu.linkId) } catch { /* ignore */ }
            setLinkMenu(null)
          }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 10px', border: 'none',
            borderRadius: 6, cursor: 'pointer', fontSize: 12,
            background: 'transparent', color: '#ef4444',
            fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', outline: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={13} />
            Delete Link
          </button>
        </div>
      )}

    </div>
  )
}

export default GanttChart