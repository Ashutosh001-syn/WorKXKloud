import { motion } from 'framer-motion'
import { CheckCheck, Trash2, ChevronLeft, ChevronRight, BellOff } from 'lucide-react'
import NotificationItem from './NotificationItem'

const MotionDiv = motion.div

function NotificationPanel({
    notifications,
    loading,
    totalCount,
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    goToPage,
    markOneAsRead,
    markAllAsRead,
    clearAll,
}) {
    return (
        <MotionDiv
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-12 z-50 w-[92vw] max-w-[560px] origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                <h2 className="text-[15px] font-bold text-slate-800">All Notifications</h2>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={totalCount === 0}
                        className="flex items-center gap-1.5 text-[12.5px] font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <CheckCheck size={14} strokeWidth={2.2} />
                        Mark all as read
                    </button>

                    <button
                        type="button"
                        onClick={clearAll}
                        disabled={totalCount === 0}
                        className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2 size={14} strokeWidth={2.2} />
                        Clear all
                    </button>
                </div>
            </div>

            {/* LIST */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-slate-400">
                        <span className="text-[13px]">Loading notifications…</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-slate-400">
                        <BellOff size={22} strokeWidth={1.8} />
                        <span className="text-[13px]">No notifications</span>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={markOneAsRead}
                        />
                    ))
                )}
            </div>

            {/* FOOTER / PAGINATION */}
            {totalCount > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                    <span className="text-[12px] text-slate-400">
                        Showing {rangeStart} to {rangeEnd} of {totalCount} notifications
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            aria-label="Previous page"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                type="button"
                                onClick={() => goToPage(pageNumber)}
                                className={`flex h-7 w-7 items-center justify-center rounded-md text-[12.5px] font-semibold transition ${pageNumber === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages}
                            aria-label="Next page"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </MotionDiv>
    )
}

export default NotificationPanel