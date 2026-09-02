import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
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
  RefreshCw,
  CheckCircle2,
  UserPlus,
  Check,
} from 'lucide-react'
import GanttChart from '../components/projects/gantt/GanttChart'
import ProjectBoardSection from '../components/projects/ProjectBoardSection'
import ProjectDiscussionSection from '../components/projects/ProjectDiscussionSection'
import ProjectBacklogsSection from '../components/projects/ProjectBacklogsSection'
import CreateResourceChangeRequestModal from '../components/projects/CreateResourceChangeRequestModal'
import { getResourceChangeRequests } from '../data/resourceChangeRequestsData'
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

// Status -> accent color used by the Project Status bar + timeline card
const getStatusAccent = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return { bar: '#3b82f6', text: 'text-blue-600', dot: 'bg-blue-500' }
    case 'on-hold':
    case 'on hold':
    case 'pending': return { bar: '#f59e0b', text: 'text-amber-600', dot: 'bg-amber-500' }
    case 're-allocated': return { bar: '#a855f7', text: 'text-purple-600', dot: 'bg-purple-500' }
    default: return { bar: '#10b981', text: 'text-emerald-600', dot: 'bg-emerald-500' } // in-progress / default
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



// Helper to parse milestones from array or string
const parseMilestones = (milestones) => {
  if (!milestones) return []
  if (Array.isArray(milestones)) return milestones
  if (typeof milestones === 'string') {
    try {
      const parsed = JSON.parse(milestones)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// Calculate overall milestone progress
const getOverallProgress = (project) => {
  if (!project) return 0
  const milestones = parseMilestones(project.milestones)
  if (milestones.length === 0) return 0
  const today = new Date()
  try {
    const completed = milestones.filter(m => m && m.milestone_date && new Date(m.milestone_date) <= today)
    if (completed.length === 0) return 0
    return completed[completed.length - 1]?.percentage || 0
  } catch {
    return 0
  }
}

// Break milestones into Done / On Track / Overdue / Future buckets for the Task Status donut.
// Done = percentage already at/above 100. Overdue = past its date but not completed.
// On Track = due within the next 14 days, not completed yet. Future = everything further out.
const getTaskStatusBreakdown = (project) => {
  if (!project) return { done: 0, overdue: 0, onTrack: 0, future: 0, total: 0 }
  const milestones = parseMilestones(project.milestones)
  const today = new Date()
  let done = 0, overdue = 0, onTrack = 0, future = 0

  milestones.forEach((ms) => {
    if (!ms) return
    const pct = Number(ms.percentage) || 0
    const msDate = ms.milestone_date ? new Date(ms.milestone_date) : null
    if (pct >= 100) {
      done++
    } else if (msDate && msDate < today) {
      overdue++
    } else if (msDate) {
      const diffDays = (msDate - today) / (1000 * 60 * 60 * 24)
      if (diffDays <= 14) onTrack++
      else future++
    } else {
      future++
    }
  })

  return { done, overdue, onTrack, future, total: milestones.length }
}

// Small SVG donut/ring chart used by the Task Status card
const TaskStatusDonut = ({ breakdown }) => {
  const { done, overdue, onTrack, future, total } = breakdown
  const size = 132
  const center = size / 2
  const radius = 54
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius

  const segments = [
    { key: 'onTrack', value: onTrack, color: '#f59e0b' },
    { key: 'done', value: done, color: '#10b981' },
    { key: 'overdue', value: overdue, color: '#ef4444' },
    { key: 'future', value: future, color: '#8b5cf6' },
  ]

  const nonZeroCount = segments.filter(s => s.value > 0).length
  const gap = nonZeroCount > 1 ? 8 : 0 // px gap between arcs

  let cumulative = 0
  const arcs = segments.map((seg) => {
    if (!total || seg.value <= 0) return null
    const segLength = (seg.value / total) * circumference
    const drawLength = Math.max(segLength - gap, 1)
    const offset = circumference - cumulative
    cumulative += segLength
    return (
      <circle
        key={seg.key}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${drawLength} ${circumference - drawLength}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    )
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {total > 0 ? arcs : null}
      </g>
      <text x={center} y={center + 7} textAnchor="middle" className="fill-slate-800" style={{ fontSize: 26, fontWeight: 700 }}>
        {total}
      </text>
    </svg>
  )
}

// Mini bar chart used by the Project Status card — single bar sized/coloured by project status
const ProjectStatusBar = ({ project }) => {
  const accent = getStatusAccent(project.status)
  const progress = getOverallProgress(project)
  const heightPct = Math.max(progress, 6) // keep a visible sliver even at 0%
  const ticks = [3, 2, 1, 0]

  return (
    <div className="flex items-end gap-3 mt-2 h-[180px]">
      <div className="flex flex-col justify-between h-full py-0.5 text-[10px] font-semibold text-slate-300">
        {ticks.map(t => <span key={t}>{t}</span>)}
      </div>
      <div className="flex-1 flex items-end justify-center h-full border-l border-b border-slate-100 pl-4 relative">
        <div className="flex flex-col items-center gap-2 h-full justify-end">
          <div
            className="w-14 rounded-t-md transition-all duration-500"
            style={{ height: `${heightPct}%`, backgroundColor: accent.bar, minHeight: 10 }}
          />
        </div>
      </div>
    </div>
  )
}

const getGanttDataForProject = (project) => {
  if (!project) {
    return { data: [], links: [] }
  }

  const projectId = project.id || project.project_code || 'project_root'
  const rootTaskId = `project_${projectId}`
  const milestones = parseMilestones(project.milestones)

  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.milestone_date || 0) - new Date(b.milestone_date || 0))

  const projectTask = {
    id: rootTaskId,
    text: project.project_name || 'Project Timeline',
    start_date: project.start_date || sortedMilestones[0]?.milestone_date || new Date().toISOString().split('T')[0],
    end_date: project.end_date || sortedMilestones[sortedMilestones.length - 1]?.milestone_date,
    duration: project.duration || 0,
    progress: getOverallProgress(project) / 100,
    open: true,
    type: 'project',
    borderClass: 'border-left-none',
    barClass: 'gantt-bar-dark-blue',
    assignees: project.project_manager || 'PM'
  }

  const milestoneTasks = sortedMilestones.map((ms, index) => ({
    id: `${rootTaskId}_ms_${index + 1}`,
    text: ms.milestone || `Milestone ${index + 1}`,
    start_date: ms.milestone_date || project.start_date || projectTask.start_date,
    duration: 0,
    progress: (ms.percentage || 0) / 100,
    parent: rootTaskId,
    borderClass: 'border-left-green',
    barClass: 'gantt-bar-green',
    assignees: ms.resource || ms.assigned_to || project.project_manager || 'Team'
  }))

  const links = milestoneTasks
    .slice(1)
    .map((task, idx) => ({
      id: `link_${idx + 1}`,
      source: milestoneTasks[idx].id,
      target: task.id,
      type: '0'
    }))

  return {
    data: [projectTask, ...milestoneTasks],
    links,
  }
};

function MyProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [resourceRequests, setResourceRequests] = useState(() => getResourceChangeRequests())
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    const handleSync = () => setResourceRequests(getResourceChangeRequests())
    window.addEventListener('resource-requests-updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('resource-requests-updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Selecting a project / switching tabs is plain React state, which a
  // refresh wipes — mirror it into the URL (?project=&tab=) so a refresh
  // (or a shared link) lands back on the same project + tab instead of
  // bouncing to the project list.
  const openProject = (project, tab = 'Overview') => {
    setSelectedProject(project)
    setActiveTab(tab)
    setSearchParams({ project: String(project.id), tab })
  }

  const closeProject = () => {
    setSelectedProject(null)
    setSearchParams({})
  }

  const changeTab = (tab) => {
    setActiveTab(tab)
    if (selectedProject) {
      setSearchParams({ project: String(selectedProject.id), tab })
    }
  }

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

  // Once projects are in, re-select whichever one the URL points at (e.g.
  // after a refresh or navigating with ?project=ID&tab=Overview)
  useEffect(() => {
    if (loading) return
    const projectId = searchParams.get('project')
    if (!projectId) {
      if (selectedProject) setSelectedProject(null)
      return
    }
    const match = projects.find((p) => String(p.id) === String(projectId))
    if (match) {
      setSelectedProject(match)
      const tab = searchParams.get('tab') || 'Overview'
      setActiveTab(tab)
    } else if (projects.length > 0) {
      // Stale/invalid id in the URL — drop it instead of leaving a dead link.
      setSearchParams({})
    }
  }, [loading, projects, searchParams])


  return (
    <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8">
      {/* Back button */}
      <div className="mb-6">
        <BackButton
          variant="dark"
          label={selectedProject ? 'Back to Projects' : 'Back to Dashboard'}
          onClick={(e) => {
            if (selectedProject) {
              e.preventDefault();
              closeProject();
            }
          }}
          fallbackUrl="/dashboard"
        />
      </div>

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
                            onClick={() => openProject(project, 'Overview')}
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

                {/* Right Actions & Progress Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsResourceModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Users size={15} />
                    <span>Request Resource Change</span>
                  </button>

                  <div className="flex flex-col min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                      <span>➔</span>
                      <span>Start</span>
                    </div>
                    <div className="text-sm font-bold text-slate-700 mt-1">
                      {formatDate(selectedProject.start_date)}
                    </div>
                    <div className="relative mt-3.5 flex items-center w-full max-w-[240px]">
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
              </div>

              {/* Tabs list */}
              <div className="mt-6 border-b border-slate-100 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-5 sm:gap-8 text-sm font-bold w-max min-w-full pb-px px-2 sm:px-6">
                  {['Overview', 'Schedule', 'Board', 'Resources', 'Discussion', 'Financial'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => changeTab(tab)}
                      className={`pb-3.5 transition-all relative font-medium text-[13px] sm:text-[14px] whitespace-nowrap flex-shrink-0 ${activeTab === tab
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

                  {/* Left Column (Task Status + Project Budget) */}
                  <div className="space-y-6 flex flex-col justify-between">
                    {/* Task Status donut */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800">Task Status</h3>
                        <button className="text-slate-400 hover:text-slate-600 transition">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>

                      {(() => {
                        const breakdown = getTaskStatusBreakdown(selectedProject)
                        if (breakdown.total === 0) {
                          return (
                            <div className="py-8 flex flex-col items-center justify-center text-center">
                              <div className="mb-3"><EmptyBoxIcon /></div>
                              <p className="text-xs font-bold text-slate-400">No milestones defined</p>
                            </div>
                          )
                        }
                        return (
                          <div className="flex items-center gap-6 mt-4">
                            <TaskStatusDonut breakdown={breakdown} />
                            <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                                Future <span className="text-slate-400 font-bold ml-auto">{breakdown.future}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Done <span className="text-slate-400 font-bold ml-auto">{breakdown.done}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                On Track <span className="text-slate-400 font-bold ml-auto">{breakdown.onTrack}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                Overdue <span className="text-slate-400 font-bold ml-auto">{breakdown.overdue}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Project Budget */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Project Budget</h3>
                        <p className="text-[2.2rem] font-bold text-slate-800 mt-4 leading-none">
                          {formatCurrency(selectedProject.budget)}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${getOverallProgress(selectedProject)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
                            {getOverallProgress(selectedProject)}% milestones done
                          </span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-blue-500 rounded-full absolute bottom-0 left-0" />
                    </div>
                  </div>

                  {/* Middle Column (Project Status + Timeline) */}
                  <div className="space-y-6 flex flex-col justify-between">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <button className="flex items-center gap-1 text-sm font-bold text-slate-800">
                          Project Status
                          <ChevronDown size={16} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 transition">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <ProjectStatusBar project={selectedProject} />
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                        <span className={`h-2.5 w-2.5 rounded-full ${getStatusAccent(selectedProject.status).dot}`} />
                        {selectedProject.project_name}
                        <span className="text-slate-300">•</span>
                        <span className="capitalize">{selectedProject.status || 'Active'}</span>
                      </div>
                    </div>

                    {/* Timeline card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Timeline</h3>
                        <p className="text-[2.2rem] font-bold text-slate-800 mt-4 leading-none">
                          {selectedProject.duration ? `${selectedProject.duration}d` : '-'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(selectedProject.start_date)} → {formatDate(selectedProject.end_date)}
                        </p>
                      </div>
                      <div className={`h-1 w-full rounded-full absolute bottom-0 left-0 ${getStatusAccent(selectedProject.status).dot}`} />
                    </div>
                  </div>

                  {/* Right Column (Project Details) */}
                  <div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100">Project Details</h3>

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
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.company_name || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.project_type || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                          <p className="font-semibold text-slate-600 mt-1 leading-relaxed">
                            {selectedProject.project_scope || '-'}
                          </p>
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
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</p>
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
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Methodology</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.methodology || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</p>
                          <p className="font-bold text-slate-700 mt-1">{selectedProject.workspace || 'Default'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract Sign</p>
                          <p className="font-bold text-slate-700 mt-1">{formatDate(selectedProject.contact_sign_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              ) : activeTab === 'Board' || activeTab === 'Backlogs' ? (
                <ProjectBoardSection
                  projectId={selectedProject?.id}
                  pmId={getPmId()}
                  projectName={selectedProject?.project_name}
                  initialViewMode={activeTab === 'Backlogs' ? 'backlog' : 'board'}
                />
              ) : activeTab === 'Schedule' ? (
                <GanttChart
                  tasks={getGanttDataForProject(selectedProject)}
                  projectName={selectedProject.project_name}
                  onClose={() => changeTab('Overview')}
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
              ) : activeTab === 'Resources' ? (
                <div className="mt-6 space-y-6">
                  {/* Top Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-5 rounded-2xl border border-blue-100/80 shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                        <Users size={22} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Project Staffing & Resource Allocations
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          View allocated team members or request staffing changes from the PMO.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsResourceModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <Users size={15} />
                      <span>+ Request Resource Change</span>
                    </button>
                  </div>

                  {/* Allocated Team Members Grid */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Current Allocated Team
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(selectedProject.resourcesAllocated || [
                        { name: selectedProject.project_manager || 'Lead Developer', role: 'Full Stack Developer', allocation: 100 }
                      ]).map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {(member.name || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{member.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{member.role || 'Team Member'}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                            {member.allocation || 100}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submitted Resource Change Requests for this Project */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Staffing Change Requests (PM ➔ PMO)
                      </h4>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {resourceRequests.filter(r => r.projectName === selectedProject.project_name || r.projectId === selectedProject.project_code).length} Submitted
                      </span>
                    </div>

                    <div className="space-y-3">
                      {resourceRequests.filter(r => r.projectName === selectedProject.project_name || r.projectId === selectedProject.project_code).length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400">No resource change requests raised for this project yet.</p>
                          <p className="text-[11px] text-slate-400 mt-1">Click "Request Resource Change" above to submit a staffing request to PMO.</p>
                        </div>
                      ) : (
                        resourceRequests
                          .filter(r => r.projectName === selectedProject.project_name || r.projectId === selectedProject.project_code)
                          .map((req) => (
                            <div
                              key={req.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-2xs hover:border-slate-200 transition"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{req.id}</span>
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    req.status === 'Approved'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : req.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : req.status === 'Clarification Requested'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {req.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{req.reasonProvidedByPM}</p>
                              </div>
                              <div className="text-right text-xs text-slate-400">
                                <span>{req.requestedOnFormatted}</span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'Discussion' ? (
                <ProjectDiscussionSection />
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

      {/* Resource Change Request Modal (PM Side) */}
      {isResourceModalOpen && selectedProject && (
        <CreateResourceChangeRequestModal
          isOpen={isResourceModalOpen}
          onClose={() => setIsResourceModalOpen(false)}
          project={selectedProject}
          onSuccess={(createdReq) => {
            setToastMessage(`Resource change request ${createdReq.id} submitted to PMO successfully!`)
            setTimeout(() => setToastMessage(null), 5000)
          }}
        />
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default MyProjectsPage