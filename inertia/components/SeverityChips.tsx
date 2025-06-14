import React from 'react'

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'

interface Props {
  value: Severity | null
  onChange: (level: Severity | null) => void
}

const levels: Severity[] = ['Critical', 'High', 'Medium', 'Low']

// export default function SeverityChips({ value, onChange }: Props) {
//   return (
//     <ul className="flex gap-3 mb-4">
//       {levels.map((lvl) => {
//         const active = value === lvl
//         return (
//           <li key={lvl}>
//             <button
//               type="button"
//               onClick={() => onChange(active ? null : lvl)}
//               className={`px-3 py-1 rounded-full text-xs font-medium border transition
//                 ${active
//                   ? 'bg-primary text-white border-primary'
//                   : 'bg-sand-2 text-sand-11 border-sand-7 hover:bg-sand-3'}`}
//             >
//               {lvl}
//             </button>
//           </li>
//         )
//       })}
//     </ul>
//   )
// }


 // if you have lucide; otherwise inline SVG


interface Props {
  value: Severity | null
  onChange: (s: Severity | null) => void
}


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
                ${active
                  ? 'bg-primary text-white border-primary pr-6'  /* leave space for the X */
                  : 'bg-sand-2 text-sand-11 border-sand-7 hover:bg-sand-3'}`}
            >
              {lvl}
            </button>

            {/* clear “×” shown only when active */}
            {active && (
              <button
                onClick={() => onChange(null)}
                aria-label="Clear severity filter"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-200 text-primary
                           flex items-center justify-center hover:bg-sand-2 shadow"
              >
                {/* use lucide X or fallback */}
                 <span className='text-[10px]'>X</span>
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
