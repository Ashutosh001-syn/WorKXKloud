import { useCallback, useEffect, useState } from 'react'
import { API_ENDPOINTS } from '../config/api'

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

// Maps a getBoardStatus row's free-text `status` (any casing/separator —
// "to_do", "To Do", "in progress") back to the fixed statusKey getBoard
// actually filters cards by, so the real heading text comes from the API
// while card-matching stays correct regardless of how it was typed.
const STATUS_KEY_LOOKUP = {
    'in discussion': 'in_discussion',
    'to do': 'to_do',
    'in work': 'in_work',
    'in progress': 'in_progress',
    'completed': 'completed',
}
function normalizeTitle(s) {
    return String(s || '').trim().toLowerCase().replace(/[_\s]+/g, ' ')
}

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

    // getBoardStatus is the source of truth for column HEADINGS (not just an
    // add-on merge) — reconciles away stale locally-renamed/invented titles
    // (e.g. a column renamed to "starting"/"Backlog" only in this browser's
    // localStorage) so every session shows the same names the API actually
    // has on record. The 5 real getBoard buckets are always kept even if a
    // status of that kind was never registered via saveBoardStatus (so
    // existing cards under e.g. "completed" don't visually vanish); any
    // other registered status is appended after them as a custom column.
    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const res = await fetch(API_ENDPOINTS.GET_BOARD_STATUS)
                const data = await res.json()
                if (cancelled || !data?.success || !Array.isArray(data.data)) return

                const apiRows = [...data.data].sort((a, b) => a.id - b.id)
                const rowByKey = new Map()
                const extraRows = []
                apiRows.forEach((row) => {
                    const key = STATUS_KEY_LOOKUP[normalizeTitle(row.status)]
                    if (key) rowByKey.set(key, row)
                    else extraRows.push(row)
                })

                setColumns((current) => {
                    const localByKey = new Map(current.filter((c) => c.statusKey).map((c) => [c.statusKey, c]))
                    const usedRowIds = new Set()

                    // Once a default bucket has claimed a remoteStatusId (either
                    // just now by name match, or in an earlier session/rename),
                    // stick with that id forever — re-matching by normalized
                    // title on every fetch would lose track of it the moment
                    // it's renamed to something that no longer reads as
                    // "to do"/"in progress"/etc.
                    const primary = DEFAULT_COLUMNS.map((def) => {
                        const localMatch = localByKey.get(def.statusKey)
                        let row = null
                        if (localMatch?.remoteStatusId != null) {
                            row = apiRows.find((r) => r.id === localMatch.remoteStatusId) || null
                        } else {
                            row = rowByKey.get(def.statusKey) || null
                        }
                        if (row) usedRowIds.add(row.id)
                        return {
                            id: localMatch?.id || def.id,
                            title: row ? row.status : (localMatch?.title || def.title),
                            color: localMatch?.color || def.color,
                            wipLimit: localMatch?.wipLimit ?? null,
                            statusKey: def.statusKey,
                            remoteStatusId: row ? row.id : null,
                        }
                    })

                    const localByRemoteId = new Map(
                        current.filter((c) => c.remoteStatusId != null).map((c) => [c.remoteStatusId, c])
                    )
                    const extras = apiRows
                        .filter((row) => !usedRowIds.has(row.id))
                        .map((row, idx) => {
                            const localMatch = localByRemoteId.get(row.id)
                            return {
                                id: `col_remote_${row.id}`,
                                title: row.status,
                                color: localMatch?.color || COLUMN_COLOR_CYCLE[idx % COLUMN_COLOR_CYCLE.length],
                                wipLimit: localMatch?.wipLimit ?? null,
                                // Still no backend status bucket to map to (see
                                // SAVE_BOARD_STATUS's comment in api.js) — only
                                // the column's own name is shared/dynamic so far.
                                statusKey: null,
                                remoteStatusId: row.id,
                            }
                        })

                    return [...primary, ...extras]
                })
            } catch {
                // keep current columns
            }
        })()
        return () => { cancelled = true }
    }, [projectId])

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
    // Persists the column's NAME via saveBoardStatus so it's shared across
    // sessions/users (see GET_BOARD_STATUS's fetch above) — still falls
    // back to a local-only column if that call fails, so "Add Column"
    // keeps working even when the backend is briefly unreachable.
    const addColumn = useCallback(async (title) => {
        let remoteStatusId = null
        try {
            const res = await fetch(API_ENDPOINTS.SAVE_BOARD_STATUS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: title }),
            })
            const data = await res.json()
            if (data?.success) remoteStatusId = data.data?.id ?? null
        } catch {
            // fall through to the local-only add below
        }
        setColumns((current) => [
            ...current,
            {
                id: remoteStatusId ? `col_remote_${remoteStatusId}` : `col_${Date.now()}`,
                title,
                color: COLUMN_COLOR_CYCLE[current.length % COLUMN_COLOR_CYCLE.length],
                wipLimit: null,
                // Cards moved here still can't be read back via getBoard
                // (it only returns 5 fixed statuses — confirmed live), so
                // they stay tracked locally (see ProjectBoardSection's
                // moveTask) until getBoard adds a matching bucket.
                statusKey: null,
                remoteStatusId,
            },
        ])
    }, [])

    // Only columns that came from saveBoardStatus/getBoardStatus (carry a
    // remoteStatusId) have anything to rename server-side — the 5 fixed
    // DEFAULT_COLUMNS aren't rows in that table, so renaming those stays
    // local-only exactly as before.
    const renameColumn = useCallback((columnId, newTitle) => {
        const target = columns.find((col) => col.id === columnId)
        if (target?.remoteStatusId) {
            fetch(API_ENDPOINTS.RENAME_BOARD_STATUS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: target.remoteStatusId, status: newTitle }),
            }).catch(() => {})
            setColumns((current) =>
                current.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col))
            )
            return
        }

        // Default buckets (To Do, In Progress, ...) start with no
        // remoteStatusId until something registers a matching row — if none
        // exists yet, renaming must CREATE one via saveBoardStatus (same
        // call addColumn uses), otherwise the new name only lives in this
        // browser's localStorage and the next getBoardStatus reconcile wipes
        // it back to the hardcoded default.
        fetch(API_ENDPOINTS.SAVE_BOARD_STATUS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newTitle }),
        })
            .then((res) => res.json())
            .then((data) => {
                const remoteStatusId = data?.success ? (data.data?.id ?? null) : null
                setColumns((current) =>
                    current.map((col) =>
                        col.id === columnId ? { ...col, title: newTitle, remoteStatusId } : col
                    )
                )
            })
            .catch(() => {
                setColumns((current) =>
                    current.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col))
                )
            })
    }, [columns])

    // Same remoteStatusId gate as renameColumn — only columns backed by a
    // real saveBoardStatus row have anything to delete server-side.
    const deleteColumn = useCallback((columnId) => {
        const target = columns.find((col) => col.id === columnId)
        if (target?.remoteStatusId) {
            fetch(API_ENDPOINTS.DELETE_BOARD_STATUS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: target.remoteStatusId }),
            }).catch(() => {})
        }
        setColumns((current) => current.filter((col) => col.id !== columnId))
    }, [columns])

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