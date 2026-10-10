// import React, { useMemo, useState } from 'react'
// import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
// import CodeEditor from '../components/CodeEditor'

// export default function DemoSubmissions(){
//   const [activeTab, setActiveTab] = useState('problem')
//   const [code, setCode] = useState('')
//   const [language, setLanguage] = useState('python')

//   const problem = useMemo(()=>({
//     problem_id: 4,
//     tittle: 'Bottle Exchange',
//     description: 'Given a = initial bottles and b = bottles needed for exchange, compute total number of bottles you can drink by exchanging empties.\n\nInput: two integers a and b.\nOutput: one integer.\n',
//     constraints: '1 <= a, b <= 10^9',
//     examples: [
//       { input: '13 10', output: '14' },
//       { input: '10 3', output: '14' }
//     ]
//   }), [])

//   const submissions = useMemo(()=>[
//     { id: 9, language: 'python', submissionTime: '2025-10-14', code: 'a = int(input())\nb = int(input())\nres = a\nempty = a\nwhile empty >= 10:\n    new_bottles = empty // 10\n    res += new_bottles\n    empty = empty % 10 + new_bottles\nprint(res)' },
//     { id: 10, language: 'java', submissionTime: '2025-10-14', code: 'import java.util.*;\npublic class Main {\n  public static void main(String[] a){\n    Scanner sc=new Scanner(System.in);\n    int A=sc.nextInt(), B=sc.nextInt();\n    int res=A, e=A;\n    while(e>=B){ int nb=e/B; res+=nb; e=e%B+nb; }\n    System.out.println(res);\n  }\n}'}
//   ], [])

//   return (
//     <div style={{ height: '100vh', width: '100%', background: '#141414', display: 'flex', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden' }}>
//       <PanelGroup direction="horizontal" style={{ width: '100%', maxWidth: 1400, height: '100%' }}>
//         <Panel defaultSize={50} minSize={25}>
//           <div style={{ height: '100%', overflow: 'auto', background: '#1b1b1b', borderRadius: 10, border: '1px solid #333', padding: 20 }}>
//             <div className="row" style={{ gap: 8, margin: '0 0 12px 0' }}>
//               <button className="button secondary" style={{ background: activeTab === 'problem' ? 'var(--muted)' : 'transparent', border: '1px solid var(--muted)' }} onClick={()=>setActiveTab('problem')}>Problem</button>
//               <button className="button secondary" style={{ background: activeTab === 'submissions' ? 'var(--muted)' : 'transparent', border: '1px solid var(--muted)' }} onClick={()=>setActiveTab('submissions')}>Submissions</button>
//             </div>

//             {activeTab === 'problem' && (
//               <div className="card">
//                 <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>#{problem.problem_id} {problem.tittle}</div>
//                 <div className="small" style={{ marginBottom: 12 }}>Constraints: {problem.constraints}</div>
//                 <div style={{ whiteSpace: 'pre-wrap' }}>{problem.description}</div>
//                 <div style={{ marginTop: 12 }}>
//                   {problem.examples.map((ex, i)=> (
//                     <div key={i} className="result-line" style={{ marginBottom: 8 }}>
//                       <div className="small">Input</div>
//                       <div>{ex.input}</div>
//                       <div className="small" style={{ marginTop: 6 }}>Output</div>
//                       <div>{ex.output}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'submissions' && (
//               <div className="list">
//                 {submissions.map(sub => (
//                   <div key={sub.id} className="problem-row" onClick={()=> setCode(sub.code)}>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                       <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.language?.toUpperCase()}</div>
//                       <div className="small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
//                         {sub.code.replace(/\n/g, ' ').slice(0, 120)}{sub.code.length>120?'…':''}
//                       </div>
//                     </div>
//                     <div style={{ textAlign: 'right' }}>
//                       <div className="badge">#{sub.id}</div>
//                       <div className="small" style={{ marginTop: 6 }}>{sub.submissionTime}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Panel>

//         <PanelResizeHandle style={{ width: 8, cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <div style={{ width: 2, height: 40, background: '#555', borderRadius: 2 }} />
//         </PanelResizeHandle>

//         <Panel defaultSize={50} minSize={25}>
//           <div className="card" style={{ height: '100%' }}>
//             <div className="row" style={{ marginBottom: 8 }}>
//               <select value={language} onChange={(e)=>setLanguage(e.target.value)}>
//                 <option value="python">Python</option>
//                 <option value="java">Java</option>
//                 <option value="cpp">C++</option>
//               </select>
//             </div>
//             <div className="editor-panel">
//               <CodeEditor language={language} code={code} onChange={setCode} />
//             </div>
//           </div>
//         </Panel>
//       </PanelGroup>
//     </div>
//   )
// }