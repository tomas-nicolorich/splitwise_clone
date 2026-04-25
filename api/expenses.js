import prisma from './lib/prisma.js'
import { serializeBigInt } from './lib/db-utils.js'

export default async function handler(req, res) {
  const { operation, id, group_id } = req.query
  const { data } = req.body

  try {
    switch (operation) {
      case 'list': {
        const expenses = await prisma.Expense.findMany({ where: { group_id: BigInt(group_id) } })
        return res.status(200).json(expenses.map(e => serializeBigInt(e)))
      }
      case 'create': {
        const newExpense = await prisma.Expense.create({ data })
        return res.status(200).json(serializeBigInt(newExpense))
      }
      case 'delete': {
        await prisma.Expense.delete({ where: { id: BigInt(id) } })
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
