import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, TOKEN_KEY } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  // Restore the session on page load if a token is saved.
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        try {
          localStorage.removeItem(TOKEN_KEY)
        } catch {
          /* storage unavailable */
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSession = useCallback((data) => {
    try {
      localStorage.setItem(TOKEN_KEY, data.token)
    } catch {
      /* storage unavailable */
    }
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(
    async (email, password) => saveSession(await api('/auth/login', { method: 'POST', body: { email, password } })),
    [saveSession]
  )

  const register = useCallback(
    async (form) => saveSession(await api('/auth/register', { method: 'POST', body: form })),
    [saveSession]
  )

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* storage unavailable */
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
