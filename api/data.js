import prisma from './lib/prisma.js'
import { schemas } from './lib/schemas.js'

export default async function handler(req, res) {
  const params = { ...req.query, ...req.body }
  const { entity, operation } = params

  if (!entity || !prisma[entity]) {
    return res.status(400).json({ error: `Invalid entity: ${entity}` })
  }

  // Helper to serialize BigInt and Decimal
  const serialize = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (typeof value === 'bigint') return value.toString()
      return value
    }), (key, value) => {
      // Convert amount/income back to Number for calculation convenience on frontend
      if ((key === 'amount' || key === 'income') && typeof value === 'string') {
        const num = Number(value)
        if (!isNaN(num)) return num
      }
      return value
    })
  }

  const validateData = (data, schema) => {
    if (!schema) return data;
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return result.data;
  };

  const mapCriteria = (criteria) => {
    if (!criteria) return {}
    const where = {}
    for (const [key, value] of Object.entries(criteria)) {
      if (typeof value === 'object' && value !== null) {
        if (value.$in) {
          where[key] = { in: value.$in.map(v => typeof v === 'string' && /^\d+$/.test(v) ? BigInt(v) : v) }
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

  const mapTypes = async (data, entityName) => {
    if (!data) return data
    const newData = { ...data }
    const bigIntFields = ['id', 'group_id', 'category_id', 'user', 'paid_by']
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    for (const key of Object.keys(newData)) {
      if (bigIntFields.includes(key) && typeof newData[key] === 'string') {
        if (/^\d+$/.test(newData[key])) {
          newData[key] = BigInt(newData[key])
        } else if (uuidRegex.test(newData[key])) {
          // Resolve UUID to BigInt ID
          let user = await prisma.Users.findFirst({ where: { auth_id: newData[key] } })
          if (user) {
            newData[key] = user.id
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
              let user = await prisma.Users.findFirst({ where: { auth_id: id } })
              if (user) resolvedMembers.push(user.id)
              else resolvedMembers.push(id)
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

  const enrichResult = (item, entityName) => {
    if (!item) return item
    const result = serialize(item)
    return result
  }

  // Helper to fix Postgres sequence if IDs were inserted manually (avoids P2002 error)
  const syncSequence = async (tableName) => {
    try {
        // This is specifically for PostgreSQL with Prisma generated tables
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id),0) + 1, false) FROM "${tableName}";`)
    } catch (e) {
        // Ignore if sequence doesn't exist or not PostgreSQL
        console.warn(`Could not sync sequence for ${tableName}:`, e.message)
    }
  }

  try {
    switch (operation) {
      case 'list': {
        const { sort } = params
        const options = {}
        if (sort === '-created_date') {
          options.orderBy = { created_at: 'desc' }
        }
        
        const items = await prisma[entity].findMany(options)
        return res.status(200).json(items.map(i => enrichResult(i, entity)))
      }
      case 'filter': {
        const { criteria } = params
        const mappedCriteria = await mapTypes(criteria, entity)
        const where = mapCriteria(mappedCriteria)
        const options = { where }
        
        const items = await prisma[entity].findMany(options)
        return res.status(200).json(items.map(i => enrichResult(i, entity)))
      }
      case 'create': {
        const { data } = params
        const entitySchema = schemas[entity];
        const validatedData = validateData(data, entitySchema);
        const mappedData = await mapTypes(validatedData, entity)
        
        // Sync sequence before creating to avoid Unique Constraint errors if data was manually inserted
        if (entity === 'Users') await syncSequence('Users')
        if (entity === 'Group') await syncSequence('Group')
        if (entity === 'Expense') await syncSequence('Expense')
        if (entity === 'BudgetCategory') await syncSequence('BudgetCategory')
        if (entity === 'Income') await syncSequence('Income')

        const newItem = await prisma[entity].create({ 
            data: mappedData
        })
        return res.status(200).json(enrichResult(newItem, entity))
      }
      case 'update': {
        const { id, data } = params
        const mappedData = await mapTypes(data, entity)
        
        let updatedItem;
        if (entity === 'Income') {
          await prisma[entity].updateMany({
            where: { id: BigInt(id) },
            data: mappedData
          })
          updatedItem = await prisma[entity].findFirst({ where: { id: BigInt(id) } })
        } else {
          const options = {
            where: { id: BigInt(id) },
            data: mappedData
          }
          updatedItem = await prisma[entity].update(options)
        }
        return res.status(200).json(enrichResult(updatedItem, entity))
      }
      case 'delete': {
        const { id } = params
        if (entity === 'Income') {
          await prisma[entity].deleteMany({
            where: { id: BigInt(id) }
          })
        } else {
          await prisma[entity].delete({
            where: { id: BigInt(id) }
          })
        }
        return res.status(200).json({ success: true })
      }
      default:
        return res.status(400).json({ error: `Invalid operation: ${operation}` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
