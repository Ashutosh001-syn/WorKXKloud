import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  FolderKanban,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Edit2,
  CheckCircle2,
} from 'lucide-react'
import {
  fetchProjectAssignedResources,
  validateResourceInProject,
  parseMultiResourceString,
  formatMultiResourceString,
} from '../../../services/projectResourceService'

function GanttTaskModal({
  open,
  data,
  onChange,
  onClose,
  onSubmit,
  isSaving,
  projectResourceNames = [],
  projects = [],
  currentProjectId = null,
}) {
  if (!open || !data) return null

  // Active Project ID (either from data, props, or current Gantt context)
  const activeProjectId = data.projectId || currentProjectId || null

  const [projectResources, setProjectResources] = useState(() => {
    if (Array.isArray(projectResourceNames) && projectResourceNames.length > 0) {
      return projectResourceNames.map((item) =>
        typeof item === 'string'
          ? { id: item, name: item, role: 'Team Member', allocation: 100 }
          : item
      )
    }
    return []
  })

  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourcesError, setResourcesError] = useState('')
  const [validationError, setValidationError] = useState('')
  const activeFetchIdRef = useRef(0)

  // Fetch project resources when activeProjectId changes
  useEffect(() => {
    if (!activeProjectId) {
      setProjectResources([])
      setResourcesLoading(false)
      return
    }

    const fetchId = ++activeFetchIdRef.current
    setResourcesLoading(true)
    setResourcesError('')

    fetchProjectAssignedResources(activeProjectId)
      .then((resources) => {
        // Prevent race condition if user rapidly switched projects
        if (fetchId !== activeFetchIdRef.current) return

        setProjectResources(resources)
        setResourcesLoading(false)

        // If current selected resource does not belong to new project, clear it
        if (data.assignees && !validateResourceInProject(data.assignees, resources)) {
          onChange({ ...data, assignees: '' })
        }
      })
      .catch((err) => {
        if (fetchId !== activeFetchIdRef.current) return
        console.error('Error fetching project resources:', err)
        setResourcesError('Failed to load project resources.')
        setResourcesLoading(false)
      })
  }, [activeProjectId])

  // Handle Project Selection Change
  const handleProjectChange = (newProjId) => {
    setValidationError('')
    onChange({
      ...data,
      projectId: newProjId,
      assignees: '', // Reset selected resource on project change
    })
  }

  // Handle Form Submission with Validation
  const handleFormSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    // Validation: Resource must be from assigned project resources if it's a task
    if (data.type === 'task') {
      if (!data.assignees) {
        if (projectResources.length > 0) {
          setValidationError('Please select an assigned resource for this task.')
          return
        }
      } else if (
        projectResources.length > 0 &&
        !validateResourceInProject(data.assignees, projectResources)
      ) {
        setValidationError(
          `"${data.assignees}" is not assigned to this project by PMO. Please select a valid resource.`
        )
        return
      }
    }

    onSubmit(e)
  }

  const isMilestone = data.type === 'milestone'
  const isWorkStream = data.type === 'project'
  const isSubTask = data.type === 'task' && data.isSubTaskFlag

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              {data.isEditing ? <Edit2 size={18} /> : <Plus size={20} />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 capitalize">
                {data.isEditing ? 'Edit' : 'Add'}{' '}
                {isWorkStream ? 'Work Stream' : isSubTask ? 'Sub-task' : isMilestone ? 'Milestone' : 'Task'}
              </h3>
              {isSubTask && data.parentName && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Parent Task:{' '}
                  <span className="font-semibold text-slate-700">{data.parentName}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Validation Banner */}
          {validationError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{validationError}</p>
            </div>
          )}

          {/* Project Selector (when multi-project list is provided) */}
          {Array.isArray(projects) && projects.length > 0 && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <FolderKanban size={14} className="text-slate-400" />
                Project <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={activeProjectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="">— Select Project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name || p.name} ({p.project_code || `P-${p.id}`})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isWorkStream ? 'Work Stream Name' : 'Task Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.text || ''}
              onChange={(e) => {
                setValidationError('')
                onChange({ ...data, text: e.target.value })
              }}
              placeholder={isWorkStream ? 'e.g. Frontend Development' : 'e.g. Design System Implementation'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Dates & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Calendar size={14} className="text-slate-400" />
                Planned Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={data.start_date || ''}
                onChange={(e) => onChange({ ...data, start_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {!isMilestone && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock size={14} className="text-slate-400" />
                  Duration (Days) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={data.duration || ''}
                  onChange={(e) => onChange({ ...data, duration: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            )}
          </div>

          {/* Simplified Multi-Resource & Percentage Allocation */}
          {!isMilestone && !isWorkStream && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Users size={14} className="text-slate-400" />
                  Assign Resource(s) <span className="text-rose-500">*</span>
                </label>
                {resourcesLoading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
                    <Loader2 size={12} className="animate-spin" />
                    Loading...
                  </span>
                )}
              </div>

              {!activeProjectId ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-400">
                  Select project first
                </div>
              ) : resourcesLoading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-blue-600" />
                  Loading assigned resources...
                </div>
              ) : projectResources.length === 0 ? (
                <p className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5">
                  ⚠️ No resources assigned to this project yet.
                </p>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2 space-y-1">
                  <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
                    {projectResources.map((res) => {
                      const parsed = parseMultiResourceString(data.assignees || '')
                      const assignedItem = parsed.find(
                        (p) => p.name.toLowerCase() === res.name.trim().toLowerCase()
                      )
                      const isSelected = Boolean(assignedItem)
                      const currentPercent = assignedItem ? assignedItem.percent : 100

                      const toggleSelect = () => {
                        setValidationError('')
                        let updated = []
                        if (isSelected) {
                          updated = parsed.filter(
                            (p) => p.name.toLowerCase() !== res.name.trim().toLowerCase()
                          )
                        } else {
                          const currentSum = parsed.reduce((s, i) => s + (Number(i.percent) || 0), 0)
                          const remaining = Math.max(0, 100 - currentSum)
                          const defaultPercent = parsed.length === 0 ? 100 : (remaining > 0 ? remaining : 50)
                          updated = [...parsed, { name: res.name, percent: defaultPercent }]
                        }
                        onChange({ ...data, assignees: formatMultiResourceString(updated) })
                      }

                      const handlePercentChange = (val) => {
                        setValidationError('')
                        const num = val === '' ? 0 : Math.min(100, Math.max(0, parseInt(val, 10) || 0))
                        const updated = parsed.map((p) =>
                          p.name.toLowerCase() === res.name.trim().toLowerCase()
                            ? { ...p, percent: num }
                            : p
                        )
                        onChange({ ...data, assignees: formatMultiResourceString(updated) })
                      }

                      return (
                        <div
                          key={res.id || res.name}
                          onClick={(e) => {
                            if (e.target.tagName !== 'INPUT') toggleSelect()
                          }}
                          className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border border-blue-200 text-blue-950'
                              : 'bg-white border border-slate-100 hover:border-slate-200 text-slate-700'
                          }`}
                        >
                          {/* Checkbox & Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={toggleSelect}
                              className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs font-semibold truncate">
                              {res.name}{' '}
                              <span className="text-[10px] font-normal text-slate-400">
                                ({res.role || 'Member'})
                              </span>
                            </span>
                          </div>

                          {/* Inline % Share Box */}
                          {isSelected && (
                            <div
                              className="flex items-center gap-1 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={currentPercent}
                                onChange={(e) => handlePercentChange(e.target.value)}
                                className="w-12 h-6 rounded border border-blue-300 bg-white px-1 text-center text-xs font-bold text-blue-700 outline-none focus:border-blue-500"
                              />
                              <span className="text-[11px] font-bold text-slate-400">%</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Clean Bottom Summary Bar */}
                  {(() => {
                    const parsed = parseMultiResourceString(data.assignees || '')
                    if (parsed.length === 0) return null
                    const totalPercent = parsed.reduce((sum, item) => sum + (Number(item.percent) || 0), 0)

                    return (
                      <div className="flex items-center justify-between pt-1.5 px-1 border-t border-slate-200/70 text-[11px]">
                        <span className="text-slate-500 font-medium">
                          {parsed.length} selected &bull; Total: <b className={totalPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}>{totalPercent}%</b>
                        </span>
                        {parsed.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const even = Math.floor(100 / parsed.length)
                              const remainder = 100 - even * parsed.length
                              const rebalanced = parsed.map((p, idx) => ({
                                ...p,
                                percent: idx === 0 ? even + remainder : even,
                              }))
                              onChange({ ...data, assignees: formatMultiResourceString(rebalanced) })
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Split 100% Evenly
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              {resourcesError && (
                <p className="text-[11px] font-medium text-rose-600 mt-1">{resourcesError}</p>
              )}
            </div>
          )}

          {/* Predecessor (Optional for Task) */}
          {data.type === 'task' && !isSubTask && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Predecessor Dependency <span className="text-[11px] font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1, 2FS+2d, or task name"
                value={data.predecessor || ''}
                onChange={(e) => onChange({ ...data, predecessor: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (data.type === 'task' && projectResources.length === 0)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0052ff] hover:bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : data.isEditing ? (
                'Save Changes'
              ) : (
                'Add Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default GanttTaskModal
