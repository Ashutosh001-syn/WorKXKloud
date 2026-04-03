import { createElement, startTransition, useEffect, useState } from 'react'
import {
  BriefcaseBusiness,
  CalendarRange,
  Funnel,
  PencilLine,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import CreateProjectWizardModal from '../components/projects/CreateProjectWizardModal'

const PROJECT_STORAGE_KEY = 'workxkloud_projects'

function getDefaultFormValues() {
  return {
    name: '',
    clientName: '',
    pm: '',
    status: 'Planning',
    priority: 'Medium',
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
    name: project.name ?? defaults.name,
    clientName: project.clientName ?? project.client ?? defaults.clientName,
    pm: project.pm ?? project.owner ?? defaults.pm,
    status: project.status ?? defaults.status,
    priority: project.priority ?? defaults.priority,
    budget: project.budget ?? defaults.budget,
    plannedStartDate: project.plannedStartDate ?? project.startDate ?? defaults.plannedStartDate,
    deadline: project.deadline ?? project.endDate ?? defaults.deadline,
    state: project.state ?? defaults.state,
    projectType: project.projectType ?? defaults.projectType,
    description: project.description ?? defaults.description,
    portfolio: project.portfolio ?? defaults.portfolio,
    billing: project.billing ?? defaults.billing,
    defaultTaskSchedule: project.defaultTaskSchedule ?? defaults.defaultTaskSchedule,
    options: {
      ...defaults.options,
      ...(project.options ?? {}),
    },
  }
}

const initialProjects = [
  {
    id: 1,
    name: 'Website Revamp',
    client: 'Apex Labs',
    owner: 'Nathan Roberts',
    status: 'Active',
    priority: 'High',
    budget: '50000',
    startDate: '2026-03-01',
    endDate: '2026-05-15',
  },
  {
    id: 2,
    name: 'Mobile App Refresh',
    client: 'Northwind',
    owner: 'Albert Flores',
    status: 'Planning',
    priority: 'Medium',
    budget: '32000',
    startDate: '2026-04-10',
    endDate: '2026-07-05',
  },
  {
    id: 3,
    name: 'CRM Migration',
    client: 'BluePeak',
    owner: 'Felicia Reid',
    status: 'Completed',
    priority: 'High',
    budget: '78500',
    startDate: '2026-01-12',
    endDate: '2026-03-28',
  },
]

function readProjects() {
  if (typeof window === 'undefined') {
    return initialProjects
  }

  try {
    const savedProjects = window.localStorage.getItem(PROJECT_STORAGE_KEY)

    if (!savedProjects) {
      return initialProjects
    }

    const parsedProjects = JSON.parse(savedProjects)

    return Array.isArray(parsedProjects) && parsedProjects.length > 0
      ? parsedProjects
      : initialProjects
  } catch {
    return initialProjects
  }
}

function ToolbarButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </button>
  )
}

function ActionButton({ tone = 'edit', onClick, projectId }) {
  const isEdit = tone === 'edit'

  return (
    <button
      type="button"
      onClick={() => onClick(projectId)}
      aria-label={isEdit ? 'Edit project' : 'Delete project'}
      className={[
        'inline-flex h-6 w-6 items-center justify-center rounded-full transition',
        isEdit
          ? 'bg-[#efedff] text-[#5a65ff] hover:bg-[#e3e0ff]'
          : 'bg-[#ffe9ea] text-[#ff4e5b] hover:bg-[#ffdce0]',
      ].join(' ')}
    >
      {isEdit ? <PencilLine size={11} strokeWidth={2.2} /> : <Trash2 size={11} strokeWidth={2.2} />}
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

  if (!Number.isFinite(amount)) {
    return value
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatTimeline(project) {
  return `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
}

function getStatusTone(status) {
  switch (status) {
    case 'Active':
      return 'bg-[#ddf9df] text-[#2bbb44]'
    case 'Completed':
      return 'bg-[#dff1ff] text-[#2a78d2]'
    case 'On Hold':
      return 'bg-[#ffe8d8] text-[#db7c28]'
    default:
      return 'bg-[#fff0cb] text-[#d89a1d]'
  }
}

function getPriorityTone(priority) {
  switch (priority) {
    case 'High':
      return 'bg-[#ffe9ea] text-[#e34b5d]'
    case 'Low':
      return 'bg-[#e7f8ef] text-[#199b5c]'
    default:
      return 'bg-[#edf4f9] text-[#466178]'
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
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7b8796]">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#17365d]">{value}</p>
        </div>
      </div>
    </article>
  )
}

function CreateProjectPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState(readProjects)
  const [formValues, setFormValues] = useState(() => getDefaultFormValues())
  const [editingId, setEditingId] = useState(null)
  const [modalMode, setModalMode] = useState('new')
  const [activeTab, setActiveTab] = useState('basic')
  const [formError, setFormError] = useState('')

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

  useEffect(() => {
    window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    if (!isModalOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleCloseModal()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen])

  useEffect(() => {
    const launcherState = location.state

    if (!launcherState?.openWizard) {
      return
    }

    startTransition(() => {
      if (launcherState.mode === 'copy') {
        const latestProject = [...projects].sort((left, right) => right.id - left.id)[0]
        setModalMode('copy')
        setEditingId(null)
        setFormValues(
          latestProject
            ? {
                ...mapProjectToFormValues(latestProject),
                name: latestProject.name ? `${latestProject.name} Copy` : '',
              }
            : getDefaultFormValues(),
        )
      } else {
        setModalMode('new')
        setEditingId(null)
        setFormValues(getDefaultFormValues())
      }

      setFormError('')
      setActiveTab('basic')
      setIsModalOpen(true)
    })

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, projects])

  const activeProjects = projects.filter((project) => project.status === 'Active').length
  const completedProjects = projects.filter((project) => project.status === 'Completed').length
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget || 0), 0)

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormError('')
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleOptionToggle(optionKey) {
    setFormError('')
    setFormValues((current) => ({
      ...current,
      options: {
        ...current.options,
        [optionKey]: !current.options[optionKey],
      },
    }))
  }

  function handleEdit(id) {
    const project = projects.find((item) => item.id === id)

    if (!project) {
      return
    }

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
      ['clientName', 'Client Name'],
      ['state', 'State'],
      ['projectType', 'Project Type'],
    ]
      .filter(([field]) => !String(nextProject[field] ?? '').trim())
      .map(([, label]) => label)

    if (missingFields.length > 0) {
      return `Please complete: ${missingFields.join(', ')}.`
    }

    if (
      nextProject.deadline &&
      nextProject.plannedStartDate &&
      nextProject.deadline < nextProject.plannedStartDate
    ) {
      return 'Deadline must be on or after the planned start date.'
    }

    return ''
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextProject = {
      name: formValues.name.trim(),
      client: formValues.clientName.trim(),
      clientName: formValues.clientName.trim(),
      owner: formValues.pm.trim(),
      pm: formValues.pm.trim(),
      status: formValues.status,
      priority: formValues.priority,
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
        current.map((project) =>
          project.id === editingId ? { ...project, ...nextProject } : project,
        ),
      )
    } else {
      const nextId = projects.reduce((maxId, project) => Math.max(maxId, project.id), 0) + 1

      setProjects((current) => [
        ...current,
        {
          id: nextId,
          ...nextProject,
        },
      ])
    }

    handleCloseModal()
  }

  return (
    <div className="relative min-h-screen bg-[#0d2646] p-3 sm:p-4">
      <section className="rounded-[10px] bg-white p-4 shadow-[0_16px_40px_rgba(3,10,24,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[#161616]">
            Create project
          </h1>

          <div className="flex items-center gap-1.5">
            <ToolbarButton label="Search">
              <Search size={16} strokeWidth={1.9} />
            </ToolbarButton>
            <ToolbarButton label="Filter">
              <Funnel size={15} strokeWidth={1.9} />
            </ToolbarButton>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center rounded-full bg-[#1191da] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b82c7]"
            >
              Create project
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ProjectMetric icon={BriefcaseBusiness} label="Total Projects" value={projects.length} />
          <ProjectMetric icon={UserRound} label="Active Projects" value={activeProjects} />
          <ProjectMetric
            icon={CalendarRange}
            label="Tracked Budget"
            value={formatCurrency(totalBudget)}
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-[8px] border border-[#e7eef5] bg-[#f9fbfd]">
          <div className="flex items-end justify-between gap-4 border-b border-[#e6edf4] px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-[#17365d]">Project register</p>
              <p className="mt-1 text-[11px] text-[#7b8796]">
                {completedProjects} completed project{completedProjects === 1 ? '' : 's'} in this
                demo workspace
              </p>
            </div>
          </div>

          <div className="px-2 py-2">
            <div className="overflow-hidden rounded-[6px] border border-[#edf1f5] bg-white">
              <div className="max-h-[468px] overflow-y-auto">
                <table className="w-full table-fixed border-collapse text-left text-[11px] text-[#6f7e8f]">
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
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium text-center">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Priority</th>
                      <th className="px-4 py-3 font-medium text-center">Budget</th>
                      <th className="px-4 py-3 font-medium">Timeline</th>
                      <th className="px-4 py-3 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.id} className="border-b border-[#edf1f5] last:border-b-0">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#17365d]">{project.name}</td>
                        <td className="px-4 py-3">{project.client}</td>
                        <td className="px-4 py-3">{project.owner}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusPill tone={getStatusTone(project.status)} value={project.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusPill
                            tone={getPriorityTone(project.priority)}
                            value={project.priority}
                          />
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-[#17365d]">
                          {formatCurrency(project.budget)}
                        </td>
                        <td className="px-4 py-3">{formatTimeline(project)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <ActionButton tone="edit" onClick={handleEdit} projectId={project.id} />
                            <ActionButton
                              tone="delete"
                              onClick={handleDelete}
                              projectId={project.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
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
        title={editingId ? 'Edit Project' : modalMode === 'copy' ? 'Copy Project' : 'Create Project'}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onOptionToggle={handleOptionToggle}
        onSave={handleSubmit}
        onTabChange={setActiveTab}
      />
    </div>
  )
}

export default CreateProjectPage
