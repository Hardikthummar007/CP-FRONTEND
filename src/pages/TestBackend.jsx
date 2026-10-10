import React, { useState } from 'react'
import axios from 'axios'

export default function TestBackend() {
  const [results, setResults] = useState([])
  
  const testAuth = async () => {
    try {
      const res = await axios.get('http://localhost:8087/auth/health')
      setResults(prev => [...prev, `✅ Auth service reachable: ${JSON.stringify(res.data)}`])
    } catch (err) {
      setResults(prev => [...prev, `❌ Auth service error: ${err.message}`])
    }
  }

  const testProblem = async () => {
    try {
      const res = await axios.get('http://localhost:8085/problemService/getAllProblem')
      setResults(prev => [...prev, `✅ Problem service reachable, found ${res.data?.length || 0} problems`])
    } catch (err) {
      setResults(prev => [...prev, `❌ Problem service error: ${err.message}`])
    }
  }

  const testSignup = async () => {
    try {
      const res = await axios.post('http://localhost:8087/auth/signUp', {
        username: 'testuser' + Date.now(),
        password: 'test123',
        role: 'admin'
      })
      setResults(prev => [...prev, `✅ Signup success: ${JSON.stringify(res.data)}`])
    } catch (err) {
      setResults(prev => [...prev, `❌ Signup error: ${err.response?.data?.message || err.message}`])
    }
  }

  const testLogin = async () => {
    try {
      // Now using POST
      const res = await axios.post('http://localhost:8087/auth/login', {
        username: 'vivek',
        password: '1234',
        role: 'admin'
      })
      setResults(prev => [...prev, `✅ Login success: ${JSON.stringify(res.data)}`])
    } catch (err) {
      setResults(prev => [...prev, `❌ Login error: ${err.response?.data?.message || err.message}`])
    }
  }

  return (
    <div className="card">
      <h2>Backend Connection Test</h2>
      <div className="row" style={{gap:10, marginBottom:20}}>
        <button className="button secondary" onClick={testAuth}>Test Auth Service</button>
        <button className="button secondary" onClick={testProblem}>Test Problem Service</button>
        <button className="button" onClick={testSignup}>Test Signup</button>
        <button className="button" onClick={testLogin}>Test Login</button>
        <button className="button secondary" onClick={()=>setResults([])}>Clear</button>
      </div>
      <div style={{background:'#0b1220', padding:12, borderRadius:8, fontFamily:'monospace', fontSize:12}}>
        {results.length === 0 && <div className="small">Click buttons above to test backend connectivity</div>}
        {results.map((r, i) => <div key={i} style={{marginBottom:4}}>{r}</div>)}
      </div>
      <div style={{marginTop:12, fontSize:12, color:'#9ca3af'}}>
        <div>Expected endpoints:</div>
        <div>• Auth: http://localhost:8087/auth</div>
        <div>• Services: http://localhost:8085</div>
      </div>
    </div>
  )
}
