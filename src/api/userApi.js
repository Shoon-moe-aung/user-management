const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const parseJson = async (response) => {
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const errorBody = await response.json()
      message = errorBody?.message ?? message
    } catch (error) {
      // ignore json parse errors
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user
  return {
    ...user,
    firstname:
      user.firstname ?? user.firstName ?? user.first_name ?? user.givenName,
    lastname:
      user.lastname ?? user.lastName ?? user.last_name ?? user.familyName,
    username: user.username ?? user.userName ?? user.user_name,
    email: user.email ?? user.mail,
  }
}

const normalizeUsersResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      users: payload.map(normalizeUser),
      total: payload.length,
    }
  }

  if (payload && Array.isArray(payload.users)) {
    return {
      users: payload.users.map(normalizeUser),
      total:
        payload.total ??
        payload.count ??
        payload.pagination?.total ??
        payload.meta?.total ??
        payload.users.length,
    }
  }

  if (payload && Array.isArray(payload.user)) {
    return {
      users: payload.user.map(normalizeUser),
      total:
        payload.total ??
        payload.count ??
        payload.pagination?.total ??
        payload.meta?.total ??
        payload.user.length,
    }
  }

  if (payload && payload.data && Array.isArray(payload.data.users)) {
    return {
      users: payload.data.users.map(normalizeUser),
      total:
        payload.total ??
        payload.count ??
        payload.data.total ??
        payload.pagination?.total ??
        payload.meta?.total ??
        payload.data.users.length,
    }
  }

  if (payload && Array.isArray(payload.items)) {
    return {
      users: payload.items.map(normalizeUser),
      total:
        payload.total ??
        payload.count ??
        payload.totalItems ??
        payload.pagination?.total ??
        payload.meta?.total ??
        payload.items.length,
    }
  }

  if (payload && payload.data && Array.isArray(payload.data.user)) {
    return {
      users: payload.data.user.map(normalizeUser),
      total:
        payload.total ??
        payload.count ??
        payload.data.total ??
        payload.pagination?.total ??
        payload.meta?.total ??
        payload.data.user.length,
    }
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      users: payload.data.map(normalizeUser),
      total:
        payload.total ??
        payload.count ??
        payload.pagination?.total ??
        payload.meta?.total ??
        payload.data.length,
    }
  }

  return { users: [], total: 0 }
}

export const listUsers = async ({ page = 1, limit = 5 } = {}) => {
  const response = await fetch(
    `${BASE_URL}/api/user?page=${page}&limit=${limit}`,
    { credentials: 'include' }
  )
  const payload = await parseJson(response)
  return normalizeUsersResponse(payload)
}

export const updateUser = async (id, updates) => {
  const response = await fetch(`${BASE_URL}/api/user/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  })

  return parseJson(response)
}

export const createUser = async (payload) => {
  const response = await fetch(`${BASE_URL}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  return parseJson(response)
}

export const deleteUser = async (id) => {
  const response = await fetch(`${BASE_URL}/api/user/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  return parseJson(response)
}
