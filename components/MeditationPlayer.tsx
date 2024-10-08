import { useState, useEffect, useRef } from 'react'
import AudioPlayer from './AudioPlayer'
import { MeditationAudio } from '../lib/types'

interface MeditationPlayerProps {
  audioFiles: MeditationAudio[]
}

export default function MeditationPlayer({ audioFiles }: MeditationPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState(0)
  const [backgroundVolume, setBackgroundVolume] = useState(0.3)
  const backgroundAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (currentIndex >= audioFiles.length) {
      setIsPlaying(false)
      return
    }

    if (isPlaying && !isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(true)
        const pauseDuration = 120 // 2 minutes pause
        setPauseTimeRemaining(pauseDuration)
        const intervalId = setInterval(() => {
          setPauseTimeRemaining((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(intervalId)
              setIsPaused(false)
              return 0
            }
            return prevTime - 1
          })
        }, 1000)
      }, 100) // Short delay to ensure audio starts playing before pause

      return () => clearTimeout(timer)
    }
  }, [currentIndex, isPlaying, isPaused, audioFiles.length])

  useEffect(() => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = backgroundVolume
    }
  }, [backgroundVolume])

  const handleAudioEnded = () => {
    setCurrentIndex(prevIndex => prevIndex + 1)
  }

  const handleStart = () => {
    setIsPlaying(true)
    setCurrentIndex(0)
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.play()
    }
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
    setIsPaused(false)
    setPauseTimeRemaining(0)
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause()
      backgroundAudioRef.current.currentTime = 0
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundVolume(parseFloat(e.target.value))
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={handleStart}
          disabled={isPlaying}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Start Meditation
        </button>
        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Stop Meditation
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="background-volume" className="block text-sm font-medium text-gray-700">
          Background Music Volume
        </label>
        <input
          type="range"
          id="background-volume"
          min="0"
          max="1"
          step="0.1"
          value={backgroundVolume}
          onChange={handleVolumeChange}
          className="w-full"
        />
      </div>
      <audio ref={backgroundAudioRef} src="/background.mp3" loop />
      {audioFiles.map((audio, index) => (
        <AudioPlayer
          key={index}
          audio={audio}
          onEnded={handleAudioEnded}
          autoPlay={isPlaying && currentIndex === index && !isPaused}
        />
      ))}
      {isPlaying && isPaused && (
        <div className="mt-4">
          <div className="text-lg font-medium mb-2">
            Paused for reflection. Next guidance will begin in {pauseTimeRemaining} seconds.
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
              style={{ width: `${(pauseTimeRemaining / 120) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      {!isPlaying && currentIndex >= audioFiles.length && (
        <div className="text-lg font-medium mt-4">
          Meditation complete. Take a moment to reflect on your experience.
        </div>
      )}
    </div>
  )
}