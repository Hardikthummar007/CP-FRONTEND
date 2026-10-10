import React, { useState } from 'react'
import { addContest } from '../api/client'

export default function AdminContest() {
  const [contestForm, setContestForm] = useState({
    contestName: '',
    startingDate: '',
    startingTime: '',
    endingTime: '',
    problemId: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleContestSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        contestName: contestForm.contestName.trim(),
        startingDate: contestForm.startingDate,
        startingTime: contestForm.startingTime,
        endingTime: contestForm.endingTime,
        problemId: contestForm.problemId
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => !isNaN(id))
      }

      console.log('Submitting contest payload:', payload)
      const response = await addContest(payload)

      setMessage(response || 'Contest created successfully!')

      if (response?.toLowerCase().includes('contest added')) {
        setContestForm({
          contestName: '',
          startingDate: '',
          startingTime: '',
          endingTime: '',
          problemId: ''
        })
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data || err.message || 'Failed to create contest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Create New Contest</h1>
      <form onSubmit={handleContestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label>Contest Name:</label>
          <input
            type="text"
            value={contestForm.contestName}
            onChange={e => setContestForm({ ...contestForm, contestName: e.target.value })}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label>Starting Date:</label>
            <input
              type="date"
              value={contestForm.startingDate}
              onChange={e => setContestForm({ ...contestForm, startingDate: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Starting Time:</label>
            <input
              type="time"
              value={contestForm.startingTime}
              onChange={e => setContestForm({ ...contestForm, startingTime: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Ending Time:</label>
            <input
              type="time"
              value={contestForm.endingTime}
              onChange={e => setContestForm({ ...contestForm, endingTime: e.target.value })}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label>Problem IDs (comma separated):</label>
          <input
            type="text"
            placeholder="e.g., 343,331"
            value={contestForm.problemId}
            onChange={e => setContestForm({ ...contestForm, problemId: e.target.value })}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#999' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 20px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Contest'}
        </button>

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}