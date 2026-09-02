import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Building2,
  Flag,
  FileText,
  Paperclip,
  Download,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Eye,
  X,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Send,
  FileDown,
  Info,
} from 'lucide-react'
import {
  getResourceChangeRequestById,
  approveResourceChangeRequest,
  rejectResourceChangeRequest,
  clarifyResourceChangeRequest,
} from '../data/resourceChangeRequestsData'

// Helpers
const CHANGE_BADGE_STYLES = {
  Added: 'bg-[#e6f9ed] text-[#15803d] border border-[#bbf7d0]',
  Removed: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
  Modified: 'bg-[#fff4e5] text-[#b45309] border border-[#fde68a]',
  Unchanged: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]',
}

const STATUS_BADGE_STYLES = {
  'Pending PMO Review': 'bg-[#fff8eb] text-[#d97706] border border-[#fde68a]',
  Approved: 'bg-[#e6f9ed] text-[#15803d] border border-[#bbf7d0]',
  Rejected: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
  'Clarification Requested': 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
}

function WorkingDaysPills({ days = ['M', 'T', 'W', 'T', 'F'] }) {
  const standardWeek = [
    { key: 'M1', label: 'M' },
    { key: 'T1', label: 'T' },
    { key: 'W1', label: 'W' },
    { key: 'T2', label: 'T' },
    { key: 'F1', label: 'F' },
  ]

  return (
    <div className="flex items-center gap-1">
      {standardWeek.map((item, idx) => (
        <span
          key={item.key}
          className="flex h-5 w-5 items-center justify-center rounded bg-[#3b82f6] text-[10px] font-bold text-white shadow-xs"
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}

function ResourceChangeRequestDetailPage() {
  const navigate = useNavigate()
  const { requestId } = useParams()

  const [request, setRequest] = useState(null)
  const [activeTab, setActiveTab] = useState('Change Request')
  const [toastMessage, setToastMessage] = useState(null)

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveNote, setApproveNote] = useState('')

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const [showClarifyModal, setShowClarifyModal] = useState(false)
  const [clarifyQuery, setClarifyQuery] = useState('')
  const [clarifyError, setClarifyError] = useState('')

  const [previewAttachment, setPreviewAttachment] = useState(null)

  useEffect(() => {
    const data = getResourceChangeRequestById(requestId || 'RCR-2026001')
    setRequest(data)
  }, [requestId])

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Action Handlers
  const handleApprove = () => {
    if (!request) return
    const updated = approveResourceChangeRequest(request.id, approveNote.trim())
    setRequest(updated)
    setShowApproveModal(false)
    setApproveNote('')
    showToast(`Change request ${request.id} has been approved successfully!`, 'success')
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Please provide a reason for rejecting this request.')
      return
    }
    const updated = rejectResourceChangeRequest(request.id, rejectReason.trim())
    setRequest(updated)
    setShowRejectModal(false)
    setRejectReason('')
    setRejectError('')
    showToast(`Change request ${request.id} has been rejected.`, 'error')
  }

  const handleClarify = () => {
    if (!clarifyQuery.trim()) {
      setClarifyError('Please enter the question or clarification note to send to PM.')
      return
    }
    const updated = clarifyResourceChangeRequest(request.id, clarifyQuery.trim())
    setRequest(updated)
    setShowClarifyModal(false)
    setClarifyQuery('')
    setClarifyError('')
    showToast(`Clarification query sent to Project Manager ${request.projectManager}.`, 'info')
  }

  const handleDownloadAttachment = (att) => {
    showToast(`Downloading ${att.name}...`, 'info')
    // Generate sample PDF simulation download
    const element = document.createElement('a')
    const file = new Blob([`WorKXKloud Resource Justification Document\nProject: ${request.projectName}\nPM: ${request.projectManager}\nNotes: ${request.pmRequestNote}`], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = att.name
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!request) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-slate-600">Loading Change Request...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'Project Detail', label: 'Project Detail' },
    { key: 'Client Details', label: 'Client Details' },
    { key: 'Resource', label: 'Resource' },
    { key: 'Payment Milestone', label: 'Payment Milestone' },
    { key: 'Change Request', label: 'Change Request', badge: 1 },
    { key: 'Activity Log', label: 'Activity Log' },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 top-20 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl ${toastMessage.type === 'success'
                ? 'border border-emerald-200 bg-emerald-600 text-white'
                : toastMessage.type === 'error'
                  ? 'border border-rose-200 bg-rose-600 text-white'
                  : 'border border-blue-200 bg-blue-600 text-white'
              }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 size={18} />}
            {toastMessage.type === 'error' && <XCircle size={18} />}
            {toastMessage.type === 'info' && <Info size={18} />}
            <span className="text-sm font-bold tracking-tight">{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Top Back Navigation Link */}
      <div className="mb-4">
        <BackButton to="/pmo/resource-requests" label="Back to Requests" />
      </div>

      {/* Main Header Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">
              Resource Change Request
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[request.status] || STATUS_BADGE_STYLES['Pending PMO Review']
                }`}
            >
              {request.status}
            </span>
          </div>
          <p className="mt-1 text-[13px] font-normal text-slate-500">
            PM has requested changes in resource allocation. Please review and take action.
          </p>
        </div>

        {/* Top Right Request Metadata */}
        <div className="text-left sm:text-right">
          <p className="text-[13px] font-semibold text-slate-800">
            Request ID: <span className="font-bold text-slate-900">{request.id}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Requested on: {request.requestedOnFormatted}
          </p>
        </div>
      </div>

      {/* Project Meta Bar Card */}
      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {/* Project ID */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Project ID</p>
              <p className="text-[13px] font-bold text-slate-800">{request.projectId}</p>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <p className="text-[11px] font-medium text-slate-400">Project Name</p>
            <p className="text-[13px] font-bold text-slate-800 truncate" title={request.projectName}>
              {request.projectName}
            </p>
          </div>

          {/* Project Manager */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <User size={15} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">Project Manager</p>
              <p className="text-[13px] font-bold text-slate-800 truncate">{request.projectManager}</p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Building2 size={15} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Department</p>
              <p className="text-[13px] font-bold text-slate-800">{request.department}</p>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Flag size={15} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Priority</p>
              <p className="text-[13px] font-bold text-[#ef4444]">{request.priority}</p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Calendar size={15} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Due Date</p>
              <p className="text-[13px] font-bold text-slate-800">{request.dueDateFormatted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Request Summary Card */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0052ff] text-white shadow-sm">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900">Request Summary</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
              {request.requestSummary}
            </p>
          </div>
        </div>

        {/* Reason Provided by PM Card */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <div>
            <h3 className="text-[14px] font-bold text-slate-900">Reason Provided by PM</h3>
            <p className="mt-1 text-[13px] italic leading-relaxed text-slate-600">
              &ldquo;{request.reasonProvidedByPM}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="mt-6 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[13px] font-semibold transition-all cursor-pointer ${isActive
                    ? 'text-[#0052ff]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
                  }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0052ff] px-1.5 text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#0052ff]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {/* ================= 1. CHANGE REQUEST TAB (DEFAULT) ================= */}
        {activeTab === 'Change Request' && (
          <div className="space-y-5">
            {/* Side-by-Side Comparison Section */}
            <div className="relative grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
              {/* Center Arrow Indicator (Desktop) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-[#0052ff] text-white shadow-md">
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>

              {/* LEFT CARD: Current Resource Allocation (Approved) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User size={16} />
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800">
                    Current Resource Allocation (Approved)
                  </h3>
                </div>

                <div className="mt-3.5 overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-2 text-center w-12">Sr No.</th>
                        <th className="pb-3 pr-3">Resource Name</th>
                        <th className="pb-3 pr-3">Role</th>
                        <th className="pb-3 pr-3 text-center">Allocation %</th>
                        <th className="pb-3">Working Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {request.currentAllocation.map((row) => (
                        <tr key={row.srNo} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 pr-2 text-center text-slate-400 font-medium">
                            {row.srNo}
                          </td>
                          <td className="py-3.5 pr-3 font-semibold text-slate-800">
                            {row.resourceName}
                          </td>
                          <td className="py-3.5 pr-3 text-slate-600">
                            {row.role}
                          </td>
                          <td className="py-3.5 pr-3 text-center font-bold text-slate-800">
                            {row.allocation}%
                          </td>
                          <td className="py-3.5">
                            <WorkingDaysPills days={row.workingDays} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT CARD: Requested Resource Allocation (By PM) */}
              <div className="rounded-2xl border border-emerald-100 bg-[#fbfdfc] p-4 shadow-xs sm:p-5">
                <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-3.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Users size={16} />
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800">
                    Requested Resource Allocation (By PM)
                  </h3>
                </div>

                <div className="mt-3.5 overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-2 text-center w-12">Sr No.</th>
                        <th className="pb-3 pr-3">Resource Name</th>
                        <th className="pb-3 pr-3">Role</th>
                        <th className="pb-3 pr-3 text-center">Allocation %</th>
                        <th className="pb-3 pr-3">Working Days</th>
                        <th className="pb-3 text-center">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {request.requestedAllocation.map((row) => (
                        <tr
                          key={row.srNo}
                          className={`transition ${row.change === 'Added' ? 'bg-emerald-50/30' : 'hover:bg-slate-50/70'
                            }`}
                        >
                          <td className="py-3.5 pr-2 text-center text-slate-400 font-medium">
                            {row.srNo}
                          </td>
                          <td className="py-3.5 pr-3 font-semibold text-slate-800">
                            {row.resourceName}
                          </td>
                          <td className="py-3.5 pr-3 text-slate-600">
                            {row.role}
                          </td>
                          <td className="py-3.5 pr-3 text-center font-bold text-slate-800">
                            {row.allocation}%
                          </td>
                          <td className="py-3.5 pr-3">
                            <WorkingDaysPills days={row.workingDays} />
                          </td>
                          <td className="py-3.5 text-center">
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${CHANGE_BADGE_STYLES[row.change] || CHANGE_BADGE_STYLES.Unchanged
                                }`}
                            >
                              {row.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Comparison Legend */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-[#22c55e]" />
                <span className="font-medium text-slate-700">Added</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-[#f43f5e]" />
                <span className="font-medium text-slate-700">Removed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-[#f59e0b]" />
                <span className="font-medium text-slate-700">Modified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-[#60a5fa]" />
                <span className="font-medium text-slate-700">Unchanged</span>
              </div>
            </div>

            {/* Bottom Row (Notes & Attachments) */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* PM Request Note (2 Cols) */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800">PM Request Note</h3>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
                  {request.pmRequestNote}
                </p>
              </div>

              {/* Attachments Card (1 Col) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Paperclip size={16} />
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800">
                    Attachments ({request.attachments.length})
                  </h3>
                </div>

                <div className="mt-3 space-y-2">
                  {request.attachments.length > 0 ? (
                    request.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:bg-slate-100/80"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-rose-500 shadow-xs border border-slate-200/60">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                              {att.name}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">{att.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(att)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-blue-600 transition shadow-xs cursor-pointer"
                          title="Download attachment"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-3">No attachments uploaded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* PMO Action Bar Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">PMO Action</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Please review the requested changes and take appropriate action.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="rounded-xl border border-rose-300 bg-white px-5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:border-rose-400 cursor-pointer shadow-xs"
                  >
                    Reject Request
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowClarifyModal(true)}
                    className="rounded-xl border border-blue-400 bg-white px-5 py-2.5 text-xs font-bold text-[#0052ff] transition hover:bg-blue-50 hover:border-blue-500 cursor-pointer shadow-xs"
                  >
                    Ask for Clarification
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowApproveModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#00c06a] hover:bg-[#00ab5e] px-6 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    Approve Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. PROJECT DETAIL TAB ================= */}
        {activeTab === 'Project Detail' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Project Overview & Scope</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {request.projectScope}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Start Date</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.startDateFormatted}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Target Due Date</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.dueDateFormatted}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.duration}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Budget</p>
                <p className="mt-1 text-[13px] font-bold text-emerald-600">
                  ₹{Number(request.budget).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Billing Type</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.noBilling}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Methodology</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.methodology}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Technology Stack</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.technology}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. CLIENT DETAILS TAB ================= */}
        {activeTab === 'Client Details' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Client Organization Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Client Name</p>
                <p className="mt-1 text-[14px] font-bold text-slate-900">{request.clientDetails.clientName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{request.clientDetails.clientCode}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Primary Contact</p>
                <p className="mt-1 text-[14px] font-bold text-slate-900">{request.clientDetails.primaryContact}</p>
                <p className="text-xs text-slate-500 mt-0.5">{request.clientDetails.role}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Contact Email</p>
                <p className="mt-1 text-[13px] font-bold text-blue-600">{request.clientDetails.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">{request.clientDetails.phone}</p>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Office Location & Timezone</p>
                <p className="mt-1 text-[13px] font-bold text-slate-800">{request.clientDetails.address}</p>
                <p className="text-xs text-slate-500 mt-0.5">Time Zone: {request.clientDetails.timeZone}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. RESOURCE TAB ================= */}
        {activeTab === 'Resource' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Complete Staffing Plan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Resource Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Approved Allocation</th>
                    <th className="py-3 px-4">Working Schedule</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {request.currentAllocation.map((res, idx) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{res.resourceName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{res.role}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600">{res.allocation}%</td>
                      <td className="py-3.5 px-4">
                        <WorkingDaysPills days={res.workingDays} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 5. PAYMENT MILESTONE TAB ================= */}
        {activeTab === 'Payment Milestone' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Project Payment Milestones</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Milestone Deliverable</th>
                    <th className="py-3 px-4 text-center">Billing %</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                    <th className="py-3 px-4 text-center">Due Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {request.paymentMilestones.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{m.milestone}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">{m.percentage}%</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        ₹{Number(m.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600">{m.dueDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${m.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 6. ACTIVITY LOG TAB ================= */}
        {activeTab === 'Activity Log' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Request Audit Trail & History</h3>
            <div className="space-y-4">
              {request.activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-3.5 border-l-2 border-blue-400 pl-4 py-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-800">{log.action}</span>
                      <span className="text-[11px] text-slate-400">• {log.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">By {log.author}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: APPROVE REQUEST ================= */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Approve Resource Change</h3>
                  <p className="text-xs text-slate-500">Project: {request.projectName} ({request.projectId})</p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-emerald-50/60 border border-emerald-100 p-3.5 text-xs text-emerald-800">
              <p className="font-semibold">
                Approving this request will immediately update the project staffing allocation:
              </p>
              <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Aman Singh added as UI Developer (100% allocation)</li>
                <li>New QA Resource added (50% allocation)</li>
                <li>Ravi Sharma released from this project</li>
              </ul>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                PMO Approval Remarks (Optional)
              </label>
              <textarea
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="Add any instructions or notes for the PM..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 size={14} />
                Confirm & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REJECT REQUEST ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Reject Resource Change</h3>
                  <p className="text-xs text-slate-500">Project: {request.projectName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value)
                  if (rejectError) setRejectError('')
                }}
                placeholder="State why this change request cannot be approved at this time..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
              {rejectError && <p className="mt-1 text-[11px] font-semibold text-rose-600">{rejectError}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <XCircle size={14} />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASK FOR CLARIFICATION ================= */}
      {showClarifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ask PM for Clarification</h3>
                  <p className="text-xs text-slate-500">Project Manager: {request.projectManager}</p>
                </div>
              </div>
              <button
                onClick={() => setShowClarifyModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Clarification Query / Question <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={clarifyQuery}
                onChange={(e) => {
                  setClarifyQuery(e.target.value)
                  if (clarifyError) setClarifyError('')
                }}
                placeholder="Ask what specific deliverables Aman Singh will handle, or why an additional QA is needed..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {clarifyError && <p className="mt-1 text-[11px] font-semibold text-rose-600">{clarifyError}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClarifyModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClarify}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <Send size={14} />
                Send Query to PM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceChangeRequestDetailPage
