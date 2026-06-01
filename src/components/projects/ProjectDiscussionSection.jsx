import { Inbox } from 'lucide-react'

function ProjectDiscussionSection() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
      <Inbox size={48} className="mb-3 animate-pulse text-slate-300" />
      <h3 className="text-base font-bold text-slate-700">No Discussion Data</h3>
      <p className="mt-1 max-w-[280px] text-xs text-slate-500">
        This section is currently empty. Data will populate here as the project progresses.
      </p>
    </div>
  )
}

export default ProjectDiscussionSection
