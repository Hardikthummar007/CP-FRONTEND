import React, { useEffect, useState, useRef } from 'react'
import { getContestLeaderboard, pushTopersOnDashboard, LEADERBOARD_BASE } from '../api/client'

export default function ContestLeaderboardModal({ contest, onClose, isAdmin }) {
  const [winners, setWinners] = useState([])
  const [wsStatus, setWsStatus] = useState('connecting') // 'connected' | 'connecting' | 'disconnected'
  const [pushing, setPushing] = useState(false)
  const [pushSuccess, setPushSuccess] = useState('')
  const [livePulse, setLivePulse] = useState(false)
  const [manualSyncing, setManualSyncing] = useState(false)
  const [error, setError] = useState('')

  const stompClientRef = useRef(null)
  const contestId = contest?.contestName || contest?.id || 'contest'
  const contestDate = contest?.startingDate || new Date().toISOString().slice(0, 10)

  // 1. Load cached winners immediately, then automatically sync with server
  useEffect(() => {
    // Immediate display from cache
    try {
      const stored = localStorage.getItem(`winners_${contestId}`) || localStorage.getItem('winners')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWinners(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed parsing cached winners from storage:', e)
    }

    // Auto-sync latest from server so user never sees stale data
    const syncLatest = async () => {
      try {
        const data = await getContestLeaderboard(contestId, contestDate)
        if (Array.isArray(data)) {
          setWinners(data)
          localStorage.setItem(`winners_${contestId}`, JSON.stringify(data))
          localStorage.setItem('winners', JSON.stringify(data))
        }
      } catch (err) {
        console.warn('Auto-sync notice:', err)
      }
    }

    syncLatest()
  }, [contestId, contestDate])

  // 2. Active WebSocket & STOMP subscription on /topic/getWinner
  useEffect(() => {
    let client = null
    let active = true

    const initWebSocket = () => {
      if (typeof window.SockJS === 'undefined' || typeof window.Stomp === 'undefined') {
        console.warn('SockJS or Stomp not yet loaded in window')
        setWsStatus('disconnected')
        return
      }

      try {
        setWsStatus('connecting')
        const wsEndpoint = LEADERBOARD_BASE ? `${LEADERBOARD_BASE}/ws` : '/ws'
        const socket = new window.SockJS(wsEndpoint)
        client = window.Stomp.over(socket)
        // Disable noisy debug logs in console
        client.debug = () => {}

        client.connect(
          {},
          (frame) => {
            if (!active) return
            console.log('STOMP Connected:', frame)
            setWsStatus('connected')

            // Subscribe to /topic/getWinner
            client.subscribe('/topic/getWinner', (response) => {
              try {
                const list = JSON.parse(response.body)
                console.log('Received live leaderboard push over WebSocket:', list)
                const validList = Array.isArray(list) ? list : (list?.body && Array.isArray(list.body) ? list.body : [])
                
                // Real-time update state
                setWinners(validList)
                localStorage.setItem(`winners_${contestId}`, JSON.stringify(validList))
                localStorage.setItem('winners', JSON.stringify(validList))

                // Trigger live visual pulse
                setLivePulse(true)
                setTimeout(() => setLivePulse(false), 3000)
              } catch (parseErr) {
                console.error('Failed to parse winner response:', parseErr)
              }
            })
          },
          (err) => {
            if (!active) return
            console.warn('STOMP connection failed:', err)
            setWsStatus('disconnected')
          }
        )
        stompClientRef.current = client
      } catch (e) {
        console.error('WebSocket init error:', e)
        setWsStatus('disconnected')
      }
    }

    initWebSocket()

    return () => {
      active = false
      if (stompClientRef.current && stompClientRef.current.connected) {
        try {
          stompClientRef.current.disconnect(() => {
            console.log('STOMP disconnected cleanly')
          })
        } catch (e) {}
      }
    }
  }, [contestId])

  // Manual fallback sync (only if user explicitly clicks button)
  const handleManualSync = async () => {
    setManualSyncing(true)
    setError('')
    try {
      const data = await getContestLeaderboard(contestId, contestDate)
      if (Array.isArray(data)) {
        setWinners(data)
        localStorage.setItem(`winners_${contestId}`, JSON.stringify(data))
      }
    } catch (err) {
      setError('Could not fetch via REST. Please verify backend is running.')
    } finally {
      setManualSyncing(false)
    }
  }

  // 3. Admin push action: triggers /topersOnDashBoard
  const handlePushLeaderboard = async () => {
    setPushing(true)
    setPushSuccess('')
    setError('')
    try {
      await pushTopersOnDashboard(contestId, contestDate)
      setPushSuccess('Broadcasted! Live WebSocket update sent to all participants.')
      setTimeout(() => setPushSuccess(''), 4000)
    } catch (err) {
      console.error('Error pushing leaderboard:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to push leaderboard')
    } finally {
      setPushing(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20
    }} onClick={onClose}>
      <div style={{
        background: '#161922',
        border: '1px solid #2d3748',
        borderRadius: 16,
        width: '100%',
        maxWidth: 850,
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#11141c'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🏆</span>
              <h2 style={{ margin: 0, fontSize: 20, color: '#f3f4f6', fontWeight: 700 }}>
                {contest?.contestName || 'Contest'} Leaderboard
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                background: wsStatus === 'connected' ? '#064e3b' : (wsStatus === 'connecting' ? '#78350f' : '#7f1d1d'),
                color: wsStatus === 'connected' ? '#34d399' : (wsStatus === 'connecting' ? '#fbbf24' : '#f87171')
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: wsStatus === 'connected' ? '#10b981' : (wsStatus === 'connecting' ? '#f59e0b' : '#ef4444')
                }} />
                {wsStatus === 'connected' ? 'Live WebSocket Connected' : (wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected')}
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              Contest Date: <strong>{contestDate}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Optional Manual Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={manualSyncing}
              title="Manual refresh from database"
              style={{
                background: '#1e2433',
                border: '1px solid #374151',
                color: '#9ca3af',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>🔄</span>
              <span>{manualSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                background: '#222734',
                border: '1px solid #374151',
                color: '#9ca3af',
                borderRadius: 8,
                width: 34,
                height: 34,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                transition: 'all 0.2s'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Flash Banner when WebSocket receives updates */}
        {livePulse && (
          <div style={{
            padding: '8px 24px',
            background: 'linear-gradient(90deg, #10b981, #059669)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <span>⚡</span>
            <span>Real-time WebSocket update received! Leaderboard updated live.</span>
          </div>
        )}

        {/* Admin Action Bar (if Admin) */}
        {isAdmin && (
          <div style={{
            padding: '12px 24px',
            background: '#1e2433',
            borderBottom: '1px solid #2d3748',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ fontSize: 13, color: '#d1d5db' }}>
              <strong style={{ color: '#60a5fa' }}>👑 Admin Controls:</strong> Broadcast latest ranks to all connected clients.
            </div>
            <button
              onClick={handlePushLeaderboard}
              disabled={pushing}
              style={{
                background: pushing ? '#374151' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: pushing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <span>📢</span>
              {pushing ? 'Broadcasting...' : 'topersOnDashBoard'}
            </button>
          </div>
        )}

        {pushSuccess && (
          <div style={{ padding: '10px 24px', background: '#064e3b', color: '#6ee7b7', fontSize: 13 }}>
            ✅ {pushSuccess}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 24px', background: '#7f1d1d', color: '#fca5a5', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        {/* Table Content */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {winners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontWeight: 600, color: '#e5e7eb', marginBottom: 4 }}>Awaiting WebSocket results</div>
              <div style={{ fontSize: 13 }}>
                Connected to <code style={{ color: '#60a5fa' }}>/topic/getWinner</code>. When a participant finishes or admin pushes, rankings will appear here live without refreshing.
              </div>
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#1a1f2c',
              borderRadius: 10,
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ background: '#11141c', borderBottom: '1px solid #2d3748' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, color: '#9ca3af', fontWeight: 600, width: 90 }}>RANK</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>USER ID</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>TEST CASES / SOLVED</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>ENDING TIME</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner, idx) => {
                  const rank = idx + 1
                  const rankBadge =
                    rank === 1 ? { icon: '🥇', bg: '#f59e0b20', color: '#fbbf24', text: '#1' } :
                    rank === 2 ? { icon: '🥈', bg: '#94a3b820', color: '#cbd5e1', text: '#2' } :
                    rank === 3 ? { icon: '🥉', bg: '#b4530920', color: '#d97706', text: '#3' } :
                    { icon: null, bg: 'transparent', color: '#9ca3af', text: `#${rank}` }

                  return (
                    <tr
                      key={winner.userId || idx}
                      style={{
                        borderBottom: idx < winners.length - 1 ? '1px solid #252d3d' : 'none',
                        background: idx % 2 === 0 ? 'transparent' : '#141824',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#232b3d')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#141824')}
                    >
                      {/* Rank */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: rankBadge.bg,
                          color: rankBadge.color,
                          fontWeight: 700,
                          fontSize: 13
                        }}>
                          {rankBadge.icon && <span>{rankBadge.icon}</span>}
                          {rankBadge.text}
                        </span>
                      </td>

                      {/* User ID */}
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, color: '#60a5fa', fontSize: 14 }}>
                          {winner.userId || winner.username || 'Anonymous'}
                        </span>
                      </td>

                      {/* Test Cases Passed */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 6,
                          background: '#064e3b30',
                          border: '1px solid #064e3b',
                          color: '#34d399',
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          {winner.howManyTestCasePassed ?? winner.problemsSolved ?? winner.totalTestCases ?? 0}
                        </span>
                      </td>

                      {/* Ending Time */}
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#c084fc', fontFamily: 'monospace', fontSize: 13, fontWeight: 500 }}>
                        {winner.endingTime || 'N/A'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
