import React from 'react'

export function useHiddenTickets() {
  const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('shift-fed-hidden')
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  React.useEffect(() => {
    localStorage.setItem('shift-fed-hidden', JSON.stringify([...hiddenIds]))
  }, [hiddenIds])

  const toggle = (id: string) =>
    setHiddenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const restoreAll = () => setHiddenIds(new Set())

  return { hiddenIds, toggle, restoreAll }
}
