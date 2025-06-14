function parseDate(d: string) {
  const [day, month, year] = d.split('/')
  const iso = `${year}-${month}-${day}T00:00:00Z`
  const parsedDate = Date.parse(iso)
  return Number.isNaN(parsedDate) ? null : parsedDate
}

export interface SearchFilters {
  after?: number
  before?: number
  reporter?: string
  term?: string
}

/** Parses strings like "after:27/09/2019 xss reporter:bob@corp.io" */
export function parseSearch(raw: string): SearchFilters {
  if (!raw) return { term: '' }
  const parts = raw.trim().split(/\s+/)
  const out: SearchFilters = { term: '' }

  for (const p of parts) {
    if (p.startsWith('after:')) {
      const ts = parseDate(p.slice(6))
      if (ts) out.after = ts
    } else if (p.startsWith('before:')) {
      const ts = parseDate(p.slice(7))
      if (ts) out.before = ts
    } else if (p.startsWith('reporter:')) {
      out.reporter = p.slice(9).toLowerCase()
    } else {
      out.term += `${p} `
    }
  }
  out.term = out?.term!.trim()
  return out
}
