import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { token, user, isAdminUser, logout } = useAuth()
  const [navSearch, setNavSearch] = useState('')
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && navSearch.trim()) {
      navigate(`/problems?search=${encodeURIComponent(navSearch.trim())}`)
    }
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      height: 54,
      background: 'rgba(8, 11, 16, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #26313D',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* LEFT: Brand Logo & Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link to="/problems" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none'
        }}>
          {/* Electric Cyan Lightning Bolt Icon */}
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(96, 165, 250, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(56, 189, 248, 0.35)'
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#38BDF8">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
            </svg>
          </div>
          <span style={{
            fontSize: 16.5,
            fontWeight: 700,
            letterSpacing: '0.3px',
            color: '#E8EDF5'
          }}>
            CP Platform
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 54 }}>
          <NavLink
            to="/problems"
            style={({ isActive }) => ({
              padding: '0 14px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13.5,
              fontWeight: 500,
              color: isActive ? '#E8EDF5' : '#9AA8B8',
              borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
              boxShadow: isActive ? '0 1px 8px rgba(56, 189, 248, 0.4)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.2px'
            })}
          >
            Problems
          </NavLink>

          <NavLink
            to="/contests"
            style={({ isActive }) => ({
              padding: '0 14px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: 13.5,
              fontWeight: 500,
              color: isActive ? '#E8EDF5' : '#9AA8B8',
              borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
              boxShadow: isActive ? '0 1px 8px rgba(56, 189, 248, 0.4)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.2px'
            })}
          >
            Contests
          </NavLink>

          {isAdminUser && (
            <NavLink
              to="/adminController"
              style={({ isActive }) => ({
                padding: '0 14px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                fontSize: 13.5,
                fontWeight: 500,
                color: isActive ? '#E8EDF5' : '#9AA8B8',
                borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
                transition: 'all 0.2s',
                letterSpacing: '0.2px'
              })}
            >
              Admin Panel
            </NavLink>
          )}
        </div>
      </div>

      {/* RIGHT: Search, Notifications & User Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search Input (Pill design matching Image 1) */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#718096"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search problems, topics..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            style={{
              padding: '7px 14px 7px 34px',
              width: 240,
              borderRadius: 20,
              background: '#0C1118',
              border: '1px solid #26313D',
              color: '#E8EDF5',
              fontSize: 12.5,
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.width = '280px'
              e.target.style.borderColor = '#38BDF8'
            }}
            onBlur={(e) => {
              e.target.style.width = '240px'
              e.target.style.borderColor = '#26313D'
            }}
          />
        </div>

        {/* Notification Bell Icon */}
        <button
          title="Notifications"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9AA8B8',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E8EDF5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9AA8B8')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* User Auth controls */}
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* User Avatar Circle */}
            <div
              onClick={() => navigate('/profile')}
              title={user || 'User profile'}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#151D27',
                border: '1px solid #26313D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#E8EDF5',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38BDF8')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#26313D')}
            >
              {user ? user.charAt(0).toUpperCase() : 'H'}
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              style={{
                background: '#0C1118',
                border: '1px solid #26313D',
                color: '#E8EDF5',
                padding: '5px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FB7185'
                e.currentTarget.style.color = '#FB7185'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#26313D'
                e.currentTarget.style.color = '#E8EDF5'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/login"
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 500,
                color: '#E8EDF5',
                background: '#0C1118',
                border: '1px solid #26313D',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#080B10',
                background: '#38BDF8',
                border: 'none',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
