import { useState, useEffect, useMemo, useCallback } from 'react'
import { router } from '@inertiajs/react'
import { useDebounce } from './useDebounce'
import { useIntersection } from './useIntersection'
import { Severity } from '~/components/SeverityChips'
import type { AppProps } from '~/pages/index'

type UseTicketsManagerProps = {
  initialTickets: AppProps['tickets']
  initialSearch: string
  initialSeverity: Severity | null
  hiddenIds: Set<string>
}

export function useTicketsManager({
  initialTickets,
  initialSearch,
  initialSeverity,
  hiddenIds,
}: UseTicketsManagerProps) {
  const [search, setSearch] = useState(initialSearch)
  const [severity, setSeverity] = useState<Severity | null>(initialSeverity)
  const [rows, setRows] = useState(initialTickets.data)
  const [loading, setLoading] = useState(false)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  // Server round-trip for filters
  useEffect(() => {
    router.get(
      '/',
      { search: debouncedSearch, severity: severity ?? undefined },
      {
        replace: true,
        only: ['tickets', 'search'],
        preserveScroll: true,
        preserveState: true,
      }
    )
  }, [debouncedSearch, severity])

  // Sync rows when new data arrives
  useEffect(() => {
    if (initialTickets.meta.currentPage === 1) {
      setRows(initialTickets.data)
    }
  }, [initialTickets.data, initialTickets.meta.currentPage])

  // Client-side filtering
  const ticketData = useMemo(() => rows.filter((t) => !hiddenIds.has(t.id)), [rows, hiddenIds])

  // Infinite scroll loading
  const loadNextPage = useCallback(() => {
    if (loading || hasReachedEnd) return
    if (initialTickets.meta.currentPage >= initialTickets.meta.lastPage) return

    setLoading(true)
    const nextPage = initialTickets.meta.currentPage + 1

    router.get(
      '/',
      { search: debouncedSearch, page: nextPage, severity: severity ?? undefined },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          const { data, meta } = page.props.tickets as AppProps['tickets']
          setRows((prev) => [...prev, ...data])

          if (meta.currentPage >= meta.lastPage || data.length === 0) {
            setHasReachedEnd(true)
          }
        },
        onFinish: () => setLoading(false),
      }
    )
  }, [loading, hasReachedEnd, debouncedSearch, severity, initialTickets.meta])

  const loaderRef = useIntersection(loadNextPage, '200px', hasReachedEnd)

  return {
    search,
    setSearch,
    severity,
    setSeverity,
    ticketData,
    loading,
    hasReachedEnd,
    loaderRef,
  }
}
