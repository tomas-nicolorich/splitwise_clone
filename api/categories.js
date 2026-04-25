import prisma from './lib/prisma.js'
import { serializeBigInt } from './lib/db-utils.js'

export default async function handler(req, res) {
  const { operation, id, group_id } = req.query
  const { data } = req.body

  try {
    switch (operation) {
      case 'list': {
        const categories = await prisma.BudgetCategory.findMany({ where: { group_id: BigInt(group_id) } })
        return res.status(200).json(categories.map(c => serializeBigInt(c)))
      }
      case 'create': {
        const newCategory = await prisma.BudgetCategory.create({ data })
        return res.status(200).json(serializeBigInt(newCategory))
      }
      case 'delete': {
        await prisma.BudgetCategory.delete({ where: { id: BigInt(id) } })
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
