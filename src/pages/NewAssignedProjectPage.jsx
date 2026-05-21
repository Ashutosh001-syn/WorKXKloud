import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

const DEFAULT_PROJECTS = [
  {
    id: 'PJ-2026001',
    code: 'XPM-2024-001',
    name: 'Website Redesign',
    clientName: 'ABC Corporation',
    dueDate: '30 Jun 2026',
    createdOn: '10 May 2024',
    department: 'IT',
    priority: 'High',
    priorityColor: 'text-[#f56a5d] bg-[#ffe6e3]',
    status: 'Pending Acceptance',
    isAccepted: false,
    icon: Briefcase,
    iconColor: 'bg-emerald-50 text-emerald-600',
    resourcesAllocated: [
      { name: 'Ravi Sharma', role: 'Tester', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format' },
      { name: 'Sagar Patel', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format' },
      { name: 'Anita Verma', role: 'Ui Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format' },
    ],
    clientDetails: {
      companyName: 'R & S Technologies',
      location: 'Noida',
      personName: 'Nishant',
      mobileNumber: '982723688',
      emailId: 'nishant@gmail.com',
      role: 'Sales',
    },
    paymentMilestones: [
      { srNo: 1, milestone: 'BRD Sign off', person: 'Ravi Sharma', percentage: '100%' },
      { srNo: 2, milestone: 'Designing', person: 'Sagar Patel', percentage: '00' },
      { srNo: 3, milestone: 'Development process', person: 'Anita Verma', percentage: '70%' },
    ],
  },
  {
    id: 'PJ-2026002',
    code: 'XPM-2024-002',
    name: 'Mobile App Development',
    clientName: 'XYZ Corporation',
    dueDate: '20 Jul 2026',
    createdOn: '08 May 2024',
    department: 'IT',
    priority: 'High',
    priorityColor: 'text-[#f56a5d] bg-[#ffe6e3]',
    status: 'Scheduling in Progress',
    isAccepted: false,
    icon: Smartphone,
    iconColor: 'bg-amber-50 text-amber-600',
    resourcesAllocated: [
      { name: 'Sagar Patel', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format' },
      { name: 'Anita Verma', role: 'Ui Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format' },
      { name: 'Ravi Sharma', role: 'Tester', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format' },
    ],
    clientDetails: {
      companyName: 'XYZ Corporation',
      location: 'Gurgaon',
      personName: 'Aman',
      mobileNumber: '9811223344',
      emailId: 'aman@xyz.com',
      role: 'Project Head',
    },
    paymentMilestones: [
      { srNo: 1, milestone: 'UX Design Signoff', person: 'Anita Verma', percentage: '20%' },
      { srNo: 2, milestone: 'App Prototype', person: 'Sagar Patel', percentage: '30%' },
      { srNo: 3, milestone: 'App Build Signoff', person: 'Ravi Sharma', percentage: '50%' },
    ],
  },
  {
    id: 'PJ-2026003',
    code: 'XPM-2024-003',
    name: 'Data Analytics Platform',
    clientName: 'ABC Corporation',
    dueDate: '15 Aug 2026',
    createdOn: '05 May 2024',
    department: 'IT',
    priority: 'Low',
    priorityColor: 'text-[#2bbb44] bg-[#ddf9df]',
    status: 'In Progress',
    isAccepted: false,
    icon: Cloud,
    iconColor: 'bg-indigo-50 text-indigo-600',
    resourcesAllocated: [
      { name: 'Ravi Sharma', role: 'Tester', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format' },
      { name: 'Sagar Patel', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format' },
      { name: 'Anita Verma', role: 'Ui Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format' },
      { name: 'Neha Gupta', role: 'Data Analyst', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format' },
    ],
    clientDetails: {
      companyName: 'ABC Corporation',
      location: 'Mumbai',
      personName: 'Vikram',
      mobileNumber: '9988776655',
      emailId: 'vikram@abc.com',
      role: 'Director',
    },
    paymentMilestones: [
      { srNo: 1, milestone: 'Requirement Specification', person: 'Neha Gupta', percentage: '10%' },
      { srNo: 2, milestone: 'Architecture Design', person: 'Sagar Patel', percentage: '20%' },
      { srNo: 3, milestone: 'Core Processing Unit', person: 'Anita Verma', percentage: '40%' },
      { srNo: 4, milestone: 'Analytics Dashboard', person: 'Ravi Sharma', percentage: '30%' },
    ],
  },
]

function NewAssignedProjectPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('assigned_projects_list')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return DEFAULT_PROJECTS.map(defaultP => {
          const savedP = parsed.find(p => p.id === defaultP.id)
          if (savedP) {
            return { ...defaultP, isAccepted: savedP.isAccepted, status: savedP.status }
          }
          return defaultP
        })
      } catch (e) {
        return DEFAULT_PROJECTS
      }
    }
    return DEFAULT_PROJECTS
  })

  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [activeTab, setActiveTab] = useState('project-detail')
  const [showToast, setShowToast] = useState(null)

  // Save projects to local storage and dispatch badge updates
  useEffect(() => {
    localStorage.setItem('assigned_projects_list', JSON.stringify(projects))
    const pendingCount = projects.filter(p => !p.isAccepted).length
    localStorage.setItem('assigned_projects_badge', pendingCount.toString())
    window.dispatchEvent(new Event('badge-update'))
  }, [projects])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const handleAcceptProject = (projectId) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, isAccepted: true, status: 'Accepted by PM' }
          : p
      )
    )
    setShowToast({ type: 'success', message: 'Project accepted successfully!' })
    setTimeout(() => setShowToast(null), 3500)
  }

  const handleDeclineProject = (projectId) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, isAccepted: false, status: 'Declined' }
          : p
      )
    )
    setShowToast({ type: 'error', message: 'Project response submitted as declined.' })
    setTimeout(() => setShowToast(null), 3500)
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
          <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(3,10,24,0.14)] sm:p-8">
            <div className="flex items-center gap-4.5 border-b border-slate-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ClipboardList size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-[1.8rem] font-bold tracking-tight text-slate-900 leading-none">
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
                const ProjectIcon = project.icon
                return (
                  <div
                    key={project.id}
                    className="flex flex-col rounded-[18px] border border-slate-100 bg-white p-5.5 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${project.iconColor}`}>
                          <ProjectIcon size={20} strokeWidth={2} />
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
                              className="h-6.5 w-6.5 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600">
                            +{project.resourcesAllocated.length > 2 ? 2 : 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50/70 p-3 text-xs border border-slate-100">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                        {project.isAccepted ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <Clock size={14} className="text-amber-500" />
                        )}
                        <span>Status</span>
                      </div>
                      <span className={`font-bold ${project.isAccepted
                          ? 'text-emerald-600'
                          : project.status === 'Declined'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}>
                        {project.isAccepted ? 'Accepted by PM' : project.status}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5.5 flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setSelectedProjectId(project.id)
                          setActiveTab('project-detail')
                        }}
                        className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                      >
                        View Project
                      </button>

                      {project.status === 'Pending Acceptance' && (
                        <button
                          onClick={() => handleAcceptProject(project.id)}
                          className="flex-1 rounded-xl border border-blue-200 bg-white py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1"
                        >
                          <Calendar size={13} />
                          Go to Scheduling
                        </button>
                      )}

                      {project.status === 'Scheduling in Progress' && (
                        <button
                          onClick={() => navigate('/resource/resource-allocation')}
                          className="flex-1 rounded-xl border border-amber-200 bg-white py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 transition flex items-center justify-center gap-1"
                        >
                          <Calendar size={13} />
                          Continue Scheduling
                        </button>
                      )}

                      {(project.status === 'In Progress' || project.isAccepted) && (
                        <button
                          onClick={() => navigate('/all-project')}
                          className="flex-1 rounded-xl border border-blue-200 bg-white py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-1"
                        >
                          <Check size={13} />
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
        ) : (
          /* Detail View */
          <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(3,10,24,0.14)] sm:p-8">
            {/* Back button */}
            <button
              onClick={() => setSelectedProjectId(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 mb-6 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft size={14} />
              Back to Projects
            </button>

            {/* Header info */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <h1 className="text-[1.8rem] font-bold text-slate-900 tracking-tight leading-none">
                  New Assigned Project
                </h1>
              </div>
              <p className="mt-2.5 text-sm font-medium text-slate-500">
                PMO has created a new project and assigned you as Project Manager.
              </p>
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
            <div className="mt-8 border-b border-slate-100">
              <div className="flex flex-wrap gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab('project-detail')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'project-detail'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Project Detail
                </button>
                <button
                  onClick={() => setActiveTab('client-details')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'client-details'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Client Details
                </button>
                <button
                  onClick={() => setActiveTab('resource')}
                  className={`pb-3.5 transition-all relative ${activeTab === 'resource'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Resource
                </button>
                <button
                  onClick={() => setActiveTab('payment-milestone')}
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
                  {/* Department (repeated as in mockup) */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedProject.department}</p>
                    </div>
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
                                      className={`flex h-6.5 w-6.5 items-center justify-center rounded-full text-[10px] font-bold border transition ${isSelected
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
                          <td className="px-4 py-3.5 text-slate-700">{milestone.person}</td>
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
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDeclineProject(selectedProject.id)}
                    className="rounded-xl border border-[#18498a] bg-white px-6 py-2.5 text-xs font-bold text-[#18498a] hover:bg-blue-50 transition"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptProject(selectedProject.id)}
                    className="rounded-xl bg-[#2dbc40] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#25a337] transition flex items-center gap-1"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Project Accepted!</h4>
                    <p className="text-xs text-slate-500 mt-1">This project has been added to your portfolio and scheduling can begin.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewAssignedProjectPage
