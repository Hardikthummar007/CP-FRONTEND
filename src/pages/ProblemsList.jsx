import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllProblems } from '../api/client'

export default function ProblemsList() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [search, setSearch] = useState(initialSearch)
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Latest')
  const [hoveredRow, setHoveredRow] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    getAllProblems()
      .then(data => {
        if (mounted) {
          setProblems((data || []).map(pb => ({
            problem_id: pb.problem_id ?? pb.id ?? pb._id,
            title: pb.title || pb.tittle || pb.name || `Problem ${pb.problem_id ?? pb.id ?? pb._id}`,
            topics: pb.topics || [],
            difficulty: Number(pb.difficulty) || 1
          })))
        }
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load problems'))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  // Filter & sort logic
  const filteredProblems = useMemo(() => {
    let list = [...problems]

    // Search query by title, ID, or topic tags
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(pb => {
        const titleMatch = (pb.title || '').toLowerCase().includes(q)
        const idMatch = String(pb.problem_id).includes(q)
        const topicMatch = pb.topics?.some(t => {
          const name = typeof t === 'string' ? t : (t.topic || t.name || '')
          return name.toLowerCase().includes(q)
        })
        return titleMatch || idMatch || topicMatch
      })
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      const diffVal = difficultyFilter === 'Easy' ? 1 : (difficultyFilter === 'Hard' ? 3 : 2)
      list = list.filter(pb => pb.difficulty === diffVal)
    }

    // Sort order
    if (sortBy === 'ID') {
      list.sort((a, b) => Number(a.problem_id) - Number(b.problem_id))
    } else if (sortBy === 'Title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    } else if (sortBy === 'Difficulty') {
      list.sort((a, b) => a.difficulty - b.difficulty)
    }

    return list
  }, [problems, search, difficultyFilter, sortBy])

  // Difficulty badge & 3-segment bars renderer matching Image 1
  const renderDifficulty = (difficulty) => {
    const isEasy = difficulty === 1
    const isHard = difficulty === 3
    const label = isEasy ? 'Easy' : (isHard ? 'Hard' : 'Medium')

    const color = isEasy ? '#34D399' : (isHard ? '#FB7185' : '#38BDF8')
    const bg = isEasy ? 'rgba(52, 211, 153, 0.12)' : (isHard ? 'rgba(251, 113, 133, 0.12)' : 'rgba(56, 189, 248, 0.12)')
    const border = isEasy ? 'rgba(52, 211, 153, 0.35)' : (isHard ? 'rgba(251, 113, 133, 0.35)' : 'rgba(56, 189, 248, 0.35)')

    const filledCount = isEasy ? 1 : (isHard ? 3 : 2)

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Difficulty Pill Badge */}
        <span style={{
          display: 'inline-block',
          width: 68,
          textAlign: 'center',
          padding: '3px 0',
          borderRadius: 20,
          background: bg,
          border: `1px solid ${border}`,
          color: color,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.2px'
        }}>
          {label}
        </span>

        {/* 3-Segment Horizontal Indicator Bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[1, 2, 3].map(segment => {
            const isFilled = segment <= filledCount
            return (
              <div
                key={segment}
                style={{
                  width: 14,
                  height: 5,
                  borderRadius: 3,
                  background: isFilled ? color : '#1C2633',
                  transition: 'background-color 0.2s ease'
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#080B10',
      backgroundImage: `
        radial-gradient(ellipse 75% 55% at 88% -5%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
        linear-gradient(180deg, rgba(8, 11, 16, 0.35) 0%, rgba(8, 11, 16, 0.88) 35%, #080B10 70%),
        linear-gradient(90deg, #080B10 30%, rgba(8, 11, 16, 0.82) 65%, rgba(8, 11, 16, 0.25) 100%),
        url('/images/nyc-night.jpg')
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'right top',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '32px 32px 64px 32px',
        boxSizing: 'border-box'
      }}>
        {/* Page Title & Subtitle with Cyan Accent Line */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            margin: 0,
            color: '#E8EDF5',
            letterSpacing: '-0.5px'
          }}>
            Problems
          </h1>
          <p style={{
            fontSize: 14,
            color: '#9AA8B8',
            margin: '6px 0 0 0'
          }}>
            <strong style={{ color: '#E8EDF5', fontWeight: 600 }}>Practice</strong> coding problems to improve your skills
          </p>
          <div style={{
            width: 32,
            height: 2,
            background: '#38BDF8',
            marginTop: 10,
            borderRadius: 2,
            boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)'
          }} />
        </div>

        {/* Search & Filter Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap'
        }}>
          {/* Left: Search input */}
          <div style={{ position: 'relative', width: 440, maxWidth: '100%' }}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#718096"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search problems by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: 42,
                background: '#0C1118',
                border: '1px solid #26313D',
                borderRadius: 8,
                padding: '0 14px 0 42px',
                color: '#E8EDF5',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#38BDF8' }}
              onBlur={(e) => { e.target.style.borderColor = '#26313D' }}
            />
          </div>

          {/* Right: Difficulty Filter & Sorting Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Filter Dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{
                height: 42,
                background: '#0C1118',
                border: '1px solid #26313D',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                gap: 8,
                color: '#E8EDF5',
                fontSize: 13,
                fontWeight: 500
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA8B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#E8EDF5',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    paddingRight: 16,
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="All" style={{ background: '#0C1118', color: '#E8EDF5' }}>All</option>
                  <option value="Easy" style={{ background: '#0C1118', color: '#E8EDF5' }}>Easy</option>
                  <option value="Medium" style={{ background: '#0C1118', color: '#E8EDF5' }}>Medium</option>
                  <option value="Hard" style={{ background: '#0C1118', color: '#E8EDF5' }}>Hard</option>
                </select>
                <span style={{ fontSize: 9, color: '#718096', pointerEvents: 'none', marginLeft: -12 }}>▼</span>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{
                height: 42,
                background: '#0C1118',
                border: '1px solid #26313D',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                gap: 8,
                color: '#E8EDF5',
                fontSize: 13,
                fontWeight: 500
              }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#E8EDF5',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    paddingRight: 16,
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="Latest" style={{ background: '#0C1118', color: '#E8EDF5' }}>Latest</option>
                  <option value="ID" style={{ background: '#0C1118', color: '#E8EDF5' }}>ID</option>
                  <option value="Title" style={{ background: '#0C1118', color: '#E8EDF5' }}>Title</option>
                  <option value="Difficulty" style={{ background: '#0C1118', color: '#E8EDF5' }}>Difficulty</option>
                </select>
                <span style={{ fontSize: 9, color: '#718096', pointerEvents: 'none', marginLeft: -12 }}>▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div style={{
            padding: '60px 0',
            textAlign: 'center',
            color: '#9AA8B8',
            fontSize: 14,
            background: '#101720',
            border: '1px solid #26313D',
            borderRadius: 12
          }}>
            Loading problems from CP platform...
          </div>
        )}

        {error && (
          <div style={{
            padding: 16,
            background: 'rgba(251, 113, 133, 0.12)',
            border: '1px solid #FB7185',
            borderRadius: 8,
            color: '#FB7185',
            fontSize: 13,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {/* Problem Table Card matching Image 1 */}
        {!loading && !error && (
          <div style={{
            background: '#101720',
            border: '1px solid #26313D',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)'
          }}>
            {/* Table Header Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 220px 48px',
              alignItems: 'center',
              padding: '12px 24px',
              background: '#0C1118',
              borderBottom: '1px solid #26313D',
              fontSize: 11,
              fontWeight: 600,
              color: '#718096',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              <div>ID</div>
              <div>TITLE</div>
              <div>DIFFICULTY</div>
              <div></div>
            </div>

            {/* Table Body Rows */}
            {filteredProblems.length > 0 ? (
              filteredProblems.map((pb, idx) => {
                const isHovered = hoveredRow === pb.problem_id
                return (
                  <div
                    key={pb.problem_id}
                    onClick={() => navigate(`/problems/${pb.problem_id}`)}
                    onMouseEnter={() => setHoveredRow(pb.problem_id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 220px 48px',
                      alignItems: 'center',
                      padding: '16px 24px',
                      borderBottom: idx < filteredProblems.length - 1 ? '1px solid #1E2733' : 'none',
                      cursor: 'pointer',
                      background: isHovered ? '#151D27' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* ID */}
                    <div style={{
                      color: isHovered ? '#9AA8B8' : '#718096',
                      fontSize: 13.5,
                      fontWeight: 500
                    }}>
                      {pb.problem_id}
                    </div>

                    {/* Title & Topic Tags */}
                    <div style={{ paddingRight: 16 }}>
                      <div style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: isHovered ? '#38BDF8' : '#E8EDF5',
                        marginBottom: 6,
                        transition: 'color 0.15s ease'
                      }}>
                        {pb.title}
                      </div>

                      {pb.topics && pb.topics.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {pb.topics.map((t, i) => (
                            <span
                              key={i}
                              style={{
                                background: '#151D27',
                                border: '1px solid #26313D',
                                borderRadius: 6,
                                padding: '2px 9px',
                                fontSize: 11,
                                color: '#9AA8B8',
                                fontWeight: 500
                              }}
                            >
                              {typeof t === 'string' ? t : (t.topic || t.name)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Difficulty Badge & Bars */}
                    <div>
                      {renderDifficulty(pb.difficulty)}
                    </div>

                    {/* Right Arrow indicator */}
                    <div style={{
                      textAlign: 'right',
                      color: isHovered ? '#38BDF8' : '#718096',
                      fontSize: 16,
                      transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                      transition: 'all 0.15s ease'
                    }}>
                      →
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#718096',
                fontSize: 13.5
              }}>
                No problems matched your search or filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}