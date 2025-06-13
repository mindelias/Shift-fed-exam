import { useState,  useMemo, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import { useHiddenTickets } from '~/hooks/useHiddenTicket'
import { ExpandableText } from '~/components/ExpandedText'
import { useDebounce } from '~/hooks/useDebounce'

export type Ticket = {
  id: string
  title: string
  content: string
  creationTime: number
  userEmail: string
  labels?: string[]
}

interface AppProps {
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
interface TicketProps {
  tickets: Ticket[]
  toggle: (id: string) => void
}

const content = `Our login form appears to be vulnerable to SQL injection attacks. When I enter ' OR '1'='1 in the username field, I'm able to bypass authentication. This is a critical security flaw that needs immediate attention.Our login form appears to be vulnerable to SQL injection attacks. When I enter ' OR '1'='1 in the username field, I'm able to bypass authentication. This is a critical security flaw that needs immediate attention.Our login form appears to be vulnerable to SQL injection attacks. When I enter ' OR '1'='1 in the username field, I'm able to bypass authentication. This is a critical security flaw that needs immediate attention.Our login form appears to be vulnerable to SQL injection attacks. When I enter ' OR '1'='1 in the username field, I'm able to bypass authentication. This is a critical security flaw that needs immediate attention.`
function TagBadge({ label }: { label: string }) {
  return (
    <span
      className="
    inline-flex items-center
    px-3 py-1
    rounded-md
    text-xs font-medium
    bg-sky-100 text-sky-700 border border-sky-300
    "
    >
      {label}
    </span>
  )
}

// TODO: move this to a separate component
function TicketsList({ tickets, toggle }: TicketProps) {
  return (
    <ul className="space-y-4">
      {tickets.map((ticket, ind) => (
        <li
          key={ticket.id}
          className="group relative bg-white border border-sand-7 rounded-lg p-6 hover:border-sand-8 hover:shadow-sm transition duration-200"
        >
          <button
            type="button"
            onClick={() => toggle(ticket.id)}
            className="
                  hidden group-hover:inline-flex
                  absolute top-3 right-4
                  text-sm font-medium
                  text-sand-10 hover:text-sand-12
                "
          >
            Hide
          </button>

          <h5 className="text-lg font-semibold text-sand-12 mb-2">{ticket.title}</h5>

          {/* added description */}

          {/* This is done to test the expandable text */}
          {ind === 0 ? <ExpandableText text={content} /> : <ExpandableText text={ticket.content} />}

          <footer className="flex flex-col md:flex-row sm:justify-between md:items-center">
            <div className="text-sm text-sand-10">
              By {ticket.userEmail} | {formatDate(ticket.creationTime)}
            </div>

            {/* LABELS */}
            {ticket?.labels && ticket?.labels?.length > 0 ? (
              <div className=" mt-4 md:mt-0 flex flex-wrap gap-2 md:justify-end">
                {ticket.labels.map((lbl) => (
                  <TagBadge key={lbl} label={lbl} />
                ))}
              </div>
            ) : null}
          </footer>
        </li>
      ))}
    </ul>
  )
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
  const { hiddenIds, toggle, restoreAll } = useHiddenTickets()
  const debouncedValue = useDebounce(search, 500)

  useEffect(() => {
    router.get(
      '/',
      { search: debouncedValue },
      {
        replace: true,
        only: ['tickets', 'search'],
        preserveScroll: true,
        preserveState: true,
      }
    )
  }, [debouncedValue])

  const ticketData = useMemo(
    () => tickets.data.filter((t) => !hiddenIds.has(t.id)),
    [tickets, hiddenIds]
  )
  return (
    <>
      <Head title="Security Issues" />

      <div className="min-h-screen bg-sand-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <main>
            <h1 className="text-3xl font-bold text-sand-12 mb-8">Security Issues List</h1>

            <header className="mb-6">
              <input
                type="search"
                placeholder="Search issues..."
                className="w-full max-w-md px-4 py-2 border border-sand-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
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
              <TicketsList tickets={ticketData} toggle={toggle} />
            ) : (
              <EmptyState hasSearch={Boolean(search)} />
            )}
          </main>
        </div>
      </div>
    </>
  )
}

function formatDate(unixTimestemp: number) {
  return new Date(unixTimestemp)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')
}
