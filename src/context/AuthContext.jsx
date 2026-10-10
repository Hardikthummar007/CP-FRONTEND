import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Direct to Auth Service (bypasses gateway for login/signup)
const AUTH_BASE = 'http://localhost:8087/auth'

export function AuthProvider({ children }){
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => localStorage.getItem('username') || '')
  const [isAdminUser, setIsAdminUser] = useState(() => localStorage.getItem('isAdmin') === 'true')

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('username', user)
    else localStorage.removeItem('username')
  }, [user])

  useEffect(() => {
    if (isAdminUser) localStorage.setItem('isAdmin', 'true')
    else localStorage.removeItem('isAdmin')
  }, [isAdminUser])

  const login = async ({ username, password, role }) => {
    // Backend now uses POST for login
    try {
      console.log('Login request:', { username, password: '***', role })
      const res = await axios.post(`${AUTH_BASE}/login`, { username, password, role })
      console.log('Full login response:', res.data)
      
      // Handle different possible response formats
      const t = res.data?.token || res.data?.data?.token || res.data
      console.log('Extracted token:', t)
      
      if (t && typeof t === 'string') {
        // Immediately save to localStorage (don't wait for state update)
        localStorage.setItem('token', t)
        localStorage.setItem('username', username)
        setToken(t)
        setUser(username)
        console.log('Token set successfully:', t.substring(0, 20) + '...')
        
        // After successful login, check if user is admin (non-blocking)
        let isAdminRole = false
        try {
          console.log('Checking admin status for:', username)
          const adminRes = await axios.get(`http://localhost:8085/userService/isHeSheAdmin`, {
            params: { userName: username }
          })
          console.log('Admin check response:', adminRes.data)
          isAdminRole = adminRes.data === true || adminRes.data === 'true' || adminRes.data === 'True'
          localStorage.setItem('isAdmin', isAdminRole ? 'true' : 'false')
          setIsAdminUser(isAdminRole)
          console.log('Is admin:', isAdminRole)
        } catch (adminErr) {
          console.warn('Admin check failed, assuming not admin:', adminErr.message)
          localStorage.setItem('isAdmin', 'false')
          setIsAdminUser(false)
        }
        
        return { ...res.data, isAdmin: isAdminRole }
      } else {
        console.warn('No valid token found in response!', res.data)
        throw new Error('No token received from server')
      }
    } catch (err) {
      console.error('Login error:', err)
      const message = err?.response?.data?.message || err?.message || 'Login failed. Check if backend is running on port 8087'
      const error = new Error(message)
      error.response = { data: { message } }
      throw error
    }
  }

  const signup = async ({ username, password, country, role }) => {
    try {
      const res = await axios.post('http://localhost:8087/auth/signUp', {
        username,
        password,
        country,
        role
      })
      console.log('Signup response:', res.data)
      return res.data
    } catch (err) {
      console.error('Signup error:', err)
      const message = err?.response?.data?.message || err?.message || 'Signup failed. Check if backend is running on port 8087'
      const error = new Error(message)
      error.response = { data: { message } }
      throw error
    }
  }

  const logout = () => {
    setToken('')
    setUser('')
    setIsAdminUser(false)
  }

  const value = useMemo(() => ({ token, user, isAdminUser, login, signup, logout }), [token, user, isAdminUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
