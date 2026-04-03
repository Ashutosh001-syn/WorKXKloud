import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import {
  DASHBOARD_LAYOUT_STORAGE_KEY,
  LEGACY_DASHBOARD_SIZES_STORAGE_KEY,
  defaultDashboardIds,
  defaultDashboardLayout,
  defaultDashboardLayoutById,
} from '../components/dashboard/dashboardData'

function readStoredLayout() {
  if (typeof window === 'undefined') {
    return defaultDashboardLayout
  }

  const savedLayout = window.localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY)
  const savedSizes = window.localStorage.getItem(LEGACY_DASHBOARD_SIZES_STORAGE_KEY)

  if (!savedLayout) {
    return defaultDashboardLayout
  }

  try {
    const parsedLayout = JSON.parse(savedLayout)
    const hasObjectShape =
      Array.isArray(parsedLayout) &&
      parsedLayout.length === defaultDashboardLayout.length &&
      parsedLayout.every(
        (item) =>
          item &&
          typeof item === 'object' &&
          defaultDashboardIds.includes(item.id) &&
          [1, 2].includes(item.colSpan),
      ) &&
      defaultDashboardIds.every((sectionId) =>
        parsedLayout.some((item) => item.id === sectionId),
      )

    if (hasObjectShape) {
      return parsedLayout
    }

    const legacySizes = savedSizes ? JSON.parse(savedSizes) : null
    const hasLegacyShape =
      Array.isArray(parsedLayout) &&
      parsedLayout.length === defaultDashboardLayout.length &&
      defaultDashboardIds.every((sectionId) => parsedLayout.includes(sectionId))

    if (hasLegacyShape) {
      return parsedLayout.map((sectionId) => ({
        id: sectionId,
        colSpan: [1, 2].includes(legacySizes?.[sectionId])
          ? legacySizes[sectionId]
          : defaultDashboardLayoutById[sectionId].colSpan,
      }))
    }
  } catch {
    return defaultDashboardLayout
  }

  return defaultDashboardLayout
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState(readStoredLayout)

  useEffect(() => {
    window.localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  function reorderSections(activeId, overId) {
    if (!overId || activeId === overId) {
      return
    }

    setLayout((currentLayout) => {
      const oldIndex = currentLayout.findIndex((item) => item.id === activeId)
      const newIndex = currentLayout.findIndex((item) => item.id === overId)

      if (oldIndex < 0 || newIndex < 0) {
        return currentLayout
      }

      return arrayMove(currentLayout, oldIndex, newIndex)
    })
  }

  function resizeSection(sectionId, colSpan) {
    setLayout((currentLayout) =>
      currentLayout.map((item) =>
        item.id === sectionId && item.colSpan !== colSpan
          ? { ...item, colSpan }
          : item,
      ),
    )
  }

  return {
    layout,
    reorderSections,
    resizeSection,
  }
}
