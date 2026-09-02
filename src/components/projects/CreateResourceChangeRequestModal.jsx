import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Upload,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Briefcase,
  Sliders,
} from 'lucide-react'
import { createResourceChangeRequest } from '../../data/resourceChangeRequestsData'
import { API_ENDPOINTS } from '../../config/api'

const DEFAULT_WORKING_DAYS = ['M', 'T', 'W', 'T', 'F']

export default function CreateResourceChangeRequestModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}) {
  // Extract initial project resources
  const initialResources = useMemo(() => {
    if (!project) return []
    let list = []
    if (Array.isArray(project.resourcesAllocated) && project.resourcesAllocated.length > 0) {
      list = project.resourcesAllocated.map((r, idx) => ({
        srNo: idx + 1,
        id: r.id || `res-${idx + 101}`,
        resourceName: r.name || r.resource_name || `Resource ${idx + 1}`,
        role: r.role || 'Developer',
        allocation: Number(r.allocation) || 100,
        workingDays: r.workingDays || DEFAULT_WORKING_DAYS,
        change: 'Unchanged',
        isNew: false,
      }))
    } else if (project.resource_allocations) {
      try {
        const parsed = typeof project.resource_allocations === 'string'
          ? JSON.parse(project.resource_allocations)
          : project.resource_allocations
        if (Array.isArray(parsed)) {
          let count = 1
          parsed.forEach((group) => {
            if (group.type !== 'Cost' && Array.isArray(group.rows)) {
              group.rows.forEach((row) => {
                if (row.resourceName) {
                  list.push({
                    srNo: count++,
                    id: row.id || row.resource_id || `res-${count + 100}`,
                    resourceName: row.resourceName,
                    role: row.role || group.type || 'Developer',
                    allocation: Number(row.allocation) || 100,
                    workingDays: DEFAULT_WORKING_DAYS,
                    change: 'Unchanged',
                    isNew: false,
                  })
                }
              })
            }
          })
        }
      } catch (e) {}
    }

    if (list.length === 0) {
      list = [
        {
          srNo: 1,
          id: 'res-101',
          resourceName: project.project_manager || 'Lead Developer',
          role: 'Full Stack Developer',
          allocation: 100,
          workingDays: DEFAULT_WORKING_DAYS,
          change: 'Unchanged',
          isNew: false,
        },
      ]
    }
    return list
  }, [project])

  const [requestedList, setRequestedList] = useState(initialResources)
  const [priority, setPriority] = useState('High')
  const [department, setDepartment] = useState('Engineering / IT')
  const [reason, setReason] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orgResources, setOrgResources] = useState([])

  // Load organizational resource master for autocomplete
  useEffect(() => {
    async function fetchOrgResources() {
      try {
        const res = await fetch(API_ENDPOINTS.RESOURCE_LIST)
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setOrgResources(data.data)
        }
      } catch (err) {
        console.warn('Could not fetch org resources:', err)
      }
    }
    fetchOrgResources()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setRequestedList(initialResources)
      setReason('')
      setError('')
      setAttachments([])
    }
  }, [isOpen, initialResources])

  // Add new resource row
  const handleAddNewResource = () => {
    const newSrNo = requestedList.length + 1
    const newRow = {
      srNo: newSrNo,
      id: `new-res-${Date.now()}`,
      resourceName: '',
      role: 'UI Developer',
      allocation: 100,
      workingDays: DEFAULT_WORKING_DAYS,
      change: 'Added',
      isNew: true,
    }
    setRequestedList((prev) => [...prev, newRow])
  }

  // Update resource allocation
  const handleUpdateAllocation = (index, newAlloc) => {
    const val = Math.max(0, Math.min(100, Number(newAlloc) || 0))
    setRequestedList((prev) => {
      const next = [...prev]
      const item = next[index]
      const original = initialResources.find((r) => r.id === item.id)
      let changeStatus = item.change
      if (!item.isNew) {
        if (original && original.allocation === val) {
          changeStatus = 'Unchanged'
        } else {
          changeStatus = 'Modified'
        }
      }
      next[index] = { ...item, allocation: val, change: changeStatus }
      return next
    })
  }

  // Update resource field (name, role)
  const handleUpdateField = (index, field, value) => {
    setRequestedList((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  // Toggle remove resource
  const handleToggleRemove = (index) => {
    setRequestedList((prev) => {
      const next = [...prev]
      const item = next[index]
      if (item.isNew) {
        // If it was just added in this session, remove from list completely
        return next.filter((_, i) => i !== index)
      }
      // If it is existing, mark as 'Removed' or revert back to 'Unchanged'
      if (item.change === 'Removed') {
        next[index] = { ...item, change: 'Unchanged' }
      } else {
        next[index] = { ...item, change: 'Removed' }
      }
      return next
    })
  }

  // File upload simulation
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newAtts = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        uploaded_at: new Date().toISOString(),
      }))
      setAttachments((prev) => [...prev, ...newAtts])
    }
  }

  const handleRemoveAttachment = (attId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId))
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!reason.trim()) {
      setError('Please provide a justification / reason for the PMO to review.')
      return
    }

    const hasIncompleteNew = requestedList.some(
      (r) => r.isNew && (!r.resourceName.trim() || !r.role.trim())
    )
    if (hasIncompleteNew) {
      setError('Please provide name and role for all newly added resources.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        projectId: project.project_code || project.code || `PJ-${project.id}`,
        projectName: project.project_name || project.name || 'Current Project',
        projectManager: project.project_manager || project.pm || 'Ashutosh (PM)',
        projectManagerEmail: 'pm@workxkloud.com',
        priority,
        department,
        reasonProvidedByPM: reason.trim(),
        requestSummary: `PM has requested resource changes (${requestedList.filter((r) => r.change !== 'Unchanged').length} changes)`,
        currentAllocation: initialResources,
        requestedAllocation: requestedList,
        attachments,
        dueDate: project.end_date || project.deadline || '',
        dueDateFormatted: project.end_date || project.deadline || '30 Jun 2026',
        startDate: project.start_date || project.plannedStartDate || '',
        startDateFormatted: project.start_date || project.plannedStartDate || '15 Jan 2025',
        budget: project.budget || 0,
        projectType: project.project_type || 'Software',
        methodology: project.methodology || 'Agile Scrum',
      }

      const created = await createResourceChangeRequest(payload)
      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err) {
      console.error('Failed to submit resource change request:', err)
      setError('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const changeCounts = useMemo(() => {
    const added = requestedList.filter((r) => r.change === 'Added').length
    const modified = requestedList.filter((r) => r.change === 'Modified').length
    const removed = requestedList.filter((r) => r.change === 'Removed').length
    return { added, modified, removed }
  }, [requestedList])

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Users size={20} strokeWidth={2.3} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Request Resource Change
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  PM to PMO
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {project.project_name || 'Project'} • {project.project_code || 'PJ-2026'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs font-bold text-rose-700">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Department & Priority Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="High">High (Urgent PMO Review)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition"
              >
                <option value="Engineering / IT">Engineering / IT</option>
                <option value="Product & Design">Product & Design</option>
                <option value="QA & Testing">QA & Testing</option>
                <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
              </select>
            </div>
          </div>

          {/* Staffing Allocation List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Staffing & Allocation Changes
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Adjust allocation % or add/remove team members.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddNewResource}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 transition cursor-pointer shadow-2xs"
              >
                <UserPlus size={14} />
                <span>+ Add Resource</span>
              </button>
            </div>

            <div className="space-y-3">
              {requestedList.map((item, idx) => {
                const isRemoved = item.change === 'Removed'
                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      isRemoved
                        ? 'border-rose-200 bg-rose-50/40 opacity-60'
                        : item.change === 'Added'
                        ? 'border-emerald-200 bg-emerald-50/40 shadow-xs'
                        : item.change === 'Modified'
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Name & Role Inputs */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.isNew ? (
                          <div>
                            <input
                              type="text"
                              placeholder="Resource Name (e.g. Aman Singh)"
                              value={item.resourceName}
                              onChange={(e) => handleUpdateField(idx, 'resourceName', e.target.value)}
                              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                              list="org-resources-list"
                            />
                            <datalist id="org-resources-list">
                              {orgResources.map((org) => (
                                <option key={org.id} value={org.name}>
                                  {org.name} ({org.role || 'Member'})
                                </option>
                              ))}
                            </datalist>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs font-bold text-slate-800">{item.resourceName}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.role}</p>
                          </div>
                        )}

                        {item.isNew ? (
                          <input
                            type="text"
                            placeholder="Role (e.g. UI Developer)"
                            value={item.role}
                            onChange={(e) => handleUpdateField(idx, 'role', e.target.value)}
                            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500"
                          />
                        ) : null}
                      </div>

                      {/* Allocation % Slider / Stepper */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-400">Alloc:</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="5"
                            disabled={isRemoved}
                            value={item.allocation}
                            onChange={(e) => handleUpdateAllocation(idx, e.target.value)}
                            className="w-16 h-8 text-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-100"
                          />
                          <span className="text-xs font-bold text-slate-500">%</span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            item.change === 'Added'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.change === 'Removed'
                              ? 'bg-rose-100 text-rose-800'
                              : item.change === 'Modified'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.change}
                        </span>

                        {/* Remove / Restore Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleRemove(idx)}
                          title={isRemoved ? 'Restore Resource' : 'Remove Resource'}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer ${
                            isRemoved
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Change Summary Pills */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
            <span className="font-bold text-slate-700">Planned Impact:</span>
            {changeCounts.added > 0 && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-bold">
                +{changeCounts.added} New
              </span>
            )}
            {changeCounts.modified > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 font-bold">
                {changeCounts.modified} Modified
              </span>
            )}
            {changeCounts.removed > 0 && (
              <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 font-bold">
                -{changeCounts.removed} Removed
              </span>
            )}
            {changeCounts.added === 0 && changeCounts.modified === 0 && changeCounts.removed === 0 && (
              <span className="text-slate-400">No changes made yet.</span>
            )}
          </div>

          {/* Reason / Justification (Mandatory) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Justification & Reason for PMO <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Critical milestone deadline requires an additional frontend developer. Ravi is overloaded on another client project..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* File Upload / Attachments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Attachments (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs">
                <Upload size={14} className="text-slate-500" />
                <span>Upload PDF / Document</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {attachments.map((att) => (
                <span
                  key={att.id}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800"
                >
                  <Paperclip size={12} />
                  <span>{att.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="ml-1 text-blue-400 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              <span>{isSubmitting ? 'Submitting to PMO...' : 'Submit Request to PMO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
