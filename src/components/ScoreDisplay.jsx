import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Target } from 'lucide-react'
import './ScoreDisplay.css'

const ScoreDisplay = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60'
    if (score >= 60) return '#f39c12'
    if (score >= 40) return '#e67e22'
    return '#e74c3c'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return <Trophy className="score-icon" />
    if (score >= 60) return <Star className="score-icon" />
    return <Target className="score-icon" />
  }

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Outstanding! Perfect imitation!'
    if (score >= 80) return 'Excellent! You nailed it!'
    if (score >= 70) return 'Great job! Very close!'
    if (score >= 60) return 'Good! Pretty close!'
    if (score >= 50) return 'Not bad! Keep practicing!'
    if (score >= 40) return 'Getting there! Try again!'
    return 'Keep practicing! You can do better!'
  }

  const getScoreLevel = (score) => {
    if (score >= 80) return 'Expert'
    if (score >= 60) return 'Advanced'
    if (score >= 40) return 'Intermediate'
    return 'Beginner'
  }

  return (
    <motion.div
      className="score-display"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="score-header">
        {getScoreIcon(score)}
        <span className="score-level">{getScoreLevel(score)}</span>
      </div>
      
      <div className="score-value" style={{ color: getScoreColor(score) }}>
        {score}%
      </div>
      
      <div className="score-message">
        {getScoreMessage(score)}
      </div>
      
      <div className="score-bar">
        <motion.div
          className="score-fill"
          style={{ 
            backgroundColor: getScoreColor(score),
            width: `${score}%`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

export default ScoreDisplay
