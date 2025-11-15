import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext({
  isAuthenticated: false,
  userName: null,
  token: null,
  login: (jwtToken, userName) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [userName, setUserName] = useState(null)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jwtToken') || localStorage.getItem('token')
      const storedName = localStorage.getItem('loggedInUser') || null
      setToken(storedToken || null)
      setUserName(storedName)
    } catch (_) {}
  }, [])

  const login = (jwtToken, name) => {
    try {
      localStorage.setItem('token', jwtToken)
      if (name) localStorage.setItem('loggedInUser', name)
    } catch (_) {}
    setToken(jwtToken)
    setUserName(name || null)
  }

  const logout = () => {
    try {
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('token')
      localStorage.removeItem('loggedInUser')
    } catch (_) {}
    setToken(null)
    setUserName(null)
  }

  const value = useMemo(() => ({
    isAuthenticated: !!token,
    userName,
    token,
    login,
    logout,
  }), [token, userName])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
