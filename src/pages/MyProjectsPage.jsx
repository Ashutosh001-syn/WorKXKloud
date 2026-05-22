import { useState } from 'react'
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
  Inbox
} from 'lucide-react'
import GanttChart from '../components/projects/GanttChart'

const MY_PROJECTS_DATA = [
  {
    id: 'PJ-2026001',
    code: 'XPM-2024-001',
    name: 'Website Redesign',
    priority: 'Medium',
    priorityColor: 'bg-amber-50 text-amber-600 border border-amber-100/50',
    icon: Layout,
    iconColor: 'bg-emerald-50 text-emerald-600',
    createdOn: '10 May 2024',
    targetDate: '30 Jun 2024',
    actualStartDate: '-',
    endDate: '30 Jun 2024',
    pmName: 'Rahul Sharma',
    pmAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&auto=format',
    allocatedResources: [
      { name: 'Ravi Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format' },
      { name: 'Sagar Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format' },
      { name: 'Anita Verma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format' }
    ],
    plusCount: '+2'
  },
  {
    id: 'PJ-2026002',
    code: 'XPM-2024-002',
    name: 'Mobile App Development',
    priority: 'High',
    priorityColor: 'bg-rose-50 text-rose-600 border border-rose-100/50',
    icon: Smartphone,
    iconColor: 'bg-amber-50 text-amber-600',
    createdOn: '08 May 2024',
    targetDate: '20 Jul 2024',
    actualStartDate: '-',
    endDate: '20 Jul 2024',
    pmName: 'Rahul Sharma',
    pmAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&auto=format',
    allocatedResources: [
      { name: 'Sagar Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format' },
      { name: 'Anita Verma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format' },
      { name: 'Ravi Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format' }
    ],
    plusCount: '+1'
  },
  {
    id: 'PJ-2026003',
    code: 'XPM-2024-003',
    name: 'Data Analytics Platform',
    priority: 'Low',
    priorityColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    icon: Cloud,
    iconColor: 'bg-indigo-50 text-indigo-600',
    createdOn: '05 May 2024',
    targetDate: '15 Aug 2024',
    actualStartDate: '-',
    endDate: '15 Aug 2024',
    pmName: 'Rahul Sharma',
    pmAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&auto=format',
    allocatedResources: [
      { name: 'Ravi Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format' },
      { name: 'Anita Verma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format' },
      { name: 'Sagar Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format' }
    ],
    plusCount: '+3'
  }
]

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

    {/* Cardboard Box */}
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
  if (project.id === 'PJ-2026001') {
    return {
      data: [
        { id: "wbs", text: "Work Breakdown Structure (WBS)", start_date: "2020-06-08", duration: 15, progress: 0.7, open: true, borderClass: "border-left-none", barClass: "gantt-bar-dark-green", type: "project" },
        { id: "task1", text: "Create WBS to work-level execution", start_date: "2020-06-08", duration: 10, progress: 0.8, parent: "wbs", borderClass: "border-left-yellow", barClass: "gantt-bar-yellow", assignees: "Adil Rashid, Ajay Singh, Komal Joshi, Preeti Kumar, Roma Mehta" },
        { id: "task2", text: "Define task dependencies (including lead/lag time)", start_date: "2020-06-15", duration: 5, progress: 0.5, parent: "wbs", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Adil Rashid, Ajay Singh, Komal Joshi, Preeti Kumar, Roma Mehta" },

        { id: "pbm", text: "Performance Baseline Measurement", start_date: "2020-06-20", duration: 15, progress: 0.4, open: true, borderClass: "border-left-none", barClass: "gantt-bar-dark-green", type: "project" },
        { id: "task3", text: "Create schedule baseline (with explanation on deviations)", start_date: "2020-06-20", duration: 12, progress: 0.6, parent: "pbm", borderClass: "border-left-none", barClass: "gantt-bar-pink", assignees: "Ajay Singh" },
        { id: "task4", text: "Define budget baseline (with schedule links)", start_date: "2020-06-25", duration: 7, progress: 0.4, parent: "pbm", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Ajay Singh" },
        { id: "task5", text: "Establish baseline tolerance thresholds", start_date: "2020-06-27", duration: 5, progress: 0.2, parent: "pbm", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Ajay Singh", userWarning: true },

        { id: "pp", text: "Procurement Planning (Research Vendors, RFPs)", start_date: "2020-06-08", duration: 30, progress: 0.3, open: true, borderClass: "border-left-none", barClass: "gantt-bar-dark-green", type: "project" },
        { id: "task6", text: "Analyze market conditions", start_date: "2020-06-08", duration: 10, progress: 0.5, parent: "pp", borderClass: "border-left-green", barClass: "gantt-bar-green", assignees: "Mira Kapur" },
        { id: "task7", text: "Analyze make-or-buy findings", start_date: "2020-06-18", duration: 15, progress: 0.0, parent: "pp", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Mira Kapur", userWarning: true },
        { id: "task8", text: "Select contract type", start_date: "2020-06-20", duration: 10, progress: 0.0, parent: "pp", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Mira Kapur" },
        { id: "task9", text: "Develop procurement management plan", start_date: "2020-06-25", duration: 15, progress: 0.0, parent: "pp", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Adil Rashid, Ajay Singh, Preeti Kumar, Roma Mehta", userWarning: true },
        { id: "task10", text: "Develop statement of work", start_date: "2020-06-28", duration: 18, progress: 0.0, parent: "pp", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Adil Rashid, Ajay Singh, Komal Joshi, Mira Kapur, Preeti Kumar, Roma Mehta" },

        { id: "psp", text: "Project Schedule Plan", start_date: "2020-06-28", duration: 1, progress: 0.0, open: true, borderClass: "border-left-green", barClass: "gantt-bar-green", type: "milestone" }
      ],
      links: [
        { id: "l1", source: "task1", target: "task2", type: "0" },
        { id: "l2", source: "task2", target: "task3", type: "0" },
        { id: "l3", source: "task3", target: "task4", type: "0" },
        { id: "l4", source: "task4", target: "task5", type: "0" },
        { id: "l5", source: "task6", target: "task7", type: "0" },
        { id: "l6", source: "task7", target: "task8", type: "0" },
        { id: "l7", source: "task8", target: "task10", type: "0" },
        { id: "l8", source: "task10", target: "psp", type: "0" }
      ]
    };
  } else {
    return {
      data: [
        { id: "wbs", text: "Work Breakdown Structure (WBS)", start_date: "2020-06-08", duration: 15, progress: 0.5, open: true, borderClass: "border-left-none", barClass: "gantt-bar-dark-green", type: "project" },
        { id: "task1", text: "Create WBS to work-level execution", start_date: "2020-06-08", duration: 10, progress: 0.6, parent: "wbs", borderClass: "border-left-yellow", barClass: "gantt-bar-yellow", assignees: "Sagar Patel, Anita Verma" },
        { id: "task2", text: "Define task dependencies", start_date: "2020-06-15", duration: 5, progress: 0.2, parent: "wbs", borderClass: "border-left-blue", barClass: "gantt-bar-blue", assignees: "Sagar Patel, Anita Verma" }
      ],
      links: [
        { id: "l1", source: "task1", target: "task2", type: "0" }
      ]
    };
  }
};

function MyProjectsPage() {
  const navigate = useNavigate()
  const [projects] = useState(MY_PROJECTS_DATA)
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')

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
              </div>

              {/* Projects Grid */}
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const ProjectIcon = project.icon
                  return (
                    <div
                      key={project.id}
                      className="flex flex-col rounded-[20px] border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Top Section */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${project.iconColor} shadow-sm`}>
                            <ProjectIcon size={22} strokeWidth={2} />
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
                      </div>

                      {/* Priority Badge */}
                      <div className="mt-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${project.priorityColor}`}>
                          {project.priority}
                        </span>
                      </div>

                      {/* Details Table */}
                      <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5">

                        {/* Created On */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <Calendar size={14} className="text-slate-400" />
                            Created On
                          </span>
                          <span className="font-semibold text-slate-700">{project.createdOn}</span>
                        </div>

                        {/* Target Date */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <Compass size={14} className="text-slate-400" />
                            Target Date
                          </span>
                          <span className="font-semibold text-slate-700">{project.targetDate}</span>
                        </div>

                        {/* Actual Start Date */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <BarChart3 size={14} className="text-slate-400" />
                            Actual Start Date
                          </span>
                          <span className="font-semibold text-slate-700">{project.actualStartDate}</span>
                        </div>

                        {/* End Date */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <Calendar size={14} className="text-slate-400" />
                            End Date
                          </span>
                          <span className="font-semibold text-slate-700">{project.endDate}</span>
                        </div>

                        {/* PM */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <User size={14} className="text-slate-400" />
                            PM
                          </span>
                          <div className="flex items-center gap-2">
                            <img
                              src={project.pmAvatar}
                              alt={project.pmName}
                              className="h-6 w-6 rounded-full border border-slate-100 object-cover"
                            />
                            <span className="font-semibold text-slate-700">{project.pmName}</span>
                          </div>
                        </div>

                        {/* Resources Allocated */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <Users size={14} className="text-slate-400" />
                            Resources Allocated
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center -space-x-1.5">
                              {project.allocatedResources.map((res, i) => (
                                <img
                                  key={i}
                                  src={res.avatar}
                                  alt={res.name}
                                  title={res.name}
                                  className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-sm"
                                />
                              ))}
                            </div>
                            <span className="flex h-5 items-center justify-center rounded-full bg-blue-50 px-1.5 text-[9px] font-bold text-blue-600">
                              {project.plusCount}
                            </span>
                          </div>
                        </div>

                      </div>

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
            </>
          ) : (
            <>
              {/* Project Detail Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <h1 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900 tracking-tight leading-tight">
                      {selectedProject.name}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-slate-500">
                    <span>PMO</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-blue-600 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full">
                      Draft
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-amber-600 bg-amber-50 border border-amber-100 px-3 py-0.5 rounded-full flex items-center gap-1">
                      <span className="text-[10px] text-amber-500">▲</span>
                      Normal
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
                    {selectedProject.name === 'Website Redesign' ? '27-Mar-2026' : (selectedProject.createdOn || '27-Mar-2026')}
                  </div>
                  <div className="relative mt-3.5 flex items-center w-full max-w-[260px]">
                    <div className="h-[3px] w-full bg-blue-100 rounded-full relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] w-[15%] bg-blue-600 rounded-full" />
                      <div className="absolute left-[15%] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-[#0d2646] border-2 border-white shadow-sm cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs list */}
              <div className="mt-6 border-b border-slate-100 overflow-x-auto scrollbar-none">
                <div className="flex justify-between items-center text-sm font-bold w-full pb-px px-2 sm:px-6">
                  {['Overview', 'Schedule', 'Backlog', 'Board', 'Timeline', 'Discussion', 'Financial'].map((tab) => (
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
                    {/* Task Status */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[320px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800">Task Status</h3>
                        <button className="text-slate-400 hover:text-slate-600 transition">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="mb-3">
                          <EmptyBoxIcon />
                        </div>
                        <p className="text-xs font-bold text-slate-400">No data to display</p>
                      </div>
                    </div>

                    {/* Project Revenue */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Project Revenue</h3>
                        <p className="text-[2.2rem] font-bold text-slate-800 mt-4 leading-none">0</p>
                      </div>
                      <div className="h-1 w-full bg-blue-500 rounded-full absolute bottom-0 left-0" />
                    </div>
                  </div>

                  {/* Middle Column (Project Requests) */}
                  <div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[486px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <button className="flex items-center gap-1 text-sm font-bold text-slate-800">
                          Project Requests
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="mb-3">
                          <EmptyBoxIcon />
                        </div>
                        <h4 className="text-xs font-bold text-slate-700">Nothing to show here</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                          Adjust your filters or ensure this report has data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Project Details) */}
                  <div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 pb-3 mb-4">Project Details</h3>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manager</p>
                          <p className="font-bold text-slate-700 mt-1">PMO</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planned Start</p>
                          <p className="font-bold text-slate-700 mt-1">
                            {selectedProject.name === 'Website Redesign' ? '27-Mar-26' : (selectedProject.createdOn || '27-Mar-26')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State</p>
                          <p className="font-bold text-slate-700 mt-1">Draft</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clients</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                          <p className="font-bold text-slate-700 mt-1">Infrastructure</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>

                        {/* Block 1 */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Type</p>
                          <p className="font-bold text-slate-700 mt-1">No Billing</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                          <p className="font-bold text-slate-700 mt-1">$0.00</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FixedPrice</p>
                          <p className="font-bold text-slate-700 mt-1">$0.00</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</p>
                          <p className="font-bold text-slate-700 mt-1">Normal</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</p>
                          <p className="font-bold text-slate-700 mt-1">Default</p>
                        </div>

                        {/* Block 2 */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Type</p>
                          <p className="font-bold text-slate-700 mt-1">No Billing</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                          <p className="font-bold text-slate-700 mt-1">$0.00</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">FixedPrice</p>
                          <input
                            type="text"
                            readOnly
                            value="$0.00"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-bold outline-none text-[12px]"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio</p>
                          <p className="font-bold text-slate-700 mt-1"></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</p>
                          <p className="font-bold text-slate-700 mt-1">Normal</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</p>
                          <p className="font-bold text-slate-700 mt-1">Default</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : activeTab === 'Schedule' ? (
                <GanttChart
                  tasks={getMockTasksForProject(selectedProject)}
                  projectName={selectedProject.name}
                  onClose={() => setActiveTab('Overview')}
                />
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
