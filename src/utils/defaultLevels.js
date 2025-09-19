// Utility to load different level recordings
import level1Audio from '../assets/level-1.webm'
import level2Audio from '../assets/level-2.webm'
import level3Audio from '../assets/level-3.webm'
import level4Audio from '../assets/level-4.webm'
import level5Audio from '../assets/level-5.webm'

const levelAudioFiles = {
  1: level1Audio,
  2: level2Audio,
  3: level3Audio,
  4: level4Audio,
  5: level5Audio
}

const fetchLevelAudio = async (levelAudio) => {
  try {
    const response = await fetch(levelAudio)
    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error('Error loading level audio:', error)
    return null
  }
}

export const initializeDefaultLevels = async () => {
  const levels = {}
  
  for (let level = 1; level <= 5; level++) {
    const audioFile = levelAudioFiles[level]
    if (audioFile) {
      const blob = await fetchLevelAudio(audioFile)
      levels[level] = blob
    } else {
      levels[level] = null
    }
  }

  return levels
}