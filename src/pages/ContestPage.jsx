import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { endContest, getContest, getProblemById, submitContestProblem } from '../api/client'
import CodeEditor from '../components/CodeEditor'
import ProblemView from '../components/ProblemView'
import { useAuth } from '../context/AuthContext'

export default function ContestPage(){
  const { contestId, problemIndex } = useParams()
  const index = Number(problemIndex) || 0
  const { user } = useAuth()

  const [contest, setContest] = useState(null)
  const [problem, setProblem] = useState(null)
  const [langauge, setLangauge] = useState('java')
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getContest(contestId)
      .then(async data => {
        if (!mounted) return
        setContest(data)
        const pid = (data?.problemId||[])[index]
        if (pid !== undefined) {
          const prob = await getProblemById(pid)
          if (mounted) setProblem(prob)
        }
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [contestId, index])

  const prev = () => { if(index>0) navigate(`/contest/${encodeURIComponent(contestId)}/problem/${index-1}`) }
  const next = () => { if((contest?.problemId?.length||0) > index+1) navigate(`/contest/${encodeURIComponent(contestId)}/problem/${index+1}`) }

  const onSubmit = useCallback(async () => {
    setResult(null)
    try{
      // problemNo is the 0-based index in the contest's problem list
      const res = await submitContestProblem({ userId: user, contestId, problemNo: index, langauge, code, input })
      console.log('Contest submission response:', res)
      setResult(res)
    }catch(e){ 
      console.error('Contest submission error:', e)
      setResult({ status: 'error', error: 'Submission failed' }) 
    }
  }, [user, contestId, index, langauge, code, input])

  // Keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Windows) - works anywhere
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSubmit])

  const onEnd = async () => {
    // Use contest's starting date, not today's date
    const contestDate = contest?.startingDate || new Date().toISOString().slice(0,10)
    try{ await endContest({ userId: user, contestId, date: contestDate }); navigate('/problems', { state: { msg: 'Contest Finished' } }) } catch(e){}
  }

  return (
    <div style={{
      height: 'calc(100vh - 50px)',
      overflow: 'hidden',
      padding: 8
    }}>
      <PanelGroup direction="horizontal">
        {/* Left: Problem Description */}
        <Panel defaultSize={50} minSize={30}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--panel)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <div style={{padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0}}>
              <div className="row" style={{gap: 8}}>
                <button className="button secondary" onClick={prev} disabled={index===0} style={{padding: '6px 12px', fontSize: 13}}>← Prev</button>
                <span style={{fontSize: 13, color: '#9ca3af'}}>Problem {index + 1} of {contest?.problemId?.length || 0}</span>
                <button className="button secondary" onClick={next} disabled={(contest?.problemId?.length||0) <= index+1} style={{padding: '6px 12px', fontSize: 13}}>Next →</button>
              </div>
              <button className="button secondary" onClick={onEnd} style={{padding: '6px 12px', fontSize: 13}}>End Contest</button>
            </div>
            <div style={{flex: 1, overflow: 'auto'}}>
              {loading && <div style={{padding: 16}}>Loading...</div>}
              {problem && <ProblemView problem={problem} />}
            </div>
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle style={{
          width: 8,
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: 2,
            height: 40,
            background: 'var(--muted)',
            borderRadius: 2
          }} />
        </PanelResizeHandle>

        {/* Right: Code Editor + Results */}
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical">
            {/* Code Editor Section */}
            <Panel defaultSize={60} minSize={30}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'var(--panel)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                overflow: 'hidden'
              }}>
        {/* Top Bar */}
        <div style={{
          padding: 12,
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel)',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end',
          flexShrink: 0
        }}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 12, color: '#9ca3af', marginBottom: 4}}>Language</div>
            <select className="input" value={langauge} onChange={e=>setLangauge(e.target.value)} style={{width: '100%'}}>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div style={{flex: 2}}>
            <div style={{fontSize: 12, color: '#9ca3af', marginBottom: 4}}>Custom Input</div>
            <input className="input" placeholder="Optional test input" value={input} onChange={e=>setInput(e.target.value)} style={{width: '100%'}} />
          </div>
          <button className="button" onClick={onSubmit} style={{padding: '8px 20px'}}>Submit</button>
        </div>

                {/* Code Editor */}
                <div style={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
                  <CodeEditor value={code} onChange={setCode} onSubmit={onSubmit} language={langauge === 'cpp' ? 'cpp' : (langauge === 'python' ? 'python' : (langauge === 'javascript' ? 'javascript' : 'java'))} />
                </div>
              </div>
            </Panel>

            {/* Vertical Resize Handle */}
            <PanelResizeHandle style={{
              height: 8,
              cursor: 'row-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: 40,
                height: 2,
                background: 'var(--muted)',
                borderRadius: 2
              }} />
            </PanelResizeHandle>

            {/* Results Panel */}
            <Panel defaultSize={40} minSize={20}>
              <div style={{
                height: '100%',
                overflow: 'auto',
                background: 'var(--panel)',
                borderRadius: 8,
                border: '1px solid var(--border)'
              }}>
                <div style={{padding: 16}}>
          <h3 style={{marginTop: 0, marginBottom: 16}}>Results</h3>
          {!result && <div className="small" style={{color: '#9ca3af'}}>No submission yet. Submit your code to see results.</div>}
          {result && (
            <>
              {/* Status Banner */}
              <div style={{
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                background: result.status === 'success' ? '#10b98120' : '#ef444420',
                border: `1px solid ${result.status === 'success' ? '#10b981' : '#ef4444'}`
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <span style={{fontSize: 32}}>{result.status === 'success' ? '✅' : '❌'}</span>
                  <div>
                    <div style={{fontSize: 18, fontWeight: 600, color: result.status === 'success' ? '#10b981' : '#ef4444'}}>
                      {result.status === 'success' ? 'Accepted' : 'Failed'}
                    </div>
                    <div style={{fontSize: 14, color: '#9ca3af', marginTop: 4}}>
                      {result.totalTestCasePassed || 0} / {result.totalTestCase || 0} test cases passed
                    </div>
                  </div>
                </div>
              </div>

              {/* Complexity Info */}
              {(result['time Complexity'] || result['space Complexity']) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 16
                }}>
                  {result['time Complexity'] && (
                    <div style={{
                      padding: 12,
                      background: '#1f2937',
                      borderRadius: 8,
                      border: '1px solid var(--muted)'
                    }}>
                      <div style={{fontSize: 12, color: '#9ca3af', marginBottom: 4}}>Time Complexity</div>
                      <div style={{fontSize: 14, fontWeight: 600, color: '#60a5fa'}}>
                        {result['time Complexity'].trim()}
                      </div>
                    </div>
                  )}
                  {result['space Complexity'] && (
                    <div style={{
                      padding: 12,
                      background: '#1f2937',
                      borderRadius: 8,
                      border: '1px solid var(--muted)'
                    }}>
                      <div style={{fontSize: 12, color: '#9ca3af', marginBottom: 4}}>Space Complexity</div>
                      <div style={{fontSize: 14, fontWeight: 600, color: '#a78bfa'}}>
                        {result['space Complexity'].trim()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test Cases */}
              {Array.isArray(result.result) && result.result.length > 0 && (
                <div>
                  <h4 style={{fontSize: 14, fontWeight: 600, marginBottom: 12}}>Test Cases</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    {result.result.map((line, idx) => {
                      // Check for different formats
                      const isPassed = line.includes('[PASSED]') || (line.includes('expected') && line.split('expected')[0].trim() === line.split('expected')[1].trim())
                      const isFailed = line.includes('[FAILED]') || (line.includes('expected') && line.split('expected')[0].trim() !== line.split('expected')[1].trim())
                      
                      return (
                        <div key={idx} style={{
                          padding: '8px 0',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          borderBottom: idx < result.result.length - 1 ? '1px solid var(--muted)' : 'none'
                        }}>
                          <span style={{fontSize: 16, flexShrink: 0}}>
                            {isPassed ? '✅' : isFailed ? '❌' : '⚪'}
                          </span>
                          <span style={{
                            color: isPassed ? '#10b981' : isFailed ? '#ef4444' : '#e5e7eb',
                            wordBreak: 'break-word',
                            flex: 1
                          }}>
                            {line}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {result.error && (
                <div style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#ef444420',
                  border: '1px solid #ef4444',
                  borderRadius: 8,
                  color: '#ef4444',
                  fontSize: 14
                }}>
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </>
          )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}
