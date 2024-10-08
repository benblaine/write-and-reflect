import { useRef, useEffect } from 'react'
import { MeditationAudio } from '../lib/types'

interface AudioPlayerProps {
  audio: MeditationAudio
  onEnded: () => void
  autoPlay: boolean
}

export default function AudioPlayer({ audio, onEnded, autoPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', onEnded)
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', onEnded)
      }
    }
  }, [onEnded])

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