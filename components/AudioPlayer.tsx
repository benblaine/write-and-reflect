import { useRef, useEffect, useCallback } from 'react'
import { MeditationAudio } from '../lib/types'

interface AudioPlayerProps {
  audio: MeditationAudio
  onEnded: () => void
  autoPlay: boolean
}

export default function AudioPlayer({ audio, onEnded, autoPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleEnded = useCallback(() => {
    onEnded()
  }, [onEnded])

  useEffect(() => {
    const currentAudio = audioRef.current
    if (currentAudio) {
      currentAudio.addEventListener('ended', handleEnded)
    }
    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('ended', handleEnded)
      }
    }
  }, [handleEnded])

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play()
    }
  }, [autoPlay])

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">{audio.title}</h3>
      <audio ref={audioRef} src={audio.url} controls>
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}