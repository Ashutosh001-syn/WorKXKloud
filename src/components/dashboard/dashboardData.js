import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileChartColumn,
} from 'lucide-react'

export const DASHBOARD_LAYOUT_STORAGE_KEY = 'workxkloud-dashboard-layout'
export const LEGACY_DASHBOARD_SIZES_STORAGE_KEY = 'workxkloud-dashboard-sizes'

export const defaultDashboardLayout = [
  { id: 'totalProjects', colSpan: 1 },
  { id: 'activeProjects', colSpan: 1 },
  { id: 'completedProjects', colSpan: 1 },
  { id: 'overdueProjects', colSpan: 1 },
  { id: 'status', colSpan: 2 },
  { id: 'myProjects', colSpan: 1 },
  { id: 'deadlines', colSpan: 1 },
]

export const defaultDashboardIds = defaultDashboardLayout.map((item) => item.id)

export const defaultDashboardLayoutById = Object.fromEntries(
  defaultDashboardLayout.map((item) => [item.id, item]),
)

// Value is computed from live project data in Dashboard.jsx (see
// summaryCounts) — this only holds the per-card display metadata.
export const summaryCardMeta = [
  {
    id: 'totalProjects',
    title: 'Total Projects',
    icon: ClipboardList,
    iconWrap: 'bg-[#dbe9ff] text-[#4a8dea]',
  },
  {
    id: 'activeProjects',
    title: 'Active Projects',
    icon: Clock3,
    iconWrap: 'bg-[#ffebd6] text-[#ef9527]',
  },
  {
    id: 'completedProjects',
    title: 'Completed Projects',
    icon: CheckCircle2,
    iconWrap: 'bg-[#dff9df] text-[#2dbc40]',
  },
  {
    id: 'overdueProjects',
    title: 'Overdue Projects',
    icon: BriefcaseBusiness,
    iconWrap: 'bg-[#ffe5e7] text-[#f05b61]',
  },
]

// Rotating icon set for the "Upcoming deadlines" list — the API doesn't
// return a per-project icon, so cycle through these by list position.
export const DEADLINE_ICONS = [
  { icon: FileChartColumn, iconWrap: 'bg-[#e9f2ff] text-[#5188dd]' },
  { icon: Clock3, iconWrap: 'bg-[#fff2da] text-[#ec9d20]' },
  { icon: CalendarDays, iconWrap: 'bg-[#e4f9e2] text-[#4bb64f]' },
]

export const dashboardSectionMeta = {
  totalProjects: {
    title: 'Total Projects',
    variant: 'summary',
  },
  activeProjects: {
    title: 'Active Projects',
    variant: 'summary',
  },
  completedProjects: {
    title: 'Completed Projects',
    variant: 'summary',
  },
  overdueProjects: {
    title: 'Overdue Projects',
    variant: 'summary',
  },
  status: {
    title: 'Projects Status',
    variant: 'status',
  },
  myProjects: {
    title: 'My Projects',
    variant: 'projects',
  },
  deadlines: {
    title: 'Upcoming deadlines',
    variant: 'deadlines',
  },
}

export function getSummaryCardMeta(sectionId) {
  return summaryCardMeta.find((card) => card.id === sectionId) ?? null
}
