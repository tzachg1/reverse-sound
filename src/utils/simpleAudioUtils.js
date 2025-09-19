// Simple and reliable audio reversal utilities

export const reverseAudioSimple = async (audioBlob) => {
  console.log('=== SIMPLE AUDIO REVERSAL ===')
  console.log('Input blob:', {
    size: audioBlob.size,
    type: audioBlob.type
  })
  
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    console.log('Audio context created, sample rate:', audioContext.sampleRate)
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes')
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    console.log('Audio buffer decoded successfully:')
    console.log('- Channels:', audioBuffer.numberOfChannels)
    console.log('- Length:', audioBuffer.length, 'samples')
    console.log('- Sample rate:', audioBuffer.sampleRate)
    console.log('- Duration:', audioBuffer.duration, 'seconds')
    
    // Verify we have actual audio data
    if (audioBuffer.length === 0) {
      throw new Error('Audio buffer is empty')
    }
    
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
      
      console.log(`Reversing channel ${channel}: ${originalData.length} samples`)
      
      // Reverse the audio data
      for (let i = 0; i < originalData.length; i++) {
        reversedData[i] = originalData[originalData.length - 1 - i]
      }
    }
    
    console.log('Audio reversal completed, creating WAV file...')
    
    // Convert to WAV format (most reliable)
    const wavBlob = await audioBufferToWAV(reversedBuffer)
    
    console.log('WAV file created:', wavBlob.size, 'bytes')
    console.log('=== REVERSAL COMPLETE ===')
    
    return wavBlob
    
  } catch (error) {
    console.error('Error in simple audio reversal:', error)
    throw error
  }
}

// Convert AudioBuffer to WAV format
const audioBufferToWAV = (audioBuffer) => {
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const length = audioBuffer.length
  
  console.log('Converting to WAV:')
  console.log('- Channels:', numberOfChannels)
  console.log('- Sample rate:', sampleRate)
  console.log('- Length:', length, 'samples')
  console.log('- Duration:', length / sampleRate, 'seconds')
  
  // Calculate buffer size
  const bufferSize = 44 + length * numberOfChannels * 2
  const buffer = new ArrayBuffer(bufferSize)
  const view = new DataView(buffer)
  
  // WAV file header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  // RIFF header
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * numberOfChannels * 2, true)
  writeString(8, 'WAVE')
  
  // Format chunk
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // Chunk size
  view.setUint16(20, 1, true)  // Audio format (PCM)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numberOfChannels * 2, true) // Byte rate
  view.setUint16(32, numberOfChannels * 2, true) // Block align
  view.setUint16(34, 16, true) // Bits per sample
  
  // Data chunk
  writeString(36, 'data')
  view.setUint32(40, length * numberOfChannels * 2, true)
  
  // Convert audio data to 16-bit PCM
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset, intSample, true)
      offset += 2
    }
  }
  
  console.log('WAV conversion complete, final size:', buffer.byteLength, 'bytes')
  return new Blob([buffer], { type: 'audio/wav' })
}

// Test function to verify audio reversal
export const testAudioReversal = async (audioBlob) => {
  console.log('=== TESTING AUDIO REVERSAL ===')
  
  try {
    // Get original duration
    const originalDuration = await getAudioDuration(audioBlob)
    console.log('Original duration:', originalDuration, 'seconds')
    
    // Reverse the audio
    const reversedBlob = await reverseAudioSimple(audioBlob)
    console.log('Reversed blob size:', reversedBlob.size, 'bytes')
    
    // Get reversed duration
    const reversedDuration = await getAudioDuration(reversedBlob)
    console.log('Reversed duration:', reversedDuration, 'seconds')
    
    // Verify durations match
    if (Math.abs(originalDuration - reversedDuration) > 0.1) {
      console.warn('Duration mismatch! Original:', originalDuration, 'Reversed:', reversedDuration)
    } else {
      console.log('✅ Duration verification passed')
    }
    
    return reversedBlob
    
  } catch (error) {
    console.error('Test failed:', error)
    throw error
  }
}

// Get audio duration
const getAudioDuration = (audioBlob) => {
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
