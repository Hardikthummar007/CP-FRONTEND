import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { endContest, getContest, registerToContest, startContest, pushTopersOnDashboard } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ContestLeaderboardModal from '../components/ContestLeaderboardModal'

export default function ContestDetail(){
  const { id } = useParams()
  const { user, isAdminUser } = useAuth()
  const isAdmin = isAdminUser || localStorage.getItem('isAdmin') === 'true'
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getContest(id)
      .then(data => { if(mounted) setContest(data) })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load contest'))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [id])

  const onRegister = async () => {
    setMessage('')
    try{ await registerToContest({ userId: user, contestId: id }); setMessage('Registered!') } catch(e){ setMessage('Register failed') }
  }
  const onStart = async () => {
    setMessage('')
    try{ await startContest({ userId: user, contestId: id }); navigate(`/contest/${encodeURIComponent(id)}/problem/0`) } catch(e){ setMessage('Start failed') }
  }
  const onEnd = async () => {
    setMessage('')
    // Use contest's starting date, not today's date
    const contestDate = contest?.startingDate || new Date().toISOString().slice(0,10)
    try {
      await endContest({ userId: user, contestId: id, date: contestDate })
      navigate('/problems', { state: { msg: 'Contest Finished' } })
    } catch(e) {
      setMessage('End failed')
    }
  }

  return (
    <div className="card">
      <h2>Contest Details</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{color:'#f87171'}}>{error}</div>}
      {contest && (
        <>
          <div><b>Name:</b> {contest.contestName}</div>
          <div className="row" style={{gap:20, marginTop:8}}>
            <div><b>Start:</b> {contest.startingDate} {contest.startingTime}</div>
            <div><b>End:</b> {contest.endingTime}</div>
          </div>
          <div style={{marginTop:8}}><b>Problems:</b> {(contest.problemId||[]).join(', ')}</div>
          <div className="row" style={{gap:10, marginTop:12}}>
            <button className="button secondary" onClick={onRegister}>Register to Contest</button>
            <button className="button" onClick={onStart}>Start Contest</button>
            <button className="button secondary" onClick={onEnd}>End Contest</button>
            <button
              className="button"
              style={{ background: '#2563eb', border: 'none' }}
              onClick={() => setShowLeaderboard(true)}
            >
              🏆 View Leaderboard
            </button>
          </div>
          {message && <div className="small" style={{marginTop:8}}>{message}</div>}

          {showLeaderboard && (
            <ContestLeaderboardModal
              contest={contest}
              onClose={() => setShowLeaderboard(false)}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}
    </div>
  )
}