import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div className="grid">
      <div className="card" style={{gridColumn:'span 12'}}>
        <h2>Welcome to the CP Platform</h2>
        <p className="small">Practice coding problems and participate in contests to improve your skills.</p>
      </div>

      <div className="card" style={{gridColumn:'span 6'}}>
        <h3>Problems</h3>
        <p className="small">Browse all coding problems in a LeetCode-style list.</p>
        <Link className="button" to="/problems" style={{marginTop: 12}}>Go to Problems</Link>
      </div>

      <div className="card" style={{gridColumn:'span 6'}}>
        <h3>Contests</h3>
        <p className="small">View all available contests and participate to test your skills.</p>
        <Link className="button" to="/contests" style={{marginTop: 12}}>View Contests</Link>
      </div>
    </div>
  )
}
