import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import './AudioPlayer.css'

const AudioPlayer = ({ audioBlob, onPlay, isPlaying, label }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isReady, setIsReady] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current && audioBlob) {
      const audio = audioRef.current
      
      // Reset state when new audio is loaded
      setIsReady(false)
      setCurrentTime(0)
      setDuration(0)
      
      // Update the audio source when audioBlob changes
      const audioUrl = URL.createObjectURL(audioBlob)
      audio.src = audioUrl
      
      
      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => {
        setDuration(audio.duration)
        setIsReady(true)
      }
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('play', () => {})
      audio.addEventListener('pause', () => {})
      audio.addEventListener('ended', () => {
        if (onPlay) onPlay()
      })
      audio.addEventListener('error', (e) => {
        console.error('AudioPlayer: Audio error:', e)
      })
      
      // Clean up the URL when component unmounts or audioBlob changes
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
        audio.removeEventListener('play', () => {})
        audio.removeEventListener('pause', () => {})
        audio.removeEventListener('ended', () => onPlay && onPlay())
        audio.removeEventListener('error', () => {})
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioBlob, onPlay, label])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(error => {
          console.error('AudioPlayer: Error playing audio:', error)
        })
      }
    }
    if (onPlay) onPlay()
  }

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!audioBlob) {
    return (
      <div className="audio-player">
        <div className="player-placeholder">
          <RotateCcw className="placeholder-icon" />
          <p>No audio available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        preload="metadata"
      />
      
      <div className="player-header">
        <h3 className="player-label">{label}</h3>
        <div className="player-controls">
          <button
            className="control-button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      <div className="player-main">
        <motion.button
          className="play-button"
          onClick={handlePlayPause}
          disabled={!isReady}
          whileHover={{ scale: isReady ? 1.05 : 1 }}
          whileTap={{ scale: isReady ? 0.95 : 1 }}
          style={{ opacity: isReady ? 1 : 0.5 }}
        >
          {isPlaying ? (
            <Pause className="play-icon" />
          ) : (
            <Play className="play-icon" />
          )}
        </motion.button>

        <div className="progress-section">
          <div className="time-display">
            {formatTime(currentTime)}
          </div>
          
          <div className="progress-bar" onClick={handleSeek}>
            <div 
              className="progress-fill"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          <div className="time-display">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      <div className="player-status">
        {!isReady ? (
          <span className="status-text processing">Loading audio...</span>
        ) : isPlaying ? (
          <span className="status-text playing">Playing... Click to pause</span>
        ) : null}
      </div>

      <div className="volume-section">
        <Volume2 className="volume-icon" size={16} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <span className="volume-value">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  )
}

export default AudioPlayer
