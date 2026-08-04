import { useCallback, useEffect, useState } from 'react'

const LABEL_PALETTE = [
    { name: 'Bug', color: '#f05b61' },
    { name: 'Feature', color: '#4a8dea' },
    { name: 'Design', color: '#9153e8' },
    { name: 'Urgent', color: '#ef9527' },
    { name: 'Blocked', color: '#64748b' },
    { name: 'Docs', color: '#1aa37a' },
]

const DEFAULT_COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-green-500', wipLimit: null },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500', wipLimit: null },
    { id: 'review', title: 'Review', color: 'bg-orange-500', wipLimit: null },
    { id: 'completed', title: 'Completed', color: 'bg-green-500', wipLimit: null },
]

const COLUMN_COLOR_CYCLE = ['bg-slate-400', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500'];

function safeParse(raw, fallback) {
    if (!raw) return fallback
    try {
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

/**
 * TODO(backend): everything in this hook (labels, subtasks, comments,
 * attachments, custom columns / WIP limits) currently lives in
 * localStorage because the board API only persists title/status/priority.
 * Once dedicated endpoints exist, swap the localStorage reads/writes below
 * for real fetch/save calls — the shape returned to consumers won't need
 * to change.
 */
export function useBoardExtras(projectId) {
    const extrasKey = `board_task_extras_${projectId || 'default'}`
    const columnsKey = `board_columns_${projectId || 'default'}`

    const [loadedProjectId, setLoadedProjectId] = useState(projectId)
    const [taskExtras, setTaskExtras] = useState(() =>
        safeParse(localStorage.getItem(extrasKey), {})
    )
    const [columns, setColumns] = useState(() =>
        safeParse(localStorage.getItem(columnsKey), DEFAULT_COLUMNS)
    )

    // Reset local state when the open project changes. This runs during
    // render (not inside an effect) — the React-recommended pattern for
    // "adjusting state when a prop changes" — so it avoids the extra
    // render pass a useEffect-based reset would cause.
    if (projectId !== loadedProjectId) {
        setLoadedProjectId(projectId)
        setTaskExtras(safeParse(localStorage.getItem(extrasKey), {}))
        setColumns(safeParse(localStorage.getItem(columnsKey), DEFAULT_COLUMNS))
    }

    useEffect(() => {
        localStorage.setItem(extrasKey, JSON.stringify(taskExtras))
    }, [taskExtras, extrasKey])

    useEffect(() => {
        localStorage.setItem(columnsKey, JSON.stringify(columns))
    }, [columns, columnsKey])

    const getExtras = useCallback(
        (boardId) =>
            taskExtras[boardId] || { labels: [], subtasks: [], comments: [], attachments: [] },
        [taskExtras],
    )

    const updateExtras = useCallback((boardId, updater) => {
        setTaskExtras((current) => {
            const existing = current[boardId] || { labels: [], subtasks: [], comments: [], attachments: [] }
            return { ...current, [boardId]: updater(existing) }
        })
    }, [])

    const removeExtras = useCallback((boardId) => {
        setTaskExtras((current) => {
            const next = { ...current }
            delete next[boardId]
            return next
        })
    }, [])

    // --- Labels ---
    const toggleLabel = useCallback((boardId, label) => {
        updateExtras(boardId, (extras) => {
            const exists = extras.labels.some((l) => l.name === label.name)
            return {
                ...extras,
                labels: exists
                    ? extras.labels.filter((l) => l.name !== label.name)
                    : [...extras.labels, label],
            }
        })
    }, [updateExtras])

    // --- Subtasks / checklist ---
    const addSubtask = useCallback((boardId, text) => {
        updateExtras(boardId, (extras) => ({
            ...extras,
            subtasks: [...extras.subtasks, { id: `st_${Date.now()}`, text, done: false }],
        }))
    }, [updateExtras])

    const toggleSubtask = useCallback((boardId, subtaskId) => {
        updateExtras(boardId, (extras) => ({
            ...extras,
            subtasks: extras.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, done: !st.done } : st
            ),
        }))
    }, [updateExtras])

    const deleteSubtask = useCallback((boardId, subtaskId) => {
        updateExtras(boardId, (extras) => ({
            ...extras,
            subtasks: extras.subtasks.filter((st) => st.id !== subtaskId),
        }))
    }, [updateExtras])

    // --- Comments ---
    const addComment = useCallback((boardId, text, author) => {
        updateExtras(boardId, (extras) => ({
            ...extras,
            comments: [
                ...extras.comments,
                { id: `cm_${Date.now()}`, text, author, timestamp: new Date().toISOString() },
            ],
        }))
    }, [updateExtras])

    // --- Attachments (link-style, no file upload) ---
    const addAttachment = useCallback((boardId, name, url) => {
        updateExtras(boardId, (extras) => ({
            ...extras,
            attachments: [...extras.attachments, { id: `att_${Date.now()}`, name, url }],
        }))
    }, [updateExtras])

    const deleteAttachment = useCallback((boardId, attachmentId) => {
        updateExtras(boardId, (extras) => ({
            ...extras,
            attachments: extras.attachments.filter((a) => a.id !== attachmentId),
        }))
    }, [updateExtras])

    // --- Columns (add / rename / delete / reorder / WIP limit) ---
    const addColumn = useCallback((title) => {
        setColumns((current) => [
            ...current,
            {
                id: `col_${Date.now()}`,
                title,
                color: COLUMN_COLOR_CYCLE[current.length % COLUMN_COLOR_CYCLE.length],
                wipLimit: null,
            },
        ])
    }, [])

    const renameColumn = useCallback((columnId, newTitle) => {
        setColumns((current) =>
            current.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col))
        )
    }, [])

    const deleteColumn = useCallback((columnId) => {
        setColumns((current) => current.filter((col) => col.id !== columnId))
    }, [])

    const setColumnWipLimit = useCallback((columnId, wipLimit) => {
        setColumns((current) =>
            current.map((col) => (col.id === columnId ? { ...col, wipLimit } : col))
        )
    }, [])

    const reorderColumns = useCallback((fromIndex, toIndex) => {
        setColumns((current) => {
            const next = [...current]
            const [moved] = next.splice(fromIndex, 1)
            next.splice(toIndex, 0, moved)
            return next
        })
    }, [])

    return {
        columns,
        labelPalette: LABEL_PALETTE,
        getExtras,
        toggleLabel,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addComment,
        addAttachment,
        deleteAttachment,
        addColumn,
        renameColumn,
        deleteColumn,
        setColumnWipLimit,
        reorderColumns,
        removeExtras,
    }
}
