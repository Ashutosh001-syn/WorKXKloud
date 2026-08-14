import { useCallback, useEffect, useState } from 'react'

const LABEL_PALETTE = [
    { name: 'Bug', color: '#f05b61' },
    { name: 'Feature', color: '#4a8dea' },
    { name: 'Design', color: '#9153e8' },
    { name: 'Urgent', color: '#ef9527' },
    { name: 'Blocked', color: '#64748b' },
    { name: 'Docs', color: '#1aa37a' },
]

// `statusKey` is the exact snake_case value GET_BOARD/CREATE_BOARD use on
// the backend. It's what actually drives which column a card belongs to —
// `title` is just the label shown in the UI and can be renamed freely
// (double-click a column header) without breaking that link.
const DEFAULT_COLUMNS = [
    { id: 'in-discussion', title: 'In Discussion', color: 'bg-slate-400', wipLimit: null, statusKey: 'in_discussion' },
    { id: 'todo', title: 'To Do', color: 'bg-green-500', wipLimit: null, statusKey: 'to_do' },
    { id: 'in-work', title: 'In Work', color: 'bg-purple-500', wipLimit: null, statusKey: 'in_work' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500', wipLimit: null, statusKey: 'in_progress' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-600', wipLimit: null, statusKey: 'completed' },
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

export function useBoardExtras(projectId) {
    // v2: columns now carry a statusKey (see DEFAULT_COLUMNS above) — bumped
    // so anyone with the old 4-column/no-statusKey cache gets a clean reseed
    // instead of silently running with columns that can't map to a backend
    // status.
    const columnsKey = `board_columns_v2_${projectId || 'default'}`

    const [loadedProjectId, setLoadedProjectId] = useState(projectId)
    // Subtasks/comments/attachments have no backend field to persist to, so
    // they're in-memory only (reset on refresh) — labels moved to the real
    // backend `labels` field and are no longer tracked here at all.
    const [taskExtras, setTaskExtras] = useState({})
    const [columns, setColumns] = useState(() =>
        safeParse(localStorage.getItem(columnsKey), DEFAULT_COLUMNS)
    )


    if (projectId !== loadedProjectId) {
        setLoadedProjectId(projectId)
        setTaskExtras({})
        setColumns(safeParse(localStorage.getItem(columnsKey), DEFAULT_COLUMNS))
    }

    useEffect(() => {
        localStorage.setItem(columnsKey, JSON.stringify(columns))
    }, [columns, columnsKey])

    const getExtras = useCallback(
        (boardId) =>
            taskExtras[boardId] || { subtasks: [], comments: [], attachments: [] },
        [taskExtras],
    )

    const updateExtras = useCallback((boardId, updater) => {
        setTaskExtras((current) => {
            const existing = current[boardId] || { subtasks: [], comments: [], attachments: [] }
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
                // Custom columns have no backend status to map to — cards
                // moved here stay local-only (see ProjectBoardSection's
                // moveTask) until the backend supports arbitrary statuses.
                statusKey: null,
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