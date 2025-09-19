import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Loader2 } from 'lucide-react'
import './AudioRecorder.css'

const AudioRecorder = ({ onRecordingComplete, isProcessing, label }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [chunkCount, setChunkCount] = useState(0)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      })
      
      // Simple MIME type selection
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      }
      
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })
      
      // Reset chunks array
      chunksRef.current = []
      setChunkCount(0)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          setChunkCount(chunksRef.current.length)
        }
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        alert('Recording error: ' + event.error.message)
      }

      recorder.start()
      
      setMediaRecorder(recorder)
      setAudioChunks([])
      setIsRecording(true)
      setRecordingTime(0)
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      // Request any remaining data
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.requestData()
      }
      
      // Small delay to ensure data is collected
      setTimeout(() => {
        mediaRecorder.stop()
      }, 100)
      
      setIsRecording(false)
      clearInterval(intervalRef.current)
      setChunkCount(0)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
    }
  }, [mediaRecorder])

  return (
    <div className="audio-recorder">
      <div className="recorder-header">
        <h3 className="recorder-label">{label}</h3>
        {recordingTime > 0 && (
          <div className="recording-time">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      <div className="recorder-controls">
        <div className="button-container">
          <motion.button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
          >
            {isProcessing ? (
              <Loader2 className="button-icon spinning" />
            ) : isRecording ? (
              <Square className="button-icon" />
            ) : (
              <Mic className="button-icon" />
            )}
          </motion.button>
          
          {isRecording && (
            <motion.div
              className="recording-indicator"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
              <div className="pulse-ring delay-2"></div>
            </motion.div>
          )}
        </div>

        <div className="recorder-status">
          {isProcessing ? (
            <span className="status-text processing">Processing...</span>
          ) : isRecording ? (
            <span className="status-text recording">Recording... Click to stop</span>
          ) : (
            <span className="status-text ready">Click to start recording</span>
          )}
        </div>
      </div>

    </div>
  )
}

export default AudioRecorder
