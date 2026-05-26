import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Compass,
  BarChart3,
  User,
  Users,
  Layout,
  Smartphone,
  Cloud,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronDown,
  Inbox,
  Briefcase,
  Building,
  MapPin,
  Mail,
  Phone,
  Layers,
  Clock,
  Target,
  FileText,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import GanttChart from '../components/projects/GanttChart'
import { API_ENDPOINTS, API_ROOT_URL } from '../config/api'

// Helper to format date strings
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Helper to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Pick an icon based on project type
const getProjectIcon = (projectType) => {
  switch (projectType?.toLowerCase()) {
    case 'software': return Layout
    case 'mobile': return Smartphone
    case 'cloud': return Cloud
    default: return Briefcase
  }
}

// Pick icon color based on project type
const getIconColor = (projectType) => {
  switch (projectType?.toLowerCase()) {
    case 'software': return 'bg-emerald-50 text-emerald-600'
    case 'mobile': return 'bg-amber-50 text-amber-600'
    case 'cloud': return 'bg-indigo-50 text-indigo-600'
    default: return 'bg-blue-50 text-blue-600'
  }
}

// Priority badge styling
const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-rose-50 text-rose-600 border border-rose-100/50'
    case 'medium': return 'bg-amber-50 text-amber-600 border border-amber-100/50'
    case 'low': return 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
    default: return 'bg-slate-50 text-slate-600 border border-slate-100/50'
  }
}

// Status badge styling
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'in-progress':
    case 'in progress':
      return 'text-emerald-600 bg-emerald-50 border border-emerald-100'
    case 'completed':
      return 'text-blue-600 bg-blue-50 border border-blue-100'
    case 'on-hold':
    case 'on hold':
      return 'text-amber-600 bg-amber-50 border border-amber-100'
    case 're-allocated':
      return 'text-purple-600 bg-purple-50 border border-purple-100'
    case 'pending':
      return 'text-amber-600 bg-amber-50 border border-amber-100'
    default:
      return 'text-slate-600 bg-slate-50 border border-slate-100'
  }
}

// Get the PM user ID from localStorage
const getPmId = () => {
  try {
    const authUser = localStorage.getItem('auth_user')
    if (authUser) {
      const user = JSON.parse(authUser)
      return user.id || user.user_id || null
    }
  } catch {
    // ignore
  }
  return null
}

const EmptyBoxIcon = () => (
  <svg
    width="96"
    height="80"
    viewBox="0 0 120 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-slate-300 mx-auto"
  >
    {/* Floating Papers */}
    <g transform="rotate(-15 36 35)">
      <rect
        x="20"
        y="15"
        width="22"
        height="30"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />
      <line x1="25" y1="22" x2="37" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="27" x2="35" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="32" x2="32" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    <g transform="rotate(15 75 33)">
      <rect
        x="64"
        y="15"
        width="22"
        height="30"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />
      <line x1="69" y1="22" x2="81" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="69" y1="27" x2="79" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="69" y1="32" x2="76" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    <g>
      <rect
        x="47"
        y="8"
        width="26"
        height="34"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="white"
      />
      <circle cx="60" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="53" y1="26" x2="67" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="53" y1="32" x2="63" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    <path
      d="M30 65 L60 52 L90 65 L60 78 Z"
      fill="#cbd5e1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    <path
      d="M30 65 L12 55 L22 47 L40 57 Z"
      fill="#e2e8f0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    <path
      d="M90 65 L108 55 L98 47 L80 57 Z"
      fill="#e2e8f0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    <path
      d="M30 65 L60 78 L60 102 L30 89 Z"
      fill="#f8fafc"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    <path
      d="M60 78 L90 65 L90 89 L60 102 Z"
      fill="#f1f5f9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const getMockTasksForProject = (project) => {
  return {
    data: [
      // 1.0 Project Initiation
      { id: "1", text: "1.0 Project Initiation", start_date: "2026-05-05", duration: 7, progress: 0.6, open: true, type: "project", borderClass: "border-left-none", barClass: "gantt-bar-dark-green", assignees: "PMO" },
      { id: "1.1", text: "Project Charter", start_date: "2026-05-05", duration: 2, progress: 0.8, parent: "1", borderClass: "border-left-green", barClass: "gantt-bar-green", assignees: "PMO" },
      { id: "1.2", text: "Stakeholder Analysis", start_date: "2026-05-07", duration: 5, progress: 0.4, parent: "1", borderClass: "border-left-green", barClass: "gantt-bar-green", assignees: "Business Analyst" },
      
      // 2.0 Planning
      { id: "2", text: "2.0 Planning", start_date: "2026-05-13", duration: 13, progress: 0.3, open: true, type: "project", borderClass: "border-left-none", barClass: "gantt-bar-dark-blue", assignees: "Project Manager" },
      { id: "2.1", text: "Requirements Gathering", start_date: "2026-05-13", duration: 5, progress: 0.5, parent: "2", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Team" },
      { id: "2.2", text: "System Design", start_date: "2026-05-18", duration: 8, progress: 0.2, parent: "2", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Technical Lead" },
      
      // 3.0 Development
      { id: "3", text: "3.0 Development", start_date: "2026-05-27", duration: 22, progress: 0.1, open: true, type: "project", borderClass: "border-left-none", barClass: "gantt-bar-dark-purple", assignees: "Dev Team" },
      { id: "3.1", text: "Module 1 Development", start_date: "2026-05-27", duration: 9, progress: 0.2, parent: "3", borderClass: "border-left-purple", barClass: "gantt-bar-purple", assignees: "Developers" },
      { id: "3.2", text: "Module 2 Development", start_date: "2026-06-08", duration: 10, progress: 0.0, parent: "3", borderClass: "border-left-purple", barClass: "gantt-bar-purple", assignees: "Developers" },
      
      // 4.0 Testing
      { id: "4", text: "4.0 Testing", start_date: "2026-06-19", duration: 13, progress: 0.0, open: true, type: "project", borderClass: "border-left-none", barClass: "gantt-bar-dark-pink", assignees: "QA Team" },
      { id: "4.1", text: "System Testing", start_date: "2026-06-19", duration: 8, progress: 0.0, parent: "4", borderClass: "border-left-pink", barClass: "gantt-bar-pink", assignees: "QA Team" },
      { id: "4.2", text: "User Acceptance Testing", start_date: "2026-06-28", duration: 4, progress: 0.0, parent: "4", borderClass: "border-left-pink", barClass: "gantt-bar-pink", assignees: "QA Team" }
    ],
    links: [
      { id: "l1", source: "1.1", target: "1.2", type: "0" },
      { id: "l2", source: "1.2", target: "2", type: "0" },
      { id: "l3", source: "2.1", target: "2.2", type: "0" },
      { id: "l4", source: "2.2", target: "3", type: "0" },
      { id: "l5", source: "2.2", target: "3.1", type: "0" },
      { id: "l6", source: "3.1", target: "3.2", type: "0" },
      { id: "l7", source: "3.2", target: "4", type: "0" },
      { id: "l8", source: "4.1", target: "4.2", type: "0" }
    ]
  };
};

function MyProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError(null)
      try {
        const pmId = getPmId()
        if (!pmId) {
          setError('Unable to determine your PM ID. Please log in again.')
          setLoading(false)
          return
        }

        const token = localStorage.getItem('token')
        const response = await fetch(API_ENDPOINTS.GET_PROJECTS_BY_PM, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ pm_id: pmId }),
        })

        const data = await response.json()

        if (!response.ok || !data?.success) {
          setError(data?.message || 'Failed to fetch projects.')
          setLoading(false)
          return
        }

        setProjects(data.data || [])
      } catch (err) {
        console.error('Error fetching PM projects:', err)
        setError('Unable to reach server. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Calculate overall milestone progress
  const getOverallProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) return 0
    const today = new Date()
    const completed = project.milestones.filter(m => new Date(m.milestone_date) <= today)
    if (completed.length === 0) return 0
    return completed[completed.length - 1]?.percentage || 0
  }

  return (
    <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8">
      {/* Back button */}
      <button
        onClick={() => {
          if (selectedProject) {
            setSelectedProject(null)
          } else {
            navigate('/')
          }
        }}
        className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white mb-6 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
      >
        <ArrowLeft size={14} />
        {selectedProject ? 'Back to Projects' : 'Back to Dashboard'}
      </button>

      {/* Main Container */}
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-[28px] bg-white p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(3,10,24,0.14)]">

          {!selectedProject ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900 tracking-tight leading-tight">
                    My Projects
                  </h1>
                  <p className="mt-1.5 text-sm font-medium text-slate-500">
                    Monitor Project Progress with Smart Visibility.
                  </p>
                </div>
                {!loading && !error && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                      {projects.length}
                    </span>
                    <span>Projects</span>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-600">Loading your projects...</p>
                  <p className="text-xs text-slate-400 mt-1">Fetching data from server</p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 mb-4">
                    <AlertCircle size={32} className="text-rose-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && projects.length === 0 && (
                <div className="mt-16 flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <EmptyBoxIcon />
                  <h3 className="font-bold text-slate-700 text-base mt-4">No Projects Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                    You have no projects assigned yet. Projects will appear here once assigned to you.
                  </p>
                </div>
              )}

              {/* Projects Grid */}
              {!loading && !error && projects.length > 0 && (
                <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => {
                    const ProjectIcon = getProjectIcon(project.project_type)
                    const iconColor = getIconColor(project.project_type)
                    const priorityStyle = getPriorityStyle(project.priority)
                    const progress = getOverallProgress(project)

                    return (
                      <div
                        key={project.id}
                        className="flex flex-col rounded-[20px] border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                      >
                        {/* Top Section */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconColor} shadow-sm`}>
                              <ProjectIcon size={22} strokeWidth={2} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-[15px] leading-snug">
                                {project.project_name}
                              </h3>
                              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                {project.project_code}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Priority + Status Badges */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyle}`}>
                            {project.priority || 'Normal'}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold capitalize tracking-wider ${getStatusStyle(project.status)}`}>
                            {project.status || 'Active'}
                          </span>
                        </div>

                        {/* Details Table */}
                        <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5">

                          {/* Start Date */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <Calendar size={14} className="text-slate-400" />
                              Start Date
                            </span>
                            <span className="font-semibold text-slate-700">{formatDate(project.start_date)}</span>
                          </div>

                          {/* End Date */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <Compass size={14} className="text-slate-400" />
                              End Date
                            </span>
                            <span className="font-semibold text-slate-700">{formatDate(project.end_date)}</span>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <Clock size={14} className="text-slate-400" />
                              Duration
                            </span>
                            <span className="font-semibold text-slate-700">{project.duration ? `${project.duration} days` : '-'}</span>
                          </div>

                          {/* Methodology */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <BarChart3 size={14} className="text-slate-400" />
                              Methodology
                            </span>
                            <span className="font-semibold text-slate-700">{project.methodology || '-'}</span>
                          </div>

                          {/* PM */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <User size={14} className="text-slate-400" />
                              PM
                            </span>
                            <span className="font-semibold text-slate-700">{project.project_manager || '-'}</span>
                          </div>

                          {/* Company */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <Building size={14} className="text-slate-400" />
                              Company
                            </span>
                            <span className="font-semibold text-slate-700">{project.company_name || '-'}</span>
                          </div>

                          {/* Budget */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400 font-medium">
                              <DollarSign size={14} className="text-slate-400" />
                              Budget
                            </span>
                            <span className="font-semibold text-emerald-600">{formatCurrency(project.budget)}</span>
                          </div>

                        </div>

                        {/* Progress bar */}
                        {project.milestones && project.milestones.length > 0 && (
                          <div className="mt-5 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-medium text-slate-400">Progress</span>
                              <span className="font-bold text-blue-600">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer Action Button */}
                        <div className="mt-6 flex justify-center border-t border-slate-50 pt-5">
                          <button
                            onClick={() => {
                              setSelectedProject(project)
                              setActiveTab('Overview')
                            }}
                            className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-xs font-bold text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center min-w-[130px] cursor-pointer"
                          >
                            View Project
                          </button>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Project Detail Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <h1 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900 tracking-tight leading-tight">
                      {selectedProject.project_name}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-slate-500">
                    <span>{selectedProject.project_code}</span>
                    <span className="text-slate-300">|</span>
                    <span className={`px-3 py-0.5 rounded-full capitalize ${getStatusStyle(selectedProject.status)}`}>
                      {selectedProject.status || 'Active'}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className={`px-3 py-0.5 rounded-full flex items-center gap-1 ${getPriorityStyle(selectedProject.priority)}`}>
                      <span className="text-[10px]">▲</span>
                      {selectedProject.priority || 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="flex flex-col min-w-[240px] md:mr-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <span>➔</span>
                    <span>Start</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-1">
                    {formatDate(selectedProject.start_date)}
                  </div>
                  <div className="relative mt-3.5 flex items-center w-full max-w-[260px]">
                    <div className="h-[3px] w-full bg-blue-100 rounded-full relative">
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-blue-600 rounded-full"
                        style={{ width: `${getOverallProgress(selectedProject)}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-[#0d2646] border-2 border-white shadow-sm cursor-pointer"
                        style={{ left: `${getOverallProgress(selectedProject)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs list */}
              <div className="mt-6 border-b border-slate-100 overflow-x-auto scrollbar-none">
                <div className="flex justify-between items-center text-sm font-bold w-full pb-px px-2 sm:px-6">
                  {['Overview', 'Schedule', 'Timeline', 'Discussion', 'Financial'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3.5 transition-all relative font-medium text-[13px] sm:text-[14px] whitespace-nowrap ${activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Contents */}
              {activeTab === 'Overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                  {/* Left Column (Task Status + Project Revenue) */}
                  <div className="space-y-6 flex flex-col justify-between">
                    {/* Task Status / Milestones Summary */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[320px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800">Milestone Progress</h3>
                        <button className="text-slate-400 hover:text-slate-600 transition">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                        <div className="flex-1 overflow-y-auto mt-3 space-y-3">
                          {selectedProject.milestones.map((ms, idx) => {
                            const today = new Date()
                            const msDate = new Date(ms.milestone_date)
                            const isPast = msDate <= today
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${isPast ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                  {ms.percentage}%
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">{ms.milestone}</p>
                                  <p className="text-[10px] text-slate-400">{formatDate(ms.milestone_date)}</p>
                                </div>
                                {isPast && (
                                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">Done</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <div className="mb-3">
                            <EmptyBoxIcon />
                          </div>
                          <p className="text-xs font-bold text-slate-400">No milestones defined</p>
                        </div>
                      )}
                    </div>

                    {/* Project Revenue / Budget */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Project Budget</h3>
                        <p className="text-[2.2rem] font-bold text-slate-800 mt-4 leading-none">
                          {formatCurrency(selectedProject.budget)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 capitalize">
                          Billing: {selectedProject.no_billing === 'No' ? 'Billable' : 'No Billing'}
                        </p>
                      </div>
                      <div className="h-1 w-full bg-blue-500 rounded-full absolute bottom-0 left-0" />
                    </div>
                  </div>

                  {/* Middle Column (Project Scope) */}
                  <div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[486px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <button className="flex items-center gap-1 text-sm font-bold text-slate-800">
                          Project Scope
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      {selectedProject.project_scope ? (
                        <div className="mt-4 text-sm text-slate-600 leading-relaxed">
                          <p>{selectedProject.project_scope}</p>

                          {/* Contacts preview */}
                          {selectedProject.contacts && selectedProject.contacts.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Key Contacts</h4>
                              <div className="space-y-3">
                                {selectedProject.contacts.slice(0, 3).map((contact, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/50">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex-shrink-0">
                                      {contact.person_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-slate-700 truncate">{contact.person_name}</p>
                                      <p className="text-[10px] text-slate-400">{contact.role}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                          <div className="mb-3">
                            <EmptyBoxIcon />
                          </div>
                          <h4 className="text-xs font-bold text-slate-700">No scope defined</h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                            Project scope details will appear here once defined.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Project Details) */}
                  <div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4">Project Details</h3>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manager</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.project_manager || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planned Start</p>
                          <p className="font-bold text-slate-700 mt-1">{formatDate(selectedProject.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State</p>
                          <p className="font-bold text-slate-700 mt-1 capitalize">{selectedProject.status || 'Active'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.company_name || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.project_type || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Methodology</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.methodology || '-'}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Type</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.no_billing === 'No' ? 'Billable' : 'No Billing'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                          <p className="font-bold text-emerald-600 mt-1">{formatCurrency(selectedProject.budget)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.project_code || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">End Date</p>
                          <p className="font-bold text-slate-700 mt-1">{formatDate(selectedProject.end_date)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.duration ? `${selectedProject.duration} days` : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.location || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.priority || 'Normal'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract Sign</p>
                          <p className="font-bold text-slate-700 mt-1">{formatDate(selectedProject.contact_sign_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              ) : activeTab === 'Schedule' ? (
                <GanttChart
                  tasks={getMockTasksForProject(selectedProject)}
                  projectName={selectedProject.project_name}
                  onClose={() => setActiveTab('Overview')}
                  pmId={getPmId()}
                  projectId={selectedProject.id}
                />
              ) : activeTab === 'Financial' ? (
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Budget</p>
                        <p className="text-xl font-bold text-slate-800 mt-0.5">{formatCurrency(selectedProject.budget)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billing Type</p>
                        <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedProject.no_billing === 'No' ? 'Billable' : 'No Billing'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contract Signed</p>
                        <p className="text-xl font-bold text-slate-800 mt-0.5">{formatDate(selectedProject.contact_sign_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Inbox size={48} className="text-slate-300 mb-3 animate-pulse" />
                  <h3 className="font-bold text-slate-700 text-base">No {activeTab} Data</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                    This section is currently empty. Data will populate here as the project progresses.
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default MyProjectsPage
