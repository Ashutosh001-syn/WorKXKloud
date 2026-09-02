import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockNotifications } from '../data/mockNotifications'

export const NOTIFICATIONS_PAGE_SIZE = 6

// GET_NOTIFICATIONS isn't live on the backend yet — falls back to mock data.
async function fetchNotifications() {
    try {
        return mockNotifications
    } catch (error) {
        console.error('useNotifications: fetch failed, using mock data', error)
        return mockNotifications
    }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
        let isMounted = true

        fetchNotifications().then((data) => {
            if (isMounted) {
                setNotifications(data)
                setLoading(false)
            }
        })

        return () => {
            isMounted = false
        }
    }, [])

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications],
    )

    const totalCount = notifications.length
    const totalPages = Math.max(1, Math.ceil(totalCount / NOTIFICATIONS_PAGE_SIZE))

    const paginatedNotifications = useMemo(() => {
        const start = (page - 1) * NOTIFICATIONS_PAGE_SIZE
        return notifications.slice(start, start + NOTIFICATIONS_PAGE_SIZE)
    }, [notifications, page])

    const rangeStart = totalCount === 0 ? 0 : (page - 1) * NOTIFICATIONS_PAGE_SIZE + 1
    const rangeEnd = Math.min(page * NOTIFICATIONS_PAGE_SIZE, totalCount)

    const goToPage = useCallback(
        (nextPage) => {
            setPage(Math.min(Math.max(nextPage, 1), totalPages))
        },
        [totalPages],
    )

    // MARK_NOTIFICATION_READ/MARK_ALL_NOTIFICATIONS_READ/CLEAR_ALL_NOTIFICATIONS
    // aren't live yet — these stay local-only until the backend is ready.
    const markOneAsRead = useCallback((id) => {
        setNotifications((current) =>
            current.map((item) => (item.id === id ? { ...item, read: true } : item)),
        )
    }, [])

    const markAllAsRead = useCallback(() => {
        setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    }, [])

    const clearAll = useCallback(() => {
        setNotifications([])
        setPage(1)
    }, [])

    return {
        notifications: paginatedNotifications,
        loading,
        unreadCount,
        totalCount,
        page,
        totalPages,
        rangeStart,
        rangeEnd,
        goToPage,
        markOneAsRead,
        markAllAsRead,
        clearAll,
    }
}