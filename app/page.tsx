'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function Component() {
  const [input, setInput] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState('idle')
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds

  const voiceoverRef = useRef<HTMLAudioElement>(null)
  const backgroundMusicRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = 0.3 // Set background music volume to 30%
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            handlePause()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setStage('Generating guidance')

  try {
    const textResponse = await fetch('/api/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    })
    const textData = await textResponse.json()

    setStage('Preparing audio')

    const speechResponse = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textData.text }),
    })

    if (!speechResponse.ok) {
      throw new Error('Failed to generate speech')
    }

    const audioBlob = await speechResponse.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    setAudioUrl(audioUrl)

    setStage('Ready to start')
  } catch (error) {
    console.error('Error:', error)
    setStage('Error occurred')
  } finally {
    setIsLoading(false)
  }
}

  const handlePlay = () => {
    if (voiceoverRef.current && backgroundMusicRef.current) {
      voiceoverRef.current.playbackRate = 0.85 // Slowed down as per previous update
      voiceoverRef.current.play()
      backgroundMusicRef.current.play()
      setIsPlaying(true)
      setTimeRemaining(120) // Reset timer to 2 minutes
    }
  }

  const handlePause = () => {
    if (voiceoverRef.current && backgroundMusicRef.current) {
      voiceoverRef.current.pause()
      backgroundMusicRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Focus Session</CardTitle>
          <CardDescription>Describe what you&apos;re preparing for</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Textarea
                  id="prompt"
                  placeholder="Describe the event, goal, or challenge you&apos;re preparing for..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? 'Preparing...' : 'Generate Visualization'}
          </Button>
          {stage !== 'idle' && <p className="mt-2 text-sm text-gray-500">{stage}</p>}
          {audioUrl && (
            <div className="mt-4 w-full space-y-4">
              <audio ref={voiceoverRef} src={audioUrl} />
              <audio ref={backgroundMusicRef} src="/background.mp3" loop />
              <Button onClick={isPlaying ? handlePause : handlePlay} className="w-full">
                {isPlaying ? 'Pause' : 'Start Session'}
              </Button>
              <div className="text-center font-bold">{formatTime(timeRemaining)}</div>
              <Progress value={(120 - timeRemaining) / 1.2} className="w-full" />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}