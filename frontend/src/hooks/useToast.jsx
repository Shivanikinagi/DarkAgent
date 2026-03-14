import { createContext, useContext, useState, useCallback } from 'react'

export const ToastContext = createContext(null)

let _id = 0
function nextId() { return String(++_id) }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback((type, message, opts = {}) => {
    const id = nextId()
    const duration = opts.duration ?? 5000
    setToasts((prev) => {
      const next = [...prev, { id, type, message, txHash: opts.txHash, duration }]
      return next.slice(-5) // cap at 5
    })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const toast = {
    success: (msg, opts) => add('success', msg, opts),
    error: (msg, opts) => add('error', msg, opts),
    pending: (msg, opts) => add('pending', msg, { duration: 0, ...opts }),
    info: (msg, opts) => add('info', msg, opts),
    dismiss,
  }

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
