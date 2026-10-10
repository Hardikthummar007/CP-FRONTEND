import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProblemsList from './pages/ProblemsList'
import ProblemDetail from './pages/ProblemDetail'
import ContestsList from './pages/ContestsList'
import ContestDetail from './pages/ContestDetail'
import ContestPage from './pages/ContestPage'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import TestBackend from './pages/TestBackend'
import { useAuth } from './context/AuthContext'
import AdminContest from './pages/AdminContest'
import AdminController from './pages/AdminController'


function ProtectedRoute({ children }) {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function AdminRoute({ children }) {
  const { token, isAdminUser } = useAuth()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (!isAdminUser) {
    return <Navigate to="/problems" replace />
  }
  return children
}

export default function App() {
  const { token } = useAuth()
  const location = useLocation()
  const isProblemWorkspace = location.pathname.startsWith('/problems/')

  return (
    <div className="app-container">
      <Navbar />
      <div className={isProblemWorkspace ? "app-workspace-container" : "content-container"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={token ? <Navigate to="/" /> : <Signup />} />
          <Route path="/test" element={<TestBackend />} />

          <Route path="/problems" element={<ProblemsList />} />
          <Route path="/problems/:id" element={
            <ProtectedRoute>
              <ProblemDetail />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />

          <Route path="/adminController" element={
            <AdminRoute>
              <AdminController />
            </AdminRoute>
          } />

          <Route path="/adminContest" element={
            <AdminRoute>
              <AdminContest />
            </AdminRoute>
          } />

          <Route path="/contests" element={<ContestsList />} />
          <Route path="/contest/:id" element={<ContestDetail />} />
          <Route path="/contest/:contestId/problem/:problemIndex" element={
            <ProtectedRoute>
              <ContestPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}
