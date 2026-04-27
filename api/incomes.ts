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
        const incomes = await prisma.Income.findMany({ where: { group_id: BigInt(group_id) } })
        return res.status(200).json(incomes.map(i => serializeBigInt(i)))
      }
      case 'create': {
        const newIncome = await prisma.Income.create({ data })
        return res.status(200).json(serializeBigInt(newIncome))
      }
      case 'delete': {
        if (!id) return res.status(400).json({ error: 'id is required' })
        await prisma.Income.deleteMany({ where: { id: BigInt(id) } })
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
