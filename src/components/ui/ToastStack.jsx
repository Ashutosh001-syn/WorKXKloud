import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const TOAST_STYLES = {
    success: {
        icon: CheckCircle2,
        wrap: 'bg-white border-emerald-200 text-emerald-700',
        iconColor: 'text-emerald-500',
    },
    error: {
        icon: AlertCircle,
        wrap: 'bg-white border-rose-200 text-rose-700',
        iconColor: 'text-rose-500',
    },
    info: {
        icon: Info,
        wrap: 'bg-white border-blue-200 text-blue-700',
        iconColor: 'text-blue-500',
    },
}

function ToastStack({ toasts, onDismiss }) {
    if (!toasts.length) return null

    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[320px] max-w-[90vw]">
            {toasts.map((toast) => {
                const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info
                const Icon = style.icon

                return (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg text-[13px] font-medium animate-[toast-in_0.18s_ease-out] ${style.wrap}`}
                    >
                        <Icon size={17} className={`flex-shrink-0 mt-0.5 ${style.iconColor}`} />
                        <span className="flex-1 leading-snug">{toast.message}</span>
                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                            aria-label="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default ToastStack
