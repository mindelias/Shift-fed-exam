import React from 'react'

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'

interface Props {
  value: Severity | null
  onChange: (level: Severity | null) => void
}

const levels: Severity[] = ['Critical', 'High', 'Medium', 'Low']

export const severityTheme = {
  Critical: 'bg-red-600  text-white border-red-600',
  High: 'bg-red-200  text-red-800  border-red-300',
  Medium: 'bg-yellow-200 text-yellow-800 border-yellow-300',
  Low: 'bg-green-200 text-green-800 border-green-300',
} as const
export default function SeverityChips({ value, onChange }: Props) {
  return (
    <ul className="flex gap-3 mb-4">
      {levels.map((lvl) => {
        const active = value === lvl
        return (
          <li key={lvl} className="relative">
            <button
              type="button"
              onClick={() => onChange(active ? null : lvl)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition
                ${active ? severityTheme[lvl] + ' pr-6' : 'bg-sand-2 text-sand-11 border-sand-7 hover:bg-sand-3'}`}
            >
              {lvl}
            </button>

            {active && (
              <button
                onClick={() => onChange(null)}
                aria-label="Clear severity filter"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-200 text-primary
                           flex items-center justify-center hover:bg-sand-2 shadow"
              >
                <span className="text-[10px]">X</span>
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
