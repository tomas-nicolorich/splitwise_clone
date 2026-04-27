import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './lib/prisma'
import { serializeBigInt } from './lib/db-utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { operation, id, group_id } = req.query as { operation: string, id?: string, group_id?: string }
  const { data } = req.body

  try {
    switch (operation) {
      case 'list': {
        if (!group_id) return res.status(400).json({ error: 'group_id is required' })
        const expenses = await prisma.Expense.findMany({ where: { group_id: BigInt(group_id) } })
        return res.status(200).json(expenses.map(e => serializeBigInt(e)))
      }
      case 'create': {
        const newExpense = await prisma.Expense.create({ data })
        return res.status(200).json(serializeBigInt(newExpense))
      }
      case 'delete': {
        if (!id) return res.status(400).json({ error: 'id is required' })
        await prisma.Expense.delete({ where: { id: BigInt(id) } })
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
