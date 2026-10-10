import React, { useState } from 'react'

export default function ProblemView({ problem }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  if (!problem) return null

  const testCases = problem.testCases || []
  const topics = problem.topics || []
  const exampleTestCases = testCases.slice(0, 3)

  const handleCopy = (text, idx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }

  const difficultyLabel = problem.difficulty === 1 ? 'Easy' : (problem.difficulty === 3 ? 'Hard' : 'Medium')
  const difficultyBg =
    problem.difficulty === 1 ? 'rgba(53, 214, 160, 0.15)' :
    problem.difficulty === 3 ? 'rgba(240, 100, 100, 0.15)' :
    'rgba(255, 255, 255, 0.15)'
  const difficultyColor =
    problem.difficulty === 1 ? '#35D6A0' :
    problem.difficulty === 3 ? '#F06464' :
    '#FFFFFF'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      color: '#F2EBDD',
      paddingBottom: 24
    }}>
      {/* Title & Metadata */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Playfair Display', 'Lora', 'Cormorant Garamond', Georgia, serif",
            fontSize: 25,
            fontWeight: 600,
            color: '#F2EBDD',
            letterSpacing: '0.2px',
            lineHeight: 1.3
          }}>
            {problem.problem_id ? `${problem.problem_id}. ` : ''}{problem.tittle || problem.title || problem.name || 'Problem Details'}
          </h1>
          <span style={{
            background: difficultyBg,
            color: difficultyColor,
            border: `1px solid ${difficultyColor}40`,
            padding: '3px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.3px'
          }}>
            {difficultyLabel}
          </span>
          <span style={{
            color: '#35D6A0',
            fontSize: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>✔</span> Interview classic
          </span>
        </div>

        {/* Topic Tags */}
        {topics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {topics.map((t, i) => (
              <span
                key={i}
                style={{
                  background: '#182129',
                  border: '1px solid #29323B',
                  color: '#A6B0BB',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500
                }}
              >
                {typeof t === 'string' ? t : (t.topic || t.name)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Problem Description */}
      <div style={{
        lineHeight: 1.7,
        fontSize: 14.5,
        color: '#D1D5DB',
        letterSpacing: '0.1px',
        whiteSpace: 'pre-line'
      }}>
        {problem.statement || problem.description || 'No description provided.'}
      </div>

      {/* Constraints & Limits */}
      {(problem.inputLimit || problem.outputLimit) && (
        <div style={{
          display: 'flex',
          gap: 12,
          padding: 12,
          background: '#0D141C',
          borderRadius: 8,
          border: '1px solid #202A34',
          fontSize: 13,
          color: '#A6B0BB'
        }}>
          {problem.inputLimit && (
            <div>
              <strong style={{ color: '#F2EBDD' }}>Input Limit:</strong> {problem.inputLimit}
            </div>
          )}
          {problem.outputLimit && (
            <div>
              <strong style={{ color: '#F2EBDD' }}>Output Limit:</strong> {problem.outputLimit}
            </div>
          )}
        </div>
      )}

      {/* Sample Test Cases */}
      {exampleTestCases.length > 0 && (
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            color: '#A6B0BB',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>Sample Test Cases</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {exampleTestCases.map((tc, idx) => (
              <div
                key={tc.testcase_id || idx}
                style={{
                  background: '#182129',
                  border: '1px solid #29323B',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F2EBDD' }}>
                    Example {idx + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(`Input: ${tc.tc_input}\nOutput: ${tc.tc_ouput}`, idx)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #29323B',
                      color: copiedIdx === idx ? '#35D6A0' : '#A6B0BB',
                      padding: '4px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span>{copiedIdx === idx ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Input Block */}
                <div>
                  <div style={{ fontSize: 12, color: '#8895A5', marginBottom: 4 }}>Input:</div>
                  <pre style={{
                    margin: 0,
                    padding: '8px 12px',
                    background: '#080D12',
                    border: '1px solid #202A34',
                    borderRadius: 6,
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    fontSize: 12.5,
                    color: '#F2EBDD',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {tc.tc_input}
                  </pre>
                </div>

                {/* Output Block */}
                <div>
                  <div style={{ fontSize: 12, color: '#8895A5', marginBottom: 4 }}>Output:</div>
                  <pre style={{
                    margin: 0,
                    padding: '8px 12px',
                    background: '#080D12',
                    border: '1px solid #202A34',
                    borderRadius: 6,
                    fontFamily: "'JetBrains Mono', Consolas, monospace",
                    fontSize: 12.5,
                    color: '#F2EBDD',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {tc.tc_ouput}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom NYC Silhouette & Quote Accent */}
      <div style={{
        marginTop: 12,
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #202A34',
        minHeight: 85,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '14px 18px',
        backgroundImage: 'url(/images/developer-workspace.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(8, 13, 18, 0.92) 0%, rgba(8, 13, 18, 0.8) 60%, rgba(8, 13, 18, 0.88) 100%)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 17,
            color: '#FFFFFF',
            letterSpacing: '0.8px'
          }}>
            Small steps. Big progress.
          </div>
        </div>
      </div>
    </div>
  )
}

