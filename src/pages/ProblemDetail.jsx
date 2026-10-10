import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { getAllProblems, getProblemById, submitNormal } from '../api/client'
import CodeEditor from '../components/CodeEditor'
import ProblemView from '../components/ProblemView'
import { useAuth } from '../context/AuthContext'
import SubmissionsList from '../components/SubmissionsList'

const DEFAULT_BOILERPLATES = {
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        return []
`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
    return [];
};`
}

export default function ProblemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Language & code persistence per language
  const [language, setLanguage] = useState('java')
  const [codeByLanguage, setCodeByLanguage] = useState(DEFAULT_BOILERPLATES)
  const code = codeByLanguage[language] || DEFAULT_BOILERPLATES[language] || ''

  const setCode = (newCode) => {
    setCodeByLanguage(prev => ({ ...prev, [language]: newCode }))
  }

  // Execution states
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)

  // Problem switcher / quick search state
  const [allProblems, setAllProblems] = useState([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Left column tabs: 'description' | 'hints' | 'submissions'
  const [activeTab, setActiveTab] = useState('description')

  // Center runner console tab: 'testcase' | 'customInput'
  const [consoleTab, setConsoleTab] = useState('testcase')
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0)
  const [useCustomTestcase, setUseCustomTestcase] = useState(false)

  // Right column testcases accordion
  const [expandedTestcase, setExpandedTestcase] = useState(null)

  // Fetch current problem
  useEffect(() => {
    let mounted = true
    setLoading(true)
    getProblemById(id)
      .then(data => {
        if (mounted) {
          setProblem(data)
          if (data?.boilerplateCode || data?.starterCode) {
            setCodeByLanguage(prev => ({
              ...prev,
              java: data.boilerplateCode || data.starterCode || prev.java
            }))
          }
        }
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load problem'))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [id])

  // Load all problems once for switcher
  useEffect(() => {
    let active = true
    getAllProblems()
      .then(list => { if (active) setAllProblems(Array.isArray(list) ? list : []) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // Current problem index and next/prev navigation
  const currentProblemIdx = useMemo(() => {
    return allProblems.findIndex(p => String(p.problem_id ?? p.id) === String(id))
  }, [allProblems, id])

  const prevProblemId = currentProblemIdx > 0 ? (allProblems[currentProblemIdx - 1]?.problem_id ?? allProblems[currentProblemIdx - 1]?.id) : null
  const nextProblemId = currentProblemIdx >= 0 && currentProblemIdx < allProblems.length - 1 ? (allProblems[currentProblemIdx + 1]?.problem_id ?? allProblems[currentProblemIdx + 1]?.id) : null

  const filtered = useMemo(() => {
    if (!search) return allProblems.slice(0, 10)
    const q = search.toLowerCase()
    return allProblems.filter(pb => {
      const title = (pb.title || pb.tittle || pb.name || '').toLowerCase()
      return title.includes(q) || String(pb.problem_id).includes(q)
    }).slice(0, 10)
  }, [search, allProblems])

  const onPick = (pid) => {
    setShowSearch(false)
    setSearch('')
    navigate(`/problems/${pid}`)
  }

  const testCasesList = useMemo(() => {
    if (problem?.testCases && problem.testCases.length > 0) {
      return problem.testCases
    }
    return [
      { testcase_id: 1, tc_input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', tc_ouput: '6', input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { testcase_id: 2, tc_input: 'height = [4,2,0,3,2,5]', tc_ouput: '9', input: 'height = [4,2,0,3,2,5]', output: '9' }
    ]
  }, [problem])

  const getTestCaseInput = (tc, idx) => {
    const subList = submission?.test_results || submission?.testResults || submission?.result || submission?.results
    if (Array.isArray(subList) && subList[idx]?.tc_input) {
      return subList[idx].tc_input
    }
    return tc?.tc_input ?? tc?.input ?? tc?.tcInput ?? (typeof tc === 'string' ? tc : 'N/A')
  }

  const getTestCaseExpected = (tc, idx) => {
    const subList = submission?.test_results || submission?.testResults || submission?.result || submission?.results
    if (Array.isArray(subList) && (subList[idx]?.expected || subList[idx]?.tc_ouput || subList[idx]?.tc_output)) {
      return subList[idx].expected || subList[idx].tc_ouput || subList[idx].tc_output
    }
    return tc?.tc_ouput ?? tc?.tc_output ?? tc?.output ?? tc?.expectedOutput ?? tc?.expected ?? 'N/A'
  }

  const getTestCaseActual = (tc, idx, isPassed) => {
    const subList =
      submission?.test_results ||
      submission?.testResults ||
      submission?.result ||
      submission?.results ||
      submission?.testCases ||
      submission?.testCaseResults ||
      submission?.outputs

    if (Array.isArray(subList) && subList[idx] !== undefined) {
      const item = subList[idx]
      if (typeof item === 'string' || typeof item === 'number') {
        const val = String(item).trim()
        return val === '' ? '(Empty Output)' : val
      }
      if (item && typeof item === 'object') {
        const candidate =
          item.actual ??
          item.actualOutput ??
          item.output ??
          item.stdout ??
          item.userOutput ??
          item.user_output ??
          item.result ??
          item.response ??
          item.got ??
          item.received ??
          item.val ??
          item.value

        if (candidate !== undefined && candidate !== null) {
          const val = String(candidate).trim()
          return val === '' ? '(Empty Output)' : val
        }
        if (item.error || item.errorMessage || item.err || item.stderr) {
          return String(item.error || item.errorMessage || item.err || item.stderr)
        }
      }
    }

    const directOutput =
      submission?.actualOutput ??
      submission?.actual ??
      submission?.stdout ??
      submission?.userOutput ??
      submission?.output ??
      submission?.customInputResult ??
      (typeof submission?.result !== 'object' ? submission?.result : undefined)

    if (directOutput !== undefined && directOutput !== null) {
      const str = String(directOutput).trim()
      if (str !== '') {
        const lines = str.split('\n')
        if (lines.length > idx && lines[idx] !== undefined && lines[idx].trim() !== '') {
          return lines[idx].trim()
        }
        return str
      }
      return '(Empty Output)'
    }

    if (submission?.error || submission?.errorMessage || submission?.compilationError) {
      return String(submission.error || submission.errorMessage || submission.compilationError)
    }

    if (isPassed) {
      return String(getTestCaseExpected(tc, idx))
    }

    if (submission?.status === 'error' || submission?.status === 'ERROR') {
      return 'Runtime Error (no output generated)'
    }
    return 'Wrong Answer (output did not match expected)'
  }

  // Execution handler: isSubmission = true for Submit, false for Run
  const handleExecution = useCallback(async (isSubmission = true) => {
    if (submitting) return
    setSubmitting(true)
    const startTime = Date.now()
    try {
      let activeInput = ''
      if (consoleTab === 'customInput' || useCustomTestcase) {
        activeInput = input
      } else {
        const curCase = testCasesList[selectedCaseIdx] || testCasesList[0]
        activeInput = getTestCaseInput(curCase, selectedCaseIdx) || ''
      }

      const res = await submitNormal({
        username: user || localStorage.getItem('username') || 'user',
        problemId: Number(id),
        code,
        langauge: language,
        input: activeInput
      })
      const elapsed = Date.now() - startTime
      setSubmission({
        ...res,
        _isSubmission: isSubmission,
        _runtime: res?.runtime || `${elapsed} ms`,
        _memory: res?.memory || '42.3 MB'
      })
    } catch (err) {
      setSubmission({
        status: 'error',
        error: err?.response?.data?.message || err?.message || 'Execution failed',
        _runtime: 'N/A',
        _memory: 'N/A',
        _isSubmission: isSubmission
      })
    } finally {
      setSubmitting(false)
    }
  }, [submitting, user, id, code, language, input, consoleTab, useCustomTestcase, selectedCaseIdx, testCasesList])

  const onSubmit = () => handleExecution(true)
  const onRun = () => handleExecution(false)

  // Keyboard shortcut Ctrl/Cmd + Enter
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

  const passedCount = submission?.passedTestCases ?? submission?.totalTestCasePassed ?? 0
  const totalCount = submission?.totalTestCases ?? submission?.totalTestCase ?? (problem?.testCases?.length || 2)
  const isAccepted = submission && !submission.error && (
    submission.status === 'success' ||
    submission.status === 'ACCEPTED' ||
    (totalCount > 0 && passedCount === totalCount)
  )

  const hintsList = problem?.hints || []

  return (
    <div style={{
      height: '100%',
      width: '100%',
      background: '#080D12',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* MAIN 3-PANEL WORKSPACE */}
      <div style={{
        flex: 1,
        minHeight: 0,
        height: 'calc(100% - 24px)',
        padding: '8px 12px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <PanelGroup direction="horizontal">
          {/* ========================================================= */}
          {/* COLUMN 1: PROBLEM DETAILS & DESCRIPTION (~32%)             */}
          {/* ========================================================= */}
          <Panel defaultSize={32} minSize={22} maxSize={45}>
            <div style={{
              height: '100%',
              background: '#111820',
              border: '1px solid #29323B',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Top Navigation Sub-bar (Height 42px) */}
              <div style={{
                height: 42,
                minHeight: 42,
                padding: '0 14px',
                background: '#0D141C',
                borderBottom: '1px solid #29323B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                position: 'relative'
              }}>
                {/* Left: Back to Problems link */}
                <Link
                  to="/problems"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#A6B0BB',
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#F2EBDD' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#A6B0BB' }}
                >
                  <span style={{ fontSize: 13 }}>←</span>
                  <span>Back to Problems</span>
                </Link>

                {/* Right: Quick Switcher & < > Arrows */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Problem Dropdown Trigger */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      style={{
                        background: '#182129',
                        border: '1px solid #29323B',
                        borderRadius: 5,
                        padding: '3px 8px',
                        color: '#FFFFFF',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Quick jump to problem"
                    >
                      <span>#{problem?.problem_id || id}</span>
                      <span style={{ fontSize: 8, color: '#A6B0BB' }}>▼</span>
                    </button>

                    {/* Popover list */}
                    {showSearch && (
                      <div style={{
                        position: 'absolute',
                        top: '115%',
                        right: 0,
                        width: 260,
                        background: '#111820',
                        border: '1px solid #29323B',
                        borderRadius: 8,
                        zIndex: 300,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                        overflow: 'hidden'
                      }}>
                        <div style={{ padding: '8px 10px', borderBottom: '1px solid #1E262F' }}>
                          <input
                            autoFocus
                            placeholder="Search problems..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '5px 8px',
                              borderRadius: 4,
                              background: '#080D12',
                              border: '1px solid #29323B',
                              color: '#F2EBDD',
                              fontSize: 12,
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                          {filtered.map(pb => (
                            <div
                              key={pb.problem_id}
                              onClick={() => onPick(pb.problem_id)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #1E262F',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: 12,
                                color: '#F2EBDD'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#182129')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>
                                #{pb.problem_id} {pb.title || pb.tittle || pb.name}
                              </span>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: pb.difficulty === 1 ? '#35D6A0' : (pb.difficulty === 3 ? '#F06464' : '#FFFFFF')
                              }}>
                                {pb.difficulty === 1 ? 'Easy' : (pb.difficulty === 3 ? 'Hard' : 'Med')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Previous problem arrow */}
                  <button
                    disabled={!prevProblemId}
                    onClick={() => prevProblemId && navigate(`/problems/${prevProblemId}`)}
                    style={{
                      background: '#182129',
                      border: '1px solid #29323B',
                      borderRadius: 5,
                      padding: '3px 7px',
                      color: prevProblemId ? '#F2EBDD' : '#4E5D6C',
                      cursor: prevProblemId ? 'pointer' : 'not-allowed',
                      fontSize: 11
                    }}
                    title="Previous Problem"
                  >
                    &lt;
                  </button>

                  {/* Next problem arrow */}
                  <button
                    disabled={!nextProblemId}
                    onClick={() => nextProblemId && navigate(`/problems/${nextProblemId}`)}
                    style={{
                      background: '#182129',
                      border: '1px solid #29323B',
                      borderRadius: 5,
                      padding: '3px 7px',
                      color: nextProblemId ? '#F2EBDD' : '#4E5D6C',
                      cursor: nextProblemId ? 'pointer' : 'not-allowed',
                      fontSize: 11
                    }}
                    title="Next Problem"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {/* Dedicated Tab Strip (Height 38px, NO crowding) */}
              <div style={{
                height: 38,
                minHeight: 38,
                padding: '0 14px',
                background: '#0D141C',
                borderBottom: '1px solid #29323B',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <button
                  onClick={() => setActiveTab('description')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0 4px',
                    height: '100%',
                    fontSize: 12.5,
                    fontWeight: activeTab === 'description' ? 600 : 500,
                    color: activeTab === 'description' ? '#F2EBDD' : '#A6B0BB',
                    borderBottom: activeTab === 'description' ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s'
                  }}
                >
                  <span>📄</span>
                  <span>Description</span>
                </button>

                <button
                  onClick={() => setActiveTab('hints')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0 4px',
                    height: '100%',
                    fontSize: 12.5,
                    fontWeight: activeTab === 'hints' ? 600 : 500,
                    color: activeTab === 'hints' ? '#F2EBDD' : '#A6B0BB',
                    borderBottom: activeTab === 'hints' ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s'
                  }}
                >
                  <span>💡</span>
                  <span>Hints</span>
                </button>

                <button
                  onClick={() => setActiveTab('submissions')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0 4px',
                    height: '100%',
                    fontSize: 12.5,
                    fontWeight: activeTab === 'submissions' ? 600 : 500,
                    color: activeTab === 'submissions' ? '#F2EBDD' : '#A6B0BB',
                    borderBottom: activeTab === 'submissions' ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s'
                  }}
                >
                  <span>📊</span>
                  <span>Submissions</span>
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '16px 18px'
              }}>
                {loading && (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: '#A6B0BB', fontSize: 13, fontStyle: 'italic' }}>
                    Loading problem details...
                  </div>
                )}
                {error && (
                  <div style={{
                    padding: 14,
                    background: 'rgba(240, 100, 100, 0.1)',
                    border: '1px solid #F06464',
                    borderRadius: 8,
                    color: '#F06464',
                    fontSize: 12.5
                  }}>
                    {error}
                  </div>
                )}

                {!loading && !error && activeTab === 'description' && problem && (
                  <ProblemView problem={problem} />
                )}

                {!loading && !error && activeTab === 'hints' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{
                      fontFamily: "'Playfair Display', 'Lora', Georgia, serif",
                      fontSize: 18,
                      color: '#F2EBDD',
                      fontWeight: 600
                    }}>
                      A little nudge
                    </div>
                    {hintsList.length > 0 ? (
                      hintsList.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#182129',
                            border: '1px solid #29323B',
                            borderRadius: 6,
                            padding: '12px 14px'
                          }}
                        >
                          <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                            💡 Hint {i + 1}
                          </div>
                          <div style={{ color: '#A6B0BB', fontSize: 13, lineHeight: 1.6 }}>
                            {typeof h === 'string' ? h : h.hint}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{
                        background: '#182129',
                        border: '1px solid #29323B',
                        borderRadius: 6,
                        padding: '14px',
                        color: '#A6B0BB',
                        fontSize: 13,
                        lineHeight: 1.6
                      }}>
                        💡 Try working backwards from the desired result. Pay close attention to base cases and edge conditions like 0 and 1.
                      </div>
                    )}
                  </div>
                )}

                {!loading && activeTab === 'submissions' && (
                  <SubmissionsList
                    problemId={Number(id)}
                    userName={user}
                    setCode={setCode}
                  />
                )}
              </div>
            </div>
          </Panel>

          {/* RESIZE HANDLE (1 -> 2) */}
          <PanelResizeHandle style={{
            width: 8,
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}>
            <div style={{
              width: 3,
              height: 32,
              background: '#29323B',
              borderRadius: 3
            }} />
          </PanelResizeHandle>

          {/* ========================================================= */}
          {/* COLUMN 2: CODE EDITOR & RUNNER CONSOLE (~44%)              */}
          {/* ========================================================= */}
          <Panel defaultSize={44} minSize={32} maxSize={60}>
            <div style={{
              height: '100%',
              background: '#111820',
              border: '1px solid #29323B',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Top Slim Wall Street Banner (Height 48px) */}
              <div style={{
                height: 48,
                minHeight: 48,
                position: 'relative',
                backgroundImage: 'url(/images/wall-street-banner.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                borderBottom: '1px solid #29323B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgba(8, 13, 18, 0.94) 0%, rgba(8, 13, 18, 0.6) 50%, rgba(8, 13, 18, 0.94) 100%)'
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: 10,
                  letterSpacing: '1.8px',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  A Little Ambition. A Lot of Possibility.
                </div>
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  fontFamily: "'Cormorant Garamond', 'Lora', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 14.5,
                  color: '#F2EBDD',
                  letterSpacing: '0.5px'
                }}>
                  Better Code. Bigger Opportunities.
                </div>
              </div>

              {/* Editor Top Toolbar (Height 42px) */}
              <div style={{
                padding: '0 14px',
                height: 42,
                minHeight: 42,
                background: '#0D141C',
                borderBottom: '1px solid #29323B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                boxSizing: 'border-box'
              }}>
                {/* Left Controls: Language Dropdown & Toggle Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Language Selector */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{
                        background: '#182129',
                        color: '#F2EBDD',
                        border: '1px solid #29323B',
                        padding: '4px 24px 4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="java">☕ Java</option>
                      <option value="cpp">⚡ C++</option>
                      <option value="python">🐍 Python</option>
                      <option value="javascript">🌐 JavaScript</option>
                    </select>
                    <span style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      fontSize: 8,
                      color: '#A6B0BB'
                    }}>▼</span>
                  </div>

                  {/* Lovable-style Slider Toggle Switch for Custom Input */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}>
                    <span style={{ fontSize: 12, color: consoleTab === 'customInput' ? '#FFFFFF' : '#A6B0BB', fontFamily: 'monospace' }}>
                      &lt;/&gt;
                    </span>
                    <div
                      onClick={() => setConsoleTab(prev => prev === 'customInput' ? 'testcase' : 'customInput')}
                      style={{
                        width: 32,
                        height: 18,
                        borderRadius: 10,
                        background: consoleTab === 'customInput' ? '#FFFFFF' : '#29323B',
                        position: 'relative',
                        transition: 'background 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: consoleTab === 'customInput' ? '#080D12' : '#A6B0BB',
                        position: 'absolute',
                        top: 2,
                        left: consoleTab === 'customInput' ? 16 : 2,
                        transition: 'all 0.2s'
                      }} />
                    </div>
                  </label>
                </div>

                {/* Right: Gold Submit Button */}
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  style={{
                    padding: '5px 18px',
                    background: submitting ? '#3D4A57' : '#FFFFFF',
                    color: submitting ? '#A6B0BB' : '#080D12',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: submitting ? 'none' : '0 2px 14px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 10 }}>▶</span>
                  <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>

              {/* Monaco Code Editor */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  onSubmit={onSubmit}
                  language={language === 'cpp' ? 'cpp' : language}
                />
              </div>

              {/* Docked Runner Panel (Height 195px) */}
              <div style={{
                height: 195,
                minHeight: 195,
                background: '#0D141C',
                borderTop: '1px solid #29323B',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Header Bar */}
                <div style={{
                  height: 36,
                  minHeight: 36,
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #1E262F',
                  background: '#111820'
                }}>
                  {/* Left: Testcase / Custom Input tabs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => setConsoleTab('testcase')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: consoleTab === 'testcase' ? '#F2EBDD' : '#A6B0BB',
                        borderBottom: consoleTab === 'testcase' ? '2px solid #FFFFFF' : '2px solid transparent',
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      &gt;_ Testcase
                    </button>
                    <button
                      onClick={() => setConsoleTab('customInput')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: consoleTab === 'customInput' ? '#F2EBDD' : '#A6B0BB',
                        borderBottom: consoleTab === 'customInput' ? '2px solid #FFFFFF' : '2px solid transparent',
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Custom Input
                    </button>
                  </div>

                  {/* Right: Run Code Button & Action Icons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={onRun}
                      disabled={submitting}
                      style={{
                        padding: '4px 14px',
                        background: submitting ? '#29323B' : '#182129',
                        color: submitting ? '#A6B0BB' : '#F2EBDD',
                        border: '1px solid #FFFFFF',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>▶</span>
                      <span>{submitting ? 'Running...' : 'Run Code'}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6E7987', fontSize: 12 }}>
                      <span title="Font settings" style={{ cursor: 'pointer' }}>Aa</span>
                      <span title="Reset" style={{ cursor: 'pointer' }}>⟲</span>
                      <span title="Settings" style={{ cursor: 'pointer' }}>⚙</span>
                      <span title="Toggle view" style={{ cursor: 'pointer' }}>⤢</span>
                    </div>
                  </div>
                </div>

                {/* Runner Content Body */}
                <div style={{
                  flex: 1,
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  overflow: 'hidden'
                }}>
                  {consoleTab === 'testcase' ? (
                    <>
                      {/* Case Pill Selectors */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {testCasesList.slice(0, 3).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedCaseIdx(idx)}
                            style={{
                              background: selectedCaseIdx === idx ? '#182129' : 'transparent',
                              border: `1px solid ${selectedCaseIdx === idx ? '#FFFFFF' : '#29323B'}`,
                              color: selectedCaseIdx === idx ? '#FFFFFF' : '#A6B0BB',
                              padding: '2px 10px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Case Parameter Preview Box */}
                      <div style={{
                        flex: 1,
                        background: '#080D12',
                        border: '1px solid #29323B',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontFamily: "'JetBrains Mono', Consolas, monospace",
                        fontSize: 11.5,
                        color: '#F2EBDD',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {getTestCaseInput(testCasesList[selectedCaseIdx] || testCasesList[0], selectedCaseIdx)}
                      </div>
                    </>
                  ) : (
                    /* Custom Input Textarea */
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter custom input..."
                      style={{
                        flex: 1,
                        background: '#080D12',
                        border: '1px solid #29323B',
                        borderRadius: 6,
                        padding: '8px 10px',
                        fontFamily: "'JetBrains Mono', Consolas, monospace",
                        fontSize: 12,
                        color: '#F2EBDD',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                  )}

                  {/* Bottom options row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#A6B0BB',
                    paddingTop: 2
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={useCustomTestcase}
                        onChange={(e) => setUseCustomTestcase(e.target.checked)}
                        style={{ accentColor: '#FFFFFF', cursor: 'pointer' }}
                      />
                      <span>Custom Testcases</span>
                    </label>
                    <span style={{ fontSize: 10, color: '#6E7987' }}>JSON / array format</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* RESIZE HANDLE (2 -> 3) */}
          <PanelResizeHandle style={{
            width: 8,
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}>
            <div style={{
              width: 3,
              height: 32,
              background: '#29323B',
              borderRadius: 3
            }} />
          </PanelResizeHandle>

          {/* ========================================================= */}
          {/* COLUMN 3: TESTCASE RESULTS & MOTIVATION (~24%)             */}
          {/* ========================================================= */}
          <Panel defaultSize={24} minSize={18} maxSize={35}>
            <div style={{
              height: '100%',
              background: '#111820',
              border: '1px solid #29323B',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              {/* Header (42px) */}
              <div style={{
                height: 42,
                minHeight: 42,
                padding: '0 14px',
                background: '#0D141C',
                borderBottom: '1px solid #29323B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F2EBDD' }}>
                  Testcase Results
                </span>
                {submitting && (
                  <span style={{ fontSize: 11, color: '#FFFFFF', fontStyle: 'italic' }}>
                    Evaluating...
                  </span>
                )}
              </div>

              {/* Fixed Status & Metrics Card (Pinned so it never scrolls out of view) */}
              <div style={{
                padding: '12px 14px 6px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0
              }}>
                {/* Status Badge */}
                {submitting ? (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid #FFFFFF',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      color: '#080D12',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800
                    }}>
                      ⟳
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FFFFFF' }}>
                      Compiling & Evaluating...
                    </span>
                  </div>
                ) : submission ? (
                  <div style={{
                    padding: '8px 12px',
                    background: isAccepted ? 'rgba(53, 214, 160, 0.12)' : 'rgba(240, 100, 100, 0.12)',
                    border: `1px solid ${isAccepted ? '#35D6A0' : '#F06464'}`,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: isAccepted ? '#35D6A0' : '#F06464',
                        color: '#080D12',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 900
                      }}>
                        {isAccepted ? '✓' : '✕'}
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isAccepted ? '#35D6A0' : '#F06464'
                      }}>
                        {isAccepted ? 'Accepted' : (submission.status === 'error' ? 'Runtime Error' : 'Wrong Answer')}
                      </span>
                    </div>

                    <span style={{ fontSize: 11, color: '#A6B0BB' }}>
                      {passedCount} / {totalCount} passed
                    </span>
                  </div>
                ) : (
                  <div style={{
                    padding: '8px 12px',
                    background: '#182129',
                    border: '1px solid #29323B',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#29323B',
                        color: '#A6B0BB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9
                      }}>
                        ○
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#A6B0BB' }}>
                        Not Run
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, color: '#FFFFFF' }}>Click Run or Submit</span>
                  </div>
                )}

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{
                    background: '#182129',
                    border: '1px solid #29323B',
                    borderRadius: 6,
                    padding: '6px 10px'
                  }}>
                    <div style={{ fontSize: 9.5, color: '#A6B0BB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Runtime
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: submission ? '#F2EBDD' : '#6E7987', marginTop: 1 }}>
                      {submission ? (submission._runtime || '12 ms') : '--'}
                    </div>
                  </div>

                  <div style={{
                    background: '#182129',
                    border: '1px solid #29323B',
                    borderRadius: 6,
                    padding: '6px 10px'
                  }}>
                    <div style={{ fontSize: 9.5, color: '#A6B0BB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Memory
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: submission ? '#F2EBDD' : '#6E7987', marginTop: 1 }}>
                      {submission ? (submission._memory || '42.3 MB') : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Testcases Accordion */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '6px 14px 10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(submission ? testCasesList : testCasesList.slice(0, 3)).map((tc, idx) => {
                    const isPassed = isAccepted || idx < passedCount
                    const isExpanded = expandedTestcase === idx
                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#182129',
                          border: '1px solid #29323B',
                          borderRadius: 6,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          onClick={() => setExpandedTestcase(isExpanded ? null : idx)}
                          style={{
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#F2EBDD' }}>
                            <span style={{ fontSize: 9, color: '#A6B0BB' }}>{isExpanded ? '▼' : '▶'}</span>
                            <span>Testcase {idx + 1}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {submission ? (
                              <>
                                <span style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: isPassed ? '#35D6A0' : '#F06464'
                                }}>
                                  {isPassed ? 'Passed' : 'Failed'}
                                </span>
                                <span style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  background: isPassed ? 'rgba(53, 214, 160, 0.2)' : 'rgba(240, 100, 100, 0.2)',
                                  color: isPassed ? '#35D6A0' : '#F06464',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 9,
                                  fontWeight: 800
                                }}>
                                  {isPassed ? '✓' : '✕'}
                                </span>
                              </>
                            ) : submitting ? (
                              <span style={{ fontSize: 10.5, color: '#FFFFFF', fontStyle: 'italic' }}>
                                Running...
                              </span>
                            ) : (
                              <span style={{
                                fontSize: 10.5,
                                color: '#A6B0BB',
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: '#111820',
                                border: '1px solid #29323B'
                              }}>
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Accordion Details */}
                        {isExpanded && (() => {
                          const inputVal = getTestCaseInput(tc, idx)
                          const expectedVal = getTestCaseExpected(tc, idx)
                          const actualVal = getTestCaseActual(tc, idx, isPassed)

                          return (
                            <div style={{
                              padding: '8px 10px',
                              borderTop: '1px solid #202A34',
                              background: '#0D141C',
                              fontSize: 11,
                              fontFamily: "'JetBrains Mono', Consolas, monospace",
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6
                            }}>
                              <div>
                                <div style={{ color: '#A6B0BB', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Input:</div>
                                <div style={{
                                  color: '#F2EBDD',
                                  marginTop: 2,
                                  background: '#080D12',
                                  padding: '5px 7px',
                                  borderRadius: 4,
                                  border: '1px solid #1E262F',
                                  wordBreak: 'break-all',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {inputVal}
                                </div>
                              </div>

                              <div>
                                <div style={{ color: '#A6B0BB', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected:</div>
                                <div style={{
                                  color: '#FFFFFF',
                                  marginTop: 2,
                                  background: '#080D12',
                                  padding: '5px 7px',
                                  borderRadius: 4,
                                  border: '1px solid #1E262F',
                                  wordBreak: 'break-all',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {expectedVal}
                                </div>
                              </div>

                              {submission && (
                                <div>
                                  <div style={{
                                    color: isPassed ? '#35D6A0' : '#F06464',
                                    fontSize: 9.5,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                  }}>
                                    Your Output:
                                  </div>
                                  <div style={{
                                    color: isPassed ? '#35D6A0' : '#F06464',
                                    marginTop: 2,
                                    background: '#080D12',
                                    padding: '5px 7px',
                                    borderRadius: 4,
                                    border: `1px solid ${isPassed ? 'rgba(53, 214, 160, 0.3)' : 'rgba(240, 100, 100, 0.3)'}`,
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-wrap'
                                  }}>
                                    {actualVal}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}

                  {!submission && testCasesList.length > 3 && (
                    <div style={{
                      fontSize: 10.5,
                      color: '#A6B0BB',
                      textAlign: 'center',
                      padding: '6px 8px',
                      background: '#141C24',
                      borderRadius: 6,
                      border: '1px dashed #29323B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}>
                      <span style={{ color: '#FFFFFF' }}>🔒</span>
                      <span>+{testCasesList.length - 3} hidden test cases evaluated upon submission</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Brooklyn Bridge Motivational Card (Pinned at Bottom) */}
              <div style={{
                padding: '8px 12px 12px 12px',
                borderTop: '1px solid #1E262F',
                background: '#111820',
                flexShrink: 0
              }}>
                <div style={{
                  height: 160,
                  position: 'relative',
                  backgroundImage: 'url(/images/bridge-background.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 40%',
                  borderRadius: 8,
                  border: '1px solid #29323B',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: '18px 16px',
                  boxSizing: 'border-box'
                }}>
                  {/* Subtle Dark Vignette */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(8, 13, 18, 0.92) 0%, rgba(8, 13, 18, 0.45) 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Gold Serif Text */}
                  <div style={{
                    position: 'relative',
                    zIndex: 2,
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: 20,
                    lineHeight: 1.3,
                    color: '#FFFFFF',
                    letterSpacing: '1px'
                  }}>
                    Good<br />
                    Things<br />
                    Take<br />
                    Time.
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* FOOTER STATUS BAR (Exact Match to Image 2) */}
      <div style={{
        height: 24,
        minHeight: 24,
        background: '#080D12',
        borderTop: '1px solid #1E262F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: 11,
        color: '#6E7987',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#35D6A0', fontSize: 8 }}>●</span>
          <span>Workspace ready</span>
          <span style={{ color: '#29323B' }}>|</span>
          <span style={{ color: '#A6B0BB' }}>CP Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>One problem at a time.</span>
          <span style={{ color: '#29323B' }}>|</span>
          <span style={{ color: '#FFFFFF', fontStyle: 'italic' }}>Keep showing up.</span>
        </div>
      </div>
    </div>
  )
}
