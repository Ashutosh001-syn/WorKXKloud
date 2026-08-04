import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { mockNotifications } from '../data/mockNotifications'

export const NOTIFICATIONS_PAGE_SIZE = 6

/**
 * Fetches the notification list.
 *
 * TODO(backend): once GET_NOTIFICATIONS is live, this becomes:
 *
 *   const token = localStorage.getItem('token')
 *   const res = await fetch(API_ENDPOINTS.GET_NOTIFICATIONS, {
 *     headers: { Authorization: `Bearer ${token}` },
 *   })
 *   if (!res.ok) throw new Error('Failed to load notifications')
 *   const data = await res.json()
 *   return data.notifications
 *
 * Falling back to mock data for now so the UI is fully functional
 * during frontend development.
 */
async function fetchNotifications() {
    try {
        // Uncomment when backend endpoint is ready:
        // const token = localStorage.getItem('token')
        // const res = await fetch(API_ENDPOINTS.GET_NOTIFICATIONS, {
        //   headers: { Authorization: `Bearer ${token}` },
        // })
        // if (!res.ok) throw new Error('Failed to load notifications')
        // const data = await res.json()
        // return data.notifications

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

    const markOneAsRead = useCallback((id) => {
        setNotifications((current) =>
            current.map((item) => (item.id === id ? { ...item, read: true } : item)),
        )

        // TODO(backend): fire and forget
        // fetch(API_ENDPOINTS.MARK_NOTIFICATION_READ, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ id }),
        // }).catch(() => {})
    }, [])

    const markAllAsRead = useCallback(() => {
        setNotifications((current) => current.map((item) => ({ ...item, read: true })))

        // TODO(backend): fire and forget
        // fetch(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, { method: 'POST' }).catch(() => {})
    }, [])

    const clearAll = useCallback(() => {
        setNotifications([])
        setPage(1)

        // TODO(backend): fire and forget
        // fetch(API_ENDPOINTS.CLEAR_ALL_NOTIFICATIONS, { method: 'DELETE' }).catch(() => {})
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