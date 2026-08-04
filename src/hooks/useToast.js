import { useCallback, useRef, useState } from 'react'

let idCounter = 0

/**
 * Minimal toast hook. Mount <ToastStack toasts={toasts} onDismiss={dismissToast} />
 * once near the root of whatever component calls this hook.
 *
 * showToast(message, { type: 'success' | 'error' | 'info', duration })
 */
export function useToast() {
    const [toasts, setToasts] = useState([])
    const timersRef = useRef({})

    const dismissToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id])
            delete timersRef.current[id]
        }
    }, [])

    const showToast = useCallback((message, options = {}) => {
        const { type = 'info', duration = 3500 } = options
        const id = ++idCounter

        setToasts((current) => [...current, { id, message, type }])

        timersRef.current[id] = setTimeout(() => {
            dismissToast(id)
        }, duration)

        return id
    }, [dismissToast])

    return { toasts, showToast, dismissToast }
}
