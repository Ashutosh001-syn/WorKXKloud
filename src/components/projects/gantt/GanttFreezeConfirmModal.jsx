import { createPortal } from 'react-dom'
import { Snowflake, Lock, AlertCircle, X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react'

function GanttFreezeConfirmModal({ open, projectName, onCancel, onConfirm, isSubmitting = false }) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-[#0a1f3d] to-[#0d2646] p-6 text-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Snowflake size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30 uppercase tracking-wider mb-1">
                Workflow Action
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Freeze Schedule for PMO Review
              </h3>
            </div>
          </div>
          {projectName && (
            <p className="mt-2 text-xs font-medium text-slate-300 font-mono">
              Project: <span className="text-amber-200 font-bold">{projectName}</span>
            </p>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-amber-950 mb-1">Important Notice Before Freezing:</p>
                <p>
                  Once submitted, this schedule will become <strong className="font-semibold text-amber-950">strictly read-only</strong> and locked from further edits until the PMO either approves or rejects it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              What happens next:
            </p>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                1
              </span>
              <span>The PMO Review dashboard is notified of your frozen milestone schedule.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                2
              </span>
              <span>PMO verifies resource utilization, timeline feasibility, and project dependencies.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                3
              </span>
              <span>If rejected, feedback will be provided and the timeline will automatically unfreeze for adjustments.</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <Snowflake size={14} />
            {isSubmitting ? 'Freezing & Submitting...' : 'Confirm & Freeze Schedule'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default GanttFreezeConfirmModal
