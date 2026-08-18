import { createPortal } from 'react-dom'
import {
  Plus, Settings, Printer, ChevronDown, ChevronLeft, ChevronRight,
  Check, Calendar, FileText, MoreHorizontal, Trash2, Snowflake, Lock,
} from 'lucide-react'
import { btnBase, iconBtnBase, dropdownMenu, dropdownItem } from './ganttConstants'
import { WORKFLOW_STATUS } from '../../../utils/scheduleWorkflow'

const stopProp = (e) => e.stopPropagation()

function GanttToolbar({
  isMobile,
  projectName,
  scheduleSearch,
  onSearchChange,
  calendarType,
  onCalendarTypeChange,
  customDropdownOpen,
  onToggleCustomDropdown,
  customWorkingDays,
  onCustomWorkingDaysChange,
  includeHolidays,
  onIncludeHolidaysChange,
  zoomLevel,
  onZoomChange,

  workflowStatus,
  workflowStatusMeta,
  isScheduleLocked,

  addOpen,
  addWrapRef,
  onToggleAdd,
  onOpenAddTaskModal,

  onDeleteClick,
  onOutdent,
  onIndent,

  baselineOpen,
  baselineWrapRef,
  onToggleBaseline,
  activeBaseline,
  onSelectBaseline,

  moreOpen,
  moreWrapRef,
  onToggleMore,
  onExport,
  onClearAll,

  onScrollLeft,
  onScrollToday,
  onScrollRight,

  criticalPath,
  onCriticalPathChange,
  showGantt,
  onShowGanttChange,

  onOpenSettings,

  getMenuFixedStyle,
}) {
  return (
    <>
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
          <div className="search-container-wrapper" style={{ width: isMobile ? '100%' : 200, flexShrink: 0 }}>
            <input
              type="text"
              className="gantt-search-input"
              placeholder="Search tasks or resource…"
              value={scheduleSearch}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Calendar:</span>
                <select
                  value={calendarType}
                  onChange={(e) => onCalendarTypeChange(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                    fontSize: 12, fontWeight: 500, color: '#1e293b', outline: 'none',
                    background: '#f8fafc', cursor: 'pointer'
                  }}
                >
                  <option value="alldays">All Day (Mon-Sun)</option>
                  <option value="standard">Standard (Mon-Fri + Holidays)</option>
                  <option value="custom">Custom...</option>
                </select>
              </div>

              {calendarType === 'custom' && (
                <div style={{ position: 'relative' }} onMouseDown={stopProp}>
                  <button
                    onClick={onToggleCustomDropdown}
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
                              if (e.target.checked) onCustomWorkingDaysChange([...customWorkingDays, day.val])
                              else onCustomWorkingDaysChange(customWorkingDays.filter(d => d !== day.val))
                            }} style={{ width: 14, height: 14, accentColor: '#3b82f6' }} />
                            {day.label}
                          </label>
                        )
                      })}
                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4, paddingTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                          <input type="checkbox" checked={includeHolidays} onChange={e => onIncludeHolidaysChange(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#3b82f6' }} />
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
                <button key={val} onClick={() => onZoomChange(val)} style={{
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

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'space-between',
        flexWrap: isMobile ? 'nowrap' : 'wrap', gap: isMobile ? 8 : 12,
        padding: isMobile ? '8px 12px' : '10px 24px',
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            whiteSpace: 'nowrap',
            ...(() => {
              if (workflowStatus === WORKFLOW_STATUS.APPROVED) return { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }
              if (workflowStatus === WORKFLOW_STATUS.FROZEN_PENDING_REVIEW) return { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }
              if (workflowStatus === WORKFLOW_STATUS.REJECTED) return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }
              return { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }
            })()
          }} title={workflowStatusMeta?.description}>
            {isScheduleLocked ? <Lock size={11} /> : <Snowflake size={11} />}
            {!isMobile && workflowStatusMeta?.label}
          </div>

          <div style={{ width: 1, height: 20, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Add */}
          <div ref={addWrapRef} style={{ position: 'relative' }} onMouseDown={stopProp}>
            <button onClick={() => { if (isScheduleLocked) return; onToggleAdd() }}
              disabled={isScheduleLocked}
              style={{
                ...btnBase, padding: '0 14px',
                background: isScheduleLocked ? '#93c5fd' : '#2563eb', color: '#ffffff',
                border: 'none', fontWeight: 700, cursor: isScheduleLocked ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(37,99,235,0.30)',
              }}
              onMouseEnter={e => { if (!isScheduleLocked) e.currentTarget.style.background = '#1d4ed8' }}
              onMouseLeave={e => { if (!isScheduleLocked) e.currentTarget.style.background = '#2563eb' }}
            >
              <Plus size={14} strokeWidth={2.5} />
              {!isMobile && 'Add'}
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
            {addOpen && createPortal(
              <div onMouseDown={stopProp} style={getMenuFixedStyle()}>
                {[
                  ['Add Task', () => onOpenAddTaskModal('task')],
                  ['Add Sub-task', () => onOpenAddTaskModal('task', true)],
                  ['Add Work Stream', () => onOpenAddTaskModal('project')],
                  ['Add Milestone', () => onOpenAddTaskModal('milestone')],
                ].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={dropdownItem}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{label}</button>
                ))}
              </div>,
              document.body
            )}
          </div>

          {/* Delete */}
          <button
            onClick={isScheduleLocked ? undefined : onDeleteClick}
            disabled={isScheduleLocked}
            style={{
              ...btnBase,
              background: isScheduleLocked ? '#fca5a5' : '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: isScheduleLocked ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px rgba(239,68,68,0.30)',
            }}
            onMouseEnter={e => { if (!isScheduleLocked) e.currentTarget.style.background = '#dc2626' }}
            onMouseLeave={e => { if (!isScheduleLocked) e.currentTarget.style.background = '#ef4444' }}
          >
            <Trash2 size={14} strokeWidth={2.5} />
            {!isMobile && 'Delete'}
          </button>

          {/* Indent / Outdent */}
          <button onClick={isScheduleLocked ? undefined : onOutdent} title="Outdent (move task up in hierarchy)"
            disabled={isScheduleLocked}
            style={{ ...btnBase, cursor: isScheduleLocked ? 'not-allowed' : 'pointer', opacity: isScheduleLocked ? 0.5 : 1 }}
            onMouseEnter={e => { if (!isScheduleLocked) e.currentTarget.style.background = '#f1f5f9' }}
            onMouseLeave={e => { if (!isScheduleLocked) e.currentTarget.style.background = '#ffffff' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 8 3 12 7 16" /><line x1="21" y1="12" x2="3" y2="12" /></svg>
          </button>
          <button onClick={isScheduleLocked ? undefined : onIndent} title="Indent (make child of task above)"
            disabled={isScheduleLocked}
            style={btnBase}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 8 21 12 17 16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>
          </button>

          {/* Baseline */}
          {!isMobile && (
            <div ref={baselineWrapRef} style={{ position: 'relative' }} onMouseDown={stopProp}>
              <button onClick={onToggleBaseline}
                style={btnBase}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                <FileText size={14} color="#94a3b8" />
                <span>Baseline:&nbsp;<span style={{ color: '#2563eb', fontWeight: 700 }}>{activeBaseline}</span></span>
                <ChevronDown size={12} color="#94a3b8" />
              </button>
              {baselineOpen && createPortal(
                <div onMouseDown={stopProp} style={getMenuFixedStyle({ minWidth: 180 })}>
                  {['Baseline 1', 'Baseline 2 (Proposed)', 'Baseline 3'].map(item => (
                    <button key={item}
                      onClick={() => onSelectBaseline(item)}
                      style={{ ...dropdownItem, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {item}
                      {activeBaseline === item && <Check size={12} color="#2563eb" />}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </div>
          )}

          {/* More */}
          <div ref={moreWrapRef} style={{ position: 'relative' }} onMouseDown={stopProp}>
            <button onClick={onToggleMore}
              style={btnBase}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              <MoreHorizontal size={14} color="#94a3b8" />
              {!isMobile && 'More'}
              <ChevronDown size={12} color="#94a3b8" />
            </button>
            {moreOpen && createPortal(
              <div onMouseDown={stopProp} style={getMenuFixedStyle()}>
                {isMobile && (
                  <>
                    <div style={{ padding: '6px 16px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Calendar</div>
                    <div style={{ padding: '2px 16px 8px' }}>
                      <select
                        value={calendarType}
                        onChange={(e) => onCalendarTypeChange(e.target.value)}
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
                {[['Export to PDF', () => onExport('pdf')], ['Export to PNG', () => onExport('png')]].map(([label, fn]) => (
                  <button key={label} onClick={fn} style={dropdownItem}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >{label}</button>
                ))}
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                <button onClick={onClearAll} style={{ ...dropdownItem, color: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >Clear All Tasks</button>
              </div>,
              document.body
            )}
          </div>

          {/* Nav (moved into the scrollable strip on mobile so it's never dropped) */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #e2e8f0', borderRadius: 8,
            overflow: 'hidden', background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexShrink: 0,
          }}>
            <button onClick={onScrollLeft} style={{ ...iconBtnBase, borderRadius: 0, border: 'none', borderRight: '1px solid #e2e8f0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            ><ChevronLeft size={14} /></button>

            <button onClick={onScrollToday} style={{
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

            <button onClick={onScrollRight} style={{ ...iconBtnBase, borderRadius: 0, border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            ><ChevronRight size={14} /></button>
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={criticalPath}
                  onChange={e => onCriticalPathChange(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                Critical path
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#1e293b', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={showGantt}
                  onChange={e => onShowGanttChange(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
                />
                Gantt
              </label>
            </div>
          )}

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 16, borderLeft: '1px solid #e2e8f0', height: 34 }}>
              <button onClick={onOpenSettings} title="Settings" style={iconBtnBase}
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
    </>
  )
}

export default GanttToolbar
