import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Eye, Search, X } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

function getStatusTone(status) {
  if (status === 'Approved') {
    return 'bg-[#d9f7dd] text-[#2bb74a]'
  }

  if (status === 'Pending' || status === 'Deny') {
    return 'bg-[#ffdede] text-[#ea5656]'
  }

  return 'bg-[#ffeebf] text-[#e5a200]'
}

function ViewProjectModal({ project, onClose }) {
  if (!project) return null

  // Map the API snake_case payload to variables for cleaner rendering
  const pName = project.project_name || project.projectName || 'N/A'
  const pCode = project.project_code || 'N/A'
  const pStatus = project.status || 'Pending'
  const pPriority = project.priority || 'Normal'
  const pType = project.project_type || project.projectType || 'N/A'
  const pm = project.project_manager || project.pm || 'N/A'
  const methodology = project.methodology || 'N/A'
  const duration = project.duration ? `${project.duration} Days` : 'N/A'
  const contractDate = project.contact_sign_date || project.contractDate || 'N/A'
  const startDate = project.start_date || project.plannedStartDate || 'N/A'
  const deadline = project.end_date || project.deadline || 'N/A'
  const scope = project.project_scope || project.description || project.scope || 'No description provided.'

  const companyName = project.company_name || project.clientName || 'N/A'
  const location = project.location || 'N/A'
  const contacts = project.contacts || project.persons || []

  const billing = project.no_billing || project.billing || 'N/A'
  const budget = project.budget || 'N/A'
  const cost = project.cost || 'N/A' // Cost isn't in payload but kept as fallback
  const milestones = project.milestones || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center gap-4">
            {project.company_logo && (
              <img src={project.company_logo} alt="Logo" className="w-10 h-10 rounded-full border border-slate-200 bg-white object-cover" />
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {pName}
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{pCode}</span>
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Project Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-slate-50">
          <div className="space-y-8">

            {/* Status & Priority Badge row */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusTone(pStatus)}`}>
                {pStatus}
              </span>
              <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider shadow-sm">
                {pPriority} Priority
              </span>
              {pType !== 'N/A' && (
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                  {pType}
                </span>
              )}
            </div>

            {/* SECTION: Project Details */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Project Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-6">

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project Manager</p>
                  <p className="text-[13px] font-semibold text-slate-700">{pm}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Methodology</p>
                  <p className="text-[13px] font-semibold text-slate-700">{methodology}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                  <p className="text-[13px] font-semibold text-slate-700">{duration}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contract Sign Date</p>
                  <p className="text-[13px] font-semibold text-slate-700">{contractDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</p>
                  <p className="text-[13px] font-semibold text-slate-700">{startDate}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date / Deadline</p>
                  <p className="text-[13px] font-semibold text-slate-700">{deadline}</p>
                </div>

                <div className="space-y-1 sm:col-span-3 mt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scope / Description</p>
                  <p className="text-[13px] font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg mt-1 border border-slate-100">{scope}</p>
                </div>
              </div>
            </div>

            {/* SECTION: Customer Details */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Customer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Company Name</p>
                  <p className="text-[13px] font-semibold text-slate-700">{companyName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-[13px] font-semibold text-slate-700">{location}</p>
                </div>

                {contacts.length > 0 && (
                  <div className="space-y-2 sm:col-span-2 mt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Persons</p>
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Name</th>
                            <th className="px-3 py-2 font-semibold">Role</th>
                            <th className="px-3 py-2 font-semibold">Mobile</th>
                            <th className="px-3 py-2 font-semibold">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {contacts.map((p, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium text-slate-700">{p.person_name || p.name || '—'}</td>
                              <td className="px-3 py-2 text-slate-600">{p.role || '—'}</td>
                              <td className="px-3 py-2 text-slate-600">{p.mobile || '—'}</td>
                              <td className="px-3 py-2 text-slate-600">{p.email || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: Milestone & Payment */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Financials & Milestones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billing Type</p>
                  <p className="text-[13px] font-semibold text-slate-700">{billing}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Budget</p>
                  <p className="text-[14px] font-bold text-emerald-600">₹{budget}</p>
                </div>

                {milestones.length > 0 && (
                  <div className="space-y-2 sm:col-span-2 mt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Milestones</p>
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Milestone Name</th>
                            <th className="px-3 py-2 font-semibold">Date</th>
                            <th className="px-3 py-2 font-semibold">Payment %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {milestones.map((m, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium text-slate-700">{m.milestone || m.name || '—'}</td>
                              <td className="px-3 py-2 text-slate-600">{m.milestone_date || m.date || '—'}</td>
                              <td className="px-3 py-2 text-slate-600">{m.percentage || m.pct ? `${m.percentage || m.pct}%` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: Resource Allocation */}
            {project.resource_allocations && project.resource_allocations.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Resource Allocation</h3>
                <div className="space-y-6">
                  {project.resource_allocations.map((alloc, aIdx) => (
                    <div key={aIdx} className="space-y-2">
                      <h4 className="text-[12px] font-bold text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {alloc.type}
                      </h4>
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-3 py-2 font-semibold">Sr.</th>
                              {(alloc.type === 'In-house' || alloc.type === 'Freelancer') && (
                                <>
                                  <th className="px-3 py-2 font-semibold">Role</th>
                                  <th className="px-3 py-2 font-semibold">Name</th>
                                  <th className="px-3 py-2 font-semibold">Alloc %</th>
                                  <th className="px-3 py-2 font-semibold">Days</th>
                                </>
                              )}
                              {alloc.type === 'Cost' && (
                                <>
                                  <th className="px-3 py-2 font-semibold">Name</th>
                                  <th className="px-3 py-2 font-semibold">Amount</th>
                                </>
                              )}
                              {alloc.type === 'Material' && (
                                <>
                                  <th className="px-3 py-2 font-semibold">Material</th>
                                  <th className="px-3 py-2 font-semibold">Unit</th>
                                  <th className="px-3 py-2 font-semibold">Qty</th>
                                  <th className="px-3 py-2 font-semibold">Rate</th>
                                  <th className="px-3 py-2 font-semibold text-blue-600">Total</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {alloc.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="px-3 py-2 text-slate-400">{rIdx + 1}</td>
                                {(alloc.type === 'In-house' || alloc.type === 'Freelancer') && (
                                  <>
                                    <td className="px-3 py-2 font-medium text-slate-700">{row.role || '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">{row.resourceName || '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">{row.allocation ? `${row.allocation}%` : '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">
                                      <div className="flex flex-wrap gap-1">
                                        {row.workingDays && row.workingDays.length > 0 ? row.workingDays.map(d => (
                                          <span key={d} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">{d}</span>
                                        )) : '—'}
                                      </div>
                                    </td>
                                  </>
                                )}
                                {alloc.type === 'Cost' && (
                                  <>
                                    <td className="px-3 py-2 font-medium text-slate-700">{row.name || '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">₹{row.amount || '0'}</td>
                                  </>
                                )}
                                {alloc.type === 'Material' && (
                                  <>
                                    <td className="px-3 py-2 font-medium text-slate-700">{row.name || '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">{row.unit || '—'}</td>
                                    <td className="px-3 py-2 text-slate-600">{row.quantity || '0'}</td>
                                    <td className="px-3 py-2 text-slate-600">₹{row.rate || '0'}</td>
                                    <td className="px-3 py-2 font-bold text-blue-600">₹{row.total || '0'}</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}

function AllProjectPage() {
  const [rows, setRows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Status')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewProject, setViewProject] = useState(null)

  useEffect(() => {
    if (viewProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [viewProject])

  useEffect(() => {
    async function fetchAllProjects() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(API_ENDPOINTS.GET_PROJECT_LIST)
        const data = await response.json()

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to fetch projects')
        }

        const mappedData = (Array.isArray(data.data) ? data.data : []).map(row => ({
          ...row,
          // Map properties for the table view
          projectName: row.project_name || "-",
          budget: row.budget ?? "-",
          cost: row.budget ?? "-",
          priority: row.priority || "-",
          schedule: row.duration ? `${row.duration} days` : "-",
          plannedStartDate: row.start_date || "-",
          deadline: row.end_date || "-",
          clientName: row.company_name || "-",
          pm: row.project_manager || "-",
          status: row.status || "Pending",
        }))

        setRows(mappedData)
      } catch (fetchError) {
        setRows([])
        setError(fetchError.message || 'Unable to fetch projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllProjects()
  }, [])

  const statusOptions = useMemo(() => {
    const unique = new Set(rows.map((row) => row.status).filter(Boolean))
    return ['Status', ...Array.from(unique)]
  }, [rows])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const text = `${row.projectName} ${row.pm} ${row.clientName}`.toLowerCase()
      const matchesSearch = text.includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'Status' ? true : row.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rows, searchTerm, statusFilter])

  return (
    <div className="min-h-screen bg-[#0d2646] px-2 py-4 sm:px-3">
      <section className="rounded-[8px] bg-[#fdfefe] px-3 pb-5 pt-4 shadow-[0_18px_40px_rgba(2,12,28,0.15)] sm:px-4">
        <h1 className="text-[2.2rem] font-semibold tracking-[-0.03em] text-[#191919]">All Project</h1>
        <p className="mt-1 text-[13px] text-[#8ea0b8]">
          Manage and maintain all projects in the organization
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="relative w-full max-w-[360px]">
            <Search
              size={15}
              strokeWidth={2}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8b4c4]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Project Name, PM, Client Name"
              className="h-12 w-full rounded-[6px] border border-[#e0e6ef] bg-white pl-4 pr-10 text-[14px] text-[#5f7188] outline-none placeholder:text-[#b4becc]"
            />
          </label>

          <label className="relative w-full max-w-[170px]">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full appearance-none rounded-[6px] border border-[#e0e6ef] bg-white px-4 pr-9 text-[14px] text-[#8a97aa]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              strokeWidth={1.9}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a6b2c1]"
            />
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-[8px] border border-[#e3e9f2] bg-white">
          <div className="max-h-[660px] overflow-auto">
            <table className="w-full min-w-[1220px] border-collapse text-left text-[13px] text-[#68788f]">
              <thead>
                <tr className="bg-[#edf3f8] text-[#39485c]">
                  <th className="w-[54px] px-4 py-3 font-medium">View</th>
                  <th className="px-4 py-3 font-medium">Project name</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Schedule</th>
                  <th className="px-4 py-3 font-medium">Planned start date</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Client Name</th>
                  <th className="px-4 py-3 font-medium">PM</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-[13px] text-slate-500">
                      Loading projects...
                    </td>
                  </tr>
                )}

                {!isLoading && error && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-[13px] text-rose-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!isLoading && !error && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-[13px] text-slate-500">
                      No projects found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !error &&
                  filteredRows.map((row) => (
                    <tr key={row.id} className="border-b border-[#edf2f7] last:border-b-0">
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => setViewProject(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8e99a8] transition hover:bg-[#edf2f7] hover:text-blue-600"
                          aria-label={`View ${row.projectName}`}
                        >
                          <Eye size={15} strokeWidth={2} />
                        </button>
                      </td>
                      <td className="px-4 py-2.5">{row.projectName}</td>
                      <td className="px-4 py-2.5">{row.budget}</td>
                      <td className="px-4 py-2.5">{row.cost}</td>
                      <td className="px-4 py-2.5">{row.priority}</td>
                      <td className="px-4 py-2.5">{row.schedule}</td>
                      <td className="px-4 py-2.5">{row.plannedStartDate}</td>
                      <td className="px-4 py-2.5">{row.deadline}</td>
                      <td className="px-4 py-2.5">{row.clientName}</td>
                      <td className="px-4 py-2.5">{row.pm}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium ${getStatusTone(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {viewProject && (
        <ViewProjectModal
          project={viewProject}
          onClose={() => setViewProject(null)}
        />
      )}
    </div>
  )
}

export default AllProjectPage
