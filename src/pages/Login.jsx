import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/problems'

  const [form, setForm] = useState({ username: '', password: '', role: 'admin' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const response = await login(form)
      console.log('Login response:', response)
      console.log('Token in localStorage:', localStorage.getItem('token'))
      
      // Redirect based on admin status
      if (response.isAdmin) {
        console.log('Admin detected, redirecting to admin panel')
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }catch(err){
      console.error('Login error:', err)
      setError(err?.response?.data?.message || err?.message || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{maxWidth:480, margin:'40px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div className="label">Username</div>
        <input className="input" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
        <div className="label" style={{marginTop:10}}>Password</div>
        <input type="password" className="input" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        <div className="label" style={{marginTop:10}}>Role</div>
        <select className="input" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
          <option value="admin">admin</option>
          <option value="user">user</option>
        </select>
        {error && <div style={{color:'#f87171', marginTop:8}}>{error}</div>}
        <div style={{marginTop:12}}>
          <button className="button" disabled={loading}>{loading? 'Loading...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
