import { useEffect, useMemo, useState } from 'react'
import {
  Share2,
  Pencil,
  RotateCw,
  Plus,
  Printer,
  Download,
  ChevronDown,
  MoreHorizontal,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import {
  getLoggedInResourceId,
  getLoggedInResourceName,
  fetchMyTasks,
  formatDate,
  groupTasksByProject,
} from '../utils/myTasksData'

const RISK_STATES = [
  'All',
  'Identified',
  'Analyzed',
  'Avoided',
  'Mitigated',
  'Accepted',
  'Need Review',
]

const INITIAL_RISKS = [
  {
    id: 1,
    projectId: '1',
    taskName: 'Design Login Screen',
    dueDate: '24-Feb-26 / Today',
    state: 'Identified',
    impact: 'Major',
    probability: 'Rare',
  },
  {
    id: 2,
    projectId: '1',
    taskName: 'Fix API Integration',
    dueDate: '20-Feb-26 / Friday',
    state: 'Accepted',
    impact: 'Severe',
    probability: 'Likely',
  },
  {
    id: 3,
    projectId: '1',
    taskName: 'Update Dashboard UI',
    dueDate: '18-Feb-26 / Wednesday',
    state: 'Analyzed',
    impact: 'Medium',
    probability: 'Certain',
  },
]

export default function RiskPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState('All')
  const [activeStateFilter, setActiveStateFilter] = useState('All')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [risks, setRisks] = useState(() => {
    try {
      const saved = localStorage.getItem('project_risks')
      return saved ? JSON.parse(saved) : INITIAL_RISKS
    } catch {
      return INITIAL_RISKS
    }
  })

  // Form state for New Risk Modal
  const [newRisk, setNewRisk] = useState({
    taskName: '',
    dueDate: '',
    state: 'Identified',
    impact: 'Medium',
    probability: 'Likely',
  })

  const resourceId = getLoggedInResourceId()

  const loadTasks = async () => {
    if (!resourceId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchMyTasks(resourceId)
      setTasks(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => loadTasks())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist risks
  useEffect(() => {
    try {
      localStorage.setItem('project_risks', JSON.stringify(risks))
    } catch {}
  }, [risks])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Grouped project list for dropdown
  const projectsList = useMemo(() => {
    const grouped = groupTasksByProject(tasks)
    if (grouped.length > 0) {
      return grouped.map((g) => ({ id: String(g.projectId), name: g.projectName }))
    }
    return [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
      { id: '3', name: 'Project 3' },
    ]
  }, [tasks])

  // Filter risks by project and state
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (selectedProjectId !== 'All' && String(r.projectId) !== String(selectedProjectId)) {
        return false
      }
      if (activeStateFilter !== 'All' && r.state.toLowerCase() !== activeStateFilter.toLowerCase()) {
        return false
      }
      return true
    })
  }, [risks, selectedProjectId, activeStateFilter])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredRisks.map((r) => r.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddRisk = (e) => {
    e.preventDefault()
    if (!newRisk.taskName.trim()) return

    const created = {
      id: Date.now(),
      projectId: selectedProjectId === 'All' ? (projectsList[0]?.id || '1') : selectedProjectId,
      taskName: newRisk.taskName.trim(),
      dueDate: newRisk.dueDate || '24-Feb-26 / Today',
      state: newRisk.state,
      impact: newRisk.impact,
      probability: newRisk.probability,
    }

    setRisks((prev) => [created, ...prev])
    setIsModalOpen(false)
    setNewRisk({
      taskName: '',
      dueDate: '',
      state: 'Identified',
      impact: 'Medium',
      probability: 'Likely',
    })
    showToast('New risk added successfully')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Task Name,Due Date,State,Risk Impact,Risk Probability']
        .concat(
          filteredRisks.map(
            (r) =>
              `"${r.taskName}","${r.dueDate}","${r.state}","${r.impact}","${r.probability}"`
          )
        )
        .join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `risks_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Risk register exported to CSV')
  }

  const selectedProjectName = useMemo(() => {
    if (selectedProjectId === 'All') return 'Select Project'
    const match = projectsList.find((p) => p.id === selectedProjectId)
    return match ? match.name : 'Select Project'
  }, [selectedProjectId, projectsList])

  return (
    <div className="min-h-full bg-[#0b1f3a] p-4 md:p-6 lg:p-8">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl transition-all">
          {toastMessage}
        </div>
      )}

      {/* Main White Rounded Card Container */}
      <section className="rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-[0_20px_50px_rgba(2,12,28,0.25)] min-h-[85vh]">
        {/* Top Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0f172a]">
            Risk
          </h1>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => showToast('Risk report link copied')}
              title="Share"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => showToast('Edit risk settings')}
              title="Edit"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                loadTasks()
                showToast('Refreshed risk register')
              }}
              title="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Action Controls Row (Select Project on Left, + New Risk & Export on Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Select Project Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProjectDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-lg bg-[#0062ff] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
            >
              <span>{selectedProjectName}</span>
              <ChevronDown size={15} className={projectDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {projectDropdownOpen && (
              <div className="absolute left-0 top-11 z-30 w-52 rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId('All')
                    setProjectDropdownOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${
                    selectedProjectId === 'All' ? 'text-blue-600 bg-blue-50/60' : 'text-slate-700'
                  }`}
                >
                  All Projects
                </button>
                {projectsList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(p.id)
                      setProjectDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${
                      selectedProjectId === p.id ? 'text-blue-600 bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.2} />
              <span>New Risk</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Risk Register"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Printer size={15} />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              title="Download CSV"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* State Filter Pills Row */}
        <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {RISK_STATES.map((st) => {
            const isActive = activeStateFilter === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setActiveStateFilter(st)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border border-blue-200 bg-[#eff6ff] text-blue-600 shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            )
          })}
        </div>

        {/* Risk Table Container */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white">
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-white">
            <span className="text-xs font-semibold text-slate-500">
              {filteredRisks.length} Risk item{filteredRisks.length === 1 ? '' : 's'}
            </span>
            <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredRisks.length > 0 && selectedRows.size === filteredRisks.length}
                      className="!h-4 !w-4 !rounded !border-slate-300 !bg-white text-blue-600 focus:!ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold">Project</th>
                  <th className="py-3 px-4 font-bold">Due Date</th>
                  <th className="py-3 px-4 font-bold">State</th>
                  <th className="py-3 px-4 font-bold">Risk Impact</th>
                  <th className="py-3 px-4 font-bold">Risk Probablity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRisks.length > 0 ? (
                  filteredRisks.map((item) => {
                    const isSelected = selectedRows.has(item.id)
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(item.id)}
                            className="!h-4 !w-4 !rounded !border-slate-300 !bg-white text-blue-600 focus:!ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {item.taskName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {item.dueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-medium">
                            {item.state}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-semibold ${
                              item.impact === 'Severe' || item.impact === 'Major'
                                ? 'text-rose-600'
                                : 'text-slate-700'
                            }`}
                          >
                            {item.impact}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {item.probability}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                      No risks found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Smooth bottom scroll track */}
          <div className="h-2 bg-slate-100/60 w-full" />
        </div>
      </section>

      {/* NEW RISK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Add New Risk Item
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddRisk} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Project / Task Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Login Screen"
                  value={newRisk.taskName}
                  onChange={(e) => setNewRisk({ ...newRisk, taskName: e.target.value })}
                  className="!w-full !h-10 !rounded-xl !border !border-slate-200 !bg-white !px-3 !text-xs !text-slate-800 !outline-none focus:!border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Due Date Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24-Feb-26 / Today"
                  value={newRisk.dueDate}
                  onChange={(e) => setNewRisk({ ...newRisk, dueDate: e.target.value })}
                  className="!w-full !h-10 !rounded-xl !border !border-slate-200 !bg-white !px-3 !text-xs !text-slate-800 !outline-none focus:!border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    State
                  </label>
                  <select
                    value={newRisk.state}
                    onChange={(e) => setNewRisk({ ...newRisk, state: e.target.value })}
                    className="!w-full !h-10 !rounded-xl !border !border-slate-200 !bg-white !px-3 !text-xs !text-slate-800 !outline-none focus:!border-blue-500 cursor-pointer"
                  >
                    <option value="Identified">Identified</option>
                    <option value="Analyzed">Analyzed</option>
                    <option value="Avoided">Avoided</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Need Review">Need Review</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Risk Impact
                  </label>
                  <select
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value })}
                    className="!w-full !h-10 !rounded-xl !border !border-slate-200 !bg-white !px-3 !text-xs !text-slate-800 !outline-none focus:!border-blue-500 cursor-pointer"
                  >
                    <option value="Major">Major</option>
                    <option value="Severe">Severe</option>
                    <option value="Medium">Medium</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Risk Probability
                </label>
                <select
                  value={newRisk.probability}
                  onChange={(e) => setNewRisk({ ...newRisk, probability: e.target.value })}
                  className="!w-full !h-10 !rounded-xl !border !border-slate-200 !bg-white !px-3 !text-xs !text-slate-800 !outline-none focus:!border-blue-500 cursor-pointer"
                >
                  <option value="Rare">Rare</option>
                  <option value="Likely">Likely</option>
                  <option value="Certain">Certain</option>
                  <option value="Possible">Possible</option>
                  <option value="Unlikely">Unlikely</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                >
                  Add Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
