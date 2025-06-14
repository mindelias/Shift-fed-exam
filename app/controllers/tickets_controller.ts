import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import { parseSearch } from '#config/searchparser'
import { stringify } from 'csv-stringify/sync'

export default class TicketsController {
  private buildQuery(f: ReturnType<typeof parseSearch>) {
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

    return q
  }
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = 20
    const rawSearch = (request.input('search') as string | null) ?? ''
    const filters = parseSearch(rawSearch.trim())

    const tickets = await this.buildQuery(filters)
      .orderBy('creation_time', 'desc')
      .paginate(page, pageSize)

    return inertia.render('index', {
      tickets: tickets.toJSON(),
      search: rawSearch,
    })
  }
  public async exportCsv({ request, response }: HttpContext) {
    const filters = parseSearch((request.input('search') as string | null) ?? '')
    const rows = await this.buildQuery(filters).orderBy('creation_time').exec()

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
