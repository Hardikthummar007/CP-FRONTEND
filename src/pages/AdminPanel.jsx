import React, { useState } from 'react'
import { addProblem, addContest } from '../api/client'

export default function AdminPanel() {
  const [pForm, setPForm] = useState({
    tittle: '',
    description: '',
    difficulty: 1,
    inputLimit: '',
    outputLimit: ''
  })

  const [sampleIOs, setSampleIOs] = useState([{ input: '', output: '' }])
  const [testCases, setTestCases] = useState([{ tc_input: '', tc_ouput: '' }])
  const [hints, setHints] = useState([{ hint: '' }])
  const [topics, setTopics] = useState([{ topic: '' }])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const normalizeMultiline = (text) => (text || '').replace(/\r\n/g, '\n')

  const updateList = (list, setList, index, key, value) => {
    const updated = [...list]
    updated[index][key] = value
    setList(updated)
  }

  const addItem = (list, setList, item) => setList([...list, item])
  const removeItem = (list, setList, index) => {
    if (list.length > 1) setList(list.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        tittle: pForm.tittle.trim(),
        description: pForm.description.trim(),
        difficulty: Number(pForm.difficulty),
        inputLimit: pForm.inputLimit ? Number(pForm.inputLimit) : undefined,
        outputLimit: pForm.outputLimit ? Number(pForm.outputLimit) : undefined,
        sampleIOS: sampleIOs
          .filter(s => s.input || s.output)
          .map(s => ({
            input: normalizeMultiline(s.input),
            output: normalizeMultiline(s.output)
          })),
        testCases: testCases
          .filter(t => t.tc_input || t.tc_ouput)
          .map(t => ({
            tc_input: normalizeMultiline(t.tc_input),
            tc_ouput: normalizeMultiline(t.tc_ouput)
          })),
        hints: hints.filter(h => h.hint.trim()).map(h => ({ hint: h.hint.trim() })),
        topics: topics.filter(t => t.topic.trim()).map(t => ({ topic: t.topic.trim() }))
      }

      console.log('Submitting problem payload:', payload)
      const response = await addProblem(payload)
      setMessage(response || 'Problem created successfully!')

      if (response?.toLowerCase().includes('problem added')) {
        setPForm({ tittle: '', description: '', difficulty: 1, inputLimit: '', outputLimit: '' })
        setSampleIOs([{ input: '', output: '' }])
        setTestCases([{ tc_input: '', tc_ouput: '' }])
        setHints([{ hint: '' }])
        setTopics([{ topic: '' }])
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data || err.message || 'Failed to create problem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 20,
        background: '#1f2937',
        borderRadius: 12,
        color: '#f3f4f6',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: 30, color: '#10b981' }}>Create New Problem</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title */}
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={pForm.tittle}
            onChange={(e) => setPForm({ ...pForm, tittle: e.target.value })}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 6,
              border: '1px solid #374151',
              background: '#111827',
              color: '#f3f4f6'
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label>Description:</label>
          <textarea
            value={pForm.description}
            onChange={(e) => setPForm({ ...pForm, description: e.target.value })}
            required
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 6,
              border: '1px solid #374151',
              background: '#111827',
              color: '#f3f4f6',
              minHeight: 120
            }}
          />
        </div>

        {/* Difficulty & Limits */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label>Difficulty:</label>
            <select
              value={pForm.difficulty}
              onChange={(e) => setPForm({ ...pForm, difficulty: e.target.value })}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #374151',
                background: '#111827',
                color: '#f3f4f6'
              }}
            >
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Input Limit:</label>
            <input
              type="number"
              value={pForm.inputLimit}
              onChange={(e) => setPForm({ ...pForm, inputLimit: e.target.value })}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #374151',
                background: '#111827',
                color: '#f3f4f6'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Output Limit:</label>
            <input
              type="number"
              value={pForm.outputLimit}
              onChange={(e) => setPForm({ ...pForm, outputLimit: e.target.value })}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #374151',
                background: '#111827',
                color: '#f3f4f6'
              }}
            />
          </div>
        </div>

        {/* Sample IOs */}
        <div>
          <h3>Sample Input/Output</h3>
          {sampleIOs.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <textarea
                placeholder="Sample Input"
                value={s.input}
                onChange={(e) => updateList(sampleIOs, setSampleIOs, i, 'input', e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#f3f4f6', minHeight: 50 }}
              />
              <textarea
                placeholder="Sample Output"
                value={s.output}
                onChange={(e) => updateList(sampleIOs, setSampleIOs, i, 'output', e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#f3f4f6', minHeight: 50 }}
              />
              {sampleIOs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(sampleIOs, setSampleIOs, i)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(sampleIOs, setSampleIOs, { input: '', output: '' })}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}
          >
            Add Sample
          </button>
        </div>

        {/* Test Cases */}
        <div>
          <h3>Test Cases</h3>
          {testCases.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <textarea
                placeholder="Test Case Input"
                value={t.tc_input}
                onChange={(e) => updateList(testCases, setTestCases, i, 'tc_input', e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#f3f4f6', minHeight: 50 }}
              />
              <textarea
                placeholder="Test Case Output"
                value={t.tc_ouput}
                onChange={(e) => updateList(testCases, setTestCases, i, 'tc_ouput', e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#f3f4f6', minHeight: 50 }}
              />
              {testCases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(testCases, setTestCases, i)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(testCases, setTestCases, { tc_input: '', tc_ouput: '' })}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}
          >
            Add Test Case
          </button>
        </div>

        {/* Hints */}
        <div>
          <h3>Hints</h3>
          {hints.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                placeholder="Hint"
                value={h.hint}
                onChange={(e) => updateList(hints, setHints, i, 'hint', e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#f3f4f6' }}
              />
              {hints.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(hints, setHints, i)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(hints, setHints, { hint: '' })}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}
          >
            Add Hint
          </button>
        </div>

        {/* Topics */}
        <div>
          <h3>Topics</h3>
          {topics.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                placeholder="Topic"
                value={t.topic}
                onChange={(e) => updateList(topics, setTopics, i, 'topic', e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #374151', background: '#111827', color: '#f3f4f6' }}
              />
              {topics.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(topics, setTopics, i)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(topics, setTopics, { topic: '' })}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px' }}
          >
            Add Topic
          </button>
        </div>

        {/* Submit */}
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
          {loading ? 'Creating...' : 'Create Problem'}
        </button>

        {message && <p style={{ color: '#22c55e' }}>{message}</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </form>
    </div>
  )
}