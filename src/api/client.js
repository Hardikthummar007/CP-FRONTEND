import axios from 'axios'

// Direct URLs to backend services
export const AUTH_BASE = 'http://localhost:8087/auth'
export const PROBLEM_BASE = 'http://localhost:8085/problemService'
export const USER_BASE = 'http://localhost:8085/userService'
export const CONTEST_BASE = 'http://localhost:8085/contestService'

export const api = axios.create()

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url, {
    headers: config.headers,
    params: config.params,
    data: config.data
  })
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, 'Status:', response.status)
    console.log('Response data:', response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url)
    console.error('Status:', error.response?.status)
    console.error('Error data:', error.response?.data)
    console.error('Error message:', error.message)
    if (error.config) {
      console.error('Request was:', error.config.method?.toUpperCase(), error.config.url)
      console.error('Request params:', error.config.params)
      console.error('Request data:', error.config.data)
    }
    return Promise.reject(error)
  }
)

// User Service
export const isAdmin = (userName) => axios.get(`${USER_BASE}/isHeSheAdmin`, { params: { userName } }).then(r => r.data)
export const loginUser = ({ username, password, role }) => axios.post(`${USER_BASE}/login`, null, { params: { username, password, role } }).then(r => r.data)
export const signupUser = ({ userName, password, role, coutry }) => axios.post(`${USER_BASE}/singUp`, { userName, password, role, coutry }).then(r => r.data)
export const getUserById = (username) => api.get(`${USER_BASE}/getUserById`, { params: { username } }).then(r => r.data)
export const getProfileLoading = (userId) => api.get(`${USER_BASE}/profileLoading`, { params: { userId } }).then(r => r.data)

// Problem Service
export const getAllProblems = () => axios.get(`${PROBLEM_BASE}/getAllProblem`).then(r => r.data)
export const getProblemById = (id) => api.get(`${PROBLEM_BASE}/getProblem`, { params: { id } }).then(r => r.data)
export const addProblem = (problemData) => api.post(`${PROBLEM_BASE}/addProblem`, problemData).then(r => r.data)

// Normal submission
export const NORMAL_SUBMISSION_BASE = 'http://localhost:8085/normalSubmissionService'

export const submitNormal = ({ username, problemId, code, langauge, input }) => {
  const body = { username, problemId, code: { code, langauge, input } }
  return api.post(`${USER_BASE}/optimizeCompileNormalSolution`, body).then(r => {
    const raw = r.data
    // Backend may return wrapped Spring ResponseEntity: { headers, body: { ... }, statusCodeValue: 200 }
    if (raw && typeof raw === 'object' && raw.body && typeof raw.body === 'object') {
      return { ...raw.body, _raw: raw }
    }
    return raw
  })
}

export const getSubmissionsPerProblem = (userName, problemId) => {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    headers.token = token.replace(/^Bearer\s+/i, '')
  }
  return api.get(`${NORMAL_SUBMISSION_BASE}/getSubmissionPerProblem`, {
    params: { userName, problemId },
    headers
  }).then(r => r.data)
}

export const getSubmissionsByUserAndProblem = getSubmissionsPerProblem

// Contest Service
export const getAllContests = () => api.get(`${CONTEST_BASE}/getContests`).then(r => r.data)
export const getContest = (contestId) => api.get(`${CONTEST_BASE}/getContest`, { params: { contestId } }).then(r => r.data)
export const registerToContest = ({ userId, contestId }) => api.post(`${USER_BASE}/registerToContest`, null, { params: { userId, contestId } }).then(r => r.data)
export const startContest = ({ userId, contestId }) => api.post(`${USER_BASE}/startContest`, null, { params: { userId, contestId } }).then(r => r.data)
export const submitContestProblem = ({ userId, contestId, problemNo, langauge, code, input }) => {
  const body = { userId, contestId, problemNo, code: { langauge, code, input } }
  return api.post(`${USER_BASE}/submistOneByOneProblemOfContest`, body).then(r => r.data)
}
export const endContest = ({ userId, contestId, date }) => api.post(`${USER_BASE}/endContest`, null, { params: { userId, contestId, date } }).then(r => r.data)

// Admin Service
export const addContest = (contestData) => api.post(`${CONTEST_BASE}/addContest`, contestData).then(r => r.data)

// Leaderboard Service (uses Vite proxy to prevent CORS errors)
export const LEADERBOARD_BASE = ''

export const getContestLeaderboard = (contestId, date) => {
  const url = `${LEADERBOARD_BASE}/sortUserOfContestWhoCompletedTheContest`
  return axios.get(url, {
    params: { contestId, date }
  }).then(r => {
    const raw = r.data
    if (raw && typeof raw === 'object' && raw.body && Array.isArray(raw.body)) {
      return raw.body
    }
    return Array.isArray(raw) ? raw : []
  })
}

export const pushTopersOnDashboard = (contestId, date) => {
  const url = `${LEADERBOARD_BASE}/topersOnDashBoard`
  return axios.get(url, {
    params: { contestId, date }
  }).then(r => r.data)
}
