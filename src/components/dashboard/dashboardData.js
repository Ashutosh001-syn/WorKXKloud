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

export const summaryCards = [
  {
    id: 'totalProjects',
    title: 'Total Projects',
    value: '28',
    icon: ClipboardList,
    iconWrap: 'bg-[#dbe9ff] text-[#4a8dea]',
  },
  {
    id: 'activeProjects',
    title: 'Active Projects',
    value: '12',
    icon: Clock3,
    iconWrap: 'bg-[#ffebd6] text-[#ef9527]',
  },
  {
    id: 'completedProjects',
    title: 'Completed Projects',
    value: '10',
    icon: CheckCircle2,
    iconWrap: 'bg-[#dff9df] text-[#2dbc40]',
  },
  {
    id: 'overdueProjects',
    title: 'Overdue Projects',
    value: '6',
    icon: BriefcaseBusiness,
    iconWrap: 'bg-[#ffe5e7] text-[#f05b61]',
  },
]

export const projectStatusRows = [
  {
    project: 'Project 1',
    overall: 'Red',
    overallTone: 'bg-[#ffe6e3] text-[#f56a5d]',
    schedule: 'Yellow',
    scheduleTone: 'bg-[#fff0cb] text-[#e9a71b]',
    budget: 'Yellow',
    budgetTone: 'bg-[#fff0cb] text-[#e9a71b]',
    summary:
      'We are not able to mitigate the high priority risks on time due to resource crunch and hence the project is off track now.',
  },
  {
    project: 'Project 2',
    overall: 'Yellow',
    overallTone: 'bg-[#fff0cb] text-[#e9a71b]',
    schedule: 'Red',
    scheduleTone: 'bg-[#ffe6e3] text-[#f56a5d]',
    budget: 'Red',
    budgetTone: 'bg-[#ffe6e3] text-[#f56a5d]',
    summary:
      'We are not able to mitigate the high priority risks on time due to resource crunch and hence the project is off track now.',
  },
  {
    project: 'Project 3',
    overall: 'Green',
    overallTone: 'bg-[#ddf9df] text-[#2bbb44]',
    schedule: 'Yellow',
    scheduleTone: 'bg-[#fff0cb] text-[#e9a71b]',
    budget: 'Green',
    budgetTone: 'bg-[#ddf9df] text-[#2bbb44]',
    summary:
      'We are not able to mitigate the high priority risks on time due to resource crunch and hence the project is off track now.',
  },
  {
    project: 'Project 4',
    overall: 'Yellow',
    overallTone: 'bg-[#fff0cb] text-[#e9a71b]',
    schedule: 'Green',
    scheduleTone: 'bg-[#ddf9df] text-[#2bbb44]',
    budget: 'Green',
    budgetTone: 'bg-[#ddf9df] text-[#2bbb44]',
    summary:
      'We are not able to mitigate the high priority risks on time due to resource crunch and hence the project is off track now.',
  },
]

export const myProjectsRows = [
  {
    name: 'Project 1',
    scheduleHealth: 'Overdue',
    scheduleTone: 'bg-[#ffe6e3] text-[#f0564d]',
    budgetHealth: 'Overbudget',
    budgetTone: 'bg-[#fff0cb] text-[#e9a71b]',
    progress: '65%',
    deadline: '13-Mar-2026',
  },
  {
    name: 'Project 2',
    scheduleHealth: 'Yellow',
    scheduleTone: 'bg-[#fff0cb] text-[#e9a71b]',
    budgetHealth: 'Red',
    budgetTone: 'bg-[#ffe6e3] text-[#f0564d]',
    progress: '50%',
    deadline: '13-Mar-2026',
  },
  {
    name: 'Project 3',
    scheduleHealth: 'Green',
    scheduleTone: 'bg-[#ddf9df] text-[#2bbb44]',
    budgetHealth: 'Yellow',
    budgetTone: 'bg-[#fff0cb] text-[#e9a71b]',
    progress: '30%',
    deadline: '13-Mar-2026',
  },
  {
    name: 'Project 4',
    scheduleHealth: 'Yellow',
    scheduleTone: 'bg-[#fff0cb] text-[#e9a71b]',
    budgetHealth: 'Green',
    budgetTone: 'bg-[#ddf9df] text-[#2bbb44]',
    progress: '10%',
    deadline: '13-Mar-2026',
  },
]

export const deadlineItems = [
  {
    title: 'Website Redesign',
    daysLeft: '10 days left',
    icon: FileChartColumn,
    iconWrap: 'bg-[#e9f2ff] text-[#5188dd]',
  },
  {
    title: 'App Redesign',
    daysLeft: '10 days left',
    icon: Clock3,
    iconWrap: 'bg-[#fff2da] text-[#ec9d20]',
  },
  {
    title: 'Website Redesign',
    daysLeft: '10 days left',
    icon: CalendarDays,
    iconWrap: 'bg-[#e4f9e2] text-[#4bb64f]',
  },
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

export function getSummaryCard(sectionId) {
  return summaryCards.find((card) => card.id === sectionId) ?? null
}
