import { useState, useMemo, useEffect,  useCallback } from 'react'
import { Head, router } from '@inertiajs/react'
import { useHiddenTickets } from '~/hooks/useHiddenTicket'

import { useDebounce } from '~/hooks/useDebounce'
import { useIntersection } from '~/hooks/useIntersection'
import Spinner from '~/components/Spinner'
import SeverityChips, { Severity } from '~/components/SeverityChips'
import TicketsList from '~/components/TicketsList'
import DownloadIcon from '~/components/DownloadIcon'

export type Ticket = {
  id: string
  title: string
  content: string
  creationTime: number
  userEmail: string
  labels?: string[]
}

export interface AppProps {
  tickets: {
    data: Ticket[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  search: string
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="text-lg text-sand-11">
        {hasSearch ? 'No issues found matching your search.' : 'No security issues found.'}
      </div>
    </div>
  )
}

export default function App({ tickets, search: serverSearch }: AppProps) {
  const [search, setSearch] = useState(serverSearch)
  // 👉 hide/restore hook lives in ~/hooks/useHiddenTickets
  const { hiddenIds, toggle, restoreAll } = useHiddenTickets()
  const debouncedValue = useDebounce(search, 500)
  const [rows, setRows] = useState<Ticket[]>(tickets.data)
  const [loading, setLoading] = useState(false)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)
  const [severity, setSeverity] = useState<Severity | null>(null)


  // SERVER ROUND-TRIP whenever text or chip changes
  useEffect(() => {
    router.get(
      '/',
      { search: debouncedValue, severity:  severity ?? undefined, },
      {
        replace: true,
        only: ['tickets', 'search'],
        preserveScroll: true,
        preserveState: true,
      }
    )
  }, [debouncedValue, severity])

  // 🔄  Keep “rows” in-sync when a fresh query arrives (page 1)
  useEffect(() => {
    if (tickets.meta.currentPage === 1) {
      setRows(tickets.data)
    }
  }, [tickets.data, tickets.meta.currentPage])

   // Client-side filters: hidden items + active severity chipn
  const ticketData = useMemo(
    () =>
      rows
        .filter((t) => !hiddenIds.has(t.id))
        .filter((t) => !severity || (t.labels ?? []).includes(severity)),
    [rows, hiddenIds, severity]
  )

  // ⬇️ Infinite scroll (IntersectionObserver lives in useIntersection)
  const loadNextPage = useCallback(() => {
    if (loading || hasReachedEnd) return
    if (tickets.meta.currentPage >= tickets.meta.lastPage) return

    setLoading(true)
    const nextPage = tickets.meta.currentPage + 1

    router.get(
      '/',
      { search: debouncedValue, page: nextPage },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          const { data, meta } = page.props.tickets as AppProps['tickets']

          /* 1️⃣ append */
          setRows((prev) => [...prev, ...data])

          if (meta.currentPage >= meta.lastPage || data.length === 0) {
            setHasReachedEnd(true)
          }
        },
        onFinish: () => setLoading(false),
      }
    )
  }, [loading, hasReachedEnd, debouncedValue, tickets.meta])

  // for infinite scroll
  const loaderRef = useIntersection(loadNextPage, '200px', hasReachedEnd)
  return (
    <>
      <Head title="Security Issues" />

      <div className="min-h-screen bg-sand-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <main>
            <h1 className="text-3xl font-bold text-sand-12 mb-8">Security Issues List</h1>

            <header className=" mb-6">
              <input
                type="search"
                placeholder="Search issues..."
                className="w-full max-w-md px-4 py-2 border border-sand-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <div className="flex justify-between items-center mt-10">
                <SeverityChips value={severity} onChange={setSeverity} />

                <a
                  href={`/export?search=${encodeURIComponent(search)}`}
                  className="ml-auto inline-flex items-center gap-1 text-sm text-sky-600 hover:underline"
                >
                  <DownloadIcon />
                  Export CSV
                </a>
              </div>
            </header>

            {tickets && (
              <div className="text-sm text-sand-11 mb-4">
                Showing {ticketData.length} of {tickets.meta.total} issues
                {hiddenIds.size > 0 && (
                  <span className="italic">
                    {' '}
                    ({hiddenIds.size} hidden –{' '}
                    <button onClick={restoreAll} className="text-sky-600 italic ">
                      restore
                    </button>
                    )
                  </span>
                )}
              </div>
            )}

            {ticketData.length > 0 ? (
              <>
                <TicketsList tickets={ticketData} toggle={toggle} />

                <div ref={loaderRef} />

                {loading && (
                  <div className="mt-4 flex justify-center">
                    <Spinner size={30} />
                  </div>
                )}
                {hasReachedEnd && (
                  <div className="mt-6 text-center text-sand-10 text-sm">
                    • No more issues to load •
                  </div>
                )}
              </>
            ) : (
              <EmptyState hasSearch={Boolean(search)} />
            )}
          </main>
        </div>
      </div>
    </>
  )
}
