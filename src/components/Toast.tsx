import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface ToastItem {
  id: number
  text: string
}

const ToastContext = createContext<(text: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const show = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { id, text }])
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 2400)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-wrap">
        {items.map((i) => (
          <div className="toast" key={i.id}>
            {i.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
