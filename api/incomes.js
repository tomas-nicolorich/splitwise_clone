import prisma from './lib/prisma.js'
import { serializeBigInt } from './lib/db-utils.js'

export default async function handler(req, res) {
  const { operation, id, group_id } = req.query
  const { data } = req.body

  try {
    switch (operation) {
      case 'list': {
        const incomes = await prisma.Income.findMany({ where: { group_id: BigInt(group_id) } })
        return res.status(200).json(incomes.map(i => serializeBigInt(i)))
      }
      case 'create': {
        const newIncome = await prisma.Income.create({ data })
        return res.status(200).json(serializeBigInt(newIncome))
      }
      case 'delete': {
        await prisma.Income.delete({ where: { id: BigInt(id) } })
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
