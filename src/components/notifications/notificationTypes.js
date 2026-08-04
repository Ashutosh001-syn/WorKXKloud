import {
    BriefcaseBusiness,
    CheckCircle2,
    CalendarClock,
    MessageSquare,
    UserPlus,
    AlertTriangle,
    Bell,
} from 'lucide-react'

/**
 * Central config for every notification "type" the backend can send.
 * Add a new type here and it will automatically render correctly
 * inside <NotificationItem /> with no other code changes required.
 */
export const NOTIFICATION_TYPES = {
    TASK_ASSIGNED: {
        icon: BriefcaseBusiness,
        iconWrap: 'bg-[#dbe9ff] text-[#4a8dea]',
    },
    PROJECT_STATUS_UPDATED: {
        icon: CheckCircle2,
        iconWrap: 'bg-[#dff9df] text-[#2dbc40]',
    },
    DEADLINE_REMINDER: {
        icon: CalendarClock,
        iconWrap: 'bg-[#ffebd6] text-[#ef9527]',
    },
    TASK_COMMENT: {
        icon: MessageSquare,
        iconWrap: 'bg-[#f1e6ff] text-[#9153e8]',
    },
    TEAM_MEMBER_ADDED: {
        icon: UserPlus,
        iconWrap: 'bg-[#d9f7ee] text-[#1aa37a]',
    },
    SYSTEM_MAINTENANCE: {
        icon: AlertTriangle,
        iconWrap: 'bg-[#ffe5e7] text-[#f05b61]',
    },
}

export function getNotificationTypeMeta(type) {
    return NOTIFICATION_TYPES[type] || { icon: Bell, iconWrap: 'bg-slate-100 text-slate-500' }
}