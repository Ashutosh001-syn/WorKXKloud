import { createElement, useEffect, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Copy,
  EllipsisVertical,
  FileText,
  LayoutGrid,
  MessageSquare,
  PencilLine,
  ReceiptText,
  RefreshCw,
  ChevronRight,
  SquareChartGantt,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '../config/api'
import SortableDashboardSection from '../components/dashboard/SortableDashboardSection'
import {
  dashboardSectionMeta,
  deadlineItems,
  getSummaryCard,
  myProjectsRows,
  projectStatusRows,
} from '../components/dashboard/dashboardData'
import { useDashboardLayout } from '../hooks/useDashboardLayout'

function ToolbarIcon({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {createElement(Icon, { size: 16, strokeWidth: 1.9 })}
    </button>
  )
}

function CardMenuButton({ label = 'Open menu' }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
    >
      <EllipsisVertical size={14} strokeWidth={2} />
    </button>
  )
}

function StatusPill({ children, tone }) {
  return (
    <span
      className={`inline-flex min-w-[48px] justify-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}
    >
      {children}
    </span>
  )
}

function TableCheckbox() {
  return (
    <input
      type="checkbox"
      aria-label="Select row"
      className="h-3.5 w-3.5 rounded border border-[#d5dde7] bg-white align-middle"
    />
  )
}

function TableScrollHint({ width = 'w-[92%]' }) {
  return (
    <div className="mt-2 px-3">
      <div className="h-[4px] rounded-full bg-[#d9dee4]">
        <div className={`h-[4px] rounded-full bg-[#b8c0cb] ${width}`} />
      </div>
    </div>
  )
}

function SummaryCardSection({ sectionId }) {
  const summaryCard = getSummaryCard(sectionId)

  if (!summaryCard) {
    return null
  }

  const { icon, iconWrap, value } = summaryCard

  return (
    <div className="px-3 pb-3 pt-1">
      <div className="grid min-h-[82px] grid-cols-[1fr_84px] overflow-hidden rounded-[6px] border border-[#edf1f5] bg-[#f5f8fb]">
        <div className="flex items-center px-3">
          <p className="text-[1.9rem] font-semibold tracking-[-0.04em] text-[#18437b]">
            {value}
          </p>
        </div>

        <div className="flex items-center justify-center border-l border-[#e4ebf2]">
          <div className={`rounded-full p-3 ${iconWrap}`}>
            {createElement(icon, { size: 18, strokeWidth: 2.1 })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectsStatusSection() {
  return (
    <div className="px-3 pb-3 pt-1">
      <div className="overflow-x-auto rounded-[6px] border border-[#edf1f5] bg-white">
        <table className="min-w-full border-collapse text-left text-[11px] text-slate-500">
          <thead>
            <tr className="bg-[#edf4f9] text-[#4a5565]">
              <th className="w-10 px-3 py-2.5 font-medium">
                <TableCheckbox />
              </th>
              <th className="px-3 py-2.5 font-medium">Project</th>
              <th className="px-3 py-2.5 font-medium">Overall</th>
              <th className="px-3 py-2.5 font-medium">Schedule</th>
              <th className="px-3 py-2.5 font-medium">Budget</th>
              <th className="px-3 py-2.5 font-medium">Summary</th>
            </tr>
          </thead>
          <tbody>
            {projectStatusRows.map((row) => (
              <tr key={row.project} className="border-b border-[#edf1f5] last:border-b-0">
                <td className="px-3 py-2.5">
                  <TableCheckbox />
                </td>
                <td className="px-3 py-2.5 text-[#7b8796]">{row.project}</td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={row.overallTone}>{row.overall}</StatusPill>
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={row.scheduleTone}>{row.schedule}</StatusPill>
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={row.budgetTone}>{row.budget}</StatusPill>
                </td>
                <td className="max-w-[250px] px-3 py-2.5 text-[8.5px] leading-[1.35] text-[#8b95a5]">
                  {row.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TableScrollHint width="w-[88%]" />
    </div>
  )
}

function MyProjectsSection() {
  return (
    <div className="px-3 pb-3 pt-1">
      <div className="overflow-x-auto rounded-[6px] border border-[#edf1f5] bg-white">
        <table className="min-w-full border-collapse text-left text-[11px] text-slate-500">
          <thead>
            <tr className="bg-[#edf4f9] text-[#4a5565]">
              <th className="w-10 px-3 py-2.5 font-medium">
                <TableCheckbox />
              </th>
              <th className="px-3 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">S.Health</th>
              <th className="px-3 py-2.5 font-medium">B.Health</th>
              <th className="px-3 py-2.5 font-medium">% Done</th>
              <th className="px-3 py-2.5 font-medium">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {myProjectsRows.map((row) => (
              <tr key={row.name} className="border-b border-[#edf1f5] last:border-b-0">
                <td className="px-3 py-2.5">
                  <TableCheckbox />
                </td>
                <td className="px-3 py-2.5 text-[#7b8796]">{row.name}</td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={row.scheduleTone}>{row.scheduleHealth}</StatusPill>
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={row.budgetTone}>{row.budgetHealth}</StatusPill>
                </td>
                <td className="px-3 py-2.5 text-[#7b8796]">{row.progress}</td>
                <td className="px-3 py-2.5 text-[#7b8796]">{row.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TableScrollHint width="w-[96%]" />
    </div>
  )
}

function UpcomingDeadlinesSection() {
  return (
    <div className="px-3 pb-3 pt-1">
      <div className="space-y-3">
        {deadlineItems.map((item) => (
          <article
            key={`${item.title}-${item.iconWrap}`}
            className="flex items-center justify-between rounded-[6px] border border-[#edf1f5] bg-white px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-[6px] p-2 ${item.iconWrap}`}>
                {createElement(item.icon, { size: 15, strokeWidth: 2 })}
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#202020]">{item.title}</p>
                <p className="mt-1 text-[10px] text-[#99a3b3]">{item.daysLeft}</p>
              </div>
            </div>

            <ChevronRight size={14} className="text-[#aab3c0]" />
          </article>
        ))}
      </div>

      <button
        type="button"
        className="mx-auto mt-4 flex items-center gap-1 text-[10px] font-medium text-[#4a82d8] transition hover:text-[#2e63b2]"
      >
        See more
        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[8px]">
          i
        </span>
      </button>
    </div>
  )
}

function getGridClassName(section) {
  if (section.id === 'status') {
    return section.colSpan === 2
      ? 'col-span-12 md:col-span-12'
      : 'col-span-12 md:col-span-6'
  }

  if (section.id === 'myProjects') {
    return section.colSpan === 2
      ? 'col-span-12 md:col-span-12 xl:col-span-12'
      : 'col-span-12 md:col-span-6 xl:col-span-8'
  }

  if (section.id === 'deadlines') {
    return section.colSpan === 2
      ? 'col-span-12 md:col-span-12 xl:col-span-8'
      : 'col-span-12 md:col-span-6 xl:col-span-4'
  }

  return section.colSpan === 2
    ? 'col-span-12 md:col-span-12 xl:col-span-6'
    : 'col-span-12 md:col-span-6 xl:col-span-3'
}

const launcherSections = [
  {
    title: 'Apps',
    items: [
      {
        label: 'Project',
        icon: SquareChartGantt,
        submenu: 'project-actions',
      },
      {
        label: 'Task',
        icon: PencilLine,
        to: '/project-management/project-list',
      },
      {
        label: 'Timesheet',
        icon: CalendarDays,
        to: '/project-management/project-list',
      },
      {
        label: 'Expense',
        icon: ReceiptText,
        to: '/expense',
      },
      {
        label: 'Discussion',
        icon: MessageSquare,
        to: '/project-management/project-list',
      },
      {
        label: 'Portfolio Status',
        icon: LayoutGrid,
        to: '/all-project',
      },
      {
        label: 'Project Request',
        icon: FileText,
        to: '/project-management/create-project',
      },
      {
        label: 'Project Status',
        icon: BarChart3,
        to: '/project-management/project-list',
      },
      {
        label: 'Risk',
        icon: AlertTriangle,
        to: '/project-management/project-list',
      },
    ],
  },
  {
    title: 'People',
    items: [
      {
        label: 'User',
        icon: UserRoundPlus,
        to: '/create-user',
      },
      {
        label: 'Client',
        icon: Users,
        to: '/all-project',
      },
    ],
  },
]

const gridMenuItems = [
  'Budget Utilization',
  'Active Projects',
  'Activity Stream',
  'Billable Utilization',
  'Budget Distribution',
  'Budget Tracking',
  'Budget Vs Cost',
  'Cost',
  'Cost Overruns',
  'Cost Trend | S-Curve',
  'Critical Risks',
  'Customer Contribution',
  'Delayed Tasks',
  'Effort',
  'Executive Summary',
  'Financial Summary',
  'Invoiced',
  'Margin',
]

function Dashboard() {
  const { layout, reorderSections, resizeSection } = useDashboardLayout()
  const navigate = useNavigate()
  const [resizingSectionId, setResizingSectionId] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [activeLauncherMenu, setActiveLauncherMenu] = useState(null)
  const [showGridMenu, setShowGridMenu] = useState(false)
  const [gridLimit, setGridLimit] = useState(7)
  const gridMenuRef = useRef(null)
  const resizeCleanupRef = useRef(null)
  const bodyStyleSnapshotRef = useRef({ cursor: '', userSelect: '' })
  const showLegacyLauncher = false
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.()
    }
  }, [])

  function handleCloseLauncher() {
    setActiveLauncherMenu(null)
    setOpenModal(false)
  }

  useEffect(() => {
    if (!openModal) {
      return undefined
    }

    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveLauncherMenu(null)
        setOpenModal(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [openModal])

  useEffect(() => {
    if (!resizingSectionId) {
      return undefined
    }

    bodyStyleSnapshotRef.current = {
      cursor: document.body.style.cursor,
      userSelect: document.body.style.userSelect,
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'

    return () => {
      document.body.style.userSelect = bodyStyleSnapshotRef.current.userSelect
      document.body.style.cursor = bodyStyleSnapshotRef.current.cursor
    }
  }, [resizingSectionId])

  useEffect(() => {
    function handleClickOutside(e) {
      if (gridMenuRef.current && !gridMenuRef.current.contains(e.target)) {
        setShowGridMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleResizeStart(event, sectionId) {
    if (window.innerWidth < 768) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    resizeCleanupRef.current?.()

    const startX = event.clientX
    const sectionElement = event.currentTarget.closest('article')
    const sectionWidth = sectionElement?.getBoundingClientRect().width ?? 320
    const resizeThreshold = Math.max(96, Math.min(180, sectionWidth * 0.32))
    const startSection = layout.find((item) => item.id === sectionId)
    const startColSpan = startSection?.colSpan ?? 1

    setResizingSectionId(sectionId)

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const nextColSpan = Math.max(
        1,
        Math.min(2, startColSpan + Math.round(deltaX / resizeThreshold)),
      )

      resizeSection(sectionId, nextColSpan)
    }

    const cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', cleanup)
      resizeCleanupRef.current = null
      setResizingSectionId(null)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', cleanup)
    resizeCleanupRef.current = cleanup
  }

  function renderSection(section) {
    const sectionMeta = dashboardSectionMeta[section.id]
    const sharedProps = {
      dragDisabled: Boolean(resizingSectionId),
      gridClassName: getGridClassName(section),
      id: section.id,
      isResizing: resizingSectionId === section.id,
      onResizeStart: (event) => handleResizeStart(event, section.id),
      title: sectionMeta.title,
    }

    if (sectionMeta.variant === 'summary') {
      return (
        <SortableDashboardSection
          key={section.id}
          headerActions={<CardMenuButton label={`${sectionMeta.title} menu`} />}
          headerClassName="border-b-0 pb-1"
          titleClassName="text-[12px]"
          {...sharedProps}
        >
          <SummaryCardSection sectionId={section.id} />
        </SortableDashboardSection>
      )
    }

    if (sectionMeta.variant === 'status') {
      return (
        <SortableDashboardSection
          key={section.id}
          headerActions={null}
          bodyClassName="pb-1"
          {...sharedProps}
        >
          <ProjectsStatusSection />
        </SortableDashboardSection>
      )
    }

    if (sectionMeta.variant === 'projects') {
      return (
        <SortableDashboardSection
          key={section.id}
          headerActions={null}
          bodyClassName="pb-1"
          {...sharedProps}
        >
          <MyProjectsSection />
        </SortableDashboardSection>
      )
    }

    return (
      <SortableDashboardSection
        key={section.id}
        headerActions={
          <>
            <button
              type="button"
              aria-label="Calendar"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <CalendarDays size={13} strokeWidth={2} />
            </button>
            <CardMenuButton label="Upcoming deadlines menu" />
          </>
        }
        bodyClassName="pb-2"
        {...sharedProps}
      >
        <UpcomingDeadlinesSection />
      </SortableDashboardSection>
    )
  }

  function handleLauncherNavigation(to, options) {
    setActiveLauncherMenu(null)
    setOpenModal(false)

    if (to) {
      navigate(to, options)
    }
  }

  function handleLauncherItemClick(item) {
    if (item.submenu) {
      setActiveLauncherMenu((current) => (current === item.submenu ? null : item.submenu))
      return
    }

    handleLauncherNavigation(item.to)
  }

  function handleProjectQuickAction(mode) {
    const code = `P-${new Date().getFullYear()}001`
    handleLauncherNavigation('/project-management/create-project', {
      state: {
        openWizard: true,
        mode: mode,
        projectCode: code,
      },
    })
  }

  const visibleLayout = layout.slice(0, gridLimit)

  return (
    <div className="min-h-screen bg-[#0d2646] px-3 py-4 text-slate-900 sm:px-4">
      <div className="mx-auto max-w-[1280px] rounded-[10px] bg-white p-3 shadow-[0_16px_40px_rgba(3,10,24,0.16)] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 px-1 pb-1">
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[#161616]">
            Dashboard
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveLauncherMenu(null)
                setOpenModal(true)
              }}
              className="inline-flex items-center rounded-full bg-[#0088CE] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d78116]"
            >
              New Space
            </button>

            <div ref={gridMenuRef} className="relative">
              <ToolbarIcon
                icon={LayoutGrid}
                label="Grid view"
                onClick={() => setShowGridMenu((prev) => !prev)}
              />

              {showGridMenu ? (
                <div className="absolute right-0 z-50 mt-2 max-h-[420px] w-[260px] overflow-y-auto rounded-md border border-[#d5dde7] bg-white shadow-lg">
                  {gridMenuItems.map((item, index) => {
                    const isSelected = gridLimit === index + 1

                    return (
                      <button
                        key={`${item}-${index}`}
                        type="button"
                        onClick={() => {
                          setGridLimit(index + 1)
                          setShowGridMenu(false)
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-[#4a5565] ${isSelected ? 'bg-[#dbeafe]' : 'hover:bg-[#eef3f8]'
                          }`}
                      >
                        <span className="h-3 w-3 rounded-sm border border-[#c8d1dc] bg-white" />
                        <span>{item}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
            <ToolbarIcon icon={PencilLine} label="Edit" />
            <ToolbarIcon icon={RefreshCw} label="Refresh" />
            <ToolbarIcon icon={EllipsisVertical} label="More actions" />
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          onDragEnd={({ active, over }) => reorderSections(active.id, over?.id)}
        >
          <SortableContext
            items={visibleLayout.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className="mt-3 grid grid-cols-12 gap-3">
              {visibleLayout.map((section) => renderSection(section))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-3 rounded-[8px] border border-dashed border-[#dbe3ec] bg-[#f8fafc] px-3 py-2 text-[11px] text-[#708092]">
          Drag sections from their headers. Resize any section by hovering near the right edge
          until the <span className="font-semibold text-[#4a82d8]">ew-resize</span> cursor
          appears.
        </div>
      </div>

      {showLegacyLauncher && openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[700px] rounded-lg bg-white shadow-lg">

            {/* Header */}
            <div className="border-b px-6 py-3 text-center font-semibold text-gray-700">
              Create Project
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-5 gap-6 text-center text-sm text-gray-600">

                {/* Row 1 */}
                {["Project", "Task", "Timesheet", "Expense", "Discussion"].map((item) => (
                  <div key={item} className="cursor-pointer hover:text-blue-500">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      📁
                    </div>
                    {item}
                  </div>
                ))}

                {/* Row 2 */}
                {["Portfolio Status", "Project Request", "Project Status", "Risk"].map((item) => (
                  <div key={item} className="cursor-pointer hover:text-blue-500">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      ⚙️
                    </div>
                    {item}
                  </div>
                ))}

                {/* Row 3 */}
                {["User", "Client"].map((item) => (
                  <div key={item} className="cursor-pointer hover:text-blue-500">
                    <div className="mx-auto mb-2 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      👤
                    </div>
                    {item}
                  </div>
                ))}

              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t p-3">
              <button
                onClick={() => setOpenModal(false)}
                className="rounded bg-gray-200 px-4 py-1 text-sm hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {openModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/38 px-4 backdrop-blur-[4px]"
          onClick={handleCloseLauncher}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-launcher-title"
            className="w-full max-w-[720px] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#e4f0fd] px-5 py-3.5">
              <div className="w-8" />
              <h2
                id="create-project-launcher-title"
                className="text-[1.05rem] font-semibold text-[#0b2c4d]"
              >
                New Space
              </h2>
              <button
                type="button"
                onClick={handleCloseLauncher}
                aria-label="Close create project launcher"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0b2c4d] transition hover:bg-white/70"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className="relative space-y-7 p-6 sm:p-7">
              {activeLauncherMenu ? (
                <button
                  type="button"
                  aria-label="Close project quick actions"
                  className="absolute inset-0 z-10 rounded-b-[18px] bg-slate-950/30"
                  onClick={() => setActiveLauncherMenu(null)}
                />
              ) : null}

              {launcherSections.map((section) => (
                <section key={section.title} className="relative">
                  <p className="mb-4 text-sm font-medium text-[#a5b0bf]">{section.title}</p>
                  <div className="grid grid-cols-3 gap-y-6 gap-x-2 sm:grid-cols-4 md:grid-cols-5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isProjectMenuOpen = activeLauncherMenu === item.submenu
                      const isProjectLauncher = Boolean(item.submenu)

                      return (
                        <div
                          key={item.label}
                          className="relative flex justify-center"
                        >
                          <button
                            type="button"
                            onClick={() => handleLauncherItemClick(item)}
                            className={[
                              'group flex min-h-[92px] w-full flex-col items-center justify-start gap-2 rounded-[16px] px-1 py-2 text-center text-sm text-[#5f6c7b] transition hover:bg-[#f5f8fc] hover:text-[#1191da]',
                              isProjectMenuOpen
                                ? 'bg-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] border border-[#e4e4e4]'
                                : '',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'flex items-center justify-center rounded-[14px] border border-[#dbe4ef] text-[#7a8797] transition group-hover:border-[#b4d9ef] group-hover:text-[#1191da]',
                                isProjectMenuOpen
                                  ? 'h-12 w-12 border-[#d8e2ee] bg-white text-[#8d98a8]'
                                  : 'h-12 w-12',
                              ].join(' ')}
                            >
                              <Icon size={20} strokeWidth={1.8} />
                            </span>
                            <span
                              className={[
                                'leading-snug',
                                isProjectMenuOpen ? 'text-[13px] font-medium text-[#606a79]' : '',
                              ].join(' ')}
                            >
                              {item.label}
                            </span>
                          </button>

                          {isProjectMenuOpen ? (
                            <div className="absolute left-[2px] top-full z-10 mt-2.5 w-max">
                              {/* Arrow */}
                              <span className="absolute -top-[6px] left-[34px] h-[12px] w-[12px] rotate-45 rounded-[2px] bg-[#e4f0fd] shadow-[0_10px_20px_rgba(15,23,42,0.22)] backdrop-blur-[10px]" />

                              {/* Popup Container (NO BORDER) */}
                              <div className="relative flex items-start gap-2.5 rounded-[14px] bg-[#e4f0fd] p-2.5 shadow-[0_20px_44px_rgba(2,6,23,0.34)] backdrop-blur-[12px]">

                                {/* New Project */}
                                <button
                                  type="button"
                                  onClick={() => handleProjectQuickAction('new')}
                                  className="flex h-[78px] w-[92px] flex-col items-center justify-center gap-2.5 rounded-[10px] bg-white/88 px-2.5 text-center text-[10px] font-medium text-[#5f6c7b] shadow-[0_12px_24px_rgba(15,23,42,0.12)] backdrop-blur-[8px] transition hover:text-[#1191da]"
                                >
                                  <FileText size={15} strokeWidth={1.8} />
                                  <span className="leading-[1.15]">New Project</span>
                                </button>

                                {/* Copy Project */}
                                <button
                                  type="button"
                                  onClick={() => handleProjectQuickAction('copy')}
                                  className="flex h-[78px] w-[92px] flex-col items-center justify-center gap-2.5 rounded-[10px] bg-white/88 px-2.5 text-center text-[10px] font-medium text-[#5f6c7b] shadow-[0_12px_24px_rgba(15,23,42,0.12)] backdrop-blur-[8px] transition hover:text-[#1191da]"
                                >
                                  <Copy size={15} strokeWidth={1.8} />
                                  <span className="leading-[1.15]">Copy Project</span>
                                </button>

                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
