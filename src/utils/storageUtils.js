// Local storage utilities for managing recording history

const STORAGE_KEY = 'soundReverseHistory'
const FAVORITES_KEY = 'soundReverseFavorites'
const COMPLETED_LEVELS_KEY = 'soundReverseCompletedLevels'
const MAX_HISTORY_ITEMS = 50 // Limit history to prevent storage bloat

// Save history to localStorage
export const saveToHistory = async (history) => {
  try {
    // Limit history size
    const limitedHistory = history.slice(-MAX_HISTORY_ITEMS)
    
    // Convert blobs to base64 for storage
    const serializedHistory = await Promise.all(limitedHistory.map(async (entry) => ({
      ...entry,
      originalRecording: await blobToBase64(entry.originalRecording),
      reversedOriginal: await blobToBase64(entry.reversedOriginal),
      imitationRecording: await blobToBase64(entry.imitationRecording),
      reversedImitation: await blobToBase64(entry.reversedImitation)
    })))
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedHistory))
    return true
  } catch (error) {
    console.error('Error saving to history:', error)
    return false
  }
}

// Load history from localStorage
export const getHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const serializedHistory = JSON.parse(stored)
    
    // Convert base64 back to blobs
    return serializedHistory.map(entry => ({
      ...entry,
      originalRecording: base64ToBlob(entry.originalRecording),
      reversedOriginal: base64ToBlob(entry.reversedOriginal),
      imitationRecording: base64ToBlob(entry.imitationRecording),
      reversedImitation: base64ToBlob(entry.reversedImitation)
    }))
  } catch (error) {
    console.error('Error loading history:', error)
    return []
  }
}

// Add single entry to history
export const addToHistory = async (entry) => {
  try {
    const currentHistory = getHistory()
    const newHistory = [...currentHistory, entry]
    return await saveToHistory(newHistory)
  } catch (error) {
    console.error('Error adding to history:', error)
    return false
  }
}

// Remove entry from history
export const removeFromHistory = (entryId) => {
  try {
    const currentHistory = getHistory()
    const filteredHistory = currentHistory.filter(entry => entry.id !== entryId)
    return saveToHistory(filteredHistory)
  } catch (error) {
    console.error('Error removing from history:', error)
    return false
  }
}

// Clear all history
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing history:', error)
    return false
  }
}

// Get history statistics
export const getHistoryStats = () => {
  try {
    const history = getHistory()
    
    if (history.length === 0) {
      return {
        totalRecordings: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalStorageUsed: 0
      }
    }
    
    const scores = history.map(entry => entry.similarityScore).filter(score => score !== null)
    const totalStorage = history.reduce((total, entry) => {
      return total + 
        (entry.originalRecording?.size || 0) +
        (entry.reversedOriginal?.size || 0) +
        (entry.imitationRecording?.size || 0) +
        (entry.reversedImitation?.size || 0)
    }, 0)
    
    return {
      totalRecordings: history.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0,
      totalStorageUsed: totalStorage
    }
  } catch (error) {
    console.error('Error getting history stats:', error)
    return {
      totalRecordings: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalStorageUsed: 0
    }
  }
}

// Export history as JSON
export const exportHistory = () => {
  try {
    const history = getHistory()
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalRecordings: history.length,
      recordings: history.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        similarityScore: entry.similarityScore,
        // Note: Audio blobs are not included in JSON export
        // They would need to be exported separately as files
      }))
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    // Create download link
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sound-reverse-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error exporting history:', error)
    return false
  }
}

// Import history from JSON
export const importHistory = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          
          if (importData.version !== '1.0') {
            reject(new Error('Unsupported file format version'))
            return
          }
          
          // Note: This only imports metadata, not the actual audio files
          // Audio files would need to be imported separately
          const importedHistory = importData.recordings.map(entry => ({
            ...entry,
            originalRecording: null,
            reversedOriginal: null,
            imitationRecording: null,
            reversedImitation: null
          }))
          
          const currentHistory = getHistory()
          const mergedHistory = [...currentHistory, ...importedHistory]
          saveToHistory(mergedHistory)
          
          resolve(importedHistory.length)
        } catch (parseError) {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    } catch (error) {
      reject(error)
    }
  })
}

// Convert blob to base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Convert base64 to blob
const base64ToBlob = (base64) => {
  try {
    const [header, data] = base64.split(',')
    const mimeType = header.match(/data:([^;]+)/)[1]
    const binaryString = atob(data)
    const bytes = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return new Blob([bytes], { type: mimeType })
  } catch (error) {
    console.error('Error converting base64 to blob:', error)
    return null
  }
}

// Check if storage is available
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

// Get storage usage info
export const getStorageInfo = () => {
  try {
    if (!isStorageAvailable()) {
      return { available: false, used: 0, total: 0 }
    }
    
    let used = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length
      }
    }
    
    // Estimate total available storage (5MB is a common limit)
    const total = 5 * 1024 * 1024 // 5MB in bytes
    
    return {
      available: true,
      used: used,
      total: total,
      percentage: Math.round((used / total) * 100)
    }
  } catch (error) {
    console.error('Error getting storage info:', error)
    return { available: false, used: 0, total: 0 }
  }
}

// Favorites management
export const saveFavorites = (favorites) => {
  try {
    const favoritesArray = Array.from(favorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray))
    return true
  } catch (error) {
    console.error('Error saving favorites:', error)
    return false
  }
}

export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return new Set()
    
    const favoritesArray = JSON.parse(stored)
    return new Set(favoritesArray)
  } catch (error) {
    console.error('Error loading favorites:', error)
    return new Set()
  }
}

export const toggleFavorite = (entryId, currentFavorites) => {
  try {
    const newFavorites = new Set(currentFavorites)
    if (newFavorites.has(entryId)) {
      newFavorites.delete(entryId)
    } else {
      newFavorites.add(entryId)
    }
    
    saveFavorites(newFavorites)
    return newFavorites
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return currentFavorites
  }
}

// Completed levels management
export const saveCompletedLevels = (completedLevels) => {
  try {
    const levelsArray = Array.from(completedLevels)
    localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(levelsArray))
    return true
  } catch (error) {
    console.error('Error saving completed levels:', error)
    return false
  }
}

export const getCompletedLevels = () => {
  try {
    const stored = localStorage.getItem(COMPLETED_LEVELS_KEY)
    if (!stored) return new Set()
    
    const levelsArray = JSON.parse(stored)
    return new Set(levelsArray)
  } catch (error) {
    console.error('Error loading completed levels:', error)
    return new Set()
  }
}

export const addCompletedLevel = (level, currentCompletedLevels) => {
  try {
    const newCompletedLevels = new Set(currentCompletedLevels)
    newCompletedLevels.add(level)
    
    saveCompletedLevels(newCompletedLevels)
    return newCompletedLevels
  } catch (error) {
    console.error('Error adding completed level:', error)
    return currentCompletedLevels
  }
}
