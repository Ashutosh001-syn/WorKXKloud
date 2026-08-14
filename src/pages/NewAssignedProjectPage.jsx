import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_ENDPOINTS } from '../config/api'
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  Smartphone,
  Cloud,
  ArrowLeft,
  Download,
  Check,
  X,
  Plus,
  Minus,
  Trash2,
  Calendar,
  User,
  Briefcase,
  Building,
  Mail,
  Phone,
  UserCheck,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react'

const getStatusDetails = (project) => {
  if (project.isAccepted) {
    return {
      bg: 'bg-emerald-50/80 border-emerald-100/70 text-emerald-700',
      label: 'Accepted by PM',
      icon: CheckCircle2
    }
  }

  switch (project.status) {
    case 'Pending Acceptance':
      return {
        bg: 'bg-amber-50/80 border-amber-100/70 text-amber-700',
        label: 'Pending Acceptance',
        icon: Clock
      }
    case 'Scheduling in Progress':
      return {
        bg: 'bg-blue-50/80 border-blue-100/70 text-blue-700',
        label: 'Scheduling in Progress',
        icon: Calendar
      }
    case 'In Progress':
      return {
        bg: 'bg-emerald-50/80 border-emerald-100/70 text-emerald-700',
        label: 'In Progress',
        icon: CheckCircle2
      }
    case 'Declined':
      return {
        bg: 'bg-rose-50/80 border-rose-100/70 text-rose-700',
        label: 'Declined',
        icon: X
      }
    default:
      return {
        bg: 'bg-slate-50/80 border-slate-100/70 text-slate-700',
        label: project.status || 'Pending Acceptance',
        icon: Clock
      }
  }
}

const getInitialResources = (project) => {
  const devCount = project?.resourcesAllocated?.filter(r => r.role?.toLowerCase() === 'developer').length || 0
  const testerCount = project?.resourcesAllocated?.filter(r => r.role?.toLowerCase() === 'tester').length || 0
  const uiCount = project?.resourcesAllocated?.filter(r => ['ui designer', 'ui/ux designer', 'designer'].includes(r.role?.toLowerCase())).length || 0

  return [
    {
      roleName: 'Developer',
      current: devCount,
      required: '',
      placeholder: '0',
      isCustom: false
    },
    {
      roleName: 'Tester',
      current: testerCount,
      required: '',
      placeholder: '0',
      isCustom: false
    },
    {
      roleName: 'UI/UX Designer',
      current: uiCount,
      required: '',
      placeholder: '0',
      isCustom: false
    }
  ]
}

const formatProjectDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const getPriorityColor = (priority) => {
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return 'text-[#f56a5d] bg-[#ffe6e3]'
    case 'medium':
      return 'text-[#f59e0b] bg-[#fffaeb]'
    case 'low':
      return 'text-[#2bbb44] bg-[#ddf9df]'
    default:
      return 'text-[#64748b] bg-[#f8fafc]'
  }
}

const isValidReactComponent = (Component) => {
  if (!Component) return false
  return typeof Component === 'function' || (typeof Component === 'object' && Component !== null && Component.$$typeof != null)
}

const mapRemoteProjectToView = (project) => {
  const contacts = Array.isArray(project.contacts) ? project.contacts : []
  const resourcesAllocated = contacts.map((contact, index) => ({
    name: contact.person_name || contact.name || `Team Member ${index + 1}`,
    role: contact.role || 'Team Member',
    avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format&sig=${index}`
  }))

  const rawRequestStatus = project.request_status ?? project.requestStatus ?? project.status
  const normalizedRequestStatus = String(rawRequestStatus || '').trim().toLowerCase()
  let resolvedStatus = 'Pending Acceptance'
  let resolvedAccepted = false

  if (normalizedRequestStatus) {
    if (normalizedRequestStatus.includes('accept')) {
      resolvedStatus = 'Accept'
      resolvedAccepted = true
    } else if (normalizedRequestStatus.includes('decline')) {
      resolvedStatus = 'Declined'
    } else {
      resolvedStatus = String(rawRequestStatus)
    }
  }

  return {
    id: String(project.id ?? project.project_id ?? project.code ?? ''),
    code: project.project_code || project.projectCode || project.code || 'N/A',
    name: project.project_name || project.name || 'Untitled Project',
    clientName: project.company_name || project.companyName || project.client || 'N/A',
    dueDate: formatProjectDate(project.end_date || project.dueDate || project.deadline),
    createdOn: formatProjectDate(project.created_at || project.contact_sign_date || project.createdOn),
    department: project.project_type || project.department || 'IT',
    priority: project.priority || 'Medium',
    priorityColor: getPriorityColor(project.priority),
    status: resolvedStatus,
    isAccepted: resolvedAccepted,
    icon: Briefcase,
    iconColor: 'bg-blue-50 text-blue-600',
    resourcesAllocated: resourcesAllocated,
    clientDetails: {
      companyName: project.company_name || project.companyName || 'N/A',
      location: project.location || 'N/A',
      personName: contacts[0]?.person_name || contacts[0]?.name || '',
      mobileNumber: contacts[0]?.mobile || '',
      emailId: contacts[0]?.email || '',
      role: contacts[0]?.role || ''
    },
    paymentMilestones: (() => {
      const milestoneSource = Array.isArray(project.milestones)
        ? project.milestones
        : Array.isArray(project.payment_milestones)
          ? project.payment_milestones
          : []

      return milestoneSource.map((milestone, index) => {
        const rawDate = milestone.milestone_date ?? milestone.date ?? milestone.due_date ?? milestone.dueDate
        const rawPercentage = milestone.percentage ?? milestone.pct ?? milestone.percent ?? 0
        const percentageValue = String(rawPercentage).trim().replace(/%$/, '')

        return {
          srNo: index + 1,
          milestone: milestone.milestone || milestone.name || `Milestone ${index + 1}`,
          milestone_date: formatProjectDate(rawDate),
          person: contacts[index]?.person_name || contacts[index]?.name || '',
          percentage: `${percentageValue}%`
        }
      })
    })()
  }
}

function NewAssignedProjectPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  // Selecting a project / switching tabs is plain React state, which a
  // refresh wipes — mirror it into the URL (?project=&tab=), same fix as
  // MyProjectsPage, so a refresh lands back on the same project + tab
  // instead of bouncing to the project list.
  const [selectedProjectId, setSelectedProjectId] = useState(() => searchParams.get('project'))
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'project-detail')

  const openProject = (projectId, tab = 'project-detail') => {
    setSelectedProjectId(projectId)
    setActiveTab(tab)
    setSearchParams({ project: String(projectId), tab })
  }

  const closeProject = () => {
    setSelectedProjectId(null)
    setSearchParams({})
  }

  const changeTab = (tab) => {
    setActiveTab(tab)
    if (selectedProjectId) {
      setSearchParams({ project: String(selectedProjectId), tab })
    }
  }
  const [showToast, setShowToast] = useState(null)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const [resourceRows, setResourceRows] = useState([])
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)

  // Block background scroll when any modal is open
  useEffect(() => {
    if (showDeclineModal || showConfirmModal || showAddResourceModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showDeclineModal, showConfirmModal, showAddResourceModal])

  const selectedProject = projects.find(p => String(p.id) === String(selectedProjectId))
  useEffect(() => {
    const fetchAssignedProjects = async () => {
      const pmId = getPmId()
      if (!pmId) {
        console.warn('NewAssignedProjectPage: pmId not found in localStorage, skipping API fetch')
        return
      }

      setIsLoading(true)
      setFetchError(null)

      try {
        const response = await fetch(API_ENDPOINTS.GET_PROJECTS_BY_PM, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pm_id: pmId })
        })
        const data = await response.json()

        if (!response.ok || !data?.success || !Array.isArray(data.data)) {
          const errorMessage = data?.message || 'Unable to fetch assigned projects.'
          console.warn('NewAssignedProjectPage fetch error:', errorMessage, data)
          setFetchError(errorMessage)
          return
        }

        const mappedProjects = data.data.map(rawProject => mapRemoteProjectToView(rawProject))
        setProjects(mappedProjects)
      } catch (error) {
        console.error('Failed to fetch PM assigned projects:', error)
        setFetchError('Unable to load assigned projects. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignedProjects()
  }, [])

  const submitProjectApproval = async (projectId, status, reason = '') => {
    const pmId = getPmId()
    if (!pmId) {
      throw new Error('PM id not found')
    }

    const response = await fetch(API_ENDPOINTS.PROJECT_APPROVAL_BY_PM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pm_id: pmId,
        project_id: Number(projectId),
        request_status: status,
        reason: reason || ''
      })
    })

    const data = await response.json()
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || 'Failed to submit project approval response.')
    }

    return data
  }

  const submitRequiredResources = async (projectId, requestedResources) => {
    const pmId = getPmId()
    if (!pmId) {
      throw new Error('PM id not found')
    }

    // Approve the project alongside the required resource request
    await submitProjectApproval(projectId, 'Accept', 'Accepted by PM')

    // Filter out invalid or empty resource requests
    const resourcesToSubmit = requestedResources.filter(r => {
      const requiredVal = parseInt(r.required) || 0
      return requiredVal > 0 && r.roleName.trim() !== ''
    })

    if (resourcesToSubmit.length === 0) {
      return { success: true, message: 'No resources to submit' }
    }

    // Submit each resource
    for (const resource of resourcesToSubmit) {
      const requiredVal = parseInt(resource.required) || 0
      const response = await fetch(API_ENDPOINTS.CREATE_REQUIRED_RESOURCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pm_id: pmId,
          project_id: Number(projectId),
          resources_id: Number(projectId),
          role: resource.roleName.trim(),
          required_resource: requiredVal,
          status: 'pending'
        })
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Failed to add ${resource.roleName} resource.`)
      }
    }

    return { success: true, message: 'Required resources added successfully' }
  }
  const handleAcceptProject = async (projectId, requestedResources = null, shouldNavigate = false) => {
    setIsSubmittingApproval(true)
    try {
      if (requestedResources && requestedResources.length > 0) {
        await submitRequiredResources(projectId, requestedResources)
      } else {
        await submitProjectApproval(projectId, 'Accept', 'Accepted by PM')
      }
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, isAccepted: true, status: 'Scheduling in Progress', requestedResources }
            : p
        )
      )
      setShowToast({ type: 'success', message: 'Project accepted successfully! Proceeding to scheduling...' })
      setTimeout(() => {
        setShowToast(null)
        if (shouldNavigate) {
          navigate('/resource/resource-allocation')
        }
      }, 1500)
    } catch (error) {
      console.error('Project approval submit failed:', error)
      setShowToast({ type: 'error', message: error.message || 'Unable to accept project. Try again.' })
      setTimeout(() => setShowToast(null), 3500)
    } finally {
      setIsSubmittingApproval(false)
    }
  }

  const handleAddCustomResource = () => {
    setResourceRows(prev => [
      ...prev,
      {
        roleName: '',
        current: 0,
        required: '',
        placeholder: '0',
        isCustom: true
      }
    ])
  }

  const handleUpdateRequired = (index, value) => {
    setResourceRows(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, required: value };
      }
      return row;
    }));
  }

  const handleUpdateCustomRoleName = (index, name) => {
    setResourceRows(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, roleName: name };
      }
      return row;
    }));
  }

  const handleDeleteCustomResource = (index) => {
    setResourceRows(prev => prev.filter((_, idx) => idx !== index));
  }

  const handleDeclineProject = async (projectId, reason) => {
    setIsSubmittingApproval(true)
    try {
      await submitProjectApproval(projectId, 'Declined', reason)
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, isAccepted: false, status: 'Declined', declineReason: reason }
            : p
        )
      )
      setShowToast({ type: 'error', message: 'Project response submitted as declined.' })
      setTimeout(() => setShowToast(null), 3500)
    } catch (error) {
      console.error('Project approval submit failed:', error)
      setShowToast({ type: 'error', message: error.message || 'Unable to decline project. Try again.' })
      setTimeout(() => setShowToast(null), 3500)
    } finally {
      setIsSubmittingApproval(false)
    }
  }

  const onSubmitDecline = async () => {
    if (!declineReason.trim()) return
    await handleDeclineProject(selectedProject.id, declineReason.trim())
    setShowDeclineModal(false)
  }
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

  return (
    <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-2xl border-l-4 border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`rounded-full p-1.5 ${showToast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {showToast.type === 'success' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{showToast.message}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Workspace status updated.</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-[1280px]">
        {!selectedProjectId ? (
          /* Cards View */
          <div className="rounded-[28px] bg-white p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(3,10,24,0.14)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0">
                <ClipboardList size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-[1.8rem] font-bold tracking-tight text-slate-900 leading-tight sm:leading-none">
                  New Assigned Projects
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  You have <span className="font-semibold text-blue-600">{projects.filter(p => !p.isAccepted).length}</span> new projects assigned by PMO.
                </p>
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const ProjectIcon = isValidReactComponent(project.icon) ? project.icon : Briefcase
                return (
                  <div
                    key={project.id}
                    className="flex flex-col rounded-[18px] border border-slate-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${project.iconColor}`}>
                          {isValidReactComponent(ProjectIcon)
                            ? <ProjectIcon size={20} strokeWidth={2} />
                            : <Briefcase size={20} strokeWidth={2} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-[15px] leading-snug">
                            {project.name}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            {project.code}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${project.priority === 'High'
                        ? 'bg-rose-50 text-rose-600'
                        : project.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {project.priority}
                      </span>
                    </div>

                    {/* Date rows */}
                    <div className="mt-6 space-y-3.5 border-t border-slate-50 pt-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-400">Created On</span>
                        <span className="font-semibold text-slate-700">{project.createdOn}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-400">Target Date</span>
                        <span className="font-semibold text-slate-700">{project.dueDate}</span>
                      </div>

                      {/* Resources overlapping avatars */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-400">Resources Allocated</span>
                        <div className="flex items-center -space-x-2">
                          {project.resourcesAllocated.map((res, i) => (
                            <img
                              key={i}
                              src={res.avatar}
                              alt={res.name}
                              title={`${res.name} (${res.role})`}
                              className="h-6 w-6 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600">
                            +{project.resourcesAllocated.length > 2 ? 2 : 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    {(() => {
                      const statusInfo = getStatusDetails(project);
                      const StatusIcon = isValidReactComponent(statusInfo.icon) ? statusInfo.icon : Clock;
                      return (
                        <div className={`mt-6 flex flex-row items-center justify-between gap-3 rounded-xl p-3 text-xs border ${statusInfo.bg} transition-all duration-300`}>
                          <div className="flex items-center gap-1.5 font-semibold opacity-95 flex-shrink-0">
                            {isValidReactComponent(StatusIcon)
                              ? <StatusIcon size={14} className="flex-shrink-0" />
                              : <Clock size={14} className="flex-shrink-0" />}
                            <span>Status</span>
                          </div>
                          <span className="font-bold tracking-wide text-right">{statusInfo.label}</span>
                        </div>
                      )
                    })()}

                    {/* Action buttons */}
                    <div className="mt-6 flex flex-col gap-2.5">
                      <button
                        onClick={() => openProject(project.id, 'project-detail')}
                        className="w-full h-11 px-4 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        View Project
                      </button>

                      {project.status === 'Pending Acceptance' && (
                        <button
                          onClick={() => handleAcceptProject(project.id, true)}
                          className="w-full h-11 px-4 rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Calendar size={14} />
                          Go to Scheduling
                        </button>
                      )}

                      {project.status === 'Scheduling in Progress' && (
                        <button
                          onClick={() => navigate('/resource/resource-allocation')}
                          className="w-full h-11 px-4 rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-600 hover:bg-amber-50 hover:border-amber-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Calendar size={14} />
                          Continue Scheduling
                        </button>
                      )}

                      {(project.status === 'In Progress' || project.isAccepted) && (
                        <button
                          onClick={() => navigate('/all-project')}
                          className="w-full h-11 px-4 rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={14} />
                          Go to Project
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* View All projects link */}
            <div className="mt-8 flex justify-center border-t border-slate-50 pt-6">
              <button
                onClick={() => navigate('/all-project')}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
              >
                View All Projects
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : !selectedProject ? (
          /* selectedProjectId came from the URL (e.g. a refresh) but hasn't
             matched a fetched project yet — either still loading, or the id
             is stale/invalid. Don't render the detail view against
             `undefined`, and don't punt to the list either while a valid
             fetch is still in flight. */
          <div className="rounded-[28px] bg-white p-10 shadow-[0_24px_60px_rgba(3,10,24,0.14)] text-center">
            {isLoading ? (
              <p className="text-sm font-bold text-slate-500">Loading project…</p>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-700">Project not found.</p>
                <button
                  onClick={closeProject}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft size={14} />
                  Back to Projects
                </button>
              </>
            )}
          </div>
        ) : (
          /* Detail View */
          <div className="rounded-[28px] bg-white p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(3,10,24,0.14)]">
            {/* Back button */}
            <button
              onClick={closeProject}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 mb-6 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft size={14} />
              Back to Projects
            </button>

            {/* Header info */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <h1 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900 tracking-tight leading-tight sm:leading-none">
                      New Assigned Project
                    </h1>
                    {(() => {
                      const statusInfo = getStatusDetails(selectedProject);
                      const StatusIcon = isValidReactComponent(statusInfo.icon) ? statusInfo.icon : Clock;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                          {isValidReactComponent(StatusIcon)
                            ? <StatusIcon size={12} strokeWidth={2.5} className="flex-shrink-0" />
                            : <Clock size={12} strokeWidth={2.5} className="flex-shrink-0" />}
                          {statusInfo.label}
                        </span>
                      )
                    })()}
                  </div>
                  <p className="mt-2.5 text-sm font-medium text-slate-500">
                    PMO has created a new project and assigned you as Project Manager.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Info Grid */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="grid gap-y-6 gap-x-8 sm:grid-cols-2 md:grid-cols-3">
                {/* Project ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 flex-shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Project ID</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.id}</p>
                  </div>
                </div>
                {/* Project Name */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500 flex-shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Project Name</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.name}</p>
                  </div>
                </div>
                {/* Due Date */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 flex-shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due Date</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.dueDate}</p>
                  </div>
                </div>
                {/* Client Name */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 flex-shrink-0">
                    <Building size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Client Name</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientName}</p>
                  </div>
                </div>
                {/* Department */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 flex-shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.department}</p>
                  </div>
                </div>
                {/* Priority */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 flex-shrink-0">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-sm font-bold text-rose-600">{selectedProject.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification alert banner */}
            {!selectedProject.isAccepted ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold text-amber-700">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                <span>Please review the project details and confirm your acceptance</span>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>You have accepted this project. The project is now allocated to you.</span>
              </div>
            )}

            {/* Tabs Selector */}
            <div className="mt-8 border-b border-slate-100 overflow-x-auto scrollbar-none">
              <div className="flex gap-4 sm:gap-6 text-sm font-bold min-w-max pb-px">
                <button
                  onClick={() => changeTab('project-detail')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'project-detail'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Project Detail
                </button>
                <button
                  onClick={() => changeTab('client-details')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'client-details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Client Details
                </button>
                <button
                  onClick={() => changeTab('resource')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'resource'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Resource
                </button>
                <button
                  onClick={() => changeTab('payment-milestone')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'payment-milestone'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Payment Milestone
                </button>
              </div>
            </div>

            {/* Tab content area */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/20 p-6">
              {activeTab === 'project-detail' && (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {/* Project ID */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Project ID</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.id}</p>
                    </div>
                  </div>
                  {/* Project Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500 flex-shrink-0">
                      <Layers size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Project Name</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.name}</p>
                    </div>
                  </div>
                  {/* Due Date */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 flex-shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due Date</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.dueDate}</p>
                    </div>
                  </div>
                  {/* Client Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 flex-shrink-0">
                      <Building size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Client Name</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientName}</p>
                    </div>
                  </div>
                  {/* Department */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.department}</p>
                    </div>
                  </div>
                  {/* Priority */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 flex-shrink-0">
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-sm font-bold text-rose-600">{selectedProject.priority}</span>
                      </div>
                    </div>
                  </div>
                  {/* Document */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 flex-shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Document</p>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          alert('Downloading project files...')
                        }}
                        className="text-sm font-bold text-rose-500 hover:text-rose-600 transition flex items-center gap-1.5 mt-0.5"
                      >
                        Download
                        <Download size={13} />
                      </a>
                    </div>
                  </div>
                  {/* Project Status */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const statusInfo = getStatusDetails(selectedProject);
                      const StatusIcon = isValidReactComponent(statusInfo.icon) ? statusInfo.icon : Clock;
                      return (
                        <>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 bg-blue-50 text-blue-500`}>
                            {isValidReactComponent(StatusIcon)
                              ? <StatusIcon size={18} />
                              : <Clock size={18} />}
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Project Status</p>
                            <p className="text-sm font-bold mt-0.5 text-slate-800">{statusInfo.label}</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}

              {activeTab === 'client-details' && (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 flex-shrink-0">
                      <Building size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company Name</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientDetails.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500 flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientDetails.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Person Name</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientDetails.personName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500 flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mobile Number</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientDetails.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email ID</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientDetails.emailId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500 flex-shrink-0">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.clientDetails.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resource' && (
                <div>
                  <div className="mb-4">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition">
                      In-house
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                    <table className="w-full text-left text-xs text-slate-500">
                      <thead>
                        <tr className="bg-[#edf3f8] text-[#39485c] border-b border-slate-100">
                          <th className="px-4 py-3 font-bold w-[70px]">Sr.no</th>
                          <th className="px-4 py-3 font-bold">Role</th>
                          <th className="px-4 py-3 font-bold">Resource Name</th>
                          <th className="px-4 py-3 font-bold">Allocation%</th>
                          <th className="px-4 py-3 font-bold">Working Days</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {selectedProject.resourcesAllocated.map((res, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3.5 text-slate-400">{index + 1}.</td>
                            <td className="px-4 py-3.5 text-slate-700">{res.role}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={res.avatar}
                                  alt={res.name}
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                                <span className="text-slate-700">{res.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                {index === 2 ? '70%' : '100%'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                  const isSelected = idx !== 6 // Sunday is unchecked
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold border transition ${isSelected
                                        ? 'bg-[#18498a] border-[#18498a] text-white shadow-sm'
                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                        }`}
                                      title={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx]}
                                    >
                                      {day}
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'payment-milestone' && (
                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead>
                      <tr className="bg-[#edf3f8] text-[#39485c] border-b border-slate-100">
                        <th className="px-4 py-3 font-bold w-[70px]">Sr.no</th>
                        <th className="px-4 py-3 font-bold">Milestone</th>
                        <th className="px-4 py-3 font-bold">Milestone Date</th>
                        <th className="px-4 py-3 font-bold">Milestone Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedProject.paymentMilestones.map((milestone, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3.5 text-slate-400">{index + 1}.</td>
                          <td className="px-4 py-3.5 text-slate-700">{milestone.milestone}</td>
                          <td className="px-4 py-3.5 text-slate-700">{milestone.milestone_date}</td>
                          <td className="px-4 py-3.5 text-slate-700">
                            <span className="font-bold text-slate-800">{milestone.percentage}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Action Bar footer */}
            {!selectedProject.isAccepted ? (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                <div>
                  <h4 className="font-bold text-slate-800">Confirm Your Response</h4>
                  <p className="text-xs text-slate-500 mt-1">Please confirm if you accept this project or need any changes.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setDeclineReason('')
                      setShowDeclineModal(true)
                    }}
                    className="flex-1 sm:flex-none h-11 px-6 rounded-xl border border-[#18498a] bg-white text-xs font-bold text-[#18498a] hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      const initial = getInitialResources(selectedProject)
                      setResourceRows(initial)
                      setShowConfirmModal(true)
                    }}
                    className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#2dbc40] text-xs font-bold text-white shadow-sm hover:bg-[#25a337] hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 flex-shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Project Accepted!</h4>
                    <p className="text-xs text-slate-500 mt-1">This project has been added to your portfolio and scheduling can begin.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate('/resource/resource-allocation')}
                    className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#18498a] text-xs font-bold text-white shadow-sm hover:bg-[#123666] hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                  >
                    <Calendar size={14} />
                    Go to Scheduling
                  </button>
                  <button
                    onClick={closeProject}
                    className="flex-1 sm:flex-none h-11 px-6 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowDeclineModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#eef4fc] px-6 py-4 flex items-center justify-between border-b border-blue-100/50">
              <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">Declined Project</h3>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100/50"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-xs text-slate-500 font-medium mb-4">Please Provide a reason for declining</p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Reason for Declining <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => {
                    if (e.target.value.length <= 400) {
                      setDeclineReason(e.target.value);
                    }
                  }}
                  placeholder="Enter Reason for declining for project........."
                  className="w-full min-h-[120px] p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition duration-200 resize-none font-medium text-slate-800"
                />
                <div className="text-right text-[10px] font-semibold text-slate-400 mt-1">
                  {declineReason.length}/400
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 p-4 bg-slate-50/50">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-8 h-10 rounded-xl bg-[#e8f1fc] hover:bg-[#d8e8fc] active:scale-[0.98] text-xs font-bold text-blue-600 transition flex items-center justify-center cursor-pointer min-w-[110px]"
              >
                Cancel
              </button>
              <button
                onClick={onSubmitDecline}
                disabled={!declineReason.trim() || isSubmittingApproval}
                className="px-8 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-xs font-bold text-white shadow-sm transition flex items-center justify-center cursor-pointer min-w-[110px] disabled:opacity-50 disabled:pointer-events-none"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Required Resource Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[450px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
            {/* Header */}
            <div className="bg-[#eef4fc] px-6 py-4 flex items-center justify-between border-b border-blue-100/50">
              <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">Required Resource</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100/50"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
              <p className="text-[15px] text-[#0d2646] font-bold">
                Do you want to request additional resources ?
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-3 border-t border-slate-100 p-4 bg-slate-50/50">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleAcceptProject(selectedProject.id);
                }}
                className="px-6 h-11 rounded-xl bg-[#e8f1fc] hover:bg-[#d8e8fc] active:scale-[0.98] text-xs font-bold text-blue-600 transition flex items-center justify-center cursor-pointer min-w-[130px]"
              >
                No, but accept
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowAddResourceModal(true);
                }}
                disabled={isSubmittingApproval}
                className="px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-xs font-bold text-white shadow-sm transition flex items-center justify-center cursor-pointer min-w-[130px] disabled:opacity-50 disabled:pointer-events-none"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Required Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAddResourceModal(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[620px] max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
            {/* Header */}
            <div className="bg-[#eef4fc] px-6 py-4 flex items-center justify-between border-b border-blue-100/50 flex-shrink-0">
              <h3 className="text-[14px] font-bold text-slate-800 tracking-wide">Add Required Resource</h3>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100/50"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead>
                    <tr className="bg-[#edf3f8] text-[#39485c] border-b border-slate-100">
                      <th className="px-4 py-3 font-bold">Role</th>
                      <th className="px-4 py-3 font-bold text-center">Current</th>
                      <th className="px-4 py-3 font-bold text-center w-[140px]">Required</th>
                      <th className="px-4 py-3 font-bold text-center">Additional Needed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {resourceRows.map((row, index) => {
                      // Determine role badge style
                      let badgeClass = "bg-rose-50 text-rose-600";
                      if (row.roleName.toLowerCase().includes('developer')) {
                        badgeClass = "bg-emerald-50 text-emerald-600";
                      } else if (row.roleName.toLowerCase().includes('tester')) {
                        badgeClass = "bg-purple-50 text-purple-600";
                      } else if (row.roleName.toLowerCase().includes('designer') || row.roleName.toLowerCase().includes('ui')) {
                        badgeClass = "bg-orange-50 text-orange-600";
                      }

                      // Calculate Additional Needed
                      const reqVal = parseInt(row.required) || 0;
                      const addNeeded = Math.max(0, row.current + reqVal);

                      return (
                        <tr key={index}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${badgeClass}`}>
                                <User size={14} strokeWidth={2.5} />
                              </div>
                              {row.isCustom ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    placeholder="Enter role required"
                                    value={row.roleName}
                                    onChange={(e) => handleUpdateCustomRoleName(index, e.target.value)}
                                    className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-blue-500 focus:bg-white focus:outline-none text-slate-800 bg-slate-50/50"
                                  />
                                  <button
                                    onClick={() => handleDeleteCustomResource(index)}
                                    className="text-slate-400 hover:text-rose-500 transition p-1 hover:bg-rose-50 rounded-lg flex-shrink-0 cursor-pointer"
                                    title="Delete Resource"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-bold text-slate-700">{row.roleName}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                            {row.current}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = parseInt(row.required) || 0;
                                  if (currentVal > -row.current) {
                                    handleUpdateRequired(index, String(currentVal - 1));
                                  }
                                }}
                                className="flex h-9 w-9 items-center justify-center bg-transparent text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Minus size={14} strokeWidth={2.5} />
                              </button>
                              <input
                                type="number"
                                min={-row.current}
                                placeholder={row.placeholder}
                                value={row.required}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '') {
                                    handleUpdateRequired(index, '');
                                  } else {
                                    const parsed = parseInt(val);
                                    if (!isNaN(parsed) && parsed >= -row.current) {
                                      handleUpdateRequired(index, String(parsed));
                                    }
                                  }
                                }}
                                className="h-9 w-12 border-x border-slate-200 bg-white text-center text-xs font-bold text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = parseInt(row.required) || 0;
                                  handleUpdateRequired(index, String(currentVal + 1));
                                }}
                                className="flex h-9 w-9 items-center justify-center bg-transparent text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-block px-3 py-1 bg-[#e2f7e3] text-[#219653] font-bold text-xs rounded-lg min-w-[36px]">
                              {addNeeded}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add More Resource Button */}
              <button
                onClick={handleAddCustomResource}
                className="w-full py-2.5 mt-4 border border-dashed border-blue-300 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50/50 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} strokeWidth={2.5} /> Add More Resource
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4 bg-slate-50/50 flex-shrink-0">
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="px-6 h-10 rounded-xl bg-[#e8f1fc] hover:bg-[#d8e8fc] active:scale-[0.98] text-xs font-bold text-blue-600 transition flex items-center justify-center cursor-pointer min-w-[110px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const cleanedRows = resourceRows.map(row => ({
                    ...row,
                    required: row.required === '' ? 0 : parseInt(row.required) || 0
                  }));
                  setShowAddResourceModal(false);
                  handleAcceptProject(selectedProject.id, cleanedRows);
                }}
                disabled={isSubmittingApproval}
                className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-xs font-bold text-white shadow-sm transition flex items-center justify-center cursor-pointer min-w-[110px] disabled:opacity-50 disabled:pointer-events-none"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewAssignedProjectPage
