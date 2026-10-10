import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getSubmissionsPerProblem } from '../api/client'

export default function SubmissionsList({ problemId, userName, setCode }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  const effectiveUserName = userName || localStorage.getItem('username') || ''

  const fetchSubmissions = async () => {
    if (!problemId) return
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const targetUser = effectiveUserName || 'user'

      // We can use the helper or direct axios call with full fallback headers
      let data
      try {
        data = await getSubmissionsPerProblem(targetUser, problemId)
      } catch (clientErr) {
        // Fallback direct request to ensure compatibility
        const headers = {}
        if (token) {
          headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
          headers.token = token.replace(/^Bearer\s+/i, '')
        }
        const res = await axios.get('http://localhost:8085/normalSubmissionService/getSubmissionPerProblem', {
          params: { userName: targetUser, problemId },
          headers
        })
        data = res.data
      }

      // Handle raw response or wrapped Spring response
      const list = Array.isArray(data) ? data : (data?.body && Array.isArray(data.body) ? data.body : [])
      setSubmissions(list)
      if (list.length > 0 && !selectedSubmission) {
        setSelectedSubmission(list[0])
      }
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [problemId, effectiveUserName])

  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub)
    if (typeof setCode === 'function' && sub?.code) {
      setCode(sub.code)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: '#A6B0BB', fontSize: 13, fontStyle: 'italic' }}>
        Loading submission history...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '16px 18px',
        background: 'rgba(240, 100, 100, 0.08)',
        border: '1px solid rgba(240, 100, 100, 0.3)',
        borderRadius: 8,
        color: '#F06464',
        fontSize: 13,
        marginTop: 8
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Error loading submissions</div>
        <div style={{ fontSize: 12, color: '#A6B0BB' }}>{error}</div>
        <button
          onClick={fetchSubmissions}
          style={{
            marginTop: 12,
            padding: '6px 14px',
            background: '#182129',
            border: '1px solid #29323B',
            color: '#F2EBDD',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!submissions.length) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        background: '#111820',
        border: '1px solid #29323B',
        borderRadius: 10,
        color: '#A6B0BB',
        fontSize: 13
      }}>
        <div style={{ color: '#FFFFFF', fontSize: 24, marginBottom: 8 }}>📜</div>
        <div style={{ fontWeight: 600, color: '#F2EBDD', marginBottom: 4 }}>No Submissions Found</div>
        <div>Submit your solution to see execution history and benchmark metrics here.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Submissions List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#A6B0BB', fontWeight: 500, letterSpacing: '0.04em' }}>
          {submissions.length} SUBMISSION{submissions.length !== 1 ? 'S' : ''} RECORDED
        </span>
        <button
          onClick={fetchSubmissions}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: 12,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>↻</span> Refresh
        </button>
      </div>

      {/* Submissions Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {submissions.map((sub) => {
          const isSelected = selectedSubmission?.id === sub.id
          const totalTC = sub.totalTestCases ?? 0
          const passedTC = sub.passedTestCases ?? 0
          const isAccepted = totalTC > 0 && passedTC === totalTC

          return (
            <div
              key={sub.id}
              onClick={() => handleSelectSubmission(sub)}
              style={{
                cursor: 'pointer',
                borderRadius: 8,
                padding: '12px 14px',
                background: isSelected ? '#182129' : '#111820',
                border: `1px solid ${isSelected ? '#FFFFFF' : '#29323B'}`,
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#0D141C',
                    color: '#FFFFFF',
                    border: '1px solid #29323B'
                  }}>
                    {sub.language || 'Code'}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isAccepted ? '#35D6A0' : (passedTC > 0 ? '#FFFFFF' : '#F06464')
                  }}>
                    {isAccepted ? '✓ Accepted' : (totalTC > 0 ? `${passedTC}/${totalTC} Passed` : 'Evaluation Completed')}
                  </span>
                </div>

                <span style={{ fontSize: 11, color: '#A6B0BB' }}>
                  {sub.submissionTime || 'Recent'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span style={{ fontSize: 12, color: '#A6B0BB' }}>
                  ID #{sub.id} {sub.username ? `• by ${sub.username}` : ''}
                </span>
                <span style={{ fontSize: 11, color: isSelected ? '#FFFFFF' : '#A6B0BB' }}>
                  {isSelected ? 'Viewing Details ▼' : 'Click to inspect ▶'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Submission Detail View */}
      {selectedSubmission && (
        <div style={{
          marginTop: 6,
          padding: 16,
          background: '#111820',
          border: '1px solid #FFFFFF',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #29323B', paddingBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EBDD' }}>
                Submission #{selectedSubmission.id} Details
              </div>
              <div style={{ fontSize: 11, color: '#A6B0BB', marginTop: 2 }}>
                Submitted on {selectedSubmission.submissionTime || 'N/A'}
              </div>
            </div>

            <button
              onClick={() => setSelectedSubmission(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#A6B0BB',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1
              }}
              title="Close details"
            >
              ✕
            </button>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ background: '#182129', padding: '10px 12px', borderRadius: 6, border: '1px solid #29323B' }}>
              <div style={{ fontSize: 10, color: '#A6B0BB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Language</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F2EBDD', marginTop: 2, textTransform: 'capitalize' }}>
                {selectedSubmission.language || 'Unknown'}
              </div>
            </div>
            <div style={{ background: '#182129', padding: '10px 12px', borderRadius: 6, border: '1px solid #29323B' }}>
              <div style={{ fontSize: 10, color: '#A6B0BB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Passed Cases</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#35D6A0', marginTop: 2 }}>
                {selectedSubmission.passedTestCases ?? 0}
              </div>
            </div>
            <div style={{ background: '#182129', padding: '10px 12px', borderRadius: 6, border: '1px solid #29323B' }}>
              <div style={{ fontSize: 10, color: '#A6B0BB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Cases</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginTop: 2 }}>
                {selectedSubmission.totalTestCases ?? 0}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#A6B0BB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submitted Code:</span>
              {setCode && (
                <button
                  onClick={() => setCode(selectedSubmission.code)}
                  style={{
                    padding: '4px 10px',
                    background: '#182129',
                    border: '1px solid #FFFFFF',
                    color: '#FFFFFF',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Load into Editor
                </button>
              )}
            </div>

            <pre style={{
              background: '#080D12',
              border: '1px solid #29323B',
              borderRadius: 6,
              padding: 12,
              maxHeight: 300,
              overflow: 'auto',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#F2EBDD',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {selectedSubmission.code || '// No code recorded'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
