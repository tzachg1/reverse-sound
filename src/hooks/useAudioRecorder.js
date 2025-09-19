import { useState, useRef, useCallback } from 'react'

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioChunks, setAudioChunks] = useState([])
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      })

      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      // Reset chunks array
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        setAudioChunks([...chunksRef.current])
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder
      setAudioChunks([])
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      return true
    } catch (error) {
      console.error('Error starting recording:', error)
      throw error
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRecording])

  const getRecordingBlob = useCallback(() => {
    if (audioChunks.length > 0) {
      return new Blob(audioChunks, { type: 'audio/webm;codecs=opus' })
    }
    return null
  }, [audioChunks])

  const reset = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRecording(false)
    setRecordingTime(0)
    setAudioChunks([])
    chunksRef.current = []
    mediaRecorderRef.current = null
  }, [])

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    getRecordingBlob,
    reset
  }
}
