import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'
import { parseSearch } from '#config/searchparser'

export default class TicketsController {
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = 20
    const rawQuery = (request.input('search') as string | null)?.trim()
    const parsedQuery = parseSearch(rawQuery as string)

    let query = Ticket.query()
    if (parsedQuery.term) {
      const like = `%${parsedQuery.term.toLowerCase()}%`
      query.where((qb) => {
        qb.whereRaw('LOWER(title)   LIKE ?', [like]).orWhereRaw('LOWER(content) LIKE ?', [like])
      })
    }

    /* date range */
    if (parsedQuery.after) query.where('creation_time', '>=', parsedQuery.after)
    if (parsedQuery.before) query.where('creation_time', '<=', parsedQuery.before)

    if (parsedQuery.reporter)
      query.whereRaw('LOWER(user_email) LIKE ?', [`%${parsedQuery.reporter}%`])

    const tickets = await query.orderBy('creation_time', 'desc').paginate(page, pageSize)

    return inertia.render('index', {
      tickets: tickets.toJSON(),
      search: rawQuery ?? '',
    })
  }
}
