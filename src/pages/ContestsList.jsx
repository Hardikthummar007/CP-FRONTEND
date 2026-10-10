import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllContests, pushTopersOnDashboard } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ContestLeaderboardModal from '../components/ContestLeaderboardModal'

export default function ContestsList() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLeaderboardContest, setSelectedLeaderboardContest] = useState(null)
  const [pushStatusMap, setPushStatusMap] = useState({}) // { [contestName]: 'loading' | 'success' | 'error' }

  const navigate = useNavigate()
  const { isAdminUser } = useAuth()
  const isAdmin = isAdminUser || localStorage.getItem('isAdmin') === 'true'

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await getAllContests()
        console.log('Contests:', data)
        setContests(data || [])
      } catch (err) {
        console.error('Error fetching contests:', err)
        setError('Failed to load contests')
      } finally {
        setLoading(false)
      }
    }
    fetchContests()
  }, [])

  // Background WebSocket listener so contests page stays live with /topic/getWinner
  useEffect(() => {
    let client = null
    let active = true

    if (typeof window.SockJS !== 'undefined' && typeof window.Stomp !== 'undefined') {
      try {
        const socket = new window.SockJS('/ws')
        client = window.Stomp.over(socket)
        client.debug = () => {}
        client.connect({}, () => {
          if (!active) return
          client.subscribe('/topic/getWinner', (response) => {
            try {
              const list = JSON.parse(response.body)
              const validList = Array.isArray(list) ? list : (list?.body && Array.isArray(list.body) ? list.body : [])
              localStorage.setItem('winners', JSON.stringify(validList))
              if (validList[0]?.contestId) {
                localStorage.setItem(`winners_${validList[0].contestId}`, JSON.stringify(validList))
              }
            } catch (e) {}
          })
        }, () => {})
      } catch (err) {}
    }

    return () => {
      active = false
      if (client && client.connected) {
        try { client.disconnect() } catch (e) {}
      }
    }
  }, [])

  const handleContestClick = (contestName) => {
    navigate(`/contest/${encodeURIComponent(contestName)}`)
  }

  const handlePushTopers = async (e, contest) => {
    e.stopPropagation()
    const contestName = contest.contestName
    const contestDate = contest.startingDate || new Date().toISOString().slice(0, 10)

    setPushStatusMap((prev) => ({ ...prev, [contestName]: 'loading' }))
    try {
      await pushTopersOnDashboard(contestName, contestDate)
      setPushStatusMap((prev) => ({ ...prev, [contestName]: 'success' }))
      setTimeout(() => {
        setPushStatusMap((prev) => ({ ...prev, [contestName]: undefined }))
      }, 3500)
    } catch (err) {
      console.error('Error pushing topers on dashboard:', err)
      setPushStatusMap((prev) => ({ ...prev, [contestName]: 'error' }))
      setTimeout(() => {
        setPushStatusMap((prev) => ({ ...prev, [contestName]: undefined }))
      }, 3500)
    }
  }

  const handleOpenLeaderboard = (e, contest) => {
    e.stopPropagation()
    setSelectedLeaderboardContest(contest)
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 20 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Contests</h1>
          <p style={{ color: '#9ca3af', marginTop: 8 }}>
            Participate in coding contests, view live rankings, and track top performers
          </p>
        </div>

        {isAdmin && (
          <div style={{
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12,
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>👑</span>
            <span>Admin Mode: You can push live leaderboard results</span>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          Loading contests...
        </div>
      )}

      {error && (
        <div style={{ color: '#f87171', padding: 16, background: '#1f2937', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {!loading && !error && contests.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          No contests available
        </div>
      )}

      {!loading && !error && contests.length > 0 && (
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--muted)',
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr 1fr 80px 240px',
            gap: 16,
            padding: '12px 20px',
            background: '#0b1220',
            borderBottom: '1px solid var(--muted)',
            fontSize: 12,
            fontWeight: 600,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <div>Contest Name</div>
            <div>Date</div>
            <div>Start Time</div>
            <div>End Time</div>
            <div style={{ textAlign: 'center' }}>Problems</div>
            <div style={{ textAlign: 'right' }}>Leaderboard & Actions</div>
          </div>

          {/* Contest Rows */}
          {contests.map((contest, idx) => {
            const pushState = pushStatusMap[contest.contestName]

            return (
              <div
                key={contest.contestName || idx}
                onClick={() => handleContestClick(contest.contestName)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.8fr 1fr 1fr 1fr 80px 240px',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: idx < contests.length - 1 ? '1px solid var(--muted)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: 'transparent',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1f2937')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Contest Name */}
                <div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#e5e7eb',
                    marginBottom: 4
                  }}>
                    {contest.contestName}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {contest.userid?.length || 0} participants
                  </div>
                </div>

                {/* Date */}
                <div style={{ fontSize: 14, color: '#e5e7eb' }}>
                  {contest.startingDate}
                </div>

                {/* Start Time */}
                <div style={{ fontSize: 14, color: '#10b981', fontWeight: 500 }}>
                  {contest.startingTime}
                </div>

                {/* End Time */}
                <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 500 }}>
                  {contest.endingTime}
                </div>

                {/* Problems Count */}
                <div style={{
                  fontSize: 14,
                  color: '#60a5fa',
                  textAlign: 'center',
                  fontWeight: 600
                }}>
                  {contest.problemId?.length || 0}
                </div>

                {/* Leaderboard & Actions (Right beside problems count) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8
                }}>
                  {/* View Leaderboard Button */}
                  <button
                    onClick={(e) => handleOpenLeaderboard(e, contest)}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.15s'
                    }}
                    title="View contest leaderboard"
                  >
                    <span>🏆</span>
                    <span>Leaderboard</span>
                  </button>

                  {/* Admin Push Button (topersOnDashBoard) */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handlePushTopers(e, contest)}
                      disabled={pushState === 'loading'}
                      style={{
                        background: pushState === 'success' ? '#065f46' : (pushState === 'error' ? '#991b1b' : '#2563eb'),
                        border: 'none',
                        color: '#fff',
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: pushState === 'loading' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s'
                      }}
                      title="Push topers to dashboard via WebSocket (/topersOnDashBoard)"
                    >
                      <span>📢</span>
                      <span>
                        {pushState === 'loading'
                          ? 'Pushing...'
                          : pushState === 'success'
                          ? 'Pushed! ✅'
                          : pushState === 'error'
                          ? 'Failed ❌'
                          : 'topersOnDashBoard'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Leaderboard Modal */}
      {selectedLeaderboardContest && (
        <ContestLeaderboardModal
          contest={selectedLeaderboardContest}
          onClose={() => setSelectedLeaderboardContest(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  )
}
