import { createElement, startTransition, useEffect, useState } from 'react'
import {
  BriefcaseBusiness,
  CalendarRange,
  Funnel,
  PencilLine,
  Search,
  Eye,
  UserRound,
  FileText,
  Copy,
  ChevronDown,
  X,
  History,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import CreateProjectWizardModal from '../components/projects/CreateProjectWizardModal'
import { API_ENDPOINTS } from '../config/api'

const PROJECT_STORAGE_KEY = 'workxkloud_projects_create_mock_v2'

function getDefaultFormValues() {
  return {
    projectCode: '',
    name: '',
    clientName: '',
    pm: '',
    techLead: '',
    technology: '',
    status: 'Allocated',
    priority: '',
    budget: '0',
    plannedStartDate: '',
    deadline: '',
    state: '',
    projectType: '',
    description: '',
    portfolio: '',
    billing: 'No Billing',
    defaultTaskSchedule: 'Fixed Effort',
    options: {
      tasksStartAfterPredecessors: false,
      skipEmailNotification: false,
      assumeOnTimeAndBudget: false,
      autoSubscribeTeamMembers: false,
    },
  }
}

function mapProjectToFormValues(project = {}) {
  const defaults = getDefaultFormValues()

  return {
    ...defaults,
    name: project.project_name ?? project.name ?? defaults.name,
    clientName: project.company_name ?? project.clientName ?? project.client ?? defaults.clientName,
    pm: project.project_manager ?? project.pm ?? project.owner ?? defaults.pm,
    techLead: project.technical_lead ?? project.tech_lead ?? project.techLead ?? defaults.techLead,
    technology: project.technology ?? defaults.technology,
    status: project.status ?? defaults.status,
    priority: project.priority ?? defaults.priority,
    budget: String(project.budget ?? defaults.budget),
    plannedStartDate: project.start_date ?? project.plannedStartDate ?? project.startDate ?? defaults.plannedStartDate,
    deadline: project.end_date ?? project.deadline ?? project.endDate ?? defaults.deadline,
    projectCode: project.project_code ?? project.projectCode ?? defaults.projectCode,
    state: project.state ?? defaults.state,
    projectType: project.project_type ?? project.projectType ?? defaults.projectType,
    description: project.project_scope ?? project.description ?? defaults.description,
    portfolio: project.portfolio ?? defaults.portfolio,
    billing: project.no_billing === "No" ? "No Billing" : (project.billing ?? defaults.billing),
    defaultTaskSchedule: project.defaultTaskSchedule ?? defaults.defaultTaskSchedule,
    contractDate: project.contact_sign_date ?? project.contractDate ?? null,
    duration: project.duration ?? defaults.duration,
    location: project.location ?? defaults.location,
    persons: (project.contacts ?? []).map(p => ({
      name: p.person_name || p.name || "",
      role: p.role || "",
      mobile: p.mobile || "",
      email: p.email || ""
    })),
    milestones: (project.milestones ?? []).map(m => {
      const dateVal = m.milestone_date || m.date;
      let parsedDate = null;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) parsedDate = d;
      }
      return {
        name: m.milestone || m.name || "",
        date: parsedDate,
        pct: String(m.percentage ?? m.pct ?? "")
      };
    }),
    resource_allocations: project.resource_allocations ?? [],
    options: {
      ...defaults.options,
      ...(project.options ?? {}),
    },
  }
}

const initialProjects = [
  {
    id: 1,
    name: 'Mobile App Refresh',
    client: 'Northwind',
    owner: 'Albert Flores',
    status: 'Allocated',
    priority: 'Medium',
    budget: '32000',
    startDate: '2026-04-28',
    endDate: '2026-04-30',
  },
  {
    id: 2,
    name: 'CRM Migration',
    client: 'BluePeak',
    owner: '',
    status: 'Deny',
    priority: 'High',
    budget: '78500',
    startDate: '2026-04-28',
    endDate: '2026-04-30',
    denyReason: 'Resources are currently over-allocated on other priority initiatives.',
    projectCode: 'P-2026002',
    projectType: 'Migration',
    description: 'Migration of existing customer data from legacy system to new cloud-based CRM platform.',
  },
  {
    id: 3,
    name: 'project name',
    client: 'asha',
    owner: 'Nathan Roberts',
    status: 'Accepted',
    priority: 'High',
    budget: '10000000',
    startDate: '2026-04-28',
    endDate: '2026-04-30',
    projectCode: 'P-2026003',
  },
]

function readProjects() {
  return []
}

// ─── Denied PM History Modal ───────────────────────────────────────────────────

const MOCK_HISTORY = [
  {
    id: 1,
    project: 'ERP Management',
    deniedBy: 'Rahul Sharma',
    denialDate: '05/04/2026, 05:00PM',
    denialReason: 'Tight Deadline',
    reassignedTo: 'Ankit Verma',
    reassignmentDate: '05/04/2026, 05:00PM',
  },
  {
    id: 2,
    project: 'ERP Management',
    deniedBy: 'Rahul Sharma',
    denialDate: '05/04/2026, 05:00PM',
    denialReason: 'Tight Deadline',
    reassignedTo: 'Ankit Verma',
    reassignmentDate: '05/04/2026, 05:00PM',
  },
  {
    id: 3,
    project: 'ERP Management',
    deniedBy: 'Rahul Sharma',
    denialDate: '05/04/2026, 05:00PM',
    denialReason: 'Tight Deadline',
    reassignedTo: 'Ankit Verma',
    reassignmentDate: '05/04/2026, 05:00PM',
  },
  {
    id: 4,
    project: 'ERP Management',
    deniedBy: 'Rahul Sharma',
    denialDate: '05/04/2026, 05:00PM',
    denialReason: 'Tight Deadline',
    reassignedTo: 'Ankit Verma',
    reassignmentDate: '05/04/2026, 05:00PM',
  },
  {
    id: 5,
    project: 'ERP Management',
    deniedBy: 'Rahul Sharma',
    denialDate: '05/04/2026, 05:00PM',
    denialReason: 'Tight Deadline',
    reassignedTo: 'Ankit Verma',
    reassignmentDate: '05/04/2026, 05:00PM',
  },
]

function DeniedPMHistoryModal({ isOpen, onClose }) {
  const [historySearch, setHistorySearch] = useState('')
  const [historyData, setHistoryData] = useState(MOCK_HISTORY)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    // Optionally fetch real data here
    // setIsLoadingHistory(true)
    // fetch(API_ENDPOINTS.DENIED_PM_HISTORY).then(...)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const filtered = historyData.filter((row) => {
    const q = historySearch.toLowerCase()
    return (
      row.project.toLowerCase().includes(q) ||
      row.deniedBy.toLowerCase().includes(q) ||
      row.reassignedTo.toLowerCase().includes(q) ||
      row.denialReason.toLowerCase().includes(q)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
      <div className="relative w-full max-w-[760px] rounded-[16px] bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-[16px] font-bold text-[#17365d]">Denied PM History</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-3">
          <div className="relative w-full max-w-xs">
            {!historySearch && (
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
            )}
            <input
              type="text"
              placeholder="Search by Project name"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="h-9 w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] pl-3 pr-8 text-[12px] text-[#17365d] outline-none focus:border-[#1191da] focus:bg-white transition-all placeholder:text-slate-400"
            />
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-[8px] border border-[#edf1f5]">
            <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-[11px] text-[#6f7e8f]">
                <colgroup>
                  <col className="w-[48px]" />
                  <col className="w-[130px]" />
                  <col className="w-[110px]" />
                  <col className="w-[130px]" />
                  <col className="w-[110px]" />
                  <col className="w-[110px]" />
                  <col className="w-[130px]" />
                  <col className="w-[56px]" />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#edf4f9] text-[#334155]">
                    <th className="px-3 py-3 font-medium">Sr.no</th>
                    <th className="px-3 py-3 font-medium">Project</th>
                    <th className="px-3 py-3 font-medium">Denied by</th>
                    <th className="px-3 py-3 font-medium">Denial Date</th>
                    <th className="px-3 py-3 font-medium">Denial Reason</th>
                    <th className="px-3 py-3 font-medium">Reassigned To</th>
                    <th className="px-3 py-3 font-medium">Reassignment Date</th>
                    <th className="px-3 py-3 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1191da] border-t-transparent" />
                          <p className="text-[12px] font-medium text-slate-500">Loading history...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center">
                        <p className="text-[12px] font-medium text-slate-500">No history records found.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#edf1f5] last:border-b-0 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-3 py-3 text-[#6f7e8f]">{index + 1}</td>
                        <td className="px-3 py-3 font-medium text-[#17365d]">{row.project}</td>
                        <td className="px-3 py-3 text-[#475569]">{row.deniedBy}</td>
                        <td className="px-3 py-3 text-[#475569]">{row.denialDate}</td>
                        <td className="px-3 py-3 text-[#475569]">{row.denialReason}</td>
                        <td className="px-3 py-3 text-[#475569]">{row.reassignedTo}</td>
                        <td className="px-3 py-3 text-[#475569]">{row.reassignmentDate}</td>
                        <td className="px-3 py-3 text-center">
                          {/* Green action dot / button */}
                          <button
                            type="button"
                            title="View detail"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#dcfce7] transition hover:bg-[#bbf7d0]"
                          >
                            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ActionButton({ tone = 'edit', onClick, projectId }) {
  const isEdit = tone === 'edit'

  return (
    <button
      type="button"
      onClick={() => onClick(projectId)}
      aria-label={isEdit ? 'Edit project' : 'View project'}
      className={[
        'inline-flex h-6 w-6 items-center justify-center rounded-full transition',
        isEdit
          ? 'bg-[#efedff] text-[#5a65ff] hover:bg-[#e3e0ff]'
          : 'bg-[#dcfce7] text-[#22c55e] hover:bg-[#dcfce7]',
      ].join(' ')}
    >
      {isEdit ? <PencilLine size={11} strokeWidth={2.2} /> : <Eye size={11} strokeWidth={2.2} />}
    </button>
  )
}

function StatusPill({ tone, value }) {
  return (
    <span
      className={[
        'inline-flex min-w-[76px] justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold',
        tone,
      ].join(' ')}
    >
      {value}
    </span>
  )
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value) {
  if (!value) return '--'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatTimeline(project) {
  const start = project.start_date || project.startDate
  const end = project.end_date || project.endDate
  return `${formatDate(start)} - ${formatDate(end)}`
}

function getStatusTone(status) {
  switch (status) {
    case 'Active': return 'bg-[#ddf9df] text-[#2bbb44]'
    case 'Completed': return 'bg-[#dff1ff] text-[#2a78d2]'
    case 'On Hold': return 'bg-[#ffe8d8] text-[#db7c28]'
    case 'Allocated': return 'bg-[#fff6e5] text-[#f59e0b]'
    case 're-allocated': return 'bg-[#f3f0ff] text-[#7c3aed]'
    case 'Deny': return 'bg-[#fee2e2] text-[#ef4444]'
    case 'Accepted': return 'bg-[#dcfce7] text-[#22c55e]'
    default: return 'bg-[#fff0cb] text-[#d89a1d]'
  }
}

function getPriorityTone(priority) {
  switch (priority) {
    case 'High': return 'bg-[#ffe9ea] text-[#e34b5d]'
    case 'Low': return 'bg-[#e7f8ef] text-[#199b5c]'
    default: return 'bg-[#edf4f9] text-[#466178]'
  }
}

function ProjectMetric({ icon, label, value }) {
  return (
    <article className="rounded-[16px] border border-[#e6edf4] bg-[#f8fbfd] p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-[12px] bg-white p-2 text-[#1191da] shadow-sm shadow-slate-200/80">
          {createElement(icon, { size: 18, strokeWidth: 2 })}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7b8796]">{label}</p>
          <p className="mt-1 text-xl font-semibold text-[#17365d]">{value}</p>
        </div>
      </div>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CreateProjectPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [formValues, setFormValues] = useState(() => getDefaultFormValues())
  const [editingId, setEditingId] = useState(null)
  const [modalMode, setModalMode] = useState('new')
  const [activeTab, setActiveTab] = useState('basic')
  const [formError, setFormError] = useState('')
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({ status: '', priority: '', client: '', pm: '' })
  const [viewModal, setViewModal] = useState({ isOpen: false, project: null })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, pm: null, projectId: null })
  const [projectManagers, setProjectManagers] = useState([])

  // ── NEW: History modal state ──
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    if (isModalOpen || showHistoryModal || viewModal.isOpen || confirmModal.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen, showHistoryModal, viewModal.isOpen, confirmModal.isOpen])

  useEffect(() => { fetchManagers() }, [])

  async function fetchManagers() {
    try {
      const response = await fetch(API_ENDPOINTS.USER_LIST)
      const data = await response.json()
      const rawUsers = data.data || data
      if (Array.isArray(rawUsers)) {
        const pmNames = rawUsers
          .filter((user) => user.role && user.role.toLowerCase().trim() === 'project manager')
          .map((user) => {
            const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
            const type = user.user_type === 'inhouse' ? '(In-house)' : '(Freelancer)'
            return `${name} ${type}`
          })
          .filter((name) => name.length > 0)
        setProjectManagers(pmNames)
      }
    } catch (error) {
      console.error('Error fetching managers:', error)
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setModalMode('new')
    setActiveTab('basic')
    setFormError('')
    setFormValues(getDefaultFormValues())
  }

  function handleOpenModal(mode = 'new', sourceProject = null) {
    setModalMode(mode)
    if (mode === 'edit' && sourceProject) {
      setEditingId(sourceProject.id)
      setFormValues(mapProjectToFormValues(sourceProject))
    } else if (mode === 'copy' && sourceProject) {
      setEditingId(null)
      setFormValues({
        ...mapProjectToFormValues(sourceProject),
        name: sourceProject.name ? `${sourceProject.name} Copy` : '',
      })
    } else {
      setEditingId(null)
      setFormValues(getDefaultFormValues())
    }
    setFormError('')
    setActiveTab('basic')
    setIsModalOpen(true)
  }

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.GET_PROJECT_LIST)
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  async function handleCreateProjectAction(mode) {
    if (mode === 'new') {
      try {
        const response = await fetch(API_ENDPOINTS.CREATE_PROJECT_API, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await response.json()
        const code = data.project_code || (data.data && data.data.project_code)
        setModalMode('new')
        setEditingId(null)
        const defaults = getDefaultFormValues()
        setFormValues({ ...defaults, projectCode: code || `P-${Date.now()}` })
      } catch (error) {
        console.error('Error fetching project code:', error)
        setModalMode('new')
        setEditingId(null)
        setFormValues({ ...getDefaultFormValues(), projectCode: `P-${Date.now()}` })
      }
    } else {
      const latestProject = [...projects].sort((l, r) => r.id - l.id)[0]
      setModalMode('copy')
      setEditingId(null)
      setFormValues(
        latestProject
          ? { ...mapProjectToFormValues(latestProject), name: latestProject.name ? `${latestProject.name} Copy` : '' }
          : getDefaultFormValues(),
      )
    }
    setFormError('')
    setActiveTab('basic')
    setIsModalOpen(true)
  }

  useEffect(() => {
    if (!isModalOpen) return undefined
    const handleEscape = (event) => { if (event.key === 'Escape') handleCloseModal() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isModalOpen])

  useEffect(() => {
    const launcherState = location.state
    if (!launcherState?.openWizard) return
    startTransition(() => {
      if (launcherState.mode === 'copy') {
        const latestProject = [...projects].sort((l, r) => r.id - l.id)[0]
        setModalMode('copy')
        setEditingId(null)
        setFormValues(
          latestProject
            ? { ...mapProjectToFormValues(latestProject), name: latestProject.name ? `${latestProject.name} Copy` : '' }
            : getDefaultFormValues(),
        )
      } else {
        setModalMode('new')
        setEditingId(null)
        setFormValues({ ...getDefaultFormValues(), projectCode: launcherState.projectCode })
      }
      setFormError('')
      setActiveTab('basic')
      setIsModalOpen(true)
    })
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, projects])

  const activeProjects = projects.filter((p) => p.status === 'Allocated').length
  const reallocationCount = projects.filter((p) => {
    const status = String(p.status || '').toLowerCase()
    return status === 're-allocated' || status === 'reallocated'
  }).length
  const completedProjects = projects.filter((p) => p.status === 'Completed').length
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0)

  const filteredProjects = projects.filter((project) => {
    const name = (project.project_name || project.name || '').toLowerCase()
    const client = (project.company_name || project.client || '').toLowerCase()
    const pm = (project.project_manager || project.owner || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    const matchesSearch = name.includes(query) || client.includes(query) || pm.includes(query)
    const matchesStatus = !filters.status || project.status === filters.status
    const matchesPriority = !filters.priority || project.priority === filters.priority
    const matchesClientFilter = !filters.client || client.includes(filters.client.toLowerCase())
    const matchesPmFilter = !filters.pm || pm.includes(filters.pm.toLowerCase())
    return matchesSearch && matchesStatus && matchesPriority && matchesClientFilter && matchesPmFilter
  })

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormError('')
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  function handleOptionToggle(optionKey) {
    setFormError('')
    setFormValues((current) => ({
      ...current,
      options: { ...current.options, [optionKey]: !current.options[optionKey] },
    }))
  }

  function handleView(id) {
    const project = projects.find((item) => item.id === id)
    if (project) setViewModal({ isOpen: true, project })
  }

  function handleAssignPMClick(pm, projectId) {
    setConfirmModal({ isOpen: true, pm, projectId })
  }

  async function handleConfirmAssignPM() {
    const { pm, projectId } = confirmModal
    try {
      const payload = new FormData()
      payload.append('id', String(projectId))
      payload.append('pm_id', String(projectId))
      payload.append('project_manager', pm)
      payload.append('status', 're-allocated')

      const response = await fetch(API_ENDPOINTS.REALLOCATE_PROJECT, {
        method: 'POST',
        body: payload,
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to re-allocate project')

      setProjects((current) =>
        current.map((p) =>
          p.id === projectId ? { ...p, owner: pm, pm: pm, project_manager: pm, status: 'Re-allocated' } : p
        )
      )
      fetchProjects()
    } catch (error) {
      console.error('Re-allocation failed:', error)
      alert(error.message || 'Failed to re-allocate project')
    } finally {
      setConfirmModal({ isOpen: false, pm: null, projectId: null })
      setViewModal({ isOpen: false, project: null })
    }
  }

  function handleEdit(id) {
    const project = projects.find((item) => item.id === id)
    if (!project) return
    handleOpenModal('edit', project)
  }

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects((current) => current.filter((project) => project.id !== id))
    }
  }

  function validateProject(nextProject) {
    const missingFields = [
      ['name', 'Name'],
      ['plannedStartDate', 'Planned Start Date'],
      ['pm', 'PM'],
      ['technology', 'Technology'],
      ['clientName', 'Client Name'],
      ['state', 'State'],
      ['projectType', 'Project Type'],
    ]
      .filter(([field]) => !String(nextProject[field] ?? '').trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) return `Please complete: ${missingFields.join(', ')}.`
    if (nextProject.deadline && nextProject.plannedStartDate && nextProject.deadline < nextProject.plannedStartDate) {
      return 'Deadline must be on or after the planned start date.'
    }
    return ''
  }

  async function handleProjectSaved(projectData) {
    try {
      fetchProjects()
      handleCloseModal()
    } catch (error) {
      console.error('Save project failed:', error)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextProject = {
      name: formValues.name.trim(),
      client: formValues.clientName.trim(),
      clientName: formValues.clientName.trim(),
      owner: formValues.pm.trim(),
      pm: formValues.pm.trim(),
      techLead: formValues.techLead.trim(),
      technology: formValues.technology.trim(),
      status: formValues.status,
      priority: formValues.priority || 'Medium',
      budget: formValues.budget.trim(),
      startDate: formValues.plannedStartDate,
      plannedStartDate: formValues.plannedStartDate,
      endDate: formValues.deadline,
      deadline: formValues.deadline,
      state: formValues.state.trim(),
      projectType: formValues.projectType,
      description: formValues.description.trim(),
      portfolio: formValues.portfolio.trim(),
      billing: formValues.billing,
      defaultTaskSchedule: formValues.defaultTaskSchedule,
      options: { ...formValues.options },
    }
    const validationError = validateProject(nextProject)
    if (validationError) {
      setFormError(validationError)
      setActiveTab('basic')
      return
    }
    if (editingId) {
      setProjects((current) =>
        current.map((project) => (project.id === editingId ? { ...project, ...nextProject } : project))
      )
    } else {
      const nextId = projects.reduce((maxId, project) => Math.max(maxId, project.id), 0) + 1
      setProjects((current) => [...current, { id: nextId, ...nextProject }])
    }
    handleCloseModal()
  }

  return (
    <div className="relative min-h-screen bg-[#0d2646] p-3 sm:p-4">
      <section className="rounded-[10px] bg-white p-4 shadow-[0_16px_40px_rgba(3,10,24,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[#161616]">
            Project Allocations
          </h1>

          <div className="flex items-center gap-1.5 relative">
            {/* Search */}
            <div className={`flex items-center transition-all duration-300 ${showSearch ? 'w-64' : 'w-8'}`}>
              {showSearch && (
                <input
                  autoFocus
                  type="text"
                  placeholder="Search project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full rounded-l-full border border-[#e2e8f0] border-r-0 bg-[#f8fafc] pl-4 text-[12px] outline-none focus:border-[#1191da]"
                />
              )}
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 ${showSearch ? 'rounded-l-none border border-l-0 border-[#e2e8f0] bg-[#f8fafc]' : ''}`}
              >
                <Search size={16} strokeWidth={1.9} />
              </button>
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilter(!showFilter)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${showFilter ? 'bg-[#1191da] text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                <Funnel size={15} strokeWidth={1.9} />
              </button>

              {showFilter && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-[14px] bg-white p-4 shadow-[0_20px_44px_rgba(2,6,23,0.34)] border border-[#e2e8f0]">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#17365d]">Filters</span>
                      <button
                        onClick={() => setFilters({ status: '', priority: '', client: '', pm: '' })}
                        className="text-[11px] text-[#1191da] hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className="h-9 w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[12px] text-[#17365d] outline-none focus:border-[#1191da]"
                        >
                          <option value="">All Status</option>
                          <option value="Allocated">Allocated</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Re-allocated">Re-allocated</option>
                          <option value="Deny">Deny</option>
                          <option value="Accepted">Accepted</option>
                        </select>
                      </div>
                      {/* Priority Filter */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Priority</label>
                        <select
                          value={filters.priority}
                          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                          className="h-9 w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[12px] text-[#17365d] outline-none focus:border-[#1191da]"
                        >
                          <option value="">All Priority</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      {/* Client Filter */}
                      <div className="group">
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider transition-colors group-focus-within:text-[#1191da]">Client Name</label>
                        <div className="relative">
                          {!filters.client && (
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          )}
                          <input
                            type="text"
                            placeholder="Search by Client"
                            value={filters.client}
                            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                            className={`h-9 w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] pl-3 pr-8 text-[12px] text-[#17365d] outline-none transition-all focus:border-[#1191da] focus:bg-white focus:ring-4 focus:ring-[#1191da]/5 placeholder:text-slate-400`}
                          />
                          {filters.client && (
                            <button
                              onClick={() => setFilters({ ...filters, client: '' })}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* PM Filter */}
                      <div className="group">
                        <label className="mb-1.5 block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider transition-colors group-focus-within:text-[#1191da]">Project Manager</label>
                        <div className="relative">
                          {!filters.pm && (
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          )}
                          <input
                            type="text"
                            placeholder="Search by PM"
                            value={filters.pm}
                            onChange={(e) => setFilters({ ...filters, pm: e.target.value })}
                            className={`h-9 w-full rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] pl-3 pr-8 text-[12px] text-[#17365d] outline-none transition-all focus:border-[#1191da] focus:bg-white focus:ring-4 focus:ring-[#1191da]/5 placeholder:text-slate-400`}
                          />
                          {filters.pm && (
                            <button
                              onClick={() => setFilters({ ...filters, pm: '' })}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                              <X size={12} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── History Button (NEW) ── */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              title="Denied PM History"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <History size={16} strokeWidth={1.9} />
            </button>

            {/* Create Project */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="inline-flex items-center rounded-full bg-[#1191da] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b82c7]"
              >
                Create Project
              </button>

              {showCreateMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2">
                    <span className="absolute -top-[6px] right-[40px] h-[12px] w-[12px] rotate-45 rounded-[2px] bg-[#e4f0fd] shadow-[0_10px_20px_rgba(15,23,42,0.22)] backdrop-blur-[10px]" />
                    <div className="relative flex items-start gap-2.5 rounded-[14px] bg-[#e4f0fd] p-2.5 shadow-[0_20px_44px_rgba(2,6,23,0.34)] backdrop-blur-[12px]">
                      <button
                        type="button"
                        onClick={() => { setShowCreateMenu(false); handleCreateProjectAction('new') }}
                        className="flex h-[78px] w-[92px] flex-col items-center justify-center gap-2.5 rounded-[10px] bg-white/88 px-2.5 text-center text-[10px] font-medium text-[#5f6c7b] shadow-[0_12px_24px_rgba(15,23,42,0.12)] backdrop-blur-[8px] transition hover:text-[#1191da]"
                      >
                        <FileText size={15} strokeWidth={1.8} />
                        <span className="leading-[1.15]">New Project</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCreateMenu(false); handleCreateProjectAction('copy') }}
                        className="flex h-[78px] w-[92px] flex-col items-center justify-center gap-2.5 rounded-[10px] bg-white/88 px-2.5 text-center text-[10px] font-medium text-[#5f6c7b] shadow-[0_12px_24px_rgba(15,23,42,0.12)] backdrop-blur-[8px] transition hover:text-[#1191da]"
                      >
                        <Copy size={15} strokeWidth={1.8} />
                        <span className="leading-[1.15]">Copy Project</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <ProjectMetric icon={BriefcaseBusiness} label="Total Projects" value={projects.length} />
          <ProjectMetric icon={UserRound} label="Allocation Count" value={activeProjects} />
          <ProjectMetric icon={UserRound} label="Reallocation Count" value={reallocationCount} />
          <ProjectMetric icon={CalendarRange} label="Tracked Budget" value={formatCurrency(totalBudget)} />
        </div>

        <div className="mt-5 overflow-hidden rounded-[8px] border border-[#e7eef5] bg-[#f9fbfd]">
          <div className="flex items-end justify-between gap-4 border-b border-[#e6edf4] px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-[#17365d]">Project register</p>
            </div>
          </div>

          <div className="px-2 py-2">
            <div className="overflow-hidden rounded-[6px] border border-[#edf1f5] bg-white">
              <div className="max-h-[468px] overflow-y-auto overflow-x-auto">
                <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-[11px] text-[#6f7e8f]">
                  <colgroup>
                    <col className="w-[60px]" />
                    <col className="w-[190px]" />
                    <col className="w-[130px]" />
                    <col className="w-[130px]" />
                    <col className="w-[100px]" />
                    <col className="w-[100px]" />
                    <col className="w-[110px]" />
                    <col className="w-[190px]" />
                    <col className="w-[100px]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#edf4f9] text-[#334155]">
                      <th className="px-4 py-3 font-medium">Sr.no</th>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Project Manager</th>
                      <th className="px-4 py-3 font-medium text-center">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Priority</th>
                      <th className="px-4 py-3 font-medium text-center">Budget</th>
                      <th className="px-4 py-3 font-medium">Timeline</th>
                      <th className="px-4 py-3 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1191da] border-t-transparent" />
                            <p className="text-[12px] font-medium text-slate-500">Loading projects...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <p className="text-[12px] font-medium text-slate-500">No projects found matching your criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project, index) => (
                        <tr key={project.id} className="border-b border-[#edf1f5] last:border-b-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-medium text-[#17365d]">{project.project_name || project.name}</td>
                          <td className="px-4 py-3">{project.company_name || project.client}</td>
                          <td className="px-4 py-3">
                            {project.status === 'Deny' || !(project.project_manager || project.owner) ? (
                              <div className="relative inline-block w-[130px]">
                                <select
                                  className="h-[26px] w-full appearance-none rounded-full border border-[#e2e8f0] bg-[#f8fafc] pl-3 pr-7 text-[11px] font-medium text-[#17365d] outline-none transition focus:border-[#1191da] focus:bg-white cursor-pointer"
                                  value={project.project_manager || project.owner || ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setProjects((curr) =>
                                      curr.map((p) =>
                                        p.id === project.id ? { ...p, project_manager: val, status: 'Re-allocated' } : p
                                      )
                                    )
                                  }}
                                >
                                  <option value="" disabled hidden>Select Resource</option>
                                  {projectManagers.map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={13} />
                              </div>
                            ) : (
                              <span className="font-medium text-[#17365d]">{project.project_manager || project.owner}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusPill tone={getStatusTone(project.status)} value={project.status || 'Pending'} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusPill tone={getPriorityTone(project.priority)} value={project.priority || 'Medium'} />
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-[#17365d]">
                            {formatCurrency(project.budget)}
                          </td>
                          <td className="px-4 py-3">{formatTimeline(project)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-3">
                              <ActionButton tone="view" onClick={handleView} projectId={project.id} />
                              <ActionButton tone="edit" onClick={handleEdit} projectId={project.id} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CreateProjectWizardModal
        activeTab={activeTab}
        errorMessage={formError}
        formValues={formValues}
        isOpen={isModalOpen}
        editingId={editingId}
        title={editingId ? 'Edit Project' : modalMode === 'copy' ? 'Copy Project' : 'Create Project'}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onOptionToggle={handleOptionToggle}
        onSave={handleProjectSaved}
        onTabChange={setActiveTab}
      />

      {/* ── Denied PM History Modal (NEW) ── */}
      <DeniedPMHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Project Details Modal */}
      {viewModal.isOpen && viewModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
          <div className="relative w-full max-w-[600px] rounded-[16px] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-[#f4f8fb] px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-[16px] font-bold text-[#17365d]">Project Details</h2>
              <button
                onClick={() => setViewModal({ isOpen: false, project: null })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Project Code</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.project_code || viewModal.project.projectCode}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Project Name</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.project_name || viewModal.project.name}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Client</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.company_name || viewModal.project.client}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Technical Lead</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.technical_lead || viewModal.project.techLead || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Technology</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.technology || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Project Type</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.project_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Methodology</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{viewModal.project.methodology || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Budget</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{formatCurrency(viewModal.project.budget)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Timeline</label>
                  <p className="mt-1 text-[14px] font-medium text-[#1e293b]">{formatTimeline(viewModal.project)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Project Scope</label>
                  <p className="mt-1 text-[13px] text-[#475569] leading-relaxed bg-[#f8fafc] p-3 rounded-[8px] border border-[#f1f5f9]">
                    {viewModal.project.project_scope || viewModal.project.description || 'No description provided.'}
                  </p>
                </div>

                {viewModal.project.contacts && viewModal.project.contacts.length > 0 && (
                  <div className="col-span-2">
                    <label className="mb-2 block text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Contact Persons</label>
                    <div className="space-y-2">
                      {viewModal.project.contacts.map((contact, idx) => (
                        <div key={idx} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[8px] border border-[#f1f5f9] p-2.5 text-[12px]">
                          <span className="font-bold text-[#1e293b]">{contact.person_name || contact.name}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-[#64748b]">{contact.role}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-[#64748b]">{contact.mobile}</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-[#1191da]">{contact.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewModal.project.milestones && viewModal.project.milestones.length > 0 && (
                  <div className="col-span-2">
                    <label className="mb-2 block text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Milestones</label>
                    <div className="overflow-hidden rounded-[8px] border border-[#f1f5f9]">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-[#f8fafc] text-[#64748b]">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Milestone</th>
                            <th className="px-3 py-2 font-semibold">Date</th>
                            <th className="px-3 py-2 font-semibold text-right">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f1f5f9]">
                          {viewModal.project.milestones.map((ms, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-[#1e293b]">{ms.milestone || ms.name}</td>
                              <td className="px-3 py-2 text-[#64748b]">{ms.milestone_date || ms.date || '--'}</td>
                              <td className="px-3 py-2 text-right font-bold text-[#1e293b]">{ms.percentage || ms.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Resource Allocation Section */}
                {viewModal.project.resource_allocations && (
                  <div className="col-span-2 space-y-4">
                    <label className="mb-2 block text-[11px] font-bold text-[#17365d] uppercase tracking-wider border-b border-[#e2e8f0] pb-1">Resource Allocations</label>
                    {(() => {
                      try {
                        const allocs = typeof viewModal.project.resource_allocations === 'string' 
                          ? JSON.parse(viewModal.project.resource_allocations) 
                          : viewModal.project.resource_allocations;
                        
                        if (!Array.isArray(allocs)) return null;

                        return allocs.map((alloc, aIdx) => (
                          <div key={aIdx} className="rounded-xl border border-[#f1f5f9] bg-white overflow-hidden shadow-sm">
                            <div className="bg-[#f8fafc] px-3 py-2 border-b border-[#f1f5f9] flex justify-between items-center">
                              <span className="text-[11px] font-bold text-[#475569] uppercase">{alloc.type}</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[11px]">
                                <thead className="bg-[#fcfdfe] text-slate-400">
                                  <tr>
                                    <th className="px-3 py-2 font-semibold">Details</th>
                                    {(alloc.type === 'In-house' || alloc.type === 'Freelancer') && <th className="px-3 py-2 font-semibold text-right">Alloc</th>}
                                    {alloc.type === 'Cost' && <th className="px-3 py-2 font-semibold text-right">Amount</th>}
                                    {alloc.type === 'Material' && <th className="px-3 py-2 font-semibold text-right">Total</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9]">
                                  {alloc.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50/50">
                                      <td className="px-3 py-2">
                                        <p className="font-bold text-[#1e293b]">{row.resourceName || row.name || '—'}</p>
                                        <p className="text-[10px] text-[#64748b]">
                                          {row.role || row.unit || ''} 
                                          {row.quantity ? ` (${row.quantity} units)` : ''}
                                        </p>
                                      </td>
                                      {(alloc.type === 'In-house' || alloc.type === 'Freelancer') && (
                                        <td className="px-3 py-2 text-right font-black text-blue-600">{row.allocation}%</td>
                                      )}
                                      {alloc.type === 'Cost' && (
                                        <td className="px-3 py-2 text-right font-black text-emerald-600">₹{row.amount}</td>
                                      )}
                                      {alloc.type === 'Material' && (
                                        <td className="px-3 py-2 text-right font-black text-emerald-600">₹{row.total}</td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ));
                      } catch (e) {
                        return <p className="text-[10px] text-red-400">Error parsing allocations</p>;
                      }
                    })()}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <StatusPill tone={getStatusTone(viewModal.project.status)} value={viewModal.project.status} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Priority</label>
                  <div className="mt-1">
                    <StatusPill tone={getPriorityTone(viewModal.project.priority)} value={viewModal.project.priority} />
                  </div>
                </div>

                {viewModal.project.status === 'Deny' && viewModal.project.denyReason && (
                  <div className="col-span-2 rounded-[8px] bg-red-50 p-4 border border-red-100">
                    <label className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Reason for Denial</label>
                    <p className="mt-1 text-[13px] text-red-700 leading-relaxed">{viewModal.project.denyReason}</p>
                  </div>
                )}

                <div className="col-span-2 pt-4 border-t border-[#f1f5f9]">
                  <label className="mb-2 block text-[11px] font-bold text-[#17365d] uppercase tracking-wider">Assign Project Manager</label>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[13px] text-[#1e293b] outline-none focus:border-[#1191da] focus:bg-white transition-all cursor-pointer"
                      value={viewModal.project.project_manager || viewModal.project.owner || ''}
                      onChange={(e) => handleAssignPMClick(e.target.value, viewModal.project.id)}
                    >
                      <option value="" disabled>Select a Manager</option>
                      {projectManagers.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] px-8 py-4 flex justify-end">
              <button
                onClick={() => setViewModal({ isOpen: false, project: null })}
                className="rounded-[8px] bg-[#0052ff] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
          <div className="relative w-full max-w-[400px] rounded-[16px] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff]">
              <UserRound size={24} className="text-[#0052ff]" />
            </div>
            <h3 className="mb-2 text-[18px] font-semibold text-[#1e293b]">Assign Project Manager</h3>
            <p className="mb-8 text-[14px] text-[#64748b]">
              Are you sure you want to assign <span className="font-bold text-[#1e293b]">{confirmModal.pm}</span> to this project?
              The status will be updated to <span className="font-semibold text-[#7c3aed]">Re-allocated</span>.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, pm: null, projectId: null })}
                className="w-full rounded-[8px] bg-slate-100 py-2.5 text-[14px] font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignPM}
                className="w-full rounded-[8px] bg-[#0052ff] py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateProjectPage
