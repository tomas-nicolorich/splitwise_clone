import prisma from './lib/prisma.js'
import { serializeBigInt } from './lib/db-utils.js'

export default async function handler(req, res) {
  const { operation, id } = req.query
  const { data } = req.body

  try {
    switch (operation) {
      case 'list': {
        const groups = await prisma.Group.findMany()
        return res.status(200).json(groups.map(g => serializeBigInt(g)))
      }
      case 'get': {
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
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
