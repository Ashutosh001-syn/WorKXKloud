import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, FolderKanban, User, Check } from 'lucide-react'

const MODAL_CONFIG = {
  success: {
    gradient: 'from-emerald-600 via-emerald-500 to-teal-400',
    ringColor: 'ring-emerald-500/15',
    glowShadow: '0 12px 32px -4px rgba(16, 185, 129, 0.35)',
    topGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16, 185, 129, 0.2), transparent 70%)',
    icon: Check,
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    btnGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25',
    defaultTitle: 'Saved Successfully!',
    defaultMessage: 'Your project details and allocations have been saved successfully.',
  },
  error: {
    gradient: 'from-rose-600 via-rose-500 to-red-400',
    ringColor: 'ring-rose-500/15',
    glowShadow: '0 12px 32px -4px rgba(239, 68, 68, 0.35)',
    topGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(239, 68, 68, 0.2), transparent 70%)',
    icon: AlertCircle,
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
    btnGradient: 'from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/25',
    defaultTitle: 'Action Failed',
    defaultMessage: 'An error occurred while processing your request. Please try again.',
  },
  warning: {
    gradient: 'from-amber-500 via-amber-400 to-yellow-400',
    ringColor: 'ring-amber-500/15',
    glowShadow: '0 12px 32px -4px rgba(245, 158, 11, 0.35)',
    topGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(245, 158, 11, 0.2), transparent 70%)',
    icon: AlertTriangle,
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
    btnGradient: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25',
    defaultTitle: 'Validation Required',
    defaultMessage: 'Please review and fill in all mandatory fields before continuing.',
  },
  info: {
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    ringColor: 'ring-blue-500/15',
    glowShadow: '0 12px 32px -4px rgba(37, 99, 235, 0.35)',
    topGlow: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37, 99, 235, 0.2), transparent 70%)',
    icon: Info,
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
    btnGradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25',
    defaultTitle: 'Information',
    defaultMessage: 'Please review the details below.',
  },
}

export default function StatusPopupModal({
  isOpen = false,
  type = 'success',
  title,
  message,
  details = null,
  primaryButtonText = 'Done',
  secondaryButtonText,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === 'Enter') {
        if (onConfirm) onConfirm()
        else onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onConfirm])

  if (!isOpen) return null

  const config = MODAL_CONFIG[type] || MODAL_CONFIG.success
  const IconComponent = config.icon
  const displayTitle = title || config.defaultTitle
  const displayMessage = message || config.defaultMessage

  const handlePrimaryClick = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose?.()
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300"
      style={{ animation: 'statusFadeIn 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-[460px] rounded-[24px] bg-white p-7 text-center shadow-[0_25px_70px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.08)] border border-slate-100 overflow-hidden"
        style={{
          animation: 'statusPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ambient Top Glow Aura */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: config.topGlow }}
        />

        {/* Red Close (X) Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200/80 transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          aria-label="Close"
        >
          <X size={16} className="stroke-[2.5]" />
        </button>

        {/* Main Status Icon with concentric glowing rings */}
        <div className="relative mx-auto mb-4 flex items-center justify-center">
          <div
            className={`flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-tr ${config.gradient} text-white ring-[10px] ${config.ringColor} transition-transform transform hover:scale-105`}
            style={{ boxShadow: config.glowShadow }}
          >
            {type === 'success' ? (
              <Check size={36} className="stroke-[3] drop-shadow-sm" />
            ) : (
              <IconComponent size={34} className="stroke-[2.5] drop-shadow-sm" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[21px] font-bold tracking-tight text-slate-800">
          {displayTitle}
        </h3>

        {/* Description Message */}
        <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500 max-w-[380px] mx-auto">
          {displayMessage}
        </p>

        {/* Optional Project Details Preview Card */}
        {details && (
          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-left text-[12.5px] shadow-sm">
            {/* Top row: Project Name & Code */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100/80 text-blue-600">
                  <FolderKanban size={15} />
                </div>
                <span className="truncate font-semibold text-slate-800 text-[13px]">
                  {details.projectName || 'Project'}
                </span>
              </div>
              {details.projectCode && (
                <span className="flex-shrink-0 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700 border border-slate-200 shadow-xs">
                  {details.projectCode}
                </span>
              )}
            </div>

            {/* Middle row: Key Meta Info */}
            <div className="grid grid-cols-2 gap-2 pt-2.5 text-slate-600">
              {details.pm && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <User size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate text-[11.5px]">
                    <strong className="text-slate-700 font-medium">PM:</strong> {details.pm}
                  </span>
                </div>
              )}
              {details.budget !== undefined && details.budget !== null && (
                <div className="text-right text-[11.5px]">
                  <span className="text-slate-400 font-normal">Budget: </span>
                  <strong className="text-slate-800 font-semibold">
                    {details.budget ? `₹${Number(details.budget).toLocaleString('en-IN')}` : '₹0'}
                  </strong>
                </div>
              )}
            </div>

            {/* Bottom Status Tag */}
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Allocations & Milestones Configured</span>
              </div>
              {details.billing && (
                <span className="text-slate-400 font-normal">{details.billing}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          {secondaryButtonText && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-white font-semibold text-[13.5px] text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              {secondaryButtonText}
            </button>
          )}
          <button
            type="button"
            onClick={handlePrimaryClick}
            className={`flex-1 h-11 rounded-xl bg-gradient-to-r ${config.btnGradient} font-semibold text-[13.5px] text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer`}
          >
            {primaryButtonText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes statusFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes statusPopIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
