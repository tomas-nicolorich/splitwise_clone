import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './lib/prisma'
import { serializeBigInt } from './lib/db-utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { operation, id } = req.query as { operation: string, id?: string }
  const { data } = req.body

  try {
    switch (operation) {
      case 'list': {
        const groups = await prisma.Group.findMany()
        return res.status(200).json(groups.map(g => serializeBigInt(g)))
      }
      case 'get': {
        if (!id) return res.status(400).json({ error: 'id is required' })
        const group = await prisma.Group.findUnique({ where: { id: BigInt(id) } })
        return res.status(200).json(serializeBigInt(group))
      }
      case 'create': {
        const newGroup = await prisma.Group.create({ data })
        return res.status(200).json(serializeBigInt(newGroup))
      }
      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
