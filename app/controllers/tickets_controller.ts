import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/ticket'

export default class TicketsController {
  async index({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const pageSize = 20
    const rawQuery = (request.input('search') as string | null)?.trim()?.toLowerCase()

    let query = Ticket.query()
    if (rawQuery) {
      const like = `%${rawQuery}%`
      query.where((qb) => {
        qb.whereRaw('LOWER(title)   LIKE ?', [like]).orWhereRaw('LOWER(content) LIKE ?', [like])
      })
    }

    const tickets = await query.orderBy('creation_time', 'desc').paginate(page, pageSize)

    return inertia.render('index', {
      tickets: tickets.toJSON(),
      search: rawQuery ?? '',
    })
  }
}
