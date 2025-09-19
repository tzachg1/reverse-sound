// Audio similarity calculation utilities

export const calculateSimilarity = async (originalBlob, imitationBlob) => {
  try {
    console.log('=== CALCULATING SIMILARITY ===')
    console.log('Original blob size:', originalBlob.size, 'bytes')
    console.log('Imitation blob size:', imitationBlob.size, 'bytes')
    
    // Convert blobs to audio buffers
    const originalBuffer = await blobToAudioBuffer(originalBlob)
    const imitationBuffer = await blobToAudioBuffer(imitationBlob)
    
    console.log('Original buffer length:', originalBuffer.length, 'samples')
    console.log('Imitation buffer length:', imitationBuffer.length, 'samples')
    
    // Get the first channel data for comparison
    const originalData = originalBuffer.getChannelData(0)
    const imitationData = imitationBuffer.getChannelData(0)
    
    // Calculate basic similarity metrics
    const durationSimilarity = calculateDurationSimilarity(originalData, imitationData)
    const amplitudeSimilarity = calculateSimpleAmplitudeSimilarity(originalData, imitationData)
    const patternSimilarity = calculatePatternSimilarity(originalData, imitationData)
    
    console.log('Duration similarity:', durationSimilarity)
    console.log('Amplitude similarity:', amplitudeSimilarity)
    console.log('Pattern similarity:', patternSimilarity)
    
    // Weighted combination
    const overallSimilarity = 
      durationSimilarity * 0.3 +
      amplitudeSimilarity * 0.4 +
      patternSimilarity * 0.3
    
    const finalScore = Math.max(0, Math.min(100, Math.round(overallSimilarity * 100)))
    console.log('Final similarity score:', finalScore, '%')
    
    return finalScore
  } catch (error) {
    console.error('Error calculating similarity:', error)
    return 0
  }
}

// Convert audio blob to AudioBuffer
const blobToAudioBuffer = async (blob) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  audioContext.close()
  return audioBuffer
}

// Calculate duration similarity (how close the lengths are)
const calculateDurationSimilarity = (original, imitation) => {
  const originalLength = original.length
  const imitationLength = imitation.length
  
  if (originalLength === 0 || imitationLength === 0) return 0
  
  const ratio = Math.min(originalLength, imitationLength) / Math.max(originalLength, imitationLength)
  return ratio
}

// Calculate simple amplitude similarity
const calculateSimpleAmplitudeSimilarity = (original, imitation) => {
  const minLength = Math.min(original.length, imitation.length)
  if (minLength === 0) return 0
  
  // Calculate RMS for both signals
  const originalRMS = calculateRMS(original.slice(0, minLength))
  const imitationRMS = calculateRMS(imitation.slice(0, minLength))
  
  if (originalRMS === 0 && imitationRMS === 0) return 1
  if (originalRMS === 0 || imitationRMS === 0) return 0
  
  const ratio = Math.min(originalRMS, imitationRMS) / Math.max(originalRMS, imitationRMS)
  return ratio
}

// Calculate pattern similarity (energy patterns over time)
const calculatePatternSimilarity = (original, imitation) => {
  const minLength = Math.min(original.length, imitation.length)
  if (minLength === 0) return 0
  
  // Divide into segments and calculate energy for each
  const segmentSize = Math.max(1024, Math.floor(minLength / 20)) // At least 20 segments
  const originalEnergies = []
  const imitationEnergies = []
  
  for (let i = 0; i < minLength; i += segmentSize) {
    const end = Math.min(i + segmentSize, minLength)
    const originalSegment = original.slice(i, end)
    const imitationSegment = imitation.slice(i, end)
    
    originalEnergies.push(calculateRMS(originalSegment))
    imitationEnergies.push(calculateRMS(imitationSegment))
  }
  
  // Calculate correlation between energy patterns
  return calculateCorrelation(originalEnergies, imitationEnergies)
}

// Calculate RMS (Root Mean Square) for a signal
const calculateRMS = (signal) => {
  if (signal.length === 0) return 0
  
  const sumSquares = signal.reduce((sum, sample) => sum + sample * sample, 0)
  return Math.sqrt(sumSquares / signal.length)
}


// Calculate correlation coefficient
const calculateCorrelation = (a, b) => {
  const minLength = Math.min(a.length, b.length)
  if (minLength === 0) return 0
  
  const meanA = a.slice(0, minLength).reduce((sum, val) => sum + val, 0) / minLength
  const meanB = b.slice(0, minLength).reduce((sum, val) => sum + val, 0) / minLength
  
  let numerator = 0
  let sumSquaredDiffA = 0
  let sumSquaredDiffB = 0
  
  for (let i = 0; i < minLength; i++) {
    const diffA = a[i] - meanA
    const diffB = b[i] - meanB
    numerator += diffA * diffB
    sumSquaredDiffA += diffA * diffA
    sumSquaredDiffB += diffB * diffB
  }
  
  if (sumSquaredDiffA === 0 || sumSquaredDiffB === 0) return 0
  
  return numerator / Math.sqrt(sumSquaredDiffA * sumSquaredDiffB)
}

