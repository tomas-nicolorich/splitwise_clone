import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './lib/prisma'
import { schemas } from './lib/schemas'
import { serializeBigInt, syncSequence, resolveUuidToBigInt } from './lib/db-utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const params = { ...req.query, ...req.body }
  const { entity, operation } = params as { entity: string, operation: string }

  type EntityName = 'Users' | 'Group' | 'Expense' | 'BudgetCategory' | 'Income';
  const isValidEntity = (e: string): e is EntityName => {
    return ['Users', 'Group', 'Expense', 'BudgetCategory', 'Income'].includes(e);
  };

  if (!entity || !isValidEntity(entity)) {
    return res.status(400).json({ error: `Invalid entity: ${entity}` })
  }

  // Define a common interface for the Prisma delegates to avoid union signature issues
  interface CommonDelegate {
    findMany(args?: any): Promise<any[]>;
    findFirst(args?: any): Promise<any>;
    create(args: any): Promise<any>;
    update(args: any): Promise<any>;
    updateMany(args: any): Promise<{ count: number }>;
    delete(args: any): Promise<any>;
    deleteMany(args: any): Promise<{ count: number }>;
  }

  const prismaEntity = prisma[entity] as unknown as CommonDelegate

  // Helper to serialize BigInt and Decimal (local specific logic for Amount/Income)
  const serialize = (data: any) => {
    return JSON.parse(JSON.stringify(serializeBigInt(data)), (key, value) => {
      // Convert amount/income back to Number for calculation convenience on frontend
      if ((key === 'amount' || key === 'income') && typeof value === 'string') {
        const num = Number(value)
        if (!isNaN(num)) return num
      }
      return value
    })
  }

  const validateData = (data: any, schema: any) => {
    if (!schema) return data;
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return result.data;
  };

  const mapCriteria = (criteria: any) => {
    if (!criteria) return {}
    const where: any = {}
    for (const [key, value] of Object.entries(criteria)) {
      if (typeof value === 'object' && value !== null) {
        if ((value as any).$in) {
          where[key] = { in: (value as any).$in.map((v: any) => typeof v === 'string' && /^\d+$/.test(v) ? BigInt(v) : v) }
        } else {
          where[key] = value
        }
      } else {
        // Convert string IDs to BigInt for prisma
        if (['id', 'group_id', 'category_id', 'user', 'paid_by'].includes(key) && typeof value === 'string' && /^\d+$/.test(value)) {
          where[key] = BigInt(value)
        } else if ((key === 'members' || key === 'participating_members') && Array.isArray(value)) {
            where[key] = { hasSome: value.map(v => BigInt(v)) }
        } else {
          where[key] = value
        }
      }
    }
    return where
  }

  const mapTypes = async (data: any) => {
    if (!data) return data
    const newData = { ...data }
    const bigIntFields = ['id', 'group_id', 'category_id', 'user', 'paid_by']
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    for (const key of Object.keys(newData)) {
      if (bigIntFields.includes(key) && typeof newData[key] === 'string') {
        if (/^\d+$/.test(newData[key])) {
          newData[key] = BigInt(newData[key])
        } else if (uuidRegex.test(newData[key])) {
          // Resolve UUID to BigInt ID
          const bigIntId = await resolveUuidToBigInt(newData[key]);
          if (bigIntId) {
            newData[key] = bigIntId;
          }
        }
      }
      if (key === 'members' && Array.isArray(newData[key])) {
        const resolvedMembers = []
        for (const id of newData[key]) {
          if (typeof id === 'string') {
            if (/^\d+$/.test(id)) {
              resolvedMembers.push(BigInt(id))
            } else if (uuidRegex.test(id)) {
              const bigIntId = await resolveUuidToBigInt(id);
              if (bigIntId) resolvedMembers.push(bigIntId);
              else resolvedMembers.push(id);
            } else {
              resolvedMembers.push(id)
            }
          } else {
            resolvedMembers.push(id)
          }
        }
        newData[key] = resolvedMembers
      }
      // Convert date strings to Date objects for Prisma
      if (key === 'date' && typeof newData[key] === 'string' && newData[key].length >= 10) {
        newData[key] = new Date(newData[key])
      }
    }
    
    return newData
  }

  const enrichResult = (item: any) => {
    if (!item) return item
    const result = serialize(item)
    return result
  }

  try {
    switch (operation) {
      case 'list': {
        const { sort } = params as { sort?: string }
        const options: any = {}
        if (sort === '-created_date') {
          options.orderBy = { created_at: 'desc' }
        }
        
        const items = await prismaEntity.findMany(options)
        return res.status(200).json(items.map((i: any) => enrichResult(i)))
      }
      case 'filter': {
        const { criteria } = params as { criteria: any }
        const mappedCriteria = await mapTypes(criteria)
        const where = mapCriteria(mappedCriteria)
        const options = { where }
        
        const items = await prismaEntity.findMany(options)
        return res.status(200).json(items.map((i: any) => enrichResult(i)))
      }
      case 'create': {
        const { data } = params as { data: any }
        const entitySchema = (schemas as any)[entity];
        const validatedData = validateData(data, entitySchema);
        const mappedData = await mapTypes(validatedData)
        
        // Sync sequence before creating to avoid Unique Constraint errors if data was manually inserted
        if (['Users', 'Group', 'Expense', 'BudgetCategory', 'Income'].includes(entity)) {
            await syncSequence(entity === 'Group' ? 'Group' : entity)
        }

        const newItem = await prismaEntity.create({ 
            data: mappedData
        })
        return res.status(200).json(enrichResult(newItem))
      }
      case 'update': {
        const { id, data } = params as { id: string, data: any }
        const mappedData = await mapTypes(data)
        
        let updatedItem;
        if (entity === 'Income') {
          await prismaEntity.updateMany({
            where: { id: BigInt(id) },
            data: mappedData
          })
          updatedItem = await prismaEntity.findFirst({ where: { id: BigInt(id) } })
        } else {
          const options = {
            where: { id: BigInt(id) },
            data: mappedData
          }
          updatedItem = await prismaEntity.update(options)
        }
        return res.status(200).json(enrichResult(updatedItem))
      }
      case 'delete': {
        const { id } = params as { id: string }
        if (entity === 'Income') {
          await prismaEntity.deleteMany({
            where: { id: BigInt(id) }
          })
        } else {
          await prismaEntity.delete({
            where: { id: BigInt(id) }
          })
        }
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: `Invalid operation: ${operation}` })
    }
  } catch (error: any) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
