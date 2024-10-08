import { useState } from 'react'
import Head from 'next/head'
import MeditationForm from '../components/MeditationForm'
import MeditationPlayer from '../components/MeditationPlayer'
import { MeditationAudio } from '../lib/types'

export default function Home() {
  const [meditationAudios, setMeditationAudios] = useState<MeditationAudio[]>([])

  const handleMeditationGenerated = (audios: MeditationAudio[]) => {
    setMeditationAudios(audios)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>5-Minute Guided Meditation Generator</title>
        <link rel="preload" href="/background.mp3" as="audio" />
      </Head>
      <h1 className="text-3xl font-bold mb-6">5-Minute Guided Meditation Generator</h1>
      <MeditationForm onMeditationGenerated={handleMeditationGenerated} />
      {meditationAudios.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Personalized Meditation</h2>
          <MeditationPlayer audioFiles={meditationAudios} />
        </div>
      )}
    </div>
  )
}