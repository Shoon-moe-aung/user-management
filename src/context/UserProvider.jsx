import { useContext, useState } from 'react'
import { UserContext } from './UserContext'

export function UserProvider({ children }) {
  const initialUser = JSON.parse(localStorage.getItem('session')) ?? {
    isLoggedIn: false,
    name: '',
    email: '',
  }
  const API_URL = import.meta.env.VITE_API_URL
  const [user, setUser] = useState(initialUser)

  const login = async (email, password) => {
    try {
      const result = await fetch(`${API_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        credentials: 'include',
      })

      if (result.status !== 200) {
        console.log('Login Exception: ', result)
        return false
      }

      const newUser = { isLoggedIn: true, name: '', email: email }
      setUser(newUser)
      localStorage.setItem('session', JSON.stringify(newUser))
      return true
    } catch (error) {
      console.log('Login Exception: ', error)
      return false
    }
  }

  const logout = async () => {
    await fetch(`${API_URL}/api/user/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    const newUser = { isLoggedIn: false, name: '', email: '' }
    setUser(newUser)
    localStorage.setItem('session', JSON.stringify(newUser))
  }

  const signup = async ({ username, email, password, firstname, lastname }) => {
    try {
      const result = await fetch(`${API_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          firstname,
          lastname,
        }),
      })

      const payload = await result.json().catch(() => null)

      if (!result.ok) {
        return {
          ok: false,
          message: payload?.message || 'Failed to create account.',
        }
      }

      return { ok: true, message: 'Account created.' }
    } catch (error) {
      console.log('Signup Exception: ', error)
      return { ok: false, message: 'Cannot connect to server.' }
    }
  }

  return (
    <UserContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
