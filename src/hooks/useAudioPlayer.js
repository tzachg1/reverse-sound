import { useState, useRef, useCallback, useEffect } from 'react'

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  const play = useCallback((audioBlob) => {
    if (audioRef.current) {
      // Stop current playback
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [volume, isMuted])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const setVolumeLevel = useCallback((newVolume) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume
    }
  }, [isMuted, volume])

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    stop,
    setVolume: setVolumeLevel,
    toggleMute,
    seek,
    audioRef
  }
}
