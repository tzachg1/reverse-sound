// Audio utility functions for reversing audio

export const reverseAudio = async (audioBlob) => {
  console.log('Starting audio reversal process...')
  console.log('Input blob size:', audioBlob.size, 'bytes')
  console.log('Input blob type:', audioBlob.type)
  
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    console.log('Audio context created, sample rate:', audioContext.sampleRate)
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes')
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    console.log('Audio buffer decoded:')
    console.log('- Channels:', audioBuffer.numberOfChannels)
    console.log('- Length:', audioBuffer.length, 'samples')
    console.log('- Sample rate:', audioBuffer.sampleRate)
    console.log('- Duration:', audioBuffer.duration, 'seconds')
    
    // Create a new audio buffer with the same properties
    const reversedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )
    
    console.log('Created reversed buffer with same properties')
    
    // Reverse each channel
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel)
      const reversedData = reversedBuffer.getChannelData(channel)
      
      console.log(`Reversing channel ${channel}, ${originalData.length} samples`)
      
      // Reverse the audio data
      for (let i = 0; i < originalData.length; i++) {
        reversedData[i] = originalData[originalData.length - 1 - i]
      }
    }
    
    console.log('Audio reversal completed, converting to blob...')
    
    // Convert back to blob using the original format
    const reversedBlob = await audioBufferToBlob(reversedBuffer, audioBlob.type)
    
    console.log('Reversed blob created:', reversedBlob.size, 'bytes')
    console.log('Reversed blob type:', reversedBlob.type)
    
    // Don't close the context immediately - let it be garbage collected
    // audioContext.close()
    
    return reversedBlob
  } catch (error) {
    console.error('Error reversing audio:', error)
    console.error('Error details:', error.message)
    throw error
  }
}

// Convert AudioBuffer to Blob
const audioBufferToBlob = async (audioBuffer, outputType = 'audio/wav') => {
  console.log('Converting AudioBuffer to blob, output type:', outputType)
  
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const length = audioBuffer.length
  
  console.log('AudioBuffer properties:')
  console.log('- Channels:', numberOfChannels)
  console.log('- Sample rate:', sampleRate)
  console.log('- Length:', length, 'samples')
  console.log('- Duration:', length / sampleRate, 'seconds')
  
  // For WebM format, we need to use a different approach
  if (outputType.includes('webm')) {
    return await audioBufferToWebM(audioBuffer)
  }
  
  // For WAV format, create a proper WAV file
  const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
  const view = new DataView(buffer)
  
  // WAV file header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * numberOfChannels * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numberOfChannels * 2, true)
  view.setUint16(32, numberOfChannels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * numberOfChannels * 2, true)
  
  // Convert audio data to 16-bit PCM
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
  }
  
  console.log('WAV file created, size:', buffer.byteLength, 'bytes')
  return new Blob([buffer], { type: 'audio/wav' })
}

// Convert AudioBuffer to WebM using MediaRecorder
const audioBufferToWebM = async (audioBuffer) => {
  console.log('Converting AudioBuffer to WebM...')
  
  try {
    // Create a new AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Create a buffer source
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    
    // Create a MediaStreamDestination
    const destination = audioContext.createMediaStreamDestination()
    source.connect(destination)
    
    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: 'audio/webm;codecs=opus'
    })
    
    const chunks = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
        console.log('WebM chunk received:', event.data.size, 'bytes')
      }
    }
    
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        console.log('WebM blob created:', blob.size, 'bytes')
        audioContext.close()
        resolve(blob)
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        audioContext.close()
        reject(event.error)
      }
      
      // Start recording
      mediaRecorder.start()
      source.start(0)
      
      // Stop after the audio duration
      setTimeout(() => {
        mediaRecorder.stop()
        source.stop()
      }, audioBuffer.duration * 1000 + 100) // Add small buffer
    })
  } catch (error) {
    console.error('Error converting to WebM:', error)
    // Fallback to WAV
    return await audioBufferToBlob(audioBuffer, 'audio/wav')
  }
}

// Simple fallback method that preserves original format
export const reverseAudioSimple = async (audioBlob) => {
  console.log('Using simple audio reversal method...')
  
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    console.log('Simple reversal - Audio buffer:', {
      channels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration
    })
    
    // Create a new audio buffer with the same properties
    const reversedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )
    
    // Reverse each channel
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel)
      const reversedData = reversedBuffer.getChannelData(channel)
      
      // Reverse the audio data
      for (let i = 0; i < originalData.length; i++) {
        reversedData[i] = originalData[originalData.length - 1 - i]
      }
    }
    
    // Convert back to blob - try to preserve original format
    let reversedBlob
    try {
      // Try to create WebM first
      reversedBlob = await audioBufferToWebM(reversedBuffer)
    } catch (error) {
      console.log('WebM conversion failed, falling back to WAV:', error)
      reversedBlob = await audioBufferToBlob(reversedBuffer, 'audio/wav')
    }
    
    console.log('Simple reversal completed:', reversedBlob.size, 'bytes')
    return reversedBlob
    
  } catch (error) {
    console.error('Error in simple audio reversal:', error)
    throw error
  }
}

// Alternative method using Web Audio API with OfflineAudioContext
export const reverseAudioOffline = async (audioBlob) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Create offline context
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )
    
    // Create buffer source
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    
    // Create gain node for volume control
    const gainNode = offlineContext.createGain()
    gainNode.gain.value = 1.0
    
    // Connect nodes
    source.connect(gainNode)
    gainNode.connect(offlineContext.destination)
    
    // Start playback
    source.start(0)
    
    // Render audio
    const renderedBuffer = await offlineContext.startRendering()
    
    // Reverse the rendered buffer
    const reversedBuffer = audioContext.createBuffer(
      renderedBuffer.numberOfChannels,
      renderedBuffer.length,
      renderedBuffer.sampleRate
    )
    
    for (let channel = 0; channel < renderedBuffer.numberOfChannels; channel++) {
      const originalData = renderedBuffer.getChannelData(channel)
      const reversedData = reversedBuffer.getChannelData(channel)
      
      for (let i = 0; i < originalData.length; i++) {
        reversedData[i] = originalData[originalData.length - 1 - i]
      }
    }
    
    // Convert to blob
    const reversedBlob = await audioBufferToBlob(reversedBuffer)
    
    // Clean up
    audioContext.close()
    offlineContext.close()
    
    return reversedBlob
  } catch (error) {
    console.error('Error reversing audio (offline):', error)
    throw error
  }
}

// Utility function to get audio duration
export const getAudioDuration = (audioBlob) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(audioBlob)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio'))
    })
    
    audio.src = url
  })
}

// Utility function to normalize audio volume
export const normalizeAudio = async (audioBlob) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Find the maximum amplitude
    let maxAmplitude = 0
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel)
      for (let i = 0; i < channelData.length; i++) {
        maxAmplitude = Math.max(maxAmplitude, Math.abs(channelData[i]))
      }
    }
    
    // Normalize if needed
    if (maxAmplitude > 0) {
      const normalizedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      )
      
      const normalizeFactor = 0.95 / maxAmplitude
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel)
        const normalizedData = normalizedBuffer.getChannelData(channel)
        
        for (let i = 0; i < originalData.length; i++) {
          normalizedData[i] = originalData[i] * normalizeFactor
        }
      }
      
      const normalizedBlob = await audioBufferToBlob(normalizedBuffer)
      audioContext.close()
      return normalizedBlob
    }
    
    audioContext.close()
    return audioBlob
  } catch (error) {
    console.error('Error normalizing audio:', error)
    return audioBlob // Return original if normalization fails
  }
}
