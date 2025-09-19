import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Download, Share2, Calendar, Clock, Trophy, Heart, HeartOff } from 'lucide-react'
import './HistoryPanel.css'

const HistoryPanel = ({ history, onClose, onClearHistory, onToggleFavorite }) => {
  const [selectedEntry, setSelectedEntry] = useState(null)
  const audioRef = useRef(null)

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60'
    if (score >= 60) return '#f39c12'
    return '#e74c3c'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent!'
    if (score >= 60) return 'Good!'
    if (score >= 40) return 'Not bad'
    return 'Keep practicing!'
  }

  const handlePlay = (entry, type) => {
    console.log('=== HISTORY PLAYBACK DEBUG ===')
    console.log('Entry:', entry)
    console.log('Type:', type)
    console.log('Audio blob:', entry[type])
    console.log('Audio ref:', audioRef.current)
    
    const audioBlob = entry[type]
    if (audioBlob && audioRef.current) {
      console.log('Playing audio blob:', audioBlob.size, 'bytes')
      // Stop current playback
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      
      // Set new audio source
      const audioUrl = URL.createObjectURL(audioBlob)
      console.log('Created audio URL:', audioUrl)
      audioRef.current.src = audioUrl
      
      // Wait for the audio to load before playing
      audioRef.current.onloadeddata = () => {
        console.log('Audio loaded, attempting to play...')
        audioRef.current.play().then(() => {
          console.log('Audio started playing successfully')
        }).catch(error => {
          console.error('Error playing audio:', error)
        })
      }
      
      // Fallback: try to play immediately if already loaded
      if (audioRef.current.readyState >= 2) {
        audioRef.current.play().then(() => {
          console.log('Audio started playing successfully (immediate)')
        }).catch(error => {
          console.error('Error playing audio (immediate):', error)
        })
      }
    } else {
      console.error('Missing audio blob or audio ref:', { audioBlob, audioRef: audioRef.current })
    }
  }

  const handleDownload = async (entry, type) => {
    try {
      const audioBlob = entry[type]
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sound-reverse-${type}-${entry.id}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading audio:', error)
    }
  }

  const handleShare = async (entry) => {
    try {
      if (navigator.share && navigator.canShare) {
        // Create a simple text share for now since file sharing is complex
        const shareData = {
          title: 'Sound Reverse Recording',
          text: `Check out my audio imitation! Score: ${entry.similarityScore}% - ${getScoreLabel(entry.similarityScore)}`,
          url: window.location.href
        }
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
        } else {
          throw new Error('Cannot share this data')
        }
      } else {
        // Fallback: copy to clipboard
        const text = `Sound Reverse Recording - Score: ${entry.similarityScore}% - ${getScoreLabel(entry.similarityScore)}\nTry the app at: ${window.location.href}`
        await navigator.clipboard.writeText(text)
        alert('Recording info copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Final fallback: show share info
      const text = `Sound Reverse Recording - Score: ${entry.similarityScore}% - ${getScoreLabel(entry.similarityScore)}`
      alert(`Share this: ${text}`)
    }
  }

  if (history.length === 0) {
    return (
      <motion.div
        className="history-panel"
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
      >
        <div className="history-header">
          <h2>Recording History</h2>
          <div className="header-actions">
            <button 
              className="clear-button" 
              onClick={onClearHistory}
              title="Clear All History"
            >
              Clear All
            </button>
            <button className="close-button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="empty-history">
          <Trophy className="empty-icon" />
          <p>No recordings yet</p>
          <p className="empty-subtitle">Start recording to see your history here!</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="history-panel"
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      <div className="history-header">
        <h2>Recording History</h2>
        <div className="header-actions">
          <button 
            className="clear-button" 
            onClick={onClearHistory}
            title="Clear All History"
          >
            Clear All
          </button>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="history-content">
        {history.slice().reverse().map((entry) => {
          console.log('History entry:', entry.id, 'Score:', entry.similarityScore)
          return (
            <motion.div
            key={entry.id}
            className="history-entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="entry-header">
              <div className="entry-info">
                <div className="entry-date">
                  <Calendar size={14} />
                  {formatDate(entry.timestamp)}
                </div>
                <div className="entry-score">
                  <Trophy size={14} />
                  <span 
                    className="score-value"
                    style={{ color: getScoreColor(entry.similarityScore || 0) }}
                  >
                    {entry.similarityScore || 0}%
                  </span>
                  <span className="score-label">
                    {getScoreLabel(entry.similarityScore || 0)}
                  </span>
                </div>
              </div>
              <div className="entry-actions">
                <button
                  className={`action-button ${entry.isFavorite ? 'favorite' : ''}`}
                  onClick={() => onToggleFavorite && onToggleFavorite(entry.id)}
                  title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {entry.isFavorite ? <Heart size={16} fill="currentColor" /> : <HeartOff size={16} />}
                </button>
                <button
                  className="action-button"
                  onClick={() => handleShare(entry)}
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <div className="entry-audios">
              <div className="audio-item">
                <h4>Original Recording</h4>
                <div className="audio-controls">
                  <button
                    className="play-button"
                    onClick={() => handlePlay(entry, 'originalRecording')}
                    title="Play Original"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(entry, 'originalRecording')}
                    title="Download Original"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              <div className="audio-item">
                <h4>Reversed Original</h4>
                <div className="audio-controls">
                  <button
                    className="play-button"
                    onClick={() => handlePlay(entry, 'reversedOriginal')}
                    title="Play Reversed Original"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(entry, 'reversedOriginal')}
                    title="Download Reversed Original"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              <div className="audio-item">
                <h4>Your Imitation</h4>
                <div className="audio-controls">
                  <button
                    className="play-button"
                    onClick={() => handlePlay(entry, 'imitationRecording')}
                    title="Play Imitation"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(entry, 'imitationRecording')}
                    title="Download Imitation"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              <div className="audio-item">
                <h4>Reversed Imitation</h4>
                <div className="audio-controls">
                  <button
                    className="play-button"
                    onClick={() => handlePlay(entry, 'reversedImitation')}
                    title="Play Reversed Imitation"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(entry, 'reversedImitation')}
                    title="Download Reversed Imitation"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default HistoryPanel
