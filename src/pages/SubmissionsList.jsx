import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function SubmissionsList({ problemId, userName, setCode }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        // Keep exact path and spelling per backend contract
        const res = await axios.get('http://localhost:8081/normalSubmissoinService/getSubmissionPerProblem', {
          params: { userName, problemId }
        })
        if (!active) return
        setSubmissions(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        if (!active) return
        setError(e?.response?.data?.message || e?.message || 'Failed to load submissions')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (userName && problemId) load()
    return () => { active = false }
  }, [userName, problemId])

  if (loading) return <div className="small">Loading submissions...</div>
  if (error) return <div style={{ color: '#f87171' }}>{error}</div>
  if (!submissions.length) return <div className="small">No submissions yet.</div>

  return (
    <div className="list">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="problem-row"
          onClick={() => setCode(sub.code || '')}
          title="Click to load this code into the editor"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
              {sub.language?.toUpperCase() || '—'}
            </div>
            <div className="small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {(sub.code || '').replace(/\n/g, ' ').slice(0, 120)}{(sub.code || '').length > 120 ? '…' : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="badge">#{sub.id}</div>
            <div className="small" style={{ marginTop: 6 }}>{sub.submissionTime}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function SubmissionsTab({ problemId, setCode }) {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         if (!user || !user.username) throw new Error("User not logged in");

//         const res = await axios.get(
//           "http://localhost:8081/normalSubmissoinService/getSubmissionPerProblem",
//           {
//             params: {
//               userName: user.username,
//               problemId: problemId,
//             },
//           }
//         );
//         setSubmissions(res.data);
//       } catch (err) {
//         console.error("Error fetching submissions:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, [problemId]);

//   if (loading) return <p className="text-gray-500">Loading submissions...</p>;
//   if (error) return <p className="text-red-500">Error: {error}</p>;
//   if (!submissions.length) return <p>No submissions yet.</p>;

//   return (
//     <div className="space-y-3">
//       {submissions.map((sub) => (
//         <div
//           key={sub.id}
//           onClick={() => setCode(sub.code)}
//           className="cursor-pointer border rounded-lg p-3 hover:bg-gray-100 transition duration-150"
//         >
//           <div className="flex justify-between items-center">
//             <span className="font-semibold text-gray-700">
//               {sub.language.toUpperCase()}
//             </span>
//             <span className="text-sm text-gray-500">
//               {sub.submissionTime}
//             </span>
//           </div>
//           <p className="text-xs text-gray-600 truncate mt-1">
//             {sub.code.slice(0, 100)}...
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }