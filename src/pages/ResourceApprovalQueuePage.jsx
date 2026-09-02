import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import {
  Inbox,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Eye,
  Building2,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  FileCheck2,
  MessageSquareQuote,
  X,
  AlertTriangle,
} from 'lucide-react'
import {
  getResourceChangeRequests,
  approveResourceChangeRequest,
  rejectResourceChangeRequest,
  clarifyResourceChangeRequest,
} from '../data/resourceChangeRequestsData'

const PRIORITY_BADGES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
}

const STATUS_PILLS = {
  'Pending PMO Review': {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  'Clarification Requested': {
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: HelpCircle,
  },
  Approved: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  Rejected: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: XCircle,
  },
}

function ResourceApprovalQueuePage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState(() => getResourceChangeRequests())
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [queueTab, setQueueTab] = useState('pending') // 'pending' | 'high_priority' | 'clarification' | 'history'

  useEffect(() => {
    const handleSync = () => setRequests(getResourceChangeRequests())
    window.addEventListener('resource-requests-updated', handleSync)
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    return () => {
      window.removeEventListener('resource-requests-updated', handleSync)
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [])

  // Modal State for Quick Actions
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'approve' | 'reject' | 'clarify'
    request: null,
    note: '',
    error: '',
  })

  const refreshData = () => {
    setRequests(getResourceChangeRequests())
  }

  // Active Queue items (requiring review)
  const pendingQueue = useMemo(() => {
    return requests.filter(
      (r) => r.status === 'Pending PMO Review' || r.status === 'Clarification Requested'
    )
  }, [requests])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalPending = pendingQueue.length
    const highPriorityPending = pendingQueue.filter((r) => r.priority === 'High').length
    const awaitingClarification = requests.filter((r) => r.status === 'Clarification Requested').length
    const actionedRecently = requests.filter(
      (r) => r.status === 'Approved' || r.status === 'Rejected'
    ).length

    return { totalPending, highPriorityPending, awaitingClarification, actionedRecently }
  }, [requests, pendingQueue])

  // Filtered Queue List
  const filteredQueue = useMemo(() => {
    return requests.filter((item) => {
      // Tab based filtering
      if (queueTab === 'pending') {
        if (item.status !== 'Pending PMO Review' && item.status !== 'Clarification Requested') {
          return false
        }
      } else if (queueTab === 'high_priority') {
        if (
          (item.status !== 'Pending PMO Review' && item.status !== 'Clarification Requested') ||
          item.priority !== 'High'
        ) {
          return false
        }
      } else if (queueTab === 'clarification') {
        if (item.status !== 'Clarification Requested') {
          return false
        }
      } else if (queueTab === 'history') {
        if (item.status === 'Pending PMO Review') {
          return false
        }
      }

      // Search Query
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectManager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectId.toLowerCase().includes(searchQuery.toLowerCase())

      // Department Filter
      const matchesDepartment =
        departmentFilter === 'All' || item.department.toLowerCase() === departmentFilter.toLowerCase()

      // Priority Filter
      const matchesPriority =
        priorityFilter === 'All' || item.priority.toLowerCase() === priorityFilter.toLowerCase()

      return matchesSearch && matchesDepartment && matchesPriority
    })
  }, [requests, queueTab, searchQuery, departmentFilter, priorityFilter])

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(requests.map((r) => r.department).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [requests])

  // Quick Action Handlers
  const handleOpenAction = (type, request, e) => {
    if (e) e.stopPropagation()
    setActionModal({
      isOpen: true,
      type,
      request,
      note: '',
      error: '',
    })
  }

  const handleCloseModal = () => {
    setActionModal({
      isOpen: false,
      type: null,
      request: null,
      note: '',
      error: '',
    })
  }

  const handleConfirmAction = () => {
    const { type, request, note } = actionModal
    if (!request) return

    if (type === 'reject' && !note.trim()) {
      setActionModal((prev) => ({ ...prev, error: 'Rejection reason is required.' }))
      return
    }

    if (type === 'clarify' && !note.trim()) {
      setActionModal((prev) => ({ ...prev, error: 'Please enter clarification query for the PM.' }))
      return
    }

    if (type === 'approve') {
      approveResourceChangeRequest(request.id, note.trim())
    } else if (type === 'reject') {
      rejectResourceChangeRequest(request.id, note.trim())
    } else if (type === 'clarify') {
      clarifyResourceChangeRequest(request.id, note.trim())
    }

    handleCloseModal()
    refreshData()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0052ff] to-blue-400 text-white shadow-md shadow-blue-500/20">
              <Inbox size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">
                  Resource Approval Queue
                </h1>
                {metrics.totalPending > 0 && (
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    {metrics.totalPending} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized queue of staffing change requests requiring PMO review, allocation adjustment, and authorization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <BackButton fallbackUrl="/dashboard" label="Back to Dashboard" />
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/pmo/resource-requests')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            <FileCheck2 size={15} />
            All Change Requests Log
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          onClick={() => setQueueTab('pending')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            queueTab === 'pending'
              ? 'border-blue-500/80 bg-blue-50/50 ring-2 ring-blue-500/20'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">In Active Queue</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Clock size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{metrics.totalPending}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Awaiting decision</p>
        </div>

        <div
          onClick={() => setQueueTab('high_priority')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            queueTab === 'high_priority'
              ? 'border-rose-500/80 bg-rose-50/50 ring-2 ring-rose-500/20'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">High Priority SLA</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-900">{metrics.highPriorityPending}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Urgent PM requests</p>
        </div>

        <div
          onClick={() => setQueueTab('clarification')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            queueTab === 'clarification'
              ? 'border-indigo-500/80 bg-indigo-50/50 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800">With PM for Query</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <HelpCircle size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-900">{metrics.awaitingClarification}</p>
          <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Clarification requested</p>
        </div>

        <div
          onClick={() => setQueueTab('history')}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-xs ${
            queueTab === 'history'
              ? 'border-emerald-500/80 bg-emerald-50/50 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Actioned Records</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{metrics.actionedRecently}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Approved & Rejected</p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setQueueTab('pending')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              queueTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock size={14} />
            Pending PMO Queue ({metrics.totalPending})
          </button>
          <button
            type="button"
            onClick={() => setQueueTab('high_priority')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              queueTab === 'high_priority'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle size={14} />
            High Priority ({metrics.highPriorityPending})
          </button>
          <button
            type="button"
            onClick={() => setQueueTab('clarification')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              queueTab === 'clarification'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle size={14} />
            Awaiting PM Reply ({metrics.awaitingClarification})
          </button>
          <button
            type="button"
            onClick={() => setQueueTab('history')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              queueTab === 'history'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 size={14} />
            Actioned Log ({metrics.actionedRecently})
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Queue by Request ID, Project, or PM..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter size={14} />
              <span className="font-semibold">Department:</span>
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Items Table / List */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Request & Project</th>
                <th className="py-3.5 px-4">Project Manager</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Change Summary</th>
                <th className="py-3.5 px-4">Submitted On</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Quick PMO Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQueue.length > 0 ? (
                filteredQueue.map((item) => {
                  const statusConfig = STATUS_PILLS[item.status] || STATUS_PILLS['Pending PMO Review']
                  const StatusIcon = statusConfig.icon

                  const addedCount = (item.requestedAllocation || []).filter((r) => r.change === 'Added').length
                  const modifiedCount = (item.requestedAllocation || []).filter((r) => r.change === 'Modified').length

                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/pmo/resource-requests/${item.id}`)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      {/* Request & Project */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0052ff] group-hover:underline">{item.id}</span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                            {item.department}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1">{item.projectName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{item.projectId}</p>
                      </td>

                      {/* PM */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {item.projectManager
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{item.projectManager}</p>
                            <p className="text-[11px] text-slate-400">{item.projectManagerEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.Medium
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* Summary */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-slate-700 line-clamp-1 font-medium">
                          {item.requestSummary || item.reasonProvidedByPM || 'Allocation revision requested'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {addedCount > 0 && (
                            <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              +{addedCount} added
                            </span>
                          )}
                          {modifiedCount > 0 && (
                            <span className="inline-flex rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                              {modifiedCount} updated
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Submitted On */}
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {item.requestedOnFormatted}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.badge}`}
                        >
                          <StatusIcon size={13} />
                          {item.status}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'Pending PMO Review' || item.status === 'Clarification Requested' ? (
                            <>
                              <button
                                type="button"
                                title="Quick Approve"
                                onClick={(e) => handleOpenAction('approve', item, e)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs cursor-pointer"
                              >
                                <CheckCircle2 size={15} />
                              </button>
                              <button
                                type="button"
                                title="Quick Reject"
                                onClick={(e) => handleOpenAction('reject', item, e)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-2xs cursor-pointer"
                              >
                                <XCircle size={15} />
                              </button>
                              <button
                                type="button"
                                title="Ask PM for Clarification"
                                onClick={(e) => handleOpenAction('clarify', item, e)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs cursor-pointer"
                              >
                                <HelpCircle size={15} />
                              </button>
                            </>
                          ) : null}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/pmo/resource-requests/${item.id}`)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-600 hover:text-white transition shadow-2xs cursor-pointer"
                          >
                            <Eye size={13} />
                            Full Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <ShieldCheck size={28} />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-700">All Caught Up in PMO Queue!</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No pending resource change requests matching your selected filters require PMO action right now.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQueueTab('pending')
                          setSearchQuery('')
                          setDepartmentFilter('All')
                          setPriorityFilter('All')
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Modal */}
      {actionModal.isOpen && actionModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                {actionModal.type === 'approve' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>
                )}
                {actionModal.type === 'reject' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <XCircle size={20} />
                  </div>
                )}
                {actionModal.type === 'clarify' && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <HelpCircle size={20} />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {actionModal.type === 'approve' && 'Approve Resource Request'}
                    {actionModal.type === 'reject' && 'Reject Resource Request'}
                    {actionModal.type === 'clarify' && 'Request Clarification from PM'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {actionModal.request.id} • {actionModal.request.projectName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {actionModal.type === 'approve' && 'Approval Note / Instructions (Optional)'}
                {actionModal.type === 'reject' && 'Reason for Rejection (Mandatory)'}
                {actionModal.type === 'clarify' && 'Query for Project Manager (Mandatory)'}
              </label>
              <textarea
                rows={4}
                value={actionModal.note}
                onChange={(e) => setActionModal((prev) => ({ ...prev, note: e.target.value, error: '' }))}
                placeholder={
                  actionModal.type === 'approve'
                    ? 'e.g. Approved. New resources should initiate onboarding with PM immediately.'
                    : actionModal.type === 'reject'
                    ? 'e.g. Requested resource is currently locked on client delivery till next quarter.'
                    : 'e.g. Please clarify why an additional QA engineer is required at milestone 2.'
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {actionModal.error && (
                <p className="mt-1 text-xs font-semibold text-rose-600">{actionModal.error}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition ${
                  actionModal.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionModal.type === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionModal.type === 'approve' && 'Confirm Approval'}
                {actionModal.type === 'reject' && 'Confirm Rejection'}
                {actionModal.type === 'clarify' && 'Send Query to PM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceApprovalQueuePage
