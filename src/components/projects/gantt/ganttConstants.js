// Link type constants
// dhtmlx-gantt: 0 = FS, 1 = SS, 2 = FF, 3 = SF
export const LINK_FS = 0
export const LINK_SS = 1
export const LINK_FF = 2
export const LINK_SF = 3

// Per-column *minimum* widths, sized to what each column's own content
// actually needs (a date like "31 Dec '26", a duration like "999 d", a
// WBS index) rather than an arbitrary round number. `text` (Task Name) is
// the one column that isn't fixed at all — it's registered with
// width: '*' so dhtmlx gives it whatever space is left over in the grid
// pane, growing and shrinking as the pane is resized. These minimums are
// still what stand between a usable grid and dhtmlx silently rendering a
// column's cells blank (see getGridWidth below) — dhtmlx doesn't
// gracefully reflow column content below its configured min_width, it
// just fails to draw it, so the grid pane must never be asked to be
// narrower than the sum of whatever columns are actually visible.
export const COLUMN_WIDTHS = {
  wbs_code: 38,
  text: 130, // minimum only — the column itself flexes (width: '*')
  start_date: 78,
  end_date: 78,
  duration: 50,
  assignees: 96,
  predecessors: 68,
  dependency_type: 68,
}

// Columns shown on narrow (phone-width) screens. Resource/Predecessor/
// Dependency info isn't lost when hidden here — it's already surfaced by
// the row tooltip (gantt.templates.tooltip_text) and the assignee label
// already rendered next to each task bar (rightside_text); this just
// keeps the always-visible grid from claiming more of a phone screen than
// the timeline it's supposed to sit beside.
export const MOBILE_COLUMN_KEYS = ['wbs_code', 'text', 'start_date', 'end_date', 'duration']

// Sums the *visible* columns' minimum widths for the given viewport —
// mobile only counts its reduced column set, so the grid pane's floor
// shrinks along with what's actually on screen instead of always
// reserving room for all 8 desktop columns.
export function getGridWidth(isMobile) {
  const keys = isMobile ? MOBILE_COLUMN_KEYS : Object.keys(COLUMN_WIDTHS)
  return keys.reduce((sum, key) => sum + COLUMN_WIDTHS[key], 0)
}

// Smallest the timeline pane can be while still showing a usable slice of
// dates + task bars, once the grid has already claimed its width.
export const CHART_MIN_WIDTH = 320
export const CHART_MIN_WIDTH_MOBILE = 200

export const SCHEDULE_BAR_CLASSES = [
  'gantt-bar-blue', 'gantt-bar-purple', 'gantt-bar-green', 'gantt-bar-pink',
  'gantt-bar-dark-blue', 'gantt-bar-dark-purple', 'gantt-bar-dark-green', 'gantt-bar-dark-pink',
]
export const SCHEDULE_BORDER_CLASSES = [
  'border-left-blue', 'border-left-purple', 'border-left-green', 'border-left-pink',
  'border-left-blue', 'border-left-purple', 'border-left-green', 'border-left-pink',
]

// Inline style helpers shared across the toolbar and its dropdowns.
export const btnBase = {
  display: 'flex', alignItems: 'center', gap: 6,
  height: 34, borderRadius: 8, fontSize: 12,
  fontWeight: 600, cursor: 'pointer',
  border: '1px solid #e2e8f0',
  background: '#ffffff', color: '#374151',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  transition: 'background 0.15s',
  padding: '0 12px',
}
export const iconBtnBase = {
  width: 34, height: 34,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#ffffff', border: '1px solid #e2e8f0',
  borderRadius: 8, cursor: 'pointer', color: '#64748b',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}
export const dropdownMenu = {
  position: 'absolute', top: '100%', left: 0, marginTop: 6,
  background: '#ffffff', border: '1px solid #e2e8f0',
  borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
  zIndex: 200, padding: '4px 0', fontSize: 12, minWidth: 160,
}
export const dropdownItem = {
  width: '100%', textAlign: 'left',
  padding: '8px 16px', background: 'none',
  border: 'none', cursor: 'pointer',
  color: '#374151', fontWeight: 600, fontSize: 12,
}
