import React, { useEffect, useRef, useState, useCallback } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import './ganttStyles.css'
import { API_ENDPOINTS } from '../../../config/api'
import {
  WORKFLOW_STATUS,
  WORKFLOW_STATUS_META,
  getWorkflow,
  setWorkflow,
  getLoggedInPmId,
  subscribeToWorkflowChanges,
  fetchWorkflowFromBackend,
} from '../../../utils/scheduleWorkflow'

import {
  LINK_FS,
  LINK_SS,
  LINK_FF,
  LINK_SF,
  COLUMN_WIDTHS,
  MOBILE_COLUMN_KEYS,
  getGridWidth,
  CHART_MIN_WIDTH,
  CHART_MIN_WIDTH_MOBILE,
  dropdownMenu,
} from './ganttConstants'
import {
  formatDateShort,
  getInclusiveEndDate,
  formatToAPI,
  formatToAPIDateOnly,
  parseDateOnlyLocal,
} from './dateUtils'
import {
  computeConstrainedDates,
  hasCircularDependency,
  propagateScheduling,
  topologicalSchedule,
} from './schedulingUtils'
import {
  isSubTask,
  getAssigneeLabel,
  transformScheduleToGanttData,
  getApiTaskId,
} from './dataUtils'
import { createPredecessorEditorConfig } from './predecessorEditor'
import { createResourceEditorConfig } from './resourceEditor'
import GanttToolbar from './GanttToolbar'
import GanttLegend from './GanttLegend'
import GanttTaskModal from './GanttTaskModal'
import GanttAlertModal from './GanttAlertModal'
import GanttDeleteModal from './GanttDeleteModal'
import GanttLinkMenu from './GanttLinkMenu'
import GanttFreezeConfirmModal from './GanttFreezeConfirmModal'
import { AlertTriangle, Info, X } from 'lucide-react'
import {
  fetchProjectAssignedResources,
  validateResourceInProject,
  parseMultiResourceString,
  resolveResourceIds,
} from '../../../services/projectResourceService'

function GanttChart({ tasks, projectName, onClose, pmId, projectId }) {
  const containerRef = useRef(null)
  const wrapperRef = useRef(null)
  const isGanttInitialized = useRef(false)
  const schedulingRef = useRef(false)
  const editSnapshotRef = useRef({})

  const [zoomLevel, setZoomLevel] = useState('day')
  const [criticalPath, setCriticalPath] = useState(false)
  const [showGantt, setShowGantt] = useState(true)
  const [scheduleSearch, setScheduleSearch] = useState('')
  const scheduleSearchRef = useRef('')

  // Mobile View Modes: 'grid' (Full Table) | 'split' | 'timeline' (Full Gantt)
  const [mobileViewMode, setMobileViewMode] = useState('grid')

  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )
  const isMobile = containerWidth < 640

  const [workflowStatus, setWorkflowStatus] = useState(WORKFLOW_STATUS.DRAFT)
  const [workflowNote, setWorkflowNote] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [dismissRejectionBanner, setDismissRejectionBanner] = useState(false)
  const isLockedRef = useRef(false)

  // 1. Workflow Sync
  useEffect(() => {
    if (!projectId) return undefined
    let cancelled = false

    const loadLocal = () => {
      const wf = getWorkflow(projectId)
      setWorkflowStatus(wf.status)
      setWorkflowNote(wf.note || '')
    }
    const loadRemote = async () => {
      const remote = await fetchWorkflowFromBackend(projectId)
      if (remote && !cancelled) {
        const localWf = getWorkflow(projectId)
        // If locally already frozen or decided, don't revert to draft if backend lags
        if (
          (localWf.status === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW ||
            localWf.status === WORKFLOW_STATUS.APPROVED ||
            localWf.status === WORKFLOW_STATUS.REJECTED) &&
          remote.status === WORKFLOW_STATUS.DRAFT
        ) {
          return
        }
        setWorkflowStatus(remote.status)
        setWorkflowNote(remote.note)
      }
    }

    loadLocal()
    loadRemote()

    const unsubscribe = subscribeToWorkflowChanges(() => {
      loadLocal()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [projectId])

  useEffect(() => {
    isLockedRef.current =
      workflowStatus === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW ||
      workflowStatus === WORKFLOW_STATUS.APPROVED
  }, [workflowStatus])

  const isScheduleLocked =
    workflowStatus === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW ||
    workflowStatus === WORKFLOW_STATUS.APPROVED

  useEffect(() => {
    try {
      if (isGanttInitialized.current) {
        gantt.config.readonly = isScheduleLocked
        gantt.render()
      }
    } catch { /* ignore */ }
  }, [isScheduleLocked])

  const [freezeConfirmOpen, setFreezeConfirmOpen] = useState(false)
  const [isFreezing, setIsFreezing] = useState(false)

  const handleScheduleTaskToPMO = () => {
    if (!projectId) return
    setFreezeConfirmOpen(true)
  }

  const handleConfirmFreeze = async () => {
    if (!projectId) return
    setIsFreezing(true)
    let snapshot = null
    try {
      snapshot = gantt.serialize()
    } catch {
      /* ignore */
    }
    setWorkflowStatus(WORKFLOW_STATUS.FROZEN_PENDING_REVIEW)
    setWorkflowNote('')
    await setWorkflow(projectId, WORKFLOW_STATUS.FROZEN_PENDING_REVIEW, '', pmId || getLoggedInPmId(), snapshot)
    setIsFreezing(false)
    setFreezeConfirmOpen(false)
  }

  // Modals & Menu State
  const [addOpen, setAddOpen] = useState(false)
  const [baselineOpen, setBaselineOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const addWrapRef = useRef(null)
  const baselineWrapRef = useRef(null)
  const moreWrapRef = useRef(null)

  const openMenuFrom = (wrapRef, setOpen, isOpen) => {
    if (!isOpen) {
      const rect = wrapRef.current?.getBoundingClientRect()
      const screenW = window.innerWidth
      let targetLeft = rect?.left ?? 0
      if (targetLeft + 220 > screenW) {
        targetLeft = Math.max(10, screenW - 230)
      }
      setMenuPos({ top: (rect?.bottom ?? 0) + 6, left: targetLeft })
    }
    setOpen((o) => !o)
  }

  const getMenuFixedStyle = (extra) => ({
    ...dropdownMenu,
    ...extra,
    position: 'fixed',
    top: menuPos.top,
    left: menuPos.left,
    maxWidth: 'calc(100vw - 20px)',
    marginTop: 0,
    zIndex: 9999,
  })

  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [deleteChildCount, setDeleteChildCount] = useState(0)
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

  const [gridWidth, setGridWidth] = useState(() => (isMobile ? 320 : getGridWidth(false)))
  const [holidaysData, setHolidaysData] = useState([])
  const [ganttError, setGanttError] = useState(null)
  const [scheduleTasks, setScheduleTasks] = useState(null)
  const [scheduleReloadKey, setScheduleReloadKey] = useState(0)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [projectResources, setProjectResources] = useState([])
  const [projectResourceNames, setProjectResourceNames] = useState([])

  // 2. Load Resources strictly assigned to this project
  const loadProjectResources = useCallback(async () => {
    if (!projectId) return
    try {
      const resources = await fetchProjectAssignedResources(projectId)
      setProjectResources(resources)
      setProjectResourceNames(resources.map((r) => r.name))
    } catch {
      setProjectResources([])
      setProjectResourceNames([])
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    queueMicrotask(() => loadProjectResources())
  }, [projectId, loadProjectResources])

  // 3. Resize Observer
  useEffect(() => {
    const el = wrapperRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const newWidth = entry.contentRect.width
      setContainerWidth(newWidth)

      if (isGanttInitialized.current) {
        try {
          gantt.setSizes()
        } catch { /* ignore */ }
      }
    })
    ro.observe(el)
    setContainerWidth(el.getBoundingClientRect().width)

    return () => ro.disconnect()
  }, [])

  // 4. Fetch Schedule Data
  useEffect(() => {
    let cancelled = false

    async function loadSchedule() {
      if (!projectId || !pmId) {
        setScheduleTasks({ data: [], links: [] })
        return
      }
      try {
        const response = await fetch(API_ENDPOINTS.GET_PROJECT_SCHEDULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, pm_id: pmId }),
        })

        const result = await response.json()
        if (!result.success) throw new Error(result.message || 'Failed to fetch schedule')
        if (cancelled) return
        setScheduleTasks(transformScheduleToGanttData(result.data || []))
      } catch (err) {
        console.error('Failed to load schedule:', err)
        if (cancelled) return
        setScheduleTasks({ data: [], links: [] })
      }
    }

    loadSchedule()
    return () => { cancelled = true }
  }, [projectId, pmId, scheduleReloadKey])

  const reloadSchedule = useCallback(() => {
    setScheduleReloadKey((k) => k + 1)
  }, [])

  // 5. Fetch Holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HOLIDAYS)
        const data = await res.json()
        if (data.success) setHolidaysData(data.data || [])
      } catch (err) {
        console.error('Failed to load holidays:', err)
      }
    }
    fetchHolidays()
  }, [])

  // 5b. Apply Calendar / Work-time Settings
  // The Calendar dropdown (Standard/All Day/Custom) and its working-days
  // checkboxes are only meaningful if something actually applies them to
  // dhtmlx's work-time calendar — without this effect they're inert UI:
  // gantt.config.work_time defaults to false (every day, including
  // weekends, counts as a working day), which silently skews every
  // duration/end-date calculation for a "Standard (Mon-Fri + Holidays)"
  // schedule. topologicalSchedule() re-resolves all existing links'
  // constrained dates after the calendar changes, since a Fri->Mon
  // weekend-skipping link can shift once weekends stop counting.
  useEffect(() => {
    if (!isGanttInitialized.current) return

    if (calendarType === 'alldays') {
      gantt.config.work_time = false
    } else if (calendarType === 'standard') {
      gantt.config.work_time = true
      gantt.setWorkTime({ day: 0, hours: false }) // Sun
      gantt.setWorkTime({ day: 6, hours: false }) // Sat
      for (let i = 1; i <= 5; i++) gantt.setWorkTime({ day: i, hours: true })

      holidaysData.forEach(h => {
        if (!h.holiday_date) return
        try {
          gantt.setWorkTime({ date: new Date(h.holiday_date), hours: false })
        } catch { /* skip unparsable holiday date */ }
      })
    } else if (calendarType === 'custom') {
      gantt.config.work_time = true
      for (let i = 0; i <= 6; i++) {
        gantt.setWorkTime({ day: i, hours: customWorkingDays.includes(i) })
      }
      if (includeHolidays) {
        holidaysData.forEach(h => {
          if (!h.holiday_date) return
          try {
            gantt.setWorkTime({ date: new Date(h.holiday_date), hours: false })
          } catch { /* skip unparsable holiday date */ }
        })
      }
    }

    try {
      topologicalSchedule()
      gantt.render()
    } catch { /* gantt not ready yet */ }
  }, [calendarType, holidaysData, customWorkingDays, includeHolidays])

  // 6. Search Filter
  useEffect(() => {
    scheduleSearchRef.current = scheduleSearch
    if (isGanttInitialized.current) {
      try { gantt.render() } catch { /* ignore */ }
    }
  }, [scheduleSearch])

  // Dropdown close listener
  useEffect(() => {
    const h = () => {
      setAddOpen(false)
      setBaselineOpen(false)
      setMoreOpen(false)
      setLinkMenu(null)
      setCustomDropdownOpen(false)
    }
    document.addEventListener('mousedown', h)
    window.addEventListener('scroll', h, true)
    window.addEventListener('resize', h)
    return () => {
      document.removeEventListener('mousedown', h)
      window.removeEventListener('scroll', h, true)
      window.removeEventListener('resize', h)
    }
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
      if (!taskLinks.length) return ''
      return taskLinks.map(link => {
        if (!gantt.isTaskExists(link.source)) return ''
        const src = gantt.getTask(link.source)
        const wbs = gantt.getWBSCode(src) || ''
        const label = getLinkTypeLabel(link.type)
        const lag = link.lag ? (link.lag > 0 ? `+${link.lag}d` : `${link.lag}d`) : ''
        return `${wbs}${label !== 'FS' ? label : ''}${lag}`
      }).filter(Boolean).join(', ')
    } catch { return '' }
  }, [])

  const syncTaskWithAPI = async (task, isSubTaskOverride = null) => {
    try {
      const isSubTaskFlag =
        isSubTaskOverride !== null
          ? isSubTaskOverride
          : String(task.id).startsWith('subtask_')

      const predText = getPredecessorsText(task) || task.predecessor || ''
      const resText = getAssigneeLabel(task) || task.resource || task.assignees || ''

      const resIdText = await resolveResourceIds(resText, projectResources)

      if (resText && projectResources.length > 0 && !validateResourceInProject(resText, projectResources)) {
        setAlertMessage(`Resource "${resText}" is not assigned to this project by PMO. Please select a valid assigned resource.`)
        reloadSchedule()
        return
      }

      if (isSubTaskFlag) {
        const parentTask = gantt.getTask(task.parent)
        const payload = {
          sub_task_id: task.apiId,
          pm_id: pmId,
          project_id: projectId,
          task_id: parentTask.apiId,
          sub_task_name: task.text,
          planned_start: formatToAPIDateOnly(task.start_date),
          planned_end: formatToAPIDateOnly(getInclusiveEndDate(task.end_date)),
          duration: Number(task.duration),
          resource: resIdText || '',
          resource_id: resIdText || '',
          percentage: resText || '',
          predecessor: predText,
        }

        const response = await fetch(API_ENDPOINTS.UPDATE_SUBTASK_SCHEDULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.message || 'Failed to update sub task.')
      } else {
        const payload = {
          task_id: task.apiId,
          pm_id: pmId,
          project_id: projectId,
          task_name: task.text,
          planned_start: formatToAPIDateOnly(task.start_date),
          planned_end: formatToAPIDateOnly(getInclusiveEndDate(task.end_date)),
          duration: Number(task.duration),
          resource: resIdText || '',
          resource_id: resIdText || '',
          percentage: resText || '',
          predecessor: predText,
        }

        const response = await fetch(API_ENDPOINTS.UPDATE_TASK_SCHEDULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.message || 'Failed to update task.')
      }

      reloadSchedule()
    } catch (err) {
      console.error('Schedule Update Error:', err)
      setAlertMessage(err.message || 'Failed to update schedule.')
    }
  }

  // 7. INITIALIZE GANTT ONCE (Mount Only)
  useEffect(() => {
    if (!containerRef.current) return

    try {
      gantt.plugins({
        critical_path: true,
        tooltip: true,
        auto_scheduling: true,
        inline_editors: true,
        marker: true,
        drag_timeline: true,
        export_api: true,
      })
    } catch (e) {
      console.warn('Gantt plugins notice:', e)
    }

    gantt.config.touch = 'force'
    gantt.config.touch_drag = 500
    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.link_line_width = 1.5
    gantt.config.start_on_monday = false
    gantt.config.inline_editors_date_format = '%Y-%m-%d'
    gantt.config.details_on_dblclick = false
    gantt.config.auto_scheduling = false

    // Two-pane smooth scrolling layout
    gantt.config.layout = {
      css: 'gantt_container',
      cols: [
        {
          width: gridWidth,
          rows: [
            { view: 'grid', scrollX: 'gridHorScroll', scrollY: 'gridVerScroll' },
            { view: 'scrollbar', id: 'gridHorScroll', height: 14 },
          ],
        },
        {
          rows: [
            { view: 'timeline', scrollX: 'timelineHorScroll', scrollY: 'gridVerScroll' },
            { view: 'scrollbar', id: 'timelineHorScroll', height: 14 },
          ],
        },
        { view: 'scrollbar', id: 'gridVerScroll', width: 14 },
      ],
    }

    if (gantt.addMarker) {
      const today = new Date()
      try {
        gantt.addMarker({
          id: 'today_marker',
          start_date: today,
          css: 'today',
          text: 'Today',
          title: `Today: ${today.toLocaleDateString()}`,
        })
      } catch { /* ignore */ }
    }

    const events = []

    events.push(gantt.attachEvent('onBeforeTaskDisplay', (id, task) => {
      const term = scheduleSearchRef.current.trim().toLowerCase()
      if (!term) return true
      const taskMatches = (t) =>
        (t.text || '').toLowerCase().includes(term) ||
        (t.assignees || '').toLowerCase().includes(term) ||
        (t.resource || '').toLowerCase().includes(term)

      if (taskMatches(task)) return true

      const hasMatchingDescendant = (taskId) => {
        const children = gantt.getChildren(taskId) || []
        return children.some((childId) => {
          let child
          try { child = gantt.getTask(childId) } catch { return false }
          return child && (taskMatches(child) || hasMatchingDescendant(childId))
        })
      }
      if (hasMatchingDescendant(id)) return true

      const hasMatchingAncestor = (taskId) => {
        let parentId
        try { parentId = gantt.getParent(taskId) } catch { return false }
        if (!parentId || !gantt.isTaskExists(parentId)) return false
        const parent = gantt.getTask(parentId)
        return taskMatches(parent) || hasMatchingAncestor(parentId)
      }
      return hasMatchingAncestor(id)
    }))

    events.push(gantt.attachEvent('onTaskDblClick', () => false))

    events.push(gantt.attachEvent('onBeforeLinkAdd', (id, link) => {
      if (String(link.source) === String(link.target)) {
        setAlertMessage('A task cannot link to itself.')
        return false
      }
      if (hasCircularDependency(link.source, link.target)) {
        setAlertMessage('Cannot create this link: circular dependency.')
        return false
      }
      return true
    }))

    events.push(gantt.attachEvent('onBeforeEditorOpen', (taskId, columnName) => {
      if (isLockedRef.current) return false
      try {
        const task = gantt.getTask(taskId)
        // Parent tasks keep their own independently-set dates/duration —
        // they are NOT recalculated from their children's dates (see the
        // removed rollUpParentDates calls below), so there's no reason to
        // block editing them here anymore. Work Streams (type: 'project')
        // stay locked since they're local-only groupings with no backend
        // row to persist an edit to.
        if (task.type === 'project' && (columnName === 'duration' || columnName === 'start_date' || columnName === 'end_date')) {
          return false
        }
        if (columnName === 'duration' || columnName === 'start_date' || columnName === 'end_date') {
          editSnapshotRef.current[taskId] = {
            start_date: new Date(task.start_date).getTime(),
            end_date: new Date(task.end_date).getTime(),
            duration: task.duration,
          }
        }
      } catch { /* allow */ }
      return true
    }))

    events.push(gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
      if (schedulingRef.current) return

      const before = editSnapshotRef.current[id]
      if (before) {
        delete editSnapshotRef.current[id]
        const durationChanged = before.duration !== task.duration
        const startChanged = before.start_date !== new Date(task.start_date).getTime()
        const endChanged = before.end_date !== new Date(task.end_date).getTime()

        if (durationChanged || startChanged) {
          task.end_date = gantt.calculateEndDate({ start_date: task.start_date, duration: task.duration })
        } else if (endChanged) {
          task.duration = gantt.calculateDuration({ start_date: task.start_date, end_date: task.end_date })
        }
      }
      schedulingRef.current = true
      try {
        gantt.refreshData()
        propagateScheduling(id)
        // Parent tasks are independent — a child's edit only propagates
        // forward through its own predecessor links, it never rolls up
        // into its parent's dates/duration (see the note in
        // onBeforeEditorOpen above).
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
        gantt.refreshData()
      } finally {
        schedulingRef.current = false
      }
      syncTaskWithAPI(task)
    }))

    // Predecessor links drive auto-scheduling — without recomputing the
    // target task's constrained dates here, adding/editing a link changes
    // the dependency relationship but never actually moves the target
    // task's start/end to obey it.
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
          }
        }
        gantt.refreshData()
      } finally {
        schedulingRef.current = false
      }
    }))

    // Opens the link-type context menu (GanttLinkMenu) — clicking either a
    // predecessor badge in the grid or a dependency line in the timeline.
    // Without these two handlers the menu component never receives a
    // linkMenu value, so it's rendered but permanently inert.
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
                linkId,
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

    events.push(gantt.attachEvent('onTaskSelect', (id) => { setSelectedTaskId(id); return true }))
    events.push(gantt.attachEvent('onTaskUnselect', () => { setSelectedTaskId(null); return true }))

    try {
      gantt.init(containerRef.current)
      isGanttInitialized.current = true
      setGanttError(null)
    } catch (e) {
      console.error('Gantt Init Error:', e)
      setGanttError(e.message || String(e))
    }

    return () => {
      isGanttInitialized.current = false
      gantt.clearAll()
      events.forEach(ev => gantt.detachEvent(ev))
    }
  }, [])

  // 8. Custom Templates (Restores original task box colors, borders, and tooltips)
  useEffect(() => {
    if (!isGanttInitialized.current) return

    // 🎨 Custom Box Colors Template
    gantt.templates.task_class = (s, e, task) => {
      const classes = []
      if (task.barClass) classes.push(task.barClass)
      if (criticalPath && gantt.isCriticalTask?.(task)) classes.push('gantt_critical_task')
      return classes.join(' ')
    }

    // Grid row and cell styling
    gantt.templates.grid_row_class = (s, e, task) => {
      if (criticalPath && gantt.isCriticalTask?.(task)) return 'critical-row'
      return ''
    }

    gantt.templates.grid_cell_class = (col, task) =>
      col.name === 'wbs_code' ? (task.borderClass || 'border-left-none') : ''

    gantt.templates.rightside_text = (s, e, task) => {
      if (isMobile) return ''
      const assignee = getAssigneeLabel(task) || task.resource || task.assignees
      if (!assignee) return ''
      const parsed = parseMultiResourceString(assignee)
      if (parsed.length === 1) {
        return `<span class="gantt-assignees-label">${parsed[0].name} (${parsed[0].percent}%)</span>`
      } else if (parsed.length > 1) {
        return `<span class="gantt-assignees-label" title="${assignee}">${parsed.map(p => `${p.name} (${p.percent}%)`).join(', ')}</span>`
      }
      return `<span class="gantt-assignees-label">${assignee}</span>`
    }

    gantt.templates.timeline_cell_class = (item, date) =>
      (date.getDay() === 0 || date.getDay() === 6) ? 'weekend-cell' : ''

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

      const taskAssignee = getAssigneeLabel(task) || task.resource || task.assignees
      let resourceLine = ''
      if (taskAssignee) {
        const parsed = parseMultiResourceString(taskAssignee)
        if (parsed.length > 0) {
          resourceLine = `<br/><b>Assigned Resources:</b> ${parsed.map(p => `${p.name} [${p.percent}%]`).join(', ')}`
        } else {
          resourceLine = `<br/><b>Resource:</b> ${taskAssignee}`
        }
      }

      return `<b>${task.text}</b>
              <br/><b>Start:</b> ${formatDateShort(task.start_date)}
              <br/><b>End:</b> ${formatDateShort(getInclusiveEndDate(task.end_date))}
              <br/><b>Duration:</b> ${task.duration || 0} days
              ${resourceLine}
              ${predStr ? `<br/><b>Predecessors:</b> ${predStr}` : ''}`
    }

    // Columns Configuration
    const textEditor = { type: 'text', map_to: 'text' }
    const dateEditor = { type: 'date', map_to: 'start_date' }
    const endEditor = { type: 'date', map_to: 'end_date' }
    const durationEditor = { type: 'number', map_to: 'duration', min: 0, max: 1000 }
    gantt.config.editor_types.custom_resource = createResourceEditorConfig(
      () => projectResources,
      setAlertMessage
    )
    const resourceEditor = { type: 'custom_resource', map_to: 'assignees' }

    gantt.config.editor_types.custom_predecessor = createPredecessorEditorConfig(setAlertMessage)
    const predecessorEditor = { type: 'custom_predecessor', map_to: 'auto' }

    const columnsConfig = [
      {
        name: 'wbs_code', label: '#', width: 38, min_width: 38, align: 'center', resize: false,
        header: [{ text: '#', align: 'center' }],
        template: (task) => gantt.getWBSCode(task) || '',
      },
      {
        name: 'text', label: 'Task Name', tree: true, width: isMobile ? 160 : 220, min_width: 150, resize: true,
        editor: textEditor,
        header: [{ text: 'Task Name', align: 'center' }],
        template: (task) => {
          const isProj = task.type === 'project'
          return `<span style="font-weight:${isProj ? '700' : '500'};color:${isProj ? '#0f172a' : '#334155'};">${task.text || ''}</span>`
        },
      },
      {
        name: 'start_date', label: 'Start', width: 85, min_width: 80, align: 'center', resize: true,
        editor: dateEditor,
        header: [{ text: 'Planned Start', align: 'center' }],
        template: (task) => formatDateShort(task.start_date),
      },
      {
        name: 'end_date', label: 'End', width: 85, min_width: 80, align: 'center', resize: true,
        editor: endEditor,
        header: [{ text: 'Planned End', align: 'center' }],
        template: (task) => formatDateShort(getInclusiveEndDate(task.end_date)),
      },
      {
        name: 'duration', label: 'Dur', width: 60, min_width: 55, align: 'center', resize: true,
        editor: durationEditor,
        header: [{ text: 'Dur', align: 'center' }],
        template: (task) => `${task.duration ?? 0} d`,
      },
      {
        name: 'assignees', label: 'Resource', width: 135, min_width: 110, align: 'center', resize: true,
        editor: resourceEditor,
        header: [{ text: 'Resource', align: 'center' }],
        template: (task) => {
          const raw = getAssigneeLabel(task) || task.percentage || task.resource || task.assignees || task.resourceName
          if (!raw) return '<span style="color:#94a3b8;">—</span>'
          const parsed = parseMultiResourceString(raw).map((item) => {
            const match = projectResources.find(
              (r) =>
                String(r.id) === String(item.name).trim() ||
                String(r.resource_id) === String(item.name).trim() ||
                String(r.name || '').trim().toLowerCase() === String(item.name).trim().toLowerCase()
            )
            return {
              ...item,
              name: match ? match.name : item.name,
            }
          })
          if (parsed.length === 0) {
            return `<span style="color:#1e293b;font-weight:600;">${raw}</span>`
          }
          if (parsed.length === 1) {
            return `<span style="color:#1d4ed8;font-weight:700;background:#eff6ff;padding:2px 6px;border-radius:5px;border:1px solid #dbeafe;font-size:11px;">${parsed[0].name} (${parsed[0].percent}%)</span>`
          }
          const total = parsed.reduce((s, i) => s + (Number(i.percent) || 0), 0)
          return `<span style="color:#0f172a;font-weight:700;background:#f8fafc;padding:2px 6px;border-radius:5px;border:1px solid #cbd5e1;font-size:11px;" title="${raw}">${parsed.length} Res (${total}%)</span>`
        },
        onrender: (task, node) => {
          if (isSubTask(task, projectId)) {
            node.style.background = 'rgba(219,234,254,0.25)'
          }
        },
      },
      {
        name: 'predecessors', label: 'Pred', width: 75, min_width: 70, align: 'center', resize: true,
        editor: predecessorEditor,
        header: [{ text: 'Pred', align: 'center' }],
        template: (task) => {
          const pred = getPredecessorsText(task) || task.predecessor || task.predecessors
          return pred && pred !== '-' ? `<span style="font-weight:600;color:#334155;">${pred}</span>` : '<span style="color:#cbd5e1;">—</span>'
        },
      },
    ]

    gantt.config.columns = columnsConfig
    gantt.config.row_height = 42
    gantt.config.task_height = 24
    gantt.config.highlight_critical_path = criticalPath
    gantt.config.show_chart = showGantt

    let targetGridWidth = getGridWidth(false)
    if (isMobile) {
      if (mobileViewMode === 'grid') targetGridWidth = Math.max(containerWidth, 340)
      else if (mobileViewMode === 'timeline') targetGridWidth = 0
      else targetGridWidth = Math.round(containerWidth * 0.5)
    }

    gantt.config.grid_width = targetGridWidth
    if (gantt.config.layout?.cols?.[0]) {
      gantt.config.layout.cols[0].width = targetGridWidth
    }

    try {
      gantt.resetLayout()
      gantt.render()
    } catch { /* ignore */ }
  }, [isMobile, mobileViewMode, criticalPath, showGantt, containerWidth, projectResourceNames, getPredecessorsText])

  // 9. Parse Schedule Data
  // A full clearAll()+parse() is required to pick up server-canonical ids/
  // WBS numbers after a mutation (create/delete/reload), but dhtmlx
  // doesn't preserve scroll position, expanded/collapsed rows, or the
  // current selection across that reset on its own — every task/sub-task
  // create was silently jumping the view back to the top, fully expanded,
  // deselected. Snapshotting these three before the reset and restoring
  // them after keeps the view stable across a mutation instead.
  //
  // Parent tasks are independent: their start/end/duration come straight
  // from the API's own row for that task (see transformScheduleToGanttData)
  // and are never recalculated from their children's dates here.
  useEffect(() => {
    if (!isGanttInitialized.current || !scheduleTasks) return
    try {
      const scrollState = gantt.getScrollState()
      const selectedId = gantt.getSelectedId()
      const collapsedIds = []
      gantt.eachTask(task => {
        if (task.$open === false) collapsedIds.push(task.id)
      })

      gantt.clearAll()
      gantt.parse(scheduleTasks)

      collapsedIds.forEach(id => {
        if (gantt.isTaskExists(id)) gantt.close(id)
      })
      if (selectedId && gantt.isTaskExists(selectedId)) {
        gantt.selectTask(selectedId)
      }

      gantt.render()
      gantt.scrollTo(scrollState.x, scrollState.y)
    } catch (e) {
      console.error('Data parse error:', e)
    }
  }, [scheduleTasks])

  // 10. Zoom Scale Updates
  useEffect(() => {
    if (!isGanttInitialized.current) return
    const zoomConfig = {
      levels: [
        {
          name: 'day', scale_height: isMobile ? 40 : 50, min_column_width: isMobile ? 30 : 34,
          scales: [
            { unit: 'week', step: 1, format: (d) => d.getDate() <= 7 ? gantt.date.date_to_str('%M %Y')(d) : gantt.date.date_to_str('%D %d %M %Y')(d) },
            { unit: 'day', step: 1, format: (d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()] },
          ],
        },
        {
          name: 'week', scale_height: isMobile ? 40 : 50, min_column_width: 60,
          scales: [
            { unit: 'month', step: 1, format: '%F, %Y' },
            { unit: 'week', step: 1, format: 'Week #%W' },
          ],
        },
        {
          name: 'month', scale_height: isMobile ? 40 : 50, min_column_width: 100,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            { unit: 'month', step: 1, format: '%F' },
          ],
        },
        {
          name: 'year', scale_height: isMobile ? 40 : 50, min_column_width: 120,
          scales: [
            { unit: 'year', step: 1, format: '%Y' },
            { unit: 'quarter', step: 1, format: 'Q%q' },
          ],
        },
      ],
    }
    gantt.ext.zoom.init(zoomConfig)
    gantt.ext.zoom.setLevel(zoomLevel)
    try { gantt.render() } catch { /* ignore */ }
  }, [zoomLevel, isMobile])

  // Task Modal Handlers
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

    if (isSubTaskFlag && type === 'task' && getApiTaskId(parentId) === null) {
      setAlertMessage('Sub-tasks can only be added to a top-level task.')
      return
    }

    let parentName = ''
    if (isSubTaskFlag && parentId && gantt.isTaskExists(parentId)) {
      parentName = gantt.getTask(parentId).text || ''
    }

    setTaskModalData({
      type,
      isSubTaskFlag,
      parentId,
      parentName,
      text: '',
      start_date: formatToAPIDateOnly(new Date()),
      duration: type === 'milestone' ? 0 : 5,
      assignees: '',
      predecessor: '',
    })
    setTaskModalOpen(true)
    queueMicrotask(() => loadProjectResources())
  }

  const handleSubmitTaskModal = async (e) => {
    e.preventDefault()
    const { type, isSubTaskFlag, parentId, text, start_date, duration, assignees, predecessor } = taskModalData

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
      setAlertMessage(`"${newTask.text}" added locally.`)
      return
    }

    setIsSavingTask(true)
    try {
      if (assignees && projectResources.length > 0 && !validateResourceInProject(assignees, projectResources)) {
        setAlertMessage(`Resource "${assignees}" is not assigned to this project by PMO. Please select a valid resource.`)
        setIsSavingTask(false)
        return
      }

      const startDateObj = parseDateOnlyLocal(start_date) || new Date()
      const durationNum = Math.max(1, Number(duration) || 1)
      // calculateEndDate returns dhtmlx's exclusive boundary (the day
      // *after* the last working day) — getInclusiveEndDate converts that
      // to the calendar date a user actually typed/expects as "End", the
      // same conversion syncTaskWithAPI and every grid End-column cell
      // already apply. Skipping it here (as this line previously did) sent
      // a planned_end one day later than intended on every task/sub-task
      // creation, which is what surfaced as "duration off after reload".
      const endDateObj = getInclusiveEndDate(
        gantt.calculateEndDate({ start_date: startDateObj, duration: durationNum })
      )

      const assigneesResIdText = await resolveResourceIds(assignees || '', projectResources)

      const payload = {
        pm_id: pmId,
        project_id: projectId,
        planned_start: formatToAPI(startDateObj, false),
        planned_end: formatToAPI(endDateObj, true),
        duration: durationNum,
        resource: assigneesResIdText || '',
        resource_id: assigneesResIdText || '',
        percentage: assignees || '',
        predecessor: predecessor || '',
      }

      let response
      if (isSubTaskFlag) {
        const taskId = getApiTaskId(parentId)
        if (!taskId) {
          setAlertMessage('Parent task not found.')
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
      setAlertMessage(err.message || 'Could not save the task.')
    } finally {
      setIsSavingTask(false)
    }
  }

  const handleDeleteClick = () => {
    const selectedId = gantt.getSelectedId() || selectedTaskId
    if (!selectedId) {
      setAlertMessage('Please select a task to delete.')
      return
    }
    if (selectedId === `project_${projectId}`) {
      setAlertMessage('The project root task cannot be deleted.')
      return
    }
    try {
      const task = gantt.getTask(selectedId)
      if (!task) return
      setTaskToDelete(task)
      setDeleteChildCount((gantt.getChildren(selectedId) || []).length)
      setDeleteText('')
      setDeleteConfirmOpen(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || deleteText.trim().toLowerCase() !== 'delete') return

    try {
      const isSubTaskFlag = String(taskToDelete.id).startsWith('subtask_')
      let payload
      if (isSubTaskFlag) {
        const parentTask = gantt.getTask(taskToDelete.parent)
        payload = { task_id: parentTask.apiId, sub_task_id: taskToDelete.apiId }
      } else {
        payload = { task_id: taskToDelete.apiId }
      }

      const response = await fetch(API_ENDPOINTS.DELETE_TASK_SUBTASK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        setAlertMessage(result.message || 'Failed to delete.')
        return
      }

      gantt.deleteTask(taskToDelete.id)
      setDeleteConfirmOpen(false)
      setTaskToDelete(null)
      setDeleteChildCount(0)
      setSelectedTaskId(null)
      setDeleteText('')
    } catch (err) {
      console.error('Delete Error:', err)
      setAlertMessage('Failed to delete.')
    }
  }

  const handleScrollToday = () => gantt.showDate(new Date())
  const handleScrollLeft = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x - 220, null) }
  const handleScrollRight = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x + 220, null) }

  const handleExport = (fmt) => {
    setMoreOpen(false)
    try {
      const exportName = (projectName || 'gantt-chart').replace(/[^\w-]+/g, '_')
      if (fmt === 'pdf') gantt.exportToPDF({ name: `${exportName}.pdf` })
      else if (fmt === 'png') gantt.exportToPNG({ name: `${exportName}.png` })
    } catch {
      setAlertMessage('Export failed. Please check your internet connection and try again.')
    }
  }

  const handleClearAll = () => { setMoreOpen(false); if (confirm('Clear all tasks?')) gantt.clearAll() }

  const handleIndent = () => {
    const selectedId = gantt.getSelectedId()
    if (!selectedId) return
    const prevSibling = gantt.getPrevSibling(selectedId)
    if (!prevSibling) return
    gantt.moveTask(selectedId, gantt.getChildren(prevSibling).length, prevSibling)
    gantt.open(prevSibling)
    schedulingRef.current = true
    try { gantt.refreshData() } finally { schedulingRef.current = false }
  }

  const handleOutdent = () => {
    const selectedId = gantt.getSelectedId()
    if (!selectedId) return
    const parentId = gantt.getParent(selectedId)
    if (!parentId || !gantt.isTaskExists(parentId)) return
    const grandParentId = gantt.getParent(parentId)
    const parentIndex = gantt.getTaskIndex(parentId)
    gantt.moveTask(selectedId, parentIndex + 1, grandParentId || 0)
    schedulingRef.current = true
    try { gantt.refreshData() } finally { schedulingRef.current = false }
  }

  const totalTasks = tasks?.data?.length || 0
  const totalMilestones = tasks?.data?.filter(t => t.duration === 0).length || 0

  return (
    <div
      ref={wrapperRef}
      className="gantt-responsive-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        height: isMobile ? 'clamp(480px, 86vh, 720px)' : 'clamp(480px, 80vh, 780px)',
        background: '#ffffff',
        borderRadius: isMobile ? 12 : 18,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
        marginTop: isMobile ? 12 : 20,
        userSelect: 'none',
        position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <GanttToolbar
        isMobile={isMobile}
        projectName={projectName}
        scheduleSearch={scheduleSearch}
        onSearchChange={setScheduleSearch}
        calendarType={calendarType}
        onCalendarTypeChange={setCalendarType}
        customDropdownOpen={customDropdownOpen}
        onToggleCustomDropdown={() => { setCustomDropdownOpen(!customDropdownOpen); setMoreOpen(false); setAddOpen(false); setBaselineOpen(false) }}
        customWorkingDays={customWorkingDays}
        onCustomWorkingDaysChange={setCustomWorkingDays}
        includeHolidays={includeHolidays}
        onIncludeHolidaysChange={setIncludeHolidays}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        workflowStatus={workflowStatus}
        workflowStatusMeta={WORKFLOW_STATUS_META[workflowStatus]}
        onOpenRejectionReason={() => setShowRejectionModal(true)}
        isScheduleLocked={isScheduleLocked}
        addOpen={addOpen}
        addWrapRef={addWrapRef}
        onToggleAdd={() => { openMenuFrom(addWrapRef, setAddOpen, addOpen); setBaselineOpen(false); setMoreOpen(false) }}
        onOpenAddTaskModal={handleOpenAddTaskModal}
        onDeleteClick={handleDeleteClick}
        onOutdent={handleOutdent}
        onIndent={handleIndent}
        baselineOpen={baselineOpen}
        baselineWrapRef={baselineWrapRef}
        onToggleBaseline={() => { openMenuFrom(baselineWrapRef, setBaselineOpen, baselineOpen); setAddOpen(false); setMoreOpen(false) }}
        activeBaseline={activeBaseline}
        onSelectBaseline={(item) => { setActiveBaseline(item); setBaselineOpen(false) }}
        moreOpen={moreOpen}
        moreWrapRef={moreWrapRef}
        onToggleMore={() => { openMenuFrom(moreWrapRef, setMoreOpen, moreOpen); setAddOpen(false); setBaselineOpen(false) }}
        onExport={handleExport}
        onClearAll={handleClearAll}
        onScrollLeft={handleScrollLeft}
        onScrollToday={handleScrollToday}
        onScrollRight={handleScrollRight}
        criticalPath={criticalPath}
        onCriticalPathChange={setCriticalPath}
        showGantt={showGantt}
        onShowGanttChange={setShowGantt}
        onOpenSettings={() => setAlertMessage('Opening settings...')}
        getMenuFixedStyle={getMenuFixedStyle}
      />

      {/* Top PMO Rejection Alert Banner */}
      {workflowStatus === WORKFLOW_STATUS.REJECTED && workflowNote && !dismissRejectionBanner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: isMobile ? '8px 12px' : '9px 18px',
            background: 'linear-gradient(90deg, #fff1f2 0%, #fff5f5 50%, #ffffff 100%)',
            borderBottom: '1px solid #fecaca',
            flexShrink: 0,
            fontSize: 12,
            boxShadow: '0 1px 3px rgba(239,68,68,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#b91c1c',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={13} />
            </span>
            <span style={{ fontWeight: 800, color: '#991b1b', flexShrink: 0 }}>
              PMO Rejection:
            </span>
            <span
              style={{
                color: '#7f1d1d',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? 180 : 480,
              }}
              title={workflowNote}
            >
              {workflowNote}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setShowRejectionModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              View Full Reason
            </button>
            <button
              type="button"
              onClick={() => setDismissRejectionBanner(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
              }}
              title="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile View Toggle Buttons */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#64748b' }}>View:</span>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 6, padding: 2, gap: 2 }}>
            <button
              onClick={() => setMobileViewMode('grid')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: mobileViewMode === 'grid' ? 700 : 500,
                background: mobileViewMode === 'grid' ? '#ffffff' : 'transparent',
                color: mobileViewMode === 'grid' ? '#0f172a' : '#64748b',
                boxShadow: mobileViewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              📋 Table
            </button>
            <button
              onClick={() => setMobileViewMode('split')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: mobileViewMode === 'split' ? 700 : 500,
                background: mobileViewMode === 'split' ? '#ffffff' : 'transparent',
                color: mobileViewMode === 'split' ? '#0f172a' : '#64748b',
                boxShadow: mobileViewMode === 'split' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              ◫ Split
            </button>
            <button
              onClick={() => setMobileViewMode('timeline')}
              style={{
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: mobileViewMode === 'timeline' ? 700 : 500,
                background: mobileViewMode === 'timeline' ? '#ffffff' : 'transparent',
                color: mobileViewMode === 'timeline' ? '#0f172a' : '#64748b',
                boxShadow: mobileViewMode === 'timeline' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              📊 Timeline
            </button>
          </div>
        </div>
      )}

      {/* Persistent Gantt Container */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        {ganttError ? (
          <div style={{ padding: 20, color: '#ef4444', fontWeight: 'bold', fontSize: 13 }}>
            Failed to initialize Gantt: {ganttError}
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}
          />
        )}
      </div>

      {/* Submit Button */}
      {(workflowStatus === WORKFLOW_STATUS.DRAFT || workflowStatus === WORKFLOW_STATUS.REJECTED) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '8px 12px' : '10px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleScheduleTaskToPMO}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: isMobile ? 38 : 34,
              borderRadius: 8,
              fontSize: 12,
              padding: '0 20px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(15,23,42,0.25)',
              minWidth: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
            }}
          >
            Submit to PMO
          </button>
        </div>
      )}

      <GanttLegend isMobile={isMobile} totalTasks={totalTasks} totalMilestones={totalMilestones} />

      <GanttTaskModal
        open={taskModalOpen}
        data={taskModalData}
        onChange={setTaskModalData}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleSubmitTaskModal}
        isSaving={isSavingTask}
        projectResourceNames={projectResources}
        currentProjectId={projectId}
      />

      <GanttAlertModal message={alertMessage} onClose={() => setAlertMessage('')} />

      {/* PMO Rejection Reason Modal */}
      {showRejectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            padding: 16,
          }}
          onClick={() => setShowRejectionModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 24,
              background: '#ffffff',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid #fee2e2',
              overflow: 'hidden',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={18} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>PMO Rejection Feedback</h4>
                  <p style={{ margin: 0, fontSize: 11, color: '#fecdd3', fontWeight: 500 }}>
                    Schedule Review Note
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectionModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Reason from PMO Reviewer:
                </p>
                <div
                  style={{
                    background: '#fff1f2',
                    border: '1.5px solid #fecdd3',
                    borderRadius: 14,
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#881337',
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{workflowNote}&rdquo;
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 12,
                  fontSize: 11,
                  color: '#475569',
                }}
              >
                <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#0f172a' }}>
                  💡 Action Required from PM:
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li>Make required date or resource adjustments in the Gantt chart.</li>
                  <li>Click <b>"Submit to PMO"</b> at the bottom to re-submit your revised schedule.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '9px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Got it, Let me Fix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GanttDeleteModal
        open={deleteConfirmOpen}
        task={taskToDelete}
        childCount={deleteChildCount}
        deleteText={deleteText}
        onDeleteTextChange={setDeleteText}
        onCancel={() => { setDeleteConfirmOpen(false); setTaskToDelete(null); setDeleteChildCount(0); setDeleteText('') }}
        onConfirm={handleConfirmDeleteTask}
      />

      <GanttLinkMenu
        linkMenu={linkMenu}
        onChangeType={(newType) => {
          try {
            const link = gantt.getLink(linkMenu.linkId)
            if (link) {
              link.type = String(newType)
              gantt.updateLink(linkMenu.linkId)
            }
          } catch { /* ignore */ }
          setLinkMenu(null)
        }}
        onDeleteLink={() => {
          try { gantt.deleteLink(linkMenu.linkId) } catch { /* ignore */ }
          setLinkMenu(null)
        }}
      />

      <GanttFreezeConfirmModal
        open={freezeConfirmOpen}
        projectName={projectName}
        onCancel={() => {
          if (!isFreezing) setFreezeConfirmOpen(false)
        }}
        onConfirm={handleConfirmFreeze}
        isSubmitting={isFreezing}
      />
    </div>
  )
}

export default GanttChart