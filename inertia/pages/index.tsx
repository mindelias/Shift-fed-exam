import { Head,   } from '@inertiajs/react'
import { useHiddenTickets } from '~/hooks/useHiddenTicket'
import Spinner from '~/components/Spinner'
import SeverityChips, { Severity } from '~/components/SeverityChips'
import TicketsList from '~/components/TicketsList'
import DownloadIcon from '~/components/DownloadIcon'
import { useTicketsManager } from '~/hooks/useTickerManager'

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
  severity: Severity | null
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



export default function App({ tickets, search: serverSearch, severity: serverSeverity }: AppProps) {
  const { hiddenIds, toggle, restoreAll } = useHiddenTickets()
  const {
    search,
    setSearch,
    severity,
    setSeverity,
    ticketData,
    loading,
    hasReachedEnd,
    loaderRef
  } = useTicketsManager({
    initialTickets: tickets,
    initialSearch: serverSearch,
    initialSeverity: serverSeverity,
    hiddenIds,
  })

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
                <div>
                  <SeverityChips value={severity} onChange={setSeverity} />
                  <p className="text-xs text-sand-10 -mt-3">
                    click a label to filter by severity
                  </p>
                </div>

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


