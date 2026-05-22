import React, { useEffect, useRef, useState } from 'react'
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
  MoreHorizontal
} from 'lucide-react'

// Premium Workplan Theme CSS Overrides
const customStyles = `
  .gantt_container {
    border: 1px solid #e2e8f0 !important;
    border-radius: 0px !important;
    background-color: #ffffff !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  }
  
  /* Multi-line Headers Styling */
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
    color: #475569 !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    border-right: 1px solid #cbd5e1 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    padding: 6px 12px !important;
  }

  .gantt_grid_head_cell_search {
    padding: 2px 8px 6px 8px !important;
  }

  /* Grid Search Input with Magnifying Glass */
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

  /* Table cells left border color indicators */
  .border-left-yellow {
    border-left: 5px solid #f1c40f !important;
  }
  .border-left-blue {
    border-left: 5px solid #60a5fa !important;
  }
  .border-left-green {
    border-left: 5px solid #10b981 !important;
  }
  .border-left-pink {
    border-left: 5px solid #ec4899 !important;
  }
  .border-left-none {
    border-left: 5px solid transparent !important;
  }

  /* Index cell formatting */
  .gantt-index-cell {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    font-weight: 500 !important;
    color: #64748b !important;
    width: 100%;
    height: 100%;
  }

  /* Rows styling */
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

  .gantt_task_row {
    border-bottom: 1px solid #e2e8f0 !important;
  }

  .gantt_task_cell {
    border-right: 1px solid #f1f5f9 !important;
  }

  .gantt_grid_wraper {
    border-right: 1px solid #cbd5e1 !important;
  }

  /* Weekend Shading */
  .weekend-cell {
    background-color: #f8fafc !important;
  }

  /* Tree Grid Overrides */
  .gantt_tree_icon.gantt_folder_open,
  .gantt_tree_icon.gantt_folder_closed,
  .gantt_tree_icon.gantt_file {
    display: none !important;
  }

  .gantt_tree_icon.gantt_close {
    background-image: none !important;
    background: none !important;
    text-align: center;
    line-height: inherit;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .gantt_tree_icon.gantt_close:before {
    content: "▶" !important;
    color: #2563eb !important;
    font-size: 9px !important;
    display: inline-block;
  }

  .gantt_tree_icon.gantt_open {
    background-image: none !important;
    background: none !important;
    text-align: center;
    line-height: inherit;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .gantt_tree_icon.gantt_open:before {
    content: "▼" !important;
    color: #2563eb !important;
    font-size: 9px !important;
    display: inline-block;
  }

  /* Custom Gantt Bar colors */
  .gantt_task_line {
    border: none !important;
    border-radius: 4px !important;
    height: 22px !important;
    line-height: 22px !important;
  }

  .gantt-bar-yellow { background-color: #f1c40f !important; }
  .gantt-bar-yellow .gantt_task_progress { background-color: #d4ac0d !important; }

  .gantt-bar-blue { background-color: #8bb4e8 !important; }
  .gantt-bar-blue .gantt_task_progress { background-color: #5d8ec9 !important; }

  .gantt-bar-pink { background-color: #f8c9d4 !important; }
  .gantt-bar-pink .gantt_task_progress { background-color: #e59ba9 !important; }

  .gantt-bar-green { background-color: #48c9b0 !important; }
  .gantt-bar-green .gantt_task_progress { background-color: #1abc9c !important; }

  .gantt-bar-dark-green {
    background-color: #4e8a60 !important;
    border-radius: 4px !important;
  }
  .gantt-bar-dark-green .gantt_task_progress { background-color: #275635 !important; }

  /* Assignee labels */
  .gantt-assignees-label {
    color: #64748b !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    padding-left: 8px;
    white-space: nowrap;
  }

  /* Dependency Links */
  .gantt_task_link.gantt_link_regular { stroke: #e879f9 !important; stroke-width: 1.5px !important; }
  .gantt_task_link .gantt_line_wrapper { stroke: #e879f9 !important; }
  .gantt_task_link .gantt_link_line { background-color: #e879f9 !important; stroke: #e879f9 !important; }
  .gantt_link_arrow { border-color: transparent transparent transparent #e879f9 !important; border-left-color: #e879f9 !important; }

  /* Critical Path */
  .gantt_critical_task { border: 1px solid #ef4444 !important; box-shadow: 0 0 6px rgba(239,68,68,0.35) !important; }
  .gantt_critical_link .gantt_line_wrapper { stroke: #ef4444 !important; stroke-width: 2px !important; }
  .gantt_critical_link .gantt_link_arrow { border-left-color: #ef4444 !important; }

  /* Lightbox */
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
  .gantt_btn_set { border-radius: 6px !important; font-weight: bold !important; }
  .gantt_save_btn_set { background-color: #2563eb !important; color: white !important; }
  .gantt_modal_cover {
    background-color: rgba(15, 23, 42, 0.4) !important;
    opacity: 1 !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
  }
`

// ── Shared inline style helpers ──────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
function GanttChart({ tasks, projectName, onClose }) {
  const containerRef = useRef(null)

  const [zoomLevel, setZoomLevel] = useState('day')
  const [criticalPath, setCriticalPath] = useState(false)
  const [showGantt, setShowGantt] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [baselineOpen, setBaselineOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const [activeBaseline, setActiveBaseline] = useState('Baseline 1')

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handler = () => { setAddOpen(false); setBaselineOpen(false); setMoreOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.innerHTML = customStyles
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    gantt.plugins({ critical_path: true, tooltip: true })

    gantt.config.date_format = "%Y-%m-%d"
    gantt.config.row_height = 42
    gantt.config.task_height = 22
    gantt.config.link_line_width = 1.5
    gantt.config.show_chart = showGantt
    gantt.config.highlight_critical_path = criticalPath
    gantt.config.work_time = true
    gantt.config.start_on_monday = false

    gantt.config.columns = [
      {
        name: "wbs_code", width: 100, align: "left",
        header: [
          { html: "<div style='text-align:center;width:100%;font-weight:700;'>WBS</div>" },
          { text: "" }
        ],
        template: (task) => {
          const getWBS = (t) => {
            if (!t) return ""
            const parentId = t.parent || 0
            const siblings = gantt.getChildren(parentId)
            const idx = siblings.indexOf(t.id) + 1
            if (idx === 0) return ""
            if (parentId && parentId !== 0 && parentId !== "0" && gantt.isTaskExists(parentId)) {
              const parentWBS = getWBS(gantt.getTask(parentId))
              return parentWBS ? `${parentWBS}.${idx}` : `${idx}`
            }
            return `${idx}`
          }
          const index = getWBS(task)
          const depth = (index.match(/\./g) || []).length
          const warn = task.userWarning ? `<span style="color:#ef4444;font-size:11px;margin-right:4px;">👤</span>` : ''
          return `<div class="gantt-index-cell" style="padding-left:${depth * 12}px;">${warn}${index}</div>`
        }
      },
      {
        name: "text", tree: true, width: 280, resize: true,
        header: [
          { html: "<div style='display:flex;justify-content:space-between;align-items:center;width:100%;font-weight:700;'><span>Name</span><span style='font-weight:normal;color:#64748b;font-size:13px;margin-right:4px;display:inline-flex;gap:4px;'><span>⇳</span><span>⛶</span></span></div>" },
          { html: "<div class='search-container-wrapper'><input type='text' id='gantt-search-input' class='gantt-search-input' placeholder='Search...' /></div>" }
        ],
        template: (task) =>
          `<span style="font-weight:${task.type === 'project' ? 'bold' : 'normal'};color:${task.type === 'project' ? '#1e293b' : '#475569'};">${task.text}</span>`
      }
    ]

    gantt.config.scale_height = 50

    const zoomConfig = {
      levels: [
        {
          name: "day", scale_height: 50, min_column_width: 30,
          scales: [
            { unit: "week", step: 1, format: (d) => d.getDate() <= 7 ? gantt.date.date_to_str("%M %Y")(d) : gantt.date.date_to_str("%D %d %M %Y")(d) },
            { unit: "day", step: 1, format: (d) => ["S","M","T","W","T","F","S"][d.getDay()] }
          ]
        },
        {
          name: "week", scale_height: 50, min_column_width: 70,
          scales: [
            { unit: "month", step: 1, format: "%F, %Y" },
            { unit: "week", step: 1, format: "Week #%W" }
          ]
        },
        {
          name: "month", scale_height: 50, min_column_width: 120,
          scales: [
            { unit: "year", step: 1, format: "%Y" },
            { unit: "month", step: 1, format: "%F" }
          ]
        },
        {
          name: "year", scale_height: 50, min_column_width: 150,
          scales: [
            { unit: "year", step: 1, format: "%Y" },
            { unit: "quarter", step: 1, format: "Q%q" }
          ]
        }
      ]
    }

    gantt.ext.zoom.init(zoomConfig)
    gantt.ext.zoom.setLevel(zoomLevel)

    gantt.templates.task_class = (s, e, task) => task.barClass ? task.barClass : ""
    gantt.templates.grid_cell_class = (col, task) => col.name === "wbs_code" ? (task.borderClass || "border-left-none") : ""
    gantt.templates.rightside_text = (s, e, task) => task.assignees ? `<span class="gantt-assignees-label">${task.assignees}</span>` : ""
    gantt.templates.timeline_cell_class = (item, date) => (date.getDay() === 0 || date.getDay() === 6) ? "weekend-cell" : ""

    gantt.init(containerRef.current)
    gantt.clearAll()
    gantt.parse(tasks)

    const searchInput = document.getElementById("gantt-search-input")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        gantt.filterValue = e.target.value
        gantt.refreshData()
      })
      if (gantt.filterValue) searchInput.value = gantt.filterValue
    }

    gantt.attachEvent("onBeforeTaskDisplay", (id, task) => {
      if (gantt.filterValue) return task.text.toLowerCase().includes(gantt.filterValue.toLowerCase())
      return true
    })

    const ev1 = gantt.attachEvent("onLightbox", () => {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
      return true
    })
    const ev2 = gantt.attachEvent("onAfterLightbox", () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    })

    return () => {
      gantt.clearAll()
      gantt.detachEvent(ev1)
      gantt.detachEvent(ev2)
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [tasks, zoomLevel, criticalPath, showGantt])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddTask = (type, isSubTask = false) => {
    setAddOpen(false)
    const activeId = gantt.getSelectedId()
    let parentId
    if (activeId) {
      if (isSubTask) { parentId = activeId; gantt.open(activeId) }
      else parentId = gantt.getParent(activeId) || undefined
    } else if (isSubTask) {
      alert("Please select a task first to add a sub-task.")
      return
    }
    const newTask = {
      id: `task_${Date.now()}`,
      text: type === 'project' ? "New Category" : type === 'milestone' ? "Milestone" : "New Task",
      start_date: new Date(2020, 5, 8),
      duration: type === 'milestone' ? 0 : 5,
      progress: 0, parent: parentId, type,
      barClass: type === 'project' ? 'gantt-bar-dark-green' : type === 'milestone' ? 'gantt-bar-green' : 'gantt-bar-blue',
      borderClass: type === 'project' ? 'border-left-none' : 'border-left-blue'
    }
    gantt.addTask(newTask)
    gantt.showLightbox(newTask.id)
  }

  const handleScrollToday = () => gantt.showDate(new Date(2020, 5, 15))
  const handleScrollLeft = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x - 250, null) }
  const handleScrollRight = () => { const s = gantt.getScrollState(); gantt.scrollTo(s.x + 250, null) }
  const handleExport = (fmt) => { setMoreOpen(false); alert(`Exporting Gantt Chart to ${fmt.toUpperCase()}...`) }
  const handleClearAll = () => { setMoreOpen(false); if (confirm("Clear all tasks?")) gantt.clearAll() }

  const stopProp = (e) => e.stopPropagation()

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100%', height: 700,
      background: '#ffffff',
      borderRadius: 20, border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      overflow: 'hidden', marginTop: 24,
      userSelect: 'none', position: 'relative',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>

      {/* ══ ROW 1 — Title + Zoom ══════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        padding: '14px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>

        {/* Left: icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <polyline points="9 16 11 18 15 14"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Project Management Workplan
          </span>
        </div>

        {/* Right: Zoom segmented control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}></span>
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
                  padding: '6px 18px',
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  color: active ? '#2563eb' : '#64748b',
                  background: active ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                  outline: active ? '2px solid #2563eb' : 'none',
                  outlineOffset: -2,
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

      {/* ══ ROW 2 — Actions + Nav + Toggles ══════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        padding: '10px 24px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>

        {/* LEFT group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Add button */}
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
                  ['Add Task',        () => handleAddTask('task')],
                  ['Add Sub-task',    () => handleAddTask('task', true)],
                  ['Add Work Stream', () => handleAddTask('project')],
                  ['Add Milestone',   () => handleAddTask('milestone')],
                ].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={dropdownItem}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Baseline button */}
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

          {/* More button */}
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

        {/* RIGHT group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* < Today > nav */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #e2e8f0', borderRadius: 8,
            overflow: 'hidden', background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <button onClick={handleScrollLeft} style={{
              ...iconBtnBase, borderRadius: 0, border: 'none',
              borderRight: '1px solid #e2e8f0',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            ><ChevronLeft size={14} /></button>

            <button onClick={handleScrollToday} style={{
              height: 34, padding: '0 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#ffffff', border: 'none',
              borderRight: '1px solid #e2e8f0',
              cursor: 'pointer', color: '#374151',
              fontSize: 12, fontWeight: 700,
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <Calendar size={13} color="#94a3b8" />
              Today
            </button>

            <button onClick={handleScrollRight} style={{
              ...iconBtnBase, borderRadius: 0, border: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            ><ChevronRight size={14} /></button>
          </div>

          {/* Checkboxes */}
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

      {/* ══ Gantt chart area ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>

    </div>
  )
}

export default GanttChart
