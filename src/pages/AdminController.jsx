import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminController() {
  return (
    <div className="grid">
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <h2>Welcome to the Admin Panel</h2>
        <p className="small">
          Manage problems and contests for the CP Platform.
        </p>
      </div>

      <div className="card" style={{ gridColumn: 'span 6' }}>
        <h3>Add Problem</h3>
        <p className="small">
          Create and manage coding problems that users can solve.
        </p>
        <Link
          className="button"
          to="/admin"
          style={{ marginTop: 12 }}
        >
          Go to Add Problem Page
        </Link>
      </div>

      <div className="card" style={{ gridColumn: 'span 6' }}>
        <h3>Add Contest</h3>
        <p className="small">
          Create new contests and manage existing ones for the platform.
        </p>
        <Link
          className="button"
          to="/adminContest"
          style={{ marginTop: 12 }}
        >
          Go to Add Contest Page
        </Link>
      </div>
    </div>
  )
}