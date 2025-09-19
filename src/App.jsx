import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Play, Pause, RotateCcw, Download, Share2, History, Trophy, RefreshCw } from 'lucide-react'
import AudioRecorder from './components/AudioRecorder'
import AudioPlayer from './components/AudioPlayer'
import HistoryPanel from './components/HistoryPanel'
import LevelsPanel from './components/LevelsPanel'
import ScoreDisplay from './components/ScoreDisplay'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { reverseAudioSimple } from './utils/simpleAudioUtils'
import { saveToHistory, getHistory, getFavorites, toggleFavorite as toggleFavoriteStorage, getCompletedLevels, addCompletedLevel } from './utils/storageUtils'
import { calculateSimilarity } from './utils/similarityUtils'
import { initializeDefaultLevels } from './utils/defaultLevels'
import userAvatarImage from './assets/user-avatar.jpg'
import './App.css'

const App = () => {
  const [currentStep, setCurrentStep] = useState('record') // 'record', 'play_reverse', 'record_imitation', 'play_imitation_reverse'
  const [originalRecording, setOriginalRecording] = useState(null)
  const [reversedOriginal, setReversedOriginal] = useState(null)
  const [imitationRecording, setImitationRecording] = useState(null)
  const [reversedImitation, setReversedImitation] = useState(null)
  const [similarityScore, setSimilarityScore] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [showLevels, setShowLevels] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [levels, setLevels] = useState({
    1: null, // Level 1 recording
    2: null, // Level 2 recording
    3: null, // Level 3 recording
    4: null, // Level 4 recording
    5: null  // Level 5 recording
  })
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [completedLevels, setCompletedLevels] = useState(new Set())
  const [isLevelSession, setIsLevelSession] = useState(false) // To track if current session is a level

  const recorder = useAudioRecorder()
  const player = useAudioPlayer()

  useEffect(() => {
    // Load history, favorites, completed levels, and default levels
    const loadAppData = async () => {
      const savedHistory = getHistory()
      const savedFavorites = getFavorites()
      const savedCompletedLevels = getCompletedLevels()
      const defaultLevels = await initializeDefaultLevels()
      
      setHistory(savedHistory)
      setFavorites(savedFavorites)
      setCompletedLevels(savedCompletedLevels)
      setLevels(defaultLevels)
    }
    
    loadAppData()
  }, [])

  const handleOriginalRecorded = async (audioBlob) => {
    setIsProcessing(true)
    try {
      setOriginalRecording(audioBlob)
      const reversed = await reverseAudioSimple(audioBlob)
      setReversedOriginal(reversed)
      setCurrentStep('play_reverse')
    } catch (error) {
      console.error('Error processing original recording:', error)
      alert('Failed to process audio: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImitationRecorded = async (audioBlob) => {
    setIsProcessing(true)
    try {
      setImitationRecording(audioBlob)
      const reversed = await reverseAudioSimple(audioBlob)
      setReversedImitation(reversed)
      
      // Calculate similarity score
      let calculatedScore = 0
      if (originalRecording) {
        calculatedScore = await calculateSimilarity(originalRecording, audioBlob)
        setSimilarityScore(calculatedScore)
      }
      
      setCurrentStep('play_imitation_reverse')
      
      // Save to history with the calculated score
      const historyEntry = {
        id: Date.now(),
        originalRecording,
        reversedOriginal,
        imitationRecording: audioBlob,
        reversedImitation: reversed,
        similarityScore: calculatedScore,
        timestamp: new Date().toISOString(),
        isFavorite: favorites.has(Date.now())
      }
      
      const newHistory = [...history, historyEntry]
      setHistory(newHistory)
      await saveToHistory(newHistory)
      
        // Mark level as completed if it was a level session
        if (selectedLevel) {
          const newCompletedLevels = addCompletedLevel(selectedLevel, completedLevels)
          setCompletedLevels(newCompletedLevels)
          setSelectedLevel(null) // Reset selected level
        }
    } catch (error) {
      console.error('Error processing imitation recording:', error)
      alert('Failed to process imitation audio: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlayReversedOriginal = () => {
    if (reversedOriginal) {
      player.play(reversedOriginal)
    }
  }

  const handlePlayReversedImitation = () => {
    if (reversedImitation) {
      player.play(reversedImitation)
    }
  }

  const resetSession = () => {
    const confirmed = window.confirm(
      'Are you sure you want to start over? This will clear your current recording and you\'ll need to record again.'
    )
    
    if (confirmed) {
      setCurrentStep('record')
      setOriginalRecording(null)
      setReversedOriginal(null)
      setImitationRecording(null)
      setReversedImitation(null)
      setSimilarityScore(null)
      setSelectedLevel(null)
      setIsLevelSession(false)
      player.stop()
      recorder.stop()
    }
  }

  const clearHistory = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all recording history? This action cannot be undone.'
    )
    
    if (confirmed) {
      setHistory([])
      await saveToHistory([])
    }
  }

  const toggleFavorite = (entryId) => {
    const newFavorites = toggleFavoriteStorage(entryId, favorites)
    setFavorites(newFavorites)
  }

  const handleLevelRecorded = (level, audioBlob) => {
    setLevels(prev => ({
      ...prev,
      [level]: audioBlob
    }))
  }

  const handleLevelPlayed = (level) => {
    // This can be used for any level-specific playback logic
    console.log(`Playing level ${level} recording`)
  }

  const handleLevelSelected = async (level) => {
    const levelRecording = levels[level]
    if (!levelRecording) return

    try {
      setIsProcessing(true)
      // Set the level recording as the original recording
      setOriginalRecording(levelRecording)
      
      // Reverse the level recording
      const reversed = await reverseAudioSimple(levelRecording)
      setReversedOriginal(reversed)
      
      // Set the selected level and move to play reverse step
      setSelectedLevel(level)
      setIsLevelSession(true) // Mark as level session
      setCurrentStep('play_reverse')
      setShowLevels(false) // Close the levels panel
    } catch (error) {
      console.error('Error processing level recording:', error)
      alert('Failed to process level recording: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }


  const getStepTitle = () => {
    switch (currentStep) {
      case 'record': return 'Record Your Audio'
      case 'play_reverse': return selectedLevel ? `Level ${selectedLevel} - Listen to Reversed Audio` : 'Listen to Reversed Audio'
      case 'record_imitation': return selectedLevel ? `Level ${selectedLevel} - Record Your Imitation` : 'Record Your Imitation'
      case 'play_imitation_reverse': return selectedLevel ? `Level ${selectedLevel} - Listen to Your Imitation Reversed` : 'Listen to Your Imitation Reversed'
      default: return 'Sound Reverse'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'record': return 'Record any audio you want to test your memory with'
      case 'play_reverse': return 'Listen to your recording played in reverse. Try to memorize it! You can start over if needed.'
      case 'record_imitation': return 'Now try to record the same audio you just heard in reverse. You can start over if needed.'
      case 'play_imitation_reverse': return 'Listen to your imitation played in reverse. How close did you get?'
      default: return ''
    }
  }

  return (
    <div className="app">
      <motion.div 
        className="app-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <RotateCcw className="title-icon" />
              Sound Reverse
            </h1>
            <p className="app-subtitle">Test your audio memory skills</p>
          </div>
          <div className="header-actions">
            <img 
              src={userAvatarImage} 
              alt="Recording Levels" 
              className="levels-avatar-button"
              onClick={() => setShowLevels(!showLevels)}
              title="Recording Levels"
              onError={(e) => {
                console.log('Image failed to load, using fallback')
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjkiIHI9IjMiIGZpbGw9IiM2NjdlZWEiLz4KPHBhdGggZD0iTTcgMjAuNUM3IDE2LjUgOS41IDE0IDEyIDE0czUgMi41IDUgNi41IiBzdHJva2U9IiM2NjdlZWEiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K"
              }}
              onLoad={() => console.log('Image loaded successfully')}
            />
            <button 
              className="icon-button"
              onClick={() => setShowHistory(!showHistory)}
              title="View History"
            >
              <History size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="step-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="step-header">
                <h2 className="step-title">{getStepTitle()}</h2>
                <p className="step-description">{getStepDescription()}</p>
              </div>

              <div className="step-content">
                {currentStep === 'record' && (
                  <AudioRecorder
                    onRecordingComplete={handleOriginalRecorded}
                    isProcessing={isProcessing}
                    label="Record Original Audio"
                  />
                )}

                {currentStep === 'play_reverse' && (
                  <div className="playback-section">
                    <AudioPlayer
                      audioBlob={reversedOriginal}
                      onPlay={handlePlayReversedOriginal}
                      isPlaying={player.isPlaying}
                      label="Reversed Original Audio"
                    />
                    
                    
                    <div className="step-actions">
                      <button 
                        className="primary-button"
                        onClick={() => setCurrentStep('record_imitation')}
                      >
                        Ready to Record Imitation
                      </button>
                      <button 
                        className="secondary-button start-over-button"
                        onClick={resetSession}
                        title="Start over with a new recording"
                      >
                        <RefreshCw size={16} />
                        Start Over
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'record_imitation' && (
                  <div className="recording-section">
                    <AudioRecorder
                      onRecordingComplete={handleImitationRecorded}
                      isProcessing={isProcessing}
                      label="Record Your Imitation"
                    />
                    <div className="step-actions">
                      <button 
                        className="secondary-button start-over-button"
                        onClick={resetSession}
                        title="Start over with a new recording"
                      >
                        <RefreshCw size={16} />
                        Start Over
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'play_imitation_reverse' && (
                  <div className="playback-section">
                    <AudioPlayer
                      audioBlob={reversedImitation}
                      onPlay={handlePlayReversedImitation}
                      isPlaying={player.isPlaying}
                      label="Your Imitation Reversed"
                    />
                    
        {similarityScore !== null && (
          <div className="score-section">
            <h3>Similarity Score</h3>
            <div className="score-display">
              <Trophy className="score-icon" />
              <span className="score-value">{similarityScore}%</span>
            </div>
            <div className="step-actions">
              <button 
                className="secondary-button"
                onClick={resetSession}
              >
                Start New Session
              </button>
              {isLevelSession && (
                <button 
                  className="cheat-button"
                  onClick={() => {
                    if (originalRecording) {
                      const audio = new Audio()
                      audio.src = URL.createObjectURL(originalRecording)
                      audio.play()
                    }
                  }}
                  title="Cheat: Hear Original Recording (Not Reversed)"
                >
                  👁️ Cheat: Original
                </button>
              )}
            </div>
          </div>
        )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <HistoryPanel
              history={history.map(entry => ({
                ...entry,
                isFavorite: favorites.has(entry.id)
              }))}
              onClose={() => setShowHistory(false)}
              onClearHistory={clearHistory}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </AnimatePresence>

        {/* Levels Panel */}
        <AnimatePresence>
          {showLevels && (
            <LevelsPanel
              levels={levels}
              onClose={() => setShowLevels(false)}
              onLevelRecorded={handleLevelRecorded}
              onLevelPlayed={handleLevelPlayed}
              onLevelSelected={handleLevelSelected}
              completedLevels={completedLevels}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default App
