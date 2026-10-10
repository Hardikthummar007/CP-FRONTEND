import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    role: 'user',
    coutry: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Call backend signup API
      const res = await fetch('http://localhost:8085/userService/singUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: form.username,
          password: form.password,
          role: form.role,
          coutry: form.coutry
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Signup failed: ${res.status}`)
      }

      console.log('Signup successful, waiting before login...')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Auto-login using username and password
      await login({ 
        username: form.username, 
        password: form.password, 
        role: form.role 
      })

      console.log('Auto-login successful, token saved')

      const isAdminStored = localStorage.getItem('isAdmin') === 'true'
      if (isAdminStored) {
        console.log('Admin user detected after signup, redirecting to admin panel')
        navigate('/admin')
      } else {
        navigate('/problems')
      }

    } catch (err) {
      console.error('Signup/Login error:', err)
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        setError('Account created! Please login manually.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError(err?.message || 'Signup failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <h2>Signup</h2>
      <form onSubmit={submit}>
        {/* Username */}
        <div className="label">Username</div>
        <input
          className="input"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          required
        />

        {/* Password */}
        <div className="label" style={{ marginTop: 10 }}>Password</div>
        <input
          type="password"
          className="input"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />

        {/* Country */}
        <div className="label" style={{ marginTop: 10 }}>Country</div>
        <input
          className="input"
          value={form.coutry}
          onChange={e => setForm({ ...form, coutry: e.target.value })}
          placeholder="e.g. surat"
          required
        />

        {/* Role */}
        <div className="label" style={{ marginTop: 10 }}>Role</div>
        <select
          className="input"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        {/* Error message */}
        {error && <div style={{ color: '#f87171', marginTop: 8 }}>{error}</div>}

        {/* Submit button */}
        <div style={{ marginTop: 12 }}>
          <button className="button" disabled={loading}>
            {loading ? 'Loading...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  )
}