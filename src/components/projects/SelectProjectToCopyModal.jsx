import { useState, useMemo } from 'react'
import {
  Copy,
  Search,
  X,
  Building,
  User,
  DollarSign,
  Calendar,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export default function SelectProjectToCopyModal({
  isOpen,
  onClose,
  projects = [],
  onConfirmCopy,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return projects

    return projects.filter((p) => {
      const name = (p.project_name || p.name || '').toLowerCase()
      const client = (p.company_name || p.client || '').toLowerCase()
      const pm = (p.project_manager || p.pm || p.owner || '').toLowerCase()
      const code = (p.project_code || p.projectCode || '').toLowerCase()
      return (
        name.includes(query) ||
        client.includes(query) ||
        pm.includes(query) ||
        code.includes(query)
      )
    })
  }, [projects, searchQuery])

  const selectedProject = useMemo(() => {
    return projects.find((p) => String(p.id) === String(selectedProjectId))
  }, [projects, selectedProjectId])

  if (!isOpen) return null

  function handleConfirm() {
    if (!selectedProject) return
    onConfirmCopy(selectedProject)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-blue-50/40 to-white px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Copy size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Select Project to Copy
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose an existing project to clone its structure, milestones, and setup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by project name, code, client, or PM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[420px]">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={22} />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">No Projects Found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with a different keyword.
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isSelected = String(project.id) === String(selectedProjectId)
              const projectName = project.project_name || project.name || 'Untitled Project'
              const clientName = project.company_name || project.client || 'N/A'
              const pmName = project.project_manager || project.pm || project.owner || 'Unassigned'
              const budget = project.budget ? Number(project.budget).toLocaleString() : '0'
              const projectCode = project.project_code || project.projectCode || `ID #${project.id}`

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                    {/* Selection Radio / Check Indicator */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900 truncate">
                          {projectName}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {projectCode}
                        </span>
                        {project.priority && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              project.priority === 'High'
                                ? 'bg-red-50 text-red-600 border border-red-200/60'
                                : project.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {project.priority}
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-4 text-[11px] text-slate-500 flex-wrap font-medium">
                        <span className="flex items-center gap-1">
                          <Building size={12} className="text-slate-400" />
                          <span className="text-slate-700 font-semibold">{clientName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          <span>PM: {pmName}</span>
                        </span>
                        {budget !== '0' && (
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <DollarSign size={12} className="text-emerald-600" />
                            <span>${budget}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold shrink-0 px-3 py-1 rounded-xl transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="text-xs text-slate-500 font-medium">
            {selectedProject ? (
              <span>
                Ready to clone:{' '}
                <strong className="text-slate-800">
                  {selectedProject.project_name || selectedProject.name}
                </strong>
              </span>
            ) : (
              <span>Please select a project to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!selectedProject}
              onClick={handleConfirm}
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition shadow-md cursor-pointer ${
                selectedProject
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Copy Project</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
