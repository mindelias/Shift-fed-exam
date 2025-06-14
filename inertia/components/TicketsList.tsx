
import React from "react"
import { Ticket } from "~/pages"
import TagBadge from "./TicketBadge"
import { ExpandableText } from "./ExpandedText"
import { formatDate } from "~/utils"

interface TicketProps {
  tickets: Ticket[]
  toggle: (id: string) => void
}
function TicketsList({ tickets, toggle }: TicketProps) {
  return (
    <ul className="space-y-4">
      {tickets.map((ticket) => (
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

          <ExpandableText text={ticket.content} />

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

export default TicketsList
