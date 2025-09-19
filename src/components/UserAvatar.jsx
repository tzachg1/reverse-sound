import React from 'react'
import './UserAvatar.css'

const UserAvatar = ({ size = 20, className = '' }) => {
  return (
    <div 
      className={`user-avatar ${className}`}
      style={{ width: size, height: size }}
    >
      {/* This will be replaced with your actual image */}
      <div className="avatar-placeholder">
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#667eea"/>
          <circle cx="12" cy="9" r="3" fill="white"/>
          <path d="M7 20.5C7 16.5 9.5 14 12 14s5 2.5 5 6.5" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
      </div>
    </div>
  )
}

export default UserAvatar
