import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [solvedProblems, setSolvedProblems] = useState([])
  const [totalProblems, setTotalProblems] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await api.get('http://localhost:8085/userService/getUserById', {
          params: { username: user }
        })
        setUserData(userRes.data)

        // Fetch solved problems
        const solvedRes = await api.get('http://localhost:8085/userService/profileLoading', {
          params: { userId: user }
        })
        setSolvedProblems(solvedRes.data || [])

        // Fetch total problems count
        const allProblemsRes = await api.get('http://localhost:8085/problemService/getAllProblem')
        setTotalProblems(allProblemsRes.data?.length || 0)
      } catch (err) {
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      1: { bg: '#10b981', text: 'Easy' },
      2: { bg: '#f59e0b', text: 'Medium' },
      3: { bg: '#ef4444', text: 'Hard' }
    }
    const style = styles[difficulty] || { bg: '#6b7280', text: 'Unknown' }
    return (
      <span style={{
        background: style.bg,
        color: '#fff',
        padding: '3px 8px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 600
      }}>
        {style.text}
      </span>
    )
  }

  const solvedPercentage = totalProblems > 0 ? Math.round((userData?.totalProblemSolved || 0) / totalProblems * 100) : 0

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading profile...</div>
  }

  if (!userData) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#f87171' }}>Failed to load profile</div>
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      {/* Header Section */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--muted)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Avatar */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: '#fff'
          }}>
            {userData.userName?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{userData.userName}</h1>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <span style={{
                background: userData.role === 'admin' ? '#7c3aed' : '#3b82f6',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600
              }}>
                {userData.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Problems Solved Card */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--muted)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Problems Solved</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e' }}>
            {userData.totalProblemSolved}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            out of {totalProblems}
          </div>
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: 8,
            background: '#1f2937',
            borderRadius: 4,
            marginTop: 12,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${solvedPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            {solvedPercentage}% completed
          </div>
        </div>

        {/* Ranking Card (placeholder) */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--muted)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Global Ranking</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#60a5fa' }}>
            #--
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Coming soon
          </div>
        </div>
      </div>

      {/* Solved Problems Section */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--muted)',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--muted)',
          background: '#0b1220'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Solved Problems</h2>
        </div>

        {solvedProblems.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            No problems solved yet. Start solving!
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px',
              gap: 16,
              padding: '12px 20px',
              background: '#0b1220',
              borderBottom: '1px solid var(--muted)',
              fontSize: 12,
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase'
            }}>
              <div>ID</div>
              <div>Title</div>
              <div>Difficulty</div>
            </div>

            {/* Problem Rows */}
            {solvedProblems.map((pb, idx) => (
              <div
                key={pb.problem_id}
                onClick={() => navigate(`/problems/${pb.problem_id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 120px',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: idx < solvedProblems.length - 1 ? '1px solid var(--muted)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 500 }}>
                  ✓ {pb.problem_id}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#e5e7eb' }}>
                  {pb.tittle || pb.title || `Problem ${pb.problem_id}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getDifficultyBadge(pb.difficulty)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
