import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Building2,
  Calendar,
  Flag,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { getResourceChangeRequests } from '../data/resourceChangeRequestsData'

const STATUS_BADGES = {
  'Pending PMO Review': 'bg-[#fff8eb] text-[#d97706] border border-[#fde68a]',
  Approved: 'bg-[#e6f9ed] text-[#15803d] border border-[#bbf7d0]',
  Rejected: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
  'Clarification Requested': 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
}

const PRIORITY_STYLES = {
  High: 'text-[#ef4444] bg-[#fee2e2]',
  Medium: 'text-[#d97706] bg-[#fef3c7]',
  Low: 'text-[#16a34a] bg-[#dcfce7]',
}

function ResourceChangeRequestsListPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState(() => getResourceChangeRequests())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

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

  const refreshData = () => {
    setRequests(getResourceChangeRequests())
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = requests.length
    const pending = requests.filter(
      (r) => r.status === 'Pending PMO Review' || r.status === 'Clarification Requested'
    ).length
    const approved = requests.filter((r) => r.status === 'Approved').length
    const rejected = requests.filter((r) => r.status === 'Rejected').length

    return { total, pending, approved, rejected }
  }, [requests])

  // Filtered List
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectManager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' &&
          (item.status === 'Pending PMO Review' || item.status === 'Clarification Requested')) ||
        item.status === statusFilter

      const matchesPriority =
        priorityFilter === 'All' || item.priority.toLowerCase() === priorityFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [requests, searchQuery, statusFilter, priorityFilter])

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">
                Resource Change Requests
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete log and history of all staffing change requests submitted by Project Managers.
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
            onClick={() => navigate('/pmo/resource-approval-queue')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0052ff] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
          >
            Open PMO Approval Queue
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Requests</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{metrics.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All time logged</p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Pending Review</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{metrics.pending}</p>
          <p className="text-[11px] text-amber-700/80 mt-0.5">Requires PMO decision</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Approved</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{metrics.approved}</p>
          <p className="text-[11px] text-emerald-700/80 mt-0.5">Allocations active</p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Rejected</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <XCircle size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-900">{metrics.rejected}</p>
          <p className="text-[11px] text-rose-700/80 mt-0.5">Returned to PM</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Request ID, Project, or PM..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter size={14} />
            <span className="font-semibold">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Clarification Requested">Clarification</option>
          </select>

          {/* Priority Filter */}
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

      {/* Requests Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Project Manager</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Requested On</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/pmo/resource-requests/${item.id}`)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <span className="text-[#0052ff] group-hover:underline">{item.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{item.projectName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.projectId}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {item.projectManager}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {item.department}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Medium
                          }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {item.requestedOnFormatted}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[item.status] || STATUS_BADGES['Pending PMO Review']
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/pmo/resource-requests/${item.id}`)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
                      >
                        <Eye size={13} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No resource change requests found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ResourceChangeRequestsListPage
