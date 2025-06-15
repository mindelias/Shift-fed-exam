import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import { parseSearch } from '#config/searchparser'
import { stringify } from 'csv-stringify/sync'

export default class TicketsController {
  private buildQuery(f: ReturnType<typeof parseSearch>, severity?: string) {
    const q = Ticket.query()

    if (f.term) {
      const like = `%${f.term.toLowerCase()}%`
      q.where((b) => {
        b.whereRaw('LOWER(title) LIKE ?', [like]).orWhereRaw('LOWER(content) LIKE ?', [like])
      })
    }
    if (f.after) q.where('creation_time', '>=', f.after)
    if (f.before) q.where('creation_time', '<=', f.before)
    if (f.reporter) q.whereRaw('LOWER(user_email) LIKE ?', [`%${f.reporter}%`])

    // Add severity filtering (server-side)
    if (severity) {
      const likeSeverity = `%${severity}%`
      q.whereRaw('EXISTS (SELECT 1 FROM json_each(labels) WHERE  value LIKE ?)', [likeSeverity])
    }

    return q
  }

  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = 20
    const rawSearch = (request.input('search') as string | null) ?? ''
    const severity = request.input('severity', null) // Get severity from request
    const filters = parseSearch(rawSearch.trim())

    const tickets = await this.buildQuery(filters, severity || undefined)
      .orderBy('creation_time', 'desc')
      .paginate(page, pageSize)

    return inertia.render('index', {
      tickets: tickets.toJSON(),
      search: rawSearch,
      severity,
    })
  }

  public async exportCsv({ request, response }: HttpContext) {
    const rawSearch = (request.input('search') as string | null) ?? ''
    const severity = request.input('severity', null)
    const filters = parseSearch(rawSearch.trim())

    const rows = await this.buildQuery(filters, severity || undefined)
      .orderBy('creation_time')
      .exec()

    const csv = stringify(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        reporter: r.userEmail,
        labels: (r.labels ?? []).join('|'),
        created_at: new Date(r.creationTime).toISOString(),
      })),
      { header: true }
    )

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', 'attachment; filename="issues.csv"')
    return response.send(csv)
  }
}
