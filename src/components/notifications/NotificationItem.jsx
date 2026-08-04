import { createElement } from 'react'
import { Link2 } from 'lucide-react'
import { getNotificationTypeMeta } from './notificationTypes'

function NotificationItem({ notification, onRead }) {
    const { icon, iconWrap } = getNotificationTypeMeta(notification.type)

    return (
        <button
            type="button"
            onClick={() => onRead(notification.id)}
            className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
        >
            {/* Unread indicator */}
            <span className="mt-2 flex h-1.5 w-1.5 flex-shrink-0 items-center justify-center">
                {!notification.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
            </span>

            {/* Icon */}
            <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconWrap}`}
            >
                {createElement(icon, { size: 17, strokeWidth: 2 })}
            </span>

            {/* Content */}
            <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                    <span className="text-[14px] font-semibold text-slate-800">
                        {notification.title}
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap text-[12px] text-slate-400">
                        {notification.time}
                    </span>
                </span>

                <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">
                    {notification.message}
                </span>

                {notification.projectName && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-blue-600">
                        <Link2 size={12} strokeWidth={2.2} />
                        {notification.projectName}
                    </span>
                )}
            </span>
        </button>
    )
}

export default NotificationItem