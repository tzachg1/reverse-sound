import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Mic, Square, Download, Share2, PlayCircle, CheckCircle } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import './LevelsPanel.css'

const LevelsPanel = ({ levels, onClose, onLevelRecorded, onLevelPlayed, onLevelSelected, completedLevels = new Set() }) => {
  const [recordingLevel, setRecordingLevel] = useState(null)
  const [playingLevel, setPlayingLevel] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const recorder = useAudioRecorder()
  const player = useAudioPlayer()
  const audioRef = useRef(null)

  const levelNames = {
    1: 'Recording 1',
    2: 'Recording 2',
    3: 'Recording 3',
    4: 'Recording 4',
    5: 'Recording 5'
  }

  const levelDescriptions = {
    1: 'Level 1 - First recording challenge',
    2: 'Level 2 - Second recording challenge',
    3: 'Level 3 - Third recording challenge',
    4: 'Level 4 - Fourth recording challenge',
    5: 'Level 5 - Fifth recording challenge'
  }

  const handleStartLevel = (level) => {
    if (onLevelSelected) {
      onLevelSelected(level)
    }
  }

  const handlePlay = (level) => {
    const audioBlob = levels[level]
    if (!audioBlob) return

    if (playingLevel === level) {
      // Stop playing
      player.stop()
      setPlayingLevel(null)
    } else {
      // Start playing
      if (playingLevel) {
        player.stop()
      }
      setPlayingLevel(level)
      player.play(audioBlob)
    }
  }

  const handleDownload = (level, audioBlob) => {
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `level-${level}-${levelNames[level].toLowerCase()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async (level, audioBlob) => {
    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: `Sound Reverse - Level ${level}`,
          text: `Check out my ${levelNames[level]} level recording!`,
          url: window.location.href
        }
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
        } else {
          throw new Error('Cannot share this data')
        }
      } else {
        const text = `Sound Reverse - Level ${level} (${levelNames[level]})\nTry the app at: ${window.location.href}`
        await navigator.clipboard.writeText(text)
        alert('Level info copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      const text = `Sound Reverse - Level ${level} (${levelNames[level]})`
      alert(`Share this: ${text}`)
    }
  }

  return (
    <motion.div
      className="levels-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="levels-header">
        <h2>Recording Levels</h2>
        <div className="header-actions">
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="levels-content">
        {[1, 2, 3, 4, 5].map((level) => {
          const hasRecording = levels[level] !== null
          const isRecording = recordingLevel === level
          const isPlaying = playingLevel === level
          const isCompleted = completedLevels.has(level)
          
          return (
            <motion.div
              key={level}
              className={`level-card ${hasRecording ? 'has-recording' : ''} ${isRecording ? 'recording' : ''} ${isCompleted ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: level * 0.1 }}
            >
              <div className="level-header">
                <div className="level-info">
                  <h3>Level {level}: {levelNames[level]}</h3>
                  <p>{levelDescriptions[level]}</p>
                </div>
                <div className="level-status">
                  {isCompleted && (
                    <span className="status-badge completed-badge">
                      <CheckCircle size={14} />
                      Completed
                    </span>
                  )}
                  {hasRecording && !isCompleted && (
                    <span className="status-badge">Recorded</span>
                  )}
                </div>
              </div>

              <div className="level-actions">
                <button
                  className="action-button start-level-button"
                  onClick={() => handleStartLevel(level)}
                  disabled={!hasRecording}
                >
                  <PlayCircle size={16} />
                  Start Level
                </button>

                {hasRecording && (
                  <>
                    <button
                      className={`action-button play-button ${isPlaying ? 'playing' : ''}`}
                      onClick={() => handlePlay(level)}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>

                    <button
                      className="action-button download-button"
                      onClick={() => handleDownload(level, levels[level])}
                    >
                      <Download size={16} />
                    </button>

                    <button
                      className="action-button share-button"
                      onClick={() => handleShare(level, levels[level])}
                    >
                      <Share2 size={16} />
                    </button>
                  </>
                )}
              </div>

              {isRecording && (
                <div className="level-recording-indicator">
                  <div className="pulse-ring"></div>
                  <div className="pulse-ring delay-1"></div>
                  <div className="pulse-ring delay-2"></div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default LevelsPanel
