const STORAGE_VERSION = 'v1'
const KEY_PREFIX = `item-crud:${STORAGE_VERSION}:`

const defaultSeeds = {
  users: [
    {
      id: 'u-1001',
      name: 'Avery Thompson',
      email: 'avery.thompson@example.com',
      role: 'Admin',
      status: 'Active',
      lastActive: '2026-02-05 16:40',
    },
    {
      id: 'u-1002',
      name: 'Jordan Lee',
      email: 'jordan.lee@example.com',
      role: 'Editor',
      status: 'Active',
      lastActive: '2026-02-04 09:12',
    },
    {
      id: 'u-1003',
      name: 'Morgan Patel',
      email: 'morgan.patel@example.com',
      role: 'Viewer',
      status: 'Suspended',
      lastActive: '2026-01-28 13:07',
    },
    {
      id: 'u-1004',
      name: 'Riley Chen',
      email: 'riley.chen@example.com',
      role: 'Editor',
      status: 'Active',
      lastActive: '2026-02-02 18:22',
    },
  ],
}

const getKey = (collection) => `${KEY_PREFIX}${collection}`

const clone = (value) => JSON.parse(JSON.stringify(value))

const seedCollection = (collection) => {
  const seed = defaultSeeds[collection] ? clone(defaultSeeds[collection]) : []
  localStorage.setItem(getKey(collection), JSON.stringify(seed))
  return seed
}

const readCollection = (collection) => {
  const raw = localStorage.getItem(getKey(collection))
  if (!raw) {
    return seedCollection(collection)
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn('Failed to parse local storage data, reseeding.', error)
  }

  return seedCollection(collection)
}

const writeCollection = (collection, items) => {
  localStorage.setItem(getKey(collection), JSON.stringify(items))
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const listItems = async (collection) => {
  const items = readCollection(collection)
  return clone(items)
}

export const createItem = async (collection, payload) => {
  const items = readCollection(collection)
  const now = new Date()
  const newItem = {
    id: createId(),
    ...payload,
    createdAt: payload.createdAt ?? now.toISOString(),
    updatedAt: payload.updatedAt ?? now.toISOString(),
  }
  const next = [newItem, ...items]
  writeCollection(collection, next)
  return clone(newItem)
}

export const updateItem = async (collection, id, updates) => {
  const items = readCollection(collection)
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error(`Item not found: ${id}`)
  }

  const now = new Date()
  const updated = {
    ...items[index],
    ...updates,
    updatedAt: updates.updatedAt ?? now.toISOString(),
  }
  const next = [...items]
  next[index] = updated
  writeCollection(collection, next)
  return clone(updated)
}

export const deleteItem = async (collection, id) => {
  const items = readCollection(collection)
  const next = items.filter((item) => item.id !== id)
  if (next.length === items.length) {
    throw new Error(`Item not found: ${id}`)
  }
  writeCollection(collection, next)
  return { id }
}

export const resetCollection = async (collection) => {
  const seed = seedCollection(collection)
  return clone(seed)
}
